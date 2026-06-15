"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";

type Props = {
  dict: Dictionary;
};

export function ContactLeadForm({ dict }: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, message }),
      });

      const payload = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? dict.pages.contactFormError);
      }

      setStatusMessage(dict.pages.contactFormSuccess);
      setFullName("");
      setPhone("");
      setMessage("");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : dict.pages.contactFormError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid max-w-2xl gap-3 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
      <input
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        placeholder={dict.pages.contactFormName}
        aria-label={dict.pages.contactFormName}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        required
      />
      <input
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder={dict.pages.contactFormPhone}
        aria-label={dict.pages.contactFormPhone}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        required
      />
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={dict.pages.contactFormMessage}
        aria-label={dict.pages.contactFormMessage}
        rows={4}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
      >
        {loading ? "..." : dict.pages.contactFormSubmit}
      </button>
      {statusMessage && <p className="text-sm text-slate-700">{statusMessage}</p>}
    </form>
  );
}
