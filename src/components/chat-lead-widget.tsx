"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";

type ChatLeadWidgetProps = {
  dict: Dictionary;
};

function isValidPhone(input: string) {
  const normalized = input.replace(/\s|-/g, "");
  return /^(\+?\d{10,15})$/.test(normalized);
}

export function ChatLeadWidget({ dict }: ChatLeadWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidPhone(phone)) {
      setStatus("error");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/consultation-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        throw new Error(dict.chat.requestFailed ?? "request failed");
      }

      setStatus("success");
      setPhone("");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-[min(22rem,90vw)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">{dict.chat.title}</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              {dict.chat.close}
            </button>
          </div>

          <p className="text-xs leading-6 text-slate-600">{dict.chat.subtitle}</p>

          <form onSubmit={onSubmit} className="mt-3 space-y-3">
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={dict.chat.phonePlaceholder}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-600"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "..." : dict.chat.submit}
            </button>

            {status === "success" && (
              <p className="text-xs font-medium text-emerald-700">{dict.chat.success}</p>
            )}

            {status === "error" && (
              <p className="text-xs font-medium text-rose-700">
                {isValidPhone(phone) ? dict.chat.error : dict.chat.invalidPhone}
              </p>
            )}
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-cyan-700"
        >
          {dict.chat.fabLabel}
        </button>
      )}
    </div>
  );
}
