import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";

const faqData: Record<string, Array<{ question: string; answer: string }>> = {
  fa: [
    {
      question: "مشاوره اولیه چه زمانی انجام می‌شود؟",
      answer:
        "در جلسه‌ی مشاوره، ساختار پوست، سابقه‌ی درمان و اهداف زیبایی شما بررسی می‌شود تا بهترین برنامه درمانی با رعایت ایمنی و نتیجه‌ی طبیعی انتخاب شود.",
    },
    {
      question: "آیا خدمات پوست، صورت و دندانپزشکی زیبایی در یک مرکز ارائه می‌شود؟",
      answer:
        "بله؛ در کلینیک دکتر نیک خدمات زیبایی صورت، پوست و جوانسازی و همچنین خدمات دندانپزشکی زیبایی در یک مسیر حرفه‌ای و منسجم ارائه می‌شود.",
    },
    {
      question: "پس از درمان، پیگیری انجام می‌شود؟",
      answer:
        "برای اکثر درمان‌ها، بررسی روند بهبودی و پیگیری بعد از جلسه به‌صورت دقیق انجام می‌شود تا نتیجه‌ی نهایی با اطمینان و رضایت بیمار همراه باشد.",
    },
  ],
  en: [
    {
      question: "When does the initial consultation take place?",
      answer:
        "During the consultation, skin structure, treatment history, and your aesthetic goals are reviewed to choose the safest and most effective plan with natural-looking results.",
    },
    {
      question: "Are skin, facial, and cosmetic dentistry services offered in one place?",
      answer:
        "Yes. Dr. Nik Clinic combines facial aesthetics, skin rejuvenation, and cosmetic dentistry in one professional pathway with coordinated care.",
    },
    {
      question: "Is post-treatment follow-up included?",
      answer:
        "For most treatments, recovery progress and aftercare guidance are reviewed carefully so the final outcome feels stable, safe, and satisfying.",
    },
  ],
  ar: [
    {
      question: "متى تتم الاستشارة الأولية؟",
      answer:
        "خلال الاستشارة، يتم مراجعة بنية البشرة وسجل العلاج وهدفك الجمالي لاختيار الخطة الأنسب مع الالتزام بالأمان ونتائج طبيعية.",
    },
    {
      question: "هل تقدم العيادة خدمات البشرة والوجه وطبيب الأسنان التجميلي في مكان واحد؟",
      answer:
        "نعم؛ تقدم عيادة دكتور نيك خدمات تجميل الوجه وتجديد البشرة، إضافة إلى خدمات طب الأسنان التجميلي، في مسار احترافي متكامل.",
    },
    {
      question: "هل يوجد متابعة بعد العلاج؟",
      answer:
        "في معظم العلاجات، يتم مراجعة تقدم التعافي والإرشادات بعد الجلسة بدقة لضمان نتيجة مستقرة وآمنة ومرغوبة.",
    },
  ],
};

const faqTitle: Record<string, string> = {
  fa: "سوالات متداول و پرتکرار",
  en: "Frequently Asked Questions",
  ar: "الاسئلة الشائعة",
};

type Props = { dict: Dictionary; locale: Locale };

export function HomeFaq({ dict, locale }: Props) {
  const items = faqData[locale] ?? faqData.fa;
  const title = faqTitle[locale] ?? faqTitle.fa;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="rounded-3xl bg-clinic-dark-card p-6 lg:p-8">
        <p className="text-sm text-white/50">
          {dict.nav.home} / {title}
        </p>
        <h3 className="mt-2 text-3xl font-bold text-white">{title}</h3>
        <div className="mt-6 space-y-3">
          {items?.map((item) => (
            <details
              key={item.question}
              className="group overflow-hidden rounded-2xl bg-clinic-teal text-white open:rounded-3xl"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3 text-sm font-semibold">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/20 text-xs font-bold">
                  ؟
                </span>
                <span className="flex-1 text-start">{item.question}</span>
                <span className="text-xs transition group-open:rotate-180">▾</span>
              </summary>
              <p className="mx-4 mb-4 rounded-xl bg-white/10 px-4 py-3 text-xs leading-7">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
