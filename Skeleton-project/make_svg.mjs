import fs from "fs";

// --- 설정 및 색상 (SVG용 HEX) ---
const MAGENTA = "#FF69B4";
const KB_MAIN = "#FFD400";
const KB_DEEP = "#FFB400";
const RESET = "#CCCCCC";
const PETALS = ["🌸", "*", "`"];

const LOGO = [
  "      __ __ ____     ____  ____  ____  _______________    __  _______ ",
  "     / //_// __ )   / __ )/ __ \\/ __ \\/_  __/ ____/   |  /  |/  / __ \\",
  "    / ,<  / __  |  / __  / / / / / / / / / / /   / /| | / /|_/ / /_/ /",
  "   / /| |/ /_/ /  / /_/ / /_/ / /_/ / / / / /___/ ___ |/ /  / / ____/ ",
  "  /_/ |_/_____/  /_____/\\____/\\____/ /_/  \\____/_/  |_/_/  /_/_/      ",
];

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
        const val = x + i * 5;
        let color = KB_MAIN;
        let content = char === " " ? " " : char;

        if (val >= threshold && val <= threshold + 25) {
          if (Math.random() < 0.35) {
            color = MAGENTA;
            content = PETALS[Math.floor(Math.random() * PETALS.length)];
          }
        }
        // SVG 특수문자 이스케이프
        const safeContent = content
          .replace(/\\/g, "&#92;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
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
        rect { fill: #0d1117; }
        ${css}
    </style>
    <rect width="100%" height="100%" rx="10" />
    ${frames.join("")}
</svg>`;

  fs.writeFileSync("animation.svg", svg);
  console.log("animation.svg 생성 완료!");
}

generateSVG();
