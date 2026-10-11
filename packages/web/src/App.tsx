/** 京华·仕途 V1.2 主应用:连接首页、四个页面、存档和结算弹窗。 */
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Award, CalendarCheck2, CheckCircle2, ChevronRight,
  Flag, RotateCcw, ShieldCheck, Sparkles, X,
} from "lucide-react";
import { AUTHOR } from "./content";
import {
  advanceMonth, endingDef, eventsThisMonth, monthLabel, positionOf,
  quarterReview, resolveChoice,
} from "./engine";
import type { QuarterReview, ResolveResult } from "./engine";
import { saveGame } from "./save";
import type { EndingId, GameState } from "./types";
import { AuthorSplash } from "./components/AuthorSplash";
import { HomePage } from "./components/HomePage";
import { OverviewPage } from "./components/OverviewPage";
import { PeoplePage } from "./components/PeoplePage";
import { ProfilePage } from "./components/ProfilePage";
import { Shell, type PageId } from "./components/Shell";
import { WorkPage } from "./components/WorkPage";
import { Modal, Tag } from "./components/ui";

type QuarterNotice = {
  review: QuarterReview;
  promoted: boolean;
  fromPosition: string;
  toPosition: string;
};

function withPendingEvents(state: GameState): GameState {
  if (state.ending) return state;
  const unresolved = state.pendingEvents.filter((id) => !state.resolvedEvents.includes(id));
  if (unresolved.length) return { ...state, pendingEvents: unresolved };
  const fresh = eventsThisMonth(state).map((event) => event.id);
  return { ...state, pendingEvents: fresh };
}

function Toast({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-20 left-1/2 z-[70] w-[calc(100%-24px)] max-w-[460px] -translate-x-1/2 md:bottom-6">
      <div className="flex items-start gap-2 border border-wood-line bg-wood-deep px-3.5 py-2.5 text-[11.5px] leading-4 text-paper shadow-xl">
        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-seal-light" />
        <span className="min-w-0 flex-1">{text}</span>
        <button onClick={onClose} className="shrink-0 text-paper/60 hover:text-paper" aria-label="关闭提示">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function QuarterModal({ notice, onClose }: { notice: QuarterNotice; onClose: () => void }) {
  const good = notice.review.grade <= 2;
  return (
    <Modal
      title={`第 ${notice.review.quarter} 季度考核`}
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={onClose}>
            继续履职 <ArrowRight size={15} />
          </button>
        </div>
      }
    >
      <div className={`border px-4 py-4 ${good ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70"}`}>
        <div className="flex items-center gap-2">
          {notice.promoted ? <Sparkles size={18} className="text-seal" /> : <CalendarCheck2 size={18} className={good ? "text-emerald-800" : "text-amber-800"} />}
          <b className="text-[15px]">{notice.promoted ? "考核达标，获得晋升" : `本次评价:${notice.review.gradeLabel}`}</b>
        </div>
        <div className="num mt-3 flex items-end gap-1">
          <span className="text-[34px] font-semibold leading-none">{Math.round(notice.review.score * 100)}</span>
          <span className="pb-0.5 text-[11px] text-ink-mute">综合分</span>
        </div>
      </div>

      {notice.promoted ? (
        <div className="mt-3 border border-seal/30 bg-seal-pale/50 px-3.5 py-3">
          <div className="text-[10.5px] text-ink-mute">职务变化</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] font-semibold">
            <span>{notice.fromPosition}</span>
            <ChevronRight size={15} className="text-seal" />
            <span className="text-seal">{notice.toPosition}</span>
          </div>
        </div>
      ) : (
        <p className="mt-3 border border-paper-edge bg-paper px-3.5 py-3 text-[11px] leading-5 text-ink-soft">
          这次没有晋升。继续处理事件、推进项目并保持低廉政风险，下一次季度考核仍有机会。
        </p>
      )}

      <div className="mt-3">
        <div className="mb-2 text-[11.5px] font-semibold">各项得分</div>
        <div className="flex flex-wrap gap-1.5">
          {notice.review.detail.map((item) => <Tag key={item}>{item}</Tag>)}
        </div>
      </div>
    </Modal>
  );
}

function EndingModal({
  ending, onProfile, onHome, onClose,
}: {
  ending: EndingId;
  onProfile: () => void;
  onHome: () => void;
  onClose: () => void;
}) {
  const def = endingDef(ending);
  return (
    <Modal
      title="本局结束"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button className="btn btn-ghost" onClick={onHome}>
            <RotateCcw size={15} /> 返回首页
          </button>
          <button className="btn btn-primary" onClick={onProfile}>
            <Award size={15} /> 查看完整档案
          </button>
        </div>
      }
    >
      <div className={`border px-4 py-4 ${
        def.tone === "bad"
          ? "border-seal/40 bg-seal-pale/70"
          : def.tone === "good"
            ? "border-emerald-200 bg-emerald-50/70"
            : "border-slate2/30 bg-slate2-pale/60"
      }`}>
        <div className="flex items-center gap-2">
          <Flag size={18} className={def.tone === "bad" ? "text-seal" : "text-emerald-800"} />
          <b className="text-[16px]">{def.title}</b>
        </div>
        <p className="mt-2 text-[11.5px] leading-5 text-ink-soft">{def.summary}</p>
      </div>
      <p className="mt-3 text-[11.5px] leading-6 text-ink-soft">{def.detail}</p>
      <div className="mt-3 flex items-start gap-2 border border-paper-edge bg-paper px-3 py-2.5 text-[10.5px] leading-4 text-ink-mute">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-slate2" />
        <span>结局由长期属性、项目结果、程序合规和廉政风险共同决定。你仍可以从首页读取存档，尝试另一条路线。</span>
      </div>
    </Modal>
  );
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [page, setPage] = useState<PageId>("overview");
  const [lastOutcome, setLastOutcome] = useState<ResolveResult | null>(null);
  const [quarterNotice, setQuarterNotice] = useState<QuarterNotice | null>(null);
  const [endingOpen, setEndingOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);
  const seenEnding = useRef("");

  const showToast = (text: string) => {
    setToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3200);
  };

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (!game?.ending) return;
    const key = `${game.createdAt}-${game.ending}`;
    if (seenEnding.current === key) return;
    seenEnding.current = key;
    setEndingOpen(true);
  }, [game?.ending, game?.createdAt]);

  const enterGame = (state: GameState) => {
    const ready = withPendingEvents({ ...state });
    const saved = saveGame("auto", ready);
    setGame(saved);
    setLastOutcome(null);
    setPage("overview");
  };

  const handleResolve = (eventId: string, choiceId: string) => {
    if (!game || game.ending) return;
    try {
      const result = resolveChoice(game, eventId, choiceId);
      const cleaned: GameState = {
        ...result.state,
        pendingEvents: result.state.pendingEvents.filter((id) => id !== eventId),
      };
      const saved = saveGame("auto", cleaned);
      setGame(saved);
      setLastOutcome(result);
      const left = saved.pendingEvents.filter((id) => !saved.resolvedEvents.includes(id)).length;
      showToast(left ? `处理完成，还剩 ${left} 项本月事项。` : "本月事项已处理完，现在可以推进一个月。");
    } catch (error) {
      showToast(`操作失败:${(error as Error).message}`);
    }
  };

  const handleAdvance = () => {
    if (!game || game.ending) return;
    const left = game.pendingEvents.filter((id) => !game.resolvedEvents.includes(id)).length;
    if (left > 0) {
      showToast(`还有 ${left} 项事项没有处理，先处理完再推进。`);
      return;
    }

    const previousMonth = game.month;
    const previousPosition = positionOf(game).title;
    const result = advanceMonth(game);
    const next = withPendingEvents(result.state);
    const saved = saveGame("auto", next);
    setGame(saved);
    setLastOutcome(null);

    if (previousMonth % 3 === 0) {
      setQuarterNotice({
        review: quarterReview(saved),
        promoted: saved.level > game.level,
        fromPosition: previousPosition,
        toPosition: positionOf(saved).title,
      });
    }

    showToast(`时间已推进到 ${monthLabel(saved.month)}。`);
  };

  const goHome = () => {
    setGame(null);
    setLastOutcome(null);
    setQuarterNotice(null);
    setEndingOpen(false);
    setPage("overview");
  };

  if (!entered) {
    return <AuthorSplash onEnter={() => setEntered(true)} />;
  }

  if (!game) {
    return (
      <>
        <HomePage onPlay={enterGame} toast={showToast} />
        {toast ? <Toast text={toast} onClose={() => setToast("")} /> : null}
      </>
    );
  }

  const pendingCount = game.pendingEvents.filter((id) => !game.resolvedEvents.includes(id)).length;

  return (
    <>
      <Shell
        state={game}
        page={page}
        onNavigate={setPage}
        onHome={goHome}
        pendingCount={pendingCount}
      >
        {page === "overview" ? <OverviewPage state={game} onNavigate={setPage} /> : null}
        {page === "work" ? (
          <WorkPage
            state={game}
            lastOutcome={lastOutcome}
            onResolve={handleResolve}
            onAdvance={handleAdvance}
          />
        ) : null}
        {page === "people" ? <PeoplePage state={game} /> : null}
        {page === "profile" ? <ProfilePage state={game} /> : null}
      </Shell>

      {quarterNotice ? (
        <QuarterModal notice={quarterNotice} onClose={() => setQuarterNotice(null)} />
      ) : null}

      {endingOpen && game.ending ? (
        <EndingModal
          ending={game.ending}
          onClose={() => setEndingOpen(false)}
          onHome={goHome}
          onProfile={() => {
            setEndingOpen(false);
            setPage("profile");
          }}
        />
      ) : null}

      {toast ? <Toast text={toast} onClose={() => setToast("")} /> : null}

      <div className="pointer-events-none fixed bottom-16 right-2 z-20 hidden text-right text-[9.5px] text-ink-mute/60 md:bottom-3 md:block">
        作者 {AUTHOR}
      </div>
    </>
  );
}
