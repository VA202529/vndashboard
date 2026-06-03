import { createFileRoute } from "@tanstack/react-router";
import { VanAppiahDashboardWidget } from "@/components/dashboard/VanAppiahDashboardWidget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Van Appiah — Intern Dashboard" },
      {
        name: "description",
        content:
          "Interne bedrijfsomgeving van Van Appiah: leads, klanten, offertes, producten en portfolio in één luxueus dashboard.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Van Appiah — Intern Dashboard" },
      {
        property: "og:description",
        content: "Interne bedrijfsomgeving van Van Appiah.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const dashboardEnabled =
    import.meta.env.VITE_ENABLE_VA_DASHBOARD === "true";

  return (
    <main className="min-h-screen bg-[var(--va-ink)] font-sans text-white">
      {/* Hero */}
      <section className="border-b border-[var(--va-line)] bg-gradient-to-b from-[var(--va-surface)] to-[var(--va-ink)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-4 py-16">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-md border border-[var(--va-gold)]/60 bg-gradient-to-br from-[var(--va-gold)]/20 to-transparent font-display text-xl tracking-wider text-[var(--va-gold)]">
              VA
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--va-muted)]">
              Van Appiah · Intern
            </span>
          </div>
          <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">
            Bedrijfscockpit voor{" "}
            <span className="text-[var(--va-gold-soft)]">Van Appiah</span>
          </h1>
          <p className="max-w-2xl text-sm text-[var(--va-muted)]">
            Eén plek voor leads, klanten, offertes, productaanvragen en je portfolio.
            Verbonden met Google Sheets via Apps Script.
          </p>
        </div>
      </section>

      {/* Dashboard widget */}
      {dashboardEnabled ? (
        <VanAppiahDashboardWidget />
      ) : (
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-[var(--va-line)] bg-[var(--va-surface)]/40 p-8">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-md border border-[var(--va-gold)]/60 font-display text-lg text-[var(--va-gold)]">
              VA
            </div>
            <h2 className="font-display text-2xl text-white">
              Van Appiah Dashboard
            </h2>
            <p className="mt-2 text-sm text-[var(--va-muted)]">
              Het interne dashboard is momenteel uitgeschakeld. Zet{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-[var(--va-gold-soft)]">
                VITE_ENABLE_VA_DASHBOARD=true
              </code>{" "}
              in je <code>.env</code> om het te activeren.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
