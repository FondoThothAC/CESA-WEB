from PIL import Image
import numpy as np

img = Image.open("Mapa Interactivo/LAMINA-HERMOSILLO-2022-02-_001.png")
if img.mode == 'RGBA':
    bg = Image.new('RGB', img.size, (255, 255, 255))
    bg.paste(img, mask=img.split()[3])
    img = bg

arr = np.array(img)[:,:,:3]
H, W = arr.shape[:2]

r_ch = arr[:,:,0].astype(int)
g_ch = arr[:,:,1].astype(int)
b_ch = arr[:,:,2].astype(int)
yellow = (r_ch > 220) & (g_ch > 180) & (b_ch < 80)
blue = (r_ch < 80) & (g_ch < 100) & (b_ch > 80)
red = (r_ch > 180) & (g_ch < 80) & (b_ch < 80)
orange = (r_ch > 200) & (g_ch > 80) & (g_ch < 180) & (b_ch < 80)

building_mask = yellow | blue | red | orange
building_mask[1500:, :] = False
building_mask[:100, :] = False
building_mask[:, 2100:] = False
building_mask[:, :20] = False

by, bx = np.where(building_mask)
CX_MIN = int(bx.min())
CX_MAX = int(bx.max())
CY_MIN = int(by.min())
CY_MAX = int(by.max())
CX_C = (CX_MIN + CX_MAX) / 2.0
CY_C = (CY_MIN + CY_MAX) / 2.0

print(f"Campus bounds: x=[{CX_MIN},{CX_MAX}] y=[{CY_MIN},{CY_MAX}]")
print(f"Center: ({CX_C:.0f}, {CY_C:.0f})")
print(f"Image: {W}x{H}")

SX = 80.0 / (CX_MAX - CX_MIN)
SZ = 48.0 / (CY_MAX - CY_MIN)
print(f"Scale: sx={SX:.6f}, sz={SZ:.6f}")

def px2w(px, py):
    wx = (float(px) - CX_C) * SX
    wz = (CY_C - float(py)) * SZ
    return round(wx, 2), round(wz, 2)

def px2s(pw, ph):
    return round(float(pw) * SX, 2), round(float(ph) * SZ, 2)

# Building pixel data: (centroid_px, centroid_py, width_px, height_px, area)
# These are the REAL detected building regions from the image

# I need to map these to campus building IDs.
# Strategy: use the labeled map reference + position in image.
# The map has sections numbered from NW to SE.

# Key reference points from the campus map image text:
# - "UNIDAD REGIONAL CENTRO" title is at top-left
# - Blvd Navarrete runs along the north edge
# - Blvd Luis Encinas runs through center
# - Av Colosio runs along south
# - Calle Reforma runs vertically through center
# - The directory/legend is on the right side

# BLUE (2-floor) regions mapped to building IDs
# Based on position analysis:
# Top-left (NW) = Section 1
# Center-north = Sections 2,3
# East = Sections 5,9,10
# West = Section 7
# South = Sections 11,12

blue_buildings = [
    # (building_id, cpx, cpy, wpx, hpx, floors)
    ("1-A",    781, 471, 85, 89, 2),      # NW area - blue, large
    ("7-H",    720, 476, 37, 79, 2),      # NW area, near 1-A
    ("2-A",    1082, 332, 79, 23, 2),     # North center, near top
    ("3-B",    1108, 881, 54, 104, 2),    # Center
    ("3-A",    1180, 886, 60, 62, 2),     # Center, near 3-B
    ("3-G",    1125, 694, 30, 99, 2),     # Center, tall narrow
    ("3-H",    1404, 655, 59, 40, 2),     # Center-east
    ("3-E",    1417, 780, 41, 52, 2),     # Center
    ("5-A",    1695, 779, 86, 136, 2),    # East
    ("9-F",    1884, 890, 58, 34, 2),     # Far east
    ("10-A",   1900, 923, 65, 39, 2),     # Far east
    ("9-I",    1296, 789, 98, 35, 2),     # Center-east
    ("10-C",   1608, 1148, 80, 26, 2),    # South-east
    ("11-A",   812, 1213, 86, 38, 2),     # South-west area
    ("13-A",   1026, 1133, 25, 63, 2),    # South center
]

red_buildings = [
    ("3-D",    1289, 581, 93, 125, 3),    # Center-north, BIGGEST red
    ("3-C",    1048, 654, 92, 31, 3),     # Center-north
    ("3-I",    1084, 826, 46, 49, 3),     # Center
    ("5-D",    1049, 733, 91, 31, 3),     # Center-east
    ("5-E",    1449, 1023, 42, 36, 3),    # East
    ("5-G",    1599, 1061, 81, 23, 3),    # East
    ("5-F",    1694, 976, 72, 29, 3),     # East
    ("12-A",   1410, 1215, 113, 32, 3),   # South center
    ("12-F",   1391, 1062, 66, 24, 3),    # South center
    ("7-C",    437, 1140, 73, 48, 3),     # West
    ("7-D",    513, 1156, 61, 32, 3),     # West
    ("7-K",    667, 1058, 52, 29, 3),     # West
    ("10-B",   1771, 1073, 33, 70, 3),    # East
    ("12-B",   1362, 1031, 63, 29, 3),    # South center
    ("9-C",    1330, 1229, 40, 32, 3),    # South
]

yellow_buildings = [
    ("3-N",    1302, 818, 102, 46, 1),    # Center, LARGEST yellow
    ("5-B",    1696, 905, 87, 56, 1),     # East
    ("7-A",    562, 1128, 59, 35, 1),     # West
    ("3-K",    1480, 683, 36, 57, 1),     # Center
    ("3-F",    1156, 808, 66, 38, 1),     # Center
    ("13-B",   1317, 888, 39, 33, 1),     # Center-south
    ("5-C",    1269, 880, 27, 38, 1),     # Center-east
    ("9-D",    1841, 997, 46, 59, 1),     # Far east
    ("9-E",    1794, 1269, 32, 28, 1),    # South-east
    ("12-G",   1452, 1127, 60, 37, 1),    # South center
    ("7-B",    711, 1143, 14, 62, 1),     # West, narrow
    ("12-C",   699, 937, 32, 41, 1),      # West center
]

orange_buildings = [
    ("2-A-ORIG", 1004, 885, 94, 139, 5), # Center - BIGGEST building
    ("9-H",      2008, 734, 118, 140, 5), # Far east
]

# Streets (approximate pixel positions)
street_data = [
    ("Blvd. Navarrete", "h", 170),
    ("Blvd. Luis Encinas", "h", 650),
    ("Av. Luis Donaldo Colosio", "h", 1120),
    ("Calle de la Reforma", "v", 1100),
    ("Calle Francisco Q. Salazar", "v", 65),
    ("Calle Rosales", "v", 2115),
]

print("\n=== STREETS ===")
for name, orient, pos in street_data:
    if orient == "h":
        _, wz = px2w(0, pos)
        print(f"  {name}: worldZ = {wz}")
    else:
        wx, _ = px2w(pos, 0)
        print(f"  {name}: worldX = {wx}")

print("\n=== MAPPED BUILDINGS ===")
print(f"{'ID':<12} {'worldX':>7} {'worldZ':>7} {'sizeX':>5} {'sizeZ':>5} {'F'}")
print("-" * 50)

all_buildings = []
for bid, cpx, cpy, wpx, hpx, fl in orange_buildings:
    wx, wz = px2w(cpx, cpy)
    sw, sz = px2s(wpx, hpx)
    print(f"{bid:<12} {wx:>7} {wz:>7} {sw:>5} {sz:>5} {fl}")
    all_buildings.append((bid, wx, wz, sw, sz, fl))

for bid, cpx, cpy, wpx, hpx, fl in red_buildings:
    wx, wz = px2w(cpx, cpy)
    sw, sz = px2s(wpx, hpx)
    print(f"{bid:<12} {wx:>7} {wz:>7} {sw:>5} {sz:>5} {fl}")
    all_buildings.append((bid, wx, wz, sw, sz, fl))

for bid, cpx, cpy, wpx, hpx, fl in blue_buildings:
    wx, wz = px2w(cpx, cpy)
    sw, sz = px2s(wpx, hpx)
    print(f"{bid:<12} {wx:>7} {wz:>7} {sw:>5} {sz:>5} {fl}")
    all_buildings.append((bid, wx, wz, sw, sz, fl))

for bid, cpx, cpy, wpx, hpx, fl in yellow_buildings:
    wx, wz = px2w(cpx, cpy)
    sw, sz = px2s(wpx, hpx)
    print(f"{bid:<12} {wx:>7} {wz:>7} {sw:>5} {sz:>5} {fl}")
    all_buildings.append((bid, wx, wz, sw, sz, fl))
