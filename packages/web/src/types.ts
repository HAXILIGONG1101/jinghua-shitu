/** 京华·仕途 V1.2 极简版 —— 核心数据类型。 */

/** 六项核心属性。 */
export type MetricKey =
  | "achievement"
  | "satisfaction"
  | "orgTrust"
  | "budget"
  | "stability"
  | "integrityRisk";

export type Metrics = Record<MetricKey, number>;

export type PositionId = "level1" | "level2" | "level3" | "level4" | "level5" | "level6";

export type Difficulty = "easy" | "normal";

export type EndingId = "promoted" | "expert" | "oversight" | "retire" | "investigated";

/** 一次选择带来的即时变化(增量)。 */
export type Effects = Partial<Metrics> & { budget?: number };

export type EventCategory = "governance" | "appeal" | "project" | "personnel" | "integrity";

export type EventChoice = {
  id: string;
  /** 选项文字,玩家只看选项不输入任何内容。 */
  label: string;
  /** 选择后的结果说明。 */
  result: string;
  effects: Effects;
  /** 额外触发的事件 id(用于事件链)。 */
  followUp?: string[];
  /** 项目进度增量,按内容 id 索引。 */
  project?: { id: string; progress?: number; quality?: number; spent?: number };
  /** 人物关系增量。 */
  relation?: { id: string; trust?: number };
  /** 标记,供条件判断使用。 */
  flags?: string[];
};

export type GameEvent = {
  id: string;
  title: string;
  category: EventCategory;
  /** 适合出现的月份(1-12);为空表示全年可触发。 */
  months?: number[];
  /** 触发条件:按属性阈值、职务、标记等。 */
  require?: {
    positionLevel?: number;
    minMonth?: number;
    flags?: string[];
    notFlags?: string[];
    integrityRiskAbove?: number;
    budgetBelow?: number;
    satisfactionBelow?: number;
    orgTrustBelow?: number;
  };
  /** 是否三选一的重大事件(重大事件给更多属性变化)。 */
  major?: boolean;
  /** 事件正文描述。 */
  body: string;
  /** 背景提示,帮助新手理解。 */
  hint?: string;
  choices: EventChoice[];
};

export type ProjectState = {
  id: string;
  progress: number;
  quality: number;
  spent: number;
  stage: string;
  done: boolean;
  issue?: string;
};

export type RelationshipState = { id: string; trust: number };

export type LogEntry = {
  month: number;
  title: string;
  text: string;
  effects?: Effects;
};

export type GameState = {
  playerName: string;
  district: string;
  street: string;
  districtBlock: number;
  streetBlock: number;
  difficulty: Difficulty;
  /** 当前使用的本地存档位;自动保存时会同步回该位置。 */
  activeSlot?: number;
  level: number;
  positionId: PositionId;
  route: "administrative" | "professional" | "oversight";
  month: number;
  metrics: Metrics;
  projects: ProjectState[];
  relations: RelationshipState[];
  flags: string[];
  pendingEvents: string[];
  resolvedEvents: string[];
  log: LogEntry[];
  quarterGrade: string;
  promoProgress: number;
  lastMonthlyIncome: number;
  lastMonthlyCost: number;
  ending?: EndingId;
  endingShown?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type SaveSlot = {
  slot: number;
  name: string;
  position: string;
  month: number;
  updatedAt: number;
  state: GameState;
};

export type Position = {
  id: PositionId;
  level: number;
  stage: string;
  title: string;
  duty: string;
  /** 晋升到下一级所需要的季度评价与政绩。 */
  promote: { grade: number; achievement: number };
};

export type Person = {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  tag: string;
  ability: number;
  style: string;
  note: string;
  initialTrust: number;
};

export type ProjectDef = {
  id: string;
  name: string;
  summary: string;
  budget: number;
  months: number;
  category: string;
};

export type EndingDef = {
  id: EndingId;
  title: string;
  tone: "good" | "neutral" | "bad";
  summary: string;
  detail: string;
};
