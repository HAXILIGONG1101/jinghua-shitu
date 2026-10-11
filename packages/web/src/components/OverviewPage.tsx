/** 游戏总览:六项属性、当前事项、考核进度、简化地图和最近记录。 */
import {
  ArrowRight, BarChart3, CalendarCheck2, CheckCircle2, ChevronRight,
  Circle, CircleDollarSign,
  ClipboardList, Compass, Landmark, MapPinned, TrendingUp,
} from "lucide-react";
import { EVENT_INDEX, POSITIONS, PROJECT_INDEX } from "../content";
import {
  CATEGORY_LABELS, METRIC_LABELS, TOTAL_MONTHS, logTail, monthLabel, positionOf,
  promotionHint, quarterOf,
} from "../engine";
import type { GameState, MetricKey } from "../types";
import type { PageId } from "./Shell";
import { Bar, Card, MetricCard, Panel, Tag } from "./ui";
import { MiniMap } from "./MiniMap";

function metricTone(key: MetricKey, value: number): "ink" | "good" | "warn" | "bad" {
  if (key === "integrityRisk") {
    if (value >= 55) return "bad";
    if (value >= 30) return "warn";
    return "good";
  }
  if (value >= 70) return "good";
  if (value >= 40) return "ink";
  return "warn";
}

function monthProgress(month: number) {
  const inQuarter = ((month - 1) % 3) + 1;
  return inQuarter / 3 * 100;
}

export function OverviewPage({
  state, onNavigate,
}: {
  state: GameState;
  onNavigate: (page: PageId) => void;
}) {
  const position = positionOf(state);
  const nextPosition = POSITIONS.find((item) => item.level === state.level + 1);
  const activeEvents = state.pendingEvents
    .filter((id) => !state.resolvedEvents.includes(id))
    .map((id) => EVENT_INDEX[id])
    .filter(Boolean);
  const activeProjects = state.projects.filter((project) => !project.done);
  const recentLogs = logTail(state, 5);
  const isFirstMonth = state.month === 1 && state.log.length <= 2;
  const mainline = [
    { label: "到岗融入街道工作", done: state.month >= 2 || state.log.length > 1 },
    { label: "解决第一件群众诉求", done: state.flags.includes("firstVisitDone") },
    { label: "推动南河沿积水点改造", done: state.flags.includes("drainComplaintDone") },
    { label: "通过第一次季度考核", done: state.month > 3 || state.quarterGrade !== "—" },
    { label: "完成任内完整治理周期", done: state.month >= TOTAL_MONTHS || Boolean(state.ending) },
  ];
  const relationAverage = state.relations.length
    ? Math.round(state.relations.reduce((sum, item) => sum + item.trust, 0) / state.relations.length)
    : 0;
  const sideTasks = [
    { label: "完成一个建设项目", done: state.projects.some((project) => project.done) },
    { label: "廉政风险保持在 25 以下", done: state.metrics.integrityRisk <= 25 },
    { label: "同事平均信任达到 65", done: relationAverage >= 65 },
  ];


  const metricItems: { key: MetricKey; hint: string; unit?: string }[] = [
    { key: "achievement", hint: "靠办成实事和项目积累", unit: "/100" },
    { key: "satisfaction", hint: "群众对办理结果的评价", unit: "/100" },
    { key: "orgTrust", hint: "上级与同事对你的信任", unit: "/100" },
    { key: "budget", hint: "可用于本月工作的资金", unit: "万" },
    { key: "stability", hint: "辖区安全与治理秩序", unit: "/100" },
    { key: "integrityRisk", hint: "越低越安全,达到 70 会出局", unit: "/100" },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      <section className="flex flex-col gap-2 border border-paper-edge bg-white px-4 py-3.5 md:flex-row md:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[17px] font-bold">游戏总览</h1>
            <Tag>{position.stage}</Tag>
            <Tag tone="text-emerald-800">{state.difficulty === "easy" ? "轻松模式" : "标准模式"}</Tag>
          </div>
          <p className="mt-1 text-[11.5px] leading-5 text-ink-soft">
            {state.playerName} · {position.title} · {state.district}{state.street}
          </p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-[10.5px] text-ink-mute">当前时间</div>
            <div className="num text-[13px] font-semibold">{monthLabel(state.month)}</div>
          </div>
          <div className="h-8 w-px bg-paper-edge" />
          <div>
            <div className="text-[10.5px] text-ink-mute">季度考核</div>
            <div className="text-[13px] font-semibold">第 {quarterOf(state.month)} 季度</div>
          </div>
        </div>
      </section>

      {isFirstMonth ? (
        <section className="border border-seal/35 bg-seal-pale/45 px-4 py-3">
          <div className="flex items-center gap-2 text-[12.5px] font-semibold text-seal">
            <Compass size={15} /> 新手提示:这一页先看懂，接下来只需要点选项
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <div className="border border-seal/20 bg-white/70 px-3 py-2 text-[11.5px] leading-5">
              <b>1. 看总览</b><br />确认六项属性、项目和当前月份。
            </div>
            <div className="border border-seal/20 bg-white/70 px-3 py-2 text-[11.5px] leading-5">
              <b>2. 去政务工作</b><br />每件重要事项都有 3 个现成方案。
            </div>
            <div className="border border-seal/20 bg-white/70 px-3 py-2 text-[11.5px] leading-5">
              <b>3. 推进一个月</b><br />月初看考核,达到条件自动晋升。
            </div>
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 size={16} className="text-seal" />
          <h2 className="text-[14px] font-semibold">六项核心属性</h2>
          <span className="text-[10.5px] text-ink-mute">选择方案后立即变化</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {metricItems.map((item) => (
            <MetricCard
              key={item.key}
              label={METRIC_LABELS[item.key]}
              value={state.metrics[item.key]}
              unit={item.unit}
              hint={item.hint}
              tone={metricTone(item.key, state.metrics[item.key])}
            />
          ))}
        </div>
      </section>

      <div className="grid items-start gap-3.5 lg:grid-cols-[1.65fr_0.95fr]">
        <div className="flex flex-col gap-3.5">
          <Panel
            title="主线与支线"
            icon={<Compass size={15} />}
            extra={<Tag>按顺序完成即可</Tag>}
          >
            <div className="grid gap-3 md:grid-cols-[1.35fr_0.65fr]">
              <div>
                <div className="mb-2 text-[11px] font-semibold text-seal">成长主线</div>
                <div className="flex flex-col gap-1.5">
                  {mainline.map((item, index) => (
                    <div key={item.label} className={`flex items-center gap-2 border px-2.5 py-2 text-[11px] ${item.done ? "border-emerald-200 bg-emerald-50/60 text-emerald-900" : "border-paper-edge bg-paper text-ink-soft"}`}>
                      {item.done ? <CheckCircle2 size={14} className="shrink-0 text-emerald-800" /> : <Circle size={14} className="shrink-0 text-ink-mute" />}
                      <span className="num w-4 shrink-0 text-ink-mute">{index + 1}</span>
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[10px] text-ink-mute">{item.done ? "已完成" : "待完成"}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-[11px] font-semibold text-slate2">支线挑战</div>
                <div className="flex flex-col gap-1.5">
                  {sideTasks.map((item) => (
                    <div key={item.label} className={`flex items-start gap-2 border px-2.5 py-2 text-[10.5px] leading-4 ${item.done ? "border-emerald-200 bg-emerald-50/50 text-emerald-900" : "border-paper-edge bg-paper text-ink-mute"}`}>
                      {item.done ? <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-800" /> : <Circle size={13} className="mt-0.5 shrink-0" />}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-[10.5px] leading-4 text-ink-mute">
              主线决定完整故事进度；支线会改善结局评价，但不是必须完成。
            </p>
          </Panel>

          <Panel
            title="本月要处理的事项"
            icon={<ClipboardList size={15} />}
            extra={<Tag>{activeEvents.length} 项待办</Tag>}
          >
            {activeEvents.length ? (
              <div className="flex flex-col gap-2">
                {activeEvents.map((event, index) => (
                  <button
                    key={event.id}
                    onClick={() => onNavigate("work")}
                    className="group flex items-start gap-3 border border-paper-edge bg-paper px-3 py-2.5 text-left transition-colors hover:border-seal/60 hover:bg-seal-pale/30"
                  >
                    <span className="num mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-seal text-[11px] text-white">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <b className="text-[12.5px]">{event.title}</b>
                        <Tag>{CATEGORY_LABELS[event.category]}</Tag>
                        {event.major ? <Tag tone="border-seal/40 text-seal">重要</Tag> : null}
                      </span>
                      <span className="mt-1 block text-[11px] leading-4 text-ink-mute">
                        {event.hint ?? "先了解情况,再选择一个处理方案。"}
                      </span>
                    </span>
                    <ChevronRight size={16} className="mt-1 shrink-0 text-ink-mute group-hover:text-seal" />
                  </button>
                ))}
                <button className="btn btn-primary mt-1 self-start" onClick={() => onNavigate("work")}>
                  现在去处理 <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2 py-2">
                <p className="text-[12px] text-ink-soft">本月重要事项已经处理完，可以推进时间了。</p>
                <button className="btn btn-primary" onClick={() => onNavigate("work")}>
                  去推进一个月 <ArrowRight size={15} />
                </button>
              </div>
            )}
          </Panel>

          <Panel
            title="重点项目"
            icon={<TrendingUp size={15} />}
            extra={<span className="text-[10.5px] text-ink-mute">项目会随月份和选择推进</span>}
          >
            <div className="grid gap-2 md:grid-cols-3">
              {state.projects.map((project) => {
                const def = PROJECT_INDEX[project.id];
                if (!def) return null;
                return (
                  <div key={project.id} className="border border-paper-edge bg-paper px-3 py-2.5">
                    <div className="text-[11.5px] font-medium">{def.name}</div>
                    <div className="mt-2 flex items-center justify-between text-[10.5px] text-ink-mute">
                      <span>{project.stage}</span>
                      <span className="num">{project.progress}%</span>
                    </div>
                    <div className="mt-1.5">
                      <Bar value={project.progress} tone={project.done ? "green" : "seal"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="最近记录" icon={<CalendarCheck2 size={15} />}>
            <div className="flex flex-col">
              {recentLogs.map((entry, index) => (
                <div key={`${entry.month}-${entry.title}-${index}`} className="flex gap-3 border-b border-paper-edge py-2 last:border-b-0">
                  <div className="num w-14 shrink-0 text-[10.5px] text-ink-mute">第 {entry.month} 月</div>
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-medium">{entry.title}</div>
                    <div className="mt-0.5 text-[10.5px] leading-4 text-ink-mute">{entry.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-3.5">
          <Panel title="行政地图" icon={<MapPinned size={15} />} extra={<Tag>示意图</Tag>}>
            <MiniMap />
          </Panel>

          <Panel title="晋升路线" icon={<Landmark size={15} />}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-ink-mute">当前</span>
              <span className="text-ink-mute">下一站</span>
            </div>
            <div className="mt-1.5 border border-paper-edge bg-paper px-3 py-2.5">
              <div className="text-[11.5px] font-semibold">{position.title}</div>
              <div className="mt-1 text-[10.5px] leading-4 text-ink-mute">{position.duty}</div>
            </div>
            {nextPosition ? (
              <>
                <div className="my-2 text-center text-[16px] text-ink-mute">↓</div>
                <div className="border border-seal/35 bg-seal-pale/40 px-3 py-2.5">
                  <div className="text-[11.5px] font-semibold text-seal">{nextPosition.title}</div>
                </div>
              </>
            ) : (
              <div className="mt-2 border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] text-emerald-800">
                已达到本版本最高职务。
              </div>
            )}
            <p className="mt-2.5 text-[10.5px] leading-4 text-ink-mute">{promotionHint(state)}</p>
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-[10.5px] text-ink-mute">
                <span>本季度进度</span>
                <span className="num">{Math.round(monthProgress(state.month))}%</span>
              </div>
              <Bar value={monthProgress(state.month)} tone="slate" />
            </div>
          </Panel>

          <Card className="px-3.5 py-3">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold">
              <CircleDollarSign size={15} className="text-seal" /> 本月收支
            </div>
            {state.lastMonthlyIncome > 0 ? (
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div className="border border-paper-edge bg-paper px-2.5 py-2">
                  <div className="text-ink-mute">上月收入</div>
                  <div className="num mt-1 text-[15px] font-semibold text-emerald-800">+{state.lastMonthlyIncome}</div>
                </div>
                <div className="border border-paper-edge bg-paper px-2.5 py-2">
                  <div className="text-ink-mute">项目维护</div>
                  <div className="num mt-1 text-[15px] font-semibold text-seal">-{state.lastMonthlyCost}</div>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-[10.5px] leading-4 text-ink-mute">
                推进会按月结算财政收入和项目维护支出。当前可用预算 {state.metrics.budget} 万元。
              </p>
            )}
          </Card>

          <div className="border border-paper-edge bg-white px-3.5 py-3 text-[10.5px] leading-4 text-ink-mute">
            <b className="text-ink-soft">简单原则:</b> 拿不准时，优先选“先核实、走程序、把事办成”的方案。短期好看但留下风险的选择，会在后面的月份找回来。
          </div>
        </div>
      </div>
    </div>
  );
}
