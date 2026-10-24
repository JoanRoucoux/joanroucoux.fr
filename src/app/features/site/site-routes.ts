import { type Route, type Routes } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';

import { langResolver } from '@core/i18n/lang-resolver';
import { preloadScope } from '@core/i18n/preload-scope';
import { type SiteLang } from '@core/i18n/site-lang';

import { SITE_PATHS } from './contract/site-paths';
import { LegalPage } from './legal/legal-page';
import { SitePage } from './site-page';

const pageRoute = (path: string, lang: SiteLang, page: Pick<Route, 'component' | 'title'>): Route => ({
  path,
  data: { lang },
  resolve: { lang: langResolver },
  children: [{ path: '', ...page, resolve: { translations: preloadScope('site') } }],
});

export const SITE_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('site')],
    children: [
      pageRoute(SITE_PATHS.home.fr, 'fr', { component: SitePage, title: 'pageTitle.site' }),
      pageRoute(SITE_PATHS.home.en, 'en', { component: SitePage, title: 'pageTitle.site' }),
      pageRoute(SITE_PATHS.legal.fr, 'fr', { component: LegalPage, title: 'pageTitle.legal' }),
      pageRoute(SITE_PATHS.legal.en, 'en', { component: LegalPage, title: 'pageTitle.legal' }),
    ],
  },
];
