import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';

import { FluidLoop } from '../fluid-loop';
import { createFluidSurface } from '../fluid-surface';

const MAX_PIXEL_RATIO = 1.5;
const MAX_SIDE = 2000;

@Component({
  selector: 'app-site-home-fluid-backdrop',
  templateUrl: './site-home-fluid-backdrop.html',
  styleUrl: './site-home-fluid-backdrop.css',
  host: {
    'aria-hidden': 'true',
    '[attr.data-fluid]': 'state()',
    '[attr.data-edge]': 'edge()',
  },
})
export class SiteHomeFluidBackdrop {
  readonly edge = input.required<1 | -1>();

  protected readonly state = signal<'flat' | 'live'>('flat');

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly #loop = inject(FluidLoop);
  readonly #destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.#start());
  }

  #start(): void {
    const canvas = this.#host.querySelector('canvas')!;
    let alive = true;
    const stop = (): void => {
      alive = false;
      remove();
    };
    const surface = createFluidSurface(canvas, () => {
      this.state.set('flat');
      stop();
    });
    if (!surface) {
      return;
    }
    const remove = this.#loop.add({
      element: this.#host,
      draw: (seconds) => {
        if (!alive) {
          return;
        }
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const scale = Math.min(Math.min(devicePixelRatio, MAX_PIXEL_RATIO), MAX_SIDE / Math.max(width, height, 1));
        const bufferWidth = Math.max(2, Math.round(width * scale));
        const bufferHeight = Math.max(2, Math.round(height * scale));
        if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
          canvas.width = bufferWidth;
          canvas.height = bufferHeight;
        }
        surface.draw(bufferWidth, bufferHeight, { seconds, edge: this.edge(), scale });
        this.state.set('live');
      },
    });
    this.#destroyRef.onDestroy(stop);
  }
}
