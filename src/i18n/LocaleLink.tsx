"use client";

import Link, { type LinkProps } from "next/link";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { useI18n } from "./I18nProvider";
import { localizedHref } from "./localePath";

type Props = Omit<LinkProps, "href"> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    /** 言語プレフィックス無しのパス（例: `/library`） */
    href: string;
    children?: ReactNode;
  };

/**
 * 現在の URL 言語を付けた Link。
 * `href` は常に言語無しで渡し、内部で `localizedHref` する。
 */
const LocaleLink = forwardRef<HTMLAnchorElement, Props>(
  function LocaleLink({ href, ...rest }, ref) {
    const { locale } = useI18n();
    const localized = localizedHref(locale, href);
    return <Link ref={ref} href={localized} {...rest} />;
  },
);

export default LocaleLink;
