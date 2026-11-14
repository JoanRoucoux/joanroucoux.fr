import { Component } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { SiteHomeExternalIcon } from '../external-icon/site-home-external-icon';
import { SiteHomeSectionHead } from '../section-head/site-home-section-head';
import { SiteHomeTechList } from '../tech/site-home-tech-list';
import { ARTICLES } from './articles';

@Component({
  selector: 'app-site-home-articles',
  imports: [TranslocoPipe, SiteHomeExternalIcon, SiteHomeSectionHead, SiteHomeTechList],
  templateUrl: './site-home-articles.html',
  styleUrl: './site-home-articles.css',
})
export class SiteHomeArticles {
  protected readonly articles = ARTICLES;
}
