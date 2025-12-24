const express = require("express");
const path = require("path");

const app = express();

// 1. 정적 파일 제공 (이미지, CSS, JS 등)
// build 폴더 내의 파일이 요청되면 즉시 반환하고 종료됩니다.
app.use(express.static(path.join(__dirname, "build")));

// 2. SPA (모든 경로에 대해 리액트 앱에서 처리)
// 리액트 빌드 파일인 index.html을 반환합니다.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// 리액트 앱 배포는 8080포트 사용
app.listen(8080, () => console.log("Running on port 8080..."));
