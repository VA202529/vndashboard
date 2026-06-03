import { useState, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function DashModal({ open, onClose, title, children, footer, wide }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--va-ink)]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${wide ? "max-w-4xl" : "max-w-xl"} max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--va-line)] bg-[var(--va-surface)] text-white shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-[var(--va-line)] px-6 py-4">
          <h3 className="font-display text-xl tracking-wide text-[var(--va-gold-soft)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--va-muted)] hover:text-white"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-[var(--va-line)] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
  full?: boolean;
}
export function Field({ label, children, full }: FieldProps) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-wider text-[var(--va-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "rounded-md border border-[var(--va-line)] bg-[var(--va-ink)]/60 px-3 py-2 text-sm text-white outline-none transition focus:border-[var(--va-gold)] focus:ring-1 focus:ring-[var(--va-gold)]/50";

export function PrimaryBtn({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md bg-[var(--va-gold)] px-4 py-2 text-sm font-medium text-[var(--va-ink)] transition hover:bg-[var(--va-gold-soft)] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostBtn({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-[var(--va-line)] px-4 py-2 text-sm text-white transition hover:border-[var(--va-gold)] hover:text-[var(--va-gold)]"
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  let color = "bg-white/10 text-white";
  if (/(nieuw|open|new)/.test(s)) color = "bg-blue-500/20 text-blue-300";
  else if (/(in\s?behandeling|bezig|progress)/.test(s))
    color = "bg-amber-500/20 text-amber-200";
  else if (/(afgerond|done|verzonden|betaald|klaar)/.test(s))
    color = "bg-emerald-500/20 text-emerald-200";
  else if (/(openstaand|wacht|pending)/.test(s))
    color = "bg-orange-500/20 text-orange-200";
  else if (/(geannuleerd|afgewezen|cancel)/.test(s))
    color = "bg-rose-500/20 text-rose-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${color}`}
    >
      {status || "—"}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--va-line)] bg-[var(--va-ink)]/40 px-6 py-12 text-center text-sm text-[var(--va-muted)]">
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--va-line)] bg-[var(--va-surface-2)]/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg text-[var(--va-gold-soft)]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" } | null>(
    null
  );
  function show(msg: string, tone: "ok" | "err" = "ok") {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3500);
  }
  const node = toast ? (
    <div
      className={`fixed bottom-6 right-6 z-[200] rounded-md px-4 py-3 text-sm shadow-xl ${
        toast.tone === "ok"
          ? "bg-emerald-500/90 text-white"
          : "bg-rose-500/90 text-white"
      }`}
    >
      {toast.msg}
    </div>
  ) : null;
  return { show, node };
}

export function formatMoney(v: any): string {
  if (v === undefined || v === null || v === "") return "—";
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(v: any): string {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(v);
  }
}
