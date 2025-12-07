// server.js
const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
const { MongoClient } = require("mongodb");

const app = express();
// 포트도 나중에 필요하면 환경변수로 바꿀 수 있게
const PORT = process.env.PORT || 3000;

// 1) 정적 파일 (public 폴더) 제공
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// 2) MySQL 연결 풀 생성 (로컬 + Docker/K8s 둘 다 대응)
const pool = mysql.createPool({
  host: process.env.DB_HOST_MYSQL || "localhost",
  port: process.env.DB_PORT_MYSQL || 3306,
  user: process.env.DB_USER_MYSQL || "root",         // 기본값: 지금 쓰는 계정
  password: process.env.DB_PASS_MYSQL || "qwer1234", // 기본값: 지금 비밀번호
  database: process.env.DB_NAME_MYSQL || "portfolio",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 3) MongoDB 설정 (로컬 + Docker/K8s 둘 다 대응)
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017";
const MONGO_DB_NAME =
  process.env.MONGO_DB_NAME || "portfolio";

const mongoClient = new MongoClient(MONGO_URI);
let mongoDb = null;

// ====== 라우트들 ======

// (0) 헬스 체크 (Docker에서 상태 확인용, 선택이지만 있으면 좋음)
// app.get("/health", async (req, res) => {
//   try {
//     const [rows] = await pool.query("SELECT 1 AS ok");
//     res.json({ status: "ok", mysql: rows[0].ok ?? null });
//   } catch (err) {
//     console.error("헬스체크 오류:", err);
//     res.status(500).json({ status: "error", message: err.message });
//   }
// });

// (1) MySQL에서 학번으로 프로필 하나 가져오기
app.get("/api/profile", async (req, res) => {
  try {
    const studentId = req.query.studentId;
    console.log("MySQL 검색 studentId:", studentId);

    if (!studentId) {
      return res
        .status(400)
        .json({ message: "studentId 쿼리 파라미터가 필요합니다." });
    }

    const [rows] = await pool.query(
      "SELECT name, student_id, department FROM profiles WHERE student_id = ? LIMIT 1",
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "해당 학번으로 MySQL에서 찾은 데이터가 없습니다.",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("MySQL 조회 오류:", err);
    res.status(500).json({
      message: "서버 오류(MySQL 조회 실패)",
      code: err.code,
      sqlMessage: err.sqlMessage,
    });
  }
});



// (2) MongoDB에서 학번으로 프로필 하나 가져오기 (쿼리스트링 studentId 사용)
app.get("/api/profile/mongo", async (req, res) => {
  try {
    const studentId = req.query.studentId;   
    console.log("MongoDB 검색 studentId:", studentId);

    if (!studentId) {
      return res
        .status(400)
        .json({ message: "studentId 쿼리 파라미터가 필요합니다." });
    }

    const collection = mongoDb.collection("profiles");

    // 문서에 { studentId: "2100995" } 이런 형태로 들어있다고 가정
    const doc = await collection.findOne({ studentId: studentId });

    if (!doc) {
      return res.status(404).json({
        message: "해당 학번으로 MongoDB에서 찾은 데이터가 없습니다.",
      });
    }

    res.json(doc);
  } catch (err) {
    console.error("MongoDB 조회 오류:", err);
    res
      .status(500)
      .json({ message: "MongoDB 조회 중 오류 발생" });
  }
});



// ====== 서버 시작 부분  ======
async function startServer() {
  try {
    // MySQL 연결 확인
    const conn = await pool.getConnection();
    console.log("✅ MySQL 연결 확인 완료");
    conn.release();

    // MongoDB 연결
    await mongoClient.connect();
    mongoDb = mongoClient.db(MONGO_DB_NAME);
    console.log("✅ MongoDB 연결 완료:", MONGO_URI, "/", MONGO_DB_NAME);

    // 서버 리슨
    app.listen(PORT, () => {
      console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("서버 시작 오류:", err);
    process.exit(1);
  }
}

startServer();



