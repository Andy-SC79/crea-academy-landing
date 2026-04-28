def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        raise ValueError("Invalid hex color format")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(r, g, b):
    """Convert RGB values to hex color."""
    return f"#{r:02X}{g:02X}{b:02X}"

def mix_hex_colors(color_a, color_b, weight):
    """Mix two hex colors with given weight."""
    r1, g1, b1 = hex_to_rgb(color_a)
    r2, g2, b2 = hex_to_rgb(color_b)

    r = int(r1 * (1 - weight) + r2 * weight)
    g = int(g1 * (1 - weight) + g2 * weight)
    b = int(b1 * (1 - weight) + b2 * weight)

    return rgb_to_hex(r, g, b)

# Constants
DEFAULT_PALETTE = ["#04FF8D", "#00E5FF", "#9D00FF"]
LIGHT_MODE_PRISM_TARGETS = ["#0080FF", "#4B0082", "#B22222"]
LIGHT_MODE_WEIGHTS = [0.9, 0.9, 0.9]
LIGHT_TRAIL_INK = "#0B1424"

# Calculate bodyFill colors (mixed palette for light mode)
body_fill = []
for i, color in enumerate(DEFAULT_PALETTE):
    mixed = mix_hex_colors(color, LIGHT_MODE_PRISM_TARGETS[i], LIGHT_MODE_WEIGHTS[i])
    body_fill.append(mixed)

print("Body Fill Colors (Light Mode):")
for i, color in enumerate(body_fill):
    print(f"  Color {i+1}: {color}")

# Calculate tail colors (each bodyFill mixed with LIGHT_TRAIL_INK at 0.5)
tail_colors = []
for color in body_fill:
    tail = mix_hex_colors(color, LIGHT_TRAIL_INK, 0.5)
    tail_colors.append(tail)

print("\nTail Colors (Light Mode):")
for i, color in enumerate(tail_colors):
    print(f"  Tail {i+1}: {color}")