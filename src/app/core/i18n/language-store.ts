import { DOCUMENT } from '@angular/common';
import { Injectable, type Signal, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { TranslocoService } from '@jsverse/transloco';

import { type SiteLang } from '@core/i18n/site-lang';

@Injectable({
  providedIn: 'root',
})
export class LanguageStore {
  #translocoService = inject(TranslocoService);
  #document = inject(DOCUMENT);

  readonly activeLang = toSignal(this.#translocoService.langChanges$, {
    initialValue: this.#translocoService.getActiveLang(),
  }) as Signal<SiteLang>;

  constructor() {
    effect(() => {
      this.#document.documentElement.lang = this.activeLang();
    });
  }
}
