// src/api/axiosInstance.ts
import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../stores/useAuthStore";

type ApiErrorBody = { message?: string };
type TokenResponse = {
  user: { username: string; email: string };
  accessToken: string;
};

// ✅ 배포(PROD)에서는 nginx 프록시(/api) 사용
// ✅ 개발(DEV)에서는 로컬 백엔드(http://localhost:3000) 사용
const BASE_URL = import.meta.env.PROD ? "/api" : "http://localhost:3000";

// ✅ 일반 요청용
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // refreshToken 쿠키 보내려면 필수
});

// ✅ 토큰 재발급 전용(인터셉터 루프 방지)
const refreshInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// -------------------------
// 1) 요청 인터셉터: accessToken 붙이기
// -------------------------
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// -------------------------
// 2) 응답 인터셉터: 401/403이면 /token → 재시도
// -------------------------
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!original) throw error;

    const status = error.response?.status;

    // /token 자체가 실패하면 무한루프 방지
    const url = original.url ?? "";
    if (url.includes("/token")) throw error;

    if ((status === 401 || status === 403) && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token) => {
            if (!token) return reject(error);

            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(original));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await refreshInstance.post<TokenResponse>("/token");

        useAuthStore.getState().setAuth(data.user, data.accessToken);
        processQueue(data.accessToken);

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(original);
      } catch (e) {
        useAuthStore.getState().unsetAuth();
        processQueue(null);
        throw e;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  }
);
