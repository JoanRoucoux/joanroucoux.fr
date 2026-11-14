import { type SiteLang } from '@core/i18n/site-lang';

export type Availability =
  | { readonly state: 'available' }
  | { readonly state: 'mission'; readonly until?: string }
  | { readonly state: 'from'; readonly date: string };

export const AVAILABILITY: Availability = { state: 'mission' };

export type AvailabilityBadge = { key: string; date?: string; tone: 'green' | 'amber' };

const monthYear = (iso: string, lang: SiteLang): string =>
  new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));

export const availabilityBadge = (value: Availability, lang: SiteLang): AvailabilityBadge => {
  switch (value.state) {
    case 'available':
      return { key: 'site.home.hero.badge.available', tone: 'green' };
    case 'from':
      return { key: 'site.home.hero.badge.from', date: monthYear(value.date, lang), tone: 'amber' };
    case 'mission':
      return value.until
        ? { key: 'site.home.hero.badge.missionUntil', date: monthYear(value.until, lang), tone: 'amber' }
        : { key: 'site.home.hero.badge.mission', tone: 'amber' };
  }
};
