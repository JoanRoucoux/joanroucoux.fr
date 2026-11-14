import { Component, inject } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageStore } from '@core/i18n/language-store';

import { SiteFooter } from '../footer/site-footer';
import { FluidAtlas } from './fluid/fluid-atlas';
import { FluidLoop } from './fluid/fluid-loop';
import { SiteHomeFluidHalo } from './fluid/halo/site-home-fluid-halo';
import { SiteHomeNav } from './nav/site-home-nav';
import { HOME_SECTIONS } from './site-home-sections';

@Component({
  selector: 'app-site-home-page',
  imports: [TranslocoPipe, SiteFooter, SiteHomeFluidHalo, SiteHomeNav],
  providers: [FluidLoop, FluidAtlas],
  templateUrl: './site-home-page.html',
  styleUrl: './site-home-page.css',
})
export class SiteHomePage {
  protected readonly lang = inject(LanguageStore).activeLang;
  protected readonly sections = HOME_SECTIONS;
}
