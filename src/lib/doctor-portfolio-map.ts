import type { Locale } from "@/i18n/config";
import { optimizedAssetPath } from "@/lib/asset-path";

export interface DoctorPortfolio {
  slug: string;
  name: string;
  title: string;
  coverImage: string;
  description: string;
  highlights: string[];
  videoHints: string[];
  ctaLabel: string;
}

interface DoctorPortfolioContent extends Omit<DoctorPortfolio, "slug"> {}

const doctorPortfolioCatalog: Record<string, { aliases: string[]; fa: DoctorPortfolioContent; en: DoctorPortfolioContent; ar: DoctorPortfolioContent }> = {
  "dr-nik": {
    aliases: [
      "dr nik",
      "dr. nik",
      "dr-nik",
      "dr nik clinic",
      "dr-nik clinic",
      "nik clinic",
      "دکتر نیک",
      "دکتر نيك",
      "دکتر نیک کلینیک",
      "دكتور نيك",
      "دكتور نيك كلينك",
      "nik",
    ],
    fa: {
      name: "دکتر نیک",
      title: "نمونه‌کار و تجربه درمانی دکتر نیک",
      coverImage: "/home/optimized/doctor-photo.webp",
      description: "متخصص پوست، مو و زیبایی با رویکرد درمان‌محور، دقیق و شخصی‌سازی‌شده برای نتایج طبیعی، پایدار و قابل اعتماد.",
      highlights: [
        "ارزیابی دقیق پوست و صورت با برنامه درمانی متناسب با نیاز هر بیمار",
        "استفاده از پروتکل‌های به‌روز، ایمن و قابل تنظیم برای درمان و جوانسازی",
        "نمایش نمونه‌کار واقعی، ویدیوهای آموزشی و مسیر تصمیم‌گیری برای مراجعه‌کنندگان",
      ],
      videoHints: [
        "راهنمای انتخاب درمان، زمان‌بندی و انتظار نتایج",
        "نمونه‌های قبل و بعد و توضیح پروتکل درمان",
      ],
      ctaLabel: "رزرو مشاوره و درمان",
    },
    en: {
      name: "Dr. Nik",
      title: "Dr. Nik Portfolio & Treatment Experience",
      coverImage: "/home/optimized/doctor-photo.webp",
      description: "Aesthetic and dermatology specialist focused on personalized treatment plans, evidence-based protocols, and natural results that feel confident and lasting.",
      highlights: [
        "Detailed skin and facial assessment with a treatment plan tailored to each patient",
        "Modern, safe, and adaptable clinical protocols for rejuvenation and care",
        "Real portfolio cases, educational video references, and clear decision support for patients",
      ],
      videoHints: [
        "Guidance on treatment choice, timing, and expected outcomes",
        "Before-and-after examples and clinical protocol explanations",
      ],
      ctaLabel: "Book a consultation",
    },
    ar: {
      name: "دكتور نيك",
      title: "سجل أعمال ودليل علاج دكتور نيك",
      coverImage: "/home/optimized/doctor-photo.webp",
      description: "أخصائي جلدية وتجميل يركز على خطط علاج شخصية، بروتوكولات حديثة وآمنة، ونتائج طبيعية تدوم وتمنح الثقة للمريض.",
      highlights: [
        "تقييم دقيق للبشرة والوجه مع خطة علاج تناسب كل حالة",
        "بروتوكولات حديثة وآمنة وقابلة للتعديل لتجديد البشرة والعناية",
        "أمثلة واقعية من العمل، ومقاطع تعليمية، ودعم واضح في قرار المريض",
      ],
      videoHints: [
        "إرشادات لاختيار العلاج وموعده وتوقع النتائج",
        "أمثلة قبل وبعد وشرح بروتوكول العلاج",
      ],
      ctaLabel: "احجز استشارة وموعدًا",
    },
  },
} as const;

export function getDoctorPortfolio(doctorName: string, locale: Locale): DoctorPortfolio | null {
  const match = findDoctorPortfolio(doctorName);

  if (!match) {
    return null;
  }

  return {
    slug: match.slug,
    ...match.data[locale],
    coverImage: optimizedAssetPath(match.data[locale].coverImage),
  };
}

export function getDoctorPortfolioBySlug(slug: string, locale: Locale): DoctorPortfolio | null {
  const normalized = normalizeSlug(slug);
  const entry = doctorPortfolioCatalog[normalized as keyof typeof doctorPortfolioCatalog];

  if (!entry) {
    return null;
  }

  return {
    slug: normalized,
    ...entry[locale],
    coverImage: optimizedAssetPath(entry[locale].coverImage),
  };
}

function findDoctorPortfolio(doctorName: string) {
  const normalized = normalizeDoctorName(doctorName);

  for (const [slug, entry] of Object.entries(doctorPortfolioCatalog)) {
    const normalizedAliases = entry.aliases.map(normalizeDoctorName);
    const hasMatch = normalizedAliases.some(
      (alias) =>
        normalized === alias ||
        normalized.includes(alias) ||
        alias.includes(normalized) ||
        normalized.replace(/\s+/g, "").includes(alias.replace(/\s+/g, ""))
    );

    if (hasMatch) {
      return {
        slug,
        data: entry,
      };
    }
  }

  return null;
}

function normalizeDoctorName(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s.-]/gu, "");
}

function normalizeSlug(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF\-]/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
