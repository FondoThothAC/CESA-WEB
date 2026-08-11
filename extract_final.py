from PIL import Image
import numpy as np

# Cropped image bounds (original image coords)
X1, Y1 = 56, 230
X2, Y2 = 2110, 1540
CW = X2 - X1  # 2054
CH = Y2 - Y1  # 1310
# 3D plane is 90 x 55
SX = 90.0 / CW
SZ = 55.0 / CH
CX = (X1 + X2) / 2.0  # 1083
CY = (Y1 + Y2) / 2.0  # 885

def px2w(px, py):
    wx = (float(px) - CX) * SX
    wz = (CY - float(py)) * SZ
    return round(wx, 2), round(wz, 2)

def px2s(pw, ph):
    return round(float(pw) * SX, 2), round(float(ph) * SZ, 2)

# Detected regions: (id, cpx, cpy, wpx, hpx, floors, shape)
buildings = [
    # ORANGE (5-floor) - 2 big buildings
    ("2-A",    1004, 885, 94, 139, 5, "complex"),
    ("5-B",    2008, 734, 118, 140, 5, "complex"),
    
    # RED (3-floor) - 15 buildings
    ("3-D",    1289, 581, 93, 125, 3, "complex"),
    ("3-C",    1048, 654, 92, 31, 3, "rect"),
    ("3-I",    1084, 826, 46, 49, 3, "rect"),
    ("5-D",    1049, 733, 91, 31, 3, "rect"),
    ("5-E",    1449, 1023, 42, 36, 3, "rect"),
    ("5-G",    1599, 1061, 81, 23, 3, "rect"),
    ("5-F",    1694, 976, 72, 29, 3, "rect"),
    ("12-A",   1410, 1215, 113, 32, 3, "rect"),
    ("12-F",   1391, 1062, 66, 24, 3, "rect"),
    ("7-C",    437, 1140, 73, 48, 3, "complex"),
    ("7-D",    513, 1156, 61, 32, 3, "rect"),
    ("7-K",    667, 1058, 52, 29, 3, "rect"),
    ("10-B",   1771, 1073, 33, 70, 3, "rect"),
    ("9-C",    1330, 1229, 40, 32, 3, "rect"),
    
    # BLUE (2-floor) - 15 buildings
    ("1-A",    781, 471, 85, 89, 2, "U"),
    ("7-H",    720, 476, 37, 79, 2, "rect"),
    ("3-B",    1108, 881, 54, 104, 2, "rect"),
    ("3-A",    1180, 886, 60, 62, 2, "L"),
    ("3-G",    1125, 694, 30, 99, 2, "rect"),
    ("3-H",    1404, 655, 59, 40, 2, "rect"),
    ("3-E",    1417, 780, 41, 52, 2, "rect"),
    ("5-A",    1695, 779, 86, 136, 2, "rect"),
    ("9-F",    1884, 890, 58, 34, 2, "rect"),
    ("10-A",   1900, 923, 65, 39, 2, "rect"),
    ("9-I",    1296, 789, 98, 35, 2, "rect"),
    ("10-C",   1608, 1148, 80, 26, 2, "rect"),
    ("11-A",   812, 1213, 86, 38, 2, "rect"),
    ("13-A",   1026, 1133, 25, 63, 2, "rect"),
    
    # YELLOW (1-floor) - 12 buildings
    ("3-N",    1302, 818, 102, 46, 1, "rect"),
    ("7-A",    562, 1128, 59, 35, 1, "rect"),
    ("3-K",    1480, 683, 36, 57, 1, "rect"),
    ("3-F",    1156, 808, 66, 38, 1, "rect"),
    ("13-B",   1317, 888, 39, 33, 1, "rect"),
    ("5-C",    1269, 880, 27, 38, 1, "rect"),
    ("9-D",    1841, 997, 46, 59, 1, "rect"),
    ("9-E",    1794, 1269, 32, 28, 1, "rect"),
    ("12-G",   1452, 1127, 60, 37, 1, "rect"),
    ("7-B",    711, 1143, 14, 62, 1, "rect"),
    ("12-C",   699, 937, 32, 41, 1, "rect"),
    ("5-C2",   1887, 417, 64, 52, 1, "rect"),
]

print("Building positions for campusData.ts:")
print()
for bid, cpx, cpy, wpx, hpx, fl, shape in buildings:
    wx, wz = px2w(cpx, cpy)
    sw, sz = px2s(wpx, hpx)
    print(f'  {{ id: "{bid}", floors: {fl}, position: [{wx}, 0, {wz}], size: [{sw}, {sz}], shape: "{shape}" }}')

# Streets
print("\nStreets:")
for name, orient, pos in [
    ("Blvd. Navarrete", "h", 170),
    ("Blvd. Luis Encinas", "h", 650),
    ("Av. Luis Donaldo Colosio", "h", 1120),
    ("Calle de la Reforma", "v", 1100),
    ("Calle Francisco Q. Salazar", "v", 65),
    ("Calle Rosales", "v", 2115),
]:
    if orient == "h":
        _, wz = px2w(0, pos)
        print(f"  {name}: worldZ = {wz}")
    else:
        wx, _ = px2w(pos, 0)
        print(f"  {name}: worldX = {wx}")
