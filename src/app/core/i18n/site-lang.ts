import { SITE_PATHS } from '@features/site/contract/site-paths';

export type SiteLang = 'fr' | 'en';

export const SITE_LANGS: readonly SiteLang[] = ['fr', 'en'];

export const DEFAULT_LANG: SiteLang = 'fr';

export type SitePageKey = 'home' | 'legal';

export const counterpartUrl = (lang: SiteLang, page: SitePageKey): string =>
  `/${SITE_PATHS[page][lang === 'fr' ? 'en' : 'fr']}`;
