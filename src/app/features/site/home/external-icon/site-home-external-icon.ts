import { Component } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-site-home-external-icon',
  imports: [TranslocoPipe],
  template: `<svg aria-hidden="true" class="x" viewBox="0 0 24 24">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
    <span class="sr-only">{{ 'site.home.newTab' | transloco }}</span>`,
  styles: `
    :host {
      display: contents;
    }

    .x {
      width: 0.95em;
      height: 0.95em;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex: none;
    }
  `,
})
export class SiteHomeExternalIcon {}
