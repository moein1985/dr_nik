import type { Locale } from "@/i18n/config";
import { FreshFeedClient } from "@/components/fresh-feed-client";

type Props = {
  params: { locale: Locale };
};

export default function FreshPage({ params }: Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      <FreshFeedClient locale={params.locale} />
    </div>
  );
}
