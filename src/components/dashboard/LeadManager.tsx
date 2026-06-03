import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Lead } from "@/types/dashboard";
import {
  addLead,
  deleteLead,
  previewLeadEmail,
  sendLeadEmail,
  updateLead,
} from "@/lib/dashboard-api";
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

const empty: Partial<Lead> = {
  Bedrijfsnaam: "",
  Contactpersoon: "",
  Email: "",
  Telefoonnummer: "",
  Website: "",
  ProductInteresse: "",
  PortfolioVoorbeeld: "",
  Status: "Nieuw",
  TypeMail: "A",
  VolgendeActieDatum: "",
  Notities: "",
};

export function LeadManager({
  leads,
  adminCode,
}: {
  leads: Lead[];
  adminCode: string;
}) {
  const qc = useQueryClient();
  const { show, node: toast } = useToast();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<Partial<Lead> | null>(null);
  const [preview, setPreview] = useState<{ open: boolean; html?: string; lead?: Partial<Lead> }>({
    open: false,
  });

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchQ =
        !q ||
        (l.Bedrijfsnaam || "").toLowerCase().includes(q.toLowerCase()) ||
        (l.Email || "").toLowerCase().includes(q.toLowerCase());
      const matchS = !statusFilter || l.Status === statusFilter;
      return matchQ && matchS;
    });
  }, [leads, q, statusFilter]);

  const statuses = useMemo(
    () => Array.from(new Set(leads.map((l) => l.Status).filter(Boolean))) as string[],
    [leads]
  );

  const invalidate = () => qc.invalidateQueries({ queryKey: ["van-appiah-dashboard"] });

  const save = useMutation({
    mutationFn: (data: Partial<Lead>) =>
      data.ID ? updateLead(adminCode, data) : addLead(adminCode, data),
    onSuccess: () => {
      show("Lead opgeslagen");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteLead(adminCode, id),
    onSuccess: () => {
      show("Lead verwijderd");
      invalidate();
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  const doPreview = useMutation({
    mutationFn: (data: Partial<Lead>) => previewLeadEmail(adminCode, data),
    onSuccess: (res: any, vars) => {
      setPreview({ open: true, html: res?.html || res?.preview || res?.body || JSON.stringify(res), lead: vars });
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  const doSend = useMutation({
    mutationFn: (data: Partial<Lead>) => sendLeadEmail(adminCode, data),
    onSuccess: () => {
      show("Mail verzonden");
      setPreview({ open: false });
      invalidate();
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  return (
    <div className="space-y-4">
      {toast}
      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Zoek op bedrijf of e-mail"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={`${inputClass} flex-1 min-w-[200px]`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">Alle statussen</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <PrimaryBtn onClick={() => setEditing({ ...empty })}>+ Nieuwe lead</PrimaryBtn>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>Nog geen leads gevonden.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--va-line)]">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--va-ink)]/60 text-left text-xs uppercase tracking-wider text-[var(--va-muted)]">
              <tr>
                <th className="px-3 py-2">Bedrijf</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Mail</th>
                <th className="px-3 py-2">Volgende actie</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--va-line)]">
              {filtered.map((l) => (
                <tr key={l.ID} className="hover:bg-white/5">
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{l.Bedrijfsnaam || "—"}</div>
                    <div className="text-xs text-[var(--va-muted)]">{l.Email}</div>
                  </td>
                  <td className="px-3 py-2 text-[var(--va-muted)]">
                    {l.Contactpersoon || "—"}
                  </td>
                  <td className="px-3 py-2"><StatusBadge status={l.Status} /></td>
                  <td className="px-3 py-2">
                    <span className="rounded-full border border-[var(--va-gold)]/40 px-2 py-0.5 text-[11px] text-[var(--va-gold-soft)]">
                      Type {l.TypeMail || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[var(--va-muted)]">
                    {formatDate(l.VolgendeActieDatum)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => doPreview.mutate(l)}
                        className="text-xs text-[var(--va-gold-soft)] hover:text-[var(--va-gold)]"
                      >
                        Mail preview
                      </button>
                      <button
                        onClick={() => setEditing(l)}
                        className="text-xs text-white/80 hover:text-white"
                      >
                        Bewerken
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Lead ${l.Bedrijfsnaam || l.ID} verwijderen?`))
                            remove.mutate(l.ID);
                        }}
                        className="text-xs text-rose-300 hover:text-rose-200"
                      >
                        Verwijderen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DashModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.ID ? "Lead bewerken" : "Nieuwe lead"}
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
            <Field label="Bedrijfsnaam">
              <input
                className={inputClass}
                value={editing.Bedrijfsnaam || ""}
                onChange={(e) => setEditing({ ...editing, Bedrijfsnaam: e.target.value })}
              />
            </Field>
            <Field label="Contactpersoon">
              <input
                className={inputClass}
                value={editing.Contactpersoon || ""}
                onChange={(e) => setEditing({ ...editing, Contactpersoon: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <input
                className={inputClass}
                value={editing.Email || ""}
                onChange={(e) => setEditing({ ...editing, Email: e.target.value })}
              />
            </Field>
            <Field label="Telefoonnummer">
              <input
                className={inputClass}
                value={editing.Telefoonnummer || ""}
                onChange={(e) => setEditing({ ...editing, Telefoonnummer: e.target.value })}
              />
            </Field>
            <Field label="Website">
              <input
                className={inputClass}
                value={editing.Website || ""}
                onChange={(e) => setEditing({ ...editing, Website: e.target.value })}
              />
            </Field>
            <Field label="Product interesse">
              <input
                className={inputClass}
                value={editing.ProductInteresse || ""}
                onChange={(e) => setEditing({ ...editing, ProductInteresse: e.target.value })}
              />
            </Field>
            <Field label="Portfolio voorbeeld">
              <input
                className={inputClass}
                value={editing.PortfolioVoorbeeld || ""}
                onChange={(e) => setEditing({ ...editing, PortfolioVoorbeeld: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <input
                className={inputClass}
                value={editing.Status || ""}
                onChange={(e) => setEditing({ ...editing, Status: e.target.value })}
              />
            </Field>
            <Field label="Type mail (A/B)">
              <select
                className={inputClass}
                value={editing.TypeMail || "A"}
                onChange={(e) => setEditing({ ...editing, TypeMail: e.target.value })}
              >
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </Field>
            <Field label="Volgende actie datum">
              <input
                type="date"
                className={inputClass}
                value={(editing.VolgendeActieDatum || "").toString().slice(0, 10)}
                onChange={(e) => setEditing({ ...editing, VolgendeActieDatum: e.target.value })}
              />
            </Field>
            <Field label="Notities" full>
              <textarea
                rows={3}
                className={inputClass}
                value={editing.Notities || ""}
                onChange={(e) => setEditing({ ...editing, Notities: e.target.value })}
              />
            </Field>
            {editing.ID && (
              <div className="sm:col-span-2 flex justify-start">
                <GhostBtn onClick={() => doPreview.mutate(editing)}>Mail preview</GhostBtn>
              </div>
            )}
          </div>
        )}
      </DashModal>

      <DashModal
        open={preview.open}
        onClose={() => setPreview({ open: false })}
        title="Mail preview"
        wide
        footer={
          <>
            <GhostBtn onClick={() => setPreview({ open: false })}>Sluiten</GhostBtn>
            <PrimaryBtn
              onClick={() => preview.lead && doSend.mutate(preview.lead)}
              disabled={doSend.isPending}
            >
              {doSend.isPending ? "Verzenden..." : "Verzenden"}
            </PrimaryBtn>
          </>
        }
      >
        <div
          className="prose prose-invert max-h-[60vh] overflow-y-auto rounded-md bg-white/5 p-4 text-sm"
          dangerouslySetInnerHTML={{ __html: preview.html || "<em>Geen preview beschikbaar.</em>" }}
        />
      </DashModal>
    </div>
  );
}
