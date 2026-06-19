"use client";

import { useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import { getTRPCClient } from "@/trpc/client";

type BookingAuthPanelProps = {
  dict: Dictionary;
  locale: string;
};

type Mode = "register" | "login" | "forgot";
type UserRole = "PATIENT" | "STAFF" | "ADMIN" | "DOCTOR" | "SUPER_ADMIN";

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
    DOCTOR: "admin",
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

  const desktopAuthView = mode === "register" ? "register" : "login";

  const registerForm = (
    <form onSubmit={onRegisterSubmit} className="grid gap-3">
      <input
        type="tel"
        value={phoneNumber}
        onChange={(event) => setPhoneNumber(event.target.value)}
        placeholder={dict.auth.phonePlaceholder}
        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder={dict.auth.passwordPlaceholder}
        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder={dict.auth.confirmPasswordPlaceholder}
        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-gradient-to-r from-cyan-700 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-70"
      >
        {loading ? "..." : dict.auth.registerButton}
      </button>
    </form>
  );

  const loginForm = (
    <form onSubmit={onLoginSubmit} className="grid gap-3">
      <input
        type="text"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        placeholder={dict.auth.identifierPlaceholder}
        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder={dict.auth.passwordPlaceholder}
        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
        required
      />
      <div className="text-right">
        <button
          type="button"
          onClick={() => setMode("forgot")}
          className="text-xs font-medium text-slate-500 transition hover:text-cyan-700"
        >
          {dict.auth.forgotTab}
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-gradient-to-r from-cyan-700 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-70"
      >
        {loading ? "..." : dict.auth.loginButton}
      </button>
    </form>
  );

  const forgotPanel = (
    <div className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <form onSubmit={onForgotSubmit} className="grid gap-3">
        <input
          type="tel"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder={dict.auth.phonePlaceholder}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-70"
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
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          required
        />
        <input
          type="text"
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value)}
          placeholder={dict.auth.otpPlaceholder}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          required
        />
        <input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder={dict.auth.newPasswordPlaceholder}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          required
        />
        <input
          type="password"
          value={confirmNewPassword}
          onChange={(event) => setConfirmNewPassword(event.target.value)}
          placeholder={dict.auth.confirmNewPasswordPlaceholder}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-950 disabled:opacity-70"
        >
          {loading ? "..." : dict.auth.resetButton}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode("login")}
        className="justify-self-end rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white"
      >
        {dict.auth.loginTab}
      </button>
    </div>
  );

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
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

      <div className="relative hidden h-[560px] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-cyan-100 ring-1 ring-slate-200 lg:flex">
        <div
          className={`absolute inset-y-0 z-10 w-1/2 bg-gradient-to-br from-cyan-700 to-cyan-500 transition-transform duration-700 ease-in-out ${
            desktopAuthView === "login" ? "translate-x-full" : "translate-x-0"
          }`}
        />

        <div
          className={`absolute left-0 top-0 z-20 flex h-full w-1/2 flex-col justify-center px-10 transition-all duration-700 ease-in-out ${
            desktopAuthView === "login" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          }`}
        >
          <h2 className="text-3xl font-bold text-slate-800">{dict.auth.loginTab}</h2>
          <p className="mt-2 text-sm text-slate-500">{dict.pages.bookingText}</p>
          <div className="mt-6">{loginForm}</div>
          {mode === "forgot" ? forgotPanel : null}
        </div>

        <div
          className={`absolute left-0 top-0 z-20 flex h-full w-1/2 flex-col justify-center px-10 transition-all duration-700 ease-in-out ${
            desktopAuthView === "register" ? "translate-x-full opacity-100" : "translate-x-0 opacity-0"
          }`}
        >
          <h2 className="text-3xl font-bold text-slate-800">{dict.auth.registerTab}</h2>
          <p className="mt-2 text-sm text-slate-500">{dict.pages.bookingText}</p>
          <div className="mt-6">{registerForm}</div>
        </div>

        <div
          className={`absolute top-0 z-30 flex h-full w-1/2 items-center justify-center px-10 text-center transition-all duration-700 ease-in-out ${
            desktopAuthView === "login" ? "left-1/2" : "left-0"
          }`}
        >
          {desktopAuthView === "login" ? (
            <div className="space-y-5">
              <h3 className="text-3xl font-bold">{dict.auth.registerTab}</h3>
              <p className="text-sm leading-7 text-white/85">{dict.pages.bookingText}</p>
              <button
                type="button"
                onClick={() => setMode("register")}
                className="rounded-xl border border-white/70 bg-white/20 px-8 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-cyan-700"
              >
                {dict.auth.registerTab}
              </button>
            </div>
          ) : (
            <div className="space-y-5 text-slate-800">
              <h3 className="text-3xl font-bold">{dict.auth.loginTab}</h3>
              <p className="text-sm leading-7 text-slate-500">{dict.pages.bookingText}</p>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="rounded-xl border border-cyan-600 bg-cyan-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
              >
                {dict.auth.loginTab}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-200 lg:hidden">
        {mode === "register" ? registerForm : loginForm}
        {mode === "forgot" ? forgotPanel : null}
      </div>

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

          {(currentUserRole === "STAFF" || currentUserRole === "ADMIN" || currentUserRole === "DOCTOR" || currentUserRole === "SUPER_ADMIN") && (
            <a
              href={`/${locale}/staff`}
              className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white"
            >
              {dict.auth.openStaffPanel}
            </a>
          )}

          {(currentUserRole === "ADMIN" || currentUserRole === "DOCTOR" || currentUserRole === "SUPER_ADMIN") && (
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
