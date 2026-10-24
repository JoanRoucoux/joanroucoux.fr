import {
  type EnvironmentProviders,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { TranslocoService, provideTransloco } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { DEFAULT_LANG, SITE_LANGS } from '@core/i18n/site-lang';
import { TranslocoBundledLoader } from '@core/i18n/transloco-loader';

export const provideTranslocoGlobal = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    provideTransloco({
      config: {
        availableLangs: [...SITE_LANGS],
        defaultLang: DEFAULT_LANG,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoBundledLoader,
    }),
    provideAppInitializer(() => firstValueFrom(inject(TranslocoService).load(DEFAULT_LANG))),
  ]);
};
