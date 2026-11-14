import { Component, input } from '@angular/core';

import type { Experience } from '../experiences';

@Component({
  selector: 'app-site-home-experience-logo',
  templateUrl: './site-home-experience-logo.html',
  styleUrl: './site-home-experience-logo.css',
})
export class SiteHomeExperienceLogo {
  readonly logo = input.required<Experience['logo']>();
  readonly label = input.required<string>();
}
