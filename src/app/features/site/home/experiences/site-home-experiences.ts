import { Component } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { SiteHomeSectionHead } from '../section-head/site-home-section-head';
import { SiteHomeTechList } from '../tech/site-home-tech-list';
import { EXPERIENCES } from './experiences';
import { SiteHomeExperienceLogo } from './logo/site-home-experience-logo';

const keys = (count: number): number[] => Array.from({ length: count }, (_, index) => index + 1);

@Component({
  selector: 'app-site-home-experiences',
  imports: [TranslocoPipe, SiteHomeExperienceLogo, SiteHomeSectionHead, SiteHomeTechList],
  templateUrl: './site-home-experiences.html',
  styleUrl: './site-home-experiences.css',
})
export class SiteHomeExperiences {
  protected readonly entries = EXPERIENCES.map((experience) => ({
    ...experience,
    pointKeys: keys(experience.points),
    detailKeys: keys(experience.details),
    factKeys: keys(experience.facts),
  }));
}
