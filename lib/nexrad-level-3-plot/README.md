# nexrad-level-3-plot

> A javascript implementation for plotting Nexrad Level III data parsed via [nexrad-level-3-data](https://github.com/netbymatt/nexrad-level-3-data/).

# Use
## Install
```bash
npm -i nexrad-level-3-plot
```

## Call
```javascript
const fs = require('fs');
const { plot, writeToPngFile } = require('nexrad-level-3-plot');

// read a file
const file = fs.readFileSync('<path to data>');
// parse and plot
const level3Plot = plot(file);
// use bundled utility to write to disk
(async () => {
	await writePngToFile('<path to output>.png');
})();
```
# Data
Level three data is available from NOAA free of charge. [nexrad-level-3-data](https://github.com/netbymatt/nexrad-level-3-data/#background-information) has additional details about these data sources.

# Work in Progress
This package is currently incomplete. It will plot raster data created by the package mentioned above but there are several limitations that will be addressed in future releases.
- Color scales do not dynamically change when needed such as with total precipitation products.
- Only some products are [supported](#supported-products)

## Supported Products
|ID|Code|Description|
|---|---|---|
78|N1P|One-hour precipitation
80|NTP|Storm total precipitation
165|N0H,N1H,N2H,N3H|Hydrometeor Classification
170|DAA|Digital One Hour Accumulation
172|DTA|Digital Total Accumulation
177|HCC|Hybrid Hydrometeor Classification

# Demos
Test code and data is provided in the `./demo` folder. `test.js` can be used to test any one of the products by commenting/uncommenting the appropriate line in the file. All images will be output as PNG to `./output`. A `test-all.js` is also provided to plot all of the products provided in the `./data/` folder. This test will product images in multiple sizes to show scaling built-in scaling functionality.

# API

## plot(file, options)
Returns a [Canvas](https://www.npmjs.com/package/canvas) object.
> Note: May return null if the productNullFlag is set. This is common on precipitation total products that have not seen precipitation in several hours.

|Paramater|Type|Default|Description|
|---|---|---|---|
file|Buffer or String||A NOAA Nexrad level 3 data file to plot. See [data](#data).
options.size|integer|1800|1 to 1800. Size of the x and y axis in pixels. The image must be square so only a single integer is needed. See [downsampling](#downsampling)
options.background|string|#000000|Background color of the image. This can be transparent by using #RGBA notation. See [ctx.fillStyle](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle) for more information.
options.lineWidth|integer|2|The raster image is created by drawing several arcs at the locations and colors specified in the data file. When scaling down you may get a better looking image by adjusting this value to something large than the default.
options.palletize|boolean\|object|false|After drawing the image convert the image from RGBA to a palettized image. When true the same pallet as the product is used. Additional options are described in [palletizing](#palletizing). This can significantly reduce the size of the resulting image with minimal loss of clarity.
|options.logger|logger|console|By default messages and errors will be logged to the console. These can be surpressed by passing false. A custom logger can be provided. It must provide the functions ``log()`` and ``error()``.

### Downsampling
A full size plot is 1800 x 1800 pixels. This corresponds to the maximum range of the radar ~250 mi * maximum resolution 0.25 mi/bin * 2 (east and west side of radar).

options.size < 1800 will internally scale the image to the selected size. The scaling algorithm is specific to radar data and returns the maximum value over the range of bins that are combined due to the scaling factor. This ensures that maximum reflectivity or maximum velocity are preserved during the scaling process. Using an image scaling package is not preferred in this case as the scaling algorithm used my mask important data.

options.size > 1800 is invalid as this would cause data to be interpolated and would not be a true representation of the data returned by the radar. If you need this functionality it's recommended to use an image scaling package such as [jimp](https://www.npmjs.com/package/jimp) or [gm](https://www.npmjs.com/package/gm) on the Canvas returned by plot().

### Palletizing
>If used with [plotAndData()](#plotanddatafile-options) both the original image and the palletized image will be returned if used with [plot()](#plotfile-options) only the palletized image will be returned.

Plotting what is essentially polar data (raw radar data) to a cartesean coordinate system (raster image) causes some artifacts as the arcs drawn by the raster data do not align exactly with the grid of pixels in the raster image. The plotting algorithm approximates the arc by using colors between the pallet specificed color and background color to "partially" shade the pixels that are not fully consumed by the arc.

This process makes use of the RGBA color space with either 3 or 4 bytes per pixel. From the standpoint of representing radar data in an image this is very inefficient use of space as typically 16 or 32 colors (> 1 byte) is necessary to show the data in it's original format. This RGBA image also does not lend itself well to PNG compression which is lossless.

Palletizing introduces a compromise between image size and compresability. After the initial image is drawing the palletizing algorithm can then re-process the RGBA image and force all pixels to be one of the original color values specificed in the product's palette (options.palletize = true, the default). It can also generate an optimized pallet that uses a set number of steps between the colors in the palette and the background color with a maximum generated pallet size of 256 colors (options.palletize.generate = <steps>). Finally a custom palette can be provided in the form of [r1,g1,b1,r2,g2,b2,...] alpha values will be generated automatically.

A look-up table is created and cached as part of the palletization process speeding up additional calls the the palletizing function. The cache is specific to the product and options provided.

#### Palletization options (options.palletize.<parameter>)
Parameter|Type|Default|Description
|--|--|--|--|
generate|integer|0|Generate a palette by creating a number of steps between the background color and each color provided the the product data. There is a hard limit of 256 colors in the palette due to the PNG specification. For example a 16-color original palette with generate = 4 would produce a palette of 64 colors (4 versions of each of the original 16 colors).
palette|array|\<from product>|If not provided the palette provided by the palette is used. If use the array should be in the format [r1,g1,b1,a1,r2,g2,b2,a2,...]. The generate option will operate on this array if it is provided. Set generate to 0 to keep the provided palette from being altered.

## plotAndData(file, options)
Returns {image, data [,palletized]} where image is the same as the return value from [plot()](#plotfile-options) and data is the raw data returned from [nexrad-level-3-data](https://github.com/netbymatt/nexrad-level-3-data/).

## writePngToFile(fileName, canvas)
Returns a Promise which resolves to the written file name.
Writes a PNG file to disk. Provided as a convenience function for production and testing.
|Paramater|Type|Description|
|---|---|---|
fileName|string|A file name or path used by [fs.createWriteStream()](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options).
canvas|[Canvas](https://www.npmjs.com/package/canvas)|Typically the output of [plot()](#plotfile-options).

# Acknowledgements
The code for this project is based upon:
- [nexrad-level-3-data](https://github.com/netbymatt/nexrad-level-3-data/)
- [Unidata](https://github.com/Unidata/thredds/blob/master/cdm/src/main/java/ucar/nc2/iosp/nexrad2/)
- [nexrad-radar-data](https://github.com/bartholomew91/nexrad-radar-data)
- And my own fork of the above [netbymatt/nexrad-level-2-data](https://github.com/netbymatt/nexrad-level-2-data)