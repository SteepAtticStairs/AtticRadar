There are several breaking changes in 2.0.0.

# Unified data accessors
The following functions have all been modified to provide a unified set of paramater signatures:
- getHighresReflectivity
- getHeader
- getHighresVelocity
- getHighresSpectrum
- getHighresDiffReflectivity
- getHighresDiffPhase
- getHighresCorrelationCoefficient
- getAzimuth
The signature for these data accessors is now
```
getHighresReflectivity([scan])
```
Scan is an optional parameter. If provided a specific scan index is returned, if it is not provided an array of data from all available scans is returned.

## Removal of setScan(<int>)
Because all of the above functions can now be called with a specific scan the `setScan()` function has been removed. The alias `setSweep()` has also been removed.

# Elevation indices
Elevation indices used with `Level2Data.setElevation(<int>)` is now 1-based to follow the NOAA definition. The elevation array is sparse. A list of all available elevations is available from `Level2Data.listElevations()`. When first parsing the data the elevation is set to 1 by default, which may not contain data when processing chunks. `vcp.record.elevations` now matches the 1-based sparse array as well.

# Empty data structures
When processing chunks some data that is typically available in the first chunk may not be present. Specifically, you'll see one or more of the following empty data structures.
```
{
	header: {},	// empty when chunk > 1
	vcp: {},		// empty when chunk > 1
	data: [],		// empty when chunk = 1
}
```
The preferred method to use and parse this data is the nullish coalescing operator and related operators. With an empty header use the following code examples.
```
const ICAO = radar.header.ICAO ?? ''; // ICAO = '' (empty string)
const ICAO = radar.header?.ICAO; // ICAO = undefined;
```