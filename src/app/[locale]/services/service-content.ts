import type { Locale } from "@/i18n/config";

type ServiceContent = {
  slug: string;
  title: string;
  shortDescription: string;
  details: string;
};

const servicesByLocale: Record<Locale, ServiceContent[]> = {
  fa: [
    {
      slug: "skin-rejuvenation",
      title: "جوانسازی پوست",
      shortDescription: "بوتاکس، فیلر و مزوتراپی",
      details:
        "برنامه جوانسازی پوست بر پایه ارزیابی تخصصی و با هدف حفظ حالت طبیعی چهره طراحی می شود. جلسات قابل تنظیم و پیگیری بعد از درمان انجام می شود.",
    },
    {
      slug: "laser-therapy",
      title: "لیزر درمانی",
      shortDescription: "رفع لک، شفاف سازی و بهبود بافت",
      details:
        "در مسیر لیزر درمانی، نوع پوست و شدت مشکل ابتدا تحلیل می شود و سپس پروتکل مناسب انتخاب می شود تا ریسک تحریک پوستی کاهش یابد.",
    },
    {
      slug: "body-contouring",
      title: "کانتورینگ بدن",
      shortDescription: "فرم دهی هدفمند و غیرتهاجمی",
      details:
        "کانتورینگ بدن برای نواحی مقاوم به رژیم و ورزش با رویکرد ایمن انجام می شود. نتیجه نهایی به شرایط بدنی فرد و تعداد جلسات بستگی دارد.",
    },
  ],
  en: [
    {
      slug: "skin-rejuvenation",
      title: "Skin Rejuvenation",
      shortDescription: "Botox, fillers, and mesotherapy",
      details:
        "Our skin rejuvenation plans are tailored after clinical assessment to keep facial outcomes natural. Session plans and follow-up are personalized.",
    },
    {
      slug: "laser-therapy",
      title: "Laser Therapy",
      shortDescription: "Pigmentation correction and texture improvement",
      details:
        "We evaluate skin type and concern severity before selecting a laser protocol, helping reduce irritation risk and improve consistency of outcomes.",
    },
    {
      slug: "body-contouring",
      title: "Body Contouring",
      shortDescription: "Targeted non-invasive shaping",
      details:
        "Body contouring is designed for areas resistant to diet and exercise with a safe protocol. Final outcomes depend on baseline condition and session count.",
    },
  ],
  ar: [
    {
      slug: "skin-rejuvenation",
      title: "تجديد البشرة",
      shortDescription: "بوتوكس وفيلر وميزوثيرابي",
      details:
        "يتم تصميم خطة تجديد البشرة بعد تقييم طبي دقيق للحفاظ على نتيجة طبيعية. يتم تحديد عدد الجلسات والمتابعة حسب حالة كل مراجع.",
    },
    {
      slug: "laser-therapy",
      title: "العلاج بالليزر",
      shortDescription: "تصحيح التصبغات وتحسين الملمس",
      details:
        "نقوم بتحليل نوع البشرة وشدة الحالة قبل اختيار بروتوكول الليزر المناسب لتقليل التهيج وتحسين ثبات النتائج.",
    },
    {
      slug: "body-contouring",
      title: "نحت الجسم",
      shortDescription: "تشكيل غير جراحي موجه",
      details:
        "يستهدف نحت الجسم المناطق المقاومة للحمية والرياضة وفق بروتوكول آمن. النتيجة النهائية تعتمد على الحالة الأولية وعدد الجلسات.",
    },
  ],
};

export function getServicesForLocale(locale: Locale) {
  return servicesByLocale[locale];
}

export function getServiceBySlug(locale: Locale, slug: string) {
  return servicesByLocale[locale].find((service) => service.slug === slug);
}
