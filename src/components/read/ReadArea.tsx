export type ReadPost = {
  tag: string;
  title: string;
  meta: string;
  image: string;
  paragraphs: string[];
  showDelete?: boolean;
};

type Props = {
  post: ReadPost;
  onDelete?: () => void;
};

export default function ReadArea({ post, onDelete }: Props) {
  return (
    <article className="page__read">
      <section>
        <strong className="page__read-tag">{post.tag}</strong>
        <h2 className="page__read-title">{post.title}</h2>

        <div className="page__read-meta-group">
          <p className="page__read-profile">{post.meta}</p>

          {post.showDelete && (
            <button type="button" className="page__read-btn" onClick={onDelete}>
              삭제
            </button>
          )}
        </div>

        <img src={post.image} alt="" className="page__read-image" />
      </section>

      <section className="page__read-desc">
        {post.paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </section>
    </article>
  );
}
