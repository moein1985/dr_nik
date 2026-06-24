"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

type TabId =
  | "overview"
  | "users"
  | "ai-settings"
  | "doctor-services"
  | "audit-logs"
  | "appointments"
  | "account";

type Props = {
  dict: Dictionary;
  locale: Locale;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

const tabs = [
  { id: "overview" as TabId, icon: "📊" },
  { id: "users" as TabId, icon: "👥" },
  { id: "ai-settings" as TabId, icon: "🤖" },
  { id: "doctor-services" as TabId, icon: "🏥" },
  { id: "audit-logs" as TabId, icon: "📋" },
  { id: "appointments" as TabId, icon: "📅" },
  { id: "account" as TabId, icon: "⚙️" },
];

export function SuperAdminSidebar({ dict, locale, activeTab, onTabChange }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getTabLabel = (tabId: TabId): string => {
    switch (tabId) {
      case "overview":
        return dict.dashboard.sidebarOverview;
      case "users":
        return dict.dashboard.sidebarUsers;
      case "ai-settings":
        return dict.dashboard.sidebarAiSettings;
      case "doctor-services":
        return dict.dashboard.sidebarDoctorServices;
      case "audit-logs":
        return dict.dashboard.sidebarAuditLogs;
      case "appointments":
        return dict.dashboard.sidebarAppointments;
      case "account":
        return dict.dashboard.sidebarAccount;
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden mb-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        {isMobileMenuOpen ? "✕ Close Menu" : "☰ Open Menu"}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } lg:block w-full lg:w-64 flex-shrink-0`}
      >
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-clinic-teal text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{getTabLabel(tab.id)}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
