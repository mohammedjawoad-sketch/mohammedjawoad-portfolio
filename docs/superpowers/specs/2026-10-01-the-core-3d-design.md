# The Core: a modeled 3D centerpiece

Date: 2026-10-01. Request: "bring me the best graphics and animation and 3d modeling and quality you can get even with the colors and content". The user delegated the design decisions ("do your best ... i depend on you").

## Intent

The site is a profile for hiring managers and clients. The motion has to read as future technology and still serve the content: the name, the figures and the projects. Until now, every shape on the page was particles and lines, and nothing was a modeled 3D object.

## Concept

The logo, a core with seven dots in orbit, becomes a real 3D object called "the Core":

- a faceted crystal shell with glowing edges, an inner wire cage turning the other way, and a warm heart of light;
- seven modules (beveled blocks) in orbit, one per application (7 SAP-integrated applications, 7 companies on one portal);
- two gyroscope rings, plus struts that carry pulses from each module into the heart.

Choreography follows the existing formations, so the object always sits where the story is about integration:

| Section | Formation | The Core |
|---|---|---|
| Hero, Results | network globe | inside the globe, modules on a tight orbit |
| Projects | hub ("seven systems into one core") | modules fly out to the hub's seven nodes, and the particle streams run from them into the heart |
| Contact | HUD rings | small, at the centre of the rings |
| Other sections | chip, terrain | fades out |

The Core turns with the page scroll and the pointer, the same as the particles.

## Rendering

- Modeled in Blender 5.2 from a script in the repo (`art/core/build_core.py`), so it can be rebuilt. Exported to `public/models/core.glb` with flat-shaded facets and loose edges as line primitives. Budget: under 100 KB.
- Drawn by the existing WebGL2 engine (no three.js): a small GLB reader, a holographic glass shader (fresnel rim, facet sparkle from two moving lights, a fake refraction gradient, the scanner band), additive glowing edge lines and a warm emissive heart, all through the existing bloom. In the light theme it draws as ink: dark edges and pale facets, normal blending, no bloom.
- If the model fails to load, the page carries on with particles only.

## Colour

Gold joins the palette as the colour of value and heat. It's used sparingly: the Core's heart, the hub's core particles, the Results total, its double rule and the "Balanced" seal. Dark theme amber `#ffb547`; light theme bronze `#a35b00`, which keeps text contrast above 4.5:1 in both themes. Everything else keeps the cool light (blue, cyan, violet) on navy.

## Content

No new claims. The Core visualises facts the page already states (seven applications, one SAP core).

## Social images

A Cycles render of the Core for the LinkedIn and GitHub banners. The link preview image is re-captured from the site.

## Quality bar and checks

- 60 fps on desktop, no new console warnings, no horizontal overflow.
- English and Arabic, dark and light, desktop and mobile, reduced motion (the Core holds still).
- The prerendered HTML is unchanged, so SEO is unaffected.
