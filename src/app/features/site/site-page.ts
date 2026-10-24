import { Component } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-site-page',
  imports: [TranslocoPipe],
  templateUrl: './site-page.html',
})
export class SitePage {}
