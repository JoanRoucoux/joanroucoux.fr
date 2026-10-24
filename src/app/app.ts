import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LanguageStore } from '@core/i18n/language-store';
import { PageHead } from '@core/seo/page-head';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly pageTitle = inject(PageHead).title;

  constructor() {
    inject(LanguageStore);
  }
}
