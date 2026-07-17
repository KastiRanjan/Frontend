import dayjs, { Dayjs } from "dayjs";
import { DualDateConverter } from "./dateConverter";
import type { DateSystem } from "../context/DateSystemContext";

const BS_MONTHS_EN = DualDateConverter.getMonthNames().nepaliEn;

export interface BsParts {
  year: number;
  month: number; // 1-indexed
  day: number;
}

/** Convert an AD date to Bikram Sambat parts using the project converter. */
export function toBs(ad: string | Dayjs | Date): BsParts {
  const np = DualDateConverter.gregorianToNepali(dayjs(ad));
  return { year: np.getYear(), month: np.getMonth() + 1, day: np.getDate() };
}

/** Convert BS parts to an AD `YYYY-MM-DD` string. */
export function bsToAdString(bs: BsParts): string {
  return DualDateConverter.convertToAD(`${bs.year}-${bs.month}-${bs.day}`);
}

/** Format a single AD date in the active system, e.g. "Shrawan 2, 2083" or "18 Jul 2026". */
export function formatLeaveDate(
  ad: string | Dayjs | Date | undefined,
  system: DateSystem,
  withYear = true
): string {
  if (!ad) return "—";
  const d = dayjs(ad);
  if (!d.isValid()) return "—";
  if (system === "AD") return d.format(withYear ? "DD MMM YYYY" : "DD MMM");
  const bs = toBs(d);
  const m = BS_MONTHS_EN[bs.month - 1] ?? `M${bs.month}`;
  return withYear ? `${m} ${bs.day}, ${bs.year}` : `${m} ${bs.day}`;
}

/** Format an inclusive date range in the active system. */
export function formatLeaveRange(
  start: string | undefined,
  end: string | undefined,
  system: DateSystem
): string {
  if (!start) return "—";
  if (!end || dayjs(end).isSame(dayjs(start), "day")) {
    return formatLeaveDate(start, system);
  }
  return `${formatLeaveDate(start, system, false)} – ${formatLeaveDate(end, system)}`;
}

/** Inclusive day count between two AD dates. */
export function inclusiveDays(start?: string, end?: string): number {
  if (!start) return 0;
  const s = dayjs(start);
  const e = end ? dayjs(end) : s;
  if (!s.isValid() || !e.isValid()) return 0;
  return Math.max(1, e.diff(s, "day") + 1);
}

/** Nepali weekly off is Saturday. */
export function isNepaliWeekend(ad: string | Dayjs | Date): boolean {
  return dayjs(ad).day() === 6;
}
