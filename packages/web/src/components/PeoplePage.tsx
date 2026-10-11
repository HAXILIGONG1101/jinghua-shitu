/** 人事组织:关键人物、职责、工作风格与当前信任度。 */
import { BadgeCheck, Handshake, Info, UsersRound } from "lucide-react";
import { PERSONS } from "../content";
import { relationTrust } from "../engine";
import type { GameState } from "../types";
import { Bar, Card, Panel, Tag } from "./ui";

function trustLabel(value: number) {
  if (value >= 75) return { text: "信任", tone: "border-emerald-200 bg-emerald-50 text-emerald-800" };
  if (value >= 55) return { text: "认可", tone: "border-slate2/30 bg-slate2-pale text-slate2" };
  if (value >= 35) return { text: "一般", tone: "border-paper-edge bg-paper text-ink-mute" };
  return { text: "疏远", tone: "border-seal/40 bg-seal-pale text-seal" };
}

export function PeoplePage({ state }: { state: GameState }) {
  const average = Math.round(
    PERSONS.reduce((sum, person) => sum + relationTrust(state, person.id), 0) / PERSONS.length,
  );

  return (
    <div className="flex flex-col gap-3.5">
      <section className="flex flex-col gap-2 border border-paper-edge bg-white px-4 py-3.5 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[17px] font-bold">人事组织</h1>
            <Tag>{PERSONS.length} 名关键人物</Tag>
          </div>
          <p className="mt-1 text-[11.5px] leading-5 text-ink-soft">
            人物不会凭空帮你。每次协作和决策都会改变信任度，关系又会影响后续工作的结果。
          </p>
        </div>
        <div className="flex-1" />
        <div className="min-w-[150px] border border-paper-edge bg-paper px-3 py-2">
          <div className="flex items-center justify-between text-[10.5px] text-ink-mute">
            <span>平均信任度</span>
            <b className="num text-[13px] text-ink">{average}</b>
          </div>
          <div className="mt-1.5">
            <Bar value={average} tone={average >= 60 ? "green" : "slate"} />
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {PERSONS.map((person) => {
          const trust = relationTrust(state, person.id);
          const label = trustLabel(trust);
          return (
            <Card key={person.id} className="flex flex-col p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-wood-deep text-[16px] font-bold text-paper">
                  {person.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-[13.5px]">{person.name}</b>
                    <Tag>{person.tag}</Tag>
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-mute">{person.role} · {person.affiliation}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="border border-paper-edge bg-paper px-2.5 py-2">
                  <div className="text-[10px] text-ink-mute">工作能力</div>
                  <div className="num mt-0.5 text-[15px] font-semibold">{person.ability}<span className="text-[10px] text-ink-mute">/100</span></div>
                </div>
                <div className={`border px-2.5 py-2 ${label.tone}`}>
                  <div className="text-[10px] opacity-75">对你的信任</div>
                  <div className="mt-0.5 flex items-center gap-1">
                    <span className="num text-[15px] font-semibold">{trust}</span>
                    <span className="text-[10px]">· {label.text}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5">
                <Bar value={trust} tone={trust >= 60 ? "green" : trust >= 40 ? "slate" : "amber"} />
              </div>

              <div className="mt-3 flex items-start gap-2 text-[10.5px] leading-4 text-ink-mute">
                <BadgeCheck size={13} className="mt-0.5 shrink-0 text-slate2" />
                <span><b className="text-ink-soft">风格:</b> {person.style}</span>
              </div>
              <div className="mt-2 flex items-start gap-2 text-[10.5px] leading-4 text-ink-mute">
                <Info size={13} className="mt-0.5 shrink-0 text-slate2" />
                <span>{person.note}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="怎么看关系" icon={<Handshake size={15} />}>
          <div className="flex flex-col gap-2 text-[11px] leading-5 text-ink-soft">
            <p><b className="text-ink">信任高:</b> 跨科室协作更顺，别人更愿意提前提醒风险。</p>
            <p><b className="text-ink">信任低:</b> 工作仍能推进，但可能出现拖办、互相推责和信息不透明。</p>
            <p><b className="text-ink">注意:</b> 关系不是万能通行证。项目、任免和监督仍受规则与证据约束。</p>
          </div>
        </Panel>
        <Panel title="当前团队状态" icon={<UsersRound size={15} />}>
          <div className="grid grid-cols-2 gap-2">
            {PERSONS.slice(0, 4).map((person) => (
              <div key={person.id} className="border border-paper-edge bg-paper px-2.5 py-2">
                <div className="text-[10.5px] text-ink-mute">{person.affiliation}</div>
                <div className="mt-0.5 text-[11.5px] font-medium">{person.name}</div>
                <div className="num mt-1 text-[12px]">信任 {relationTrust(state, person.id)}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
