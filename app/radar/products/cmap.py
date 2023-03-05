import matplotlib.pyplot as plt
import numpy as np
import pyart

vmin = -120
vmax = 120
steps = 20

# Define the colormap
cmap = pyart.graph.cm_colorblind._generate_cmap('balance', 256) # plt.cm.get_cmap('RdBu_r')

# Create a numpy array of values between -120 and 120 in steps of 10
values = np.arange(vmin, vmax + 1, steps)

# Convert the values to colors using the colormap
colors = cmap((values - vmin) / (vmax - vmin))

# Convert the colors to RGB values
rgb_values = np.round(colors[:, :3] * 255).astype(int)

# Print the RGB values and numerical values every 10th value
step = 1
print([f'rgb({r}, {g}, {b})' for r, g, b in rgb_values[::step]])
print(list(map(int, (values[::step]))))