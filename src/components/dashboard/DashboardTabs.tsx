import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DashboardResponse } from "@/types/dashboard";
import { ensureMediaFolders } from "@/lib/dashboard-api";
import { DashboardStats } from "./DashboardStats";
import { LeadManager } from "./LeadManager";
import { ClientManager } from "./ClientManager";
import { RequestManager } from "./RequestManager";
import { ProductManager } from "./ProductManager";
import { PortfolioManager } from "./PortfolioManager";
import { CompanyManager } from "./CompanyManager";
import {
  GhostBtn,
  PrimaryBtn,
  SectionCard,
  StatusBadge,
  formatDate,
  formatMoney,
  useToast,
} from "./dash-ui";

const TABS = [
  "Overzicht",
  "Leads",
  "Klanten",
  "Berichten",
  "Offertes",
  "Productaanvragen",
  "Producten",
  "Portfolio",
  "Bedrijfsgegevens",
] as const;
type Tab = (typeof TABS)[number];

const truthy = (v: any) =>
  v === true || v === "true" || v === 1 || v === "1" || v === "JA" || v === "Ja";

export function DashboardTabs({
  data,
  adminCode,
  onJumpTab,
}: {
  data: DashboardResponse;
  adminCode: string;
  onJumpTab?: (t: Tab) => void;
}) {
  const [tab, setTab] = useState<Tab>("Overzicht");
  const qc = useQueryClient();
  const { show, node: toast } = useToast();

  const leads = data.leads || [];
  const clients = data.klanten || [];
  const messages = data.berichten || [];
  const quotes = data.offertes || [];
  const requests = data.productAanvragen || [];
  const products = data.producten || [];
  const portfolio = data.portfolio || [];
  const subs = data.nieuwsbrief || [];

  const stats = [
    { label: "Nieuwe berichten", value: messages.filter((m) => /nieuw/i.test(m.Status || "")).length || messages.length },
    { label: "Nieuwe offertes", value: quotes.filter((q) => /nieuw/i.test(q.Status || "")).length || quotes.length },
    { label: "Productaanvragen", value: requests.length },
    { label: "Leads", value: leads.length },
    { label: "Klanten", value: clients.length },
    { label: "Nieuwsbrief", value: subs.filter((s) => truthy(s.Status) || /actie|actief/i.test(s.Status || "")).length || subs.length },
    { label: "Producten zichtbaar", value: products.filter((p) => truthy(p.zichtbaar)).length },
    { label: "Portfolio zichtbaar", value: portfolio.filter((p) => truthy(p.zichtbaar)).length },
  ];

  const folders = useMutation({
    mutationFn: () => ensureMediaFolders(adminCode),
    onSuccess: () => {
      show("Media mappen gecontroleerd");
      qc.invalidateQueries({ queryKey: ["van-appiah-dashboard"] });
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  const goto = (t: Tab) => {
    setTab(t);
    onJumpTab?.(t);
  };

  return (
    <div className="space-y-5">
      {toast}
      {/* Tab nav */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 border-b border-[var(--va-line)]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap px-3 py-2 text-sm transition ${
                tab === t
                  ? "border-b-2 border-[var(--va-gold)] text-[var(--va-gold-soft)]"
                  : "text-[var(--va-muted)] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Overzicht" && (
        <div className="space-y-5">
          <DashboardStats items={stats} />
          <div className="grid gap-4 lg:grid-cols-3">
            <SectionCard title="Laatste berichten">
              <List
                items={messages.slice(-5).reverse()}
                primary={(m) => m.Naam}
                secondary={(m) => m.Onderwerp}
                status={(m) => m.Status}
                date={(m) => m.Datum}
                empty="Nog geen berichten."
              />
            </SectionCard>
            <SectionCard title="Laatste offertes">
              <List
                items={quotes.slice(-5).reverse()}
                primary={(q) => q.Naam || q.Bedrijfsnaam}
                secondary={(q) => q.GewensteDienst}
                status={(q) => q.Status}
                date={(q) => q.Datum}
                empty="Geen nieuwe offertes."
              />
            </SectionCard>
            <SectionCard title="Laatste leads">
              <List
                items={leads.slice(-5).reverse()}
                primary={(l) => l.Bedrijfsnaam}
                secondary={(l) => l.Contactpersoon}
                status={(l) => l.Status}
                date={(l) => l.AangemaaktOp}
                empty="Nog geen leads."
              />
            </SectionCard>
          </div>

          <SectionCard title="Openstaande klantbetalingen">
            {(() => {
              const open = clients.filter((c) => Number(c.NogTeBetalen) > 0);
              if (open.length === 0)
                return <p className="text-sm text-[var(--va-muted)]">Alles is betaald. ✓</p>;
              return (
                <ul className="divide-y divide-[var(--va-line)]">
                  {open.map((c) => (
                    <li
                      key={c.ID}
                      className="flex flex-wrap items-center justify-between gap-2 py-2"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">
                          {c.Klantnaam || c.Bedrijfsnaam}
                        </div>
                        <div className="text-xs text-[var(--va-muted)]">{c.Email}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-amber-300">
                          {formatMoney(c.NogTeBetalen)} open
                        </span>
                        <StatusBadge status={c.BetaalStatus} />
                      </div>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </SectionCard>

          <SectionCard title="Snelle acties">
            <div className="flex flex-wrap gap-2">
              <PrimaryBtn onClick={() => goto("Leads")}>Nieuwe lead</PrimaryBtn>
              <PrimaryBtn onClick={() => goto("Klanten")}>Nieuwe klant</PrimaryBtn>
              <PrimaryBtn onClick={() => goto("Offertes")}>Nieuwe offerte</PrimaryBtn>
              <GhostBtn onClick={() => folders.mutate()}>
                {folders.isPending ? "Controleren..." : "Media mappen controleren"}
              </GhostBtn>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "Leads" && <LeadManager leads={leads} adminCode={adminCode} />}
      {tab === "Klanten" && <ClientManager clients={clients} adminCode={adminCode} />}
      {tab === "Berichten" && (
        <RequestManager mode="messages" items={messages} adminCode={adminCode} />
      )}
      {tab === "Offertes" && (
        <RequestManager mode="quotes" items={quotes} adminCode={adminCode} />
      )}
      {tab === "Productaanvragen" && (
        <RequestManager
          mode="productRequests"
          items={requests}
          adminCode={adminCode}
        />
      )}
      {tab === "Producten" && (
        <ProductManager products={products} adminCode={adminCode} />
      )}
      {tab === "Portfolio" && (
        <PortfolioManager items={portfolio} adminCode={adminCode} />
      )}
      {tab === "Bedrijfsgegevens" && (
        <CompanyManager company={data.bedrijfsgegevens} adminCode={adminCode} />
      )}
    </div>
  );
}

function List<T extends Record<string, any>>({
  items,
  primary,
  secondary,
  status,
  date,
  empty,
}: {
  items: T[];
  primary: (it: T) => any;
  secondary: (it: T) => any;
  status: (it: T) => string | undefined;
  date: (it: T) => any;
  empty: string;
}) {
  if (items.length === 0)
    return <p className="text-sm text-[var(--va-muted)]">{empty}</p>;
  return (
    <ul className="divide-y divide-[var(--va-line)]">
      {items.map((it, i) => (
        <li key={i} className="flex items-start justify-between gap-2 py-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">
              {primary(it) || "—"}
            </div>
            <div className="truncate text-xs text-[var(--va-muted)]">
              {secondary(it) || ""}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={status(it)} />
            <span className="text-[10px] text-[var(--va-muted)]">
              {formatDate(date(it))}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
