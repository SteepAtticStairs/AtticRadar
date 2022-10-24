# nexrad-level-3-data

To test, clone the `NexradJS` repo, `npm install`, and run
```
cd nexrad-level-3-data
browserify -t brfs test.js -o bundle.js
```

A javascript implementation for decoding Nexrad Level III radar files.

You can find more information on how radar data is encoded at [NOAA](https://www.roc.noaa.gov/WSR88D/BuildInfo/Files.aspx). The work in this project is based mainly on the document [2620001 ICD FOR THE RPG TO CLASS 1 USER - Build 19.0](https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620001Y.pdf).

## Contents
- [nexrad-level-3-data](#nexrad-level-3-data)
	- [Contents](#contents)
	- [Install](#install)
	- [Usage](#usage)
	- [Examples](#examples)
	- [Testing](#testing)
	- [API](#api)
		- [file](#file)
		- [options.logger](#optionslogger)
	- [Background Information](#background-information)
		- [Level 2 Data](#level-2-data)
		- [Level 3 Data](#level-3-data)
	- [Work In Progress](#work-in-progress)
		- [Available Products](#available-products)
		- [Supported Packet Types](#supported-packet-types)
	- [A note about source data completeness](#a-note-about-source-data-completeness)
	- [Possible Issues](#possible-issues)
	- [ToDo](#todo)
	- [Acknowledgements](#acknowledgements)

## Install

``` bash
$ npm install nexrad-level-3-data
```

## Usage
Usage is straight forward, provide a string or buffer containing any of the [available products](#available-products).
``` javascript
const fs = require('fs');
const parser = require('nexrad-level-3-data');

const file = fs.readFileSync('./data/LOT_N0H_2021_01_31_11_06_30');
const level3Data = parser(file);

console.log(level3Data);
```

## Examples
Data and corresponding output are provided for quick and easy testing and experimentation. Please see the ```./data``` and ```./output``` folders.

An example of plotting data produced from this library can be found in [nexrad-level-3-plot](https://github.com/netbymatt/nexrad-level-3-plot)

## Testing
A test script is provided and will generate ```.json``` output from all of the files in the ```./data``` and ```./data-error``` folder.
```
npm test
```
A successful test will generate several ```.json``` files in the ```./output``` folder. Errors will be logged to the console for the data which has intentional errors, but the data that can be parsed will still be returned from each file.

## API

The parser will read files as either a string or a buffer. Streams are not supported. The parser will return an object representing the data as defined in https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620001Y.pdf

In some situations additional data is provided in the productDescription property including a friendly name for the type of data or product legends to aid in decoding the data. Values are automatically parsed as integers, floats and strings as defined in the specification.

The parser makes some rudimentary checks to confirm data is valid. These checks include:
- Testing for the correct value for known separators and other fixed values in the specification.
- Testing offsets for locations outside of the file provided

The parser will also return rich error where possible indicating that a specific product or packet type is not supported.

```javascript
parser(file, {
	// options shown as defaults
	logger: console,
})
```

### file
File can be a buffer or string containing the data from one of the [available products](#available-products).

### options.logger
By default all messages are logged to the console. Messages can be surpressed by passing ``false``. A custom logger such as winston or pino can be provided. Any logger provided must provide the ``log()``, ``warn()`` and ``error()`` functions.

## Background Information
Nexrad radar sites provide data in two formats: Level 2 and Level 3. Level 1 is used internally by the system and converted to Level 2 which is made available to end users. These products are detailed at https://www.ncdc.noaa.gov/data-access/radar-data/nexrad-products

### Level 2 Data
Level 2 data can be considered raw data from the radar and provides the "Reflectivity" products that you're used to seeing on web sites and the local news. It also provides velocity data and several more advanced data outputs.

### Level 3 Data
Level 3 data combines Level 2 data to provide additional information about the precipitation and air around the radar site. Some easier to understand forms of this data include:

- Precipitation type, known as the Hydrometeor classification (Products N0H, N1H, N2H, N3H, packet code 165)
- Various precipitation totals over 1-hour, 3-hour and storm duration. (Products N1P, N3P, NTP, OHA, DAA, PTA, DTA, packet codes 78, 79, 80, 169, 170, 171, 172)
- Storm relative velocity (N0S, N1S, N2S, N3S packet code 56)

Level 3 data is available in real-time through the AWS S3 bucket s3://unidata-nexrad-level3/

Additional documentation on the AWS bucket is available at https://registry.opendata.aws/noaa-nexrad/

The file naming convention is: SSS_PPP_YYYY_MM_DD_HH_MM_SS
| Code | Meaning |
|---|---|
| SSS | Radar site ICAO without leading K ([List](https://www.roc.noaa.gov/WSR88D/Maps.aspx)) |
| PPP | Product code [List](https://www.ncdc.noaa.gov/data-access/radar-data/nexrad-products)|
| YYYY | 4-digit year |
| MM | 2-digit month |
| DD | 2-digit day |
| HH | 2-digit, 24-hour hour |
| MM | 2-digit minute |
| SS | 2-digit seconds |

## Work In Progress
I've developed parsing algorithms for that the products that I needed most for my own use. I'm open to requests or pull requests that add additional parsing algorithms. Available products are listed below.
### Available Products
|ID|Product Code(s)|Description|
|---|---|---|
|56|N0S, N1S, N2S, N3S|Storm relative velocity|
|58|NST|Storm Tracking Information|
|59|NHI|Hail Index|
|61|NTV|Tornadic Vortex Signature|
|62|NSS|Storm Structure|
|78|N1P|One-hour precipitation|
|80|NTP|Storm Total Rainfall Accumulation|
|94|NXQ, ...|Digital Base Reflectivity|
|141|NMD|Mesocyclone|
|165|N0H, N1H, N2H, N3H|Hydrometeor Classification
|170|DAA|Digital One Hour Accumulation
|172|DTA|Storm Total Precipitation
|177|HHC|Hybrid Hydrometeor Classification
### Supported Packet Types
|Code|Description|
|---|---|
|0x0001|Text and Special Symbol Packets|
|0x0002|Text and Special Symbol Packets|
|0x0006|Linked Vector Packet|
|0x0008|Unlinked Vector Packet|
|0x000F|Special Graphic Symbol Packet|
|0x0010|Digital Radial Data Array Packet|
|0x0012|Tornado Vortex Signature|
|0x0013|Special Graphic Symbol Packet|
|0x0015|Special Graphic Symbol Packet|
|0x0016|Cell Trend Data Packet|
|0x0017|Special Graphic Symbol Packet|
|0x0018|Special Graphic Symbol Packet|
|0x0019|Special Graphic Symbol Packet|
|0x0020|Special Graphic Symbol Packet|
|0xAF1F|Radial Data Packet (16 Data Levels)|

## A note about source data completeness
It has been observed many times that the source data is occasionally incomplete. Because the data is made up of a header containing pointers to other parts of the file. Any individual block may be corrupt, but this code will continue to try the additional pointers. Errors like this are sent to console.warn()

## Possible Issues
- In production it has been found that some NSS data includes symbology IDs other than 1 which is the only one that appears in the documentation. I've examined these other responses and have found these to be structured text. This text is returned as symbology.pages, but is technically undocumented per the specification above.
- In production NSS data that is truncated has been found. Other cases of truncated data may also exist. The parser is designed to catch these errors, log them to the console and they do any additional processing that may be necessary. The recommended practice is to test that your desired data structure exists in the returned object before doing any further processing with it.

## ToDo
* Add support for additional radial products
* Add support for raster products
+ Categorize messages generated by node, such as reading past the end of the buffer as errors, and log them as errors.

## Acknowledgements
The code for this project is based upon:
- [Unidata](https://github.com/Unidata/thredds/blob/master/cdm/src/main/java/ucar/nc2/iosp/nexrad2/)
- [nexrad-radar-data](https://github.com/bartholomew91/nexrad-radar-data)
- And my own fork of the above [netbymatt/nexrad-radar-data](https://github.com/netbymatt/nexrad-radar-data)