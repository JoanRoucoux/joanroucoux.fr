import { Component } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-legal-page',
  imports: [TranslocoPipe],
  templateUrl: './legal-page.html',
})
export class LegalPage {}
