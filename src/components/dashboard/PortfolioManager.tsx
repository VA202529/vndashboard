import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PortfolioItem } from "@/types/dashboard";
import { addPortfolio, updatePortfolio } from "@/lib/dashboard-api";
import {
  DashModal,
  EmptyState,
  Field,
  GhostBtn,
  PrimaryBtn,
  inputClass,
  useToast,
} from "./dash-ui";

const empty: Partial<PortfolioItem> = {
  titel: "",
  slug: "",
  beschrijving: "",
  klantnaam: "",
  categorie: "",
  zichtbaar: true,
  volgorde: 0,
};

const truthy = (v: any) =>
  v === true || v === "true" || v === 1 || v === "1" || v === "JA" || v === "Ja";

export function PortfolioManager({
  items,
  adminCode,
}: {
  items: PortfolioItem[];
  adminCode: string;
}) {
  const qc = useQueryClient();
  const { show, node: toast } = useToast();
  const [editing, setEditing] = useState<Partial<PortfolioItem> | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["van-appiah-dashboard"] });

  const save = useMutation({
    mutationFn: (data: Partial<PortfolioItem>) =>
      data.ID ? updatePortfolio(adminCode, data) : addPortfolio(adminCode, data),
    onSuccess: () => {
      show("Portfolio-item opgeslagen");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  const toggle = (p: PortfolioItem) =>
    save.mutate({ ...p, zichtbaar: !truthy(p.zichtbaar) });

  return (
    <div className="space-y-4">
      {toast}
      <div className="flex justify-end">
        <PrimaryBtn onClick={() => setEditing({ ...empty })}>+ Nieuw item</PrimaryBtn>
      </div>

      {items.length === 0 ? (
        <EmptyState>Nog geen portfolio-items.</EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[...items]
            .sort((a, b) => Number(a.volgorde || 0) - Number(b.volgorde || 0))
            .map((p) => (
              <div
                key={p.ID || p.slug}
                className="rounded-xl border border-[var(--va-line)] bg-[var(--va-surface-2)]/40 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-lg text-white">{p.titel}</div>
                    <div className="text-xs text-[var(--va-muted)]">
                      {p.klantnaam} · {p.categorie}
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(p)}
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      truthy(p.zichtbaar)
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-white/10 text-[var(--va-muted)]"
                    }`}
                  >
                    {truthy(p.zichtbaar) ? "Zichtbaar" : "Verborgen"}
                  </button>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--va-muted)]">
                  {p.beschrijving}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setEditing(p)}
                    className="text-xs text-white/80 hover:text-white"
                  >
                    Bewerken
                  </button>
                  <button
                    onClick={() =>
                      save.mutate({ ...p, volgorde: Number(p.volgorde || 0) - 1 })
                    }
                    className="text-xs text-[var(--va-gold-soft)] hover:text-[var(--va-gold)]"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() =>
                      save.mutate({ ...p, volgorde: Number(p.volgorde || 0) + 1 })
                    }
                    className="text-xs text-[var(--va-gold-soft)] hover:text-[var(--va-gold)]"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      <DashModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.ID ? "Portfolio bewerken" : "Nieuw portfolio-item"}
        wide
        footer={
          <>
            <GhostBtn onClick={() => setEditing(null)}>Annuleer</GhostBtn>
            <PrimaryBtn
              onClick={() => editing && save.mutate(editing)}
              disabled={save.isPending}
            >
              {save.isPending ? "Opslaan..." : "Opslaan"}
            </PrimaryBtn>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Titel", "titel"],
              ["Slug", "slug"],
              ["Klantnaam", "klantnaam"],
              ["Categorie", "categorie"],
              ["Volgorde", "volgorde"],
            ].map(([label, key]) => (
              <Field key={key} label={label}>
                <input
                  className={inputClass}
                  value={(editing as any)[key] ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, [key]: e.target.value } as any)
                  }
                />
              </Field>
            ))}
            <Field label="Zichtbaar">
              <select
                className={inputClass}
                value={truthy(editing.zichtbaar) ? "true" : "false"}
                onChange={(e) =>
                  setEditing({ ...editing, zichtbaar: e.target.value === "true" })
                }
              >
                <option value="true">Zichtbaar</option>
                <option value="false">Verborgen</option>
              </select>
            </Field>
            <Field label="Beschrijving" full>
              <textarea
                rows={3}
                className={inputClass}
                value={editing.beschrijving || ""}
                onChange={(e) => setEditing({ ...editing, beschrijving: e.target.value })}
              />
            </Field>
          </div>
        )}
      </DashModal>
    </div>
  );
}
