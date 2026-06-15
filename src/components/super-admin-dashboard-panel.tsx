"use client";

import { useMemo, useState } from "react";
import { AdminDashboardPanel } from "@/components/admin-dashboard-panel";
import type { Dictionary } from "@/i18n/dictionary";
import { getTRPCClient } from "@/trpc/client";

type Props = {
  dict: Dictionary;
};

export function SuperAdminDashboardPanel({ dict }: Props) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

      <AdminDashboardPanel dict={dict} />
    </div>
  );
}
