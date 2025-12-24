import { useSearchParams } from "react-router-dom";
import SearchArea from "../components/home/SearchArea";
import PostArea from "../components/home/PostArea";
import { useAxios } from "../hooks/useAxios";

export default function Home() {
  const [params] = useSearchParams();
  const title = params.get("title") ?? "";

  const url = title
    ? `/posts/search?title=${encodeURIComponent(title)}`
    : `/posts/search`;

  const { data: posts, error, isLoading } = useAxios<Post[]>(url, []);

  return (
    <>
      <SearchArea />
      {isLoading && <p style={{ padding: 16 }}>Loading...</p>}
      {!isLoading && error && <p style={{ padding: 16 }}>{error}</p>}
      {!isLoading && !error && <PostArea posts={posts} />}
    </>
  );
}
