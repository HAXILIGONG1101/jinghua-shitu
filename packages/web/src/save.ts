/** 京华·仕途 V1.2 极简版 —— 本地存档(浏览器 localStorage + 文件导出)。 */
import { createGameState, nextEventFor } from "./engine";
import type { GameState, SaveSlot } from "./types";

const SAVE_VERSION = 2;
const PREFIX = "jhs.v12";

function key(slot: number | "auto" | "current") {
  return `${PREFIX}.${slot}`;
}

function canUseStorage(): boolean {
  try {
    const probe = `${PREFIX}.probe`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const memory = new Map<string, string>();

function readRaw(name: string): string | null {
  if (canUseStorage()) return window.localStorage.getItem(name);
  return memory.get(name) ?? null;
}

function writeRaw(name: string, value: string) {
  if (canUseStorage()) window.localStorage.setItem(name, value);
  else memory.set(name, value);
}

function removeRaw(name: string) {
  if (canUseStorage()) window.localStorage.removeItem(name);
  else memory.delete(name);
}

type Envelope = { version: number; savedAt: number; state: GameState };

export function saveGame(slot: number | "auto", state: GameState): GameState {
  const stamped: GameState = { ...state, updatedAt: Date.now() };
  const envelope: Envelope = { version: SAVE_VERSION, savedAt: Date.now(), state: stamped };
  const serialized = JSON.stringify(envelope);
  writeRaw(key(slot), serialized);
  if (slot === "auto" && stamped.activeSlot) {
    writeRaw(key(stamped.activeSlot), serialized);
  }
  writeRaw(key("current"), serialized);
  return stamped;
}

export function loadGame(slot: number | "auto" | "current"): GameState | null {
  const raw = readRaw(key(slot));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Envelope>;
    if (!parsed.state || typeof parsed.state.month !== "number") return null;
    return hydrate(parsed.state as GameState);
  } catch {
    return null;
  }
}

export function loadLast(): GameState | null {
  return loadGame("current");
}

export function deleteGame(slot: number) {
  removeRaw(key(slot));
}

export function hasAnySave(): boolean {
  return Boolean(readRaw(key("current"))) || listSlots().some((s) => s !== null);
}

export function listSlots(): (SaveSlot | null)[] {
  return [1, 2, 3].map((slot) => {
    const raw = readRaw(key(slot));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<Envelope>;
      const rawState = parsed.state as GameState | undefined;
      if (!rawState) return null;
      const state = hydrate(rawState);
      return {
        slot,
        name: state.playerName,
        position: positionTitle(state),
        month: state.month,
        updatedAt: parsed.savedAt ?? state.updatedAt ?? 0,
        state,
      };
    } catch {
      return null;
    }
  });
}

function positionTitle(state: GameState): string {
  // 避免循环依赖:只读取已经持久化的职务等级。
  const titles = [
    "街道办综合科 科员",
    "街道办综合科 副科长",
    "街道办综合科 科长",
    "街道办 副主任",
    "区职能局 副局长",
    "区政府 副职",
  ];
  return titles[Math.max(0, Math.min(titles.length - 1, state.level - 1))];
}

/** 兼容旧版本存档:补齐缺失字段,保证读取后状态完整。 */
function hydrate(state: GameState): GameState {
  const base = createGameState({
    playerName: state.playerName || "未署名干部",
    difficulty: state.difficulty === "normal" ? "normal" : "easy",
  });
  const merged: GameState = {
    ...base,
    ...state,
    metrics: { ...base.metrics, ...state.metrics },
    projects: state.projects?.length ? state.projects : base.projects,
    relations: state.relations?.length ? state.relations : base.relations,
    pendingEvents: Array.isArray(state.pendingEvents) ? state.pendingEvents : [],
    resolvedEvents: Array.isArray(state.resolvedEvents) ? state.resolvedEvents : [],
    flags: Array.isArray(state.flags) ? state.flags : [],
    log: Array.isArray(state.log) ? state.log : base.log,
  };
  if (!merged.pendingEvents.length && !merged.ending) {
    const next = nextEventFor(merged);
    merged.pendingEvents = next ? [next.id] : [];
  }
  return merged;
}

export function exportSave(state: GameState): string {
  return JSON.stringify({ version: SAVE_VERSION, savedAt: Date.now(), state }, null, 2);
}

export function importSave(text: string): GameState {
  const parsed = JSON.parse(text) as Partial<Envelope>;
  if (!parsed.state) throw new Error("存档文件格式不正确");
  return hydrate(parsed.state as GameState);
}

export function downloadSave(state: GameState) {
  const blob = new Blob([exportSave(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `京华仕途-${state.playerName}-第${state.month}月.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
