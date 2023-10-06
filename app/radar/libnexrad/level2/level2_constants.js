// format of structure elements
// section 3.2.1, page 3-2
const CODE1 = 'B';
const CODE2 = 'H';
const INT1 = 'B';
const INT2 = 'H';
const INT4 = 'I';
const REAL4 = 'f';
const REAL8 = 'd';
const SINT1 = 'b';
const SINT2 = 'h';
const SINT4 = 'i';

const level2_constants = {
    // NEXRAD Level II file structures and sizes
    // The deails on these structures are documented in:
    // "Interface Control Document for the Achive II/User" RPG Build 12.0
    // Document Number 2620010E
    // and
    // "Interface Control Document for the RDA/RPG" Open Build 13.0
    // Document Number 2620002M
    // Tables and page number refer to those in the second document unless
    // otherwise noted.
    RECORD_SIZE: 2432,
    COMPRESSION_RECORD_SIZE: 12,
    CONTROL_WORD_SIZE: 4,

    // Figure 1 in Interface Control Document for the Archive II/User
    // page 7-2
    VOLUME_HEADER: [
        ['tape', '9s'],
        ['extension', '3s'],
        ['date', 'I'],
        ['time', 'I'],
        ['icao', '4s']
    ],

    // Table II Message Header Data
    // page 3-7
    MSG_HEADER: [
        ['size', INT2],  // size of data, no including header
        ['channels', INT1],
        ['type', INT1],
        ['seq_id', INT2],
        ['date', INT2],
        ['ms', INT4],
        ['segments', INT2],
        ['seg_num', INT2],
    ],

    // Table XVII Digital Radar Generic Format Blocks (Message Type 31)
    // pages 3-87 to 3-89
    MSG_31: [
        ['id', '4s'],  // 0-3
        ['collect_ms', INT4],  // 4-7
        ['collect_date', INT2],  // 8-9
        ['azimuth_number', INT2],  // 10-11
        ['azimuth_angle', REAL4],  // 12-15
        ['compress_flag', CODE1],  // 16
        ['spare_0', INT1],  // 17
        ['radial_length', INT2],  // 18-19
        ['azimuth_resolution', CODE1],  // 20
        ['radial_spacing', CODE1],  // 21
        ['elevation_number', INT1],  // 22
        ['cut_sector', INT1],  // 23
        ['elevation_angle', REAL4],  // 24-27
        ['radial_blanking', CODE1],  // 28
        ['azimuth_mode', SINT1],  // 29
        ['block_count', INT2],  // 30-31
        ['block_pointer_1', INT4],  // 32-35  Volume Data Constant XVII-E
        ['block_pointer_2', INT4],  // 36-39  Elevation Data Constant XVII-F
        ['block_pointer_3', INT4],  // 40-43  Radial Data Constant XVII-H
        ['block_pointer_4', INT4],  // 44-47  Moment 'REF' XVII-{B/I}
        ['block_pointer_5', INT4],  // 48-51  Moment 'VEL'
        ['block_pointer_6', INT4],  // 52-55  Moment 'SW'
        ['block_pointer_7', INT4],  // 56-59  Moment 'ZDR'
        ['block_pointer_8', INT4],  // 60-63  Moment 'PHI'
        ['block_pointer_9', INT4],  // 64-67  Moment 'RHO'
        ['block_pointer_10', INT4],  // Moment 'CFP'
    ],


    // Table III Digital Radar Data (Message Type 1)
    // pages 3-7 to
    MSG_1: [
        ['collect_ms', INT4],  // 0-3
        ['collect_date', INT2],  // 4-5
        ['unambig_range', SINT2],  // 6-7
        ['azimuth_angle', CODE2],  // 8-9
        ['azimuth_number', INT2],  // 10-11
        ['radial_status', CODE2],  // 12-13
        ['elevation_angle', INT2],  // 14-15
        ['elevation_number', INT2],  // 16-17
        ['sur_range_first', CODE2],  // 18-19
        ['doppler_range_first', CODE2],  // 20-21
        ['sur_range_step', CODE2],  // 22-23
        ['doppler_range_step', CODE2],  // 24-25
        ['sur_nbins', INT2],  // 26-27
        ['doppler_nbins', INT2],  // 28-29
        ['cut_sector_num', INT2],  // 30-31
        ['calib_const', REAL4],  // 32-35
        ['sur_pointer', INT2],  // 36-37
        ['vel_pointer', INT2],  // 38-39
        ['width_pointer', INT2],  // 40-41
        ['doppler_resolution', CODE2],  // 42-43
        ['vcp', INT2],  // 44-45
        ['spare_1', '8s'],  // 46-53
        ['spare_2', '2s'],  // 54-55
        ['spare_3', '2s'],  // 56-57
        ['spare_4', '2s'],  // 58-59
        ['nyquist_vel', SINT2],  // 60-61
        ['atmos_attenuation', SINT2],  // 62-63
        ['threshold', SINT2],  // 64-65
        ['spot_blank_status', INT2],  // 66-67
        ['spare_5', '32s'],  // 68-99
        // 100+  reflectivity, velocity and/or spectral width data, CODE1
    ],

    // Table XI Volume Coverage Pattern Data (Message Type 5 & 7)
    // pages 3-51 to 3-54
    MSG_5: [
        ['msg_size', INT2],
        ['pattern_type', CODE2],
        ['pattern_number', INT2],
        ['num_cuts', INT2],
        ['clutter_map_group', INT2],
        ['doppler_vel_res', CODE1],  // 2: 0.5 degrees, 4: 1.0 degrees
        ['pulse_width', CODE1],  // 2: short, 4: long
        ['spare', '10s'],  // halfwords 7-11 (10 bytes, 5 halfwords)
    ],

    MSG_5_ELEV: [
        ['elevation_angle', CODE2],  // scaled by 360/65536 for value in degrees.
        ['channel_config', CODE1],
        ['waveform_type', CODE1],
        ['super_resolution', CODE1],
        ['prf_number', INT1],
        ['prf_pulse_count', INT2],
        ['azimuth_rate', CODE2],
        ['ref_thresh', SINT2],
        ['vel_thresh', SINT2],
        ['sw_thresh', SINT2],
        ['zdr_thres', SINT2],
        ['phi_thres', SINT2],
        ['rho_thres', SINT2],
        ['edge_angle_1', CODE2],
        ['dop_prf_num_1', INT2],
        ['dop_prf_pulse_count_1', INT2],
        ['spare_1', '2s'],
        ['edge_angle_2', CODE2],
        ['dop_prf_num_2', INT2],
        ['dop_prf_pulse_count_2', INT2],
        ['spare_2', '2s'],
        ['edge_angle_3', CODE2],
        ['dop_prf_num_3', INT2],
        ['dop_prf_pulse_count_3', INT2],
        ['spare_3', '2s'],
    ],

    // Table XVII-B Data Block (Descriptor of Generic Data Moment Type)
    // pages 3-90 and 3-91
    GENERIC_DATA_BLOCK: [
        ['block_type', '1s'],
        ['data_name', '3s'],  // VEL, REF, SW, RHO, PHI, ZDR
        ['reserved', INT4],
        ['ngates', INT2],
        ['first_gate', SINT2],
        ['gate_spacing', SINT2],
        ['thresh', SINT2],
        ['snr_thres', SINT2],
        ['flags', CODE1],
        ['word_size', INT1],
        ['scale', REAL4],
        ['offset', REAL4],
        // then data
    ],

    // Table XVII-E Data Block (Volume Data Constant Type)
    // page 3-92
    VOLUME_DATA_BLOCK: [
        ['block_type', '1s'],
        ['data_name', '3s'],
        ['lrtup', INT2],
        ['version_major', INT1],
        ['version_minor', INT1],
        ['lat', REAL4],
        ['lon', REAL4],
        ['height', SINT2],
        ['feedhorn_height', INT2],
        ['refl_calib', REAL4],
        ['power_h', REAL4],
        ['power_v', REAL4],
        ['diff_refl_calib', REAL4],
        ['init_phase', REAL4],
        ['vcp', INT2],
        ['spare', '2s'],
    ],

    // Table XVII-F Data Block (Elevation Data Constant Type)
    // page 3-93
    ELEVATION_DATA_BLOCK: [
        ['block_type', '1s'],
        ['data_name', '3s'],
        ['lrtup', INT2],
        ['atmos', SINT2],
        ['refl_calib', REAL4],
    ],

    // Table XVII-H Data Block (Radial Data Constant Type)
    // pages 3-93
    RADIAL_DATA_BLOCK: [
        ['block_type', '1s'],
        ['data_name', '3s'],
        ['lrtup', INT2],
        ['unambig_range', SINT2],
        ['noise_h', REAL4],
        ['noise_v', REAL4],
        ['nyquist_vel', SINT2],
        ['spare', '2s'],
    ],
}

module.exports = level2_constants;