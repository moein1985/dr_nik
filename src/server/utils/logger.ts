type LogLevel = "error" | "warn" | "info" | "debug";

interface LogContext {
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  error(message: string, context?: LogContext): void {
    const formatted = this.formatMessage("error", message, context);
    console.error(formatted);
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage("warn", message, context);
    console.warn(formatted);
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage("info", message, context);
    console.log(formatted);
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage("debug", message, context);
      console.log(formatted);
    }
  }
}

export const logger = new Logger();
