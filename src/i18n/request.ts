import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

import he from '../messages/he.json';
import en from '../messages/en.json';

const messages = { he, en };

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'he' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messages[locale as 'he' | 'en']
  };
});
