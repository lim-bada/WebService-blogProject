// src/components/Header.tsx
import { NavLink, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { axiosInstance } from "../api/axiosInstance";
import { useAuthStore } from "../stores/useAuthStore";

export default function Header() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const unsetAuth = useAuthStore((s) => s.unsetAuth);

  const handleLogout = async () => {
    try {
      const res = await axiosInstance.post("/logout");
      if (res.status === 200) {
        unsetAuth();
        navigate("/");
        return;
      }
      throw new Error("로그아웃에 실패했습니다.");
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>;
      alert(err.response?.data?.message ?? err.message ?? "로그아웃 실패");
    }
  };

  return (
    <header className="page__header">
      <h1 className="page__logo">
        <NavLink to="/" end className="page__logo-link">
          JBNU
        </NavLink>
      </h1>

      <nav className="page__navigation">
        <ul className="page__nav-list">
          <li className="page__nav-item">
            <NavLink to="/write" className="page__nav-link">
              글쓰기
            </NavLink>
          </li>

          <li className="page__nav-item">
            {user ? (
              <button
                type="button"
                className="page__nav-link"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            ) : (
              <NavLink to="/auth" className="page__nav-link">
                인증
              </NavLink>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
