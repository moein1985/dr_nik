import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Locale } from "@/i18n/config";
import { ContentManagerPanel } from "@/components/content-manager-panel";
import { services } from "@/server/shared/service-container";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function ContentManagerPage({ params }: Props) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(services.env.SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect(`/${locale}/auth/login` as any);
  }

  const session = await services.auth.session.resolve.execute(token);

  if (!session || (session.userRole !== "CONTENT_MANAGER" && session.userRole !== "SUPER_ADMIN")) {
    redirect(`/${locale}` as any);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ContentManagerPanel locale={locale} />
    </div>
  );
}
