"use client";

import LegalDocument from "@/components/LegalDocument";
import { useI18n } from "@/i18n";

export default function TermsContent() {
  const { t } = useI18n();
  return <LegalDocument doc={t.legal.terms} />;
}
