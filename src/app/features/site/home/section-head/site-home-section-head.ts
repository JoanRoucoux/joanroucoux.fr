import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';

import { ATLAS_SIZE, FluidAtlas } from '../fluid/fluid-atlas';
import { FluidLoop } from '../fluid/fluid-loop';

const SOURCE_WIDTH = 512;
const SOURCE_HEIGHT = 128;
const SOURCE_CROP_WIDTH = 380;
const BLUR = 0.12;
const MAX_PIXEL_RATIO = 2;
const SAFARI_BLUR_DIVISOR = 8;

type Scratch = { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D };

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

  protected readonly on = signal(false);

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly #loop = inject(FluidLoop);
  readonly #atlas = inject(FluidAtlas);
  readonly #destroyRef = inject(DestroyRef);
  #scratch: Scratch | undefined;

  constructor() {
    afterNextRender(() => this.#start());
  }

  #start(): void {
    const canvas = this.#host.querySelector('canvas')!;
    const heading = this.#host.querySelector('h2')!;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    let alive = true;
    let remove: (() => void) | undefined;
    const stop = (): void => {
      alive = false;
      remove?.();
    };
    this.#destroyRef.onDestroy(stop);
    void document.fonts.ready.then(() => {
      if (!alive) {
        return;
      }
      remove = this.#loop.add({
        element: heading,
        draw: (seconds) => {
          if (alive && !this.#draw(heading, canvas, context, seconds)) {
            this.on.set(false);
            context.clearRect(0, 0, canvas.width, canvas.height);
            stop();
          }
        },
      });
    });
  }

  #draw(
    heading: HTMLHeadingElement,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    seconds: number,
  ): boolean {
    const source = this.#atlas.render(SOURCE_WIDTH, SOURCE_HEIGHT, { seconds });
    if (!source) {
      return false;
    }
    const rect = heading.getBoundingClientRect();
    const style = getComputedStyle(heading);
    const fontSize = parseFloat(style.fontSize);
    const ratio = Math.min(devicePixelRatio, MAX_PIXEL_RATIO);
    const pad = fontSize * 0.2 * ratio;
    const width = Math.round(rect.width * ratio);
    const height = Math.round(rect.height * ratio + pad * 2);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const blur = fontSize * ratio * BLUR;
    const sourceX = (this.index() * 37) % 120;
    const sourceY = ATLAS_SIZE - SOURCE_HEIGHT;
    context.globalCompositeOperation = 'source-over';
    context.clearRect(0, 0, width, height);
    context.imageSmoothingQuality = 'high';
    const hasFilter = Reflect.has(context, 'filter');
    if (hasFilter) {
      context.filter = `blur(${blur}px)`;
      context.drawImage(
        source,
        sourceX,
        sourceY,
        SOURCE_CROP_WIDTH,
        SOURCE_HEIGHT,
        -3 * blur,
        -3 * blur,
        width + 6 * blur,
        height + 6 * blur,
      );
      context.filter = 'none';
    } else {
      const small = this.#small(
        Math.max(1, Math.round(width / SAFARI_BLUR_DIVISOR)),
        Math.max(1, Math.round(height / SAFARI_BLUR_DIVISOR)),
      );
      small.context.drawImage(
        source,
        sourceX,
        sourceY,
        SOURCE_CROP_WIDTH,
        SOURCE_HEIGHT,
        0,
        0,
        small.canvas.width,
        small.canvas.height,
      );
      context.drawImage(small.canvas, -3 * blur, -3 * blur, width + 6 * blur, height + 6 * blur);
    }

    context.globalCompositeOperation = 'destination-in';
    context.font = `${style.fontWeight} ${fontSize * ratio}px ${style.fontFamily}`;
    context.letterSpacing = `${(parseFloat(style.letterSpacing) || 0) * ratio}px`;
    context.textBaseline = 'alphabetic';
    const metrics = context.measureText('Hg');
    const y =
      pad +
      (rect.height * ratio - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent)) / 2 +
      metrics.fontBoundingBoxAscent;
    context.fillText(this.title(), 0, y);
    this.on.set(true);
    return true;
  }

  #small(width: number, height: number): Scratch {
    if (!this.#scratch) {
      const canvas = document.createElement('canvas');
      this.#scratch = { canvas, context: canvas.getContext('2d')! };
    }
    if (this.#scratch.canvas.width !== width || this.#scratch.canvas.height !== height) {
      this.#scratch.canvas.width = width;
      this.#scratch.canvas.height = height;
    }
    return this.#scratch;
  }
}
