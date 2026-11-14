import { Component, input } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { type SiteLang } from '@core/i18n/site-lang';

import { SiteHomeExternalIcon } from '../external-icon/site-home-external-icon';
import { SiteHomeFluidBackdrop } from '../fluid/backdrop/site-home-fluid-backdrop';
import { SiteHomeFooter } from '../footer/site-home-footer';
import { HOME_LINKS } from '../site-home-links';

@Component({
  selector: 'app-site-home-contact',
  imports: [TranslocoPipe, SiteHomeFluidBackdrop, SiteHomeExternalIcon, SiteHomeFooter],
  templateUrl: './site-home-contact.html',
  styleUrl: './site-home-contact.css',
})
export class SiteHomeContact {
  readonly lang = input.required<SiteLang>();

  protected readonly links = HOME_LINKS;
}
