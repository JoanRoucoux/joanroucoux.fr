import { Component } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { SiteHomeExternalIcon } from '../external-icon/site-home-external-icon';
import { SiteHomeSectionHead } from '../section-head/site-home-section-head';
import { CERTIFICATIONS } from './certifications';

@Component({
  selector: 'app-site-home-certifications',
  imports: [TranslocoPipe, SiteHomeExternalIcon, SiteHomeSectionHead],
  templateUrl: './site-home-certifications.html',
  styleUrl: './site-home-certifications.css',
})
export class SiteHomeCertifications {
  protected readonly certifications = CERTIFICATIONS;
}
