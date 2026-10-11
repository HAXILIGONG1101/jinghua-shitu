/** 首页:新建游戏 / 继续游戏 / 三个本地存档位。 */
import { useRef, useState } from "react";
import {
  BookOpen, Download, FileUp, Landmark, Play, Plus, ShieldCheck, Trash2,
} from "lucide-react";
import { AUTHOR, POSITION_INDEX } from "../content";
import { createGameState, difficultyLabel, eventsThisMonth, monthLabel } from "../engine";
import { deleteGame, downloadSave, importSave, listSlots, loadLast, saveGame } from "../save";
import type { Difficulty, GameState, SaveSlot } from "../types";
import { Card, Field, inputClass, Modal, Panel, Tag } from "./ui";

type SlotInfo = SaveSlot | null;

export function HomePage({
  onPlay, toast,
}: {
  onPlay: (state: GameState) => void;
  toast: (text: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [slots, setSlots] = useState<SlotInfo[]>(() => listSlots());
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [route, setRoute] = useState<GameState["route"]>("administrative");
  const [nameError, setNameError] = useState("");
  const [slotTarget, setSlotTarget] = useState<number>(() => {
    const empty = listSlots().findIndex((s) => s === null);
    return empty >= 0 ? empty + 1 : 1;
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => setSlots(listSlots());

  const openCreate = (slot?: number) => {
    if (slot) setSlotTarget(slot);
    setName("");
    setDifficulty("easy");
    setRoute("administrative");
    setNameError("");
    setCreating(true);
  };

  const submit = () => {
    const clean = name.trim();
    if (!clean) {
      setNameError("请先输入角色名字,1 到 12 个字。");
      return;
    }
    if (clean.length > 12) {
      setNameError("名字最多 12 个字。");
      return;
    }
    const state = createGameState({ playerName: clean, difficulty, route });
    state.activeSlot = slotTarget;
    state.pendingEvents = eventsThisMonth(state).map((event) => event.id);
    const saved = saveGame(slotTarget, state);
    setCreating(false);
    refresh();
    onPlay(saved);
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const state = importSave(text);
      const firstEmpty = listSlots().findIndex((slot) => slot === null);
      state.activeSlot = firstEmpty >= 0 ? firstEmpty + 1 : 1;
      if (!state.pendingEvents.length && !state.ending) {
        state.pendingEvents = eventsThisMonth(state).map((event) => event.id);
      }
      const saved = saveGame(state.activeSlot, state);
      onPlay(saved);
      toast("存档已导入,继续游戏。");
    } catch (error) {
      toast(`导入失败:${(error as Error).message}`);
    }
  };

  const occupied = slots.filter(Boolean) as SaveSlot[];
  const newestSlot = [...occupied].sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
  const currentState = loadLast();
  const lastSave: SaveSlot | null = currentState && (!newestSlot || currentState.updatedAt >= newestSlot.updatedAt)
    ? {
        slot: currentState.activeSlot ?? newestSlot?.slot ?? 0,
        name: currentState.playerName,
        position: POSITION_INDEX[currentState.positionId]?.title ?? "街道办综合科 科员",
        month: currentState.month,
        updatedAt: currentState.updatedAt,
        state: currentState,
      }
    : newestSlot;

  return (
    <div className="min-h-full bg-paper-dim">
      <header className="border-b-2 border-seal bg-wood-deep text-paper">
        <div className="mx-auto flex max-w-[1000px] flex-wrap items-end gap-3 px-4 py-5 md:px-6 md:py-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Landmark size={26} className="text-seal-light" />
              <h1 className="text-[30px] font-bold leading-none tracking-[0.14em] md:text-[38px]">京华·仕途</h1>
            </div>
            <p className="mt-2.5 text-[11.5px] leading-5 text-paper/75">
              北京市城市治理模拟 · 从基层科员做起,处理政务、项目和人事,通过考核逐步晋升
            </p>
          </div>
          <div className="flex-1" />
          <div className="border border-wood-line bg-wood-light/40 px-3 py-2 text-right">
            <div className="text-[10.5px] text-paper/60">作者</div>
            <div className="text-[16px] font-bold tracking-[0.1em] text-seal-light">{AUTHOR}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1000px] flex-col gap-4 px-4 py-4 md:px-6 md:py-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="flex flex-col gap-2 p-4 md:col-span-2">
            <h2 className="text-[15px] font-semibold">开始游戏</h2>
            <p className="text-[12px] leading-5 text-ink-soft">
              五页玩法,除角色名字外全部点选操作:在「政务工作」里处理当月事件,点「推进一个月」结算,
              每季度考核一次,达到条件自动晋升。六项属性决定你的职业结局。
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={() => openCreate()}>
                <Plus size={15} /> 新建游戏
              </button>
              <button
                className="btn btn-ghost"
                disabled={!lastSave}
                onClick={() => lastSave && onPlay({
                  ...lastSave.state,
                  activeSlot: lastSave.state.activeSlot ?? (lastSave.slot || undefined),
                })}
              >
                <Play size={15} /> 继续游戏
              </button>
              <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
                <FileUp size={15} /> 导入存档文件
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImport(file);
                event.target.value = "";
              }}
            />
            {lastSave ? (
              <p className="text-[10.5px] text-ink-mute">
                最近进度:{lastSave.name} · {lastSave.position} · {monthLabel(lastSave.month)}
              </p>
            ) : (
              <p className="text-[10.5px] text-ink-mute">还没有存档,点「新建游戏」开始。</p>
            )}
          </Card>

          <Panel title="怎么玩" icon={<BookOpen size={15} />}>
            <ol className="flex flex-col gap-1.5 text-[11.5px] leading-5 text-ink-soft">
              <li><span className="font-semibold text-ink">1.</span> 总览看当前任务和六项属性。</li>
              <li><span className="font-semibold text-ink">2.</span> 政务工作里点选处理方案。</li>
              <li><span className="font-semibold text-ink">3.</span> 点「推进一个月」结算时间。</li>
              <li><span className="font-semibold text-ink">4.</span> 每季度考核,达标就晋升。</li>
            </ol>
          </Panel>
        </div>

        <Panel
          title="本地存档(3 个位置)"
          icon={<ShieldCheck size={15} />}
          extra={<span className="text-[10.5px] text-ink-mute">保存在本机浏览器</span>}
        >
          <div className="grid gap-2 md:grid-cols-3">
            {[1, 2, 3].map((slotNo, index) => {
              const slot = slots[index];
              return (
                <div key={slotNo} className="flex flex-col gap-2 border border-paper-edge bg-paper px-3 py-2.5">
                  {slot ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="num text-[12px] font-semibold">存档 {slot.slot}</span>
                        <Tag>{difficultyLabel(slot.state.difficulty)}</Tag>
                      </div>
                      <div className="text-[12px] font-medium">{slot.name}</div>
                      <div className="text-[10.5px] leading-4 text-ink-mute">
                        {slot.position}<br />
                        {monthLabel(slot.month)} · 保存于 {new Date(slot.updatedAt).toLocaleDateString("zh-CN")}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <button className="btn btn-primary !px-2.5 !py-1.5 !text-[11.5px]" onClick={() => onPlay({ ...slot.state, activeSlot: slot.slot })}>
                          <Play size={13} /> 读取
                        </button>
                        <button
                          className="btn btn-ghost !px-2.5 !py-1.5 !text-[11.5px]"
                          onClick={() => { downloadSave(slot.state); toast("存档文件已导出。"); }}
                        >
                          <Download size={13} /> 导出
                        </button>
                        <button
                          className="btn btn-quiet !px-2.5 !py-1.5 !text-[11.5px]"
                          onClick={() => {
                            deleteGame(slot.slot);
                            refresh();
                            toast(`存档 ${slot.slot} 已删除。`);
                          }}
                        >
                          <Trash2 size={13} /> 删除
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="num text-[12px] font-semibold text-ink-mute">存档 {slotNo}</div>
                      <div className="flex flex-1 items-center text-[11.5px] text-ink-mute">空位置</div>
                      <button className="btn btn-ghost !px-2.5 !py-1.5 !text-[11.5px]" onClick={() => openCreate(slotNo)}>
                        <Plus size={13} /> 在这里新建
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2.5 text-[10.5px] leading-4 text-ink-mute">
            提示:存档只保存在当前浏览器里。换设备或清理浏览器数据前,先点「导出」保存一份文件。
          </p>
        </Panel>
      </main>

      {creating ? (
        <Modal
          title="新建游戏"
          onClose={() => setCreating(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setCreating(false)}>取消</button>
              <button className="btn btn-primary" onClick={submit}><Play size={15} /> 开始履职</button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <Field label="角色名字(1-12 个字,可以自己输入)" hint="例如:赵晨、林一鸣、陈小北">
              <input
                className={inputClass}
                value={name}
                maxLength={12}
                placeholder="输入你的名字"
                onChange={(event) => { setName(event.target.value); setNameError(""); }}
                onKeyDown={(event) => { if (event.key === "Enter") submit(); }}
              />
            </Field>
            {nameError ? <div className="-mt-2 text-[11px] text-seal">{nameError}</div> : null}

            <div>
              <div className="mb-1 text-[11.5px] font-medium text-ink-soft">存档位置</div>
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSlotTarget(n)}
                    className={`btn ${slotTarget === n ? "btn-primary" : "btn-ghost"} !px-3`}
                  >
                    存档 {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1 text-[11.5px] font-medium text-ink-soft">难度</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {([
                  { id: "easy" as Difficulty, title: "轻松模式(推荐)", desc: "资金更宽裕、初始信任更高,适合第一次玩。" },
                  { id: "normal" as Difficulty, title: "标准模式", desc: "原始数值,资金和关系都更紧张。" },
                ]).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDifficulty(item.id)}
                    className={`rounded border px-3 py-2 text-left ${difficulty === item.id ? "border-seal bg-seal-pale/60" : "border-paper-edge bg-white hover:border-ink-mute"}`}
                  >
                    <div className="text-[12.5px] font-medium">{item.title}</div>
                    <div className="mt-0.5 text-[10.5px] leading-4 text-ink-mute">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1 text-[11.5px] font-medium text-ink-soft">发展方向(影响部分事件与结局)</div>
              <div className="grid gap-2">
                {([
                  { id: "administrative" as const, title: "行政治理", desc: "群众工作与项目建设并重,晋升路线最均衡。" },
                  { id: "professional" as const, title: "专业业务", desc: "偏向项目与财政,更容易走向专业立身的结局。" },
                  { id: "oversight" as const, title: "监督执纪", desc: "偏向程序与廉政,更容易走向监督岗位。" },
                ]).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRoute(item.id)}
                    className={`rounded border px-3 py-2 text-left ${route === item.id ? "border-seal bg-seal-pale/60" : "border-paper-edge bg-white hover:border-ink-mute"}`}
                  >
                    <div className="text-[12.5px] font-medium">{item.title}</div>
                    <div className="mt-0.5 text-[10.5px] leading-4 text-ink-mute">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
