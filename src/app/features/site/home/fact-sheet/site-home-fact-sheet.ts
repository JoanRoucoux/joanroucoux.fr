import { Component, computed, input } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { type Availability } from '../availability';

@Component({
  selector: 'app-site-home-fact-sheet',
  imports: [TranslocoPipe],
  templateUrl: './site-home-fact-sheet.html',
  styleUrl: './site-home-fact-sheet.css',
})
export class SiteHomeFactSheet {
  readonly availability = input.required<Availability>();
  readonly years = input.required<number>();

  protected readonly missionKey = computed(() =>
    this.availability().state === 'available' ? 'lastMission' : 'currentMission',
  );
}
