import { Link } from "react-router-dom";
import { images } from "../../assets/images";

type Props = { post: Post };

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

export default function PostItem({ post }: Props) {
  const imgSrc = post.thumbnail ?? images.dummy1;

  return (
    <article className="posts-area__post">
      <Link to={`/read/${post.id}`} className="posts-area__post-link">
        <img src={imgSrc} alt={post.title} className="posts-area__post-image" />
        <em className="posts-area__post-tag">{post.category}</em>
        <h2 className="posts-area__post-title">{post.title}</h2>
        <p className="posts-area__post-meta">
          {post.username} • {formatDate(post.regdate)}
        </p>
        <p className="posts-area__post-excerpt">{post.desc}</p>
      </Link>
    </article>
  );
}
