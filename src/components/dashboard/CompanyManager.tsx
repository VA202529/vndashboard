import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyInfo } from "@/types/dashboard";
import { saveCompany } from "@/lib/dashboard-api";
import {
  Field,
  GhostBtn,
  PrimaryBtn,
  inputClass,
  useToast,
} from "./dash-ui";

export function CompanyManager({
  company,
  adminCode,
}: {
  company: CompanyInfo | undefined;
  adminCode: string;
}) {
  const qc = useQueryClient();
  const { show, node: toast } = useToast();
  const [form, setForm] = useState<CompanyInfo>(company || {});

  useEffect(() => {
    if (company) setForm(company);
  }, [company]);

  const save = useMutation({
    mutationFn: (data: CompanyInfo) => saveCompany(adminCode, data),
    onSuccess: () => {
      show("Bedrijfsgegevens opgeslagen");
      qc.invalidateQueries({ queryKey: ["van-appiah-dashboard"] });
    },
    onError: (e: Error) => show(e.message, "err"),
  });

  const fields: Array<[string, keyof CompanyInfo, boolean?]> = [
    ["Bedrijfsnaam", "bedrijfsnaam"],
    ["Slogan", "slogan"],
    ["Telefoonnummer", "telefoonnummer"],
    ["Adres", "adres"],
    ["Email 1", "email_1"],
    ["Email 2", "email_2"],
    ["Email 3", "email_3"],
    ["Openingstijd 1", "openingstijd_1"],
    ["Openingstijd 2", "openingstijd_2"],
    ["Openingstijd 3", "openingstijd_3"],
    ["Instagram", "instagram"],
    ["TikTok", "tiktok"],
    ["LinkedIn", "linkedin"],
    ["Website", "website"],
  ];

  return (
    <div className="space-y-4">
      {toast}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(([label, key]) => (
          <Field key={String(key)} label={label}>
            <input
              className={inputClass}
              value={(form as any)[key] || ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </Field>
        ))}
        <Field label="Beschrijving" full>
          <textarea
            rows={3}
            className={inputClass}
            value={form.beschrijving || ""}
            onChange={(e) => setForm({ ...form, beschrijving: e.target.value })}
          />
        </Field>
        <Field label="Actief">
          <select
            className={inputClass}
            value={
              form.actief === true || form.actief === "true" || form.actief === "Ja"
                ? "true"
                : "false"
            }
            onChange={(e) => setForm({ ...form, actief: e.target.value === "true" })}
          >
            <option value="true">Actief</option>
            <option value="false">Inactief</option>
          </select>
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <GhostBtn onClick={() => company && setForm(company)}>Annuleer</GhostBtn>
        <PrimaryBtn onClick={() => save.mutate(form)} disabled={save.isPending}>
          {save.isPending ? "Opslaan..." : "Wijzigingen opslaan"}
        </PrimaryBtn>
      </div>
    </div>
  );
}
