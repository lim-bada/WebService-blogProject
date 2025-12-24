import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { images } from "../../assets/images";

export default function SearchArea() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [title, setTitle] = useState(params.get("title") ?? "");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = title.trim();
    navigate(q ? `/?title=${encodeURIComponent(q)}` : "/");
  };

  return (
    <section className="search-area">
      <article className="search-area__search">
        <h2 className="search-area__title">Blog Project</h2>
        <p className="search-area__description">
          A Blog About Food, Experience, and Recipes.
        </p>

        <form className="search-area__form" onSubmit={onSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Search"
            className="search-area__input"
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit" className="search-area__submit">
            <img
              src={images.search}
              alt="search-icon"
              className="search-area__icon"
            />
          </button>
        </form>
      </article>
    </section>
  );
}
