import { type Routes } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';

import { preloadScope } from '@core/i18n/preload-scope';

import { SitePage } from './site-page';

export const SITE_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('site')],
    resolve: { translations: preloadScope('site') },
    children: [
      {
        path: '',
        component: SitePage,
        title: 'pageTitle.site',
      },
    ],
  },
];
