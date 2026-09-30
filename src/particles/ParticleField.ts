import {
  BLUR_FRAG,
  COMPOSITE_FRAG,
  FULLSCREEN_VERT,
  LINE_FRAG,
  LINE_VERT,
  PARTICLE_FRAG,
  PARTICLE_VERT,
} from './shaders'

export const FORMATIONS = 5

interface Layout {
  x: number
  y: number
  z: number
  scale: number
  intensity: number
}

export interface FieldOptions {
  count: number
  reducedMotion: boolean
  maxDpr: number
  skipIntro?: boolean
  rtl?: boolean
  /** Draw as ink on a light page instead of light on a dark one. */
  light?: boolean
}

// WHITE (emphasis), VIOLET, CYAN, BLUE, in the order shaders.ts reads uPal.
const PALETTES = {
  // Coloured light on a night sky.
  dark: new Float32Array([1, 1, 1, 0.72, 0.6, 1.0, 0.3, 0.86, 1.0, 0.32, 0.48, 1.0]),
  // Blue ink on paper: emphasis becomes the deepest ink rather than white.
  light: new Float32Array([0.05, 0.09, 0.36, 0.42, 0.26, 0.9, 0.02, 0.48, 0.64, 0.14, 0.28, 0.79]),
}

interface Target {
  tex: WebGLTexture
  fbo: WebGLFramebuffer
  w: number
  h: number
}

const SHARED_UNIFORMS = [
  'uProj',
  'uTime',
  'uW',
  'uIntro',
  'uMouse',
  'uMouseOn',
  'uPulse',
  'uAspect',
  'uOffset',
  'uScale',
  'uTilt',
  'uIntensity',
  'uGridCols',
  'uCount',
  'uFocus',
  'uPal',
  'uInk',
] as const
const PARTICLE_ONLY = ['uScatter', 'uPixel', 'uMaxPoint', 'uHalf'] as const

type SharedUniform = (typeof SHARED_UNIFORMS)[number]
type ParticleUniform = SharedUniform | (typeof PARTICLE_ONLY)[number]
type Locations<K extends string> = Record<K, WebGLUniformLocation | null>

// Must match the constants in shaders.ts.
const NET_N = 420
const CHIP_TRACES = 40
const HUD_DASHES = [24, 64, 36, 96]

// Deterministic PRNG so the field looks the same on every visit.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function perspective(out: Float32Array, fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2)
  const nf = 1 / (near - far)
  out.fill(0)
  out[0] = f / aspect
  out[5] = f
  out[10] = (far + near) * nf
  out[11] = -1
  out[14] = 2 * far * near * nf
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Could not create shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile failed: ${log}`)
  }
  return shader
}

function link(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vertex)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment)
  const program = gl.createProgram()
  if (!program) throw new Error('Could not create program')
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`)
  }
  return program
}

function locate<K extends string>(gl: WebGL2RenderingContext, program: WebGLProgram, names: readonly K[]) {
  const out = {} as Locations<K>
  for (const name of names) out[name] = gl.getUniformLocation(program, name)
  return out
}

/** Segment ends for every formation's hairline connections: (formation, a, b, end) + (c). */
function buildLines(gridCols: number, rows: number) {
  const data: number[] = []
  const segment = (f: number, a: number, b: number, c = 0) => {
    data.push(f, a, b, 0, c, 0, 0, 0)
    data.push(f, a, b, 1, c, 0, 0, 0)
  }
  for (let i = 0; i < NET_N; i++) for (let k = 0; k < 3; k++) segment(0, i, k)
  for (let side = 0; side < 4; side++) {
    segment(1, 0, side)
    segment(1, 1, side)
  }
  for (let k = 0; k < CHIP_TRACES; k++) for (let s = 0; s < 3; s++) segment(1, 2, k, s)
  for (let k = 0; k < 7; k++) {
    segment(2, 0, k)
    segment(2, 1, k)
  }
  for (let j = 0; j < rows; j += 4) for (let i = 0; i < gridCols - 1; i++) segment(3, 0, i, j)
  for (let i = 0; i < gridCols; i += 8) for (let j = 0; j < rows - 1; j++) segment(3, 1, i, j)
  HUD_DASHES.forEach((count, ring) => {
    for (let d = 0; d < count; d++) segment(4, 0, ring, d)
  })
  for (let tick = 0; tick < 72; tick++) segment(4, 1, tick)
  return new Float32Array(data)
}

const CAMERA_Z = 10
const FOV = (45 * Math.PI) / 180

export class ParticleField {
  private readonly canvas: HTMLCanvasElement
  private readonly gl: WebGL2RenderingContext
  private particleProgram: WebGLProgram | null = null
  private lineProgram: WebGLProgram | null = null
  private blurProgram: WebGLProgram | null = null
  private compositeProgram: WebGLProgram | null = null
  private particleVao: WebGLVertexArrayObject | null = null
  private lineVao: WebGLVertexArrayObject | null = null
  private emptyVao: WebGLVertexArrayObject | null = null
  private buffers: WebGLBuffer[] = []
  private pLoc = {} as Locations<ParticleUniform>
  private lLoc = {} as Locations<SharedUniform>
  private blurLoc = { tex: null as WebGLUniformLocation | null, dir: null as WebGLUniformLocation | null }
  private compLoc = {
    tex: null as WebGLUniformLocation | null,
    bloom: null as WebGLUniformLocation | null,
    center: null as WebGLUniformLocation | null,
    glow: null as WebGLUniformLocation | null,
    aspect: null as WebGLUniformLocation | null,
  }
  private bloomA: Target | null = null
  private bloomB: Target | null = null
  private bloom = true
  private ink = 0
  private palette = PALETTES.dark
  private lineVertexCount = 0

  private readonly count: number
  private drawCount: number
  private readonly gridCols: number
  private readonly gridRows: number
  private readonly reduced: boolean
  private maxDpr: number
  private dpr = 1
  private rtl: boolean
  private aspect = 1
  private halfW = 1
  private halfH = 1
  private readonly proj = new Float32Array(16)
  private layouts: Layout[] = []

  private raf = 0
  private last = 0
  private time = 0
  private elapsed = 0
  private intro: number
  private readonly weights = new Float32Array(FORMATIONS)
  private readonly target = new Float32Array(FORMATIONS)
  private readonly mouse = { x: 0, y: 0, tx: 0, ty: 0, on: 0, lastMove: -Infinity }
  private readonly tilt = { x: 0, y: 0 }
  private readonly pulse = { x: 0, y: 0, age: -1 }
  private readonly perf = { frames: 0, total: 0, stage: 0 }
  private frameState = { scatter: 0, ox: 0, oy: 0, oz: 0, scale: 1, intensity: 1 }

  constructor(canvas: HTMLCanvasElement, options: FieldOptions) {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    })
    if (!gl) throw new Error('WebGL2 is not available')
    this.canvas = canvas
    this.gl = gl
    this.count = options.count
    this.drawCount = options.count
    this.gridCols = Math.round(Math.sqrt(options.count * 1.8))
    this.gridRows = Math.max(2, Math.floor(options.count / this.gridCols))
    this.reduced = options.reducedMotion
    this.maxDpr = options.maxDpr
    this.rtl = Boolean(options.rtl)
    this.intro = options.skipIntro || options.reducedMotion ? 1 : 0
    this.weights[0] = 1
    this.target[0] = 1
    this.setTheme(Boolean(options.light))

    canvas.addEventListener('webglcontextlost', this.onContextLost)
    canvas.addEventListener('webglcontextrestored', this.onContextRestored)
    this.setup()
    this.resize()
  }

  private onContextLost = (event: Event) => {
    event.preventDefault()
    this.stop()
  }

  private onContextRestored = () => {
    this.bloomA = null
    this.bloomB = null
    this.setup()
    this.resize()
    this.start()
  }

  private setup() {
    const gl = this.gl
    this.particleProgram = link(gl, PARTICLE_VERT, PARTICLE_FRAG)
    this.lineProgram = link(gl, LINE_VERT, LINE_FRAG)
    this.blurProgram = link(gl, FULLSCREEN_VERT, BLUR_FRAG)
    this.compositeProgram = link(gl, FULLSCREEN_VERT, COMPOSITE_FRAG)
    this.pLoc = locate(gl, this.particleProgram, [...SHARED_UNIFORMS, ...PARTICLE_ONLY])
    this.lLoc = locate(gl, this.lineProgram, SHARED_UNIFORMS)
    this.blurLoc = {
      tex: gl.getUniformLocation(this.blurProgram, 'uTex'),
      dir: gl.getUniformLocation(this.blurProgram, 'uDir'),
    }
    this.compLoc = {
      tex: gl.getUniformLocation(this.compositeProgram, 'uTex'),
      bloom: gl.getUniformLocation(this.compositeProgram, 'uBloom'),
      center: gl.getUniformLocation(this.compositeProgram, 'uGlowCenter'),
      glow: gl.getUniformLocation(this.compositeProgram, 'uGlow'),
      aspect: gl.getUniformLocation(this.compositeProgram, 'uAspect'),
    }

    const rand = mulberry32(20260929)
    const seedA = new Float32Array(this.count * 4)
    const seedB = new Float32Array(this.count * 4)
    for (let i = 0; i < seedA.length; i++) {
      seedA[i] = rand()
      seedB[i] = rand()
    }

    this.buffers = []
    const makeBuffer = (data: Float32Array) => {
      const buffer = gl.createBuffer()
      if (!buffer) throw new Error('Could not create buffer')
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      this.buffers.push(buffer)
      return buffer
    }

    this.particleVao = gl.createVertexArray()
    gl.bindVertexArray(this.particleVao)
    ;[seedA, seedB].forEach((data, index) => {
      makeBuffer(data)
      gl.enableVertexAttribArray(index)
      gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 0, 0)
    })

    const lines = buildLines(this.gridCols, this.gridRows)
    this.lineVertexCount = lines.length / 8
    this.lineVao = gl.createVertexArray()
    gl.bindVertexArray(this.lineVao)
    makeBuffer(lines)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 32, 0)
    gl.enableVertexAttribArray(1)
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 16)

    this.emptyVao = gl.createVertexArray()
    gl.bindVertexArray(null)

    gl.disable(gl.DEPTH_TEST)
  }

  /** Light theme: ink on paper (normal blending, no bloom). Dark theme: additive light. */
  setTheme(light: boolean) {
    this.ink = light ? 1 : 0
    this.palette = light ? PALETTES.light : PALETTES.dark
  }

  private makeTarget(w: number, h: number): Target {
    const gl = this.gl
    const tex = gl.createTexture()
    const fbo = gl.createFramebuffer()
    if (!tex || !fbo) throw new Error('Could not create render target')
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return { tex, fbo, w, h }
  }

  private freeTarget(target: Target | null) {
    if (!target) return
    this.gl.deleteTexture(target.tex)
    this.gl.deleteFramebuffer(target.fbo)
  }

  resize() {
    const width = this.canvas.clientWidth || window.innerWidth
    const height = this.canvas.clientHeight || window.innerHeight
    this.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr)
    const w = Math.max(1, Math.round(width * this.dpr))
    const h = Math.max(1, Math.round(height * this.dpr))
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
    // The glow is built at half resolution: cheaper, and softer.
    const bw = Math.max(1, Math.round(w / 2))
    const bh = Math.max(1, Math.round(h / 2))
    if (!this.bloomA || this.bloomA.w !== bw || this.bloomA.h !== bh) {
      this.freeTarget(this.bloomA)
      this.freeTarget(this.bloomB)
      this.bloomA = this.makeTarget(bw, bh)
      this.bloomB = this.makeTarget(bw, bh)
    }
    this.aspect = width / height
    perspective(this.proj, FOV, this.aspect, 0.1, 100)
    this.computeLayouts()
  }

  /** Where each formation sits on screen, per viewport shape and reading direction. */
  private computeLayouts() {
    this.halfH = CAMERA_Z * Math.tan(FOV / 2)
    this.halfW = this.halfH * this.aspect
    const halfW = this.halfW
    const side = this.rtl ? -1 : 1
    if (this.aspect > 1.1) {
      this.layouts = [
        { x: side * halfW * 0.52, y: 0.1, z: 0, scale: Math.min(1, (halfW * 0.56) / 3.8), intensity: 0.95 },
        { x: side * halfW * 0.46, y: 1.0, z: -1, scale: 0.8, intensity: 0.95 },
        { x: 0, y: 0.1, z: -2.5, scale: 1.25, intensity: 0.85 },
        { x: 0, y: 0, z: 0, scale: 1, intensity: 0.7 },
        // Framed around the contact heading, on the side opposite the form.
        { x: -side * halfW * 0.6, y: 0.9, z: -1, scale: 0.95, intensity: 0.85 },
      ]
    } else {
      this.layouts = [
        { x: side * 1.2, y: 1.1, z: -1.5, scale: 0.8, intensity: 0.8 },
        { x: 0, y: 0.8, z: -3.5, scale: 0.7, intensity: 0.55 },
        { x: 0, y: 0.4, z: -4, scale: 0.9, intensity: 0.6 },
        { x: 0, y: 0, z: 0, scale: 1, intensity: 0.4 },
        { x: 0, y: 1.8, z: -3, scale: 0.6, intensity: 0.7 },
      ]
    }
  }

  setTarget(weights: ArrayLike<number>) {
    for (let i = 0; i < FORMATIONS; i++) this.target[i] = weights[i] ?? 0
  }

  setDirection(rtl: boolean) {
    this.rtl = rtl
    this.computeLayouts()
  }

  setPointer(x: number, y: number) {
    this.mouse.tx = x
    this.mouse.ty = y
    this.mouse.lastMove = performance.now()
  }

  pointerOut() {
    this.mouse.lastMove = -Infinity
  }

  pulseAt(x: number, y: number) {
    if (this.reduced) return
    this.pulse.x = x
    this.pulse.y = y
    this.pulse.age = 0
  }

  start() {
    if (this.raf) return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  stop() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  destroy() {
    this.stop()
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost)
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored)
    const gl = this.gl
    this.buffers.forEach((buffer) => gl.deleteBuffer(buffer))
    ;[this.particleVao, this.lineVao, this.emptyVao].forEach((vao) => vao && gl.deleteVertexArray(vao))
    ;[this.particleProgram, this.lineProgram, this.blurProgram, this.compositeProgram].forEach(
      (program) => program && gl.deleteProgram(program),
    )
    this.freeTarget(this.bloomA)
    this.freeTarget(this.bloomB)
    this.buffers = []
    this.particleVao = this.lineVao = this.emptyVao = null
    this.particleProgram = this.lineProgram = this.blurProgram = this.compositeProgram = null
    this.bloomA = this.bloomB = null
  }

  // Degrade in steps if the device can't keep up: glow first, then resolution, then particle count.
  private watchPerformance(dt: number) {
    if (this.perf.stage > 2 || this.elapsed < 1.2) return
    this.perf.frames++
    this.perf.total += dt
    if (this.perf.frames < 90) return
    const average = this.perf.total / this.perf.frames
    this.perf.frames = 0
    this.perf.total = 0
    if (average <= 1 / 45) {
      this.perf.stage = 3
      return
    }
    if (this.perf.stage === 0 && this.bloom) this.bloom = false
    else if (this.perf.stage === 1 && this.dpr > 1) {
      this.maxDpr = 1
      this.resize()
    } else if (this.perf.stage === 2) this.drawCount = Math.floor(this.count * 0.6)
    this.perf.stage++
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame)
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000))
    this.last = now
    this.elapsed += dt
    this.watchPerformance(dt)
    this.time += this.reduced ? dt * 0.3 : dt
    if (this.intro < 1) this.intro = Math.min(1, this.intro + dt / 2.8)

    const k = 1 - Math.exp(-dt * (this.reduced ? 12 : 2.2))
    let sum = 0
    for (let i = 0; i < FORMATIONS; i++) {
      this.weights[i] += (this.target[i] - this.weights[i]) * k
      if (this.weights[i] < 1e-4) this.weights[i] = 0
      sum += this.weights[i]
    }
    if (sum > 0) for (let i = 0; i < FORMATIONS; i++) this.weights[i] /= sum

    const s = this.frameState
    let blend = 0
    s.ox = s.oy = s.oz = s.scale = s.intensity = 0
    for (let i = 0; i < FORMATIONS; i++) {
      const w = this.weights[i]
      if (!w) continue
      const layout = this.layouts[i]
      blend += w * (1 - w)
      s.ox += w * layout.x
      s.oy += w * layout.y
      s.oz += w * layout.z
      s.scale += w * layout.scale
      s.intensity += w * layout.intensity
    }
    s.scatter = this.reduced ? 0 : Math.min(1, blend * 2.4)

    const m = this.mouse
    const km = 1 - Math.exp(-dt * 6)
    m.x += (m.tx - m.x) * km
    m.y += (m.ty - m.y) * km
    const active = now - m.lastMove < 2500 ? 1 : 0
    m.on += (active - m.on) * (1 - Math.exp(-dt * 3))
    const kt = 1 - Math.exp(-dt * 1.5)
    const tiltAmount = this.reduced ? 0 : 1
    this.tilt.x += (m.x * 0.08 * tiltAmount - this.tilt.x) * kt
    this.tilt.y += (-m.y * 0.05 * tiltAmount - this.tilt.y) * kt

    if (this.pulse.age >= 0) {
      this.pulse.age += dt
      if (this.pulse.age > 1.8) this.pulse.age = -1
    }

    this.draw()
  }

  private setShared(loc: Locations<SharedUniform>) {
    const gl = this.gl
    const s = this.frameState
    gl.uniformMatrix4fv(loc.uProj, false, this.proj)
    gl.uniform1f(loc.uTime, this.time)
    gl.uniform1fv(loc.uW, this.weights)
    gl.uniform1f(loc.uIntro, this.intro)
    gl.uniform2f(loc.uMouse, this.mouse.x, this.mouse.y)
    gl.uniform1f(loc.uMouseOn, this.mouse.on)
    gl.uniform3f(loc.uPulse, this.pulse.x, this.pulse.y, this.pulse.age)
    gl.uniform1f(loc.uAspect, this.aspect)
    gl.uniform3f(loc.uOffset, s.ox, s.oy, s.oz)
    gl.uniform1f(loc.uScale, s.scale)
    gl.uniform2f(loc.uTilt, this.tilt.x, this.tilt.y)
    gl.uniform1f(loc.uIntensity, s.intensity)
    gl.uniform1f(loc.uGridCols, this.gridCols)
    gl.uniform1f(loc.uCount, this.count)
    gl.uniform1f(loc.uFocus, CAMERA_Z - s.oz)
    gl.uniform3fv(loc.uPal, this.palette)
    gl.uniform1f(loc.uInk, this.ink)
  }

  /** Particles and connections, at the given resolution scale (1 for screen, 0.5 for the glow). */
  private drawScene(pixelScale: number) {
    const gl = this.gl
    const s = this.frameState
    if (this.particleProgram && this.particleVao) {
      gl.useProgram(this.particleProgram)
      this.setShared(this.pLoc)
      gl.uniform1f(this.pLoc.uScatter, s.scatter)
      gl.uniform1f(this.pLoc.uPixel, 3.0 * this.dpr * pixelScale)
      gl.uniform1f(this.pLoc.uMaxPoint, 56 * this.dpr * pixelScale)
      gl.uniform2f(this.pLoc.uHalf, this.halfW, this.halfH)
      gl.bindVertexArray(this.particleVao)
      gl.drawArrays(gl.POINTS, 0, this.drawCount)
    }
    if (this.lineProgram && this.lineVao) {
      gl.useProgram(this.lineProgram)
      this.setShared(this.lLoc)
      gl.bindVertexArray(this.lineVao)
      gl.drawArrays(gl.LINES, 0, this.lineVertexCount)
    }
  }

  private draw() {
    const gl = this.gl
    const s = this.frameState
    const A = this.bloomA
    const B = this.bloomB
    // Glow only makes sense as light on a dark page; ink is drawn crisp and layered normally.
    const useBloom = !this.ink && this.bloom && A && B && this.blurProgram && this.compositeProgram
    if (this.ink) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    else gl.blendFunc(gl.ONE, gl.ONE)

    if (useBloom) {
      // 1. Scene into a half-resolution target.
      gl.bindFramebuffer(gl.FRAMEBUFFER, A.fbo)
      gl.viewport(0, 0, A.w, A.h)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.enable(gl.BLEND)
      this.drawScene(0.5)

      // 2. Blur it back and forth, widening the radius on the second pass.
      gl.disable(gl.BLEND)
      gl.useProgram(this.blurProgram)
      gl.bindVertexArray(this.emptyVao)
      gl.activeTexture(gl.TEXTURE0)
      gl.uniform1i(this.blurLoc.tex, 0)
      for (const radius of [1, 2.2]) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, B.fbo)
        gl.bindTexture(gl.TEXTURE_2D, A.tex)
        gl.uniform2f(this.blurLoc.dir, radius / A.w, 0)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        gl.bindFramebuffer(gl.FRAMEBUFFER, A.fbo)
        gl.bindTexture(gl.TEXTURE_2D, B.tex)
        gl.uniform2f(this.blurLoc.dir, 0, radius / A.h)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }
    }

    // 3. Crisp scene on screen, then the glow on top.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    this.drawScene(1)

    if (useBloom) {
      // Where the current formation sits on screen, for the soft light behind it.
      const depth = CAMERA_Z - s.oz
      const cx = ((this.proj[0] * s.ox) / depth) * 0.5 + 0.5
      const cy = ((this.proj[5] * s.oy) / depth) * 0.5 + 0.5
      gl.useProgram(this.compositeProgram)
      gl.bindVertexArray(this.emptyVao)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, A.tex)
      gl.uniform1i(this.compLoc.tex, 0)
      gl.uniform1f(this.compLoc.bloom, 1.15)
      gl.uniform2f(this.compLoc.center, cx, cy)
      gl.uniform1f(this.compLoc.glow, s.intensity * this.intro)
      gl.uniform1f(this.compLoc.aspect, this.aspect)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    gl.bindVertexArray(null)
  }
}
