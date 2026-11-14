import { FLUID_FRAGMENT, FLUID_VERTEX } from './fluid-shader';

export type FluidFrame = {
  readonly seconds: number;
  readonly edge?: -1 | 0 | 1;
  readonly light?: boolean;
  readonly scale?: number;
};

export type FluidSurface = {
  draw(width: number, height: number, frame: FluidFrame): void;
};

export const createFluidSurface = (canvas: HTMLCanvasElement, onLost: () => void): FluidSurface | undefined => {
  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: true,
    premultipliedAlpha: true,
  });
  if (!gl) {
    return undefined;
  }

  const compile = (type: number, source: string): WebGLShader => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, FLUID_VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FLUID_FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return undefined;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'R');
  const time = gl.getUniformLocation(program, 'T');
  const light = gl.getUniformLocation(program, 'L');
  const wave = gl.getUniformLocation(program, 'W');

  canvas.addEventListener('webglcontextlost', () => onLost());

  return {
    draw(width, height, { seconds, edge = 0, light: isLight = false, scale = 1 }) {
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolution, width, height);
      gl.uniform1f(time, seconds);
      gl.uniform1f(light, isLight ? 1 : 0);
      gl.uniform4f(wave, edge, 60 * scale, scale, scale);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
};
