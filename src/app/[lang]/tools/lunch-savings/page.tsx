import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, fromUrlLocale, localizedHref } from "@/i18n";

type Props = {
  params: Promise<{ lang: string }>;
};

/** 旧パス互換: /[lang]/tools/lunch-savings → /[lang]/lunch-savings */
export default async function LunchSavingsLegacyRedirect({ params }: Props) {
  const { lang } = await params;
  const locale = fromUrlLocale(lang) ?? DEFAULT_LOCALE;
  redirect(localizedHref(locale, "/lunch-savings"));
}
