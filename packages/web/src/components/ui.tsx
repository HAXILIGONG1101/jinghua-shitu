/** 京华·仕途 V1.2 —— 极简 UI 组件。 */
import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function Panel({
  title, icon, extra, children, className = "", bodyClass = "",
}: {
  title: string;
  icon?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClass?: string;
}) {
  return (
    <Card className={className}>
      <header className="flex items-center gap-2 border-b border-paper-edge px-3.5 py-2.5">
        <h2 className="panel-title">{icon}{title}</h2>
        <div className="flex-1" />
        {extra}
      </header>
      <div className={`px-3.5 py-3 ${bodyClass}`}>{children}</div>
    </Card>
  );
}

export function MetricCard({
  label, value, unit, hint, tone = "ink",
}: {
  label: string;
  value: number | string;
  unit?: string;
  hint?: string;
  tone?: "ink" | "good" | "warn" | "bad";
}) {
  const color =
    tone === "good" ? "text-emerald-800"
    : tone === "warn" ? "text-amber-800"
    : tone === "bad" ? "text-seal"
    : "text-ink";
  return (
    <div className="card px-3 py-2.5">
      <div className="label">{label}</div>
      <div className={`mt-1 flex items-baseline gap-1 ${color}`}>
        <span className="num text-[22px] font-semibold leading-none">{value}</span>
        {unit ? <span className="text-[11px] text-ink-mute">{unit}</span> : null}
      </div>
      {hint ? <div className="mt-1 text-[10.5px] leading-4 text-ink-mute">{hint}</div> : null}
    </div>
  );
}

export function Bar({
  value, tone = "seal", label,
}: {
  value: number;
  tone?: "seal" | "slate" | "green" | "amber";
  label?: string;
}) {
  const bg =
    tone === "green" ? "bg-emerald-700"
    : tone === "amber" ? "bg-amber-600"
    : tone === "slate" ? "bg-slate2"
    : "bg-seal";
  return (
    <div>
      {label ? <div className="mb-1 text-[10.5px] text-ink-mute">{label}</div> : null}
      <div className="h-1.5 w-full overflow-hidden rounded-sm bg-paper-dim">
        <div className={`h-full ${bg}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function Tag({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className={`tag ${tone ?? ""}`}>{children}</span>;
}

export function Modal({
  title, onClose, children, footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 md:items-center md:p-4">
      <div className="flex max-h-[92vh] w-full max-w-[560px] flex-col border border-paper-edge bg-white shadow-2xl md:rounded">
        <header className="flex items-center gap-2 border-b border-paper-edge px-4 py-3">
          <h2 className="text-[14px] font-semibold">{title}</h2>
          <div className="flex-1" />
          <button className="btn btn-quiet !px-1.5 !py-1" onClick={onClose} aria-label="关闭">
            <X size={16} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-3.5">{children}</div>
        {footer ? <footer className="border-t border-paper-edge px-4 py-3">{footer}</footer> : null}
      </div>
    </div>
  );
}

export function Empty({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-[12.5px] text-ink-mute">{text}</p>
      {action}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11.5px] font-medium text-ink-soft">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-[10.5px] text-ink-mute">{hint}</div> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded border border-paper-edge bg-white px-2.5 py-2 text-[13px] text-ink outline-none focus:border-seal";
