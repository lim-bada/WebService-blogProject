import PostItem from "./PostItem";

type Props = { posts: Post[] };

export default function PostArea({ posts }: Props) {
  return (
    <section className="posts-area">
      {posts.map((p) => (
        <PostItem key={p.id} post={p} />
      ))}
    </section>
  );
}
