import { Component, inject } from '@angular/core';

import { LanguageStore } from '@core/i18n/language-store';

import { SiteHomeArticles } from './articles/site-home-articles';
import { AVAILABILITY } from './availability';
import { SiteHomeCertifications } from './certifications/site-home-certifications';
import { SiteHomeContact } from './contact/site-home-contact';
import { CAREER_START, fullYearsSince } from './experience-years';
import { SiteHomeExperiences } from './experiences/site-home-experiences';
import { SiteHomeFactSheet } from './fact-sheet/site-home-fact-sheet';
import { FluidAtlas } from './fluid/fluid-atlas';
import { FluidLoop } from './fluid/fluid-loop';
import { SiteHomeFluidHalo } from './fluid/halo/site-home-fluid-halo';
import { SiteHomeHero } from './hero/site-home-hero';
import { SiteHomeNav } from './nav/site-home-nav';
import { SiteHomeProjects } from './projects/site-home-projects';
import { HOME_SECTIONS } from './site-home-sections';
import { SiteHomeSkills } from './skills/site-home-skills';

@Component({
  selector: 'app-site-home-page',
  imports: [
    SiteHomeContact,
    SiteHomeArticles,
    SiteHomeCertifications,
    SiteHomeExperiences,
    SiteHomeFactSheet,
    SiteHomeFluidHalo,
    SiteHomeHero,
    SiteHomeNav,
    SiteHomeProjects,
    SiteHomeSkills,
  ],
  providers: [FluidLoop, FluidAtlas],
  templateUrl: './site-home-page.html',
  styleUrl: './site-home-page.css',
})
export class SiteHomePage {
  protected readonly lang = inject(LanguageStore).activeLang;
  protected readonly sections = HOME_SECTIONS;
  protected readonly availability = AVAILABILITY;
  protected readonly years = fullYearsSince(CAREER_START, new Date());
}
