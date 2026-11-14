import { Component, inject } from '@angular/core';

import { LanguageStore } from '@core/i18n/language-store';

import { SiteFooter } from '../footer/site-footer';
import { AVAILABILITY } from './availability';
import { CAREER_START, fullYearsSince } from './experience-years';
import { SiteHomeFactSheet } from './fact-sheet/site-home-fact-sheet';
import { FluidAtlas } from './fluid/fluid-atlas';
import { FluidLoop } from './fluid/fluid-loop';
import { SiteHomeFluidHalo } from './fluid/halo/site-home-fluid-halo';
import { SiteHomeHero } from './hero/site-home-hero';
import { SiteHomeNav } from './nav/site-home-nav';

@Component({
  selector: 'app-site-home-page',
  imports: [SiteFooter, SiteHomeFactSheet, SiteHomeFluidHalo, SiteHomeHero, SiteHomeNav],
  providers: [FluidLoop, FluidAtlas],
  templateUrl: './site-home-page.html',
  styleUrl: './site-home-page.css',
})
export class SiteHomePage {
  protected readonly lang = inject(LanguageStore).activeLang;
  protected readonly availability = AVAILABILITY;
  protected readonly years = fullYearsSince(CAREER_START, new Date());
}
