"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import { getTRPCClient } from "@/trpc/client";

type BookingAuthPanelProps = {
  dict: Dictionary;
  locale: string;
};

type Mode = "register" | "login" | "forgot";
type UserRole = "PATIENT" | "STAFF" | "DOCTOR" | "SUPER_ADMIN" | "CONTENT_MANAGER";
type AppointmentSummaryItem = {
  requestedAt: Date | string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
};

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
  const [phoneError, setPhoneError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [upcomingAppointmentsCount, setUpcomingAppointmentsCount] = useState(0);
  const [nextAppointmentAt, setNextAppointmentAt] = useState<Date | null>(null);

  const rolePaths: Record<UserRole, string> = {
    PATIENT: "patient",
    STAFF: "staff",
    DOCTOR: "admin",
    SUPER_ADMIN: "super-admin",
    CONTENT_MANAGER: "content-manager",
  };

  const roleLabels: Record<UserRole, string> = {
    PATIENT: dict.auth.rolePatient,
    STAFF: dict.auth.roleStaff,
    DOCTOR: dict.auth.roleDoctor,
    SUPER_ADMIN: dict.auth.roleSuperAdmin,
    CONTENT_MANAGER: dict.auth.roleContentManager,
  };

  const formatSummaryDate = (value: Date) =>
    new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-SA" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(value);

  async function loadPatientSummary() {
    try {
      const appointments = (await trpc.appointment.listMy.query()) as AppointmentSummaryItem[];
      const upcoming = appointments
        .filter((appointment) => appointment.status !== "CANCELLED")
        .map((appointment) => new Date(appointment.requestedAt))
        .filter((date) => !Number.isNaN(date.getTime()) && date.getTime() >= Date.now())
        .sort((left, right) => left.getTime() - right.getTime());

      setUpcomingAppointmentsCount(upcoming.length);
      setNextAppointmentAt(upcoming[0] ?? null);
    } catch {
      setUpcomingAppointmentsCount(0);
      setNextAppointmentAt(null);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const response = await fetch("/api/auth/session/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const json = (await response.json()) as {
          ok: boolean;
          user?: { role: UserRole };
        };

        if (!cancelled && json.ok && json.user) {
          setIsLoggedIn(true);
          setCurrentUserRole(json.user.role);

          if (json.user.role === "PATIENT") {
            await loadPatientSummary();
          }
        }
      } catch {
        // No active session is a valid state for the booking page.
      } finally {
        if (!cancelled) {
          setSessionReady(true);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

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

      if (json.user.role === "PATIENT") {
        await loadPatientSummary();
        return;
      }

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
      setUpcomingAppointmentsCount(0);
      setNextAppointmentAt(null);
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
  const isReturningUserFlow = mode === "login" || mode === "forgot";
  const panelTitle = mode === "forgot" ? dict.auth.forgotTab : mode === "register" ? dict.auth.registerTab : dict.auth.loginTab;
  const panelDescription =
    mode === "forgot"
      ? dict.auth.forgotDescription
      : mode === "register"
        ? dict.auth.registerDescription
        : dict.auth.loginDescription;

  const registerForm = (
    <form onSubmit={onRegisterSubmit} className="grid gap-3">
      <div>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(event) => {
            const value = event.target.value;
            setPhoneNumber(value);
            const phoneRegex = /^(\+?\d{10,15})$/;
            if (value && !phoneRegex.test(value)) {
              setPhoneError("Invalid phone number format");
            } else {
              setPhoneError("");
            }
          }}
          placeholder={dict.auth.phonePlaceholder}
          className={`rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-2 ${
            phoneError ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-cyan-500 focus:ring-cyan-200"
          }`}
          required
        />
        {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
      </div>
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
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
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

  const entryChoiceCards = (
    <div className="mb-5 grid gap-3 md:grid-cols-2">
      <button
        type="button"
        onClick={() => setMode("register")}
        className={`rounded-2xl border px-4 py-4 text-right transition ${
          !isReturningUserFlow
            ? "border-cyan-300 bg-cyan-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/40"
        }`}
      >
        <p className="text-sm font-bold text-slate-900">{dict.auth.newPatientChoiceTitle}</p>
        <p className="mt-1 text-xs leading-6 text-slate-500">{dict.auth.newPatientChoiceSubtitle}</p>
      </button>
      <button
        type="button"
        onClick={() => setMode("login")}
        className={`rounded-2xl border px-4 py-4 text-right transition ${
          isReturningUserFlow
            ? "border-cyan-300 bg-cyan-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/40"
        }`}
      >
        <p className="text-sm font-bold text-slate-900">{dict.auth.existingAccountChoiceTitle}</p>
        <p className="mt-1 text-xs leading-6 text-slate-500">{dict.auth.existingAccountChoiceSubtitle}</p>
      </button>
    </div>
  );

  const patientSummaryCard = currentUserRole === "PATIENT" ? (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4">
      <p className="text-sm font-semibold text-slate-900">{dict.auth.patientSummaryTitle}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">{dict.auth.upcomingAppointmentsLabel}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{upcomingAppointmentsCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">{dict.auth.nextAppointmentLabel}</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {nextAppointmentAt ? formatSummaryDate(nextAppointmentAt) : dict.auth.noUpcomingAppointments}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  const signedInActions = currentUserRole ? (
    <div className="grid gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-bold text-emerald-900">{dict.auth.loggedInBanner}</p>
            <p className="mt-0.5 text-sm text-emerald-700">{dict.auth.signedInAs} {roleLabels[currentUserRole]}.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={loading}
          className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-70"
        >
          {loading ? "..." : dict.auth.logoutButton}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {currentUserRole === "PATIENT" && (
          <a
            href={`/${locale}/patient`}
            className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white"
          >
            {dict.auth.continueBookingCta}
          </a>
        )}

        {currentUserRole === "PATIENT" && (
          <a
            href={`/${locale}/patient`}
            className="rounded-xl border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-800"
          >
            {dict.auth.openPatientPanel}
          </a>
        )}

        {(currentUserRole === "STAFF" || currentUserRole === "DOCTOR" || currentUserRole === "SUPER_ADMIN") && (
          <a
            href={`/${locale}/staff`}
            className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white"
          >
            {dict.auth.openStaffPanel}
          </a>
        )}

        {(currentUserRole === "DOCTOR" || currentUserRole === "SUPER_ADMIN") && (
          <a
            href={`/${locale}/admin`}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            {dict.auth.openAdminPanel}
          </a>
        )}

        {currentUserRole === "SUPER_ADMIN" && (
          <a
            href={`/${locale}/super-admin`}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            {dict.auth.openSuperAdminPanel}
          </a>
        )}
      </div>

      {patientSummaryCard}
    </div>
  ) : null;

  return (
    <section className="mt-8">
      {sessionReady && isLoggedIn ? signedInActions : null}

      {!sessionReady ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
          {dict.auth.sessionChecking}
        </div>
      ) : null}

      {sessionReady && !isLoggedIn ? (
        <>
          {entryChoiceCards}

          {isReturningUserFlow ? (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900">
              {dict.auth.staffLoginHint}
            </div>
          ) : null}

          <div className="relative hidden h-[560px] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-cyan-100 ring-1 ring-slate-200 lg:flex">
            <div
              className={`absolute inset-y-0 z-10 w-1/2 bg-gradient-to-br from-cyan-700 to-cyan-500 transition-transform duration-700 ease-in-out ${
                desktopAuthView === "login" ? "translate-x-full" : "translate-x-0"
              }`}
            />

            <div
              className={`absolute left-0 top-0 z-20 flex h-full w-1/2 flex-col justify-center px-10 transition-all duration-700 ease-in-out ${
                desktopAuthView === "login"
                  ? "visible pointer-events-auto translate-x-0 opacity-100"
                  : "invisible pointer-events-none -translate-x-full opacity-0"
              }`}
            >
              <h2 className="text-3xl font-bold text-slate-800">{panelTitle}</h2>
              <p className="mt-2 text-sm text-slate-500">{panelDescription}</p>
              <div className="mt-6">{mode === "forgot" ? forgotPanel : loginForm}</div>
            </div>

            <div
              className={`absolute left-0 top-0 z-20 flex h-full w-1/2 flex-col justify-center px-10 transition-all duration-700 ease-in-out ${
                desktopAuthView === "register"
                  ? "visible pointer-events-auto translate-x-full opacity-100"
                  : "invisible pointer-events-none translate-x-0 opacity-0"
              }`}
            >
              <h2 className="text-3xl font-bold text-slate-800">{dict.auth.registerTab}</h2>
              <p className="mt-2 text-sm text-slate-500">{dict.auth.registerDescription}</p>
              <div className="mt-6">{registerForm}</div>
            </div>

            <div
              className={`absolute top-0 z-30 flex h-full w-1/2 items-center justify-center px-10 text-center transition-all duration-700 ease-in-out ${
                desktopAuthView === "login" ? "left-1/2" : "left-0"
              }`}
            >
              {desktopAuthView === "login" ? (
                <div className="space-y-5">
                  <h3 className="text-3xl font-bold">{dict.auth.newPatientChoiceTitle}</h3>
                  <p className="text-sm leading-7 text-white/85">{dict.auth.newPatientChoiceSubtitle}</p>
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
                  <h3 className="text-3xl font-bold">{dict.auth.existingAccountChoiceTitle}</h3>
                  <p className="text-sm leading-7 text-slate-500">{dict.auth.existingAccountChoiceSubtitle}</p>
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
            <div>
              <h2 className="text-xl font-bold text-slate-900">{panelTitle}</h2>
              <p className="mt-2 text-sm text-slate-500">{panelDescription}</p>
            </div>
            {mode === "register" ? registerForm : mode === "forgot" ? forgotPanel : loginForm}
          </div>
        </>
      ) : null}

      {message && <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>}
      <p className="mt-4 text-xs text-slate-500">{dict.auth.hint}</p>
    </section>
  );
}
