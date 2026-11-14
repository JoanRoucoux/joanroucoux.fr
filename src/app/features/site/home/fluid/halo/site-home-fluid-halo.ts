import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';

import { ATLAS_SIZE, FluidAtlas } from '../fluid-atlas';
import { FluidLoop } from '../fluid-loop';

const HALO_WIDTH = 192;

@Component({
  selector: 'app-site-home-fluid-halo',
  templateUrl: './site-home-fluid-halo.html',
  styleUrl: './site-home-fluid-halo.css',
  host: {
    'aria-hidden': 'true',
    '[attr.data-fluid]': 'state()',
  },
})
export class SiteHomeFluidHalo {
  readonly animated = input(true);

  protected readonly state = signal<'flat' | 'live'>('flat');

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly #loop = inject(FluidLoop);
  readonly #atlas = inject(FluidAtlas);
  readonly #destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.#start());
  }

  #start(): void {
    const canvas = this.#host.querySelector('canvas')!;
    const context = this.animated() ? canvas.getContext('2d') : null;
    if (!context) {
      return;
    }
    let alive = true;
    const stop = (): void => {
      alive = false;
      remove();
    };
    const remove = this.#loop.add({
      element: this.#host,
      draw: (seconds) => {
        if (!alive) {
          return;
        }
        const height = Math.min(ATLAS_SIZE, Math.max(2, Math.round((HALO_WIDTH * innerHeight) / innerWidth)));
        const source = this.#atlas.render(HALO_WIDTH, height, { seconds, light: true });
        if (!source) {
          this.state.set('flat');
          stop();
          return;
        }
        if (canvas.width !== HALO_WIDTH || canvas.height !== height) {
          canvas.width = HALO_WIDTH;
          canvas.height = height;
        }
        context.drawImage(source, 0, ATLAS_SIZE - height, HALO_WIDTH, height, 0, 0, HALO_WIDTH, height);
        this.state.set('live');
      },
    });
    this.#destroyRef.onDestroy(stop);
  }
}
