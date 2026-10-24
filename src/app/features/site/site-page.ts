import { Component, inject } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageStore } from '@core/i18n/language-store';

import { LangSwitch } from './lang-switch/lang-switch';

@Component({
  selector: 'app-site-page',
  imports: [TranslocoPipe, LangSwitch],
  templateUrl: './site-page.html',
})
export class SitePage {
  protected readonly lang = inject(LanguageStore).activeLang;
}
