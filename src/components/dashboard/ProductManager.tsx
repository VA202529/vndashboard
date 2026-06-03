import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@/types/dashboard";
import { addProduct, updateProduct } from "@/lib/dashboard-api";
import {
  DashModal,
  EmptyState,
  Field,
  GhostBtn,
  PrimaryBtn,
  formatMoney,
  inputClass,
  useToast,
} from "./dash-ui";

const empty: Partial<Product> = {
  titel: "",
  slug: "",
  beschrijving: "",
  categorie: "",
  prijs_vanaf: 0,
  onderhoud_eenmalig: 0,
  onderhoud_per_maand: 0,
  onderhoud_uitleg: "",
  zichtbaar: true,
  volgorde: 0,
};

const truthy = (v: any) =>
  v === true || v === "true" || v === 1 || v === "1" || v === "JA" || v === "Ja";

export function ProductManager({
  products,
  adminCode,
}: {
  products: Product[];
  adminCode: string;
}) {
  const qc = useQueryClient();
  const { show, node: toast } = useToast();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["van-appiah-dashboard"] });

  const save = useMutation({
    mutationFn: (data: Partial<Product>) =>
      data.ID ? updateProduct(adminCode, data) : addProduct(adminCode, data),
    onSuccess: () => {
      show("Product opgeslagen");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  const toggleVisible = (p: Product) =>
    save.mutate({ ...p, zichtbaar: !truthy(p.zichtbaar) });

  return (
    <div className="space-y-4">
      {toast}
      <div className="flex justify-end">
        <PrimaryBtn onClick={() => setEditing({ ...empty })}>+ Nieuw product</PrimaryBtn>
      </div>

      {products.length === 0 ? (
        <EmptyState>Nog geen producten.</EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[...products]
            .sort((a, b) => Number(a.volgorde || 0) - Number(b.volgorde || 0))
            .map((p) => (
              <div
                key={p.ID || p.slug}
                className="rounded-xl border border-[var(--va-line)] bg-[var(--va-surface-2)]/40 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-lg text-white">{p.titel}</div>
                    <div className="text-xs text-[var(--va-muted)]">{p.categorie}</div>
                  </div>
                  <button
                    onClick={() => toggleVisible(p)}
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      truthy(p.zichtbaar)
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-white/10 text-[var(--va-muted)]"
                    }`}
                  >
                    {truthy(p.zichtbaar) ? "Zichtbaar" : "Verborgen"}
                  </button>
                </div>
                <div className="mt-2 line-clamp-2 text-sm text-[var(--va-muted)]">
                  {p.beschrijving}
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--va-muted)]">
                  <span>Vanaf {formatMoney(p.prijs_vanaf)}</span>
                  <span>·</span>
                  <span>Onderhoud {formatMoney(p.onderhoud_per_maand)}/mnd</span>
                  <span>·</span>
                  <span>Volgorde {p.volgorde ?? 0}</span>
                </div>
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
                  {p.driveFolderId && (
                    <span className="ml-auto text-[10px] text-[var(--va-muted)]/70">
                      📁 {p.mapNaam || p.driveFolderId.slice(0, 6)}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      <DashModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.ID ? "Product bewerken" : "Nieuw product"}
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
              ["Categorie", "categorie"],
              ["Prijs vanaf", "prijs_vanaf"],
              ["Onderhoud eenmalig", "onderhoud_eenmalig"],
              ["Onderhoud per maand", "onderhoud_per_maand"],
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
            <Field label="Onderhoud uitleg" full>
              <textarea
                rows={2}
                className={inputClass}
                value={editing.onderhoud_uitleg || ""}
                onChange={(e) =>
                  setEditing({ ...editing, onderhoud_uitleg: e.target.value })
                }
              />
            </Field>
          </div>
        )}
      </DashModal>
    </div>
  );
}
