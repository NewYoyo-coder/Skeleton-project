import fs from "fs";

const MAGENTA = "#FF00FF";
const KB_MAIN = "#FFD400";
const KB_DEEP = "#FFB400";
const PETALS = ["🌸", "*", "`"];

// 로고 원복 (백슬래시 그대로 사용)
const LOGO = [
  "      __ __ ____     ____  ____  ____  _______________    __  _______ ",
  "     / //_// __ )   / __ )/ __ \\/ __ \\/_  __/ ____/   |  /  |/  / __ \\",
  "    / ,<  / __  |  / __  / / / / / / / / / / /   / /| | / /|_/ / /_/ /",
  "   / /| |/ /_/ /  / /_/ / /_/ / /_/ / / / / /___/ ___ |/ /  / / ____/ ",
  "  /_/ |_/_____/  /_____/\\____/\\____/ /_/  \\____/_/  |_/_/  /_/_/      ",
];

// 깃허브 보안 필터에 가장 안전한 이스케이프
const escapeSVG = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function generateSVG() {
  const viewBoxWidth = 850;
  const viewBoxHeight = 200;
  const frames = [];
  const frameCount = 20;

  for (let f = 0; f < frameCount; f++) {
    let frameContent = `<g class="frame">`; // ID 제거 (중복 ID 오류 방지)
    const threshold = LOGO[0].length + 30 - f * 6;

    LOGO.forEach((line, i) => {
      [...line].forEach((char, x) => {
        if (char === " ") return;

        const val = x + i * 5;
        let color = x % 15 < 5 ? KB_DEEP : KB_MAIN;
        let content = char;

        if (val >= threshold && val <= threshold + 25) {
          if (Math.random() < 0.35) {
            color = MAGENTA;
            content = PETALS[Math.floor(Math.random() * PETALS.length)];
          }
        }

        const safeContent = escapeSVG(content);
        // 백슬래시는 직접 출력하되 폰트로 제어
        frameContent += `<text x="${x * 9.2 + 20}" y="${i * 22 + 40}" fill="${color}">${safeContent}</text>`;
      });
    });
    frameContent += `</g>`;
    frames.push(frameContent);
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" width="100%">
    <style>
        /* 원화기호 방지 + 고정폭 유지 끝판왕 폰트 설정 */
        text {
            font-family: "Courier New", Courier, "Lucida Sans Typewriter", "Lucida Console", monospace;
            font-size: 16px;
            font-weight: bold;
        }
        @keyframes play {
            0%, 100% { opacity: 0; }
            ${100 / frameCount}% { opacity: 1; }
        }
        .frame { opacity: 0; animation: play ${frameCount * 0.15}s infinite; }
        ${frames.map((_, i) => `.frame:nth-child(${i + 1}) { animation-delay: ${i * 0.15}s; }`).join("\n")}
    </style>
    ${frames.join("")}
</svg>`;

  fs.writeFileSync("animation.svg", svg);
  console.log("오류 해결 버전 생성 완료!");
}

generateSVG();
