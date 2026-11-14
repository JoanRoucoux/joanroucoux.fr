import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, inject } from '@angular/core';

export type FluidLayer = {
  readonly element: Element;
  draw(seconds: number): void;
};

const START_SECONDS = 40;

@Injectable()
export class FluidLoop {
  readonly still = isPlatformBrowser(inject(PLATFORM_ID))
    ? matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  readonly #layers = new Set<FluidLayer>();
  readonly #visible = new Set<Element>();
  #observer: IntersectionObserver | undefined;
  #frame = 0;
  #started = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.#stop());
  }

  add(layer: FluidLayer): () => void {
    this.#start();
    const observed = this.#uses(layer.element);
    this.#layers.add(layer);
    if (!observed) {
      this.#observer!.observe(layer.element);
    }
    if (this.still) {
      this.#schedule();
    }
    return () => {
      this.#layers.delete(layer);
      if (!this.#uses(layer.element)) {
        this.#visible.delete(layer.element);
        this.#observer!.unobserve(layer.element);
      }
    };
  }

  readonly #onWake = (): void => this.#schedule();

  #start(): void {
    if (this.#started) {
      return;
    }
    this.#started = true;
    this.#observer = new IntersectionObserver((entries) => {
      const relevant = entries.filter(({ target }) => this.#uses(target));
      if (relevant.length === 0) {
        return;
      }
      for (const { target, isIntersecting } of relevant) {
        if (isIntersecting) {
          this.#visible.add(target);
        } else {
          this.#visible.delete(target);
        }
      }
      if (this.still) {
        this.#schedule();
      }
    });
    if (this.still) {
      window.addEventListener('resize', this.#onWake);
      document.addEventListener('visibilitychange', this.#onWake);
    } else {
      this.#frame = requestAnimationFrame(this.#tick);
    }
  }

  #schedule(): void {
    if (!this.#frame) {
      this.#frame = requestAnimationFrame(() => {
        this.#frame = 0;
        this.#drawVisible(START_SECONDS);
      });
    }
  }

  readonly #tick = (ms: number): void => {
    this.#frame = requestAnimationFrame(this.#tick);
    this.#drawVisible(START_SECONDS + ms / 1000);
  };

  #drawVisible(seconds: number): void {
    if (document.hidden) {
      return;
    }
    for (const layer of this.#layers) {
      if (this.#visible.has(layer.element)) {
        layer.draw(seconds);
      }
    }
  }

  #uses(element: Element): boolean {
    return [...this.#layers].some((layer) => layer.element === element);
  }

  #stop(): void {
    if (!this.#started) {
      return;
    }
    cancelAnimationFrame(this.#frame);
    this.#observer!.disconnect();
    window.removeEventListener('resize', this.#onWake);
    document.removeEventListener('visibilitychange', this.#onWake);
  }
}
