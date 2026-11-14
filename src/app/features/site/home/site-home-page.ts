import { Component, inject } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageStore } from '@core/i18n/language-store';

import { SiteFooter } from '../footer/site-footer';
import { HOME_SECTIONS } from './site-home-sections';

@Component({
  selector: 'app-site-home-page',
  imports: [TranslocoPipe, SiteFooter],
  templateUrl: './site-home-page.html',
  styleUrl: './site-home-page.css',
})
export class SiteHomePage {
  protected readonly lang = inject(LanguageStore).activeLang;
  protected readonly sections = HOME_SECTIONS;
}
