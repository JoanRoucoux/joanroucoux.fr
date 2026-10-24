import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';

import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { PageHead, type PageKey } from '@core/seo/page-head';

import { type SiteLang } from './site-lang';

export const langResolver: ResolveFn<SiteLang> = async (route) => {
  const translocoService = inject(TranslocoService);
  const pageHead = inject(PageHead);
  const lang = route.data['lang'] as SiteLang;

  await firstValueFrom(translocoService.load(lang));
  translocoService.setActiveLang(lang);
  pageHead.apply(lang, route.data['page'] as PageKey);

  return lang;
};
