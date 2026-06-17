// Rango de fechas compartido para Analíticas.
export type RangeKey = "today" | "7d" | "30d" | "90d" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export const RANGE_PRESETS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" },
  { key: "90d", label: "90 días" },
  { key: "custom", label: "Personalizado" },
];

const pad = (n: number) => String(n).padStart(2, "0");

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function computeRange(key: RangeKey, customFrom?: string, customTo?: string): DateRange {
  const now = new Date();
  switch (key) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "7d": {
      const f = new Date(now);
      f.setDate(f.getDate() - 6);
      return { from: startOfDay(f), to: endOfDay(now) };
    }
    case "30d": {
      const f = new Date(now);
      f.setDate(f.getDate() - 29);
      return { from: startOfDay(f), to: endOfDay(now) };
    }
    case "90d": {
      const f = new Date(now);
      f.setDate(f.getDate() - 89);
      return { from: startOfDay(f), to: endOfDay(now) };
    }
    case "custom": {
      const f = customFrom ? startOfDay(new Date(`${customFrom}T12:00:00`)) : startOfDay(now);
      const t = customTo ? endOfDay(new Date(`${customTo}T12:00:00`)) : endOfDay(now);
      return { from: f, to: t };
    }
  }
}

// Comprueba si una fecha (ISO timestamp o YYYY-MM-DD) cae dentro del rango.
export function inRange(dateInput: string | Date | undefined | null, r: DateRange): boolean {
  if (!dateInput) return false;
  const d =
    typeof dateInput === "string"
      ? new Date(dateInput.length === 10 ? `${dateInput}T12:00:00` : dateInput)
      : dateInput;
  if (Number.isNaN(d.getTime())) return false;
  return d >= r.from && d <= r.to;
}

export function rangeLabel(key: RangeKey): string {
  return RANGE_PRESETS.find((p) => p.key === key)?.label ?? "";
}
