import { Component, computed, input } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { CORE_STACK, TECH, type TechDef, type TechId } from './tech';

@Component({
  selector: 'app-site-home-tech-list',
  imports: [TranslocoPipe],
  templateUrl: './site-home-tech-list.html',
  styleUrl: './site-home-tech-list.css',
})
export class SiteHomeTechList {
  readonly techs = input.required<readonly TechId[]>();
  readonly size = input<'md' | 'sm'>('md');
  readonly markCore = input(false);

  protected readonly items = computed(() =>
    this.techs().map((id) => {
      const def: TechDef = TECH[id];
      return {
        id,
        label: def.label,
        icon: def.icon,
        core: this.markCore() && CORE_STACK.has(id),
      };
    }),
  );
}
