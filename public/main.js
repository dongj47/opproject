document.addEventListener("DOMContentLoaded", function () {
  // =====================
  // 1. DOM 예제
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
  // 2. BOM 예제 (왼쪽 아래 + 실시간 크기 갱신)
  // =====================
  const infoBox = document.createElement("div");
  infoBox.style.position = "fixed";
  infoBox.style.left = "10px";     // 왼쪽 아래 배치
  infoBox.style.bottom = "10px";
  infoBox.style.padding = "4px 8px";
  infoBox.style.fontSize = "12px";
  infoBox.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
  infoBox.style.color = "#fff";
  infoBox.style.borderRadius = "4px";
  infoBox.style.zIndex = "9999";

  document.body.appendChild(infoBox);

  // 실시간으로 창 크기 표시
  function updateInfo() {

    const size = window.innerWidth + " x " + window.innerHeight;
    infoBox.textContent =  " 창 크기: " + size;
  }

  // 처음 표시 + 창 크기 바뀔 때마다 갱신
  updateInfo();
  window.addEventListener("resize", updateInfo);
});

