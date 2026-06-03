import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  clearStoredAdminCode,
  getAdminData,
  getStoredAdminCode,
  setStoredAdminCode,
} from "@/lib/dashboard-api";
import { DashboardTabs } from "./DashboardTabs";
import { GhostBtn, PrimaryBtn, inputClass } from "./dash-ui";

const truthy = (v: any) =>
  v === true || v === "true" || v === 1 || v === "1" || v === "JA" || v === "Ja";

export function VanAppiahDashboardWidget() {
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Read sessionStorage on mount only
  useEffect(() => {
    const stored = getStoredAdminCode();
    if (stored) {
      setAdminCode(stored);
      setOpen(true);
    }
  }, []);

  const query = useQuery({
    queryKey: ["van-appiah-dashboard", adminCode],
    queryFn: () => getAdminData(adminCode!),
    enabled: !!adminCode && open,
    staleTime: 45_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Compact stats
  const compact = useMemo(() => {
    const d = query.data;
    if (!d) return null;
    const newMsgs =
      (d.berichten || []).filter((m) => /nieuw/i.test(m.Status || "")).length;
    const newQuotes =
      (d.offertes || []).filter((q) => /nieuw/i.test(q.Status || "")).length;
    const openLeads = (d.leads || []).filter((l) =>
      /nieuw|in\s?behandeling|open/i.test(l.Status || "")
    ).length;
    return { newMsgs, newQuotes, openLeads };
  }, [query.data]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setVerifying(true);
    setLoginError(null);
    try {
      await getAdminData(codeInput.trim());
      setStoredAdminCode(codeInput.trim());
      setAdminCode(codeInput.trim());
      setOpen(true);
      setCodeInput("");
    } catch (err: any) {
      setLoginError(err?.message || "Ongeldige admin code.");
    } finally {
      setVerifying(false);
    }
  }

  function handleLogout() {
    clearStoredAdminCode();
    setAdminCode(null);
    setOpen(false);
  }

  return (
    <section className="font-sans" aria-label="Van Appiah Dashboard">
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="rounded-2xl border border-[var(--va-line)] bg-[var(--va-ink)] text-white shadow-2xl">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-[var(--va-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md border border-[var(--va-gold)]/60 bg-gradient-to-br from-[var(--va-gold)]/20 to-transparent font-display text-lg tracking-wider text-[var(--va-gold)]">
                VA
              </div>
              <div>
                <h2 className="font-display text-xl tracking-wide text-white sm:text-2xl">
                  Van Appiah Dashboard
                </h2>
                <p className="text-xs text-[var(--va-muted)]">
                  Interne bedrijfsomgeving
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {adminCode && (
                <>
                  <GhostBtn onClick={() => query.refetch()}>
                    {query.isFetching ? "Verversen..." : "Vernieuwen"}
                  </GhostBtn>
                  <GhostBtn onClick={() => setOpen((o) => !o)}>
                    {open ? "Inklappen" : "Open dashboard"}
                  </GhostBtn>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-[var(--va-muted)] hover:text-rose-300"
                  >
                    Uitloggen
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-5">
            {!adminCode ? (
              <form
                onSubmit={handleLogin}
                className="mx-auto flex max-w-md flex-col gap-3 py-4"
              >
                <p className="text-sm text-[var(--va-muted)]">
                  Voer de admin code in om het dashboard te openen.
                </p>
                <input
                  type="password"
                  placeholder="Admin code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className={inputClass}
                  autoComplete="off"
                />
                {loginError && (
                  <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    {loginError}
                  </div>
                )}
                <PrimaryBtn type="submit" disabled={verifying}>
                  {verifying ? "Verifiëren..." : "Inloggen"}
                </PrimaryBtn>
              </form>
            ) : !open ? (
              // Compact mode
              <div className="grid gap-4 sm:grid-cols-4">
                <Compact label="Open leads" value={compact?.openLeads ?? "—"} />
                <Compact label="Nieuwe berichten" value={compact?.newMsgs ?? "—"} />
                <Compact label="Nieuwe offertes" value={compact?.newQuotes ?? "—"} />
                <div className="flex items-center justify-center">
                  <PrimaryBtn onClick={() => setOpen(true)}>Open dashboard</PrimaryBtn>
                </div>
              </div>
            ) : query.isLoading ? (
              <Skeleton />
            ) : query.isError ? (
              <div className="space-y-3 py-4 text-center">
                <p className="text-sm text-rose-300">
                  Dashboarddata kon niet geladen worden. Controleer de admin code of
                  probeer opnieuw.
                </p>
                <p className="text-xs text-[var(--va-muted)]">
                  {(query.error as Error)?.message}
                </p>
                <div className="flex justify-center gap-2">
                  <GhostBtn onClick={() => query.refetch()}>Opnieuw proberen</GhostBtn>
                  <GhostBtn onClick={handleLogout}>Andere code</GhostBtn>
                </div>
              </div>
            ) : query.data ? (
              <DashboardTabs data={query.data} adminCode={adminCode} />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Compact({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border border-[var(--va-line)] bg-[var(--va-surface-2)]/40 p-4">
      <div className="text-xs uppercase tracking-wider text-[var(--va-muted)]">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl text-[var(--va-gold-soft)]">
        {value}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-[var(--va-line)] bg-[var(--va-surface-2)]/40"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-xl border border-[var(--va-line)] bg-[var(--va-surface-2)]/40" />
    </div>
  );
}
