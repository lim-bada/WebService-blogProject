import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { AxiosError } from "axios";

import { useAxios } from "../hooks/useAxios";
import { axiosInstance } from "../api/axiosInstance";
import { images } from "../assets/images";
import { useAuthStore } from "../stores/useAuthStore";

import ReadArea, { type ReadPost } from "../components/read/ReadArea";
import RecommendationItem, {
  type Recommendation,
} from "../components/read/RecommendationItem";

type ApiErrorBody = { message?: string };

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

export default function Read() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // ✅ Hook는 조건 없이 항상 호출되게 URL을 조건부로 만들기
  const postUrl = id ? `/posts/${id}` : "";
  const relatedUrl = id ? `/posts/${id}/related` : "";

  const {
    data: post,
    error: postError,
    isLoading: postLoading,
  } = useAxios<Post | null>(postUrl, null);

  const {
    data: related,
    error: relatedError,
    isLoading: relatedLoading,
  } = useAxios<Post[]>(relatedUrl, []);

  const canDelete = useMemo(() => {
    if (!post) return false;
    return !!user?.email && user.email === post.author; // author는 email
  }, [user?.email, post]);

  const onDelete = async () => {
    if (!id) return;
    if (!confirm("정말 삭제할까요?")) return;

    try {
      await axiosInstance.delete(`/posts/${id}`);
      alert("삭제되었습니다.");
      navigate("/");
    } catch (e: unknown) {
      const err = e as AxiosError<ApiErrorBody>;
      alert(err.response?.data?.message ?? err.message ?? "삭제 실패");
    }
  };

  // ✅ Hook 호출 뒤에 가드 return (이제 rules-of-hooks 위반 아님)
  if (!id) return <p style={{ padding: 16 }}>잘못된 접근입니다.</p>;

  if (postLoading) return <p style={{ padding: 16 }}>Loading...</p>;
  if (postError) return <p style={{ padding: 16 }}>{postError}</p>;
  if (!post) return <p style={{ padding: 16 }}>게시글이 없습니다.</p>;

  const paragraphs = post.desc.includes("\n")
    ? post.desc.split(/\n\s*\n/).filter(Boolean)
    : [post.desc];

  const readPost: ReadPost = {
    tag: post.category,
    title: post.title,
    meta: `${post.username} • ${formatDate(post.regdate)}`,
    image: post.thumbnail ?? images.dummy1,
    paragraphs,
    showDelete: canDelete,
  };

  const recs: Recommendation[] = related.map((p) => ({
    id: p.id,
    image: p.thumbnail ?? images.dummy1,
    title: p.title,
    desc: p.desc,
  }));

  return (
    <>
      <ReadArea post={readPost} onDelete={onDelete} />

      <article className="page__recommend">
        <h3 className="page__recommend-title">Recommend Reading</h3>

        {relatedLoading && <p style={{ padding: 16 }}>Loading...</p>}
        {!relatedLoading && relatedError && (
          <p style={{ padding: 16 }}>{relatedError}</p>
        )}

        {!relatedLoading && !relatedError && (
          <ul className="page__recommend-lists">
            {recs.map((r) => (
              <RecommendationItem key={r.id} item={r} />
            ))}
          </ul>
        )}
      </article>
    </>
  );
}
