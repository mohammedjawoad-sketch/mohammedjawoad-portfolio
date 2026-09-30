// The background is drawn in coloured light: white-hot centres inside electric
// blue, cyan and violet halos, with a bloom pass, depth of field (near motes blur
// into bokeh), a layer of drifting dust, and square fragments that peel off the shapes.
//
// In the light theme (uInk = 1) the same scene is drawn as ink on paper instead:
// the palette comes in through uPal, motes become crisp dots with dark centres,
// and ParticleField blends normally and skips the bloom.
//
// Five technology formations, one per part of the page. Particles and the
// hairline connections share the geometry below, so both always line up.
//
//   0 network  a globe of nodes and links with data pulses, arcs and orbit rings
//   1 chip     a processor with circuit traces fanning out and pulses along them
//   2 hub      seven systems streaming data into one core
//   3 grid     a wireframe terrain behind the text-heavy sections
//   4 hud      rotating interface rings with a data spiral, for the contact section

const UNIFORMS = /* glsl */ `
uniform mat4 uProj;
uniform float uTime;
uniform float uW[5];
uniform float uIntro;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform vec3 uPulse;
uniform float uAspect;
uniform vec3 uOffset;
uniform float uScale;
uniform vec2 uTilt;
uniform float uIntensity;
uniform float uGridCols;
uniform float uCount;
uniform float uFocus;
uniform vec3 uPal[4];
uniform float uInk;
`

const COMMON = /* glsl */ `
const float PI = 3.14159265;
const float TAU = 6.28318531;

// Palette slots, filled per theme by ParticleField (WHITE is the emphasis colour).
#define WHITE  uPal[0]
#define VIOLET uPal[1]
#define CYAN   uPal[2]
#define BLUE   uPal[3]

mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }

// Box-Muller: two uniforms in, one normally distributed value out.
float gauss(float u1, float u2) {
  return sqrt(-2.0 * log(max(u1, 1e-4))) * cos(TAU * u2);
}

float hash(float n) {
  return fract(sin(n * 127.1 + 311.7) * 43758.5453123);
}

// Divergence-free flow field: each component depends only on the other two
// axes, so particles swirl without bunching up.
vec3 flow(vec3 p, float t) {
  return vec3(
    sin(p.y * 1.1 + t * 0.31) + 0.5 * sin(p.z * 2.3 - t * 0.43),
    sin(p.z * 0.9 + t * 0.27) + 0.5 * sin(p.x * 2.1 + t * 0.37),
    sin(p.x * 1.3 - t * 0.29) + 0.5 * sin(p.y * 1.9 + t * 0.41)
  );
}

float weightOf(int f) {
  if (f == 0) return uW[0];
  if (f == 1) return uW[1];
  if (f == 2) return uW[2];
  if (f == 3) return uW[3];
  return uW[4];
}

// ---------- 0 network: Fibonacci globe; offsets 13, 21, 34 join true neighbours
const float NET_N = 420.0;
const float NET_R = 2.6;
const float NET_EDGE = 0.72;

vec3 netNode(float i) {
  float y = 1.0 - (i + 0.5) * 2.0 / NET_N;
  float r = sqrt(max(0.0, 1.0 - y * y));
  float phi = i * 2.39996323;
  return vec3(cos(phi) * r, y, sin(phi) * r) * NET_R;
}

float netOffset(float k) {
  return k < 0.5 ? 13.0 : (k < 1.5 ? 21.0 : 34.0);
}

mat3 netSpin(float t) {
  return rotX(0.35) * rotY(t * 0.07);
}

// ---------- 1 chip: a square package with 10 pins per side and routed traces
const float CHIP_PINS = 10.0;
const float CHIP_TRACES = 40.0;

void chipTrace(float k, out vec2 p0, out vec2 p1, out vec2 p2, out vec2 p3, out vec2 n) {
  float side = floor(k / CHIP_PINS);
  float pin = mod(k, CHIP_PINS);
  n = side < 0.5 ? vec2(1.0, 0.0) : (side < 1.5 ? vec2(0.0, 1.0) : (side < 2.5 ? vec2(-1.0, 0.0) : vec2(0.0, -1.0)));
  vec2 tg = vec2(-n.y, n.x);
  float along = -0.82 + pin * (1.64 / (CHIP_PINS - 1.0));
  float fan = pin < CHIP_PINS * 0.5 ? -1.0 : 1.0;
  vec2 bend = normalize(n + tg * fan);
  p0 = n * 1.08 + tg * along;
  p1 = p0 + n * (0.2 + 0.8 * hash(k * 3.1 + 1.0));
  p2 = p1 + bend * (0.15 + 0.6 * hash(k * 5.7 + 2.0));
  p3 = p2 + n * (0.35 + 1.5 * hash(k * 7.3 + 3.0));
}

vec2 chipAlong(float k, float u, out vec2 endP) {
  vec2 p0, p1, p2, p3, n;
  chipTrace(k, p0, p1, p2, p3, n);
  float l1 = length(p1 - p0);
  float l2 = length(p2 - p1);
  float l3 = length(p3 - p2);
  float s = u * (l1 + l2 + l3);
  endP = p3;
  if (s < l1) return p0 + (p1 - p0) * (s / l1);
  if (s < l1 + l2) return p1 + (p2 - p1) * ((s - l1) / l2);
  return p2 + (p3 - p2) * ((s - l1 - l2) / l3);
}

vec2 squareEdge(float s, float h) {
  float e = s * 4.0;
  float f = fract(e) * 2.0 - 1.0;
  float side = floor(e);
  return side < 0.5 ? vec2(f * h, -h) : (side < 1.5 ? vec2(h, f * h) : (side < 2.5 ? vec2(-f * h, h) : vec2(-h, -f * h)));
}

vec2 squareCorner(float c, float h) {
  c = mod(c, 4.0);
  return c < 0.5 ? vec2(-h, -h) : (c < 1.5 ? vec2(h, -h) : (c < 2.5 ? vec2(h, h) : vec2(-h, h)));
}

vec3 chipWorld(vec2 q, float t) {
  return rotX(0.95) * rotY(0.3 + sin(t * 0.08) * 0.12) * vec3(q.x, 0.0, q.y) * 1.15;
}

// ---------- 2 hub: seven systems around a core
vec3 hubNode(float k, float t) {
  float a = k / 7.0 * TAU + t * 0.06;
  return vec3(cos(a) * 3.25, 0.0, sin(a) * 3.25);
}

// ---------- 3 grid: a gently moving terrain
vec3 gridPoint(float i, float j, float t) {
  float cols = uGridCols;
  float rows = max(2.0, floor(uCount / cols));
  float x = (i / (cols - 1.0) - 0.5) * 18.0;
  float z = (j / (rows - 1.0) - 0.5) * 10.0;
  float y = sin(x * 0.45 + t * 0.5) * 0.38
          + sin(z * 0.8 - t * 0.4) * 0.26
          + sin((x - z) * 0.3 + t * 0.25) * 0.3;
  return rotX(0.3) * vec3(x, y, z) + vec3(0.0, -2.1, 0.0);
}

// ---------- 4 hud: dashed rings turning at different speeds
const float HUD_R[4] = float[4](1.35, 1.95, 2.55, 3.05);
const float HUD_D[4] = float[4](24.0, 64.0, 36.0, 96.0);
const float HUD_FILL[4] = float[4](0.55, 0.35, 0.7, 0.25);
const float HUD_SPEED[4] = float[4](0.12, -0.07, 0.05, -0.03);

vec3 hudDash(float ring, float dash, float f, float t) {
  int r = int(ring);
  float ang = (dash + f * HUD_FILL[r]) / HUD_D[r] * TAU + t * HUD_SPEED[r];
  return vec3(cos(ang), sin(ang), 0.0) * HUD_R[r];
}

vec3 hudTick(float tick, float outer) {
  float ang = tick / 72.0 * TAU;
  float len = mod(tick, 6.0) < 0.5 ? 0.22 : 0.1;
  return vec3(cos(ang), sin(ang), 0.0) * (3.32 + outer * len);
}

mat3 hudTilt() {
  return rotY(-0.38) * rotX(0.16);
}
`

export const PARTICLE_VERT = /* glsl */ `#version 300 es
precision highp float;

layout(location = 0) in vec4 aSeed;
layout(location = 1) in vec4 aSeed2;
${UNIFORMS}
uniform float uScatter;
uniform float uPixel;
uniform float uMaxPoint;
uniform vec2 uHalf;

out vec3 vColor;
out float vAlpha;
out float vBlur;
out float vShape;
out float vAngle;
${COMMON}

vec3 network(vec4 a, vec4 b, float t, out vec4 col) {
  float i = floor(a.x * NET_N);
  vec3 p;
  if (a.w < 0.3) {
    // Nodes; about one in ten is a larger, brighter hub.
    float big = step(0.9, hash(i + 11.0));
    vec3 g = vec3(gauss(b.x, b.y), gauss(b.z, b.w), gauss(a.z, a.y));
    p = netNode(i) + g * (0.012 + big * 0.05);
    col = vec4(mix(CYAN, WHITE, big), 1.0);
  } else if (a.w < 0.55) {
    // Data pulses running along the links.
    float j = i + netOffset(floor(a.y * 3.0));
    vec3 A = netNode(i);
    vec3 B = netNode(min(j, NET_N - 1.0));
    float ph = fract(b.x + t * (0.18 + 0.25 * b.y));
    p = mix(A, B, ph);
    float valid = step(j, NET_N - 1.0) * smoothstep(NET_EDGE, NET_EDGE * 0.7, length(B - A));
    col = vec4(VIOLET, valid * smoothstep(0.0, 0.15, ph) * smoothstep(1.0, 0.85, ph));
  } else if (a.w < 0.72) {
    // Arcs lifted above the surface, streaming between distant nodes.
    float arc = floor(a.x * 26.0);
    vec3 A = normalize(netNode(floor(hash(arc + 3.0) * NET_N)));
    vec3 B = normalize(netNode(floor(hash(arc + 7.0) * NET_N)));
    float s = fract(a.y + t * (0.08 + 0.06 * hash(arc)));
    float om = acos(clamp(dot(A, B), -0.995, 0.995));
    vec3 d = (sin((1.0 - s) * om) * A + sin(s * om) * B) / sin(om);
    p = normalize(d) * NET_R * (1.0 + 0.32 * sin(PI * s));
    col = vec4(mix(CYAN, WHITE, b.x), 0.75 * smoothstep(0.0, 0.1, s) * smoothstep(1.0, 0.9, s));
  } else if (a.w < 0.85) {
    // Two dashed orbit rings.
    float outer = step(0.5, b.x);
    float R = NET_R * (1.28 + outer * 0.16);
    float ang = a.y * TAU + t * (outer > 0.5 ? -0.05 : 0.07);
    float dash = step(0.4, fract(a.y * (outer > 0.5 ? 90.0 : 60.0)));
    vec3 q = vec3(cos(ang) * R, 0.0, sin(ang) * R);
    p = outer > 0.5 ? rotX(1.2) * rotZ(0.5) * q : rotX(1.45) * rotZ(-0.3) * q;
    col = vec4(BLUE, 0.6 * dash);
  } else {
    // A faint atmosphere just above the surface.
    vec3 d = normalize(vec3(gauss(a.x, a.y), gauss(b.x, b.y), gauss(b.z, a.z)) + 1e-4);
    p = d * NET_R * (1.0 + pow(b.w, 3.0) * 0.12);
    col = vec4(BLUE, 0.35);
  }
  return netSpin(t) * p;
}

vec3 chip(vec4 a, vec4 b, float t, out vec4 col) {
  vec2 q;
  float k = floor(a.x * CHIP_TRACES);
  vec2 endP;
  if (a.w < 0.1) {
    q = squareEdge(a.y, 1.0);
    col = vec4(CYAN, 1.0);
  } else if (a.w < 0.14) {
    q = squareEdge(a.y, 0.62);
    col = vec4(VIOLET, 0.9);
  } else if (a.w < 0.22) {
    // The die: a grid of cells that switch on and off like computation.
    float gx = floor(a.x * 10.0);
    float gy = floor(a.y * 10.0);
    q = (vec2(gx, gy) / 9.0 - 0.5) * 0.95;
    float on = step(0.55, fract(hash(gx * 13.0 + gy) + t * (0.15 + 0.35 * hash(gy * 7.0 + gx))));
    col = vec4(mix(BLUE, WHITE, on), 0.3 + 0.7 * on);
  } else if (a.w < 0.3) {
    // Pins between the package edge and the start of each trace.
    vec2 p0, p1, p2, p3, n;
    chipTrace(k, p0, p1, p2, p3, n);
    q = mix(p0 - n * 0.08, p0, a.y);
    col = vec4(CYAN, 0.9);
  } else if (a.w < 0.62) {
    q = chipAlong(k, a.y, endP);
    col = vec4(BLUE, 0.55);
  } else if (a.w < 0.84) {
    // Signals travelling outwards along the traces.
    float u = fract(b.x + t * (0.2 + 0.2 * b.y));
    q = chipAlong(k, u, endP);
    col = vec4(WHITE, smoothstep(0.0, 0.08, u) * smoothstep(1.0, 0.9, u));
  } else {
    chipAlong(k, 1.0, endP);
    q = endP + vec2(cos(a.y * TAU), sin(a.y * TAU)) * 0.065;
    col = vec4(CYAN, 0.9);
  }
  return chipWorld(q, t);
}

vec3 hub(vec4 a, vec4 b, float t, out vec4 col) {
  vec3 node = hubNode(floor(a.x * 7.0), t);
  vec3 g = vec3(gauss(b.x, b.y), gauss(b.z, b.w), gauss(a.z, a.y));
  vec3 p;
  if (a.w < 0.2) {
    p = g * 0.36;
    col = vec4(mix(VIOLET, WHITE, clamp(length(g) * 0.25, 0.0, 1.0)), 1.0);
  } else if (a.w < 0.46) {
    p = node + g * 0.15;
    col = vec4(mix(CYAN, WHITE, step(0.9, b.w) * 0.8), 1.0);
  } else if (a.w < 0.86) {
    float ph = fract(a.y + t * (0.14 + 0.1 * b.x));
    vec3 ctrl = node * 0.45 + vec3(0.0, 1.1 + 0.4 * b.z, 0.0);
    p = mix(mix(node, ctrl, ph), mix(ctrl, vec3(0.0), ph), ph) + g * 0.035;
    col = vec4(mix(CYAN, VIOLET, smoothstep(0.35, 1.0, ph)), smoothstep(0.0, 0.08, ph) * smoothstep(1.0, 0.9, ph));
  } else {
    float ang = a.y * TAU + t * 0.06;
    p = vec3(cos(ang) * 3.25, 0.0, sin(ang) * 3.25) + g * 0.02;
    col = vec4(BLUE, 0.8);
  }
  return rotX(0.5) * p;
}

vec3 grid(vec4 b, float t, out vec4 col) {
  float id = float(gl_VertexID);
  float i = mod(id, uGridCols);
  float j = floor(id / uGridCols);
  vec3 p = gridPoint(i, j, t);
  float h = clamp((p.y + 2.1 + 1.2) / 2.4, 0.0, 1.0);
  col = vec4(mix(BLUE, mix(CYAN, WHITE, step(0.99, b.w)), h), 0.35 + 0.65 * h);
  return p;
}

vec3 hud(vec4 a, vec4 b, float t, out vec4 col) {
  vec3 p;
  if (a.w < 0.5) {
    float ring = floor(a.x * 4.0);
    float dash = floor(a.y * HUD_D[int(ring)]);
    p = hudDash(ring, dash, b.x, t);
    col = vec4(mix(CYAN, WHITE, step(2.5, ring)), 0.9);
  } else if (a.w < 0.62) {
    p = hudTick(floor(a.x * 72.0), a.y);
    col = vec4(BLUE, 0.8);
  } else if (a.w < 0.8) {
    vec3 g = vec3(gauss(b.x, b.y), gauss(b.z, b.w), gauss(a.z, a.y) * 0.3);
    p = g * 0.22;
    col = vec4(VIOLET, 0.6);
  } else {
    // A data spiral pulled into the core.
    float ph = fract(a.x + t * (0.03 + 0.03 * b.x));
    float r = mix(2.9, 0.1, ph);
    float ang = a.y * TAU + ph * 5.0;
    p = vec3(cos(ang) * r, sin(ang) * r, -ph * 3.0);
    col = vec4(mix(CYAN, BLUE, ph), smoothstep(0.0, 0.1, ph) * (1.0 - ph * 0.6));
  }
  return hudTilt() * p;
}

void main() {
  float t = uTime;
  // 13% of particles are free-floating dust; 12% of the rest peel off the shapes.
  float ambient = step(0.87, aSeed2.w);
  float stray = (1.0 - ambient) * step(aSeed2.z, 0.12);
  vec3 sd = normalize(vec3(gauss(aSeed2.x, aSeed.w), gauss(aSeed2.y, aSeed.x), gauss(aSeed2.z, aSeed.y)) + 1e-4);
  vec3 p = vec3(0.0);
  vec4 c = vec4(0.0);
  float arrive;

  if (ambient > 0.5) {
    // Dust drifting up through the whole view; the closest motes blur into bokeh.
    float rangeY = uHalf.y * 2.8;
    p = vec3((aSeed.x - 0.5) * uHalf.x * 2.8, 0.0, mix(-8.0, 5.8, aSeed2.x));
    p.y = mod(aSeed.y * rangeY + t * (0.06 + 0.1 * aSeed.z), rangeY) - rangeY * 0.5;
    p += flow(p * 0.25 + aSeed.w * 10.0, t * 0.35) * 0.4;
    c = vec4(mix(mix(BLUE, VIOLET, aSeed.y), CYAN, aSeed.z * 0.7), mix(0.42, 0.3, uInk));
    arrive = uIntro;
  } else {
    vec4 fc;
    if (uW[0] > 0.001) { p += uW[0] * network(aSeed, aSeed2, t, fc); c += uW[0] * fc; }
    if (uW[1] > 0.001) { p += uW[1] * chip(aSeed, aSeed2, t, fc);    c += uW[1] * fc; }
    if (uW[2] > 0.001) { p += uW[2] * hub(aSeed, aSeed2, t, fc);     c += uW[2] * fc; }
    if (uW[3] > 0.001) { p += uW[3] * grid(aSeed2, t, fc);           c += uW[3] * fc; }
    if (uW[4] > 0.001) { p += uW[4] * hud(aSeed, aSeed2, t, fc);     c += uW[4] * fc; }

    p = p * uScale + uOffset;

    // The shape breathes in a slow swirl.
    p += flow(p * 0.5 + aSeed.xyz * 4.0, t * 0.6) * 0.03;

    // Fragments peel off, drift up and away, fade, then return to the shape.
    if (stray > 0.5) {
      float ph = fract(aSeed.w * 3.7 + t * (0.045 + 0.05 * aSeed.x));
      vec3 dir = normalize(flow(p * 0.3 + 5.0, t * 0.25) * 0.6 + vec3(0.7, 1.4, 0.25));
      p += dir * ph * (1.4 + 2.0 * aSeed.y);
      c.a *= smoothstep(0.0, 0.06, ph) * pow(1.0 - ph, 1.4);
    }

    // Particles loosen while one formation hands over to the next.
    p += sd * uScatter * (0.35 + 1.1 * aSeed2.w);

    // Page-load intro: particles arrive from far away, staggered.
    float local = clamp((uIntro - aSeed.w * 0.45) / 0.55, 0.0, 1.0);
    arrive = 1.0 - pow(1.0 - local, 3.0);
    p = mix(sd * (9.0 + 6.0 * aSeed2.z), p, arrive);
  }

  p = rotY(uTilt.x) * rotX(uTilt.y) * p;

  vec4 mv = vec4(p.x, p.y, p.z - 10.0, 1.0);
  vec4 clip = uProj * mv;
  vec2 ndc = clip.xy / clip.w;

  // Pointer pushes particles aside in screen space.
  vec2 d = ndc - uMouse;
  d.x *= uAspect;
  float dist = length(d);
  vec2 dir = d / max(dist, 1e-4);
  dir.x /= uAspect;
  float push = uMouseOn * smoothstep(0.3, 0.0, dist);
  ndc += dir * push * 0.085;

  // Click ripple.
  float glow = 0.0;
  if (uPulse.z >= 0.0) {
    vec2 pd = ndc - uPulse.xy;
    pd.x *= uAspect;
    float pdist = length(pd);
    float ring = exp(-pow((pdist - uPulse.z * 1.25) * 6.0, 2.0)) * (1.0 - uPulse.z / 1.8);
    vec2 pdir = pd / max(pdist, 1e-4);
    pdir.x /= uAspect;
    ndc += pdir * ring * 0.06;
    glow = max(ring, 0.0);
  }

  clip.xy = ndc * clip.w;
  gl_Position = clip;

  // Depth of field around the focal plane of the current formation.
  float depth = max(0.4, -mv.z);
  float blur = smoothstep(0.9, 5.5, abs(depth - uFocus));

  float size = (0.55 + aSeed.z * 1.25) * uPixel * (10.0 / depth);
  size *= 0.88 + 0.12 * sin(t * 1.7 + aSeed.x * 60.0);
  size *= 1.0 + blur * 2.6 + glow * 1.2 + push * 0.5 + stray * 0.5;
  gl_PointSize = min(size, uMaxPoint);

  float fog = smoothstep(21.0, 6.0, depth);
  float variation = 0.35 + 0.65 * fract(aSeed.x * 13.7 + aSeed2.y * 7.1);
  float intensity = mix(uIntensity, 0.85, ambient);
  // The click ripple brightens light and darkens ink.
  vColor = mix(min(c.rgb + glow * 0.4, vec3(1.0)), c.rgb * (1.0 - glow * 0.3), uInk);
  float facing = mix(1.0, clamp(0.5 + (uFocus - depth) / 5.0, 0.0, 1.0), 1.0 - ambient);
  vAlpha = c.a * variation * arrive * fog * intensity * mix(1.0, 0.2, blur) * (1.0 + glow * 0.8) * mix(0.35, 1.0, facing);
  vBlur = blur;
  vShape = (1.0 - ambient) * max(stray, step(0.82, aSeed.y));
  vAngle = aSeed.x * TAU + t * (aSeed.y - 0.5) * 1.2;
}
`

export const PARTICLE_FRAG = /* glsl */ `#version 300 es
precision mediump float;

in vec3 vColor;
in float vAlpha;
in float vBlur;
in float vShape;
in float vAngle;
uniform highp float uInk;
out vec4 outColor;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;

  // In focus: a round mote or a small rotated square fragment, both with a halo.
  // On paper the halo mostly goes and the mote tightens into a crisp dot.
  float cs = cos(vAngle);
  float sn = sin(vAngle);
  vec2 r = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs);
  float square = max(abs(r.x), abs(r.y));
  float halo = exp(-d * d * 9.0) * mix(1.0, 0.18, uInk);
  float spot = mix(exp(-d * d * 42.0), smoothstep(0.3, 0.16, d), uInk);
  float mote = spot + halo * 0.28;
  float shard = smoothstep(0.23, 0.15, square) + halo * 0.2;
  float crisp = mix(mote, shard, vShape);

  // Out of focus: a soft bokeh disc with a slightly brighter rim.
  float disc = smoothstep(0.5, 0.43, d);
  float rim = smoothstep(0.28, 0.46, d) * disc;
  float bokeh = disc * 0.5 + rim * 0.35;

  // Light: a white-hot centre inside the coloured halo, the way real light looks.
  // Ink: a denser, darker centre, the way a pen dot dries.
  vec3 hot = mix(vec3(1.0), vColor * 0.45, uInk);
  vec3 col = mix(vColor, hot, exp(-d * d * 110.0) * (1.0 - vBlur) * 0.85);
  float a = mix(crisp, bokeh, vBlur) * vAlpha;
  // Ink: out-of-focus motes read as smudges on paper, so they fade out instead.
  a = mix(a, min(a * (1.0 - vBlur * 0.75), 0.95), uInk);
  outColor = vec4(col * a, a);
}
`

// Hairline connections. Each vertex is one end of a segment; aLine holds
// (formation, a, b, end) and aLine2.x an extra index, decoded per formation.
export const LINE_VERT = /* glsl */ `#version 300 es
precision highp float;

layout(location = 0) in vec4 aLine;
layout(location = 1) in vec4 aLine2;
${UNIFORMS}

out float vAlpha;
out vec3 vColor;
${COMMON}

vec3 linePoint(int f, float a, float b, float c, float end, float t, out float alpha, out vec3 lcol) {
  if (f == 0) {
    float j = a + netOffset(b);
    vec3 A = netNode(a);
    vec3 B = netNode(min(j, NET_N - 1.0));
    alpha = 0.26 * step(j, NET_N - 1.0) * smoothstep(NET_EDGE, NET_EDGE * 0.7, length(B - A));
    vec3 q = end < 0.5 ? A : B;
    lcol = mix(BLUE, CYAN, 0.5 + 0.5 * q.y / NET_R);
    return netSpin(t) * q;
  }
  if (f == 1) {
    vec2 q;
    if (a < 1.5) {
      float h = a < 0.5 ? 1.0 : 0.62;
      q = squareCorner(b + end, h);
      alpha = a < 0.5 ? 0.55 : 0.4;
      lcol = a < 0.5 ? CYAN : VIOLET;
    } else {
      vec2 p0, p1, p2, p3, n;
      chipTrace(b, p0, p1, p2, p3, n);
      vec2 s0 = c < 0.5 ? p0 : (c < 1.5 ? p1 : p2);
      vec2 s1 = c < 0.5 ? p1 : (c < 1.5 ? p2 : p3);
      q = end < 0.5 ? s0 : s1;
      alpha = 0.34;
      lcol = mix(BLUE, CYAN, 0.35);
    }
    return chipWorld(q, t);
  }
  if (f == 2) {
    vec3 A = hubNode(b, t);
    vec3 B = a < 0.5 ? vec3(0.0) : hubNode(b + 1.0, t);
    alpha = a < 0.5 ? 0.2 : 0.28;
    lcol = a < 0.5 ? mix(CYAN, VIOLET, end) : BLUE;
    return rotX(0.5) * (end < 0.5 ? A : B);
  }
  if (f == 3) {
    alpha = 0.2;
    lcol = BLUE;
    return a < 0.5 ? gridPoint(b + end, c, t) : gridPoint(b, c + end, t);
  }
  alpha = a < 0.5 ? 0.45 : 0.3;
  lcol = a < 0.5 ? CYAN : BLUE;
  return hudTilt() * (a < 0.5 ? hudDash(b, c, end, t) : hudTick(b, end));
}

void main() {
  int f = int(aLine.x + 0.5);
  float w = weightOf(f);
  if (w < 0.01 || uIntro < 0.5) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vAlpha = 0.0;
    return;
  }
  float t = uTime;
  float alpha;
  vec3 lcol;
  vec3 p = linePoint(f, aLine.y, aLine.z, aLine2.x, aLine.w, t, alpha, lcol);
  vColor = lcol;
  p = p * uScale + uOffset;
  p = rotY(uTilt.x) * rotX(uTilt.y) * p;

  vec4 mv = vec4(p.x, p.y, p.z - 10.0, 1.0);
  vec4 clip = uProj * mv;
  vec2 ndc = clip.xy / clip.w;
  vec2 d = ndc - uMouse;
  d.x *= uAspect;
  float dist = length(d);
  vec2 dir = d / max(dist, 1e-4);
  dir.x /= uAspect;
  ndc += dir * uMouseOn * smoothstep(0.3, 0.0, dist) * 0.085;
  clip.xy = ndc * clip.w;
  gl_Position = clip;

  float depth = max(0.4, -mv.z);
  float fog = smoothstep(21.0, 6.0, depth);
  float facing = clamp(0.5 + (uFocus - depth) / 5.0, 0.0, 1.0);
  vAlpha = alpha * w * w * fog * uIntensity * smoothstep(0.6, 1.0, uIntro) * mix(0.3, 1.0, facing);
}
`

export const LINE_FRAG = /* glsl */ `#version 300 es
precision mediump float;
in float vAlpha;
in vec3 vColor;
uniform highp float uInk;
out vec4 outColor;
void main() {
  float a = min(vAlpha * mix(1.0, 1.2, uInk), 1.0);
  outColor = vec4(vColor * a, a);
}
`

// Fullscreen triangle without vertex buffers.
export const FULLSCREEN_VERT = /* glsl */ `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`

// Separable 9-tap Gaussian using linear filtering (5 fetches).
export const BLUR_FRAG = /* glsl */ `#version 300 es
precision mediump float;
in vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uDir;
out vec4 outColor;
void main() {
  vec4 s = texture(uTex, vUv) * 0.2270270270;
  s += (texture(uTex, vUv + uDir * 1.3846153846) + texture(uTex, vUv - uDir * 1.3846153846)) * 0.3162162162;
  s += (texture(uTex, vUv + uDir * 3.2307692308) + texture(uTex, vUv - uDir * 3.2307692308)) * 0.0702702703;
  outColor = s;
}
`

// Adds the blurred glow over the crisp particles, plus a soft light behind the formation.
export const COMPOSITE_FRAG = /* glsl */ `#version 300 es
precision mediump float;
in vec2 vUv;
uniform sampler2D uTex;
uniform float uBloom;
uniform vec2 uGlowCenter;
uniform float uGlow;
uniform float uAspect;
out vec4 outColor;
void main() {
  vec4 b = texture(uTex, vUv) * uBloom;
  vec2 d = vUv - uGlowCenter;
  d.x *= uAspect;
  float g = exp(-dot(d, d) * 5.0) * uGlow * 0.14;
  outColor = vec4(b.rgb + vec3(0.3, 0.45, 1.0) * g, min(1.0, b.a + g));
}
`
