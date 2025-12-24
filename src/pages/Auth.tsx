// src/pages/Auth.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { axiosInstance } from "../api/axiosInstance";
import { useAuthStore } from "../stores/useAuthStore";
import type { User } from "../types/zustand";

type PageType = "login" | "register";

type ApiErrorBody = { message?: string };
type LoginResponse = { user: User; accessToken: string }; // user 타입까지 엄격히 하고 싶으면 아래 설명 참고

export default function Auth() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [pageType, setPageType] = useState<PageType>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");

  const handlePageChange = (type: PageType) => {
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setUsername("");
    setPageType(type);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!email || !password || !username) {
        alert("모든 항목을 입력해 주세요.");
        return;
      }
      if (password !== passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }

      await axiosInstance.post("/register", {
        email,
        password,
        username,
      });

      alert("회원가입을 완료했습니다.\n로그인 후 이용해 주세요.");
      // ✅ email은 유지, 나머지만 초기화
      setPassword("");
      setPasswordConfirm("");
      setUsername("");
      setPageType("login");
    } catch (e: unknown) {
      const err = e as AxiosError<ApiErrorBody>;
      alert(err.response?.data?.message ?? err.message ?? "회원가입 실패");
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post<LoginResponse>("/login", {
        email,
        password,
      });

      setAuth(data.user, data.accessToken);
      navigate("/");
    } catch (e: unknown) {
      const err = e as AxiosError<ApiErrorBody>;
      alert(err.response?.data?.message ?? err.message ?? "로그인 실패");
    }
  };

  const isLogin = pageType === "login";

  return (
    <article className="page-auth">
      <section className="page-auth__container">
        <nav className="page-auth__toggle">
          <button
            type="button"
            className={`page-auth__toggle-button ${
              isLogin ? "page-auth__toggle-button--active" : ""
            }`}
            onClick={() => handlePageChange("login")}
          >
            로그인
          </button>
          <button
            type="button"
            className={`page-auth__toggle-button ${
              !isLogin ? "page-auth__toggle-button--active" : ""
            }`}
            onClick={() => handlePageChange("register")}
          >
            회원가입
          </button>
        </nav>

        <div className="page-auth__form-section">
          {/* 로그인 */}
          <form
            className={`auth-form ${isLogin ? "auth-form--active" : ""}`}
            onSubmit={handleLogin}
          >
            <label htmlFor="login-email" className="a11y-hidden">
              이메일
            </label>
            <input
              type="email"
              id="login-email"
              className="auth-form__input"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="login-password" className="a11y-hidden">
              비밀번호
            </label>
            <input
              type="password"
              id="login-password"
              className="auth-form__input"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="auth-form__submit">
              로그인
            </button>
          </form>

          {/* 회원가입 */}
          <form
            className={`auth-form ${!isLogin ? "auth-form--active" : ""}`}
            onSubmit={handleSignup}
          >
            <label htmlFor="signup-email" className="a11y-hidden">
              이메일
            </label>
            <input
              type="email"
              id="signup-email"
              className="auth-form__input"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="signup-name" className="a11y-hidden">
              이름
            </label>
            <input
              type="text"
              id="signup-name"
              className="auth-form__input"
              placeholder="이름"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="signup-password" className="a11y-hidden">
              비밀번호
            </label>
            <input
              type="password"
              id="signup-password"
              className="auth-form__input"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label htmlFor="signup-confirm-password" className="a11y-hidden">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="signup-confirm-password"
              className="auth-form__input"
              placeholder="비밀번호 확인"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />

            <button type="submit" className="auth-form__submit">
              회원가입
            </button>
          </form>
        </div>
      </section>
    </article>
  );
}
