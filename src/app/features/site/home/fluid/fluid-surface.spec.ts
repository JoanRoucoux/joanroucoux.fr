import { afterEach, describe, expect, it, vi } from 'vitest';

import { FLUID_FRAGMENT, FLUID_VERTEX } from './fluid-shader';
import { type FluidSurface, createFluidSurface } from './fluid-surface';

const METHODS = [
  'createShader',
  'shaderSource',
  'compileShader',
  'createProgram',
  'attachShader',
  'linkProgram',
  'useProgram',
  'bindBuffer',
  'createBuffer',
  'bufferData',
  'getAttribLocation',
  'enableVertexAttribArray',
  'vertexAttribPointer',
  'getUniformLocation',
  'viewport',
  'uniform1f',
  'uniform2f',
  'uniform4f',
  'drawArrays',
];

type FakeSurface = {
  surface: FluidSurface | undefined;
  gl: Record<string, unknown>;
  canvas: HTMLCanvasElement;
};

const fakeSurface = (onLost = vi.fn(), linked = true): FakeSurface => {
  const gl: Record<string, unknown> = {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    LINK_STATUS: 3,
    ARRAY_BUFFER: 4,
    STATIC_DRAW: 5,
    FLOAT: 6,
    TRIANGLES: 7,
    getProgramParameter: vi.fn(() => linked),
  };
  for (const name of METHODS) {
    gl[name] = vi.fn();
  }
  gl['getUniformLocation'] = vi.fn((_program: unknown, name: string) => name);
  const canvas = document.createElement('canvas');
  vi.spyOn(canvas, 'getContext').mockReturnValue(gl as unknown as WebGLRenderingContext);
  return { surface: createFluidSurface(canvas, onLost), gl, canvas };
};

describe('createFluidSurface', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return undefined without WebGL', () => {
    expect(createFluidSurface(document.createElement('canvas'), vi.fn())).toBeUndefined();
  });

  it('should return undefined when the program does not link', () => {
    expect(fakeSurface(vi.fn(), false).surface).toBeUndefined();
  });

  it('should request a context without antialiasing and premultiplied', () => {
    const { canvas } = fakeSurface();
    expect(canvas.getContext).toHaveBeenCalledWith('webgl', {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
    });
  });

  it('should compile the vertex and fragment shaders', () => {
    const { gl } = fakeSurface();
    expect(gl['shaderSource']).toHaveBeenCalledWith(undefined, FLUID_VERTEX);
    expect(gl['shaderSource']).toHaveBeenCalledWith(undefined, FLUID_FRAGMENT);
    expect(gl['linkProgram']).toHaveBeenCalled();
  });

  it('should set the wave uniforms from the frame', () => {
    const { surface, gl } = fakeSurface();
    surface!.draw(800, 600, { seconds: 41, edge: -1, light: true, scale: 1.5 });
    expect(gl['viewport']).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(gl['uniform2f']).toHaveBeenCalledWith('R', 800, 600);
    expect(gl['uniform1f']).toHaveBeenCalledWith('T', 41);
    expect(gl['uniform1f']).toHaveBeenCalledWith('L', 1);
    expect(gl['uniform4f']).toHaveBeenCalledWith('W', -1, 90, 1.5, 1.5);
    expect(gl['drawArrays']).toHaveBeenCalledWith(gl['TRIANGLES'], 0, 3);
  });

  it('should default to no edge, dark and scale 1', () => {
    const { surface, gl } = fakeSurface();
    surface!.draw(10, 20, { seconds: 40 });
    expect(gl['uniform1f']).toHaveBeenCalledWith('L', 0);
    expect(gl['uniform4f']).toHaveBeenCalledWith('W', 0, 60, 1, 1);
  });

  it('should not resize the canvas', () => {
    const { surface, canvas } = fakeSurface();
    surface!.draw(800, 600, { seconds: 40 });
    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(150);
  });

  it('should report a lost context without preventing the default', () => {
    const onLost = vi.fn();
    const { canvas } = fakeSurface(onLost);
    const event = new Event('webglcontextlost', { cancelable: true });
    canvas.dispatchEvent(event);
    expect(onLost).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
