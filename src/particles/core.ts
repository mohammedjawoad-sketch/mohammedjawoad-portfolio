// The Core: the site's modeled 3D centrepiece, the logo made solid. It is a
// faceted crystal shell around a wire cage and a warm heart, with seven modules
// in orbit, one per application. The geometry is modeled in Blender
// (art/core/build_core.py, exported to public/models/core.glb). The orbit
// rings and the struts that carry pulses into the heart are generated here.
//
// It sits at the centre of the current particle formation: inside the globe in
// the hero, and in the Projects hub, where the modules fly out to the hub's seven
// systems while the particle streams run from them into the heart.

import { link, locate, type Locations } from './gl'
import { CORE_LINE_FRAG, CORE_LINE_VERT, CORE_MESH_FRAG, CORE_MESH_VERT } from './shaders'

type Floats = Float32Array<ArrayBuffer>
type Indices = Uint16Array<ArrayBuffer> | Uint32Array<ArrayBuffer>

export interface CoreMesh {
  positions: Floats
  normals: Floats | null
  indices: Indices | null
  /** glTF primitive mode: 4 triangles, 1 lines. */
  mode: number
}

interface Gltf {
  nodes?: { name?: string; mesh?: number }[]
  meshes: { primitives: { attributes: Record<string, number>; indices?: number; mode?: number }[] }[]
  accessors: { bufferView: number; byteOffset?: number; componentType: number; count: number; type: string }[]
  bufferViews: { byteOffset?: number; byteStride?: number }[]
}

const COMPONENTS: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }

/** Reads the meshes of a GLB, keyed by object name. Expects tightly packed buffers, as Blender writes them. */
export async function loadCoreModel(url: string): Promise<Map<string, CoreMesh>> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  const buffer = await response.arrayBuffer()
  const header = new DataView(buffer)
  if (header.getUint32(0, true) !== 0x46546c67) throw new Error(`${url} is not a GLB file`)
  const jsonLength = header.getUint32(12, true)
  const gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLength))) as Gltf
  const binary = 20 + jsonLength + 8

  const read = (index: number) => {
    const accessor = gltf.accessors[index]
    const view = gltf.bufferViews[accessor.bufferView]
    const size = COMPONENTS[accessor.type] ?? 1
    const bytes = accessor.componentType === 5123 ? 2 : 4
    if (view.byteStride && view.byteStride !== size * bytes) throw new Error('Interleaved GLB buffers are not supported')
    const start = binary + (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0)
    const slice = buffer.slice(start, start + accessor.count * size * bytes)
    if (accessor.componentType === 5126) return new Float32Array(slice)
    if (accessor.componentType === 5125) return new Uint32Array(slice)
    if (accessor.componentType === 5123) return new Uint16Array(slice)
    throw new Error(`Unsupported accessor component type ${accessor.componentType}`)
  }

  const meshes = new Map<string, CoreMesh>()
  for (const node of gltf.nodes ?? []) {
    if (node.mesh === undefined || !node.name) continue
    const primitive = gltf.meshes[node.mesh].primitives[0]
    const { POSITION, NORMAL } = primitive.attributes
    meshes.set(node.name, {
      positions: read(POSITION) as Floats,
      normals: NORMAL === undefined ? null : (read(NORMAL) as Floats),
      indices: primitive.indices === undefined ? null : (read(primitive.indices) as Indices),
      mode: primitive.mode ?? 4,
    })
  }
  return meshes
}

// ---------- 4x4 matrices, column-major like GLSL. Each op multiplies on the right.

type Mat4 = Float32Array
const scratch = new Float32Array(16)
const product = new Float32Array(16)

function identity(m: Mat4) {
  m.fill(0)
  m[0] = m[5] = m[10] = m[15] = 1
  return m
}

function times(m: Mat4, b: Mat4) {
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      product[c * 4 + r] = m[r] * b[c * 4] + m[4 + r] * b[c * 4 + 1] + m[8 + r] * b[c * 4 + 2] + m[12 + r] * b[c * 4 + 3]
    }
  }
  m.set(product)
  return m
}

function translate(m: Mat4, x: number, y: number, z: number) {
  identity(scratch)
  scratch[12] = x
  scratch[13] = y
  scratch[14] = z
  return times(m, scratch)
}

function scale(m: Mat4, s: number) {
  identity(scratch)
  scratch[0] = scratch[5] = scratch[10] = s
  return times(m, scratch)
}

function rotate(m: Mat4, axis: 'x' | 'y' | 'z', angle: number) {
  identity(scratch)
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  if (axis === 'x') {
    scratch[5] = c
    scratch[6] = s
    scratch[9] = -s
    scratch[10] = c
  } else if (axis === 'y') {
    scratch[0] = c
    scratch[2] = -s
    scratch[8] = s
    scratch[10] = c
  } else {
    scratch[0] = c
    scratch[1] = s
    scratch[4] = -s
    scratch[5] = c
  }
  return times(m, scratch)
}

// ---------- Renderer

export interface CoreFrame {
  proj: Mat4
  cameraZ: number
  tiltX: number
  tiltY: number
  time: number
  /** Particle formation weights: network, chip, hub, grid, hud. */
  weights: Float32Array
  offsetX: number
  offsetY: number
  offsetZ: number
  scale: number
  yaw: number
  pitch: number
  /** WHITE, VIOLET, CYAN, BLUE, GOLD as rgb triplets. */
  palette: Float32Array
  ink: number
  /** Intro and load fade, 0 to 1. */
  visibility: number
}

interface Part {
  vao: WebGLVertexArrayObject
  count: number
  indexType: number | null
  mode: number
}

const SPACE = ['uProj', 'uView', 'uModel', 'uOffset', 'uScale', 'uPal', 'uInk', 'uTime', 'uAlpha'] as const
const MESH_UNIFORMS = [...SPACE, 'uKind', 'uTint'] as const
const LINE_UNIFORMS = [...SPACE, 'uColor', 'uStyle', 'uPhase', 'uDashes'] as const
type MeshUniform = (typeof MESH_UNIFORMS)[number]
type LineUniform = (typeof LINE_UNIFORMS)[number]

const MODULES = 7
const RING_SEGMENTS = 160
// Must match hubNode() in shaders.ts, so the modules land on the hub's seven systems.
const HUB_RADIUS = 3.25
const HUB_SPEED = 0.06
const ORBIT_RADIUS = 1.62
const NETWORK_TILT = 0.35
const HUB_TILT = 0.5

export class CoreRenderer {
  private readonly meshProgram: WebGLProgram
  private readonly lineProgram: WebGLProgram
  private readonly mLoc: Locations<MeshUniform>
  private readonly lLoc: Locations<LineUniform>
  private readonly parts = new Map<string, Part>()
  private readonly ring: Part
  private readonly struts: Part
  private readonly strutBuffer: WebGLBuffer
  private readonly strutData: Floats = new Float32Array(MODULES * 2 * 4)
  private readonly buffers: WebGLBuffer[] = []
  private readonly vaos: WebGLVertexArrayObject[] = []
  private readonly view = new Float32Array(16)
  private readonly frame = new Float32Array(16)
  private readonly model = new Float32Array(16)
  private readonly shell = new Float32Array(16)
  private readonly moduleModel = new Float32Array(16)
  private readonly color = new Float32Array(3)
  private readonly tint = new Float32Array(3)

  constructor(
    private readonly gl: WebGL2RenderingContext,
    meshes: Map<string, CoreMesh>,
  ) {
    this.meshProgram = link(gl, CORE_MESH_VERT, CORE_MESH_FRAG)
    this.lineProgram = link(gl, CORE_LINE_VERT, CORE_LINE_FRAG)
    this.mLoc = locate(gl, this.meshProgram, MESH_UNIFORMS)
    this.lLoc = locate(gl, this.lineProgram, LINE_UNIFORMS)

    for (const [name, mesh] of meshes) this.parts.set(name, this.upload(mesh))

    // A unit circle in the XZ plane; aU is the angle as a fraction of a turn, for dashes.
    const ring = new Float32Array(RING_SEGMENTS * 2 * 4)
    for (let i = 0; i < RING_SEGMENTS; i++) {
      for (let end = 0; end < 2; end++) {
        const u = (i + end) / RING_SEGMENTS
        ring.set([Math.cos(u * Math.PI * 2), 0, Math.sin(u * Math.PI * 2), u], (i * 2 + end) * 4)
      }
    }
    this.ring = this.uploadLines(ring, gl.STATIC_DRAW).part
    const struts = this.uploadLines(this.strutData, gl.DYNAMIC_DRAW)
    this.struts = struts.part
    this.strutBuffer = struts.buffer
  }

  private buffer(data: BufferSource, target: number, usage: number) {
    const gl = this.gl
    const buffer = gl.createBuffer()
    if (!buffer) throw new Error('Could not create buffer')
    gl.bindBuffer(target, buffer)
    gl.bufferData(target, data, usage)
    this.buffers.push(buffer)
    return buffer
  }

  private vertexArray() {
    const vao = this.gl.createVertexArray()
    if (!vao) throw new Error('Could not create vertex array')
    this.vaos.push(vao)
    this.gl.bindVertexArray(vao)
    return vao
  }

  private upload(mesh: CoreMesh): Part {
    const gl = this.gl
    const vao = this.vertexArray()
    this.buffer(mesh.positions, gl.ARRAY_BUFFER, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
    if (mesh.normals) {
      this.buffer(mesh.normals, gl.ARRAY_BUFFER, gl.STATIC_DRAW)
      gl.enableVertexAttribArray(1)
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0)
    }
    let indexType: number | null = null
    let count = mesh.positions.length / 3
    if (mesh.indices) {
      this.buffer(mesh.indices, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW)
      indexType = mesh.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT
      count = mesh.indices.length
    }
    gl.bindVertexArray(null)
    return { vao, count, indexType, mode: mesh.mode === 1 ? gl.LINES : gl.TRIANGLES }
  }

  /** Lines with x, y, z and a u coordinate per vertex. */
  private uploadLines(data: Floats, usage: number) {
    const gl = this.gl
    const vao = this.vertexArray()
    const buffer = this.buffer(data, gl.ARRAY_BUFFER, usage)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 16, 0)
    gl.enableVertexAttribArray(1)
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 16, 12)
    gl.bindVertexArray(null)
    return { part: { vao, count: data.length / 4, indexType: null, mode: gl.LINES }, buffer }
  }

  destroy() {
    const gl = this.gl
    this.buffers.forEach((buffer) => gl.deleteBuffer(buffer))
    this.vaos.forEach((vao) => gl.deleteVertexArray(vao))
    gl.deleteProgram(this.meshProgram)
    gl.deleteProgram(this.lineProgram)
  }

  private drawPart(part: Part | undefined) {
    if (!part) return
    const gl = this.gl
    gl.bindVertexArray(part.vao)
    if (part.indexType === null) gl.drawArrays(part.mode, 0, part.count)
    else gl.drawElements(part.mode, part.count, part.indexType, 0)
  }

  private setSpace(loc: Locations<(typeof SPACE)[number]>, f: CoreFrame, alpha: number) {
    const gl = this.gl
    gl.uniformMatrix4fv(loc.uProj, false, f.proj)
    gl.uniformMatrix4fv(loc.uView, false, this.view)
    gl.uniform3f(loc.uOffset, f.offsetX, f.offsetY, f.offsetZ)
    gl.uniform1f(loc.uScale, f.scale)
    gl.uniform3fv(loc.uPal, f.palette)
    gl.uniform1f(loc.uInk, f.ink)
    gl.uniform1f(loc.uTime, f.time)
    gl.uniform1f(loc.uAlpha, alpha)
  }

  /** A palette colour, or a mix of two, written into this.color. */
  private paint(f: CoreFrame, a: number, b = a, t = 0) {
    for (let i = 0; i < 3; i++) this.color[i] = f.palette[a * 3 + i] * (1 - t) + f.palette[b * 3 + i] * t
    return this.color
  }

  private mesh(name: string, kind: number, tint: Float32Array | null = null) {
    const gl = this.gl
    gl.uniformMatrix4fv(this.mLoc.uModel, false, this.model)
    gl.uniform1i(this.mLoc.uKind, kind)
    if (tint) gl.uniform3fv(this.mLoc.uTint, tint)
    this.drawPart(this.parts.get(name))
  }

  private lines(part: Part | undefined, color: Float32Array, alpha: number, style = 0, phase = 0, dashes = 0) {
    const gl = this.gl
    gl.uniformMatrix4fv(this.lLoc.uModel, false, this.model)
    gl.uniform3fv(this.lLoc.uColor, color)
    gl.uniform1f(this.lLoc.uAlpha, alpha)
    gl.uniform1i(this.lLoc.uStyle, style)
    gl.uniform1f(this.lLoc.uPhase, phase)
    gl.uniform1f(this.lLoc.uDashes, dashes)
    this.drawPart(part)
  }

  draw(f: CoreFrame) {
    const w = f.weights
    // Shown where the page is about integration: the hero globe, the Projects hub, and small in the contact rings.
    const presence = Math.min(1, w[0] + w[2] + 0.55 * w[4])
    const alpha = presence * f.visibility
    if (alpha < 0.01) return
    const total = Math.max(1e-3, w[0] + w[2] + w[4])
    const hub = w[2] / total
    const hud = w[4] / total
    const t = f.time
    const ink = f.ink > 0.5
    const gl = this.gl

    // Camera, the same as the particles': tilt by the pointer, then step back.
    identity(this.view)
    translate(this.view, 0, 0, -f.cameraZ)
    rotate(this.view, 'y', f.tiltX)
    rotate(this.view, 'x', f.tiltY)

    // The formation's frame: placed and scaled like the particles, turned by the scroll, tilted like the globe or the hub.
    const F = this.frame
    identity(F)
    translate(F, f.offsetX, f.offsetY, f.offsetZ)
    scale(F, f.scale)
    rotate(F, 'y', f.yaw)
    rotate(F, 'x', f.pitch)
    rotate(F, 'x', NETWORK_TILT + (HUB_TILT - NETWORK_TILT) * hub)
    const size = (0.82 + 0.18 * presence) * (1 - 0.3 * hud)

    // Uniforms stay with their program, so the shared ones are set once per frame.
    gl.useProgram(this.lineProgram)
    this.setSpace(this.lLoc, f, alpha)
    gl.useProgram(this.meshProgram)
    this.setSpace(this.mLoc, f, alpha)
    gl.enable(gl.CULL_FACE)

    // 1. The inside of the shell, then the heart, then the wire cage: everything seen through the glass.
    this.model.set(F)
    scale(this.model, size)
    rotate(this.model, 'y', t * 0.12)
    rotate(this.model, 'x', 0.25)
    this.shell.set(this.model)
    gl.cullFace(gl.FRONT)
    this.mesh('CoreShell', 0)

    this.model.set(F)
    scale(this.model, size * (1 + 0.035 * Math.sin(t * 1.9)))
    gl.cullFace(gl.BACK)
    this.mesh('Heart', 1)

    gl.useProgram(this.lineProgram)
    this.model.set(F)
    scale(this.model, size)
    rotate(this.model, 'y', -t * 0.19)
    rotate(this.model, 'z', 0.5)
    this.lines(this.parts.get('Cage'), this.paint(f, 1), ink ? 0.45 : 0.5)

    // 2. The front of the shell and its lit edges.
    gl.useProgram(this.meshProgram)
    this.model.set(this.shell)
    this.mesh('CoreShell', 0)
    gl.useProgram(this.lineProgram)
    this.model.set(this.shell)
    this.lines(this.parts.get('CoreEdges'), ink ? this.paint(f, 3) : this.paint(f, 2, 0, 0.35), 0.8)

    // 3. Gyroscope rings round the shell, and the faint orbit the modules ride on.
    const ringColor = ink ? this.paint(f, 1) : this.paint(f, 2, 0, 0.5)
    this.model.set(F)
    scale(this.model, size)
    rotate(this.model, 'z', 0.9)
    rotate(this.model, 'x', 0.35)
    rotate(this.model, 'y', t * 0.45)
    scale(this.model, 1.13)
    this.lines(this.ring, ringColor, 0.42, 2, 0, 48)
    this.model.set(F)
    scale(this.model, size)
    rotate(this.model, 'x', 1.2)
    rotate(this.model, 'z', -0.5)
    rotate(this.model, 'y', -t * 0.3)
    scale(this.model, 1.3)
    this.lines(this.ring, ringColor, 0.32, 2, 0, 30)

    const radius = ORBIT_RADIUS + (HUB_RADIUS - ORBIT_RADIUS) * hub
    this.model.set(F)
    rotate(this.model, 'y', -t * HUB_SPEED)
    scale(this.model, radius)
    this.lines(this.ring, this.paint(f, 3), ink ? 0.4 : 0.3, 2, 0, 96)

    // 4. The seven modules. Their angles follow the hub's nodes exactly.
    const moduleScale = (1 + 0.35 * hub) * (1 - 0.3 * hud)
    for (let k = 0; k < MODULES; k++) {
      const angle = (k / MODULES) * Math.PI * 2 + t * HUB_SPEED
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      // Struts run from just outside the module to the heart's surface.
      const reach = Math.max(0, radius - 0.2 * moduleScale) / radius
      const near = (0.27 * size) / radius
      this.strutData.set([x * reach, 0, z * reach, 0, x * near, 0, z * near, 1], k * 8)

      const cyan = k % 2 === 1
      gl.useProgram(this.meshProgram)
      this.model.set(F)
      translate(this.model, x, 0, z)
      scale(this.model, moduleScale)
      rotate(this.model, 'y', t * 0.5 + k * 0.9)
      rotate(this.model, 'x', 0.55 + 0.3 * Math.sin(t * 0.4 + k))
      this.moduleModel.set(this.model)
      this.tint.set(cyan ? this.paint(f, 2) : this.paint(f, 3, 0, 0.2))
      gl.cullFace(gl.FRONT)
      this.mesh('Module', 2, this.tint)
      gl.cullFace(gl.BACK)
      this.mesh('Module', 2, this.tint)
      gl.useProgram(this.lineProgram)
      this.model.set(this.moduleModel)
      this.lines(this.parts.get('ModuleEdges'), cyan ? this.paint(f, 2) : this.paint(f, 3, 0, ink ? 0 : 0.25), 0.85)
    }

    // 5. Struts with pulses running into the heart.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.strutBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.strutData)
    this.model.set(F)
    for (let k = 0; k < MODULES; k++) {
      gl.uniformMatrix4fv(this.lLoc.uModel, false, this.model)
      gl.uniform3fv(this.lLoc.uColor, ink ? this.paint(f, 3) : this.paint(f, 2))
      gl.uniform1f(this.lLoc.uAlpha, 0.55)
      gl.uniform1i(this.lLoc.uStyle, 1)
      gl.uniform1f(this.lLoc.uPhase, k / MODULES)
      gl.bindVertexArray(this.struts.vao)
      gl.drawArrays(gl.LINES, k * 2, 2)
    }

    gl.disable(gl.CULL_FACE)
    gl.bindVertexArray(null)
  }
}
