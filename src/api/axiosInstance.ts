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

const BASE_URL = "http://localhost:3000";

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
// (백엔드 authenticateToken이 만료 시 403을 주는 경우가 많아서 둘 다 처리)
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

    // accessToken 만료/무효: 401 또는 403
    if ((status === 401 || status === 403) && !original._retry) {
      original._retry = true;

      // 이미 refresh 진행 중이면 큐에 대기
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
        // ✅ refreshToken 쿠키로 accessToken 재발급
        const { data } = await refreshInstance.post<TokenResponse>("/token");

        // store 갱신
        useAuthStore.getState().setAuth(data.user, data.accessToken);

        // 대기중 요청들 재시도
        processQueue(data.accessToken);

        // 원래 요청도 재시도
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(original);
      } catch (e) {
        // refresh 실패 → 로그아웃 처리
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
