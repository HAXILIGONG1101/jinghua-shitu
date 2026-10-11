/** 游戏主框架:顶部信息条 + 页面导航(桌面左侧 / 手机底部)。 */
import type { ReactNode } from "react";
import {
  Briefcase, FileText, Home, LayoutDashboard, UserRound, Users,
} from "lucide-react";
import { AUTHOR } from "../content";
import { difficultyLabel, monthLabel, positionOf } from "../engine";
import type { GameState } from "../types";

export type PageId = "overview" | "work" | "people" | "profile";

export const NAV: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "游戏总览", icon: LayoutDashboard },
  { id: "work", label: "政务工作", icon: Briefcase },
  { id: "people", label: "人事组织", icon: Users },
  { id: "profile", label: "个人档案", icon: UserRound },
];

export function Shell({
  state, page, onNavigate, onHome, children, pendingCount,
}: {
  state: GameState;
  page: PageId;
  onNavigate: (page: PageId) => void;
  onHome: () => void;
  children: ReactNode;
  pendingCount: number;
}) {
  const position = positionOf(state);
  return (
    <div className="min-h-full bg-paper-dim">
      <header className="sticky top-0 z-30 border-b-2 border-seal bg-wood-deep text-paper">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-3 py-2.5 md:px-5">
          <button onClick={onHome} className="flex items-center gap-2 text-left" title="回到首页">
            <span className="text-seal-light"><Briefcase size={18} /></span>
            <span className="text-[15px] font-bold tracking-[0.12em]">京华·仕途</span>
          </button>
          <div className="hidden flex-1 items-center gap-3 text-[11px] text-paper/70 sm:flex">
            <span className="rounded-sm border border-wood-line px-1.5 py-0.5">作者 {AUTHOR}</span>
            <span>{difficultyLabel(state.difficulty)}</span>
          </div>
          <div className="flex-1 sm:hidden" />
          <div className="min-w-0 text-right">
            <div className="truncate text-[12.5px] font-semibold">{state.playerName}</div>
            <div className="truncate text-[10.5px] text-paper/70">{position.title}</div>
          </div>
          <button className="btn btn-quiet !border-wood-line !px-2 !py-1.5 !text-paper/80 hover:!bg-wood-light" onClick={onHome} title="首页与存档">
            <Home size={15} />
          </button>
        </div>
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 border-t border-wood-line px-3 py-1.5 text-[10.5px] text-paper/75 md:px-5">
          <span>{state.district} · {state.street}</span>
          <span className="hidden sm:inline">在岗 {state.month} 个月</span>
          <span className="flex-1" />
          <span className="num">{monthLabel(state.month)}</span>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1180px] items-start gap-4 px-3 py-3 pb-24 md:px-5 md:py-4 md:pb-6">
        <nav className="sticky top-[86px] hidden w-[188px] shrink-0 flex-col gap-1 md:flex">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 rounded border px-3 py-2.5 text-left text-[13px] transition-colors ${
                  active
                    ? "border-seal bg-white font-semibold text-seal"
                    : "border-transparent text-ink-soft hover:border-paper-edge hover:bg-white"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.id === "work" && pendingCount > 0 ? (
                  <span className="num ml-auto rounded-sm bg-seal px-1.5 text-[10.5px] text-white">{pendingCount}</span>
                ) : null}
              </button>
            );
          })}
          <div className="mt-2 border border-paper-edge bg-white px-3 py-2.5 text-[10.5px] leading-4 text-ink-mute">
            <div className="mb-1 flex items-center gap-1 font-semibold text-ink-soft">
              <FileText size={13} /> 上手三步
            </div>
            1. 看总览的当前任务<br />
            2. 在政务工作里选方案<br />
            3. 推进一个月,再看考核
          </div>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-paper-edge bg-white md:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[10.5px] ${active ? "text-seal" : "text-ink-mute"}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.id === "work" && pendingCount > 0 ? (
                <span className="num absolute right-[22%] top-1 rounded-sm bg-seal px-1 text-[9px] text-white">{pendingCount}</span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
