import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export function ClinicJsonLd({ locale, dict }: Props) {
  const baseUrl = "http://localhost:3001";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: dict.brand.name,
    description: dict.brand.tagline,
    url: `${baseUrl}/${locale}`,
    telephone: dict.footer.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: dict.footer.address,
      addressCountry: "IR",
    },
    availableLanguage: ["fa", "en", "ar"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
