"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import { getTRPCClient } from "@/trpc/client";

type Props = {
  dict: Dictionary;
};

type User = {
  id: string;
  phoneNumber?: string;
  username?: string;
  email?: string;
  role: "PATIENT" | "STAFF" | "DOCTOR" | "SUPER_ADMIN" | "CONTENT_MANAGER";
  isActive: boolean;
};

function getRoleLabel(role: User["role"]) {
  return role;
}

function normalizeRole(role: User["role"]): User["role"] {
  return role;
}

export function AdminDashboardPanel({ dict }: Props) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleByUserId, setRoleByUserId] = useState<Record<string, User["role"]>>({});

  async function load() {
    setLoading(true);
    try {
      const me = await trpc.auth.me.query();
      const ok = me.role === "DOCTOR" || me.role === "SUPER_ADMIN";
      setAuthorized(ok);

      if (!ok) {
        setLoading(false);
        return;
      }

      const list = await trpc.auth.listUsers.query();
      setUsers(list as User[]);
      setRoleByUserId(
        Object.fromEntries((list as User[]).map((user) => [user.id, normalizeRole(user.role)])),
      );
    } catch {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submitCreateStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await trpc.auth.createStaff.mutate({ username, email, password, confirmPassword });
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    }
  }

  async function toggleActive(userId: string, isActive: boolean) {
    setMessage("");
    try {
      await trpc.auth.setUserActive.mutate({ userId, isActive: !isActive });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    }
  }

  async function changeRole(userId: string) {
    setMessage("");
    const nextRole = roleByUserId[userId];

    if (!nextRole) {
      return;
    }

    if (nextRole === "SUPER_ADMIN") {
      setMessage(dict.dashboard.superAdminProtected);
      return;
    }

    try {
      await trpc.auth.setUserRole.mutate({ userId, role: nextRole });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    }
  }

  if (loading) {
    return <p className="mt-6 text-sm text-slate-600">{dict.dashboard.loading}</p>;
  }

  if (!authorized) {
    return <p className="mt-6 text-sm font-medium text-rose-700">{dict.dashboard.unauthorized}</p>;
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.createStaffTitle}</h2>
        <form onSubmit={submitCreateStaff} className="mt-5 grid gap-3 md:max-w-xl">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={dict.dashboard.username} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={dict.dashboard.email} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={dict.auth.passwordPlaceholder} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" required />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={dict.auth.confirmPasswordPlaceholder} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" required />
          <button className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">{dict.dashboard.createStaffButton}</button>
        </form>
      </section>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.usersTitle}</h2>
        <div className="mt-4 space-y-3">
          {users.map((user) => {
            const isSuperAdminRow = user.role === "SUPER_ADMIN";

            return (
              <article key={user.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">{user.username ?? user.phoneNumber ?? user.id}</p>
                {user.email && <p className="text-xs text-slate-600">{user.email}</p>}
                <p className="text-xs text-slate-600">{getRoleLabel(user.role)}</p>
                <p className="mt-1 text-xs text-slate-500">{user.isActive ? dict.dashboard.active : dict.dashboard.inactive}</p>

                {isSuperAdminRow ? (
                  <p className="mt-3 text-xs font-semibold text-slate-500">{dict.dashboard.superAdminProtected}</p>
                ) : (
                  <>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <select
                        value={roleByUserId[user.id] ?? normalizeRole(user.role)}
                        onChange={(event) =>
                          setRoleByUserId((prev) => ({
                            ...prev,
                            [user.id]: event.target.value as User["role"],
                          }))
                        }
                        aria-label={dict.dashboard.roleLabel}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="PATIENT">PATIENT</option>
                        <option value="STAFF">STAFF</option>
                        <option value="DOCTOR">DOCTOR</option>
                        <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => changeRole(user.id)}
                        className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        {dict.dashboard.setRoleButton}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleActive(user.id, user.isActive)}
                      className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      {user.isActive ? dict.dashboard.setInactive : dict.dashboard.setActive}
                    </button>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {message && <p className="text-sm font-medium text-slate-700">{message}</p>}
    </div>
  );
}
