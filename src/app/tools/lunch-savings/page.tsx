import { redirect } from "next/navigation";

/** 旧パス互換: /tools/lunch-savings → /lunch-savings */
export default function LunchSavingsLegacyRedirect() {
  redirect("/lunch-savings");
}
