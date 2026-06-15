"use client";

import { useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import { getTRPCClient } from "@/trpc/client";

type BookingAuthPanelProps = {
  dict: Dictionary;
  locale: string;
};

type Mode = "register" | "login" | "forgot";
type UserRole = "PATIENT" | "STAFF" | "ADMIN" | "SUPER_ADMIN";

export function BookingAuthPanel({ dict, locale }: BookingAuthPanelProps) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const [mode, setMode] = useState<Mode>("register");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const rolePaths: Record<UserRole, string> = {
    PATIENT: "patient",
    STAFF: "staff",
    ADMIN: "admin",
    SUPER_ADMIN: "super-admin",
  };

  async function onRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await trpc.auth.registerPatient.mutate({
        phoneNumber,
        password,
        confirmPassword,
      });

      setMessage(dict.auth.registerSuccess);
      setMode("login");
      setIdentifier(phoneNumber);
      setConfirmPassword("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : dict.auth.genericError;
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function onLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const json = (await response.json()) as {
        ok: boolean;
        message?: string;
        user?: { role: UserRole };
      };

      if (!response.ok || !json.ok || !json.user) {
        throw new Error(json.message ?? dict.auth.genericError);
      }

      setIsLoggedIn(true);
      setCurrentUserRole(json.user.role);
      setMessage(`${dict.auth.loginSuccess} (${json.user.role})`);
      window.location.href = `/${locale}/${rolePaths[json.user.role]}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : dict.auth.genericError;
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    setLoading(true);
    setMessage("");

    try {
      await fetch("/api/auth/session/logout", { method: "POST" });
      setIsLoggedIn(false);
      setCurrentUserRole(null);
      setMessage(dict.auth.logoutSuccess);
    } catch {
      setMessage(dict.auth.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function onForgotSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await trpc.auth.forgotPassword.mutate({
        phoneNumber,
      });

      setMessage(dict.auth.forgotSuccess);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : dict.auth.genericError;
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function onResetSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await trpc.auth.resetPassword.mutate({
        phoneNumber,
        otpCode,
        newPassword,
        confirmNewPassword,
      });

      setMessage(dict.auth.resetSuccess);
      setMode("login");
      setIdentifier(phoneNumber);
      setPassword("");
      setOtpCode("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : dict.auth.genericError;
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            mode === "register" ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          {dict.auth.registerTab}
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            mode === "login" ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          {dict.auth.loginTab}
        </button>
        <button
          type="button"
          onClick={() => setMode("forgot")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            mode === "forgot" ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          {dict.auth.forgotTab}
        </button>
      </div>

      {mode === "register" ? (
        <form onSubmit={onRegisterSubmit} className="mt-5 grid gap-3 md:max-w-xl">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder={dict.auth.phonePlaceholder}
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
            type="submit"
            disabled={loading}
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? "..." : dict.auth.registerButton}
          </button>
        </form>
      ) : mode === "login" ? (
        <form onSubmit={onLoginSubmit} className="mt-5 grid gap-3 md:max-w-xl">
          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder={dict.auth.identifierPlaceholder}
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
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? "..." : dict.auth.loginButton}
          </button>
        </form>
      ) : (
        <div className="mt-5 grid gap-4 md:max-w-xl">
          <form onSubmit={onForgotSubmit} className="grid gap-3">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder={dict.auth.phonePlaceholder}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              {loading ? "..." : dict.auth.forgotButton}
            </button>
          </form>

          <form onSubmit={onResetSubmit} className="grid gap-3 border-t border-slate-200 pt-4">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder={dict.auth.phonePlaceholder}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
              placeholder={dict.auth.otpPlaceholder}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder={dict.auth.newPasswordPlaceholder}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              placeholder={dict.auth.confirmNewPasswordPlaceholder}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              {loading ? "..." : dict.auth.resetButton}
            </button>
          </form>
        </div>
      )}

      {message && <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>}
      {isLoggedIn && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold text-emerald-700">
            {dict.auth.sessionActiveLabel}: {currentUserRole}
          </p>
          <button
            type="button"
            onClick={onLogout}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-70"
          >
            {dict.auth.logoutButton}
          </button>

          {currentUserRole === "PATIENT" && (
            <a
              href={`/${locale}/patient`}
              className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white"
            >
              {dict.auth.openPatientPanel}
            </a>
          )}

          {(currentUserRole === "STAFF" || currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN") && (
            <a
              href={`/${locale}/staff`}
              className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white"
            >
              {dict.auth.openStaffPanel}
            </a>
          )}

          {(currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN") && (
            <a
              href={`/${locale}/admin`}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              {dict.auth.openAdminPanel}
            </a>
          )}

          {currentUserRole === "SUPER_ADMIN" && (
            <a
              href={`/${locale}/super-admin`}
              className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"
            >
              {dict.auth.openSuperAdminPanel}
            </a>
          )}
        </div>
      )}
      <p className="mt-4 text-xs text-slate-500">{dict.auth.hint}</p>
    </section>
  );
}
