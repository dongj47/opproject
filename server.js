// server.js
const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

// 1) 정적 파일 (public 폴더) 제공
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// 2) MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: "localhost",
  user: "root",          // 네 MySQL 계정
  password: "qwer1234",  // 네가 실제로 쓰는 비밀번호
  database: "portfolio",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 3) MongoDB 설정
const MONGO_URI = "mongodb://localhost:27017";
const mongoClient = new MongoClient(MONGO_URI);
let mongoDb = null;

// ====== 라우트들 ======

// (1) MySQL에서 프로필 가져오기
app.get("/api/profile", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT name, student_id, department FROM profiles WHERE id = ?",
      [1]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "데이터가 없습니다." });
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

// (2) MongoDB에서 프로필 하나 가져오기
app.get("/api/profile/mongo", async (req, res) => {
  try {
    const collection = mongoDb.collection("profiles");
    const doc = await collection.findOne({ studentId: "2100995" });

    if (!doc) {
      return res
        .status(404)
        .json({ message: "MongoDB에 데이터가 없습니다." });
    }

    res.json(doc);
  } catch (err) {
    console.error("MongoDB 조회 오류:", err);
    res
      .status(500)
      .json({ message: "MongoDB 조회 중 오류 발생" });
  }
});

// ====== 서버 시작 부분 (여기에 Mongo 연결 붙임) ======
async function startServer() {
  try {
    // MySQL 연결 확인
    await pool.getConnection();
    console.log("✅ MySQL 연결 확인 완료");

    // MongoDB 연결
    await mongoClient.connect();
    mongoDb = mongoClient.db("portfolio");
    console.log("✅ MongoDB 연결 완료");

    // 서버 리슨
    app.listen(PORT, () => {
      console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("서버 시작 오류:", err);
  }
}

startServer();


