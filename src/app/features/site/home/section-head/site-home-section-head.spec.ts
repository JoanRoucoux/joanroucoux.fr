import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';

import { render, screen } from '@testing-library/angular';
import { type Mock, afterEach, describe, expect, it, vi } from 'vitest';

import { FluidAtlas } from '../fluid/fluid-atlas';
import { FluidLoop } from '../fluid/fluid-loop';
import { SiteHomeSectionHead } from './site-home-section-head';

type Stubs = {
  filters: string[];
  context: Record<string, unknown> & { drawImage: Mock; fillText: Mock };
  atlasCanvas: () => HTMLCanvasElement;
};

const stubContexts = (options: { filter?: boolean; webgl?: boolean } = {}): Stubs => {
  const context: Stubs['context'] = {
    drawImage: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    measureText: () => ({ fontBoundingBoxAscent: 30, fontBoundingBoxDescent: 10 }),
  };
  const filters: string[] = [];
  if (options.filter ?? true) {
    Object.defineProperty(context, 'filter', {
      get: () => filters.at(-1) ?? 'none',
      set: (value: string) => filters.push(value),
      enumerable: true,
      configurable: true,
    });
  }
  const own = { getProgramParameter: () => true, getUniformLocation: () => ({}) };
  const gl = new Proxy(own, {
    get: (target, key: string) => (key in target ? target[key as keyof typeof target] : vi.fn()),
  });
  const spy = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(((type: string) => (type === '2d' ? context : (options.webgl ?? true) ? gl : null)) as never);
  return {
    filters,
    context,
    atlasCanvas: () => spy.mock.contexts[spy.mock.calls.findIndex(([type]) => type === 'webgl')] as HTMLCanvasElement,
  };
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

const stubFonts = (ready: Promise<unknown> = Promise.resolve(), letterSpacing = '-1px'): void => {
  Object.defineProperty(document, 'fonts', { value: { ready }, configurable: true });
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    fontSize: '40px',
    fontWeight: '700',
    fontFamily: 'Bricolage',
    letterSpacing,
  } as CSSStyleDeclaration);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width: 200, height: 40 } as DOMRect);
};

const renderHead = async (): Promise<{
  fixture: ComponentFixture<SiteHomeSectionHead>;
  heading: HTMLElement;
  canvas: HTMLCanvasElement;
}> => {
  const { fixture } = await render(SiteHomeSectionHead, {
    inputs: { title: 'Skills', lede: 'What I work with', index: 4 },
    providers: [provideZonelessChangeDetection(), FluidLoop, FluidAtlas],
  });
  const heading = screen.getByRole('heading', { level: 2 });
  return { fixture, heading, canvas: heading.querySelector('canvas')! };
};

const settle = async (fixture: ComponentFixture<unknown>): Promise<void> => {
  await Promise.resolve();
  await fixture.whenStable();
};

describe('SiteHomeSectionHead', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'fonts');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should render the title as a level 2 heading and the lede under it', async () => {
    const { heading } = await renderHead();

    expect(heading).toHaveTextContent('Skills');
    expect(screen.getByTestId('lede')).toHaveTextContent('What I work with');
  });

  it('should keep plain ink and the real text without WebGL', async () => {
    const { heading, canvas } = await renderHead();

    expect(heading).not.toHaveClass('on');
    expect(heading.textContent).toBe('Skills');
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  it('should turn the letters into fluid after fonts are ready and the first draw', async () => {
    const { context, atlasCanvas, filters } = stubContexts();
    stubFonts();
    const runFrame = stubFrames();
    const { fixture, heading } = await renderHead();
    await settle(fixture);

    expect(heading).not.toHaveClass('on');
    runFrame(0);
    await fixture.whenStable();

    expect(heading).toHaveClass('on');
    vi.mocked(window.getComputedStyle).mockRestore();
    expect(screen.getByRole('heading', { level: 2, name: 'Skills' })).toBeInTheDocument();
    const [source, sx, sy, sw, sh, dx, , dw] = context.drawImage.mock.calls[0]!;
    expect(source).toBe(atlasCanvas());
    expect([sx, sy, sw, sh]).toEqual([28, 384, 380, 128]);
    expect(dx).toBeCloseTo(-14.4);
    expect(dw).toBeCloseTo(228.8);
    expect(filters).toEqual(['blur(4.8px)', 'none']);
    expect(context.fillText).toHaveBeenCalledWith('Skills', 0, expect.any(Number));
  });

  it('should blur through a smaller canvas when the context has no filter', async () => {
    const { context, atlasCanvas } = stubContexts({ filter: false });
    stubFonts(Promise.resolve(), 'normal');
    const runFrame = stubFrames();
    const { fixture, heading } = await renderHead();
    await settle(fixture);
    runFrame(0);
    runFrame(16);
    await fixture.whenStable();

    expect(heading).toHaveClass('on');
    expect('filter' in context).toBe(false);
    const [first, , , , , , , smallWidth, smallHeight] = context.drawImage.mock.calls[0]!;
    expect(first).toBe(atlasCanvas());
    expect([smallWidth, smallHeight]).toEqual([25, 7]);
    const [second] = context.drawImage.mock.calls[1]!;
    expect(second).toBeInstanceOf(HTMLCanvasElement);
    expect(second).not.toBe(atlasCanvas());
  });

  it('should reallocate the scratch canvas only when its size changed', async () => {
    const { context } = stubContexts({ filter: false });
    stubFonts();
    const runFrame = stubFrames();
    const { fixture } = await renderHead();
    await settle(fixture);
    runFrame(0);
    const scratch = context.drawImage.mock.calls[1]![0] as HTMLCanvasElement;
    const writes: string[] = [];
    Object.defineProperty(scratch, 'width', { get: () => 25, set: () => writes.push('width'), configurable: true });
    Object.defineProperty(scratch, 'height', { get: () => 7, set: () => writes.push('height'), configurable: true });

    runFrame(16);

    expect(writes).toEqual([]);
  });

  it('should draw exactly one frame under reduced motion', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { context } = stubContexts();
    stubFonts();
    const runFrame = stubFrames();
    const { fixture, heading } = await renderHead();
    await settle(fixture);

    runFrame(0);
    await fixture.whenStable();

    expect(heading).toHaveClass('on');
    expect(context.fillText).toHaveBeenCalledTimes(1);
    expect(runFrame.pending()).toBe(0);
  });

  it('should stay plain ink when the atlas has no WebGL', async () => {
    stubContexts({ webgl: false });
    stubFonts();
    const runFrame = stubFrames();
    const removed = trackRemoval();
    const { fixture, heading } = await renderHead();
    await settle(fixture);

    runFrame(0);
    await fixture.whenStable();

    expect(heading).not.toHaveClass('on');
    expect(Element.prototype.getBoundingClientRect).not.toHaveBeenCalled();
    expect(removed).toHaveBeenCalledTimes(1);
  });

  it('should return to plain ink when the atlas context is lost', async () => {
    const { atlasCanvas, context } = stubContexts();
    stubFonts();
    const runFrame = stubFrames();
    const removed = trackRemoval();
    const { fixture, heading, canvas } = await renderHead();
    await settle(fixture);
    runFrame(0);
    await fixture.whenStable();
    expect(heading).toHaveClass('on');
    const clearRect = vi.mocked(context['clearRect'] as Mock);
    clearRect.mockClear();

    atlasCanvas().dispatchEvent(new Event('webglcontextlost'));
    runFrame(16);
    await fixture.whenStable();

    expect(heading).not.toHaveClass('on');
    expect(clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
    expect(removed).toHaveBeenCalledTimes(1);
  });

  it('should never register when destroyed before fonts are ready', async () => {
    stubContexts();
    let release!: () => void;
    stubFonts(new Promise<void>((resolve) => (release = resolve)));
    stubFrames();
    const add = vi.spyOn(FluidLoop.prototype, 'add');
    const { fixture } = await renderHead();

    fixture.destroy();
    release();
    await Promise.resolve();

    expect(add).not.toHaveBeenCalled();
  });

  it('should leave the loop on destroy and ignore a draw scheduled before it', async () => {
    const { context } = stubContexts();
    stubFonts();
    const runFrame = stubFrames();
    const removed = trackRemoval();
    const add = vi.spyOn(FluidLoop.prototype, 'add');
    const { fixture } = await renderHead();
    await settle(fixture);
    const layer = add.mock.calls[0]![0];
    runFrame(0);
    context.drawImage.mockClear();

    fixture.destroy();

    expect(removed).toHaveBeenCalledTimes(1);
    expect(() => layer.draw(1)).not.toThrow();
    expect(context.drawImage).not.toHaveBeenCalled();
  });
});
