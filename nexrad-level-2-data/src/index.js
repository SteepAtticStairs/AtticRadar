const parseData = require('./parsedata');
const combineData = require('./combinedata');

/**
 * @typedef {object} ParserOptions parser options
 * @property {(object | boolean)} [logger=console] By default error and information messages will be written to the console. These can be suppressed by passing false, or a custom logger can be provided. A custom logger must provide the log() and error() functions.
 */

/*
*
* Last commit before redoing with callbacks:
* https://github.com/SteepAtticStairs/NexradJS/tree/a7814678d0b415f415c4054dc313c12378fb51e7/nexrad-level-2-data
*
*/

class Level2Radar {
	/**
	 * Parses a Nexrad Level 2 Data archive or chunk. Provide `rawData` as a `Buffer`. Returns an object formatted per the [ICD FOR RDA/RPG - Build RDA 20.0/RPG 20.0 (PDF)](https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620002U.pdf), or as close as can reasonably be represented in a javascript object. Additional data accessors are provided in the returned object to pull out typical data in a format ready for processing.
	 * Radar data is accessed through the get* methods
	 *
	 * @param {Buffer|Level2Radar} file Buffer with Nexrad Level 2 data. Alternatively a Level2Radar object, typically used internally when combining data.
	 * @param {ParserOptions} [options] Parser options
	 */

	constructor(file, callback, options) {
		// combine options with defaults
		this.elevation = 1;	// 1 based per NOAA documentation
		// default mode, parse file from buffer
		if (file instanceof Buffer) {
		// options and defaults
			this.options = combineOptions(options);
			var thisObj = this;
			// const {
			// 	data, header, vcp, hasGaps, isTruncated,
			// } = parseData(file, this.options);
			parseData(file, this.options, function(data, header, vcp, hasGaps, isTruncated) {
				thisObj.data = data;

				/**
				 * @type {Header}
				 * @category Metadata
				 */
				thisObj.header = header;

				/**
				 * @type {Vcp}
				 * @category Metadata
				 */
				thisObj.vcp = vcp;

				/**
				 * Gaps were found in the source data
				 *
				 * @type {boolean}
				 * @category Metadata
				 */

				thisObj.hasGaps = hasGaps;

				/**
				 * Source data was truncated
				 *
				 * @type {boolean}
				 * @category Metadata
				 */
				thisObj.isTruncated = isTruncated;

				callback(thisObj);
			})
		} else if (typeof file === 'object' && (file.data && file.header && file.vcp)) {
		// alternative mode data is fed in as a pre-formatted object as the result of the combine static function
			this.data = file.data;
			this.elevation = file.elevation;
			this.header = file.header;
			this.options = file.options;
			this.vcp = file.vcp;
			this.hasGaps = file.hasGaps;
			this.isTruncated = file.isTruncated;
		} else {
			throw new Error('Unknown data provided');
		}
	}

	/**
	 * Sets the elevation in use for get* methods
	 *
	 * @param {number} elevation Selected elevation number
	 * @category Configuration
	 */
	setElevation(elevation) {
		this.elevation = elevation;
	}

	/**
	 * Returns an single azimuth value or array of azimuth values for the current elevation and scan (or all scans if not provided).
	 * The order of azimuths in the returned array matches the order of the data in other get* functions.
	 *
	 * @param {number} [scan] Selected scan
	 * @category Data
	 * @returns {number|number[]} Azimuth angle
	 */
	getAzimuth(scan) {
		// error checking
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getAzimuth invalid elevation selected: ${this.elevation}`);

		if (scan !== undefined) {
			this._checkData();
			if (this?.data?.[this.elevation] === undefined) throw new Error(`getAzimuth invalid elevation selected: ${this.elevation}`);
			if (this?.data?.[this.elevation]?.[scan] === undefined) throw new Error(`getAzimuth invalid scan selected: ${scan}`);
			if (this?.data?.[this.elevation]?.[scan]?.record?.azimuth === undefined) throw new Error(`getAzimuth no data for elevation: ${this.elevation}, scan: ${scan}`);

			// return data
			return this.data[this.elevation][scan].record.azimuth;
		}
		return this.data[this.elevation].map((i) => i.record.azimuth);
	}

	/**
	 * Return the number of scans in the current elevation
	 *
	 * @category Metadata
	 * @returns {number}
	 */
	getScans() {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getScans no data for elevation: ${this.elevation}`);
		return this.data[this.elevation].length;
	}

	/**
	 * Return message_header information for all scans or a specific scan for the selected elevation
	 *
	 * @category Metadata
	 * @param {number} [scan] Selected scan, omit to return all scans for this elevation
	 * @returns {MessageHeader}
	 */
	getHeader(scan) {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHeader invalid elevation selected: ${this.elevation}`);

		if (scan !== undefined) {
			if (this?.data?.[this.elevation]?.[scan] === undefined) throw new Error(`getHeader invalid scan selected: ${scan}`);
			if (this?.data?.[this.elevation]?.[scan]?.record === undefined) throw new Error(`getHeader no data for elevation: ${this.elevation}, scan: ${scan}`);

			// return data
			return this.data[this.elevation][scan].record;
		}
		return this.data[this.elevation].map(((i) => i.record));
	}

	/**
	 * Returns an Object of radar reflectivity data for the current elevation and scan (or all scans if not provided)
	 *
	 * @category Data
	 * @param {number} [scan] Selected scan or null for all scans in elevation
	 * @returns {HighResData|HighResData[]} Scan's high res reflectivity data, or an array of the data.
	 */
	getHighresReflectivity(scan) {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresReflectivity invalid elevation selected: ${this.elevation}`);

		if (scan !== undefined) {
			// error checking
			if (this?.data?.[this.elevation]?.[scan] === undefined) throw new Error(`getHighresReflectivity invalid scan selected: ${scan}`);
			if (this?.data?.[this.elevation]?.[scan]?.record?.reflect === undefined) throw new Error(`getHighresReflectivity no data for elevation: ${this.elevation}, scan: ${scan}`);
			// return data
			return this.data[this.elevation][scan].record.reflect;
		}
		return this.data[this.elevation].map((i) => i.record.reflect);
	}

	/**
	 * Returns an Object of radar velocity data for the current elevation and scan (or all scans if not provided)
	 *
	 * @category Data
	 * @param {number} [scan] Selected scan, or null for all scans in this elevation
	 * @returns {HighResData|HighResData[]} Scan's high res velocity data, or an array of the data.
	 */
	getHighresVelocity(scan) {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresVelocity invalid elevation selected: ${this.elevation}`);

		if (scan !== undefined) {
			// error checking
			if (this?.data?.[this.elevation]?.[scan] === undefined) throw new Error(`getHighresVelocity invalid scan selected: ${scan}`);
			if (this?.data?.[this.elevation]?.[scan]?.record?.reflect === undefined) throw new Error(`getHighresVelocity no data for elevation: ${this.elevation}, scan: ${scan}`);

			// return data
			return this.data[this.elevation][scan].record.velocity;
		}
		return this.data[this.elevation].map((i) => i.record.velocity);
	}

	/**
	 * Returns an Object of radar spectrum data for the current elevation and scan (or all scans if not provided)
	 *
	 * @category Data
	 * @param {number} [scan] Selected scan, or null for all scans in this elevation
	 * @returns {HighResData|HighResData[]} Scan's high res spectrum data, or an array of the data.
	 */
	getHighresSpectrum(scan) {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresSpectrum invalid elevation selected: ${this.elevation}`);

		if (scan !== undefined) {
			if (this?.data?.[this.elevation]?.[scan] === undefined) throw new Error(`getHighresSpectrum invalid scan selected: ${scan}`);
			if (this?.data?.[this.elevation]?.[scan]?.record?.spectrum === undefined) throw new Error(`getHighresSpectrum no data for elevation: ${this.elevation}, scan: ${scan}`);

			// return data
			return this.data[this.elevation][scan].record.spectrum;
		}
		return this.data[this.elevation].map((i) => i.record.spectrum);
	}

	/**
	 * Returns an Object of radar differential reflectivity data for the current elevation and scan (or all scans if not provided)
	 *
	 * @category Data
	 * @param {number} [scan] Selected scan or null for all scans in elevation
	 * @returns {HighResData|HighResData[]} Scan's high res differential reflectivity data, or an array of the data.
	 */
	getHighresDiffReflectivity(scan) {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresDiffReflectivity invalid elevation selected: ${this.elevation}`);

		if (scan !== undefined) {
			if (this?.data?.[this.elevation]?.[this.scan] === undefined) throw new Error(`getHighresDiffReflectivity invalid scan selected: ${this.scan}`);
			if (this?.data?.[this.elevation]?.[this.scan]?.record?.zdr === undefined) throw new Error(`getHighresDiffReflectivity no data for elevation: ${this.elevation}, scan: ${this.scan}`);

			// return data
			return this.data[this.elevation][this.scan].record.zdr;
		}
		return this.data[this.elevation].map((i) => i.record.zdr);
	}

	/**
	 * Returns an Object of radar differential phase data for the current elevation and scan (or all scans if not provided)
	 *
	 * @category Data
	 * @param {number} [scan] Selected scan or null for all scans in elevation
	 * @returns {HighResData|HighResData[]} Scan's high res differential phase data, or an array of the data.
	 */
	getHighresDiffPhase(scan) {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresDiffPhase invalid elevation selected: ${this.elevation}`);

		if (scan !== undefined) {
			if (this?.data?.[this.elevation]?.[this.scan] === undefined) throw new Error(`getHighresDiffPhase invalid scan selected: ${this.scan}`);
			if (this?.data?.[this.elevation]?.[this.scan]?.record?.phi === undefined) throw new Error(`getHighresDiffPhase no data for elevation: ${this.elevation}, scan: ${this.scan}`);

			// return data
			return this.data[this.elevation][this.scan].record.phi;
		}
		return this.data[this.elevation].map((i) => i.record.phi);
	}

	/**
	 * Returns an Object of radar correlation coefficient data for the current elevation and scan (or all scans if not provided)
	 *
	 * @category Data
	 * @param {number} [scan] Selected scan or null for all scans in elevation
	 * @returns {HighResData|HighResData[]} Scan's high res correlation coefficient data, or an array of the data.
	 */
	getHighresCorrelationCoefficient(scan) {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresCorrelationCoefficient invalid elevation selected: ${this.elevation}`);

		if (scan !== undefined) {
			if (this?.data?.[this.elevation]?.[this.scan] === undefined) throw new Error(`getHighresCorrelationCoefficient invalid scan selected: ${this.scan}`);
			if (this?.data?.[this.elevation]?.[this.scan]?.record?.rho === undefined) throw new Error(`getHighresCorrelationCoefficient no data for elevation: ${this.elevation}, scan: ${this.scan}`);

			// return data
			return this.data[this.elevation][this.scan].record.rho;
		}
		return this.data[this.elevation].map((i) => i.record.rho);
	}

	/**
	 * List all available elevations
	 *
	 * @category Metadata
	 * @param  {string} angleOrNum Whether to return the elevation angles, or numbers representing their total amount.
	 * @param  {Level2Radar} radObj The radar object returned from nexrad-level-2-data. Only used when retrieving elevation angle numbers.
	 * @returns {number[]}
	 */
	listElevations(angleOrNum, radObj) {
		if (angleOrNum == undefined || angleOrNum == "num") {
			return Object.keys(this.data).map((key) => +key);
		} else if (angleOrNum == "angle") {
			if (radObj.header.version == "06") {
				console.log('hi-res data');
				var elevAngleArr = [];
				for (var key in radObj.vcp.record.elevations) {
					var base = radObj.vcp.record.elevations[key]
					elevAngleArr.push([base.elevation_angle, base.waveform_type]);
				}
			} else {
				console.log('non hi-res data');
				// elevation angles are stored in a different place for non hi-res data
				var elevAngleArr = [];
				for (var key in radObj.data) {
					var base = radObj.data[key];
					var yn = 0;
					if ( // if elevation contains only reflectivity data
						base[0].record.reflect &&
						!base[0].record.velocity
					) {
						yn = 'REF';
					} else if ( // if elevation contains only velocity data
						base[0].record.velocity &&
						!base[0].record.reflect
					) {
						yn = 'VEL';
					} else if ( // if elevation contains reflectivity AND velocity data
						base[0].record.velocity &&
						base[0].record.reflect
					) {
						yn = 'REFVEL';
					}
					var base2;
					if (!(radObj.header.version == "01")) {
						base2 = radObj.vcp.record.elevations[key];
					} else {
						base2 = radObj.data[key];
					}
					elevAngleArr.push([base2.elevation_angle, yn]);
				}
			}
			return elevAngleArr;
		}
	}

	// REF: 'reflect'
	// VEL: 'velocity'
	// SW : 'spectrum width'
	// ZDR: 'differential reflectivity'
	// PHI: 'differential phase phift'
	// RHO: 'correlation coefficient'
	listElevationsAndProducts() {
		if (this.header.version != "01" && this.header.version != "E2") {
			console.log('hi-res data');
			var elevAngleArr = [];
			for (var key in this.vcp.record.elevations) {
				// var base = this.vcp.record.elevations[key]
				var base = this.data[key][0].record;

				var allProductsArr = [];
				if (base.hasOwnProperty('reflect')) {
					allProductsArr.push('REF')
				}
				if (base.hasOwnProperty('velocity')) {
					allProductsArr.push('VEL')
				}
				if (base.hasOwnProperty('rho')) {
					allProductsArr.push('RHO')
				}
				if (base.hasOwnProperty('phi')) {
					allProductsArr.push('PHI')
				}
				if (base.hasOwnProperty('zdr')) {
					allProductsArr.push('ZDR')
				}
				if (base.hasOwnProperty('spectrum')) {
					allProductsArr.push('SW ')
				}

				elevAngleArr.push([base.elevation_angle, base.elevation_number, allProductsArr]);
			}
			return elevAngleArr;
		}
	}

	_checkData() {
		if (this.data.length === 0) throw new Error('No data found in file');
	}

	/**
	 * Combines the data returned by multiple runs of the Level2Data constructor. This is typically used in "chunks" mode to combine all azimuths from one revolution into a single data set. data can be provided as an array of Level2Radar objects, individual Level2Data parameters or any combination thereof.
	 *
	 * The combine function blindly combines data and the right-most argument will overwrite any previously provided data. Individual azimuths located in Level2Radar.data[] will be appended. It is up to the calling routine to properly manage the parsing of related chunks and send it in to this routine.
	 *
	 * @param  {...Level2Radar} data Data to combine
	 * @returns {Level2Radar} Combined data
	 */
	static combineData(...data) {
		const combined = combineData(data);

		// pass through constructor alternative signature to get a Level2Object
		return new Level2Radar(combined);
	}
}

// combine options and defaults
const combineOptions = (newOptions) => {
	let logger = newOptions?.logger ?? console;
	if (logger === false) logger = nullLogger;
	return {
		...newOptions, logger,
	};
};

// null logger for options.logger = false
const nullLogger = {
	log: () => {},
	error: () => {},
	warn: () => {},
};

module.exports.Level2Radar = Level2Radar;
