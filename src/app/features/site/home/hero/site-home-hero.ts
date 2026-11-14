import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslocoPipe } from '@jsverse/transloco';

import { type SiteLang } from '@core/i18n/site-lang';

import { SITE_PATHS } from '../../contract/site-paths';
import { type Availability, availabilityBadge } from '../availability';
import { SiteHomeExternalIcon } from '../external-icon/site-home-external-icon';
import { SiteHomeFluidBackdrop } from '../fluid/backdrop/site-home-fluid-backdrop';
import { HOME_LINKS } from '../site-home-links';
import { HOME_SECTIONS } from '../site-home-sections';

@Component({
  selector: 'app-site-home-hero',
  imports: [RouterLink, TranslocoPipe, SiteHomeFluidBackdrop, SiteHomeExternalIcon],
  templateUrl: './site-home-hero.html',
  styleUrl: './site-home-hero.css',
})
export class SiteHomeHero {
  readonly lang = input.required<SiteLang>();
  readonly availability = input.required<Availability>();

  protected readonly cv = HOME_LINKS.cv;
  protected readonly homeUrl = computed(() => `/${SITE_PATHS.home[this.lang()]}`);
  protected readonly contact = computed(() => HOME_SECTIONS.contact[this.lang()]);
  protected readonly badge = computed(() => availabilityBadge(this.availability(), this.lang()));
}
