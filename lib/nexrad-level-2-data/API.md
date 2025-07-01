## Classes

* [Level2Radar](#Level2Radar)
    * [new Level2Radar(file, [options])](#new_Level2Radar_new)
    * _instance_
        * _Configuration_
            * [.setElevation(elevation)](#Level2Radar+setElevation)
        * _Data_
            * [.getAzimuth([scan])](#Level2Radar+getAzimuth) ⇒ <code>number</code> \| <code>Array.&lt;number&gt;</code>
            * [.getHighresReflectivity([scan])](#Level2Radar+getHighresReflectivity) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresVelocity([scan])](#Level2Radar+getHighresVelocity) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresSpectrum([scan])](#Level2Radar+getHighresSpectrum) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresDiffReflectivity([scan])](#Level2Radar+getHighresDiffReflectivity) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresDiffPhase([scan])](#Level2Radar+getHighresDiffPhase) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresCorrelationCoefficient([scan])](#Level2Radar+getHighresCorrelationCoefficient) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
        * _Metadata_
            * [.header](#Level2Radar+header) : [<code>Header</code>](#Header)
            * [.vcp](#Level2Radar+vcp) : [<code>Vcp</code>](#Vcp)
            * [.hasGaps](#Level2Radar+hasGaps) : <code>boolean</code>
            * [.isTruncated](#Level2Radar+isTruncated) : <code>boolean</code>
            * [.getScans()](#Level2Radar+getScans) ⇒ <code>number</code>
            * [.getHeader([scan])](#Level2Radar+getHeader) ⇒ [<code>MessageHeader</code>](#MessageHeader)
            * [.listElevations()](#Level2Radar+listElevations) ⇒ <code>Array.&lt;number&gt;</code>
    * _static_
        * [.combineData(...data)](#Level2Radar.combineData) ⇒ [<code>Level2Radar</code>](#Level2Radar)
* [parseData](#parseData)
    * [new parseData(file, [options])](#new_parseData_new)
* [RandomAccessFile](#RandomAccessFile)
    * [new RandomAccessFile(file, endian)](#new_RandomAccessFile_new)
    * _Data_
        * [.readString(length)](#RandomAccessFile+readString) ⇒ <code>string</code>
        * [.readFloat()](#RandomAccessFile+readFloat) ⇒ <code>number</code>
        * [.readInt()](#RandomAccessFile+readInt) ⇒ <code>number</code>
        * [.readShort()](#RandomAccessFile+readShort) ⇒ <code>number</code>
        * [.readSignedInt()](#RandomAccessFile+readSignedInt) ⇒ <code>number</code>
        * [.readByte()](#RandomAccessFile+readByte) ⇒ <code>number</code>
        * [.read(length)](#RandomAccessFile+read) ⇒ <code>number</code> \| <code>Array.&lt;number&gt;</code>
    * _Positioning_
        * [.getLength()](#RandomAccessFile+getLength) ⇒ <code>number</code>
        * [.getPos()](#RandomAccessFile+getPos) ⇒ <code>number</code>
        * [.seek(position)](#RandomAccessFile+seek)
        * [.skip(length)](#RandomAccessFile+skip)
* [Level2Record](#Level2Record)
    * [new Level2Record(raf, record, message31Offset, header, [options])](#new_Level2Record_new)

## Typedefs

* [ParserOptions](#ParserOptions) : <code>object</code>
* [ParsedData](#ParsedData) : <code>object</code>
* [HighResData](#HighResData) : <code>object</code>
* [MessageHeader](#MessageHeader) : <code>object</code>
* [Radial](#Radial) : <code>object</code>
* [Volume](#Volume) : <code>object</code>
* [Header](#Header) : <code>object</code>
* [Vcp](#Vcp) : <code>object</code>
* [VcpRecord](#VcpRecord) : <code>object</code>
* [VcpSequencing](#VcpSequencing) : <code>object</code>
* [VcpSupplemental](#VcpSupplemental) : <code>object</code>

<a name="Level2Radar"></a>

## Level2Radar
**Kind**: global class  

* [Level2Radar](#Level2Radar)
    * [new Level2Radar(file, [options])](#new_Level2Radar_new)
    * _instance_
        * _Configuration_
            * [.setElevation(elevation)](#Level2Radar+setElevation)
        * _Data_
            * [.getAzimuth([scan])](#Level2Radar+getAzimuth) ⇒ <code>number</code> \| <code>Array.&lt;number&gt;</code>
            * [.getHighresReflectivity([scan])](#Level2Radar+getHighresReflectivity) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresVelocity([scan])](#Level2Radar+getHighresVelocity) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresSpectrum([scan])](#Level2Radar+getHighresSpectrum) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresDiffReflectivity([scan])](#Level2Radar+getHighresDiffReflectivity) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresDiffPhase([scan])](#Level2Radar+getHighresDiffPhase) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresCorrelationCoefficient([scan])](#Level2Radar+getHighresCorrelationCoefficient) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
        * _Metadata_
            * [.header](#Level2Radar+header) : [<code>Header</code>](#Header)
            * [.vcp](#Level2Radar+vcp) : [<code>Vcp</code>](#Vcp)
            * [.hasGaps](#Level2Radar+hasGaps) : <code>boolean</code>
            * [.isTruncated](#Level2Radar+isTruncated) : <code>boolean</code>
            * [.getScans()](#Level2Radar+getScans) ⇒ <code>number</code>
            * [.getHeader([scan])](#Level2Radar+getHeader) ⇒ [<code>MessageHeader</code>](#MessageHeader)
            * [.listElevations()](#Level2Radar+listElevations) ⇒ <code>Array.&lt;number&gt;</code>
    * _static_
        * [.combineData(...data)](#Level2Radar.combineData) ⇒ [<code>Level2Radar</code>](#Level2Radar)

<a name="new_Level2Radar_new"></a>

### new Level2Radar(file, [options])
Parses a Nexrad Level 2 Data archive or chunk. Provide `rawData` as a `Buffer`. Returns an object formatted per the [ICD FOR RDA/RPG - Build RDA 20.0/RPG 20.0 (PDF)](https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620002U.pdf), or as close as can reasonably be represented in a javascript object. Additional data accessors are provided in the returned object to pull out typical data in a format ready for processing.Radar data is accessed through the get* methods


| Param | Type | Description |
| --- | --- | --- |
| file | <code>Buffer</code> \| [<code>Level2Radar</code>](#Level2Radar) | Buffer with Nexrad Level 2 data. Alternatively a Level2Radar object, typically used internally when combining data. |
| [options] | [<code>ParserOptions</code>](#ParserOptions) | Parser options |

<a name="Level2Radar+setElevation"></a>

### level2Radar.setElevation(elevation)
Sets the elevation in use for get* methods

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Configuration  

| Param | Type | Description |
| --- | --- | --- |
| elevation | <code>number</code> | Selected elevation number |

<a name="Level2Radar+getAzimuth"></a>

### level2Radar.getAzimuth([scan]) ⇒ <code>number</code> \| <code>Array.&lt;number&gt;</code>
Returns an single azimuth value or array of azimuth values for the current elevation and scan (or all scans if not provided).The order of azimuths in the returned array matches the order of the data in other get* functions.

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: <code>number</code> \| <code>Array.&lt;number&gt;</code> - Azimuth angle  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan |

<a name="Level2Radar+getHighresReflectivity"></a>

### level2Radar.getHighresReflectivity([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar reflectivity data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res reflectivity data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan or null for all scans in elevation |

<a name="Level2Radar+getHighresVelocity"></a>

### level2Radar.getHighresVelocity([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar velocity data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res velocity data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan, or null for all scans in this elevation |

<a name="Level2Radar+getHighresSpectrum"></a>

### level2Radar.getHighresSpectrum([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar spectrum data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res spectrum data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan, or null for all scans in this elevation |

<a name="Level2Radar+getHighresDiffReflectivity"></a>

### level2Radar.getHighresDiffReflectivity([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar differential reflectivity data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res differential reflectivity data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan or null for all scans in elevation |

<a name="Level2Radar+getHighresDiffPhase"></a>

### level2Radar.getHighresDiffPhase([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar differential phase data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res differential phase data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan or null for all scans in elevation |

<a name="Level2Radar+getHighresCorrelationCoefficient"></a>

### level2Radar.getHighresCorrelationCoefficient([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar correlation coefficient data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res correlation coefficient data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan or null for all scans in elevation |

<a name="Level2Radar+header"></a>

### level2Radar.header : [<code>Header</code>](#Header)
**Kind**: instance property of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Metadata  
<a name="Level2Radar+vcp"></a>

### level2Radar.vcp : [<code>Vcp</code>](#Vcp)
**Kind**: instance property of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Metadata  
<a name="Level2Radar+hasGaps"></a>

### level2Radar.hasGaps : <code>boolean</code>
Gaps were found in the source data

**Kind**: instance property of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Metadata  
<a name="Level2Radar+isTruncated"></a>

### level2Radar.isTruncated : <code>boolean</code>
Source data was truncated

**Kind**: instance property of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Metadata  
<a name="Level2Radar+getScans"></a>

### level2Radar.getScans() ⇒ <code>number</code>
Return the number of scans in the current elevation

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Metadata  
<a name="Level2Radar+getHeader"></a>

### level2Radar.getHeader([scan]) ⇒ [<code>MessageHeader</code>](#MessageHeader)
Return message_header information for all scans or a specific scan for the selected elevation

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Metadata  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan, omit to return all scans for this elevation |

<a name="Level2Radar+listElevations"></a>

### level2Radar.listElevations() ⇒ <code>Array.&lt;number&gt;</code>
List all available elevations

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Metadata  
<a name="Level2Radar.combineData"></a>

### Level2Radar.combineData(...data) ⇒ [<code>Level2Radar</code>](#Level2Radar)
Combines the data returned by multiple runs of the Level2Data constructor. This is typically used in "chunks" mode to combine all azimuths from one revolution into a single data set. data can be provided as an array of Level2Radar objects, individual Level2Data parameters or any combination thereof.The combine function blindly combines data and the right-most argument will overwrite any previously provided data. Individual azimuths located in Level2Radar.data[] will be appended. It is up to the calling routine to properly manage the parsing of related chunks and send it in to this routine.

**Kind**: static method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>Level2Radar</code>](#Level2Radar) - Combined data  

| Param | Type | Description |
| --- | --- | --- |
| ...data | [<code>Level2Radar</code>](#Level2Radar) | Data to combine |

<a name="parseData"></a>

## parseData
**Kind**: global class  
<a name="new_parseData_new"></a>

### new parseData(file, [options])
Internal function. Parses a Nexrad Level 2 Data archive or chunk. Provide `rawData` as a `Buffer`.

**Returns**: <code>object</code> - Intermediate data for use with Level2Radar  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| file | <code>Buffer</code> |  | Buffer with Nexrad Level 2 data. Alternatively a Level2Radar object, typically used internally when combining data. |
| [options] | <code>object</code> |  | Parser options |
| [options.logger] | <code>object</code> \| <code>boolean</code> | <code>console</code> | By default error and information messages will be written to the console. These can be suppressed by passing false, or a custom logger can be provided. A custom logger must provide the log() and error() function. |

<a name="RandomAccessFile"></a>

## RandomAccessFile
**Kind**: global class  

* [RandomAccessFile](#RandomAccessFile)
    * [new RandomAccessFile(file, endian)](#new_RandomAccessFile_new)
    * _Data_
        * [.readString(length)](#RandomAccessFile+readString) ⇒ <code>string</code>
        * [.readFloat()](#RandomAccessFile+readFloat) ⇒ <code>number</code>
        * [.readInt()](#RandomAccessFile+readInt) ⇒ <code>number</code>
        * [.readShort()](#RandomAccessFile+readShort) ⇒ <code>number</code>
        * [.readSignedInt()](#RandomAccessFile+readSignedInt) ⇒ <code>number</code>
        * [.readByte()](#RandomAccessFile+readByte) ⇒ <code>number</code>
        * [.read(length)](#RandomAccessFile+read) ⇒ <code>number</code> \| <code>Array.&lt;number&gt;</code>
    * _Positioning_
        * [.getLength()](#RandomAccessFile+getLength) ⇒ <code>number</code>
        * [.getPos()](#RandomAccessFile+getPos) ⇒ <code>number</code>
        * [.seek(position)](#RandomAccessFile+seek)
        * [.skip(length)](#RandomAccessFile+skip)

<a name="new_RandomAccessFile_new"></a>

### new RandomAccessFile(file, endian)
Store a buffer or string and add functionality for random accessUnless otherwise noted all read functions advance the file's pointer by the length of the data read


| Param | Type | Description |
| --- | --- | --- |
| file | <code>Buffer</code> \| <code>string</code> | A file as a string or Buffer to load for random access |
| endian | <code>number</code> | Endianess of the file constants BIG_ENDIAN and LITTLE_ENDIAN are provided |

<a name="RandomAccessFile+readString"></a>

### randomAccessFile.readString(length) ⇒ <code>string</code>
Read a string of a specificed length from the buffer

**Kind**: instance method of [<code>RandomAccessFile</code>](#RandomAccessFile)  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| length | <code>number</code> | Length of string to read |

<a name="RandomAccessFile+readFloat"></a>

### randomAccessFile.readFloat() ⇒ <code>number</code>
Read a float from the buffer

**Kind**: instance method of [<code>RandomAccessFile</code>](#RandomAccessFile)  
**Category**: Data  
<a name="RandomAccessFile+readInt"></a>

### randomAccessFile.readInt() ⇒ <code>number</code>
Read a 4-byte unsigned integer from the buffer

**Kind**: instance method of [<code>RandomAccessFile</code>](#RandomAccessFile)  
**Category**: Data  
<a name="RandomAccessFile+readShort"></a>

### randomAccessFile.readShort() ⇒ <code>number</code>
Read a 2-byte unsigned integer from the buffer

**Kind**: instance method of [<code>RandomAccessFile</code>](#RandomAccessFile)  
**Category**: Data  
<a name="RandomAccessFile+readSignedInt"></a>

### randomAccessFile.readSignedInt() ⇒ <code>number</code>
Read a 2-byte signed integer from the buffer

**Kind**: instance method of [<code>RandomAccessFile</code>](#RandomAccessFile)  
**Category**: Data  
<a name="RandomAccessFile+readByte"></a>

### randomAccessFile.readByte() ⇒ <code>number</code>
Read a single byte from the buffer

**Kind**: instance method of [<code>RandomAccessFile</code>](#RandomAccessFile)  
**Category**: Data  
<a name="RandomAccessFile+read"></a>

### randomAccessFile.read(length) ⇒ <code>number</code> \| <code>Array.&lt;number&gt;</code>
Read a set number of bytes from the buffer

**Kind**: instance method of [<code>RandomAccessFile</code>](#RandomAccessFile)  
**Returns**: <code>number</code> \| <code>Array.&lt;number&gt;</code> - number if length = 1, otherwise number[]  
**Category**: Data  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| length | <code>number</code> | <code>1</code> | Number of bytes to read |

<a name="RandomAccessFile+getLength"></a>

### randomAccessFile.getLength() ⇒ <code>number</code>
Get buffer length

**Kind**: instance method of [<code>RandomAccessFile</code>](#RandomAccessFile)  
**Category**: Positioning  
<a name="RandomAccessFile+getPos"></a>

### randomAccessFile.getPos() ⇒ <code>number</code>
Get current position in the file

**Kind**: instance method of [<code>RandomAccessFile</code>](#RandomAccessFile)  
**Category**: Positioning  
<a name="RandomAccessFile+seek"></a>

### randomAccessFile.seek(position)
Seek to a provided buffer offset

**Kind**: instance method of [<code>RandomAccessFile</code>](#RandomAccessFile)  
**Category**: Positioning  

| Param | Type | Description |
| --- | --- | --- |
| position | <code>number</code> | Byte offset |

<a name="RandomAccessFile+skip"></a>

### randomAccessFile.skip(length)
Advance the pointer forward a set number of bytes

**Kind**: instance method of [<code>RandomAccessFile</code>](#RandomAccessFile)  
**Category**: Positioning  

| Param | Type | Description |
| --- | --- | --- |
| length | <code>number</code> | Number of bytes to skip |

<a name="Level2Record"></a>

## Level2Record
**Kind**: global class  
<a name="new_Level2Record_new"></a>

### new Level2Record(raf, record, message31Offset, header, [options])
Read a single record from the radar data

**Returns**: <code>object</code> - Variable data based on message types present in record  

| Param | Type | Description |
| --- | --- | --- |
| raf | [<code>RandomAccessFile</code>](#RandomAccessFile) | Random access file |
| record | <code>number</code> | Record number |
| message31Offset | <code>number</code> | Additional record offset caused by message 31 size |
| header | [<code>Header</code>](#Header) | Original parsed file header |
| [options] | [<code>ParserOptions</code>](#ParserOptions) | Parser options |

<a name="ParserOptions"></a>

## ParserOptions : <code>object</code>
parser options

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [logger] | <code>object</code> \| <code>boolean</code> | <code>console</code> | By default error and information messages will be written to the console. These can be suppressed by passing false, or a custom logger can be provided. A custom logger must provide the log() and error() functions. |

<a name="ParsedData"></a>

## ParsedData : <code>object</code>
Intermediate parsed radar data, further processed by Level2Radar

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Grouped and sorted data |
| header | [<code>Header</code>](#Header) |  |
| vcp | [<code>Vcp</code>](#Vcp) |  |
| isTruncated | <code>boolean</code> |  |
| hasGaps | <code>boolean</code> |  |

<a name="HighResData"></a>

## HighResData : <code>object</code>
See NOAA documentation for detailed meanings of these values.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| gate_count | <code>number</code> |  |
| gate_size | <code>number</code> |  |
| first_gate | <code>number</code> |  |
| rf_threshold | <code>number</code> |  |
| snr_threshold | <code>number</code> |  |
| scale | <code>number</code> |  |
| offset | <code>number</code> |  |
| block_type | <code>string</code> | 'D' |
| control_flags | <code>number</code> |  |
| data_size | <code>number</code> |  |
| name | <code>string</code> | 'REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO' |
| spare | <code>Array.&lt;Buffer&gt;</code> | Spare data per the documentation |
| moment_data | <code>Array.&lt;number&gt;</code> | Scaled data |

<a name="MessageHeader"></a>

## MessageHeader : <code>object</code>
See NOAA documentation for detailed meanings of these values.

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| aim | <code>number</code> | 
| ars | <code>number</code> | 
| compress_idx | <code>number</code> | 
| cut | <code>number</code> | 
| dcount | <code>number</code> | 
| elevation_angle | <code>number</code> | 
| elevation_number | <code>number</code> | 
| id | <code>string</code> | 
| julian_date | <code>number</code> | 
| mseconds | <code>number</code> | 
| [phi] | [<code>HighResData</code>](#HighResData) | 
| radial | [<code>Radial</code>](#Radial) | 
| radial_length | <code>number</code> | 
| radial_number | <code>number</code> | 
| [reflect] | [<code>HighResData</code>](#HighResData) | 
| [rho] | [<code>HighResData</code>](#HighResData) | 
| rs | <code>number</code> | 
| rsbs | <code>number</code> | 
| [spectrum] | [<code>HighResData</code>](#HighResData) | 
| sp | <code>number</code> | 
| volume | [<code>Volume</code>](#Volume) | 
| [velocity] | [<code>HighResData</code>](#HighResData) | 
| [zdr] | [<code>HighResData</code>](#HighResData) | 

<a name="Radial"></a>

## Radial : <code>object</code>
See NOAA documentation for detailed meanings of these values.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| block_type | <code>string</code> | 'R' |
| horizontal_calibration | <code>number</code> |  |
| horizontal_noise_level | <code>number</code> |  |
| name | <code>string</code> | 'RAD' |
| nyquist_velocity | <code>number</code> |  |
| radial_flags | <code>number</code> |  |
| size | <code>number</code> |  |
| unambiguous_range | <code>number</code> |  |
| vertical_calibration | <code>number</code> |  |
| vertical_noise_level | <code>number</code> |  |

<a name="Volume"></a>

## Volume : <code>object</code>
See NOAA documentation for detailed meanings of these values.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| block_type | <code>string</code> | 'R' |
| calibration | <code>number</code> |  |
| differential_phase | <code>number</code> |  |
| differential_reflectivity | <code>number</code> |  |
| elevation | <code>number</code> |  |
| feedhorn_height | <code>number</code> |  |
| latitude | <code>number</code> |  |
| longitude | <code>number</code> |  |
| name | <code>string</code> | 'VOL' |
| processing_status | <code>number</code> |  |
| size | <code>number</code> |  |
| tx_horizontal | <code>number</code> |  |
| tx_vertical | <code>number</code> |  |
| version_major | <code>number</code> |  |
| version_minor | <code>number</code> |  |
| volume_coverage_pattern | <code>number</code> |  |
| zdr_bias_estimate | <code>number</code> |  |

<a name="Header"></a>

## Header : <code>object</code>
File header details
See NOAA documentation for detailed meanings of these values.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ICAO | <code>string</code> | Radar site identifier |
| milliseconds | <code>number</code> | Milliseconds since midnight |
| modified_julian_date | <code>number</code> | Days since Dec 31, 1969 |
| raw | <code>Buffer</code> | Raw header from file |
| version | <code>string</code> | Version number |

<a name="Vcp"></a>

## Vcp : <code>object</code>
Volume coverage pattern
See NOAA documentation for detailed meanings of these values.

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| channel | <code>number</code> | 
| id_sequence | <code>number</code> | 
| message_julian_date | <code>number</code> | 
| message_mseconds | <code>number</code> | 
| message_size | <code>number</code> | 
| message_type | <code>number</code> | 
| record | [<code>VcpRecord</code>](#VcpRecord) | 
| segment_count | <code>number</code> | 
| segment_number | <code>number</code> | 

<a name="VcpRecord"></a>

## VcpRecord : <code>object</code>
See NOAA documentation for detailed meanings of these values.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| clutter_number | <code>number</code> |  |
| elevations | <code>Array.&lt;VcpElevations&gt;</code> |  |
| message_size | <code>number</code> |  |
| num_elevations | <code>number</code> |  |
| pattern_number | <code>number</code> |  |
| pattern_type | <code>number</code> |  |
| pulse_width | <code>string</code> |  |
| reserved1 | <code>number</code> | Reserved per NOAA documentation |
| reserved2 | <code>number</code> | Reserved per NOAA documentation |
| vcp_sequencing | [<code>VcpSequencing</code>](#VcpSequencing) |  |
| vcp_supplemental | [<code>VcpSupplemental</code>](#VcpSupplemental) |  |
| velocity_resolution | <code>number</code> |  |
| version | <code>number</code> |  |

<a name="VcpSequencing"></a>

## VcpSequencing : <code>object</code>
See NOAA documentation for detailed meanings of these values.

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| elevations | <code>number</code> | 
| max_sails_cuts | <code>number</code> | 
| sequence_active | <code>number</code> | 
| truncated_vcp | <code>number</code> | 

<a name="VcpSupplemental"></a>

## VcpSupplemental : <code>object</code>
See NOAA documentation for detailed meanings of these values.

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| base_tilt_vcp | <code>boolean</code> | 
| mpda_vcp | <code>boolean</code> | 
| mrle_vcp | <code>boolean</code> | 
| number_base_tilts | <code>number</code> | 
| number_mrle_cuts | <code>number</code> | 
| number_sails_cuts | <code>number</code> | 
| sails_vcp | <code>number</code> | 

