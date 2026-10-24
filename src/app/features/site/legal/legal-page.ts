import { Component, inject } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageStore } from '@core/i18n/language-store';

import { SiteFooter } from '../footer/site-footer';

@Component({
  selector: 'app-legal-page',
  imports: [TranslocoPipe, SiteFooter],
  templateUrl: './legal-page.html',
})
export class LegalPage {
  protected readonly lang = inject(LanguageStore).activeLang;
}
