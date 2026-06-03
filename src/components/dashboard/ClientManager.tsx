import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Client } from "@/types/dashboard";
import {
  addClient,
  deleteClient,
  sendClientPaymentEmail,
  sendClientUpdateEmail,
  updateClient,
} from "@/lib/dashboard-api";
import {
  DashModal,
  EmptyState,
  Field,
  GhostBtn,
  PrimaryBtn,
  StatusBadge,
  formatMoney,
  inputClass,
  useToast,
} from "./dash-ui";

const empty: Partial<Client> = {
  Klantnaam: "",
  Bedrijfsnaam: "",
  Contactpersoon: "",
  Email: "",
  Telefoonnummer: "",
  ProjectType: "",
  ProjectBeschrijving: "",
  GedaanWerk: "",
  WebsiteOfSysteemKostenTotaal: 0,
  BetaaldBedrag: 0,
  NogTeBetalen: 0,
  OnderhoudPerMaand: 0,
  OnderhoudBetaaldTot: "",
  TikkieLinkDezeMaand: "",
  BetaalStatus: "Openstaand",
  Notities: "",
};

export function ClientManager({
  clients,
  adminCode,
}: {
  clients: Client[];
  adminCode: string;
}) {
  const qc = useQueryClient();
  const { show, node: toast } = useToast();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Client> | null>(null);

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          !q ||
          (c.Klantnaam || "").toLowerCase().includes(q.toLowerCase()) ||
          (c.Bedrijfsnaam || "").toLowerCase().includes(q.toLowerCase()) ||
          (c.Email || "").toLowerCase().includes(q.toLowerCase())
      ),
    [clients, q]
  );

  const invalidate = () => qc.invalidateQueries({ queryKey: ["van-appiah-dashboard"] });

  const save = useMutation({
    mutationFn: (data: Partial<Client>) =>
      data.ID ? updateClient(adminCode, data) : addClient(adminCode, data),
    onSuccess: () => {
      show("Klant opgeslagen");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteClient(adminCode, id),
    onSuccess: () => {
      show("Klant verwijderd");
      invalidate();
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  const sendUpdate = useMutation({
    mutationFn: (id: string) => sendClientUpdateEmail(adminCode, id),
    onSuccess: () => show("Update mail verzonden"),
    onError: (e: Error) => show(e.message, "err"),
  });

  const sendPay = useMutation({
    mutationFn: (id: string) => sendClientPaymentEmail(adminCode, id),
    onSuccess: () => show("Betaalmail verzonden"),
    onError: (e: Error) => show(e.message, "err"),
  });

  return (
    <div className="space-y-4">
      {toast}
      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Zoek op klant of bedrijf"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={`${inputClass} flex-1 min-w-[200px]`}
        />
        <PrimaryBtn onClick={() => setEditing({ ...empty })}>+ Nieuwe klant</PrimaryBtn>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>Nog geen klanten toegevoegd.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const owes = Number(c.NogTeBetalen) > 0;
            return (
              <div
                key={c.ID}
                className={`rounded-xl border p-4 transition ${
                  owes
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-[var(--va-line)] bg-[var(--va-surface-2)]/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-lg text-white">
                      {c.Klantnaam || c.Bedrijfsnaam || "Klant"}
                    </div>
                    <div className="text-xs text-[var(--va-muted)]">{c.Bedrijfsnaam}</div>
                  </div>
                  <StatusBadge status={c.BetaalStatus} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Info label="Betaald" value={formatMoney(c.BetaaldBedrag)} />
                  <Info
                    label="Nog te betalen"
                    value={formatMoney(c.NogTeBetalen)}
                    accent={owes}
                  />
                  <Info label="Onderhoud/mnd" value={formatMoney(c.OnderhoudPerMaand)} />
                  <Info label="Totaal" value={formatMoney(c.WebsiteOfSysteemKostenTotaal)} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setEditing(c)}
                    className="text-xs text-white/80 hover:text-white"
                  >
                    Bewerken
                  </button>
                  <button
                    onClick={() => sendUpdate.mutate(c.ID)}
                    className="text-xs text-[var(--va-gold-soft)] hover:text-[var(--va-gold)]"
                  >
                    Update mail
                  </button>
                  <button
                    onClick={() => sendPay.mutate(c.ID)}
                    className="text-xs text-[var(--va-gold-soft)] hover:text-[var(--va-gold)]"
                  >
                    Betaalmail
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Klant ${c.Klantnaam || c.ID} verwijderen?`))
                        remove.mutate(c.ID);
                    }}
                    className="ml-auto text-xs text-rose-300 hover:text-rose-200"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DashModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.ID ? "Klant bewerken" : "Nieuwe klant"}
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
              ["Klantnaam", "Klantnaam"],
              ["Bedrijfsnaam", "Bedrijfsnaam"],
              ["Contactpersoon", "Contactpersoon"],
              ["Email", "Email"],
              ["Telefoonnummer", "Telefoonnummer"],
              ["Project type", "ProjectType"],
              ["Totaal kosten", "WebsiteOfSysteemKostenTotaal"],
              ["Betaald bedrag", "BetaaldBedrag"],
              ["Nog te betalen", "NogTeBetalen"],
              ["Onderhoud per maand", "OnderhoudPerMaand"],
              ["Onderhoud betaald tot", "OnderhoudBetaaldTot"],
              ["Tikkie link deze maand", "TikkieLinkDezeMaand"],
              ["Betaalstatus", "BetaalStatus"],
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
            <Field label="Project beschrijving" full>
              <textarea
                rows={2}
                className={inputClass}
                value={editing.ProjectBeschrijving || ""}
                onChange={(e) =>
                  setEditing({ ...editing, ProjectBeschrijving: e.target.value })
                }
              />
            </Field>
            <Field label="Gedaan werk" full>
              <textarea
                rows={2}
                className={inputClass}
                value={editing.GedaanWerk || ""}
                onChange={(e) => setEditing({ ...editing, GedaanWerk: e.target.value })}
              />
            </Field>
            <Field label="Notities" full>
              <textarea
                rows={2}
                className={inputClass}
                value={editing.Notities || ""}
                onChange={(e) => setEditing({ ...editing, Notities: e.target.value })}
              />
            </Field>
          </div>
        )}
      </DashModal>
    </div>
  );
}

function Info({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md bg-[var(--va-ink)]/50 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-[var(--va-muted)]">
        {label}
      </div>
      <div className={`text-sm font-medium ${accent ? "text-amber-300" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}
