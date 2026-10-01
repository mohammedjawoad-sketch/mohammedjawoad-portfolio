"""Builds the Core, the site's 3D centrepiece: the logo (a core with seven
modules in orbit) as a modeled object. Run from the repo root:

    npm run model

which calls Blender in the background with this script. It writes
public/models/core.glb: flat-shaded facet meshes plus loose-edge line meshes,
Y-up, no materials. The site's engine finds the parts by object name
(src/particles/core.ts), and it draws the orbit rings and the struts itself.
"""

import math
import sys

import bmesh
import bpy
from mathutils import Vector

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "core.glb"

scene = bpy.context.scene
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)


def add_mesh(name, bm, smooth=False):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = smooth
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    return obj


def add_lines(name, verts, edges):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([tuple(v) for v in verts], edges, [])
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    return obj


def outline(bm, keep_face):
    """Line copy of the edges that border the faces keep_face accepts."""
    verts, edges, index = [], [], {}
    for face in bm.faces:
        if not keep_face(face):
            continue
        for edge in face.edges:
            ids = []
            for vert in edge.verts:
                if vert.index not in index:
                    index[vert.index] = len(verts)
                    verts.append(vert.co.copy())
                ids.append(index[vert.index])
            pair = tuple(sorted(ids))
            if pair not in edges:
                edges.append(pair)
    return verts, edges


# Shell: an icosahedron with every edge chamfered, so it reads as a cut gem:
# 20 triangles, 30 chamfer strips and 12 pentagons, each edge drawn as light.
bm = bmesh.new()
bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.84)
bmesh.ops.bevel(bm, geom=list(bm.edges), offset=0.12, offset_type="OFFSET", segments=1, profile=0.5, affect="EDGES")
bm.verts.index_update()
shell_lines = outline(bm, lambda face: True)
add_mesh("CoreShell", bm)
add_lines("CoreEdges", *shell_lines)

# Cage: a dodecahedron of wire inside the shell, the icosahedron's dual, turning the other way.
phi = (1 + 5 ** 0.5) / 2
points = [Vector((x, y, z)) for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)]
for a in (-1, 1):
    for b in (-1, 1):
        points += [Vector((0, a / phi, b * phi)), Vector((a / phi, b * phi, 0)), Vector((a * phi, 0, b / phi))]
shortest = min((p - q).length for i, p in enumerate(points) for q in points[i + 1 :])
cage_edges = [
    (i, j)
    for i in range(len(points))
    for j in range(i + 1, len(points))
    if abs((points[i] - points[j]).length - shortest) < 1e-4
]
scale = 0.5 / points[0].length
add_lines("Cage", [p * scale for p in points], cage_edges)

# Heart: the warm light at the centre.
bm = bmesh.new()
bmesh.ops.create_icosphere(bm, subdivisions=3, radius=0.27)
add_mesh("Heart", bm, smooth=True)

# Module: a rounded block, one per application. Its six flat faces are outlined.
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=0.26)
bmesh.ops.bevel(bm, geom=list(bm.edges), offset=0.045, offset_type="OFFSET", segments=2, profile=0.5, affect="EDGES")
bm.verts.index_update()
bm.normal_update()
module_lines = outline(bm, lambda face: len(face.verts) == 4 and max(abs(c) for c in face.normal) > 0.999)
add_mesh("Module", bm)
add_lines("ModuleEdges", *module_lines)

for obj in scene.collection.objects:
    obj.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_yup=True,
    export_normals=True,
    export_texcoords=False,
    export_materials="NONE",
    use_mesh_edges=True,
    export_animations=False,
    export_cameras=False,
    export_lights=False,
)

for obj in scene.collection.objects:
    mesh = obj.data
    print(f"CORE_PART {obj.name}: {len(mesh.vertices)} verts, {len(mesh.edges)} edges, {len(mesh.polygons)} faces")
print(f"CORE_EXPORTED {OUT}")
