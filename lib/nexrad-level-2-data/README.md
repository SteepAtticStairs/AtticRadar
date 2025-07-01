# nexrad-level-2-data

> A javascript implementation for decoding Nexrad Level II radar archive files.

You can find more information on how radar data is encoded at [NOAA](https://www.roc.noaa.gov/WSR88D/BuildInfo/Files.aspx) mainly in the document [ICD FOR RDA/RPG - Build RDA 20.0/RPG 20.0 (PDF)](https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620002U.pdf)

## Contents
1. [Changes in v2.0.0](#changes-in-v200)
1. [Install](#install)
1. [Usage](#usage)
1. [API](#api)
1. [Testing](#testing)
1. [Error Recovery and handling](#error-recovery-and-handling)
1. [Supported Messages](#supported-messages)
1. [Acknowledgements](#acknowledgements)

## Changes in v2.0.0

v2.0.0 is a major overhaul of the parsing engine and has several breaking changes. See [UPGRADE.md](UPGRADE.md) for detailed breaking changes.

- Allow for processing of "chunks" in addition to entire volume scan archives.
	- Chunks (real time data) is provided by Unidata in the s3 bucket `s3://unidata-nexrad-level2-chunks/`
	- Full archives are provided by Unidata in the s3 bucket `s3://noaa-nexrad-level2`
	- When processing a chunk all data may not be populated in the resulting object. This is deatiled in [UPGRADE.md](UPGRADE.md)
- Improve error reporting by throwing when data is not present or invalid elevations or scans are accessed.
- Unify the data accessor functions (breaking change)
- Follow NOAA convention of the lowest elevation being 1, and properly sort elevations above 1 into a sparse array (breaking change)
- Provide a mechanism for consolidating data read from several chunks.

## Install

``` bash
$ npm i nexrad-level-2-data
```

## Usage
``` javascript
const { Level2Radar } = require('nexrad-level-2-data')
const fs = require('fs');
const file_to_load = "./data/KTLX20130420_205120_V06" // The radar archive file to load

const rawData = fs.readFileSync(file_to_load);

new Level2Radar(rawData).then(radar => {
    console.log(radar.getHighresReflectivity())
})
```

## API

Complete [API documentation](API.md)

## Testing
A formal testing suite is not provided. Several `test-*.js` are provided with matching data in the `./data` folder. These can be run individually as shown below.
``` bash
node test.js
node test-chunks.js
node test-error.js
```
The output of each test script is sent to the console.

## Error recovery and handling
This library will throw on many errors including:
- Buffer not provided for parsing
- Calling a data accessor on non-existant data such as invalid elevations or azimuths
- A successfully parsed file that did not contain any data
- A cursory check on data validity is done by checking the ICAO identifier of each record in the file before further parsing occurs.
- Basic file length checks against offsets and block lengths listed in the file.
The Nexrad archives and chunks do contain errors when read from the Unidata archives in s3 buckets `s3://noaa-nexrad-level2` and `s3://unidata-nexrad-level2-chunks/`. A very basic attempt is made to detect these errors, discard the affected record and find the begining of the next record. This does not always succeeded. The following are the possible outcomes:
- Successful error detection and skipping to a known good block.
	- Logs to console `Invlaid record id` or `Invalid block type`
	- Returns as much data that could be parsed with some gaps in data. The actual gaps are not logged. A manual scan of the `Level2Radar.data[] arrays` looking at Azimuths would need to be performed to find the gaps in data. However any program calling this routine should be considering the `Level2Radar.data[].azimuth` data for further processing and thus should be unaffected.
	- `Level2Data.hasGaps` is set to `true`
- Error detection with no skipping to a known good block
	- Logs to console `Invalid record id` or `Invalid block id`
	- Later logs to console `Unable to recover message`
	- Returns as much data that could be parsed.
	- `Level2Data.isTruncated is set to `true`
The script `test-error.js` can be run to test some of this functionality. It parses data in `./data/messagesizeerror`.

## Supported Messages
Nexrad data is stored as message types. This package currently processes the following messages.
|Message|Title|Description|
|---|---|---|
|1|Digital Radar Data|Reflectivity and velocity data. Replaced by message 31 in 2008 which supports a higher resolution.|
|2|RDA Status|
|5|Volume Coverage Pattern|Overview of the scanning paramaters|
|7|Volume Coverage Pattern|Overview of the scanning paramaters|
|31|Digital Radar Data Generic Format|Reflectivity and velocity data

## Acknowledgements
This work is based on the project of [Unidata](https://github.com/Unidata/thredds/blob/master/cdm/src/main/java/ucar/nc2/iosp/nexrad2/)
and [nexrad-radar-data](https://github.com/bartholomew91/nexrad-radar-data)