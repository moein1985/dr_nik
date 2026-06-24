"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminDashboardPanel } from "@/components/admin-dashboard-panel";
import { SuperAdminAppointmentsViewer } from "@/components/super-admin-appointments-viewer";
import { SuperAdminDoctorServicesManager } from "@/components/super-admin-doctor-services-manager";
import { SuperAdminAuditLogViewer } from "@/components/super-admin-audit-log-viewer";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";
import { getTRPCClient } from "@/trpc/client";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

type AiSettingsForm = {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  isEnabled: boolean;
};

export function SuperAdminDashboardPanel({ dict, locale }: Props) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiForm, setAiForm] = useState<AiSettingsForm>({
    provider: "avalai",
    model: "gemini-2.5-flash",
    apiKey: "",
    baseUrl: "https://api.avalai.ir/v1",
    isEnabled: true,
  });

  useEffect(() => {
    void (async () => {
      try {
        const settings = await trpc.auth.getAiProviderSettings.query();
        setAiForm({
          provider: settings.provider,
          model: settings.model,
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl ?? "",
          isEnabled: settings.isEnabled,
        });
      } catch {
        // Keep defaults when settings are not available yet.
      }
    })();
  }, [trpc]);

  async function submitCreateAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await trpc.auth.createAdmin.mutate({
        username,
        email,
        password,
        confirmPassword,
      });
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setMessage(dict.dashboard.createAdminSuccess);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function submitAiSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAiMessage("");
    setAiLoading(true);

    try {
      await trpc.auth.upsertAiProviderSettings.mutate({
        provider: aiForm.provider,
        model: aiForm.model,
        apiKey: aiForm.apiKey,
        baseUrl: aiForm.baseUrl.trim() || undefined,
        isEnabled: aiForm.isEnabled,
      });
      setAiMessage(dict.dashboard.aiSettingsSaved);
    } catch (error) {
      setAiMessage(error instanceof Error ? error.message : dict.auth.genericError);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.createAdminTitle}</h2>
        <form onSubmit={submitCreateAdmin} className="mt-5 grid gap-3 md:max-w-xl">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={dict.dashboard.username}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={dict.dashboard.email}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={dict.auth.passwordPlaceholder}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder={dict.auth.confirmPasswordPlaceholder}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <button
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? "..." : dict.dashboard.createAdminButton}
          </button>
        </form>
        {message && <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>}
      </section>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.aiSettingsTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {dict.dashboard.aiSettingsSubtitle}
        </p>

        <form onSubmit={submitAiSettings} className="mt-5 grid gap-3 md:max-w-xl">
          <input
            value={aiForm.provider}
            onChange={(event) => setAiForm((prev) => ({ ...prev, provider: event.target.value }))}
            placeholder={dict.dashboard.aiProviderPlaceholder}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            value={aiForm.model}
            onChange={(event) => setAiForm((prev) => ({ ...prev, model: event.target.value }))}
            placeholder={dict.dashboard.aiModelPlaceholder}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            value={aiForm.baseUrl}
            onChange={(event) => setAiForm((prev) => ({ ...prev, baseUrl: event.target.value }))}
            placeholder={dict.dashboard.aiBaseUrlPlaceholder}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            type="url"
          />
          <input
            value={aiForm.apiKey}
            onChange={(event) => setAiForm((prev) => ({ ...prev, apiKey: event.target.value }))}
            placeholder={dict.dashboard.aiApiKeyPlaceholder}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            required
          />

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={aiForm.isEnabled}
              onChange={(event) =>
                setAiForm((prev) => ({
                  ...prev,
                  isEnabled: event.target.checked,
                }))
              }
            />
            {dict.dashboard.aiEnabledLabel}
          </label>

          <button
            disabled={aiLoading}
            className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
          >
            {aiLoading ? "..." : dict.dashboard.aiSaveSettingsButton}
          </button>
        </form>

        {aiMessage && <p className="mt-4 text-sm font-medium text-slate-700">{aiMessage}</p>}
      </section>

      <SuperAdminDoctorServicesManager locale={locale} />

      <SuperAdminAuditLogViewer locale={locale} />

      <SuperAdminAppointmentsViewer dict={dict} locale={locale} />

      <AdminDashboardPanel dict={dict} />
    </div>
  );
}
