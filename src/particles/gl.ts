// Small WebGL2 helpers shared by the particle field and the Core.

export type Locations<K extends string> = Record<K, WebGLUniformLocation | null>

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

export function link(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
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

export function locate<K extends string>(gl: WebGL2RenderingContext, program: WebGLProgram, names: readonly K[]) {
  const out = {} as Locations<K>
  for (const name of names) out[name] = gl.getUniformLocation(program, name)
  return out
}
