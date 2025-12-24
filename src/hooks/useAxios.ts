import { useEffect, useState } from "react";
import axios, { type AxiosError } from "axios";
import { axiosInstance } from "../api/axiosInstance";

type ApiErrorBody = { message?: string };

export function useAxios<T>(url: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!url) return; // url이 비어있으면 요청 안 함

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const res = await axiosInstance.get<T>(url, { signal });
        setData(res.data);
      } catch (e: unknown) {
        // 요청 취소는 에러로 처리하지 않음
        if (axios.isCancel(e)) return;

        const err = e as AxiosError<ApiErrorBody>;
        setError(err.response?.data?.message ?? err.message ?? "알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [url]);

  return { data, error, isLoading, setData };
}
