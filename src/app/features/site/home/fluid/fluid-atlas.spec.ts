import { TestBed } from '@angular/core/testing';

import { type Mock, afterEach, describe, expect, it, vi } from 'vitest';

import { ATLAS_SIZE, FluidAtlas } from './fluid-atlas';

type StubbedWebGL = {
  gl: { drawArrays: Mock; viewport: Mock; uniform2f: Mock };
  canvas: () => HTMLCanvasElement;
};

const stubWebGL = (): StubbedWebGL => {
  const own = {
    getProgramParameter: () => true,
    getUniformLocation: () => ({}),
    drawArrays: vi.fn(),
    viewport: vi.fn(),
    uniform2f: vi.fn(),
  };
  const gl = new Proxy(own, {
    get: (target, key: string) => (key in target ? target[key as keyof typeof target] : vi.fn()),
  });
  const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => gl) as never);
  return { gl: own, canvas: () => spy.mock.contexts[0] as HTMLCanvasElement };
};

const atlasFromDi = (): FluidAtlas => {
  TestBed.configureTestingModule({ providers: [FluidAtlas] });
  return TestBed.inject(FluidAtlas);
};

describe('FluidAtlas', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('should render into a square canvas', () => {
    const { gl } = stubWebGL();
    const canvas = atlasFromDi().render(192, 108, { seconds: 40 });
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(canvas!.width).toBe(ATLAS_SIZE);
    expect(canvas!.height).toBe(ATLAS_SIZE);
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 192, 108);
    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 192, 108);
  });

  it('should reuse the same canvas', () => {
    stubWebGL();
    const atlas = atlasFromDi();
    expect(atlas.render(10, 10, { seconds: 40 })).toBe(atlas.render(20, 20, { seconds: 41 }));
  });

  it('should return undefined without WebGL', () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
    const atlas = atlasFromDi();
    expect(atlas.render(192, 108, { seconds: 40 })).toBeUndefined();
    expect(atlas.render(192, 108, { seconds: 40 })).toBeUndefined();
    expect(getContext).toHaveBeenCalledTimes(1);
  });

  it('should return undefined after a lost context', () => {
    const { canvas } = stubWebGL();
    const atlas = atlasFromDi();
    expect(atlas.render(192, 108, { seconds: 40 })).toBeDefined();
    canvas().dispatchEvent(new Event('webglcontextlost'));
    expect(atlas.render(192, 108, { seconds: 40 })).toBeUndefined();
  });
});
