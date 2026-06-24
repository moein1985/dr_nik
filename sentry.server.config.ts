import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  beforeSend(event: Sentry.ErrorEvent, hint: Sentry.EventHint) {
    if (process.env.NODE_ENV === "development") {
      console.error("Sentry Server Event:", event);
    }
    return event;
  },
});
