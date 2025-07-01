/**
 *
 * @typedef {object} HighResData See NOAA documentation for detailed meanings of these values.
 * @property {number} gate_count
 * @property {number} gate_size
 * @property {number} first_gate
 * @property {number} rf_threshold
 * @property {number} snr_threshold
 * @property {number} scale
 * @property {number} offset
 * @property {string} block_type 'D'
 * @property {number} control_flags
 * @property {number} data_size
 * @property {string} name 'REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'
 * @property {Buffer[]} spare Spare data per the documentation
 * @property {number[]} moment_data Scaled data
 */

/**
 * @typedef {object} MessageHeader See NOAA documentation for detailed meanings of these values.
 * @property {number} aim
 * @property {number} ars
 * @property {number} compress_idx
 * @property {number} cut
 * @property {number} dcount
 * @property {number} elevation_angle
 * @property {number} elevation_number
 * @property {string} id
 * @property {number} julian_date
 * @property {number} mseconds
 * @property {HighResData} [phi]
 * @property {Radial} radial
 * @property {number} radial_length
 * @property {number} radial_number
 * @property {HighResData} [reflect]
 * @property {HighResData} [rho]
 * @property {number} rs
 * @property {number} rsbs
 * @property {HighResData} [spectrum]
 * @property {number} sp
 * @property {Volume} volume
 * @property {HighResData} [velocity]
 * @property {HighResData} [zdr]
 */

/**
 * @typedef {object} Radial See NOAA documentation for detailed meanings of these values.
 * @property {string} block_type 'R'
 * @property {number} horizontal_calibration
 * @property {number} horizontal_noise_level
 * @property {string} name 'RAD'
 * @property {number} nyquist_velocity
 * @property {number} radial_flags
 * @property {number} size
 * @property {number} unambiguous_range
 * @property {number} vertical_calibration
 * @property {number} vertical_noise_level
 */

/**
 * @typedef {object} Volume See NOAA documentation for detailed meanings of these values.
 * @property {string} block_type 'R'
 * @property {number} calibration
 * @property {number} differential_phase
 * @property {number} differential_reflectivity
 * @property {number} elevation
 * @property {number} feedhorn_height
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} name 'VOL'
 * @property {number} processing_status
 * @property {number} size
 * @property {number} tx_horizontal
 * @property {number} tx_vertical
 * @property {number} version_major
 * @property {number} version_minor
 * @property {number} volume_coverage_pattern
 * @property {number} zdr_bias_estimate
 */

/**
 * @typedef {object} Header File header details
 * See NOAA documentation for detailed meanings of these values.
 * @property {string} ICAO Radar site identifier
 * @property {number} milliseconds Milliseconds since midnight
 * @property {number} modified_julian_date Days since Dec 31, 1969
 * @property {Buffer} raw Raw header from file
 * @property {string} version Version number
 */

/**
 * @typedef {object} Vcp Volume coverage pattern
 * See NOAA documentation for detailed meanings of these values.
 * @property {number} channel
 * @property {number} id_sequence
 * @property {number} message_julian_date
 * @property {number} message_mseconds
 * @property {number} message_size
 * @property {number} message_type
 * @property {VcpRecord} record
 * @property {number} segment_count
 * @property {number} segment_number
 */

/**
 * @typedef {object} VcpRecord See NOAA documentation for detailed meanings of these values.
 * @property {number} clutter_number
 * @property {VcpElevations[]} elevations
 * @property {number} message_size
 * @property {number} num_elevations
 * @property {number} pattern_number
 * @property {number} pattern_type
 * @property {string} pulse_width
 * @property {number} reserved1 Reserved per NOAA documentation
 * @property {number} reserved2 Reserved per NOAA documentation
 * @property {VcpSequencing} vcp_sequencing
 * @property {VcpSupplemental} vcp_supplemental
 * @property {number} velocity_resolution
 * @property {number} version
 */

/**
 * @typedef {object} VcpSequencing See NOAA documentation for detailed meanings of these values.
 * @property {number} elevations
 * @property {number} max_sails_cuts
 * @property {number} sequence_active
 * @property {number} truncated_vcp
 */

/**
 * @typedef {object} VcpSupplemental See NOAA documentation for detailed meanings of these values.
 * @property {boolean} base_tilt_vcp
 * @property {boolean} mpda_vcp
 * @property {boolean} mrle_vcp
 * @property {number} number_base_tilts
 * @property {number} number_mrle_cuts
 * @property {number} number_sails_cuts
 * @property {number} sails_vcp
 */
