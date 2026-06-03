import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message, ProductRequest, Quote } from "@/types/dashboard";
import { addQuote, updateStatus } from "@/lib/dashboard-api";
import {
  DashModal,
  EmptyState,
  Field,
  GhostBtn,
  PrimaryBtn,
  StatusBadge,
  formatDate,
  inputClass,
  useToast,
} from "./dash-ui";

type Mode = "messages" | "quotes" | "productRequests";

const SHEET: Record<Mode, string> = {
  messages: "Berichten",
  quotes: "Offertes",
  productRequests: "ProductAanvragen",
};

const STATUS_OPTIONS = ["Nieuw", "In behandeling", "Afgerond", "Geannuleerd"];

export function RequestManager({
  mode,
  items,
  adminCode,
}: {
  mode: Mode;
  items: Array<Message | Quote | ProductRequest>;
  adminCode: string;
}) {
  const qc = useQueryClient();
  const { show, node: toast } = useToast();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<any | null>(null);
  const [quoteForm, setQuoteForm] = useState<any | null>(null);

  const filtered = useMemo(
    () =>
      items.filter((m: any) => {
        if (!q) return true;
        const s = q.toLowerCase();
        return Object.values(m).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(s)
        );
      }),
    [items, q]
  );

  const invalidate = () => qc.invalidateQueries({ queryKey: ["van-appiah-dashboard"] });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateStatus(adminCode, SHEET[mode], id, status),
    onSuccess: () => {
      show("Status bijgewerkt");
      invalidate();
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  const createQuote = useMutation({
    mutationFn: (data: any) => addQuote(adminCode, data),
    onSuccess: () => {
      show("Offerte toegevoegd");
      setQuoteForm(null);
      invalidate();
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  const titleField = (it: any) =>
    it.Naam || it.Bedrijfsnaam || it.Product || "Onbekend";
  const subField = (it: any) => it.Email || it.Telefoon || "";

  return (
    <div className="space-y-4">
      {toast}
      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Zoeken..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={`${inputClass} flex-1 min-w-[200px]`}
        />
        {mode === "quotes" && (
          <PrimaryBtn onClick={() => setQuoteForm({})}>+ Offerte toevoegen</PrimaryBtn>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState>
          {mode === "messages"
            ? "Nog geen berichten."
            : mode === "quotes"
              ? "Geen nieuwe offertes."
              : "Geen productaanvragen."}
        </EmptyState>
      ) : (
        <div className="grid gap-2">
          {filtered.map((it: any, idx) => (
            <div
              key={it.ID || idx}
              className="rounded-lg border border-[var(--va-line)] bg-[var(--va-surface-2)]/40 p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <button
                  onClick={() => setOpen(it)}
                  className="text-left"
                >
                  <div className="font-medium text-white">{titleField(it)}</div>
                  <div className="text-xs text-[var(--va-muted)]">{subField(it)}</div>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--va-muted)]">
                    {formatDate(it.Datum)}
                  </span>
                  <StatusBadge status={it.Status} />
                  <select
                    value={it.Status || ""}
                    onChange={(e) =>
                      setStatus.mutate({ id: it.ID, status: e.target.value })
                    }
                    className={`${inputClass} py-1 text-xs`}
                  >
                    <option value="">— status —</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DashModal
        open={!!open}
        onClose={() => setOpen(null)}
        title="Details"
        wide
      >
        {open && (
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Object.entries(open).map(([k, v]) => (
              <div key={k} className="rounded-md bg-white/5 p-2">
                <dt className="text-[11px] uppercase tracking-wider text-[var(--va-muted)]">
                  {k}
                </dt>
                <dd className="break-words text-sm text-white">{String(v ?? "—")}</dd>
              </div>
            ))}
          </dl>
        )}
      </DashModal>

      <DashModal
        open={!!quoteForm}
        onClose={() => setQuoteForm(null)}
        title="Nieuwe offerte"
        wide
        footer={
          <>
            <GhostBtn onClick={() => setQuoteForm(null)}>Annuleer</GhostBtn>
            <PrimaryBtn
              onClick={() => quoteForm && createQuote.mutate(quoteForm)}
              disabled={createQuote.isPending}
            >
              {createQuote.isPending ? "Opslaan..." : "Opslaan"}
            </PrimaryBtn>
          </>
        }
      >
        {quoteForm && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Naam", "Naam"],
              ["Bedrijfsnaam", "Bedrijfsnaam"],
              ["Email", "Email"],
              ["Telefoon", "Telefoon"],
              ["Gewenste dienst", "GewensteDienst"],
              ["Budget", "Budget"],
            ].map(([label, key]) => (
              <Field key={key} label={label}>
                <input
                  className={inputClass}
                  value={quoteForm[key] || ""}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, [key]: e.target.value })
                  }
                />
              </Field>
            ))}
            <Field label="Projectbeschrijving" full>
              <textarea
                rows={3}
                className={inputClass}
                value={quoteForm.Projectbeschrijving || ""}
                onChange={(e) =>
                  setQuoteForm({ ...quoteForm, Projectbeschrijving: e.target.value })
                }
              />
            </Field>
          </div>
        )}
      </DashModal>
    </div>
  );
}
