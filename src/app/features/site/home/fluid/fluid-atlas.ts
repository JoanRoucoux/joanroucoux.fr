import { Injectable } from '@angular/core';

import { type FluidFrame, type FluidSurface, createFluidSurface } from './fluid-surface';

export const ATLAS_SIZE = 512;

@Injectable()
export class FluidAtlas {
  #canvas: HTMLCanvasElement | undefined;
  #surface: FluidSurface | undefined;
  #lost = false;

  render(width: number, height: number, frame: FluidFrame): HTMLCanvasElement | undefined {
    if (this.#lost) {
      return undefined;
    }
    if (!this.#canvas) {
      const canvas = document.createElement('canvas');
      canvas.width = ATLAS_SIZE;
      canvas.height = ATLAS_SIZE;
      this.#canvas = canvas;
      this.#surface = createFluidSurface(canvas, () => {
        this.#lost = true;
      });
    }
    if (!this.#surface) {
      return undefined;
    }
    this.#surface.draw(width, height, frame);
    return this.#canvas;
  }
}
