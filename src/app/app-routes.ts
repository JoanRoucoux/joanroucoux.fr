import { type Routes } from '@angular/router';

import { langResolver } from '@core/i18n/lang-resolver';
import { DEFAULT_LANG } from '@core/i18n/site-lang';
import { NotFoundPage } from '@core/not-found-page/not-found-page';

import { SITE_PATHS } from '@features/site/contract/site-paths';
import { SITE_ROUTES } from '@features/site/site-routes';

export const routes: Routes = [
  {
    path: SITE_PATHS.segment,
    children: SITE_ROUTES,
  },
  {
    path: '**',
    component: NotFoundPage,
    title: 'pageTitle.notFound',
    data: { lang: DEFAULT_LANG },
    resolve: { lang: langResolver },
  },
];
