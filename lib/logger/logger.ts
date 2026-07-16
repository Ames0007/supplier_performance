/** Structured, level-aware logger emitting single-line JSON. */
export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface Logger {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
  child(context: Record<string, unknown>): Logger;
}

class StructuredLogger implements Logger {
  constructor(
    private readonly context: Record<string, unknown> = {},
    private readonly minLevel: LogLevel = "info",
  ) {}

  private write(level: LogLevel, message: string, fields?: Record<string, unknown>): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) return;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg: message,
      ...this.context,
      ...(fields ?? {}),
    });
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  }

  debug(message: string, fields?: Record<string, unknown>): void {
    this.write("debug", message, fields);
  }
  info(message: string, fields?: Record<string, unknown>): void {
    this.write("info", message, fields);
  }
  warn(message: string, fields?: Record<string, unknown>): void {
    this.write("warn", message, fields);
  }
  error(message: string, fields?: Record<string, unknown>): void {
    this.write("error", message, fields);
  }
  child(context: Record<string, unknown>): Logger {
    return new StructuredLogger({ ...this.context, ...context }, this.minLevel);
  }
}

const envLevel = process.env.LOG_LEVEL as LogLevel | undefined;

export const logger: Logger = new StructuredLogger({ app: "um6p-spm" }, envLevel ?? "info");

export function createLogger(context: Record<string, unknown>): Logger {
  return logger.child(context);
}
