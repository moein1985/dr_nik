import { describe, it, expect } from "vitest";
import { getDictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

const dentalKeys = [
  "dentalTitle",
  "dentalSubtitle",
  "dentalCategory",
  "dentalImplantsTitle",
  "dentalImplantsDesc",
  "dentalBleachingTitle",
  "dentalBleachingDesc",
  "dentalScalingTitle",
  "dentalScalingDesc",
  "dentalCompositeTitle",
  "dentalCompositeDesc",
  "dentalLaminateTitle",
  "dentalLaminateDesc",
  "dentalImplantsSubtitle",
  "dentalBleachingSubtitle",
  "dentalScalingSubtitle",
  "dentalCompositeSubtitle",
  "dentalLaminateSubtitle",
  "dentalPatientLabel",
] as const;

const serviceKeys = [
  "selectService",
  "noServicesForDoctor",
] as const;

describe("Dental page translations (Bug 1)", () => {
  const locales: Locale[] = ["fa", "en", "ar"];

  locales.forEach((locale) => {
    describe(`locale: ${locale}`, () => {
      const dict = getDictionary(locale);

      dentalKeys.forEach((key) => {
        it(`should have pages.${key}`, () => {
          const value = (dict.pages as unknown as Record<string, string>)[key];
          expect(value).toBeTruthy();
          expect(typeof value).toBe("string");
          expect(value!.length).toBeGreaterThan(1);
        });
      });

      it("should have non-empty dental title", () => {
        expect(dict.pages.dentalTitle.length).toBeGreaterThan(2);
      });

      it("should have 5 dental section titles", () => {
        expect(dict.pages.dentalImplantsTitle).not.toBe(dict.pages.dentalBleachingTitle);
        expect(dict.pages.dentalScalingTitle).not.toBe(dict.pages.dentalCompositeTitle);
        expect(dict.pages.dentalLaminateTitle).not.toBe(dict.pages.dentalImplantsTitle);
      });
    });
  });

  it("should have different dental titles across locales", () => {
    const fa = getDictionary("fa").pages.dentalTitle;
    const en = getDictionary("en").pages.dentalTitle;
    const ar = getDictionary("ar").pages.dentalTitle;
    expect(fa).not.toBe(en);
    expect(en).not.toBe(ar);
    expect(fa).not.toBe(ar);
  });
});

describe("Doctor service dropdown translations (Bug 3)", () => {
  const locales: Locale[] = ["fa", "en", "ar"];

  locales.forEach((locale) => {
    describe(`locale: ${locale}`, () => {
      const dict = getDictionary(locale);

      serviceKeys.forEach((key) => {
        it(`should have dashboard.${key}`, () => {
          const value = (dict.dashboard as unknown as Record<string, string>)[key];
          expect(value).toBeTruthy();
          expect(typeof value).toBe("string");
        });
      });
    });
  });
});
