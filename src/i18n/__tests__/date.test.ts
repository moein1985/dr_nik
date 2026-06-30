import { describe, it, expect } from "vitest";
import {
  formatLocalizedDate,
  toDatetimeLocalValue,
  toJalaliDateString,
  parseGregorianDatetimeLocal,
  parseJalaliDateTime,
} from "@/i18n/date";

describe("date.ts UTC convention (Bug 4)", () => {
  describe("parseGregorianDatetimeLocal", () => {
    it("should parse a datetime-local string and preserve wall-clock time in UTC", () => {
      const result = parseGregorianDatetimeLocal("2026-06-15T10:30");
      expect(result).not.toBeNull();
      expect(result!.getUTCHours()).toBe(10);
      expect(result!.getUTCMinutes()).toBe(30);
      expect(result!.getUTCFullYear()).toBe(2026);
      expect(result!.getUTCMonth()).toBe(5); // June (0-indexed)
      expect(result!.getUTCDate()).toBe(15);
    });

    it("should return null for invalid input", () => {
      expect(parseGregorianDatetimeLocal("not-a-date")).toBeNull();
    });

    it("should produce ISO string with UTC wall-clock time", () => {
      const result = parseGregorianDatetimeLocal("2026-01-05T09:00");
      expect(result!.toISOString()).toBe("2026-01-05T09:00:00.000Z");
    });
  });

  describe("parseJalaliDateTime", () => {
    it("should parse a valid Jalali date and time into UTC", () => {
      // 1405/03/15 Jalali = 2026/06/05 Gregorian
      const result = parseJalaliDateTime("1405/03/15", "14:30");
      expect(result).not.toBeNull();
      expect(result!.getUTCHours()).toBe(14);
      expect(result!.getUTCMinutes()).toBe(30);
    });

    it("should return null for invalid Jalali date", () => {
      expect(parseJalaliDateTime("1405/13/01", "10:00")).toBeNull();
    });

    it("should return null for invalid time format", () => {
      expect(parseJalaliDateTime("1405/03/15", "25:00")).toBeNull();
    });

    it("should return null for malformed date string", () => {
      expect(parseJalaliDateTime("invalid", "10:00")).toBeNull();
    });
  });

  describe("toDatetimeLocalValue", () => {
    it("should format a UTC date for datetime-local input", () => {
      const date = new Date("2026-06-15T10:30:00Z");
      expect(toDatetimeLocalValue(date)).toBe("2026-06-15T10:30");
    });
  });

  describe("toJalaliDateString", () => {
    it("should convert a UTC date to Jalali date string", () => {
      // 2026-06-05 = 1405/03/15
      const date = new Date("2026-06-05T00:00:00Z");
      const result = toJalaliDateString(date);
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });
  });

  describe("formatLocalizedDate", () => {
    it("should format date with UTC timezone for fa locale", () => {
      const date = new Date("2026-06-15T10:30:00Z");
      const result = formatLocalizedDate("fa", date);
      // Should contain Persian digits and time 10:30 (not shifted by timezone)
      expect(result).toBeTruthy();
      expect(result).toContain("۱۰");
    });

    it("should format date with UTC timezone for en locale", () => {
      const date = new Date("2026-06-15T10:30:00Z");
      const result = formatLocalizedDate("en", date);
      expect(result).toContain("10");
    });

    it("should not shift time due to timezone", () => {
      const date = new Date("2026-06-15T09:00:00Z");
      const enResult = formatLocalizedDate("en", date);
      // With timeZone: UTC, 09:00 UTC should display as 09:00
      expect(enResult).toContain("09");
    });
  });

  describe("round-trip consistency", () => {
    it("parse then format should preserve wall-clock time", () => {
      const input = "2026-06-15T14:00";
      const parsed = parseGregorianDatetimeLocal(input);
      expect(parsed).not.toBeNull();
      const formatted = toDatetimeLocalValue(parsed!);
      expect(formatted).toBe(input);
    });

    it("parse Jalali then toJalaliDateString should preserve date", () => {
      const parsed = parseJalaliDateTime("1405/03/15", "10:00");
      expect(parsed).not.toBeNull();
      const jalaliStr = toJalaliDateString(parsed!);
      expect(jalaliStr).toBe("1405/03/15");
    });
  });
});
