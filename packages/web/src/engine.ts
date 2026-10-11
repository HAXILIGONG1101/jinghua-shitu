/**
 * 京华·仕途 V1.2 极简版 —— 游戏内核。
 *
 * 全部规则都是纯函数,既跑在浏览器里,也能被测试直接调用。
 * 规则设计目标:一眼看懂、四步上手、每季度都有明确进展。
 */
import {
  DISTRICTS_GRID, ENDINGS, EVENTS, EVENT_INDEX, MONTH_NAMES, PERSON_INDEX,
  PERSONS, POSITIONS, POSITION_INDEX, PROJECTS, PROJECT_INDEX, STREET,
} from "./content";
import type {
  Difficulty, EndingId, Effects, EventChoice, GameEvent, GameState, LogEntry,
  MetricKey, Metrics, ProjectState,
} from "./types";

export const METRIC_ORDER: MetricKey[] = [
  "achievement", "satisfaction", "orgTrust", "budget", "stability", "integrityRisk",
];

export const METRIC_LABELS: Record<MetricKey, string> = {
  achievement: "政绩",
  satisfaction: "群众满意度",
  orgTrust: "组织信任",
  budget: "财政预算",
  stability: "社会稳定",
  integrityRisk: "廉政风险",
};

/** 属性下限/上限。政绩、组织信任、群众满意度、社会稳定为 0-100;廉政风险 0-100。 */
const BOUNDS: Record<MetricKey, [number, number]> = {
  achievement: [0, 100],
  satisfaction: [0, 100],
  orgTrust: [0, 100],
  budget: [0, 1200],
  stability: [0, 100],
  integrityRisk: [0, 100],
};

export const TOTAL_MONTHS = 36;
export const SAVE_SLOT_COUNT = 3;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function monthLabel(month: number): string {
  const year = Math.floor((month - 1) / 12) + 1;
  const name = MONTH_NAMES[(month - 1) % 12];
  return `第 ${year} 年 · ${name}`;
}

export function quarterOf(month: number): number {
  return Math.floor((month - 1) / 3) + 1;
}

export function isQuarterEnd(month: number): boolean {
  return month % 3 === 0;
}

export function defaultMetrics(difficulty: Difficulty): Metrics {
  return difficulty === "easy"
    ? { achievement: 50, satisfaction: 58, orgTrust: 54, budget: 360, stability: 58, integrityRisk: 6 }
    : { achievement: 50, satisfaction: 50, orgTrust: 50, budget: 300, stability: 50, integrityRisk: 12 };
}

export function createGameState(input: {
  playerName: string;
  difficulty: Difficulty;
  route?: GameState["route"];
}): GameState {
  const now = Date.now();
  const metrics = defaultMetrics(input.difficulty);
  const relations = PERSONS.map((p) => ({
    id: p.id,
    trust: clamp(p.initialTrust + (input.difficulty === "easy" ? 6 : 0), 0, 100),
  }));
  return {
    playerName: input.playerName.trim().slice(0, 12),
    district: DISTRICTS_GRID.find((d) => d.current)?.name ?? "东华区",
    street: STREET.name,
    districtBlock: DISTRICTS_GRID.find((d) => d.current)?.row ?? 2,
    streetBlock: DISTRICTS_GRID.find((d) => d.current)?.col ?? 3,
    difficulty: input.difficulty,
    level: 1,
    positionId: "level1",
    route: input.route ?? "administrative",
    month: 1,
    metrics,
    projects: PROJECTS.map((p) => ({
      id: p.id, progress: 0, quality: 50, spent: 0, stage: "未启动", done: false,
    })),
    relations,
    flags: [],
    pendingEvents: [],
    resolvedEvents: [],
    log: [
      {
        month: 1,
        title: "到岗第一天",
        text: `你到${DISTRICTS_GRID.find((d) => d.current)?.name}${STREET.name}报到,被分配到街道办综合科,正式开始基层工作。`,
      },
    ],
    quarterGrade: "—",
    promoProgress: 0,
    lastMonthlyIncome: 0,
    lastMonthlyCost: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/* ------------------------------------------------------------------ *
 * 事件选择
 * ------------------------------------------------------------------ */

function metricSnapshot(state: GameState): Metrics {
  return { ...state.metrics };
}

function applyEffects(state: GameState, effects: Effects): GameState {
  const metrics = metricSnapshot(state);
  for (const key of Object.keys(effects) as MetricKey[]) {
    const value = effects[key];
    if (typeof value !== "number") continue;
    const [min, max] = BOUNDS[key];
    metrics[key] = clamp(Math.round(metrics[key] + value), min, max);
  }
  return { ...state, metrics };
}

export function eventVisible(state: GameState, event: GameEvent, ignoreFlags = false): boolean {
  const req = event.require;
  if (!req) return true;
  if (!ignoreFlags && req.minMonth !== undefined && state.month < req.minMonth) return false;
  if (req.positionLevel !== undefined && state.level < req.positionLevel) return false;
  if (!ignoreFlags && req.flags && !req.flags.every((f) => state.flags.includes(f))) return false;
  if (req.notFlags && req.notFlags.some((f) => state.flags.includes(f))) return false;
  if (req.integrityRiskAbove !== undefined && state.metrics.integrityRisk < req.integrityRiskAbove) return false;
  if (req.budgetBelow !== undefined && state.metrics.budget > req.budgetBelow) return false;
  if (req.satisfactionBelow !== undefined && state.metrics.satisfaction > req.satisfactionBelow) return false;
  if (req.orgTrustBelow !== undefined && state.metrics.orgTrust > req.orgTrustBelow) return false;
  return true;
}

export function nextEventFor(state: GameState): GameEvent | null {
  const pool = EVENTS.filter((e) => {
    if (state.resolvedEvents.includes(e.id)) return false;
    if (!eventVisible(state, e)) return false;
    if (e.months && !e.months.includes(((state.month - 1) % 12) + 1)) return false;
    return true;
  });
  if (!pool.length) return null;
  return pool[0];
}

export function eventsThisMonth(state: GameState): GameEvent[] {
  const pool = EVENTS.filter((e) => {
    if (state.resolvedEvents.includes(e.id)) return false;
    if (!eventVisible(state, e)) return false;
    if (e.months && !e.months.includes(((state.month - 1) % 12) + 1)) return false;
    return true;
  });
  const major = pool.filter((e) => e.major);
  const normal = pool.filter((e) => !e.major);
  const wanted = [...major.slice(0, 1), ...normal].slice(0, 3);
  if (wanted.length) return wanted;
  return pool.slice(0, 1);
}

export type ResolveResult = {
  state: GameState;
  event: GameEvent;
  choice: EventChoice;
  changes: Effects;
};

export function resolveChoice(
  state: GameState,
  eventId: string,
  choiceId: string,
): ResolveResult {
  const event = EVENT_INDEX[eventId];
  if (!event) throw new Error(`未知事件:${eventId}`);
  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error(`未知选项:${choiceId}`);

  let next: GameState = applyEffects(state, choice.effects);
  const changes: Effects = { ...choice.effects };

  if (choice.project) {
    const target = next.projects.find((p) => p.id === choice.project?.id);
    if (target) {
      const def = PROJECT_INDEX[target.id];
      const progress = clamp(target.progress + (choice.project.progress ?? 0), 0, 100);
      const quality = clamp(target.quality + (choice.project.quality ?? 0), 0, 100);
      const spent = Math.min(def.budget, target.spent + Math.abs(choice.project.spent ?? 0));
      const done = progress >= 100;
      const stage = done ? "已完成" : progress >= 60 ? "施工中" : progress > 0 ? "已启动" : "未启动";
      next = {
        ...next,
        projects: next.projects.map((p) =>
          p.id === target.id ? { ...p, progress, quality, spent, done, stage } : p,
        ),
      };
      if (done && !target.done) {
        // 项目完工:按完成质量结算政绩与满意度。
        const qualityBonus = Math.round((quality - 50) / 5);
        const extra: Effects = {
          achievement: 10 + qualityBonus,
          satisfaction: 5 + Math.round(qualityBonus / 2),
          orgTrust: 3,
        };
        next = applyEffects(next, extra);
        for (const key of Object.keys(extra) as MetricKey[]) {
          changes[key] = (changes[key] ?? 0) + (extra[key] ?? 0);
        }
        next = { ...next, log: [...next.log, {
          month: next.month, title: `${PROJECT_INDEX[target.id].name}完工`,
          text: `项目通过验收并投入使用,完成质量评分 ${quality}。`,
        }] };
      }
    }
  }

  if (choice.relation) {
    next = {
      ...next,
      relations: next.relations.map((r) =>
        r.id === choice.relation?.id
          ? { ...r, trust: clamp(r.trust + (choice.relation.trust ?? 0), 0, 100) }
          : r,
      ),
    };
  }

  const flags = new Set(next.flags);
  for (const flag of choice.flags ?? []) flags.add(flag);
  next = {
    ...next,
    flags: [...flags],
    resolvedEvents: [...new Set([...next.resolvedEvents, event.id])],
    log: [
      ...next.log,
      {
        month: next.month,
        title: event.title,
        text: `${choice.label}。${choice.result}`,
        effects: choice.effects,
      },
    ],
    updatedAt: Date.now(),
  };

  if (choice.followUp?.length) {
    // 后续事件由 flags 或事件池自然触发,这里仅做兼容保留。
  }

  return { state: next, event, choice, changes };
}

/* ------------------------------------------------------------------ *
 * 月度推进
 * ------------------------------------------------------------------ */

export type AdvanceResult = {
  state: GameState;
  income: number;
  cost: number;
  projectNotes: string[];
};

export function advanceMonth(state: GameState): AdvanceResult {
  if (state.ending) return { state, income: 0, cost: 0, projectNotes: [] };

  const projectNotes: string[] = [];
  const activeProjects = state.projects.filter((p) => p.progress > 0 && !p.done);

  // 1) 项目自然推进:受社会稳定与组织信任影响。
  const tempo = 3 + Math.round((state.metrics.stability - 50) / 25) + Math.round((state.metrics.orgTrust - 50) / 40);
  let projects = state.projects.map((p) => {
    if (p.progress <= 0 || p.done) return p;
    const def = PROJECT_INDEX[p.id];
    const perMonth = Math.max(1, Math.round(100 / def.months * (p.id === "drain" ? 1 : 1)));
    const progress = clamp(p.progress + Math.min(perMonth, Math.max(2, tempo + perMonth - 4)), 0, 100);
    const quality = clamp(p.quality + (state.metrics.integrityRisk > 40 ? -2 : 0), 0, 100);
    const done = progress >= 100;
    const stage = done ? "待验收" : progress >= 60 ? "施工中" : "已启动";
    if (done && !p.done) projectNotes.push(`${def.name}达到完工节点,等待验收。`);
    const spent = Math.min(def.budget, p.spent + Math.round(def.budget / def.months));
    return { ...p, progress, quality, done, stage, spent };
  });

  // 2) 财政:稳定带来上级支持,项目维护形成固定支出。
  const income = Math.round(20 + state.metrics.stability * 0.5 + state.metrics.satisfaction * 0.2);
  const maintenance = activeProjects.length * 6;
  const projectsWithBudget = projects.map((p) => {
    if (p.progress > 0 && !p.done) {
      return p;
    }
    return p;
  });

  let next: GameState = {
    ...state,
    projects: projectsWithBudget,
    month: state.month + 1,
    lastMonthlyIncome: income,
    lastMonthlyCost: maintenance,
    updatedAt: Date.now(),
  };
  next = applyEffects(next, { budget: income - maintenance });

  // 3) 事件池刷新。
  const fresh = eventsThisMonth(next).map((e) => e.id);
  next = {
    ...next,
    pendingEvents: fresh,
    log: [
      ...next.log,
      ...projectNotes.map((text) => ({ month: state.month, title: "项目进展", text })),
    ],
  };

  // 4) 季度考核。
  if (isQuarterEnd(next.month - 1)) {
    const review = quarterReview(next);
    next = applyReview(next, review);
  }

  // 5) 结局判定。
  const ending = evaluateEnding(next);
  if (ending) next = { ...next, ending };

  return { state: next, income, cost: maintenance, projectNotes };
}

/* ------------------------------------------------------------------ *
 * 季度考核
 * ------------------------------------------------------------------ */

export type QuarterReview = {
  quarter: number;
  grade: number;
  gradeLabel: string;
  score: number;
  detail: string[];
  promotionReady: boolean;
};

export function quarterReview(state: GameState): QuarterReview {
  const m = state.metrics;
  const relationAvg = state.relations.reduce((sum, r) => sum + r.trust, 0) / state.relations.length;
  const projectAvg = state.projects.length
    ? state.projects.reduce((sum, p) => sum + p.progress, 0) / state.projects.length
    : 0;

  const parts = [
    { name: "政绩", value: m.achievement / 100 },
    { name: "群众满意度", value: m.satisfaction / 100 },
    { name: "组织信任", value: m.orgTrust / 100 },
    { name: "财政预算", value: clamp(m.budget / 400, 0, 1) },
    { name: "社会稳定", value: m.stability / 100 },
    { name: "项目进度", value: projectAvg / 100 },
    { name: "廉政风险", value: clamp(1 - m.integrityRisk / 100, 0, 1) },
    { name: "同事关系", value: relationAvg / 100 },
  ];

  const score = parts.reduce((sum, p) => sum + p.value, 0) / parts.length;
  const grade = score >= 0.72 ? 1 : score >= 0.6 ? 2 : score >= 0.48 ? 3 : 4;
  const gradeLabel = ["", "优秀", "良好", "合格", "基本合格"][grade];
  const position = POSITION_INDEX[state.positionId];
  const promotionReady =
    grade <= position.promote.grade &&
    m.achievement >= position.promote.achievement &&
    m.integrityRisk < 60 &&
    m.stability >= 30;

  const detail = parts.map((p) => `${p.name} ${Math.round(p.value * 100)} 分`);
  return { quarter: quarterOf(state.month - 1), grade, gradeLabel, score, detail, promotionReady };
}

function applyReview(state: GameState, review: QuarterReview): GameState {
  const position = POSITION_INDEX[state.positionId];
  let next: GameState = {
    ...state,
    quarterGrade: `${review.gradeLabel}`,
    log: [
      ...state.log,
      {
        month: state.month,
        title: `第 ${review.quarter} 次季度考核:${review.gradeLabel}`,
        text: `综合得分 ${Math.round(review.score * 100)} 分。${review.detail.join("、")}。`,
      },
    ],
  };

  if (review.promotionReady && state.level < POSITIONS.length) {
    const nextPosition = POSITIONS.find((p) => p.level === state.level + 1);
    if (nextPosition) {
      next = {
        ...next,
        level: state.level + 1,
        positionId: nextPosition.id,
        promoProgress: 0,
        log: [...next.log, {
          month: next.month,
          title: `晋升:${nextPosition.title}`,
          text: `季度考核达到晋升条件,组织任命你为${nextPosition.title}。`,
        }],
      };
    }
  } else if (position.promote.achievement > 0 && state.level < POSITIONS.length) {
    next = {
      ...next,
      promoProgress: clamp(state.metrics.achievement / position.promote.achievement, 0, 1),
    };
  }
  return next;
}

/* ------------------------------------------------------------------ *
 * 结局
 * ------------------------------------------------------------------ */

export function evaluateEnding(state: GameState): EndingId | undefined {
  const m = state.metrics;
  if (m.integrityRisk >= 70) return "investigated";
  if (state.month > TOTAL_MONTHS) {
    if (state.flags.includes("tookOversight") && m.integrityRisk <= 25) return "oversight";
    if (m.satisfaction >= 70 && m.achievement >= 60 && m.integrityRisk <= 25) return "promoted";
    if (m.achievement >= 60 && m.integrityRisk <= 35) return "expert";
    return "retire";
  }
  return undefined;
}

export function endingDef(id: EndingId) {
  return ENDINGS.find((e) => e.id === id) ?? ENDINGS[0];
}

/** 玩家当前职位说明。 */
export function positionOf(state: GameState) {
  return POSITION_INDEX[state.positionId] ?? POSITIONS[0];
}

/** 晋升条件描述,用于界面明确展示。 */
export function promotionHint(state: GameState) {
  const position = positionOf(state);
  if (state.level >= POSITIONS.length) return "已是当前版本的最高职务,继续做好本职工作。";
  return `下一次晋升需要:季度评价达到「${["", "优秀", "良好", "合格", "基本合格"][position.promote.grade]}」以上,政绩达到 ${position.promote.achievement},廉政风险低于 60。`;
}

/** 生成一行属性变化的文字,例如「群众满意度 +6 · 组织信任 +3」。 */
export function describeEffects(effects: Effects): string {
  return (Object.keys(effects) as MetricKey[])
    .filter((k) => typeof effects[k] === "number" && effects[k] !== 0)
    .map((k) => `${METRIC_LABELS[k]} ${effects[k]! > 0 ? "+" : ""}${effects[k]}`)
    .join(" · ");
}

/** 事件分类标签。 */
export const CATEGORY_LABELS: Record<GameEvent["category"], string> = {
  governance: "政务工作",
  appeal: "群众诉求",
  project: "项目管理",
  personnel: "人事组织",
  integrity: "廉政监督",
};

/** 分类颜色(用于徽标)。 */
export const CATEGORY_TONES: Record<GameEvent["category"], string> = {
  governance: "bg-slate2-pale text-slate2",
  appeal: "bg-emerald-50 text-emerald-800",
  project: "bg-amber-50 text-amber-800",
  personnel: "bg-indigo-50 text-indigo-800",
  integrity: "bg-seal-pale text-seal",
};

export function activeProjects(state: GameState) {
  return state.projects.filter((p) => p.progress > 0 && !p.done);
}

export function completedProjects(state: GameState) {
  return state.projects.filter((p) => p.done);
}

export function projectDefOf(id: string) {
  return PROJECT_INDEX[id];
}

export function relationTrust(state: GameState, id: string) {
  return state.relations.find((r) => r.id === id)?.trust ?? 0;
}

export function personOf(id: string) {
  return PERSON_INDEX[id];
}

export function logTail(state: GameState, count = 8): LogEntry[] {
  return [...state.log].slice(-count).reverse();
}

export function difficultyLabel(difficulty: Difficulty) {
  return difficulty === "easy" ? "轻松模式" : "标准模式";
}
