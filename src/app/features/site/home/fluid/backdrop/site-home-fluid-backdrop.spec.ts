import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';

import { render } from '@testing-library/angular';
import { type Mock, afterEach, describe, expect, it, vi } from 'vitest';

import { FluidLoop } from '../fluid-loop';
import { SiteHomeFluidBackdrop } from './site-home-fluid-backdrop';

type Gl = { viewport: Mock; uniform4f: Mock };

const stubWebGL = (): Gl => {
  const own: Gl & Record<string, unknown> = {
    getProgramParameter: () => true,
    getUniformLocation: () => ({}),
    viewport: vi.fn(),
    uniform4f: vi.fn(),
  };
  const gl = new Proxy(own, {
    get: (target, key: string) => (key in target ? target[key] : vi.fn()),
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => gl) as never);
  return own;
};

const stubFrames = (): ((ms: number) => void) & { pending: () => number } => {
  const frames = new Map<number, FrameRequestCallback>();
  let next = 1;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(next, callback);
    return next++;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  const run = (ms: number): void => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(ms));
  };
  return Object.assign(run, { pending: () => frames.size });
};

const trackRemoval = (): Mock => {
  const removed = vi.fn();
  const add = FluidLoop.prototype.add;
  vi.spyOn(FluidLoop.prototype, 'add').mockImplementation(function (this: FluidLoop, layer) {
    const remove = add.call(this, layer);
    return () => {
      removed();
      remove();
    };
  });
  return removed;
};

const renderBackdrop = async (
  edge: 1 | -1,
): Promise<{ fixture: ComponentFixture<SiteHomeFluidBackdrop>; host: HTMLElement; canvas: HTMLCanvasElement }> => {
  const { fixture } = await render(SiteHomeFluidBackdrop, {
    inputs: { edge },
    providers: [provideZonelessChangeDetection(), FluidLoop],
  });
  const host = fixture.nativeElement as HTMLElement;
  return { fixture, host, canvas: host.querySelector('canvas')! };
};

const size = (canvas: HTMLCanvasElement, width: number, height: number): void => {
  Object.defineProperty(canvas, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(canvas, 'clientHeight', { value: height, configurable: true });
};

describe('SiteHomeFluidBackdrop', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should stay flat without WebGL', async () => {
    const { host } = await renderBackdrop(1);

    expect(host).toHaveAttribute('data-fluid', 'flat');
    expect(host).toHaveAttribute('aria-hidden', 'true');
    expect(host).toHaveAttribute('data-edge', '1');
  });

  it('should go live after its first frame and back to flat when the context is lost', async () => {
    const gl = stubWebGL();
    const runFrame = stubFrames();
    const removed = trackRemoval();
    const { fixture, host, canvas } = await renderBackdrop(-1);
    size(canvas, 800, 400);

    expect(host).toHaveAttribute('data-fluid', 'flat');
    runFrame(0);
    await fixture.whenStable();
    expect(host).toHaveAttribute('data-fluid', 'live');
    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 800, 400);
    expect(gl.uniform4f).toHaveBeenCalledWith(expect.anything(), -1, 60, 1, 1);

    canvas.dispatchEvent(new Event('webglcontextlost'));
    await fixture.whenStable();
    expect(host).toHaveAttribute('data-fluid', 'flat');
    expect(removed).toHaveBeenCalledTimes(1);

    gl.viewport.mockClear();
    runFrame(16);
    await fixture.whenStable();
    expect(gl.viewport).not.toHaveBeenCalled();
    expect(host).toHaveAttribute('data-fluid', 'flat');
  });

  it('should resize the buffer only when the size changed and clamp the pixel ratio', async () => {
    stubWebGL();
    const runFrame = stubFrames();
    vi.stubGlobal('devicePixelRatio', 3);
    const { canvas } = await renderBackdrop(1);
    const writes: number[] = [];
    let width = 300;
    Object.defineProperty(canvas, 'width', {
      get: () => width,
      set: (value: number) => {
        writes.push(value);
        width = value;
      },
      configurable: true,
    });
    size(canvas, 800, 400);

    runFrame(0);
    runFrame(16);
    expect(writes).toEqual([1200]);

    size(canvas, 1000, 400);
    runFrame(32);
    expect(writes).toEqual([1200, 1500]);
  });

  it('should limit the buffer to 2000 pixels on its longest side', async () => {
    const gl = stubWebGL();
    const runFrame = stubFrames();
    const { canvas } = await renderBackdrop(1);
    size(canvas, 4000, 1000);

    runFrame(0);

    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 2000, 500);
  });

  it('should keep a two pixel buffer for an empty element', async () => {
    const gl = stubWebGL();
    const runFrame = stubFrames();
    await renderBackdrop(1);

    runFrame(0);

    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 2, 2);
  });

  it('should measure its final geometry on the first frame and draw once under reduced motion', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const gl = stubWebGL();
    const runFrame = stubFrames();
    const { fixture, host, canvas } = await renderBackdrop(1);
    const laidOut = (value: number): number => (getComputedStyle(canvas).display === 'none' ? 0 : value);
    Object.defineProperty(canvas, 'clientWidth', { get: () => laidOut(800) });
    Object.defineProperty(canvas, 'clientHeight', { get: () => laidOut(400) });

    runFrame(0);
    await fixture.whenStable();

    expect(gl.viewport).toHaveBeenCalledTimes(1);
    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 800, 400);
    expect(runFrame.pending()).toBe(0);
    expect(host).toHaveAttribute('data-edge', '1');
  });

  it('should leave the loop on destroy and ignore a draw scheduled before it', async () => {
    const gl = stubWebGL();
    const runFrame = stubFrames();
    const removed = trackRemoval();
    const add = vi.spyOn(FluidLoop.prototype, 'add');
    const { fixture } = await renderBackdrop(1);
    const layer = add.mock.calls[0]![0];
    runFrame(0);
    gl.viewport.mockClear();

    fixture.destroy();

    expect(removed).toHaveBeenCalledTimes(1);
    expect(() => layer.draw(1)).not.toThrow();
    expect(gl.viewport).not.toHaveBeenCalled();
  });
});
