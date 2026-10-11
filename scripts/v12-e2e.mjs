/**
 * 京华·仕途 V1.2 浏览器回归测试。
 *
 * 使用本机 Edge 的 DevTools 协议，不依赖额外浏览器驱动。
 * 覆盖:作者页、新建角色、事件点选、月度推进、刷新读档、四个页面、
 * 桌面与手机宽度下的横向溢出检查。
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9333;
const BASE = process.env.JHS_BASE_URL ?? "http://127.0.0.1:5273/";
const ROOT = resolve(import.meta.dirname, "..");
const SHOT_DIR = join(ROOT, "work");
mkdirSync(SHOT_DIR, { recursive: true });

const profile = join(tmpdir(), `jhs-v12-edge-${Date.now()}`);
const edge = spawn(EDGE, [
  "--headless",
  "--disable-gpu",
  "--no-first-run",
  "--disable-extensions",
  "--remote-allow-origins=*",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--window-size=1440,1000",
  BASE,
], { stdio: "ignore", windowsHide: true });

let socket;
let sequence = 0;
const pending = new Map();
const consoleErrors = [];

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function pageSocketUrl() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const pages = await response.json();
      const page = pages.find((item) => item.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Edge is still starting.
    }
    await sleep(100);
  }
  throw new Error("无法连接 Edge DevTools");
}

function connect(url) {
  return new Promise((resolvePromise, reject) => {
    const ws = new WebSocket(url);
    socket = ws;
    ws.onopen = () => resolvePromise();
    ws.onerror = () => reject(new Error("浏览器调试连接失败"));
    ws.onmessage = (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const waiter = pending.get(message.id);
        if (!waiter) return;
        pending.delete(message.id);
        if (message.error) waiter.reject(new Error(message.error.message));
        else waiter.resolve(message.result);
        return;
      }
      if (message.method === "Runtime.exceptionThrown") {
        consoleErrors.push(message.params.exceptionDetails?.text ?? "未知脚本异常");
      }
      if (
        message.method === "Runtime.consoleAPICalled"
        && message.params.type === "error"
      ) {
        consoleErrors.push(
          message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "),
        );
      }
    };
  });
}

function send(method, params = {}) {
  return new Promise((resolvePromise, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve: resolvePromise, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  }
  return result.result.value;
}

async function waitFor(expression, label, timeout = 7000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(`Boolean(document.body) && (${expression})`)) return;
    await sleep(120);
  }
  throw new Error(`等待超时:${label}`);
}

async function clickText(text) {
  const clicked = await evaluate(`(() => {
    const target = ${JSON.stringify(text.replace(/\s+/g, ""))};
    const normalize = (value) => String(value ?? "").replace(/\\s+/g, "");
    const button = [...document.querySelectorAll("button")]
      .find((item) => normalize(item.innerText) === target || normalize(item.innerText).includes(target));
    if (!button) return false;
    button.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`找不到按钮:${text}`);
  await sleep(180);
}

async function screenshot(name) {
  const result = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  writeFileSync(join(SHOT_DIR, name), Buffer.from(result.data, "base64"));
}

async function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function bodyText() {
  return evaluate("document.body.innerText");
}

async function main() {
  const wsUrl = await pageSocketUrl();
  await connect(wsUrl);
  await send("Page.enable");
  await send("Runtime.enable");

  await waitFor("document.body.innerText.includes('京华·仕途')", "作者页标题");
  const splashText = await bodyText();
  await assert(splashText.includes("kris 雷"), "作者页没有显示作者 kris 雷");
  await assert(splashText.includes("进入游戏"), "作者页没有进入游戏按钮");
  await screenshot("v12-01-splash-desktop.png");

  await clickText("进入游戏");
  await waitFor("document.body.innerText.includes('开始游戏')", "首页");
  await assert((await bodyText()).includes("作者"), "首页没有作者标记");

  await clickText("新建游戏");
  await waitFor("document.querySelector('input[placeholder=\"输入你的名字\"]') !== null", "角色名字输入框");
  const typed = await evaluate(`(() => {
    const input = document.querySelector('input[placeholder="输入你的名字"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "测试干部");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return input.value;
  })()`);
  await assert(typed === "测试干部", "角色名字无法输入");
  await clickText("开始履职");

  await waitFor("document.body.innerText.includes('游戏总览')", "游戏总览");
  const overviewText = await bodyText();
  for (const metric of ["政绩", "群众满意度", "组织信任", "财政预算", "社会稳定", "廉政风险"]) {
    await assert(overviewText.includes(metric), `总览缺少属性:${metric}`);
  }
  await assert(overviewText.includes("测试干部"), "总览没有显示自定角色名字");

  await clickText("政务工作");
  await waitFor("document.body.innerText.includes('当前事项')", "政务工作页");
  const visibleInputs = await evaluate(`
    [...document.querySelectorAll("input, textarea, select")]
      .filter((item) => item.offsetParent !== null).length
  `);
  await assert(visibleInputs === 0, "政务工作页仍然存在需要打字或填写的控件");
  await assert(
    await evaluate(`[...document.querySelectorAll("button")].some((item) => item.innerText.includes("点击选择后立即结算结果"))`),
    "政务工作页没有选项按钮",
  );

  for (let round = 0; round < 5; round += 1) {
    const hasChoice = await evaluate(`
      [...document.querySelectorAll("button")]
        .some((item) => item.innerText.includes("点击选择后立即结算结果"))
    `);
    if (!hasChoice) break;
    const clicked = await evaluate(`(() => {
      const button = [...document.querySelectorAll("button")]
        .find((item) => item.innerText.includes("点击选择后立即结算结果"));
      if (!button) return false;
      button.click();
      return true;
    })()`);
    await assert(clicked, "无法点击事件选项");
    await sleep(260);
  }

  await waitFor("document.body.innerText.includes('已处理')", "选择结果");
  await clickText("推进一个月");
  await waitFor("document.body.innerText.includes('在岗 2 个月')", "推进到第 2 个月");

  const saveState = await evaluate(`(() => {
    const raw = localStorage.getItem("jhs.v12.1");
    return raw ? JSON.parse(raw).state : null;
  })()`);
  await assert(saveState?.playerName === "测试干部", "本地存档没有保存角色");
  await assert(saveState?.month === 2, "本地存档月份不正确");

  await send("Page.reload", { ignoreCache: true });
  await waitFor("document.body.innerText.includes('kris 雷')", "刷新后的作者页");
  await clickText("进入游戏");
  await waitFor("document.body.innerText.includes('测试干部')", "刷新后的存档卡片");
  await clickText("读取");
  await waitFor("document.body.innerText.includes('游戏总览')", "刷新后读取游戏");
  await assert((await bodyText()).includes("在岗 2 个月"), "刷新后没有恢复月份");

  for (const page of ["人事组织", "个人档案", "游戏总览"]) {
    await clickText(page);
    await waitFor(`document.body.innerText.includes(${JSON.stringify(page)})`, `${page}页面`);
  }

  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Page.reload", { ignoreCache: true });
  await waitFor("document.body.innerText.includes('kris 雷')", "手机作者页");
  await assert(
    await evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"),
    "手机作者页存在横向溢出",
  );
  await screenshot("v12-02-splash-mobile.png");
  await clickText("进入游戏");
  await waitFor("document.body.innerText.includes('测试干部')", "手机首页");
  await assert(
    await evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"),
    "手机首页存在横向溢出",
  );
  await screenshot("v12-03-home-mobile.png");
  await clickText("读取");
  await waitFor("document.body.innerText.includes('游戏总览')", "手机游戏总览");
  await screenshot("v12-04-overview-mobile.png");

  for (const page of ["政务工作", "人事组织", "个人档案", "游戏总览"]) {
    await clickText(page);
    await waitFor(`document.body.innerText.includes(${JSON.stringify(page)})`, `手机${page}`);
    const overflow = await evaluate("document.documentElement.scrollWidth - window.innerWidth");
    await assert(overflow <= 1, `手机${page}横向溢出 ${overflow}px`);
  }

  // 跑通完整剧本:每月选择第一套稳妥方案，逐月推进到 36 个月后的结局。
  for (let cycle = 0; cycle < 44; cycle += 1) {
    if (await evaluate("document.body.innerText.includes('本局结束')")) break;

    await clickText("政务工作");
    for (let round = 0; round < 6; round += 1) {
      const hasChoice = await evaluate(`
        [...document.querySelectorAll("button")]
          .some((item) => item.innerText.includes("点击选择后立即结算结果"))
      `);
      if (!hasChoice) break;
      await evaluate(`(() => {
        const button = [...document.querySelectorAll("button")]
          .find((item) => item.innerText.includes("点击选择后立即结算结果"));
        button?.click();
      })()`);
      await sleep(90);
    }

    const canAdvance = await evaluate(`
      [...document.querySelectorAll("button")]
        .some((item) => item.innerText.replace(/\\s+/g, "") === "推进一个月" && !item.disabled)
    `);
    await assert(canAdvance, `第 ${cycle + 2} 个月无法推进`);
    await clickText("推进一个月");
    await sleep(150);

    if (await evaluate("document.body.innerText.includes('继续履职')")) {
      await clickText("继续履职");
    }
  }

  const finalState = await evaluate(`(() => {
    const raw = localStorage.getItem("jhs.v12.current");
    return raw ? JSON.parse(raw).state : null;
  })()`);
  await assert(finalState?.ending, "36 个月后没有形成结局");
  await assert(finalState.month > 36, "结局出现时月份不正确");
  await assert(finalState.level > 1, "完整剧本没有发生任何晋升");

  await assert(consoleErrors.length === 0, `发现脚本错误:${consoleErrors.join(" | ")}`);

  console.log(JSON.stringify({
    ok: true,
    profile: saveState.playerName,
    initialMonth: saveState.month,
    finalMonth: finalState.month,
    finalLevel: finalState.level,
    ending: finalState.ending,
    finalMetrics: finalState.metrics,
    finalGrade: finalState.quarterGrade,
    screenshots: [
      "work/v12-01-splash-desktop.png",
      "work/v12-02-splash-mobile.png",
      "work/v12-03-home-mobile.png",
      "work/v12-04-overview-mobile.png",
    ],
  }, null, 2));
}

try {
  await main();
} finally {
  try {
    socket?.close();
  } catch {
    // Ignore cleanup failures.
  }
  if (edge.pid) {
    spawnSync("taskkill", ["/PID", String(edge.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  }
}
