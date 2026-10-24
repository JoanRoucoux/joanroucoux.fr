import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslocoPipe } from '@jsverse/transloco';

import { SITE_PATHS } from '@features/site/contract/site-paths';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './not-found-page.html',
})
export class NotFoundPage {
  protected readonly homePaths = SITE_PATHS;
}
