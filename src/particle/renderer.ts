/** x, y (CSS px, viewport), diameter (CSS px), alpha, softness 0..1, r, g, b */
export const STRIDE = 8

const VERT = `#version 300 es
layout(location=0) in vec2 aPos;
layout(location=1) in vec4 aShape;
layout(location=2) in vec3 aColor;
uniform vec2 uViewport;
uniform float uDpr;
out float vAlpha;
out float vSoft;
out vec3 vColor;
void main() {
  vec2 clip = aPos / uViewport * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = aShape.x * uDpr;
  vAlpha = aShape.y;
  vSoft = aShape.z;
  vColor = aColor;
}`

const FRAG = `#version 300 es
precision mediump float;
in float vAlpha;
in float vSoft;
in vec3 vColor;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float edge = 1.0 - smoothstep(1.0 - max(vSoft, 0.08), 1.0, d);
  float a = vAlpha * edge;
  outColor = vec4(vColor * a, a);
}`

export interface Renderer {
  draw(data: Float32Array, count: number): void
  clear(): void
}

let canvas: HTMLCanvasElement | null = null
let renderer: Renderer | null = null
let lostHandler: () => void = () => {}

export function onContextLost(fn: () => void) {
  lostHandler = fn
}

export function getRenderer(): Renderer | null {
  if (renderer) return renderer
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText =
      'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647'
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      renderer = null
      lostHandler()
    })
    canvas.addEventListener('webglcontextrestored', () => {
      renderer = null
    })
    document.body.appendChild(canvas)
  }
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false })
  if (!gl || gl.isContextLost()) return null
  renderer = createRenderer(gl, canvas)
  return renderer
}

function compile(gl: WebGL2RenderingContext, type: GLenum, src: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed')
  }
  return shader
}

function createRenderer(gl: WebGL2RenderingContext, el: HTMLCanvasElement): Renderer {
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'program link failed')
  }
  const uViewport = gl.getUniformLocation(program, 'uViewport')
  const uDpr = gl.getUniformLocation(program, 'uDpr')

  const vao = gl.createVertexArray()
  const buffer = gl.createBuffer()
  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  const bytes = STRIDE * 4
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, bytes, 0)
  gl.enableVertexAttribArray(1)
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, bytes, 8)
  gl.enableVertexAttribArray(2)
  gl.vertexAttribPointer(2, 3, gl.FLOAT, false, bytes, 20)
  let capacity = 0

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.round(window.innerWidth * dpr)
    const h = Math.round(window.innerHeight * dpr)
    if (el.width !== w || el.height !== h) {
      el.width = w
      el.height = h
    }
    gl.viewport(0, 0, w, h)
    return dpr
  }

  return {
    draw(data, count) {
      const dpr = resize()
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      if (count === 0) return
      gl.useProgram(program)
      gl.uniform2f(uViewport, window.innerWidth, window.innerHeight)
      gl.uniform1f(uDpr, dpr)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.bindVertexArray(vao)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      if (data.byteLength > capacity) {
        capacity = data.byteLength
        gl.bufferData(gl.ARRAY_BUFFER, capacity, gl.DYNAMIC_DRAW)
      }
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, count * STRIDE)
      gl.drawArrays(gl.POINTS, 0, count)
    },
    clear() {
      resize()
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
  }
}
