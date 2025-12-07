document.addEventListener("DOMContentLoaded", function () {
  // =====================
  // 1. DOM 예제 (상세 정보 숨기기/보이기)
  // =====================
  const profileBox = document.querySelector(".profile");
  const detailBox = document.querySelector(".detail");

  if (profileBox && detailBox) {
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "상세 정보 숨기기";
    toggleBtn.id = "detail-toggle-btn";
    toggleBtn.style.marginTop = "10px";
    toggleBtn.style.padding = "4px 8px";
    toggleBtn.style.fontSize = "12px";
    toggleBtn.style.cursor = "pointer";

    profileBox.insertAdjacentElement("afterend", toggleBtn);

    let isVisible = true;
    toggleBtn.addEventListener("click", function () {
      isVisible = !isVisible;
      detailBox.style.display = isVisible ? "block" : "none";
      toggleBtn.textContent = isVisible
        ? "상세 정보 숨기기"
        : "상세 정보 보이기";
    });
  }

  // =====================
  // 2. BOM 예제 (왼쪽 아래 창 크기 표시)
  // =====================
  const infoBox = document.createElement("div");
  infoBox.style.position = "fixed";
  infoBox.style.left = "10px";
  infoBox.style.bottom = "10px";
  infoBox.style.padding = "4px 8px";
  infoBox.style.fontSize = "12px";
  infoBox.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
  infoBox.style.color = "#fff";
  infoBox.style.borderRadius = "4px";
  infoBox.style.zIndex = "9999";

  document.body.appendChild(infoBox);

  function updateInfo() {
    const size = window.innerWidth + " x " + window.innerHeight;
    infoBox.textContent = " 창 크기: " + size;
  }

  updateInfo();
  window.addEventListener("resize", updateInfo);

  // =====================
  // 3. 학번으로 프로필 검색 (MySQL + MongoDB) (BOM예제)
  // =====================
  const studentIdInput = document.getElementById("student-id-input");
  const searchBtn = document.getElementById("student-id-search-btn");

  if (studentIdInput && searchBtn && detailBox) {
    searchBtn.addEventListener("click", () => {
      const studentId = studentIdInput.value.trim();
      if (!studentId) {
        alert("학번을 입력하세요.");
        return;
      }
      loadProfilesByStudentId(detailBox, studentId);
    });
  } else {
    console.warn("학번 입력창 또는 detail 박스를 찾을 수 없습니다.");
  }
});

// ------ 여기서부터 함수 정의 ------

async function loadProfilesByStudentId(detailBox, studentId) {
  try {
    detailBox.innerHTML = `<p>"${studentId}" 학번의 프로필을 불러오는 중입니다...</p>`;

    let mysqlData = null;
    let mongoData = null;

    const query = "?studentId=" + encodeURIComponent(studentId);

    // MySQL 요청
    try {
      const res = await fetch("/api/profile" + query);
      if (res.ok) {
        mysqlData = await res.json();
      } else if (res.status === 404) {
        console.log("MySQL: 해당 학번 데이터 없음");
      } else {
        console.warn("MySQL 응답 코드:", res.status);
      }
    } catch (e) {
      console.error("MySQL fetch 오류:", e);
    }

    // MongoDB 요청
    try {
      const res = await fetch("/api/profile/mongo" + query);
      if (res.ok) {
        mongoData = await res.json();
      } else if (res.status === 404) {
        console.log("MongoDB: 해당 학번 데이터 없음");
      } else {
        console.warn("MongoDB 응답 코드:", res.status);
      }
    } catch (e) {
      console.error("MongoDB fetch 오류:", e);
    }

    let html = "";

    if (mysqlData && !mysqlData.message) {
      html += `
        <h3>MySQL 프로필</h3>
        <p>이름: ${mysqlData.name ?? ""}</p>
        <p>학번: ${mysqlData.student_id ?? ""}</p>
        <p>학과: ${mysqlData.department ?? ""}</p>
        <hr/>
      `;
    }

    if (mongoData && !mongoData.message) {
      html += `
        <h3>MongoDB 프로필</h3>
        <p>이름: ${mongoData.name ?? ""}</p>
        <p>학번: ${mongoData.studentId ?? ""}</p>
        <p>학과: ${mongoData.department ?? ""}</p>
      `;
    }

    if (!html) {
      html = `<p>"${studentId}" 학번으로 찾은 프로필 데이터가 없습니다.</p>`;
    }

    detailBox.innerHTML = html;
  } catch (err) {
    console.error("프로필 불러오기 오류:", err);
    detailBox.innerHTML =
      "<p>프로필 정보를 불러오는 중 오류가 발생했습니다.</p>";
  }
}
