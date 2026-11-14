import { Component } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { SiteHomeSectionHead } from '../section-head/site-home-section-head';
import { SiteHomeTechList } from '../tech/site-home-tech-list';
import { SKILL_ROWS } from './skills';

@Component({
  selector: 'app-site-home-skills',
  imports: [TranslocoPipe, SiteHomeSectionHead, SiteHomeTechList],
  templateUrl: './site-home-skills.html',
  styleUrl: './site-home-skills.css',
})
export class SiteHomeSkills {
  protected readonly rows = SKILL_ROWS;
}
