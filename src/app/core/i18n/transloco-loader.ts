import { Injectable } from '@angular/core';

import type { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable, from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

const BUNDLES: Record<string, () => Promise<{ default: Translation }>> = {
  fr: () => import('../../../i18n/fr.json'),
  en: () => import('../../../i18n/en.json'),
  'site/fr': () => import('../../../i18n/site/fr.json'),
  'site/en': () => import('../../../i18n/site/en.json'),
};

@Injectable({ providedIn: 'root' })
export class TranslocoBundledLoader implements TranslocoLoader {
  getTranslation(path: string): Observable<Translation> {
    const bundle = BUNDLES[path];

    return bundle
      ? from(bundle()).pipe(map((module) => module.default))
      : throwError(() => new Error(`No bundled translation for "${path}"`));
  }
}
