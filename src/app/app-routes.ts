import { type Routes } from '@angular/router';

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
  },
];
