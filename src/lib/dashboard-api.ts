import type { DashboardResponse } from "@/types/dashboard";

export const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxjN8mHsT_OJnGHuxzErclU25OGyfxG7DnbSxUYbfGphSrHUY2zKIh7gfBRnmiis8Xl/exec";

export const ADMIN_CODE_KEY = "va_dashboard_admin_code";

export function getStoredAdminCode(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ADMIN_CODE_KEY);
}

export function setStoredAdminCode(code: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ADMIN_CODE_KEY, code);
}

export function clearStoredAdminCode() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ADMIN_CODE_KEY);
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Geen geldig antwoord van de server. Probeer het opnieuw of controleer de admin code."
    );
  }
}

/** GET request (used for read actions). Apps Script accepts GET with action in querystring. */
async function apiGet<T = any>(
  action: string,
  params: Record<string, string> = {}
): Promise<T> {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const url = `${WEB_APP_URL}?${qs}`;
  const res = await fetch(url, { method: "GET", redirect: "follow" });
  if (!res.ok) throw new Error(`Serverfout (${res.status})`);
  const data = await safeJson(res);
  if (data && data.ok === false) {
    throw new Error(data.error || "Onbekende serverfout");
  }
  return data as T;
}

/**
 * POST request to Apps Script.
 * text/plain avoids CORS preflight (Apps Script supports doPost with e.postData.contents).
 */
async function apiPost<T = any>(payload: Record<string, any>): Promise<T> {
  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Serverfout (${res.status})`);
  const data = await safeJson(res);
  if (data && data.ok === false) {
    throw new Error(data.error || "Onbekende serverfout");
  }
  return data as T;
}

// ===== Dashboard data =====
export function getAdminData(adminCode: string) {
  return apiGet<DashboardResponse>("getAdminData", { adminCode });
}

// ===== Leads =====
export const addLead = (adminCode: string, data: any) =>
  apiPost({ action: "addLead", adminCode, data });
export const updateLead = (adminCode: string, data: any) =>
  apiPost({ action: "updateLead", adminCode, data });
export const deleteLead = (adminCode: string, ID: string) =>
  apiPost({ action: "deleteLead", adminCode, data: { ID } });
export const previewLeadEmail = (adminCode: string, data: any) =>
  apiPost({ action: "previewLeadEmail", adminCode, data });
export const sendLeadEmail = (adminCode: string, data: any) =>
  apiPost({ action: "sendLeadEmail", adminCode, data });

// ===== Clients =====
export const addClient = (adminCode: string, data: any) =>
  apiPost({ action: "addClient", adminCode, data });
export const updateClient = (adminCode: string, data: any) =>
  apiPost({ action: "updateClient", adminCode, data });
export const deleteClient = (adminCode: string, ID: string) =>
  apiPost({ action: "deleteClient", adminCode, data: { ID } });
export const sendClientUpdateEmail = (adminCode: string, ID: string) =>
  apiPost({ action: "sendClientUpdateEmail", adminCode, data: { ID } });
export const sendClientPaymentEmail = (adminCode: string, ID: string) =>
  apiPost({ action: "sendClientPaymentEmail", adminCode, data: { ID } });

// ===== Status update (Berichten, Offertes, ProductAanvragen, ...) =====
export const updateStatus = (
  adminCode: string,
  sheetName: string,
  id: string,
  status: string
) =>
  apiPost({
    action: "updateStatus",
    adminCode,
    data: { sheetName, id, status },
  });

// ===== Company =====
export const saveCompany = (adminCode: string, data: any) =>
  apiPost({ action: "saveCompany", adminCode, data });

// ===== Products =====
export const addProduct = (adminCode: string, data: any) =>
  apiPost({ action: "addProduct", adminCode, data });
export const updateProduct = (adminCode: string, data: any) =>
  apiPost({ action: "updateProduct", adminCode, data });

// ===== Portfolio =====
export const addPortfolio = (adminCode: string, data: any) =>
  apiPost({ action: "addPortfolio", adminCode, data });
export const updatePortfolio = (adminCode: string, data: any) =>
  apiPost({ action: "updatePortfolio", adminCode, data });

// ===== Misc =====
export const addQuote = (adminCode: string, data: any) =>
  apiPost({ action: "addQuote", adminCode, data });
export const addSubscriber = (adminCode: string, data: any) =>
  apiPost({ action: "addSubscriber", adminCode, data });
export const ensureMediaFolders = (adminCode: string) =>
  apiPost({ action: "ensureMediaFolders", adminCode });
