import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './config';

/**
 * next-intl request config. With no locale routing at v1 we always
 * load the default (uk) bundle, but the plumbing matches the multi-locale
 * shape so en/etc. can be added without touching call sites.
 *
 * `timeZone` is pinned to the audience's TZ to avoid SSR/CSR markup
 * drift when next-intl formats dates/times.
 */
export default getRequestConfig(async () => ({
  locale: defaultLocale,
  timeZone: 'Europe/Kyiv',
  messages: (await import(`../../messages/${defaultLocale}.json`)).default,
}));
