// api.js
// 필요한 라이브러리 불러오기
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const router = express.Router();

const app = express();

// ✅ 프록시(배포) 환경에서 쿠키/https 인식 안정화 (Render 등)
app.set("trust proxy", 1);

// ✅ 배포/로컬 분기
const isProd = process.env.NODE_ENV === "production";

// ✅ CORS (배포 시 Netlify 주소로 환경변수 주면 됨)
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  // 예: CLIENT_ORIGIN=https://xxxx.netlify.app
  credentials: true,
};

app.use(cors(corsOptions));

// JSON 형식의 요청 본문 파싱
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(express.urlencoded({ limit: "50mb", extended: false }));

// 쿠키 파싱
app.use(cookieParser());

const TOEKN_EXPIRE = "15m"; // 토큰 만료 시간 (15분)

// Secret keys
const ACCESS_TOKEN_SECRET = "i_love_sucoding";
const REFRESH_TOKEN_SECRET = "i_like_sucoding";

// ✅ refreshToken 쿠키 옵션 (로컬/배포 분기)
const cookieOptions = {
  httpOnly: true,
  secure: isProd, // ✅ 배포(https)=true, 로컬(http)=false
  sameSite: isProd ? "None" : "Lax",
};

// Mock database
const users = []; // { id, email, username, password, refreshToken }

// Middleware: 액세스 토큰 검증
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "액세스 토큰이 필요합니다." });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ message: "유효하지 않거나 만료된 토큰입니다." });
    req.user = user;
    next();
  });
}

router.get("/", (req, res) => {
  res.send("블로그 프로젝트 백엔드 API 서버");
});

// 로그인
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "인증 정보를 다시 확인해주세요." });
  }

  const accessToken = jwt.sign(
    { email: user.email, username: user.username, id: user.id },
    ACCESS_TOKEN_SECRET,
    { expiresIn: TOEKN_EXPIRE }
  );

  const refreshToken = jwt.sign(
    { email: user.email, username: user.username, id: user.id },
    REFRESH_TOKEN_SECRET
  );

  user.refreshToken = refreshToken;

  // ✅ refreshToken 쿠키 저장
  res.cookie("refreshToken", refreshToken, cookieOptions);

  res.json({
    user: { username: user.username, email: user.email },
    accessToken,
  });
});

// 로그아웃
router.post("/logout", (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) return res.status(204).send();

  const user = users.find((u) => u.refreshToken === refreshToken);
  if (user) user.refreshToken = null;

  // ✅ cookieOptions를 동일하게 줘야 삭제가 확실함
  res.clearCookie("refreshToken", cookieOptions);
  res.status(200).json("로그아웃이 정상적으로 처리되었습니다.");
});

// 토큰 재발급
router.post("/token", (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken)
    return res.status(401).json({ message: "리프레시 토큰이 필요합니다." });

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ message: "유효하지 않거나 만료된 토큰입니다." });

    const storedUser = users.find((u) => u.refreshToken === refreshToken);
    if (!storedUser)
      return res
        .status(403)
        .json({ message: "리프레시 토큰이 유효하지 않습니다." });

    const accessToken = jwt.sign(
      { email: user.email, username: user.username, id: user.id },
      ACCESS_TOKEN_SECRET,
      { expiresIn: TOEKN_EXPIRE }
    );

    res.status(200).json({
      user: { username: user.username, email: user.email },
      accessToken,
    });
  });
});

// 보호 라우트: 사용자 정보
router.get("/user", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user)
    return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

  res.status(200).json({ id: user.id, email: user.email, username: user.username });
});

// 회원가입
router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    email,
    username,
    password: hashedPassword,
    refreshToken: null,
  };

  users.push(newUser);
  res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

// ----------------------
// Blog Posts (Mock DB)
// ----------------------
const blogPosts = []; // { id, title, category, author, thumbnail, desc, regdate, username }

// 목록
router.get("/posts", (req, res) => {
  res.json(blogPosts);
});

// 등록 (인증 필요)
router.post("/posts", authenticateToken, (req, res) => {
  const { title, category, thumbnail, desc, username } = req.body;

  if (!title || !category || !desc) {
    return res.status(400).json({ message: "필수 파라미터가 누락되었습니다." });
  }

  const newPost = {
    id: Date.now(),
    title,
    category,
    username: username,
    author: req.user.email,
    thumbnail: thumbnail || null,
    desc,
    regdate: new Date().toISOString(),
  };

  blogPosts.push(newPost);
  res.status(201).json(newPost);
});

// 검색 (제목)
router.get("/posts/search", (req, res) => {
  const { title } = req.query;

  if (!title) return res.json(blogPosts);

  const filteredPosts = blogPosts.filter((post) =>
    post.title.toLowerCase().includes(String(title).toLowerCase())
  );

  res.json(filteredPosts);
});

// 삭제 (인증 필요, 작성자만)
router.delete("/posts/:id", authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = blogPosts.findIndex((post) => post.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  if (blogPosts[postIndex].author !== req.user.email) {
    return res
      .status(403)
      .json({ message: "게시글은 오직 작성자만 삭제 가능합니다." });
  }

  blogPosts.splice(postIndex, 1);
  res.status(204).send();
});

// 상세 조회
router.get("/posts/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const post = blogPosts.find((post) => post.id === postId);

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  res.json(post);
});

// 연관 게시물
router.get("/posts/:id/related", (req, res) => {
  const postId = parseInt(req.params.id);
  const post = blogPosts.find((post) => post.id === postId);

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  const relatedPosts = blogPosts.filter(
    (p) => p.category === post.category && p.id !== postId
  );

  res.json(relatedPosts);
});

// 서버 실행
app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
