/** 政务工作:月度事件选择、结果反馈、项目与财政概览。 */
import {
  ArrowRight, BriefcaseBusiness, CalendarClock, CheckCircle2, ChevronRight,
  CircleDollarSign, ClipboardCheck, Hammer, Lightbulb, ShieldAlert,
} from "lucide-react";
import { EVENT_INDEX, PROJECT_INDEX } from "../content";
import { CATEGORY_LABELS, METRIC_LABELS, monthLabel } from "../engine";
import type { ResolveResult } from "../engine";
import type { Effects, EventChoice, GameEvent, GameState, MetricKey } from "../types";
import { Bar, Card, Empty, Panel, Tag } from "./ui";

function effectTone(key: MetricKey, value: number) {
  if (key === "integrityRisk") return value <= 0 ? "text-emerald-800" : "text-seal";
  return value >= 0 ? "text-emerald-800" : "text-seal";
}

function choiceSignal(choice: EventChoice): { text: string; className: string } {
  const risk = choice.effects.integrityRisk ?? 0;
  if (risk >= 8) return { text: "风险较高", className: "border-seal/40 bg-seal-pale text-seal" };
  if (risk >= 3) return { text: "需留意手续", className: "border-amber-300 bg-amber-50 text-amber-800" };
  if ((choice.effects.satisfaction ?? 0) >= 5 && (choice.effects.orgTrust ?? 0) >= 3) {
    return { text: "稳妥务实", className: "border-emerald-200 bg-emerald-50 text-emerald-800" };
  }
  if ((choice.effects.achievement ?? 0) >= 6) {
    return { text: "推进较快", className: "border-slate2/30 bg-slate2-pale text-slate2" };
  }
  return { text: "常规处理", className: "border-paper-edge bg-paper text-ink-mute" };
}

function EventChoices({
  event, onResolve,
}: {
  event: GameEvent;
  onResolve: (eventId: string, choiceId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {event.choices.map((choice, index) => {
        const signal = choiceSignal(choice);
        return (
          <button
            key={choice.id}
            onClick={() => onResolve(event.id, choice.id)}
            className="group flex w-full items-start gap-3 border border-paper-edge bg-paper px-3 py-3 text-left transition-colors hover:border-seal hover:bg-seal-pale/25"
          >
            <span className="num mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-paper-edge bg-white text-[11px] font-semibold text-ink-soft">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <b className="text-[12.5px] leading-5">{choice.label}</b>
                <span className={`rounded-sm border px-1.5 py-0.5 text-[9.5px] ${signal.className}`}>
                  {signal.text}
                </span>
              </span>
              <span className="mt-1 block text-[10.5px] text-ink-mute">点击选择后立即结算结果</span>
            </span>
            <ChevronRight size={16} className="mt-1 shrink-0 text-ink-mute group-hover:text-seal" />
          </button>
        );
      })}
    </div>
  );
}

function EffectList({ effects }: { effects: Effects }) {
  const keys = (Object.keys(effects) as MetricKey[]).filter((key) => effects[key]);
  if (!keys.length) return <span className="text-[10.5px] text-ink-mute">本月状态保持稳定</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {keys.map((key) => (
        <span
          key={key}
          className={`num rounded-sm border border-paper-edge bg-white px-2 py-1 text-[10.5px] ${effectTone(key, effects[key] ?? 0)}`}
        >
          {METRIC_LABELS[key]} {(effects[key] ?? 0) > 0 ? "+" : ""}{effects[key]}
        </span>
      ))}
    </div>
  );
}

function LastOutcome({ outcome }: { outcome: ResolveResult }) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/60 px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <CheckCircle2 size={16} className="text-emerald-800" />
        <b className="text-[12.5px] text-emerald-900">已处理:{outcome.event.title}</b>
        <Tag tone="border-emerald-200 bg-white text-emerald-800">结果已记录</Tag>
      </div>
      <p className="mt-2 text-[11.5px] leading-5 text-ink-soft">
        <b>{outcome.choice.label}。</b>{outcome.choice.result}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="text-[10.5px] text-ink-mute">属性变化:</span>
        <EffectList effects={outcome.changes} />
      </div>
    </Card>
  );
}

export function WorkPage({
  state, lastOutcome, onResolve, onAdvance,
}: {
  state: GameState;
  lastOutcome: ResolveResult | null;
  onResolve: (eventId: string, choiceId: string) => void;
  onAdvance: () => void;
}) {
  const pendingIds = state.pendingEvents.filter((id) => !state.resolvedEvents.includes(id));
  const currentEvent = pendingIds.length ? EVENT_INDEX[pendingIds[0]] : null;
  const totalCount = state.pendingEvents.length;
  const resolvedCount = state.pendingEvents.filter((id) => state.resolvedEvents.includes(id)).length;

  return (
    <div className="flex flex-col gap-3.5">
      <section className="flex flex-col gap-2 border border-paper-edge bg-white px-4 py-3.5 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[17px] font-bold">政务工作</h1>
            <Tag>{monthLabel(state.month)}</Tag>
            {currentEvent ? <Tag>{CATEGORY_LABELS[currentEvent.category]}</Tag> : null}
          </div>
          <p className="mt-1 text-[11.5px] leading-5 text-ink-soft">
            一次只处理一件事。每件事项有三个现成方案，点选后立即看到结果和属性变化。
          </p>
        </div>
        <div className="flex-1" />
        <div className="text-[11.5px] text-ink-mute">
          本月进度 <b className="num text-ink">{Math.min(resolvedCount, totalCount)}</b> /
          <b className="num text-ink"> {totalCount}</b>
        </div>
      </section>

      {lastOutcome ? <LastOutcome outcome={lastOutcome} /> : null}

      <div className="grid items-start gap-3.5 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="flex flex-col gap-3.5">
          <Panel
            title="当前事项"
            icon={<BriefcaseBusiness size={15} />}
            extra={currentEvent
              ? <Tag tone="border-seal/40 text-seal">{pendingIds.length} 项待办</Tag>
              : <Tag tone="border-emerald-200 text-emerald-800">已处理完</Tag>}
          >
            {currentEvent ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-[14px]">{currentEvent.title}</b>
                  {currentEvent.major ? <Tag tone="border-seal/40 bg-seal-pale text-seal">重大事项</Tag> : null}
                </div>
                <p className="text-[12.5px] leading-6 text-ink-soft">{currentEvent.body}</p>
                {currentEvent.hint ? (
                  <div className="flex items-start gap-2 border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-900">
                    <Lightbulb size={15} className="mt-0.5 shrink-0" />
                    <span><b>提示:</b>{currentEvent.hint}</span>
                  </div>
                ) : null}
                <div className="rule" />
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11.5px] font-semibold">
                    <ClipboardCheck size={14} className="text-seal" /> 选择一个处理方案
                  </div>
                  <EventChoices event={currentEvent} onResolve={onResolve} />
                </div>
              </div>
            ) : (
              <Empty
                text="本月重要事项已处理完，可以推进时间进入下一个月。"
                action={
                  <button className="btn btn-primary" onClick={onAdvance}>
                    推进一个月 <ArrowRight size={15} />
                  </button>
                }
              />
            )}
          </Panel>

          <Panel
            title="项目管理"
            icon={<Hammer size={15} />}
            extra={<span className="text-[10.5px] text-ink-mute">项目会随选择和月份推进</span>}
          >
            <div className="flex flex-col gap-2">
              {state.projects.map((project) => {
                const def = PROJECT_INDEX[project.id];
                if (!def) return null;
                const qualityTone = project.quality >= 60
                  ? "text-emerald-800"
                  : project.quality >= 40
                    ? "text-amber-800"
                    : "text-seal";
                return (
                  <div key={project.id} className="border border-paper-edge bg-paper px-3 py-3">
                    <div className="flex flex-wrap items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <b className="text-[12.5px]">{def.name}</b>
                          <Tag>{def.category}</Tag>
                          <Tag tone={project.done ? "border-emerald-200 text-emerald-800" : ""}>
                            {project.stage}
                          </Tag>
                        </div>
                        <p className="mt-1 text-[10.5px] leading-4 text-ink-mute">{def.summary}</p>
                      </div>
                      <div className="text-right">
                        <div className="num text-[16px] font-semibold">{project.progress}%</div>
                        <div className="text-[10px] text-ink-mute">
                          质量 <b className={qualityTone}>{project.quality}</b>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Bar value={project.progress} tone={project.done ? "green" : "seal"} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[10.5px] text-ink-mute">
                      <span>
                        预算 {def.budget} 万 · 已支出 <b className="num text-ink-soft">{project.spent}</b> 万
                      </span>
                      <span>{project.done ? "已完工" : project.issue ?? "按计划推进"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-3.5">
          <Panel title="本月结算" icon={<CalendarClock size={15} />}>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-paper-edge bg-paper px-3 py-2.5">
                <div className="text-[10.5px] text-ink-mute">待办事项</div>
                <div className="num mt-1 text-[20px] font-semibold">{pendingIds.length}</div>
              </div>
              <div className="border border-paper-edge bg-paper px-3 py-2.5">
                <div className="text-[10.5px] text-ink-mute">可用预算</div>
                <div className="num mt-1 text-[20px] font-semibold">
                  {state.metrics.budget}<span className="ml-0.5 text-[10px] text-ink-mute">万</span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <button
                className="btn btn-primary w-full py-2.5"
                disabled={pendingIds.length > 0}
                onClick={onAdvance}
                title={pendingIds.length ? "先处理完本月事项" : "推进至下个月"}
              >
                <ArrowRight size={15} /> 推进一个月
              </button>
              <p className="mt-2 text-center text-[10.5px] text-ink-mute">
                {pendingIds.length
                  ? `还有 ${pendingIds.length} 项事项，处理完后即可推进`
                  : "推进后会结算项目、财政和季度考核"}
              </p>
            </div>
          </Panel>

          <Card className="px-3.5 py-3">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold">
              <CircleDollarSign size={15} className="text-seal" /> 财政纪律
            </div>
            <p className="mt-2 text-[10.5px] leading-4 text-ink-mute">
              每次选择都会影响可用预算。项目已有预算按工程周期支出，不会从可用资金里重复扣减。
            </p>
          </Card>

          <Card className="border-amber-200 bg-amber-50/60 px-3.5 py-3">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-amber-900">
              <ShieldAlert size={15} /> 选择前看三件事
            </div>
            <ul className="mt-2 flex flex-col gap-1 text-[10.5px] leading-4 text-amber-900/90">
              <li>1. 群众会不会得到真实解决?</li>
              <li>2. 程序和材料能不能经得起检查?</li>
              <li>3. 这笔钱和这项决定以后还会不会出问题?</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
