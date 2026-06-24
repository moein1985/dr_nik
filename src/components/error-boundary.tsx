"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { getDictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  locale?: Locale;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const locale = this.props.locale ?? "fa";
      const dict = getDictionary(locale);

      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-6xl">⚠️</div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900">{dict.dashboard.errorBoundaryTitle}</h1>
            <p className="mb-6 text-slate-600">
              {dict.dashboard.errorBoundaryText}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-clinic-teal-mid px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-clinic-teal-dark"
            >
              {dict.dashboard.errorBoundaryRefresh}
            </button>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                  {dict.dashboard.errorBoundaryDetails}
                </summary>
                <pre className="mt-2 overflow-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
