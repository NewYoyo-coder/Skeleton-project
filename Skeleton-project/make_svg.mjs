import fs from "fs";

// --- 설정 및 색상 (SVG용 HEX, 윈도우 그림자 지운 기념으로 시인성 강화) ---
const MAGENTA = "#FF00FF"; // 더 쨍한 마젠타 (투명 배경에서 잘 보이게)
const KB_MAIN = "#FFD400"; // 정품 노랑
const KB_DEEP = "#FFB400"; // 진한 노랑
const PETALS = ["🌸", "*", "`"];

const LOGO = [
  "      __ __ ____     ____  ____  ____  _______________    __  _______ ",
  "     / //_// __ )   / __ )/ __ \\/ __ \\/_  __/ ____/   |  /  |/  / __ \\",
  "    / ,<  / __  |  / __  / / / / / / / / / / /   / /| | / /|_/ / /_/ /",
  "   / /| |/ /_/ /  / /_/ / /_/ / /_/ / / / / /___/ ___ |/ /  / / ____/ ",
  "  /_/ |_/_____/  /_____/\\____/\\____/ /_/  \\____/_/  |_/_/  /_/_/      ",
];

// 이스케이프 유틸리티 (SVG 내부 특수문자 깨짐 방지)
const escapeSVG = (str) =>
  str.replace(/\\/g, "&#92;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function generateSVG() {
  const width = 800;
  const height = 200;
  const frames = [];
  const frameCount = 20; // 애니메이션 단계

  for (let f = 0; f < frameCount; f++) {
    let frameContent = `<g class="frame" id="frame-${f}">`;
    const threshold = LOGO[0].length + 30 - f * 6;

    LOGO.forEach((line, i) => {
      let rowText = "";
      [...line].forEach((char, x) => {
        if (char === " ") return; // 공백은 렌더링 안 함

        const val = x + i * 5;
        let color = KB_MAIN;
        let content = char;

        // 그라데이션 대신 KB 정품 노랑 팔레트 적용 (진한 노랑 -> 메인 노랑 -> 메인 노랑)
        const phase = x % 15;
        color = phase < 5 ? KB_DEEP : KB_MAIN;

        if (val >= threshold && val <= threshold + 25) {
          if (Math.random() < 0.35) {
            color = MAGENTA;
            content = PETALS[Math.floor(Math.random() * PETALS.length)];
          }
        }
        const safeContent = escapeSVG(content);
        frameContent += `<text x="${x * 9 + 20}" y="${i * 20 + 40}" fill="${color}" font-family="monospace" font-size="14">${safeContent}</text>`;
      });
    });
    frameContent += `</g>`;
    frames.push(frameContent);
  }

  const css = `
        @keyframes play {
            0%, 100% { opacity: 0; }
            ${100 / frameCount}% { opacity: 1; }
        }
        .frame { opacity: 0; animation: play ${frameCount * 0.1}s infinite; }
        ${frames.map((_, i) => `.frame:nth-child(${i + 1}) { animation-delay: ${i * 0.1}s; }`).join("\n")}
    `;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <style>
        ${css}
    </style>
    ${frames.join("")}
</svg>`;

  fs.writeFileSync("animation.svg", svg);
  console.log("배경 투명 animation.svg 생성 완료!");
}

generateSVG();
