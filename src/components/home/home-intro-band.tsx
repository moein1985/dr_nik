import type { Dictionary } from "@/i18n/dictionary";

type Props = { dict: Dictionary };

export function HomeIntroBand({ dict }: Props) {
  return (
    <section className="mx-auto -mt-2 max-w-7xl px-4 lg:px-8">
      <div className="rounded-sm bg-clinic-teal-pale px-6 py-6 text-center text-white shadow-sm">
        <h2 className="text-2xl font-bold lg:text-4xl">{dict.home.introTitle}</h2>
        <p className="mt-4 text-xs leading-7 text-white/80 lg:text-sm">{dict.home.introText}</p>
      </div>
    </section>
  );
}
