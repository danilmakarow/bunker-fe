/**
 * i18n config. UK is the only locale shipped at v1; the array exists so
 * adding `en` later is just dropping `messages/en.json` and extending it.
 */
export const locales = ['uk'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'uk';
