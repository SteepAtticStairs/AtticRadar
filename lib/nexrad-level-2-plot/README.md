# nexrad-level-2-plot

> A javascript implementation for plotting Nexrad Level II data parsed via [nexrad-level-2-data](https://github.com/netbymatt/nexrad-level-2-data/).

# Use
## Install
```bash
npm -i nexrad-level-2-plot
```

## Call
```javascript
const fs = require('fs');
const { plot, writeToPngFile } = require('nexrad-level-3-plot');

// read a file
const file = fs.readFileSync('<path to data>');
// parse and plot
const level2Plot = plot(file, 'REF', {elevations: 1});
// use bundled utility to write to disk
(async () => {
	await writePngToFile('<path to output>.png', level2Plot[0].REF);
})();
```
# Data
Level two data is available from NOAA free of charge. [nexrad-level-2-data](https://github.com/netbymatt/nexrad-level-2-data/#background-information) has additional details about these data sources.

# Work in Progress
This package is currently incomplete. It will plot raster data created by the package mentioned above but there are several limitations that will be addressed in future releases.
- Color scales do not dynamically change when needed such as with total precipitation products.
- Only some products are [supported](#supported-products)

## Supported Products
All products available as part of NEXRAD level 2 are listed. Currently supported products are marked.
|ID|Supported|Description|
|---|---|---|
REF|[x]|Reflectivity
VEL|[x]|Velocity
SW_|[ ]|Spectrum Width (note space after SW)
ZDR|[ ]|Differential Reflectivity
PHI|[ ]|Differential Phase Shift
RHO|[ ]|Correlation Coefficient

# Demos
Test code and data is provided in the `./demo` folder. `test.js` can be used to test any one of the products by commenting/uncommenting the appropriate line in the file. All images will be output as PNG to `./output`. A `test-all.js` is also provided to plot all of the products provided in the `./data/` folder. This test will produce images in multiple sizes to show scaling built-in scaling functionality. Some demo data contains errors. These errors are handled by the [nexrad-level-2-data](https://github.com/netbymatt/nexrad-level-2-data/) and the response to the errors is detailed there

# API

## plot(data, products, options)
Returns an array of objects. The order of elevations in the returned array matches the order of elevations in options.elevations
``` javascript
	[
		{
			elevation: <integer>,
			REF: {
				canvas: <Canvas>,
				palette: <Uint8ClampedArray>
			},
			// ... additional products
		},
	// ... additional elevations
	]
```
The first level key in the returned object represents each requested product.
> Note: Each product may return false if no data was found for the specified elevation and product.

```[canvas](https://www.npmjs.com/package/canvas)``` contains the plotted data and functions for outputtting various image formats.

```palette``` is an array that can be used to create palettized images from the canvas library.

|Paramater|Type|Default|Description|
|---|---|---|---|
data|Level2Radar||Output from [nexrad-level-2-data](https://github.com/netbymatt/nexrad-level-2-data/).
products|Array of strings|All|Individual strings as shown in supported products to specify the products to be plotted.
options.size|integer|3600|1 to 3600. Size of the x and y axis in pixels. The image must be square so only a single integer is needed. See [downsampling](#downsampling)
options.cropTo|integer|3600|1 to 3600. After scaling and downsampling as described above crop the resulting plot to the size specified. Internally, the image is actually drawn at the cropped size to save on processing time.
options.background|string|#000000|Background color of the image. This can be transparent by using #RGBA notation. See [ctx.fillStyle](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle) for more information.
options.lineWidth|integer|2|The raster image is created by drawing several arcs at the locations and colors specified in the data file. When scaling down you may get a better looking image by adjusting this value to something large than the default.
options.palettize|boolean\|object|false|After drawing the image convert the image from RGBA to a palettized image. When true the same palette as the product is used. Additional options are described in [palettizing](#palettizing). This can significantly reduce the size of the resulting image with minimal loss of clarity.
options.elevations|undefined\|integer\|Array of integers|undefined|The specific elevations to plot. If undefined (default) all available elevations will be plotted. If an integer is provided a single elevation will be plotted with all the selected ```products```. If an array of integers are provided each ```products``` in each elevation will be plotted. Note that when a product and elevation combination do not exist the returned object will have false in the missing location. This is common where elevation 1 will have reflectivity data and elevation 2 (altough at the same angle as elevation 1) will contain velocity data.
options.usePreferredWaveforms|boolean|true|Waveform types of 1, 2, 3, 4 and 5 are produced by the radar. Type 1 is typically exclusive to reflectivity, Type 2 is typically exclusive to velocity however it also produces reflectivity data. Types 3, 4 and 5 all produce both velocity and reflectivity. When set to true type 1 waveforms will not plot velocity data, and type 2 waveforms will not plot reflectivity data. If you must see all information set this to false.
options.alpha|boolean|true|Draw on a 32-bit canvas. Passed directly to getContext('2d', {alpha}).
options.imageSmoothingEnabled|boolean|true|Enable image smoothing. Passed directly to ctx.imageSmoothingEnabled.
options.antialias|string|'default'|Enable antialias. Passed directly to ctx.antialias (part of node-canvas)

### Downsampling
A full size plot is 3600 x 3600 pixels. This corresponds to the maximum range of the radar 460km (~250 mi) * maximum resolution 0.25 mi/bin * 2 (east and west side of radar).

options.size < 3600 will internally scale the image to the selected size. The scaling algorithm is specific to radar data and returns the maximum value over the range of bins that are combined due to the scaling factor. This ensures that maximum reflectivity or maximum velocity are preserved during the scaling process. Using an image scaling package is not preferred in this case as the scaling algorithm used my mask important data.

options.size > 3600 is invalid as this would cause data to be interpolated and would not be a true representation of the data returned by the radar. If you need this functionality it's recommended to use an image scaling package such as [jimp](https://www.npmjs.com/package/jimp) or [gm](https://www.npmjs.com/package/gm) on the Canvas returned by plot() which will also be much faster than the drawing methods used for a radar plot.

### Palettizing
>If used with [plotAndData()](#plotanddatafile-options) both the original image and the palettized image will be returned if used with [plot()](#plotfile-options) only the palettized image will be returned.

Plotting what is essentially polar data (raw radar data) to a cartesean coordinate system (raster image) causes some artifacts as the arcs drawn by the raster data do not align exactly with the grid of pixels in the raster image. The plotting algorithm approximates the arc by using colors between the palette specificed color and background color to "partially" shade the pixels that are not fully consumed by the arc.

This process makes use of the RGBA color space with either 3 or 4 bytes per pixel. From the standpoint of representing radar data in an image this is very inefficient use of space as typically 16 or 32 colors (> 1 byte) is necessary to show the data in it's original format. This RGBA image also does not lend itself well to PNG compression which is lossless.

Palettizing introduces a compromise between image size and compresability. After the initial image is drawn the palettizing algorithm can then re-process the RGBA image and force all pixels to be one of the original color values specificed in the product's palette (options.palettize = true, the default). It can also generate an optimized palette that uses a set number of steps between the colors in the palette and the background color with a maximum generated palette size of 256 colors (options.palettize.generate = <steps>). Finally a custom palette can be provided in the form of [r1,g1,b1,r2,g2,b2,...] alpha values will be generated automatically.

A look-up table is created and cached as part of the palettization process speeding up additional calls the the palettizing function. The cache is specific to the product and options provided.

#### Palettization options (options.palettize.\<parameter>)
Parameter|Type|Default|Description
|--|--|--|--|
generate|integer|0|Generate a palette by creating a number of steps between the background color and each color provided the the product data. There is a hard limit of 256 colors in the palette due to the PNG specification. For example a 16-color original palette with generate = 4 would produce a palette of 64 colors (4 versions of each of the original 16 colors).
palette|array|\<from product>|If not provided the palette provided by the palette is used. If use the array should be in the format [r1,g1,b1,a1,r2,g2,b2,a2,...]. The generate option will operate on this array if it is provided. Set generate to 0 to keep the provided palette from being altered.

## writePngToFile(fileName, data)
Returns a Promise which resolves to the written file name.
Writes a PNG file to disk. Provided as a convenience function for production and testing.
|Paramater|Type|Description|
|---|---|---|
fileName|string|A file name or path used by [fs.createWriteStream()](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options).
data|{canvas[palette]}|Typically the output of [plot()](#plotfile-options).\<product type>.

# Notable and breaking changes

## v2.6.0 Notable, Additional canvas configuration options
The options antialias, imageSmoothingEnabled, and alpha were added and passed directly to the canvas context when creating it before plotting. Disabling these options (which were previously defaulted to on) can speed up plotting by about 5% and reduce output image size by up to 10% at a very slight cost of visual appearance.

## v2.5.0 Notable, 300km range now interperted correctly
Prior to this version, if the data had the ```super_res_control.300km``` flag set the resulting image would effectively be "zoomed in by 2x". Upon examing the results of this flag on the plot, reference plots and the ```gate_count``` values it was determined no scaling needed to be performed if this flag was present. Instead, the ```gate_count``` already reflects the additional data the flag indicates. This mainly affects VEL plots and some REF plots at higher elevations, depending on the VCP the radar is using.

## v2.0.0 Breaking, returns an array of objects
Previously, a single elevation would be plotted by the routine. The elevation was selected by ```options.elevation```. ```options.elevation``` has been renamed to ```options.elevations``` and will still take a single integer as an input, but in this configuration an array is still returned. The simplest way to return to the functionality of v1.1.0 is ```plot(data,products,{elevation: <integer>})[0]``` which will return only the first object in the array.

```options.elevations``` defaults to all the elevations in the provided file. This may not be the desired behavior, and will take significantly longer to plot if you do not need all of the data provided. You can query ```data.listElevations()``` to return an array of available elevations. The result can be passed directly to options.elevations or further processed to only select interesting elevations before calling ```plot()```. Additional details of ```options.elevations``` are provided above.

## v1.1.0 Notable, RRLE pre-processing
Testing and monitoring of this package in production showed that drawing each 0.5&deg; or 1.0&deg; arc as part of the plotting process was very time-expensive. Drawing a wider arc when adjacent radials had the same color at this position was significantly faster than drawing the two separate arcs.

Implementing this solution which I am calling Radial Run Length Encoding, as it spans several radials, required significant reworking of the plotting engine and resulted in much more modular code. Four pre-process routines are now run on the radar data before plotting. The first three: Downsample, FilterProduct and IndexProduct were all part of the previous version but have been extracted from the main algorithm and placed into their own modules. After each of these three modules were implemented tests were run to show that the image generated was identical to v1.0.0. The addition of the rrle pre-processing module does change the output image slightly, but these visual changes are in the level of the artifacts that are inevitable due to the polar-to-raster conversion detailed in [Palletizing](#palettizing).

# Acknowledgements
The code for this project is based upon:
- [Unidata](https://github.com/Unidata/thredds/blob/master/cdm/src/main/java/ucar/nc2/iosp/nexrad2/)
- [nexrad-radar-data](https://github.com/bartholomew91/nexrad-radar-data)
- And my own fork of the above [netbymatt/nexrad-level-2-data](https://github.com/netbymatt/nexrad-level-2-data)