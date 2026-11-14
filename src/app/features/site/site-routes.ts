import { type Route, type Routes } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';

import { langResolver } from '@core/i18n/lang-resolver';
import { preloadScope } from '@core/i18n/preload-scope';
import { type SiteLang, type SitePageKey } from '@core/i18n/site-lang';

import { SITE_PATHS } from './contract/site-paths';
import { SiteHomePage } from './home/site-home-page';
import { LegalPage } from './legal/legal-page';

const pageRoute = (path: string, lang: SiteLang, page: SitePageKey, component: Route['component']): Route => ({
  path,
  data: { lang, page },
  resolve: { lang: langResolver },
  children: [{ path: '', component, resolve: { translations: preloadScope('site') } }],
});

export const SITE_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('site')],
    children: [
      pageRoute(SITE_PATHS.home.fr, 'fr', 'home', SiteHomePage),
      pageRoute(SITE_PATHS.home.en, 'en', 'home', SiteHomePage),
      pageRoute(SITE_PATHS.legal.fr, 'fr', 'legal', LegalPage),
      pageRoute(SITE_PATHS.legal.en, 'en', 'legal', LegalPage),
    ],
  },
];
