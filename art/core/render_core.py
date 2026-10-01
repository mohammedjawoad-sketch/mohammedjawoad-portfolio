"""Beauty render of the Core with Cycles: refractive glass, a gold heart that
lights the crystal from inside, glowing edges, the network globe and drifting
dust, with bloom and depth of field. Used for the LinkedIn and GitHub banners.
Run from the repo root:

    blender -b --factory-startup --python art/core/render_core.py -- \
        public/models/core.glb out.png 1600 792 [samples]
"""

import math
import random
import sys

import bpy
from mathutils import Vector

GLB, OUT, WIDTH, HEIGHT = sys.argv[sys.argv.index("--") + 1 :][:4]
WIDTH, HEIGHT = int(WIDTH), int(HEIGHT)
rest = sys.argv[sys.argv.index("--") + 5 :]
SAMPLES = int(rest[0]) if rest else 256

# The site's palette (dark theme), linear-ish for emission.
WHITE = (1.0, 1.0, 1.0)
VIOLET = (0.62, 0.48, 1.0)
CYAN = (0.18, 0.78, 1.0)
BLUE = (0.2, 0.34, 1.0)
GOLD = (1.0, 0.56, 0.16)
NAVY = (0.0035, 0.005, 0.013)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)
parts = {obj.name: obj for obj in scene.objects}
random.seed(20261001)


# ---------- materials

def material(name):
    mat = bpy.data.materials.new(name)
    try:
        mat.use_nodes = True
    except AttributeError:
        pass
    return mat, mat.node_tree


def emission(name, color, strength):
    mat, tree = material(name)
    tree.nodes.clear()
    out = tree.nodes.new("ShaderNodeOutputMaterial")
    emit = tree.nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (*color, 1)
    emit.inputs["Strength"].default_value = strength
    tree.links.new(emit.outputs[0], out.inputs["Surface"])
    return mat


def glass(name, tint, roughness=0.015):
    mat, tree = material(name)
    bsdf = tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*tint, 1)
    bsdf.inputs["Transmission Weight"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["IOR"].default_value = 1.46
    return mat


def heart_material():
    """Gold at the rim, white-hot where it faces the camera."""
    mat, tree = material("Heart")
    tree.nodes.clear()
    out = tree.nodes.new("ShaderNodeOutputMaterial")
    emit = tree.nodes.new("ShaderNodeEmission")
    facing = tree.nodes.new("ShaderNodeLayerWeight")
    facing.inputs["Blend"].default_value = 0.35
    ramp = tree.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (1.0, 0.93, 0.8, 1)
    ramp.color_ramp.elements[1].color = (*GOLD, 1)
    ramp.color_ramp.elements[1].position = 0.4
    tree.links.new(facing.outputs["Facing"], ramp.inputs["Fac"])
    tree.links.new(ramp.outputs["Color"], emit.inputs["Color"])
    emit.inputs["Strength"].default_value = 3.2
    tree.links.new(emit.outputs[0], out.inputs["Surface"])
    return mat


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def to_tubes(obj, radius, mat):
    """Loose edges become glowing tubes."""
    for other in scene.objects:
        other.select_set(False)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="CURVE")
    obj.data.bevel_depth = radius
    obj.data.bevel_resolution = 2
    assign(obj, mat)
    return obj


# ---------- the Core, under one rig so it can be turned as a whole

rig = bpy.data.objects.new("Rig", None)
scene.collection.objects.link(rig)

def adopt(obj):
    obj.parent = rig
    return obj

shell = adopt(parts["CoreShell"])
assign(shell, glass("Crystal", (0.82, 0.92, 1.0)))
shell.rotation_euler = (0.25, 0.4, 0.9)
edges = adopt(to_tubes(parts["CoreEdges"], 0.0065, emission("Edges", (0.45, 0.85, 1.0), 4.5)))
edges.rotation_euler = shell.rotation_euler

cage = adopt(to_tubes(parts["Cage"], 0.0045, emission("Cage", VIOLET, 3.5)))
cage.rotation_euler = (0.0, 0.5, -0.6)

heart = adopt(parts["Heart"])
assign(heart, heart_material())
glow = bpy.data.lights.new("HeartLight", "POINT")
glow.energy = 14
glow.color = (1.0, 0.7, 0.35)
glow.shadow_soft_size = 0.22
heart_light = adopt(bpy.data.objects.new("HeartLight", glow))
scene.collection.objects.link(heart_light)

module = parts["Module"]
module_edges = to_tubes(parts["ModuleEdges"], 0.0045, emission("ModuleEdges", CYAN, 5))
module_glass = [glass("ModuleCyan", (0.6, 0.92, 1.0)), glass("ModuleBlue", (0.62, 0.7, 1.0))]
module_lines = [module_edges.data.materials[0], emission("ModuleEdgesBlue", (0.4, 0.55, 1.0), 5)]

ORBIT = 1.62
for k in range(7):
    angle = k / 7 * math.tau + 0.4
    position = Vector((math.cos(angle) * ORBIT, math.sin(angle) * ORBIT, 0))
    spin = (0.55 + 0.3 * math.sin(k), 0.2 * k, k * 0.9)
    block = module.copy()
    block.data = module.data.copy()
    assign(block, module_glass[k % 2])
    lines = module_edges.copy()
    lines.data = module_edges.data.copy()
    assign(lines, module_lines[k % 2])
    for obj in (block, lines):
        scene.collection.objects.link(obj)
        obj.location = position
        obj.rotation_euler = spin
        adopt(obj)
bpy.data.objects.remove(module, do_unlink=True)
bpy.data.objects.remove(module_edges, do_unlink=True)

# Struts from each module to the heart.
curve = bpy.data.curves.new("Struts", "CURVE")
curve.dimensions = "3D"
curve.bevel_depth = 0.0028
for k in range(7):
    angle = k / 7 * math.tau + 0.4
    out = Vector((math.cos(angle), math.sin(angle), 0))
    spline = curve.splines.new("POLY")
    spline.points.add(1)
    spline.points[0].co = (*(out * (ORBIT - 0.2)), 1)
    spline.points[1].co = (*(out * 0.3), 1)
struts = bpy.data.objects.new("Struts", curve)
scene.collection.objects.link(struts)
assign(struts, emission("Struts", CYAN, 2.2))
adopt(struts)

# Gyroscope rings and the faint orbit.
def ring(name, radius, thickness, rotation, mat):
    bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=thickness, major_segments=256, minor_segments=8)
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = rotation
    assign(obj, mat)
    adopt(obj)

ring_light = emission("Rings", (0.5, 0.85, 1.0), 3.2)
ring("RingA", 1.13, 0.0042, (0.35, 0.9, 0.0), ring_light)
ring("RingB", 1.3, 0.0035, (1.2, -0.5, 0.3), ring_light)
ring("Orbit", ORBIT, 0.0022, (0, 0, 0), emission("Orbit", BLUE, 2.2))

rig.rotation_euler = (math.radians(68), 0.0, math.radians(18))

# ---------- the network globe around it, and dust in front of and behind it

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=2.6)
globe_lines = bpy.context.active_object
globe_lines.name = "GlobeLines"
globe_lines.rotation_euler = (0.3, 0.2, 0.5)
# Keep only the edges, so they become tubes.
import bmesh  # noqa: E402
bm = bmesh.new()
bm.from_mesh(globe_lines.data)
bmesh.ops.delete(bm, geom=list(bm.faces), context="FACES_ONLY")
bm.to_mesh(globe_lines.data)
bm.free()
to_tubes(globe_lines, 0.0026, emission("Globe", (0.25, 0.4, 1.0), 1.4))

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=2.6)
globe_points = bpy.context.active_object
globe_points.name = "GlobeNodes"
globe_points.rotation_euler = globe_lines.rotation_euler
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.024)
node = bpy.context.active_object
assign(node, emission("Node", CYAN, 2.4))
node.parent = globe_points
globe_points.instance_type = "VERTS"
globe_points.show_instancer_for_render = False

dust_mesh = bpy.data.meshes.new("Dust")
dust_mesh.from_pydata(
    [(random.uniform(-9, 9), random.uniform(-6, 9), random.uniform(-4, 4)) for _ in range(260)], [], []
)
dust = bpy.data.objects.new("Dust", dust_mesh)
scene.collection.objects.link(dust)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.018)
mote = bpy.context.active_object
assign(mote, emission("Mote", (0.45, 0.5, 1.0), 1.4))
mote.parent = dust
dust.instance_type = "VERTS"
dust.show_instancer_for_render = False

# ---------- camera, world, render

target = bpy.data.objects.new("Target", None)
scene.collection.objects.link(target)
cam_data = bpy.data.cameras.new("Camera")
cam_data.lens = 35
cam_data.dof.use_dof = True
cam_data.dof.focus_object = target
cam_data.dof.aperture_fstop = 1.2
camera = bpy.data.objects.new("Camera", cam_data)
scene.collection.objects.link(camera)
camera.location = (0.0, -7.4, 1.0)
track = camera.constraints.new("TRACK_TO")
track.target = target
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"
scene.camera = camera

world = bpy.data.worlds.new("Night")
scene.world = world
try:
    world.use_nodes = True
except AttributeError:
    pass
background = world.node_tree.nodes.get("Background")
background.inputs["Color"].default_value = (*NAVY, 1)
background.inputs["Strength"].default_value = 1.0

render = scene.render
render.engine = "CYCLES"
render.resolution_x = WIDTH
render.resolution_y = HEIGHT
render.resolution_percentage = 100
render.image_settings.file_format = "PNG"
render.image_settings.color_mode = "RGB"
render.filepath = OUT
cycles = scene.cycles
cycles.samples = SAMPLES
cycles.use_denoising = True
cycles.denoiser = "OPENIMAGEDENOISE"
cycles.max_bounces = 16
cycles.transmission_bounces = 14
cycles.glossy_bounces = 8
cycles.caustics_reflective = False
cycles.blur_glossy = 1.0
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "OPTIX"
    prefs.get_devices()
    for device in prefs.devices:
        device.use = device.type == "OPTIX"
    cycles.device = "GPU"
except Exception as error:  # CPU fallback
    print("RENDER_DEVICE cpu:", error)

# Khronos PBR Neutral keeps hue and saturation in bright light (AgX washes the neon out,
# Standard clips the gold heart to white).
try:
    scene.view_settings.view_transform = "Khronos PBR Neutral"
except TypeError:
    scene.view_settings.view_transform = "Standard"

# Bloom in the compositor (Blender 5: node groups, options as inputs).
comp = bpy.data.node_groups.new("Bloom", "CompositorNodeTree")
comp.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
layers = comp.nodes.new("CompositorNodeRLayers")
glare = comp.nodes.new("CompositorNodeGlare")
for name, value in (("Type", "Bloom"), ("Quality", "High"), ("Threshold", 0.75), ("Strength", 0.6), ("Size", 0.7)):
    try:
        glare.inputs[name].default_value = value
    except Exception as error:
        print("GLARE", name, error)
output = comp.nodes.new("NodeGroupOutput")
comp.links.new(layers.outputs["Image"], glare.inputs["Image"])
comp.links.new(glare.outputs["Image"], output.inputs["Image"])
scene.compositing_node_group = comp
render.use_compositing = True

bpy.ops.render.render(write_still=True)
print("RENDER_DONE", OUT, WIDTH, HEIGHT, SAMPLES)
