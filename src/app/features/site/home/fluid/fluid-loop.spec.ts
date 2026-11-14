import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FluidLoop } from './fluid-loop';

type Observer = {
  callback: IntersectionObserverCallback;
  observed: Element[];
  disconnect: () => void;
};

type Harness = {
  loop: FluidLoop;
  frames: Map<number, FrameRequestCallback>;
  cancel: Mock<(id: number) => boolean>;
  observers: Observer[];
  runFrame: (ms: number) => void;
  report: (observer: Observer, target: Element, isIntersecting: boolean) => void;
  matchMedia: Mock<() => { matches: boolean }>;
};

type TestLayer = { element: HTMLDivElement; draw: Mock<(seconds: number) => void> };

const harness = (options: { reduced?: boolean; platform?: string; reportOnObserve?: boolean } = {}): Harness => {
  const frames = new Map<number, FrameRequestCallback>();
  let nextId = 1;
  const cancel = vi.fn((id: number) => frames.delete(id));
  const observers: Observer[] = [];
  const report = (observer: Observer, target: Element, isIntersecting: boolean): void =>
    observer.callback([{ target, isIntersecting } as IntersectionObserverEntry], {} as never);

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(nextId, callback);
    return nextId++;
  });
  vi.stubGlobal('cancelAnimationFrame', cancel);
  const matchMedia = vi.fn(() => ({ matches: options.reduced ?? false }));
  vi.stubGlobal('matchMedia', matchMedia);
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      readonly #observer: Observer;
      constructor(callback: IntersectionObserverCallback) {
        this.#observer = { callback, observed: [], disconnect: vi.fn() as () => void };
        observers.push(this.#observer);
      }
      observe(element: Element): void {
        this.#observer.observed.push(element);
        if (options.reportOnObserve ?? true) {
          report(this.#observer, element, true);
        }
      }
      unobserve(element: Element): void {
        this.#observer.observed = this.#observer.observed.filter((e) => e !== element);
      }
      disconnect(): void {
        this.#observer.disconnect();
      }
    },
  );

  TestBed.configureTestingModule({
    providers: [FluidLoop, { provide: PLATFORM_ID, useValue: options.platform ?? 'browser' }],
  });
  const loop = TestBed.inject(FluidLoop);
  const runFrame = (ms: number): void => {
    const pending = [...frames.values()];
    frames.clear();
    for (const run of pending) {
      run(ms);
    }
  };
  return { loop, frames, cancel, observers, runFrame, report, matchMedia };
};

const layer = (): TestLayer => ({
  element: document.createElement('div'),
  draw: vi.fn<(seconds: number) => void>(),
});

describe('FluidLoop', () => {
  beforeEach(() => {
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should draw a visible layer at 40 plus the elapsed seconds', () => {
    const { loop, runFrame } = harness();
    const a = layer();
    loop.add(a);
    runFrame(2000);
    expect(a.draw).toHaveBeenCalledWith(42);
  });

  it('should keep requesting frames', () => {
    const { loop, runFrame, frames } = harness();
    loop.add(layer());
    runFrame(0);
    expect(frames.size).toBe(1);
  });

  it('should start a single loop for several layers', () => {
    const { loop, frames } = harness();
    loop.add(layer());
    loop.add(layer());
    expect(frames.size).toBe(1);
  });

  it('should not draw a layer that is not intersecting', () => {
    const { loop, runFrame, report, observers } = harness();
    const a = layer();
    loop.add(a);
    report(observers[0]!, a.element, false);
    runFrame(1000);
    expect(a.draw).not.toHaveBeenCalled();
    report(observers[0]!, a.element, true);
    runFrame(1000);
    expect(a.draw).toHaveBeenCalledWith(41);
  });

  it('should not draw a layer before it is reported', () => {
    const { loop, runFrame } = harness({ reportOnObserve: false });
    const a = layer();
    loop.add(a);
    runFrame(1000);
    expect(a.draw).not.toHaveBeenCalled();
  });

  it('should not draw while the tab is hidden', () => {
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    const { loop, runFrame } = harness();
    const a = layer();
    loop.add(a);
    runFrame(1000);
    expect(a.draw).not.toHaveBeenCalled();
  });

  it('should stop drawing a removed layer and stop observing it', () => {
    const { loop, runFrame, observers } = harness();
    const a = layer();
    const remove = loop.add(a);
    remove();
    runFrame(1000);
    expect(a.draw).not.toHaveBeenCalled();
    expect(observers[0]!.observed).toEqual([]);
  });

  it('should still draw the other layers when one is removed during a frame', () => {
    const { loop, runFrame } = harness();
    const a = layer();
    const b = layer();
    const c = layer();
    let removeB = (): void => undefined;
    a.draw.mockImplementation(() => removeB());
    loop.add(a);
    removeB = loop.add(b);
    loop.add(c);
    runFrame(1000);
    expect(a.draw).toHaveBeenCalledWith(41);
    expect(b.draw).not.toHaveBeenCalled();
    expect(c.draw).toHaveBeenCalledWith(41);
  });

  it('should ignore an intersection delivered after the layer was removed', () => {
    const { loop, runFrame, report, observers, frames } = harness({ reduced: true });
    const a = layer();
    const remove = loop.add(a);
    runFrame(0);
    remove();
    report(observers[0]!, a.element, true);
    expect(frames.size).toBe(0);
    runFrame(0);
    expect(a.draw).toHaveBeenCalledTimes(1);
  });

  it('should keep two layers on one element independent', () => {
    const { loop, runFrame, observers } = harness();
    const a = layer();
    const b = { element: a.element, draw: vi.fn<(seconds: number) => void>() };
    const removeA = loop.add(a);
    loop.add(b);
    expect(observers[0]!.observed).toEqual([a.element]);
    runFrame(1000);
    expect(a.draw).toHaveBeenCalledWith(41);
    expect(b.draw).toHaveBeenCalledWith(41);
    removeA();
    expect(observers[0]!.observed).toEqual([a.element]);
    runFrame(2000);
    expect(a.draw).toHaveBeenCalledTimes(1);
    expect(b.draw).toHaveBeenCalledWith(42);
  });

  it('should stop observing the element once its last layer is removed', () => {
    const { loop, observers } = harness();
    const a = layer();
    const b = { element: a.element, draw: vi.fn<(seconds: number) => void>() };
    const removeA = loop.add(a);
    const removeB = loop.add(b);
    removeA();
    removeB();
    removeB();
    expect(observers[0]!.observed).toEqual([]);
  });

  it('should draw once at 40 and stop when motion is reduced', () => {
    const { loop, runFrame, frames } = harness({ reduced: true });
    const a = layer();
    expect(loop.still).toBe(true);
    loop.add(a);
    runFrame(5000);
    expect(a.draw).toHaveBeenCalledTimes(1);
    expect(a.draw).toHaveBeenCalledWith(40);
    expect(frames.size).toBe(0);
  });

  it('should schedule a single still frame for several layers', () => {
    const { loop, frames } = harness({ reduced: true });
    loop.add(layer());
    loop.add(layer());
    expect(frames.size).toBe(1);
  });

  it('should draw again after a resize when motion is reduced', () => {
    const { loop, runFrame } = harness({ reduced: true });
    const a = layer();
    loop.add(a);
    runFrame(0);
    window.dispatchEvent(new Event('resize'));
    runFrame(0);
    expect(a.draw).toHaveBeenCalledTimes(2);
  });

  it('should draw a layer that becomes visible later when motion is reduced', () => {
    const { loop, runFrame, report, observers } = harness({
      reduced: true,
      reportOnObserve: false,
    });
    const a = layer();
    loop.add(a);
    runFrame(0);
    expect(a.draw).not.toHaveBeenCalled();
    report(observers[0]!, a.element, true);
    runFrame(0);
    expect(a.draw).toHaveBeenCalledTimes(1);
  });

  it('should draw again when the tab becomes visible and motion is reduced', () => {
    const { loop, runFrame } = harness({ reduced: true });
    const a = layer();
    loop.add(a);
    runFrame(0);
    document.dispatchEvent(new Event('visibilitychange'));
    runFrame(0);
    expect(a.draw).toHaveBeenCalledTimes(2);
  });

  it('should cancel the frame and disconnect on destroy', () => {
    const { loop, cancel, observers, frames } = harness();
    loop.add(layer());
    const [pending] = [...frames.keys()];
    TestBed.resetTestingModule();
    expect(cancel).toHaveBeenCalledWith(pending);
    expect(frames.size).toBe(0);
    expect(observers[0]!.disconnect).toHaveBeenCalled();
  });

  it('should remove the listeners on destroy', () => {
    const { loop, runFrame } = harness({ reduced: true });
    const removeWindow = vi.spyOn(window, 'removeEventListener');
    const removeDocument = vi.spyOn(document, 'removeEventListener');
    const a = layer();
    loop.add(a);
    runFrame(0);
    TestBed.resetTestingModule();
    expect(removeWindow).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeDocument).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    window.dispatchEvent(new Event('resize'));
    runFrame(0);
    expect(a.draw).toHaveBeenCalledTimes(1);
  });

  it('should destroy without having started and touch no browser API on the server', () => {
    const { cancel } = harness({ platform: 'server' });
    const removeWindow = vi.spyOn(window, 'removeEventListener');
    const removeDocument = vi.spyOn(document, 'removeEventListener');
    TestBed.resetTestingModule();
    expect(cancel).not.toHaveBeenCalled();
    expect(removeWindow).not.toHaveBeenCalled();
    expect(removeDocument).not.toHaveBeenCalled();
  });

  it('should be false and read no media query on the server', () => {
    const { loop, matchMedia } = harness({ platform: 'server', reduced: true });
    expect(loop.still).toBe(false);
    expect(matchMedia).not.toHaveBeenCalled();
  });
});
