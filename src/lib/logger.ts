// src/lib/logger.ts
type LogLevel = "log" | "warn" | "error" | "info" | "debug";

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(level: LogLevel, message: any, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (typeof message === "string") {
      return [`${prefix} ${message}`, ...args];
    }
    return [prefix, message, ...args];
  }

  log(message: any, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(...this.formatMessage("log", message, ...args));
    }
  }

  info(message: any, ...args: any[]) {
    if (this.isDevelopment) {
      console.info(...this.formatMessage("info", message, ...args));
    }
  }

  warn(message: any, ...args: any[]) {
    if (this.isDevelopment) {
      console.warn(...this.formatMessage("warn", message, ...args));
    }
  }

  error(message: any, ...args: any[]) {
    if (this.isDevelopment) {
      console.error(...this.formatMessage("error", message, ...args));
    }
  }

  debug(message: any, ...args: any[]) {
    if (this.isDevelopment) {
      console.debug(...this.formatMessage("debug", message, ...args));
    }
  }

  // ✅ متدهای با ایموجی برای debugging بهتر
  success(message: any, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(...this.formatMessage("log", `✅ ${message}`, ...args));
    }
  }

  loading(message: any, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(...this.formatMessage("log", `🔄 ${message}`, ...args));
    }
  }

  api(message: any, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(...this.formatMessage("log", `🎯 ${message}`, ...args));
    }
  }

  data(message: any, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(...this.formatMessage("log", `🟢 ${message}`, ...args));
    }
  }

  fail(message: any, ...args: any[]) {
    if (this.isDevelopment) {
      console.error(...this.formatMessage("error", `🔴 ${message}`, ...args));
    }
  }

  // ✅ گروه‌بندی لاگ‌ها
  group(label: string, fn: () => void) {
    if (this.isDevelopment) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  }

  // ✅ جدول نمایش داده‌ها
  table(data: any) {
    if (this.isDevelopment) {
      console.table(data);
    }
  }

  // ✅ زمان‌سنجی
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// ✅ Export کردن instance
export const logger = new Logger();

// ✅ Export کردن به صورت default برای استفاده آسان‌تر
export default logger;
