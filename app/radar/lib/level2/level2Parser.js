// const fs = require('fs');
// https://github.com/cscott/seek-bzip
const bzip = require('seek-bzip');
const pako = require('pako');
const BufferPack = require('bufferpack');
const RandomAccessFile = require('../RandomAccessFile');

function _arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) == JSON.stringify(arr2);
}

function min(arr) { return Math.min(...[...new Set(arr)]) }
function max(arr) { return Math.max(...[...new Set(arr)]) }

/**
 * Check if the file is gzip compressed.
 * If it is, return the decompressed RAF.
 * If not, return the original RAF.
 */
function _decompressFile(fh) {
    var magic = fh.peek(3);
    magic = Array.from(magic);
    if (_arraysEqual(magic, [31, 139, 8])) {
        // console.log('GZIP compressed.');
        var inflated = pako.inflate(fh.buffer);
        return new RandomAccessFile(Buffer.from(inflated));
    } else {
        return fh;
    }
}

function _bufferToString(buffer) {
    return buffer.toString('UTF-8');
}

class NEXRADLevel2File {
    constructor (fileBuffer) {
        var fh = new RandomAccessFile(fileBuffer);
        fh = _decompressFile(fh);

        this.nexradLevel = 2;

        var size = _structure_size(VOLUME_HEADER);
        this.volume_header = _unpack_structure(fh.read(size), VOLUME_HEADER);
        var compression_record = fh.read(COMPRESSION_RECORD_SIZE);

        // read the records in the file, decompressing as needed
        var compression_or_ctm_info = compression_record.slice(CONTROL_WORD_SIZE, CONTROL_WORD_SIZE + 2);
        var buf;
        if (_bufferToString(compression_or_ctm_info) == 'BZ') {
            buf = _decompress_records(fh);
        } else if (_arraysEqual(new Uint8Array(compression_or_ctm_info), new Uint8Array([0x00, 0x00])) || _arraysEqual(new Uint8Array(compression_or_ctm_info), new Uint8Array([0x09, 0x80]))) {
            buf = fh.read();
        } else {
            throw new Error('Unknown compression record.');
        }
        this._fh = fh;

        // read the records from the buffer
        this._records = [];
        var buf_length = buf.length;
        var pos = 0;
        while (pos < buf_length) {
            var record = _get_record_from_buf(buf, pos);
            pos = record[0];
            var dic = record[1];
            this._records.push(dic);
        }

        // pull out radial records (1 or 31) which contain the moment data.
        this.radial_records = this._records.filter(r => r['header']['type'] == 31);
        this._msg_type = '31';
        if (this.radial_records.length == 0) {
            this.radial_records = this._records.filter(r => r['header']['type'] == 1);
            this._msg_type = '1';
        }
        if (this.radial_records.length == 0) {
            throw new Error('No MSG31 records found, cannot read file');
        }
        var elev_nums = this.radial_records.map(m => m['msg_header']['elevation_number']);
        this.scan_msgs = Array.from({ length: Math.max(...elev_nums) }, (_, i) => {
            return elev_nums.reduce((acc, val, idx) => {
                if (val === i + 1) acc.push(idx);
                return acc;
            }, []);
        });
        this.nscans = this.scan_msgs.length;

        // pull out the vcp record
        var msg_5 = this._records.filter(r => r['header']['type'] == 5);

        if (msg_5.length) {
            this.vcp = msg_5[0];
        } else {
            // There is no VCP Data.. This is uber dodgy
            this.vcp = null;

            throw new Error(
                `No MSG5 detected. Setting to meaningless data.
                Rethink your life choices and be ready for errors.
                Specifically fixed angle data will be missing`
            );
        }
        return;
    }
    location() {
        /*
        Find the location of the radar.

        Returns all zeros if location is not available.

        Returns
        -------
        latitude : float
            Latitude of the radar in degrees.
        longitude : float
            Longitude of the radar in degrees.
        height : int
            Height of radar and feedhorn in meters above mean sea level.
        */

        if (this._msg_type == '31') {
            var dic = this.radial_records[0]['VOL'];
            var height = dic['height'] + dic['feedhorn_height'];
            return [dic['lat'], dic['lon'], height];
        } else {
            return [0.0, 0.0, 0.0];
        }
    }
    scan_info(scans = null) {
        /*
        Return a list of dictionaries with scan information.

        Parameters
        ----------
        scans : list ot None
            Scans (0 based) for which ray (radial) azimuth angles will be
            retrieved.  None (the default) will return the angles for all
            scans in the volume.

        Returns
        -------
        scan_info : list, optional
            A list of the scan performed with a dictionary with keys
            'moments', 'ngates', 'nrays', 'first_gate' and 'gate_spacing'
            for each scan.  The 'moments', 'ngates', 'first_gate', and
            'gate_spacing' keys are lists of the NEXRAD moments and gate
            information for that moment collected during the specific scan.
            The 'nrays' key provides the number of radials collected in the
            given scan.
        */

        let info = [];

        if (scans === null) {
            scans = Array.from({ length: this.nscans }, (_, i) => i);
        }
        for (var scan of scans) {
            var nrays = this.get_nrays(scan);
            if (nrays < 2) {
                this.nscans -= 1;
                continue;
            }
            var msg31_number = this.scan_msgs[scan][0];
            var msg = this.radial_records[msg31_number];
            var nexrad_moments = ['REF', 'VEL', 'SW', 'ZDR', 'PHI', 'RHO', 'CFP'];
            var moments = nexrad_moments.filter(f => f in msg);
            var ngates = moments.map(f => msg[f]['ngates']);
            var gate_spacing = moments.map(f => msg[f]['gate_spacing']);
            var first_gate = moments.map(f => msg[f]['first_gate']);
            info.push({
                'nrays': nrays,
                'ngates': ngates,
                'gate_spacing': gate_spacing,
                'first_gate': first_gate,
                'moments': moments
            });
        }
        return info;
    }
    get_vcp_pattern() {
        /*
        Return the numerical volume coverage pattern (VCP) or None if unknown.
        */
        if (this.vcp == null) {
            return null;
        } else {
            return this.vcp['msg5_header']['pattern_number'];
        }
    }
    get_nrays(scan) {
        /*
        Return the number of rays in a given scan.

        Parameters
        ----------
        scan : int
            Scan of interest (0 based).

        Returns
        -------
        nrays : int
            Number of rays (radials) in the scan.
        */

        return this.scan_msgs[scan].length;
    }
    get_ngates(scan_num, moment) {
        // obj = this.scan_info([scan])[0]
        // moment_index = obj['moments'].index(moment)
        // return obj['ngates'][moment_index]
        var dic = this.radial_records[this.scan_msgs[scan_num][0]][moment];
        var ngates = dic['ngates'];
        return ngates;
    }
    get_range(scan_num, moment) {
        /*
        Return an array of gate ranges for a given scan and moment.

        Parameters
        ----------
        scan_num : int
            Scan number (0 based).
        moment : 'REF', 'VEL', 'SW', 'ZDR', 'PHI', 'RHO', or 'CFP'
            Moment of interest.

        Returns
        -------
        range : ndarray
            Range in meters from the antenna to the center of gate (bin).
        */

        var dic = this.radial_records[this.scan_msgs[scan_num][0]][moment];
        var ngates = dic['ngates'];
        var first_gate = dic['first_gate'];
        var gate_spacing = dic['gate_spacing'];
        return Array.from({ length: ngates }, (_, i) => i * gate_spacing + first_gate);
    }
    // helper functions for looping over scans
    _msg_nums(scans) {
        /* Find the all message number for a list of scans. */
        return scans.flatMap(i => this.scan_msgs[i]);
    }
    _radial_array(scans, key) {
        /* Return an array of radial header elements for all rays in scans. */
        var msg_nums = this._msg_nums(scans);
        var temp = msg_nums.map(i => this.radial_records[i]['msg_header'][key]);
        return temp;
    }
    _radial_sub_array(scans, key) {
        /* Return an array of RAD or msg_header elements for all rays in scans. */
        var msg_nums = this._msg_nums(scans);
        var tmp;
        if (this._msg_type == '31') {
            tmp = msg_nums.map(i => this.radial_records[i]['RAD'][key]);
        } else {
            tmp = msg_nums.map(i => this.radial_records[i]['msg_header'][key]);
        }
        return tmp;
    }
    get_times(scans = null) {
        /*
        Retrieve the times at which the rays were collected.

        Parameters
        ----------
        scans : list or None
            Scans (0-based) to retrieve ray (radial) collection times from.
            None (the default) will return the times for all scans in the
            volume.

        Returns
        -------
        time_start : Datetime
            Initial time.
        time : ndarray
            Offset in seconds from the initial time at which the rays
            in the requested scans were collected.
        */

        if (scans == null) {
            scans = Array.from({ length: this.nscans }, (_, i) => i);
        }
        var days = this._radial_array(scans, 'collect_date');
        var secs = this._radial_array(scans, 'collect_ms').map(ms => ms / 1000.0);
        var offset = new Date((parseInt(days[0]) - 1) * 86400000 + parseInt(secs[0]) * 1000);
        var time_start = new Date(offset.getTime());
        var time = secs.map((sec, index) => {
            return sec - parseInt(secs[0]) + (parseInt(days[index]) - parseInt(days[0])) * 86400;
        });
        return [time_start, time];
    }
    get_azimuth_angles(scans = null) {
        /*
        Retrieve the azimuth angles of all rays in the requested scans.

        Parameters
        ----------
        scans : list ot None
            Scans (0 based) for which ray (radial) azimuth angles will be
            retrieved. None (the default) will return the angles for all
            scans in the volume.

        Returns
        -------
        angles : ndarray
            Azimuth angles in degress for all rays in the requested scans.
        */

        if (scans == null) {
            scans = Array.from({ length: this.nscans }, (_, i) => i);
        }
        var scale;
        if (this._msg_type == '1') {
            scale = 180 / (4096 * 8.0);
        } else {
            scale = 1.0;
        }
        return this._radial_array(scans, 'azimuth_angle').map(i => i * scale);
    }
    get_elevation_angles(scans = null) {
        /*
        Retrieve the elevation angles of all rays in the requested scans.

        Parameters
        ----------
        scans : list or None
            Scans (0 based) for which ray (radial) azimuth angles will be
            retrieved. None (the default) will return the angles for
            all scans in the volume.

        Returns
        -------
        angles : ndarray
            Elevation angles in degress for all rays in the requested scans.
        */

        if (scans == null) {
            scans = Array.from({ length: this.nscans }, (_, i) => i);
        }
        var scale;
        if (this._msg_type == '1') {
            scale = 180 / (4096 * 8.0);
        } else {
            scale = 1.0;
        }
        return this._radial_array(scans, 'elevation_angle').map(i => i * scale);
    }
    get_target_angles(scans = null) {
        /*
        Retrieve the target elevation angle of the requested scans.

        Parameters
        ----------
        scans : list or None
            Scans (0 based) for which the target elevation angles will be
            retrieved. None (the default) will return the angles for all
            scans in the volume.

        Returns
        -------
        angles : ndarray
            Target elevation angles in degress for the requested scans.
        */

        if (scans == null) {
            scans = Array.from({ length: this.nscans }, (_, i) => i);
        }
        if (this._msg_type == '31') {
            var cut_parameters;
            if (this.vcp != null) {
                cut_parameters = this.vcp['cut_parameters'];
            }
            var scale = 360.0 / 65536.0;
            return scans.map(i => cut_parameters[i]['elevation_angle'] * scale);
        } else {
            var scale = 180 / (4096 * 8.0);
            var msgs = scans.map(i => this.radial_records[this.scan_msgs[i][0]]);
            var msgs_elevation = msgs.map(m => m.msg_header.elevation_angle * scale);
            var rounded_elevation = msgs_elevation.map(e => Math.round(e * 10) / 10);
            return rounded_elevation;
        }
    }
    get_nyquist_vel(scans = null) {
        /*
        Retrieve the Nyquist velocities of the requested scans.

        Parameters
        ----------
        scans : list or None
            Scans (0 based) for which the Nyquist velocities will be
            retrieved. None (the default) will return the velocities for all
            scans in the volume.

        Returns
        -------
        velocities : ndarray
            Nyquist velocities (in m/s) for the requested scans.
        */

        if (scans == null) {
            scans = Array.from({ length: this.nscans }, (_, i) => i);
        }
        return this._radial_sub_array(scans, 'nyquist_vel').map(i => i * 0.01);
    }
    get_unambigous_range(scans = null) {
        /*
        Retrieve the unambiguous range of the requested scans.

        Parameters
        ----------
        scans : list or None
            Scans (0 based) for which the unambiguous range will be retrieved.
            None (the default) will return the range for all scans in the
            volume.

        Returns
        -------
        unambiguous_range : ndarray
            Unambiguous range (in meters) for the requested scans.
        */

        if (scans == null) {
            scans = Array.from({ length: this.nscans }, (_, i) => i);
        }
        // unambiguous range is stored in tenths of km, x100 for meters
        return this._radial_sub_array(scans, 'unambig_range').map(i => i * 100.0);
    }
    get_data(moment, scans = null, raw_data = false) {
        /*
        Retrieve moment data for a given set of scans.

        Masked points indicate that the data was not collected, below
        threshold or is range folded.

        Parameters
        ----------
        moment : 'REF', 'VEL', 'SW', 'ZDR', 'PHI', 'RHO', or 'CFP'
            Moment for which to to retrieve data.
        raw_data : bool
            True to return the raw data, False to perform masking as well as
            applying the appropiate scale and offset to the data.  When
            raw_data is True values of 1 in the data likely indicate that
            the gate was not present in the sweep, in some cases in will
            indicate range folded data.
        scans : list or None.
            Scans to retrieve data from (0 based). None (the default) will
            get the data for all scans in the volume.

        Returns
        -------
        data : ndarray
        */

        function _masked_less_equal(arr, val) {
            var masked_data = [];
            for (var i = 0; i < arr.length; i++) {
                var row = [];
                for (var j = 0; j < arr[i].length; j++) {
                    if (arr[i][j] <= val) {
                        row.push(null);
                    } else {
                        row.push(arr[i][j]);
                    }
                }
                masked_data.push(row);
            }
            return masked_data;
        }

        if (scans == null) {
            scans = Array.from({ length: this.nscans }, (_, i) => i);
        }

        var max_ngates = this.get_ngates(scans[0], moment);

        // determine the number of rays
        var msg_nums = this._msg_nums(scans);
        var nrays = msg_nums.length;
        // extract the data
        var set_datatype = false;
        var data = Array.from({ length: nrays }, () => Array(max_ngates).fill(1));
        for (var [i, msg_num] of msg_nums.entries()) {
            var msg = this.radial_records[msg_num];
            if (!msg.hasOwnProperty(moment)) {
                continue;
            }
            // if (!set_datatype) {
            //     data = data.astype('>' + _bits_to_code(msg, moment));
            //     set_datatype = true;
            // }
            var ngates = Math.min(msg[moment]['ngates'], max_ngates, msg[moment]['data'].length);
            data[i] = Array.from(msg[moment]['data']);
        }
        // return raw data if requested
        if (raw_data) {
            return data;
        }

        // mask, scan and offset, assume that the offset and scale
        // are the same in all scans/gates
        for (var scan of scans) {  // find a scan which contains the moment
            var msg_num = this.scan_msgs[scan][0];
            var msg = this.radial_records[msg_num];
            if (msg.hasOwnProperty(moment)) {
                var offset = new Float32Array([msg[moment]['offset']])[0];
                var scale = new Float32Array([msg[moment]['scale']])[0];
                var mask = data.map(row => row.map(val => val <= 1));
                var scaled_data = data.map(row => row.map(val => (val - offset) / scale));
                return scaled_data.map((row, i) => row.map((val, j) => {
                    var is_masked = mask[i][j];
                    return is_masked ? null : val;
                }));
            }
        }

        // moment is not present in any scan, mask all values
        return data.map(row => row.map(val => (val <= 1) ? null : val));
    }
}

function _bits_to_code(msg, moment) {
    /*
    Convert number of bits to the proper code for unpacking.
    Based on the code found in MetPy:
    https://github.com/Unidata/MetPy/blob/40d5c12ab341a449c9398508bd41
    d010165f9eeb/src/metpy/io/_tools.py#L313-L321
    */

    if (msg['header']['type'] == 1) {
        return 'B';
        // var word_size = msg[moment]['data'].dtype;
        // if (word_size = 'uint16') {
        //     return 'H';
        // } else if (word_size == 'uint8') {
        //     return 'B';
        // } else {
        //     console.warn('Unsupported bit size, returning 'B'.');
        //     return 'B';
        // }
    } else if (msg['header']['type'] == 31) {
        var word_size = msg[moment]['word_size'];
        if (word_size == 16) {
            return 'H';
        } else if (word_size == 8) {
            return 'B';
        } else {
            console.warn('Unsupported bit size, returning "B".');
            return 'B';
        }
    } else {
        throw new Error(`Unsupported msg type ${msg['header']['type']}`);
    }
}

function _get_record_from_buf(buf, pos) {
    /* Retrieve and unpack a NEXRAD record from a buffer. */
    var dic = {'header': _unpack_from_buf(buf, pos, MSG_HEADER)};
    var msg_type = dic['header']['type'];
    // if (msg_type != 31) {
    //     console.log(msg_type)
    // }

    var new_pos;
    if (msg_type == 31) {
        new_pos = _get_msg31_from_buf(buf, pos, dic);
    } else if (msg_type == 5) {
        // Sometimes we encounter incomplete buffers
        try {
            new_pos = _get_msg5_from_buf(buf, pos, dic);
        } catch (e) {
            console.warn('Encountered incomplete MSG5. File may be corrupt.');
            new_pos = pos + RECORD_SIZE;
        }
    } else if (msg_type == 29) {
        new_pos = _get_msg29_from_buf(pos, dic);
        // warnings.warn('Message 29 encountered, not parsing.', RuntimeWarning)
    } else if (msg_type == 1) {
        new_pos = _get_msg1_from_buf(buf, pos, dic);
    } else { // not message 31 or 1, no decoding performed
        new_pos = pos + RECORD_SIZE;
    }

    return [new_pos, dic];
}

function _get_msg1_from_buf(buf, pos, dic) {
    /* Retrieve and unpack a MSG1 record from a buffer. */
    var msg_header_size = _structure_size(MSG_HEADER);
    var msg1_header = _unpack_from_buf(buf, pos + msg_header_size, MSG_1);
    dic['msg_header'] = msg1_header;

    var sur_nbins = parseInt(msg1_header['sur_nbins']);
    var doppler_nbins = parseInt(msg1_header['doppler_nbins']);

    var sur_step = parseInt(msg1_header['sur_range_step']);
    var doppler_step = parseInt(msg1_header['doppler_range_step']);

    var sur_first = parseInt(msg1_header['sur_range_first']);
    var doppler_first = parseInt(msg1_header['doppler_range_first']);
    if (doppler_first > 2**15) {
        doppler_first = doppler_first - 2**16;
    }

    if (msg1_header['sur_pointer']) {
        var offset = pos + msg_header_size + msg1_header['sur_pointer']
        var data = Uint8Array.from(buf.slice(offset, offset + sur_nbins));
        dic['REF'] = {
            'ngates': sur_nbins,
            'gate_spacing': sur_step,
            'first_gate': sur_first,
            'data': data,
            'scale': 2.0,
            'offset': 66.0,
        }
    }
    if (msg1_header['vel_pointer']) {
        var offset = pos + msg_header_size + msg1_header['vel_pointer']
        var data = Uint8Array.from(buf.slice(offset, offset + doppler_nbins));
        dic['VEL'] = {
            'ngates': doppler_nbins,
            'gate_spacing': doppler_step,
            'first_gate': doppler_first,
            'data': data,
            'scale': 2.0,
            'offset': 129.0,
        }
        if (msg1_header['doppler_resolution'] == 4) {
            // 1 m/s resolution velocity, offset remains 129.
            dic['VEL']['scale'] = 1.0
        }
    }
    if (msg1_header['width_pointer']) {
        var offset = pos + msg_header_size + msg1_header['width_pointer']
        var data = Uint8Array.from(buf.slice(offset, offset + doppler_nbins));
        dic['SW'] = {
            'ngates': doppler_nbins,
            'gate_spacing': doppler_step,
            'first_gate': doppler_first,
            'data': data,
            'scale': 2.0,
            'offset': 129.0,
        }
    }
    return pos + RECORD_SIZE;
}

function _get_msg29_from_buf(pos, dic) {
    var msg_size = dic['header']['size'];
    if (msg_size == 65535) {
        msg_size = (dic['header']['segments'] << 16) | dic['header']['seg_num'];
    }
    var msg_header_size = _structure_size(MSG_HEADER)
    var new_pos = pos + msg_header_size + msg_size
    return new_pos;
}

function _get_msg5_from_buf(buf, pos, dic) {
    /* Retrieve and unpack a MSG5 record from a buffer. */
    var msg_header_size = _structure_size(MSG_HEADER);
    var msg5_header_size = _structure_size(MSG_5);
    var msg5_elev_size = _structure_size(MSG_5_ELEV);

    dic['msg5_header'] = _unpack_from_buf(buf, pos + msg_header_size, MSG_5);
    dic['cut_parameters'] = [];
    for (var i = 0; i < dic['msg5_header']['num_cuts']; i++) {
        var pos2 = pos + msg_header_size + msg5_header_size + msg5_elev_size * i;
        dic['cut_parameters'].push(_unpack_from_buf(buf, pos2, MSG_5_ELEV));
    }
    return pos + RECORD_SIZE;
}

function _get_msg31_from_buf(buf, pos, dic) {
    /* Retrieve and unpack a MSG31 record from a buffer. */
    var msg_size = dic['header']['size'] * 2 - 4;
    var msg_header_size = _structure_size(MSG_HEADER);
    var new_pos = pos + msg_header_size + msg_size;
    var mbuf = buf.slice(pos + msg_header_size, new_pos);
    var msg_31_header = _unpack_from_buf(mbuf, 0, MSG_31);

    var block_pointers = Object.values(msg_31_header).filter((v, k) => Object.keys(msg_31_header)[k].startsWith('block_pointer') && v > 0);
    for (var i in block_pointers) {
        var block_pointer = block_pointers[i];
        var [block_name, block_dic] = _get_msg31_data_block(mbuf, block_pointer);
        dic[block_name] = block_dic;
    }

    dic['msg_header'] = msg_31_header;
    return new_pos;
}

function _get_msg31_data_block(buf, ptr) {
    /* Unpack a msg_31 data block into a dictionary. */
    var block_name = _bufferToString(buf.slice(ptr + 1, ptr + 4)).trim();

    var dic;
    if (block_name == 'VOL') {
        dic = _unpack_from_buf(buf, ptr, VOLUME_DATA_BLOCK);
    } else if (block_name == 'ELV') {
        dic = _unpack_from_buf(buf, ptr, ELEVATION_DATA_BLOCK);
    } else if (block_name == 'RAD') {
        dic = _unpack_from_buf(buf, ptr, RADIAL_DATA_BLOCK);
    } else if (['REF', 'VEL', 'SW', 'ZDR', 'PHI', 'RHO', 'CFP'].includes(block_name)) {
        dic = _unpack_from_buf(buf, ptr, GENERIC_DATA_BLOCK);
        var ngates = dic['ngates'];
        var ptr2 = ptr + _structure_size(GENERIC_DATA_BLOCK);
        var data;
        if (dic['word_size'] == 16) {
            data = Uint16Array.from(buf.slice(ptr2, ptr2 + ngates * 2));
        } else if (dic['word_size'] == 8) {
            data = Uint8Array.from(buf.slice(ptr2, ptr2 + ngates));
        } else {
            throw new Error(`Unsupported bit size: ${s}.`);
        }

        var scaledData = [];
        var offset = new Float32Array([dic.offset])[0];
        var scale = new Float32Array([dic.scale])[0];
        for (var i = 0; i < data.length; i++) {
            if (data[i] >= 2) {
                scaledData.push((data[i] - offset) / scale);
            } else {
                scaledData.push(null);
            }
        }

        dic['data'] = scaledData;
    } else {
        dic = {};
    }
    return [block_name, dic];
}

class RadarDecompressor {
    constructor() {
        this.unused_data;
    }
    _decompress_chunk(chunk) {
        // skip 32 bits 'BZh9' header
        return bzip.decodeBlock(chunk, 32);
        // https://github.com/jvrousseau/bzip2.js
        // return bzip2.simple(bzip2.array(chunk));
    }
    decompress(data) {
        this.compressedData = data;

        var rafData = new RandomAccessFile(data);
        var blockSize = Math.abs(rafData.readInt());
        // console.log(blockSize, data.slice(0, 4))

        data = data.slice(CONTROL_WORD_SIZE, data.length);
        var uncompressed = this._decompress_chunk(data);

        this.unused_data = data.slice(blockSize, data.length);
        if (blockSize > data.length) {
            this.unused_data = new Buffer.alloc(0);
        }

        return uncompressed;
    }
}

function _decompress_records(file_handler) {
    /* Decompressed the records from an BZ2 compressed Archive 2 file. */
    file_handler.seek(0);
    // read all data from the file
    var cbuf = file_handler.peek();
    var decompressor = new RadarDecompressor();
    // skip the radar file header (24 bits)
    var skip = _structure_size(VOLUME_HEADER);
    // initialize the buffer with all of the radar file's data, except for the header
    var buf = [decompressor.decompress(cbuf.slice(skip, cbuf.length))];
    // while there's still data to decompress
    while (decompressor.unused_data.length) {
        // store the remaining compressed data
        cbuf = decompressor.unused_data;
        // create a new RadarDecompressor
        decompressor = new RadarDecompressor();
        // uncompress and push to the final buffer
        buf.push(decompressor.decompress(cbuf));
    }
    // combine the array of Uint8Arrays + 1 buffer to a single buffer
    var finalBuffer = Buffer.concat(buf);
    // trim the 'COMPRESSION_RECORD_SIZE' from the start of the buffer
    finalBuffer = finalBuffer.slice(COMPRESSION_RECORD_SIZE, finalBuffer.length);
    return finalBuffer;
}

function _structure_size(structure) {
    /* Find the size of a structure in bytes. */
    var format = '>' + structure.map(i => i[1]).join('');
    var size = BufferPack.calcLength(format);
    return size;
}

function _unpack_from_buf(buf, pos, structure) {
    /* Unpack a structure from a buffer. */
    var size = _structure_size(structure);
    return _unpack_structure(buf.slice(pos, pos + size), structure);
}

function _unpack_structure(string, structure) {
    /* Unpack a structure from a string. */
    var fmt = '>' + structure.map(i => i[1]).join('');  // NEXRAD is big-endian
    var lst = BufferPack.unpack(fmt, string);
    var result = structure.reduce((acc, curr, index) => {
        acc[curr[0]] = lst[index];
        return acc;
    }, {});
    return result;
}

// NEXRAD Level II file structures and sizes
// The deails on these structures are documented in:
// "Interface Control Document for the Achive II/User" RPG Build 12.0
// Document Number 2620010E
// and
// "Interface Control Document for the RDA/RPG" Open Build 13.0
// Document Number 2620002M
// Tables and page number refer to those in the second document unless
// otherwise noted.
const RECORD_SIZE = 2432;
const COMPRESSION_RECORD_SIZE = 12;
const CONTROL_WORD_SIZE = 4;

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

// Figure 1 in Interface Control Document for the Archive II/User
// page 7-2
const VOLUME_HEADER = [
    ['tape', '9s'],
    ['extension', '3s'],
    ['date', 'I'],
    ['time', 'I'],
    ['icao', '4s']
]

// Table II Message Header Data
// page 3-7
const MSG_HEADER = [
    ['size', INT2],  // size of data, no including header
    ['channels', INT1],
    ['type', INT1],
    ['seq_id', INT2],
    ['date', INT2],
    ['ms', INT4],
    ['segments', INT2],
    ['seg_num', INT2],
]

// Table XVII Digital Radar Generic Format Blocks (Message Type 31)
// pages 3-87 to 3-89
const MSG_31 = [
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
]


// Table III Digital Radar Data (Message Type 1)
// pages 3-7 to
const MSG_1 = [
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
]

// Table XI Volume Coverage Pattern Data (Message Type 5 & 7)
// pages 3-51 to 3-54
const MSG_5 = [
    ['msg_size', INT2],
    ['pattern_type', CODE2],
    ['pattern_number', INT2],
    ['num_cuts', INT2],
    ['clutter_map_group', INT2],
    ['doppler_vel_res', CODE1],  // 2: 0.5 degrees, 4: 1.0 degrees
    ['pulse_width', CODE1],  // 2: short, 4: long
    ['spare', '10s'],  // halfwords 7-11 (10 bytes, 5 halfwords)
]

const MSG_5_ELEV = [
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
]

// Table XVII-B Data Block (Descriptor of Generic Data Moment Type)
// pages 3-90 and 3-91
const GENERIC_DATA_BLOCK = [
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
]

// Table XVII-E Data Block (Volume Data Constant Type)
// page 3-92
const VOLUME_DATA_BLOCK = [
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
]

// Table XVII-F Data Block (Elevation Data Constant Type)
// page 3-93
const ELEVATION_DATA_BLOCK = [
    ['block_type', '1s'],
    ['data_name', '3s'],
    ['lrtup', INT2],
    ['atmos', SINT2],
    ['refl_calib', REAL4],
]

// Table XVII-H Data Block (Radial Data Constant Type)
// pages 3-93
const RADIAL_DATA_BLOCK = [
    ['block_type', '1s'],
    ['data_name', '3s'],
    ['lrtup', INT2],
    ['unambig_range', SINT2],
    ['noise_h', REAL4],
    ['noise_v', REAL4],
    ['nyquist_vel', SINT2],
    ['spare', '2s'],
]

module.exports = NEXRADLevel2File;