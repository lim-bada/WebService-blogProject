// src/types/post.d.ts
interface Post {
  id: number;
  title: string;
  category: string;
  author: string;            // email
  username: string;          // 표시용 이름
  thumbnail: string | null;  // base64 또는 null
  desc: string;
  regdate: string;           // ISO string
}
