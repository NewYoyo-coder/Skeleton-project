import { spawn } from 'child_process';
import readline from 'readline';

// --- 설정 (색상 팔레트 확장 - 그라데이션 입체 효과용) ---
const MAGENTA = '\x1b[38;5;201m';
const GREEN = '\x1b[32m';
const GRAY = '\x1b[90m';
const RESET = '\x1b[0m';
const PETALS = ["🌸", "*", "´", "v", " ", "."];

// KB 정품 노랑 팔레트 (진한 노랑 -> 메인 노랑 -> 연한 하이라이트)
const KB_DEEP = '\x1b[38;2;255;180;0m';
const KB_MAIN = '\x1b[38;2;255;212;0m'; // #FFD400 (정품 노랑)
const KB_LIGHT = '\x1b[38;2;255;245;120m'; // 하이라이트 연한 노랑

// 그라데이션 최적화 로고 (백슬래시 교정 완료)
const LOGO = [
    "    __ __ ____     ____  ____  ____  _______________    __  _______ ",
    "   / //_// __ )   / __ )/ __ \\/ __ \\/_  __/ ____/   |  /  |/  / __ \\",
    "  / ,<  / __  |  / __  / / / / / / / / / / /   / /| | / /|_/ / /_/ /",
    " / /| |/ /_/ /  / /_/ / /_/ / /_/ / / / / /___/ ___ |/ /  / / ____/ ",
    "/_/ |_/_____/  /_____/\\____/\\____/ /_/  \\____/_/  |_/_/  /_/_/      "
];
const FOOTER = `
  ╷╭ ╭╮    ╭─╮╭─╮╭─╮ ╭╮╭─╴╭─╴╶┬╴   ╭╮ ╭─╮╶┬╴╭─╴╷ ╷   ╭─╮╭─╮   ╶┬╴╭─╴╭─╮╭┬╮   ╭─╮ 
  ├┴╮├┴╮   ├─╯├┬╯│ │  │├╴ │   │    ├┴╮├─┤ │ │  ├─┤   ╭─╯╰─┤    │ ├╴ ├─┤│││   ╭─╯ 
  ╵ ╵╰─╯╶─╴╵  ╵╰╴╰─╯╰─╯╰─╴╰─╴ ╵    ╰─╯╵ ╵ ╵ ╰─╴╵ ╵╶─╴╰─╴╰─╯    ╵ ╰─╴╵ ╵╵ ╵╶─╴╰─╴ 
`;

const clear = () => process.stdout.write('\x1Bc');
const setCursor = (x, y) => readline.cursorTo(process.stdout, x, y);

// 유틸리티: 좌표 기반 그라데이션 색상 계산 (채우기 효과 핵심)
const getGradientColor = (x, len) => {
    // x 좌표에 따라 진한 노랑(deep) -> 메인 노랑(main) -> 연한 노랑(light)을 3단계로 분배 (입체감 효과)
    // 15칸 주기로 색상이 부드럽게 반복
    const phase = x % 20;
    if (phase < 6) return KB_DEEP;
    else if (phase < 13) return KB_MAIN;
    else return KB_LIGHT;
};

async function run() {
    clear();
    process.stdout.write('\x1b[?25l'); // 커서 숨김
    const startY = 0;
    const maxLen = LOGO[0].length; // 로고 길이에 맞춰 자동 조절

    // 1. 역동적인 벚꽃 애니메이션 (더 휘리릭 휘날리도록 튜닝)
    // 감소 폭을 줄여(-8 -> -4) 더 세밀하게 스캔하고, 범위를 넓혔습니다.
    for (let threshold = maxLen + 30; threshold >= -50; threshold -= 4) {
        LOGO.forEach((line, i) => {
            setCursor(4, startY + i);
            let row = "";
            [...line].forEach((char, x) => {
                // y축(row)에 따른 가중치를 줘서 꽃잎이 대각선으로 흐르는 느낌 추가
                const val = x + (i * 5);

                // 꽃잎이 노출되는 범위를 넓혀서(-15 -> -25) 더 풍성하게 머물도록 함
                if (val >= threshold && val <= threshold + 25) {
                    // 확률을 조금 낮춰(-0.4 -> -0.35) 꽃잎 사이 간격을 둠 (더 자연스러움)
                    if (Math.random() < 0.35) {
                        row += `${MAGENTA}${PETALS[Math.floor(Math.random() * PETALS.length)]}${RESET}`;
                    } else {
                        // 꽃잎 사이로 보이는 로고도 그라데이션 유지
                        row += `${getGradientColor(x, maxLen)}${char}${RESET}`;
                    }
                } else {
                    row += `${getGradientColor(x, maxLen)}${char}${RESET}`;
                }
            });
            process.stdout.write(row + "  "); // 잔상 방지 여백
        });
        // 대기 시간을 늘려(-20 -> -45) 천천히 휘날리는 느낌 연출
        await new Promise(r => setTimeout(r, 45));
    }

    // 2. [핵심] 완벽 원복 & 그라데이션 채우기 똭!
    LOGO.forEach((line, i) => {
        setCursor(4, startY + i);
        process.stdout.write(" ".repeat(maxLen + 10)); // 잔상 제거
        setCursor(4, startY + i);

        let coloredLine = "";
        [...line].forEach((char, x) => {
            coloredLine += `${getGradientColor(x, maxLen)}${char}`;
        });
        process.stdout.write(coloredLine + RESET);
    });

    // --- 색상 설정 (배경색 추가) ---
    const BLACK = '\x1b[30m'; // 검정색 글자

    // KB 정품 배경색 (Background Colors)
    const BG_KB_MAIN = '\x1b[48;2;255;212;0m'; // #FFD400 배경
    const BG_KB_DEEP = '\x1b[48;2;255;180;0m'; // 진한 노랑 배경

    // [수정] 푸터 출력 부분 (run 함수 내)
    // ---------------------------------------------------------
    setCursor(0, startY + LOGO.length + 1);

    // 텍스트는 BLACK(30), 배경은 BG_KB_MAIN(48)
    // 양옆에 공백을 한 칸씩 더 넣어서 노란 박스가 글자를 예쁘게 감싸게 함
    const paddedFooter = `  ${FOOTER.trim()} `;
    process.stdout.write(`${BG_KB_MAIN}${BLACK}${paddedFooter}${RESET}\n`);
    // ---------------------------------------------------------

    // 상태창 설정
    const statusY = startY + LOGO.length + 5;
    const status = { core1: 'LOADING...', core2: 'LOADING...' };
    // 만약 상태창(ONLINE) 대괄호 안에도 노랑 배경을 넣고 싶다면...
    const drawStatus = () => {
        setCursor(0, statusY);

        const center = (str, len = 12) => {
            const pad = Math.max(0, len - str.length);
            const left = Math.floor(pad / 2);
            return " ".repeat(left) + str + " ".repeat(pad - left);
        };

        const text1 = center(status.core1);
        const text2 = center(status.core2);

        // 상태창 반전 효과 (온라인일 때 초록 배경에 검정 글자 / 로딩일 때 노랑 배경에 검정 글자)
        const s1 = status.core1 === 'ONLINE'
            ? `\x1b[42m${BLACK}${text1}${RESET}` // 초록 배경
            : `${BG_KB_MAIN}${BLACK}${text1}${RESET}`; // 노랑 배경

        const s2 = status.core2 === 'ONLINE'
            ? `\x1b[42m${BLACK}${text2}${RESET}`
            : `${BG_KB_MAIN}${BLACK}${text2}${RESET}`;

        process.stdout.write(`  CORE-1: JSON  [${s1}]    CORE-2: VITE  [${s2}]   `);
        readline.cursorTo(process.stdout, 0, statusY + 1);
    };
    drawStatus();

    // 3. 서버 실행 (경고 로그 차단)
    const runServer = (cmd, args, key) => {
        const proc = spawn(cmd, args, { shell: true, stdio: ['ignore', 'pipe', 'ignore'] });

        proc.stdout.on('data', (data) => {
            const msg = data.toString();
            // JSON 서버 감지 키워드 대폭 추가 (Resources, Home, localhost, 3000 등)
            if (
                msg.includes('ready in') ||
                msg.includes('Resources') ||
                msg.includes('Home') ||
                msg.includes('localhost:3000') ||
                msg.includes('Index') ||
                msg.includes('Type s + enter') // json-server v1.x 대응
            ) {
                status[key] = 'ONLINE';
                drawStatus();
            }
        });
    };

    runServer('npx.cmd', ['json-server', '--watch', 'db.json', '--port', '3000'], 'core1');
    runServer('npm.cmd', ['run', 'dev'], 'core2');

    setCursor(0, statusY + 1);
    console.log(`${GRAY}  ----------------------------------------------------------------------------------${RESET}`);
    console.log(`  URL: ${RESET}🌸 \x1b[4mhttp://localhost:5173/\x1b[0m 🌸\n`);
    // console.log(`\x1b[45m\x1b[37m  🌸 KB 29-2 SUCCESS / SERVICE START!!          ${RESET}\n`);

    // 프로세스가 죽지 않게 유지하면서 출력은 더이상 안 함
    process.stdout.write('\x1b[?25h');
    process.stdin.resume();
}
run();