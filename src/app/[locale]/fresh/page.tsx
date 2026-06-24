import type { Locale } from "@/i18n/config";
import { FreshFeedClient } from "@/components/fresh-feed-client";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function FreshPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <FreshFeedClient locale={locale} />
    </div>
  );
}
