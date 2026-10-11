/** 个人档案:任职履历、考核结果、晋升条件、成就与最终结局。 */
import {
  Award, BookMarked, ChevronRight, CircleUserRound, Flag, History,
  Medal, ShieldCheck, TrendingUp,
} from "lucide-react";
import { ENDINGS, POSITIONS } from "../content";
import {
  METRIC_LABELS, difficultyLabel, endingDef, monthLabel, positionOf,
  promotionHint, quarterOf,
} from "../engine";
import type { GameState, MetricKey } from "../types";
import { Bar, Card, Panel, Tag } from "./ui";

type Achievement = { title: string; note: string; unlocked: boolean };

function buildAchievements(state: GameState): Achievement[] {
  const doneProjects = state.projects.filter((project) => project.done).length;
  return [
    {
      title: "群众贴心人",
      note: "群众满意度达到 75",
      unlocked: state.metrics.satisfaction >= 75,
    },
    {
      title: "项目推动者",
      note: "完成至少一个建设项目",
      unlocked: doneProjects > 0,
    },
    {
      title: "廉洁把关人",
      note: "廉政风险保持在 15 以下",
      unlocked: state.metrics.integrityRisk <= 15,
    },
    {
      title: "数据求实者",
      note: "在数据上报事件中选择如实说明",
      unlocked: state.flags.includes("honestData"),
    },
    {
      title: "制度整改者",
      note: "在监督或审计事件中选择整改",
      unlocked: state.flags.includes("cleanAudit") || state.flags.includes("cooperated"),
    },
    {
      title: "基层坚守者",
      note: "任职时间达到 12 个月",
      unlocked: state.month >= 12,
    },
  ];
}

export function ProfilePage({ state }: { state: GameState }) {
  const position = positionOf(state);
  const next = POSITIONS.find((item) => item.level === state.level + 1);
  const achievements = buildAchievements(state);
  const unlockedCount = achievements.filter((item) => item.unlocked).length;
  const log = [...state.log].reverse();
  const ending = state.ending ? endingDef(state.ending) : null;

  const metricKeys: MetricKey[] = [
    "achievement", "satisfaction", "orgTrust", "budget", "stability", "integrityRisk",
  ];

  return (
    <div className="flex flex-col gap-3.5">
      <section className="flex flex-col gap-2 border border-paper-edge bg-white px-4 py-3.5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-wood-deep text-paper">
            <CircleUserRound size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[17px] font-bold">{state.playerName} 的个人档案</h1>
              <Tag>{position.stage}</Tag>
              <Tag>{difficultyLabel(state.difficulty)}</Tag>
            </div>
            <p className="mt-1 text-[11.5px] text-ink-soft">
              {position.title} · {state.district}{state.street} · 在岗 {state.month} 个月
            </p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="border border-paper-edge bg-paper px-3 py-2 text-right">
          <div className="text-[10.5px] text-ink-mute">最近考核</div>
          <div className="text-[14px] font-semibold">{state.quarterGrade === "—" ? "尚未考核" : state.quarterGrade}</div>
        </div>
      </section>

      {ending ? (
        <Card className={`px-4 py-4 ${ending.tone === "bad" ? "border-seal/40 bg-seal-pale/60" : ending.tone === "good" ? "border-emerald-200 bg-emerald-50/60" : "border-slate2/30 bg-slate2-pale/50"}`}>
          <div className="flex items-center gap-2">
            <Flag size={17} className={ending.tone === "bad" ? "text-seal" : "text-emerald-800"} />
            <b className="text-[14px]">最终结局:{ending.title}</b>
          </div>
          <p className="mt-2 text-[11.5px] leading-5 text-ink-soft">{ending.summary}</p>
          <p className="mt-1.5 text-[10.5px] leading-5 text-ink-mute">{ending.detail}</p>
        </Card>
      ) : null}

      <div className="grid items-start gap-3.5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col gap-3.5">
          <Panel title="任职与晋升" icon={<TrendingUp size={15} />}>
            <div className="border border-paper-edge bg-paper px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[10.5px] text-ink-mute">当前职务</div>
                  <b className="mt-0.5 block text-[13.5px]">{position.title}</b>
                </div>
                <Tag tone="border-seal/40 text-seal">第 {state.level} 级</Tag>
              </div>
              <p className="mt-2 text-[10.5px] leading-4 text-ink-mute">{position.duty}</p>
            </div>
            <div className="my-2 text-center text-[16px] text-ink-mute">↓</div>
            {next ? (
              <div className="border border-seal/35 bg-seal-pale/40 px-3 py-3">
                <div className="text-[10.5px] text-seal">下一职务</div>
                <b className="mt-0.5 block text-[13px] text-seal">{next.title}</b>
                <p className="mt-1 text-[10.5px] leading-4 text-ink-soft">{next.duty}</p>
              </div>
            ) : (
              <div className="border border-emerald-200 bg-emerald-50 px-3 py-3 text-[11px] text-emerald-800">
                已达到本版本最高职务。
              </div>
            )}
            <div className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10.5px] leading-4 text-amber-900">
              <b>晋升条件:</b>{promotionHint(state)}
            </div>
          </Panel>

          <Panel title="六项属性复盘" icon={<BookMarked size={15} />}>
            <div className="grid gap-2 sm:grid-cols-2">
              {metricKeys.map((key) => {
                const max = key === "budget" ? 1200 : 100;
                const value = state.metrics[key];
                const display = key === "budget" ? `${value} 万` : value;
                const tone = key === "integrityRisk"
                  ? (value >= 60 ? "seal" : value >= 30 ? "amber" : "green")
                  : value >= 70
                    ? "green"
                    : "slate";
                return (
                  <div key={key} className="border border-paper-edge bg-paper px-3 py-2.5">
                    <div className="flex items-center justify-between text-[10.5px] text-ink-mute">
                      <span>{METRIC_LABELS[key]}</span>
                      <b className="num text-[12px] text-ink">{display}</b>
                    </div>
                    <div className="mt-1.5">
                      <Bar value={value / max * 100} tone={tone} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel
            title="职业履历"
            icon={<History size={15} />}
            extra={<Tag>{state.log.length} 条记录</Tag>}
          >
            <div className="max-h-[520px] overflow-y-auto pr-1">
              {log.map((entry, index) => (
                <div key={`${entry.month}-${entry.title}-${index}`} className="relative flex gap-3 border-b border-paper-edge py-2.5 last:border-b-0">
                  <div className="w-16 shrink-0">
                    <div className="num text-[10.5px] text-ink-mute">第 {entry.month} 月</div>
                    <div className="mt-0.5 text-[9.5px] text-ink-mute">第 {quarterOf(entry.month)} 季度</div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="text-[11.5px]">{entry.title}</b>
                      {entry.effects ? <Tag>状态变化</Tag> : null}
                    </div>
                    <p className="mt-0.5 text-[10.5px] leading-4 text-ink-mute">{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-3.5">
          <Panel
            title="履职成就"
            icon={<Award size={15} />}
            extra={<span className="num text-[10.5px] text-ink-mute">{unlockedCount}/{achievements.length}</span>}
          >
            <div className="flex flex-col gap-2">
              {achievements.map((item) => (
                <div
                  key={item.title}
                  className={`flex items-start gap-2.5 border px-3 py-2.5 ${
                    item.unlocked
                      ? "border-emerald-200 bg-emerald-50/60"
                      : "border-paper-edge bg-paper opacity-70"
                  }`}
                >
                  <Medal size={16} className={item.unlocked ? "mt-0.5 text-emerald-800" : "mt-0.5 text-ink-mute"} />
                  <div>
                    <div className="text-[11.5px] font-semibold">{item.title}</div>
                    <div className="mt-0.5 text-[10px] text-ink-mute">{item.note}</div>
                  </div>
                  <div className="flex-1" />
                  <ShieldCheck size={14} className={item.unlocked ? "text-emerald-800" : "text-paper-edge"} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="结局方向" icon={<Flag size={15} />}>
            <div className="flex flex-col gap-2">
              {ENDINGS.map((item) => {
                const active = state.ending === item.id;
                return (
                  <div
                    key={item.id}
                    className={`border px-3 py-2.5 ${
                      active
                        ? "border-seal/40 bg-seal-pale/50"
                        : "border-paper-edge bg-paper"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <b className="text-[11.5px]">{item.title}</b>
                      {active ? <Tag tone="border-seal/40 text-seal">已达成</Tag> : null}
                    </div>
                    <p className="mt-1 text-[10px] leading-4 text-ink-mute">{item.summary}</p>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Card className="px-3.5 py-3">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold">
              <ChevronRight size={15} className="text-seal" /> 下一步
            </div>
            <p className="mt-2 text-[10.5px] leading-4 text-ink-mute">
              回到「政务工作」处理本月事项，再推进一个月。每 3 个月会自动进行一次季度考核，达到条件时自动晋升。
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
