import { Component, input } from '@angular/core';

@Component({
  selector: 'app-site-home-section-head',
  templateUrl: './site-home-section-head.html',
  styleUrl: './site-home-section-head.css',
  host: { class: 'head', 'data-testid': 'section-head' },
})
export class SiteHomeSectionHead {
  readonly title = input.required<string>();
  readonly lede = input.required<string>();
  readonly index = input.required<number>();
}
