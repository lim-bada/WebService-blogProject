// src/pages/Write.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { axiosInstance } from "../api/axiosInstance";
import { useAuthStore } from "../stores/useAuthStore";

type ApiErrorBody = { message?: string };

export default function Write() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [username, setUsername] = useState(user?.username ?? "");
  const [desc, setDesc] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const onChangeThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setThumbnail(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setThumbnail(typeof result === "string" ? result : null); // dataURL
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !category || !username || !desc) {
      alert("모든 항목을 입력해 주세요.");
      return;
    }

    if (!thumbnail) {
      alert("썸네일을 선택해 주세요.");
      return;
    }

    try {
      await axiosInstance.post("/posts", {
        title,
        category,
        username,
        desc,
        thumbnail,
      });

      alert("글이 등록되었습니다.");
      navigate("/");
    } catch (e: unknown) {
      const err = e as AxiosError<ApiErrorBody>;
      alert(err.response?.data?.message ?? err.message ?? "글 등록 실패");
    }
  };

  return (
    <div className="page__write">
      <h2 className="page__write-text">새로운 글 작성</h2>

      <form onSubmit={onSubmit}>
        <div className="page__write-form">
          <div className="page__write-group">
            <label htmlFor="title" className="page__write-label">
              제목
            </label>
            <input
              type="text"
              id="title"
              className="page__write-input"
              placeholder="Type product name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="page__write-label">
              카테고리
            </label>
            <select
              id="category"
              className="page__write-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Life">Life</option>
            </select>
          </div>

          <div>
            <label htmlFor="writer" className="page__write-label">
              작성자
            </label>
            <input
              type="text"
              id="writer"
              className="page__write-input"
              placeholder="Writer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="page__write-group">
            <div>
              <label htmlFor="user_avatar" className="page__write-label">
                썸네일
              </label>

              <label className="page__write-file--hidden" htmlFor="user_avatar">
                Upload file
              </label>

              <input
                className="page__write-file"
                id="user_avatar"
                type="file"
                accept="image/*"
                onChange={onChangeThumbnail}
                required
              />
            </div>
          </div>

          <div className="page__write-group">
            <label htmlFor="description" className="page__write-label">
              내용
            </label>
            <textarea
              id="description"
              className="page__write-textarea"
              placeholder="Your description here"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="page--btn">
          글등록
        </button>
      </form>
    </div>
  );
}
