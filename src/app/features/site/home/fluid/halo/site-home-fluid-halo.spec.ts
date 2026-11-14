import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';

import { render } from '@testing-library/angular';
import { type Mock, afterEach, describe, expect, it, vi } from 'vitest';

import { FluidAtlas } from '../fluid-atlas';
import { FluidLoop } from '../fluid-loop';
import { SiteHomeFluidHalo } from './site-home-fluid-halo';

type Stubs = { gl: { viewport: Mock; uniform1f: Mock }; draw: Mock };

const stubContexts = (): Stubs => {
  const own = {
    getProgramParameter: () => true,
    getUniformLocation: () => ({}),
    viewport: vi.fn(),
    uniform1f: vi.fn(),
  };
  const gl = new Proxy(own, {
    get: (target, key: string) => (key in target ? target[key as keyof typeof target] : vi.fn()),
  });
  const draw = vi.fn();
  const context2d = { drawImage: draw };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) =>
    type === '2d' ? context2d : gl) as never);
  return { gl: own, draw };
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

const renderHalo = async (
  inputs: { animated?: boolean } = {},
): Promise<{ fixture: ComponentFixture<SiteHomeFluidHalo>; host: HTMLElement; canvas: HTMLCanvasElement }> => {
  const { fixture } = await render(SiteHomeFluidHalo, {
    inputs,
    providers: [provideZonelessChangeDetection(), FluidLoop, FluidAtlas],
  });
  const host = fixture.nativeElement as HTMLElement;
  return { fixture, host, canvas: host.querySelector('canvas')! };
};

describe('SiteHomeFluidHalo', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should stay flat without WebGL', async () => {
    const { host } = await renderHalo();

    expect(host).toHaveAttribute('data-fluid', 'flat');
    expect(host).toHaveAttribute('aria-hidden', 'true');
  });

  it('should stay flat with WebGL when it is not animated', async () => {
    const { draw } = stubContexts();
    const runFrame = stubFrames();
    const { fixture, host } = await renderHalo({ animated: false });

    runFrame(0);
    await fixture.whenStable();

    expect(draw).not.toHaveBeenCalled();
    expect(host).toHaveAttribute('data-fluid', 'flat');
  });

  it('should go live after a frame and copy the bottom left corner of the atlas', async () => {
    const { gl, draw } = stubContexts();
    const runFrame = stubFrames();
    vi.stubGlobal('innerWidth', 1000);
    vi.stubGlobal('innerHeight', 500);
    const { fixture, host, canvas } = await renderHalo();

    expect(host).toHaveAttribute('data-fluid', 'flat');
    runFrame(0);
    await fixture.whenStable();

    expect(host).toHaveAttribute('data-fluid', 'live');
    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 192, 96);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 1);
    expect(draw).toHaveBeenCalledWith(expect.anything(), 0, 416, 192, 96, 0, 0, 192, 96);
    expect(canvas.width).toBe(192);
    expect(canvas.height).toBe(96);
  });

  it('should resize its canvas only when the viewport ratio changed', async () => {
    stubContexts();
    const runFrame = stubFrames();
    vi.stubGlobal('innerWidth', 1000);
    vi.stubGlobal('innerHeight', 500);
    const { canvas } = await renderHalo();
    const writes: number[] = [];
    let height = 150;
    Object.defineProperty(canvas, 'height', {
      get: () => height,
      set: (value: number) => {
        writes.push(value);
        height = value;
      },
      configurable: true,
    });

    runFrame(0);
    runFrame(16);
    expect(writes).toEqual([96]);

    vi.stubGlobal('innerHeight', 250);
    runFrame(32);
    expect(writes).toEqual([96, 48]);
  });

  it('should fall back to flat when the atlas context is lost', async () => {
    const { draw } = stubContexts();
    const runFrame = stubFrames();
    const removed = trackRemoval();
    const { fixture, host } = await renderHalo();
    runFrame(0);
    await fixture.whenStable();
    expect(host).toHaveAttribute('data-fluid', 'live');

    const getContext = vi.mocked(HTMLCanvasElement.prototype.getContext);
    const atlasCanvas = getContext.mock.contexts[
      getContext.mock.calls.findIndex(([type]) => type === 'webgl')
    ] as HTMLCanvasElement;
    atlasCanvas.dispatchEvent(new Event('webglcontextlost'));
    draw.mockClear();
    runFrame(16);
    await fixture.whenStable();

    expect(host).toHaveAttribute('data-fluid', 'flat');
    expect(draw).not.toHaveBeenCalled();
    expect(removed).toHaveBeenCalledTimes(1);
  });

  it('should cap its height to the atlas size on a very tall viewport', async () => {
    const { gl, draw } = stubContexts();
    const runFrame = stubFrames();
    vi.stubGlobal('innerWidth', 100);
    vi.stubGlobal('innerHeight', 1000);
    await renderHalo();

    runFrame(0);

    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 192, 512);
    expect(draw).toHaveBeenCalledWith(expect.anything(), 0, 0, 192, 512, 0, 0, 192, 512);
  });

  it('should draw exactly one frame under reduced motion', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { draw } = stubContexts();
    const runFrame = stubFrames();
    const { fixture, host } = await renderHalo();

    runFrame(0);
    await fixture.whenStable();

    expect(draw).toHaveBeenCalledTimes(1);
    expect(host).toHaveAttribute('data-fluid', 'live');
    expect(runFrame.pending()).toBe(0);
  });

  it('should leave the loop on destroy and ignore a draw scheduled before it', async () => {
    const { draw } = stubContexts();
    const runFrame = stubFrames();
    const removed = trackRemoval();
    const add = vi.spyOn(FluidLoop.prototype, 'add');
    const { fixture } = await renderHalo();
    const layer = add.mock.calls[0]![0];
    runFrame(0);
    draw.mockClear();

    fixture.destroy();

    expect(removed).toHaveBeenCalledTimes(1);
    expect(() => layer.draw(1)).not.toThrow();
    expect(draw).not.toHaveBeenCalled();
  });
});
