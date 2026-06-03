import { SectionCard } from "./dash-ui";

interface StatItem {
  label: string;
  value: number | string;
  hint?: string;
}

export function DashboardStats({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-[var(--va-line)] bg-gradient-to-br from-[var(--va-surface-2)]/70 to-[var(--va-surface)]/50 p-4 transition hover:border-[var(--va-gold)]/60"
        >
          <div className="text-xs uppercase tracking-wider text-[var(--va-muted)]">
            {s.label}
          </div>
          <div className="mt-2 font-display text-3xl text-white">{s.value}</div>
          {s.hint && (
            <div className="mt-1 text-[11px] text-[var(--va-muted)]">{s.hint}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export { SectionCard };
