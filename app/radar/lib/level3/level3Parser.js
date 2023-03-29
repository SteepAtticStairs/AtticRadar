// const fs = require('fs');
const BufferPack = require('bufferpack');
const zlib = require('zlib');
const bzip = require('seek-bzip');
const IOBuffer = require('../IOBuffer');

function _structure_size(structure) {
    /* Find the size of a structure in bytes. */
    var format = '>' + structure.map(i => i[1]).join('');
    var size = BufferPack.calcLength(format);
    return size;
}

function _copy(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function msToTime(s) {
    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    return {
        'hours': pad(hrs),
        'minutes': pad(mins),
        'seconds': pad(secs),
        'milliseconds': pad(ms, 3),
    }
    // return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}

function _julian_and_millis_to_date(modifiedJulianDate, milliseconds) {
    // page 14 - https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620001Y.pdf
    // page 16 - https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620002U.pdf
    var julianDate = modifiedJulianDate + 2440586.5;
    // https://stackoverflow.com/a/36073807
    var millis = (julianDate - 2440587.5) * 86400000;

    var fileDateObj = new Date(millis);
    var fileHours = msToTime(milliseconds).hours;
    var fileMinutes = msToTime(milliseconds).minutes;
    var fileSeconds = msToTime(milliseconds).seconds;
    fileDateObj.setUTCHours(fileHours);
    fileDateObj.setUTCMinutes(fileMinutes);
    fileDateObj.setUTCSeconds(fileSeconds);

    return fileDateObj;
}

function zlib_decompress_all_frames(data) {
    /* Decompress all frames of zlib-compressed bytes.
    Repeatedly tries to decompress `data` until all data are decompressed, or decompression
    fails. This will skip over bytes that are not compressed with zlib.
    Parameters
    ----------
    data : bytearray or bytes
        Binary data compressed using zlib.
    Returns
    -------
        bytearray
            All decompressed bytes
    */

    return data;
    // frames = bytearray()
    // data = bytes(data)
    // while data:
    //     decomp = zlib.decompressobj()
    //     try:
    //         frames += decomp.decompress(data)
    //         data = decomp.unused_data
    //         log.debug('Decompressed zlib frame (total %d bytes). %d bytes remain.',
    //                     len(frames), len(data))
    //     except zlib.error:
    //         log.debug('Remaining %d bytes are not zlib compressed.', len(data))
    //         frames.extend(data)
    //         break
    // return frames
}

class BitField {
    constructor(...names) {
        this._names = names;
    }

    __call__(val) {
        if (!val) {
            return null;
        }

        var bits = [];
        for (var n of this._names) {
            if (val & 0x1) {
                bits.push(n);
            }
            val >>= 1;
            if (!val) {
                break;
            }
        }

        return bits.length === 1 ? bits[0] : bits;
    }
}

class Bits {
    constructor(num_bits) {
        this._bits = [...Array(num_bits).keys()];
    }

    __call__(val) {
        return this._bits.map(i => Boolean((val >> i) & 0x1));
    }
}

function scaler(scale) {
    /* Create a function that scales by a specific value. */
    function inner(val) {
        return val * scale;
    }
    return inner;
}

function version(val) {
    var ver = val > 2 * 100 ? val / 100 : val / 10;
    return ver.toFixed(1);
}

function date_elem(ind_days, ind_minutes) {
    /* Create a function to parse a datetime from the product-specific blocks. */
    function inner(seq) {
        return _julian_and_millis_to_date(seq[ind_days], seq[ind_minutes] * 60 * 1000);
    }
    return inner;
}

function scaled_elem(index, scale) {
    /* Create a function to scale a certain product-specific block. */
    function inner(seq) {
        return seq[index] * scale;
    }
    return inner;
}

function combine_elem(ind1, ind2) {
    /* Create a function to combine two specified product-specific blocks into a single int. */
    function inner(seq) {
        var shift = 2**16
        if (seq[ind1] < 0) {
            seq[ind1] += shift;
        }
        if (seq[ind2] < 0) {
            seq[ind2] += shift;
        }
        return (seq[ind1] << 16) | seq[ind2];
    }
    return inner;
}

function reduce_lists(d) {
    // Replace single item lists in a dictionary with the single item.
    for (var field in d) {
        var oldData = d[field];
        if (oldData.length === 1) {
            d[field] = oldData[0];
        }
    }
    return d;
}

function float32(short1, short2) {
    /* Unpack a pair of 16-bit integers as a JavaScript float. */
    // Masking below in JavaScript will properly convert signed values to unsigned
    let buffer = new ArrayBuffer(4);
    let uint8 = new Uint8Array(buffer);
    let float32 = new Float32Array(buffer);
    uint8[3] = (short1 >> 8) & 0xff;
    uint8[2] = short1 & 0xff;
    uint8[1] = (short2 >> 8) & 0xff;
    uint8[0] = short2 & 0xff;
    return float32[0];
}

function float_elem(ind1, ind2) {
    /* Create a function to combine two specified product-specific blocks into a float. */
    return function(seq) {
        return float32(seq[ind1], seq[ind2]);
    };
}

function high_byte(ind) {
    /* Create a function to return the high-byte of a product-specific block. */
    function inner(seq) {
        return seq[ind] >> 8;
    }
    return inner;
}

function low_byte(ind) {
    /* Create a function to return the low-byte of a product-specific block. */
    function inner(seq) {
        return seq[ind] & 0x00FF;
    }
    return inner;
}

function delta_time(ind) {
    /* Create a function to return the delta time from a product-specific block. */
    function inner(seq) {
        return seq[ind] >> 5;
    }
    return inner;
}

function two_comp16(val) {
    /* Return the two's-complement signed representation of a 16-bit unsigned integer. */
    if (val >> 15) {
        val = -(~val & 0x7fff) - 1;
    }
    return val;
}

function float16(val) {
    /* Convert a 16-bit floating point value to a standard JavaScript float. */
    // Fraction is 10 LSB, Exponent middle 5, and Sign the MSB
    var frac = val & 0x03ff;
    var exp = (val >> 10) & 0x1F;
    var sign = val >> 15;

    var value;
    if (exp) {
        value = 2 ** (exp - 16) * (1 + parseFloat(frac) / 2**10);
    } else {
        value = parseFloat(frac) / 2**9;
    }

    if (sign) {
        value *= -1;
    }

    return value;
}

function supplemental_scan(ind) {
    /* Create a function to return the supplement scan type from a product-specific block. */
    function inner(seq) {
        // ICD says 1->SAILS, 2->MRLE, but testing on 2020-08-17 makes this seem inverted
        // given what's being reported by sites in the GSM.
        const scanTypes = {
            0: 'Non-supplemental scan',
            2: 'SAILS scan',
            1: 'MRLE scan'
        };
        return scanTypes[(seq[ind] & 0x001F)] || 'Unknown';
    }
    return inner;
}

function _hex_string_to_decimal(hexString) {
    hexString = hexString.replace('0x', '');
    return parseInt(hexString, 16);
}
function _decimal_to_hex(decimal) {
    var hex = decimal.toString(16);
    return `0x${hex}`;
}

function _check_property_exists(obj, property) {
    if (Array.isArray(property)) {
        for (var i in property) {
            if (!obj.hasOwnProperty(property[i])) {
                obj[property[i]] = [];
            }
        }
    } else {
        if (!obj.hasOwnProperty(property)) {
            obj[property] = [];
        }
    }
    return obj;
}

// Data mappers used to take packed data and turn into physical units
// Default is to use numpy array indexing to use LUT to change data bytes
// into physical values. Can also have a 'labels' attribute to give
// categorical labels
class DataMapper {
    /* Convert packed integer data into physical units. */

    constructor(num = 256) {
        // Need to find way to handle range folded
        // RANGE_FOLD = -9999
        this.RANGE_FOLD = null; // NaN;
        this.MISSING = null; // NaN;

        this.lut = new Array(num).fill(this.MISSING);
    }

    __call__(data) {
        /* Convert the values. */
        return this.lut[data];
    }
}

class DigitalMapper extends DataMapper {
    /* Maps packed integers to floats using a scale and offset from the product. */

    constructor(prod) {
        /* Initialize the mapper and the lookup table. */
        super();

        this._min_scale = 0.1;
        this._inc_scale = 0.1;
        this._min_data = 2;
        this._max_data = 255;
        this.range_fold = false;

        var min_val = two_comp16(prod.thresholds[0]) * this._min_scale;
        var inc = prod.thresholds[1] * this._inc_scale;
        var num_levels = prod.thresholds[2];

        // Generate lookup table -- sanity check on num_levels handles
        // the fact that DHR advertises 256 levels, which *includes*
        // missing, differing from other products
        num_levels = Math.min(num_levels, this._max_data - this._min_data + 1);
        for (var i = 0; i < num_levels; i++) {
            this.lut[i + this._min_data] = min_val + i * inc;
        }
    }
}

class DigitalRefMapper extends DigitalMapper {
    /* Mapper for digital reflectivity products. */

    constructor(prod) {
        super(prod);
        this.units = 'dBZ';
    }
}

class DigitalVelMapper extends DigitalMapper {
    /* Mapper for digital velocity products. */

    constructor(prod) {
        super(prod);
        this.units = 'm/s';
        this.range_fold = true;
    }
}

class DigitalSPWMapper extends DigitalMapper {
    /* Mapper for digital spectrum width products. */

    constructor(prod) {
        super(prod);
        this._min_data = 129;
        // ICD says up to 152, but also says max value is 19, which implies 129 + 19/0.5 -> 167
        this._max_data = 167;
    }
}

class PrecipArrayMapper extends DigitalMapper {
    /* Mapper for precipitation array products. */

    constructor(prod) {
        super(prod);
        this._inc_scale = 0.001;
        this._min_data = 1;
        this._max_data = 254;
        this.units = 'dBA';
    }
}

class DigitalStormPrecipMapper extends DigitalMapper {
    /* Mapper for digital storm precipitation products. */

    constructor(prod) {
        super(prod);
        this.units = 'inches';
        this._inc_scale = 0.01;
    }
}

class DigitalVILMapper extends DataMapper {
    // Mapper for digital VIL products.
    constructor(prod) {
        super();
        var lin_scale = float16(prod.thresholds[0]);
        var lin_offset = float16(prod.thresholds[1]);
        var log_start = prod.thresholds[2];
        var log_scale = float16(prod.thresholds[3]);
        var log_offset = float16(prod.thresholds[4]);

        // VIL is allowed to use 2 through 254 inclusive. 0 is thresholded,
        // 1 is flagged, and 255 is reserved
        var ind = new Array(255).fill().map((_, i) => i);
        this.lut[2] = (ind[2] - lin_offset) / lin_scale;
        for (var i = 3; i < log_start; i++) {
            this.lut[i] = (ind[i] - lin_offset) / lin_scale;
        }
        for (var i = log_start; i < ind.length - 1; i++) {
            this.lut[i] = Math.exp((ind[i] - log_offset) / log_scale);
        }
        // this.lut.set((ind.slice(2, log_start).map((val) => (val - lin_offset) / lin_scale)), 2);
        // this.lut.set((ind.slice(log_start).map((val) => Math.exp((val - log_offset) / log_scale))), log_start);
    }
}

class DigitalEETMapper extends DataMapper {
    /* Mapper for digital echo tops products. */

    constructor(prod) {
        super();
        var data_mask = prod.thresholds[0];
        var scale = prod.thresholds[1];
        var offset = prod.thresholds[2];
        var topped_mask = prod.thresholds[3];
        this.topped_lut = new Array(256).fill(false);
        for (var i = 2; i < 256; i++) {
            this.lut[i] = ((i & data_mask) - offset) / scale;
            this.topped_lut[i] = Boolean(i & topped_mask);
        }
        this.topped_lut = new Float32Array(this.topped_lut);
    }

    __call__(data_vals) {
        /* Convert the data values. */
        return [this.lut[data_vals], this.topped_lut[data_vals]];
    }
}

class GenericDigitalMapper extends DataMapper {
    /*
    * Maps packed integers to floats using a scale and offset from the product.
    * Also handles special data flags.
    */
    constructor(prod) {
        /* Initialize the mapper by pulling out all the information from the product. */
        // Need to treat this value as unsigned, so we can use the full 16-bit range. This
        // is necessary at least for the DPR product, otherwise it has a value of -1.
        var max_data_val = prod.thresholds[5] & 0xFFFF;

        // Values will be [0, max] inclusive, so need to add 1 to max value to get proper size.
        super(max_data_val + 1);

        var scale = float32(prod.thresholds[0], prod.thresholds[1]);
        var offset = float32(prod.thresholds[2], prod.thresholds[3]);
        var leading_flags = prod.thresholds[6];
        var trailing_flags = prod.thresholds[7];

        if (leading_flags > 1) {
            this.lut[1] = this.RANGE_FOLD;
        }

        // Need to add 1 to the end of the range so that it's inclusive
        for (var i = leading_flags; i < max_data_val - trailing_flags + 1; i++) {
            this.lut[i] = (i - offset) / scale;
        }
    }
}

class DigitalHMCMapper extends DataMapper {
    /*
    * Mapper for hydrometeor classification products.
    * Handles assigning string labels based on values.
    */

    constructor(prod) {
        super();
        this.labels = ['ND', 'BI', 'GC', 'IC', 'DS', 'WS', 'RA', 'HR', 'BD', 'GR', 'HA', 'LH', 'GH', 'UK', 'RF'];
        for (let i = 10; i < 256; i++) {
            this.lut[i] = Math.floor(i / 10);
        }
        this.lut[150] = this.RANGE_FOLD;
    }
}

class EDRMapper extends DataMapper {
    /* Mapper for eddy dissipation rate products. */

    constructor(prod) {
        /* Initialize the mapper based on the product. */
        var data_levels = prod.thresholds[2];
        var scale = prod.thresholds[0] / 1000.0;
        var offset = prod.thresholds[1] / 1000.0;
        var leading_flags = prod.thresholds[3];
        super(data_levels);
        for (var i = leading_flags; i < data_levels; i++) {
            this.lut[i] = scale * i + offset;
        }
    }
}

class LegacyMapper extends DataMapper {
    constructor(prod) {
        super();
        this.lut_names = ['Blank', 'TH', 'ND', 'RF', 'BI', 'GC', 'IC', 'GR', 'WS', 'DS', 'RA', 'HR', 'BD', 'HA', 'UK'];
        this.labels = [];
        this.lut = [];
        for (let t of prod.thresholds) {
            let codes = t >> 8, val = t & 0xFF;
            let label = '';
            if (codes >> 7) {
                label = this.lut_names[val];
                if (label in ['Blank', 'TH', 'ND']) {
                    val = this.MISSING;
                } else if (label == 'RF') {
                    val = this.RANGE_FOLD;
                }
            } else if (codes >> 6) {
                val *= 0.01;
                label = `${val.toFixed(2)}`;
            } else if (codes >> 5) {
                val *= 0.05;
                label = `${val.toFixed(2)}`;
            } else if (codes >> 4) {
                val *= 0.1;
                label = `${val.toFixed(1)}`;
            }
            if (codes & 0x1) {
                val *= -1;
                label = '-' + label;
            } else if ((codes >> 1) & 0x1) {
                label = '+' + label;
            }
            if ((codes >> 2) & 0x1) {
                label = '<' + label;
            } else if ((codes >> 3) & 0x1) {
                label = '>' + label;
            }
            if (!label) {
                label = String(val);
            }
            this.lut.push(val);
            this.labels.push(label);
        }
    }
}

class NEXRADLevel3File {
    constructor (fileBuffer) {
        this._setup_packet_map();

        var fobj = fileBuffer;
        // var fobj = fs.readFileSync(filename);
        // const request = require('sync-request');
        // var fobj = request('GET', filename).getBody();

        // just read in the entire set of data at once
        this._buffer = new IOBuffer(fobj);
        this.filename = 'test_for_now'; // filename;

        // pop off the WMO header if we find it
        this._process_wmo_header();

        // pop off last 4 bytes if necessary
        this._process_end_bytes();

        // set up places to store data and metadata
        this.metadata = {};

        // handle free text message products that are pure text
        if (this.wmo_code == 'NOUS') {
            this.header = null;
            this.prod_desc = null;
            this.thresholds = null;
            this.depVals = null;
            this.product_name = 'Free Text Message';
            this.text = this._buffer.read_ascii();
            return;
        }

        // decompress the data if necessary, and if so, pop off new header
        this._buffer = new IOBuffer(this._buffer.read_func(zlib_decompress_all_frames));
        this._process_wmo_header();

        // check for empty product
        if (this._buffer.__len__() == 0) {
            console.warn(`Empty product! ${this.filename}`);
            return;
        }

        // unpack the message header and the product description block
        var msg_start = this._buffer.set_mark();
        this.header = this._buffer.read_struct(header_fmt);

        if (!this._buffer.check_remains(this.header.msg_len - _structure_size(header_fmt))) {
            console.warn(`Product contains an unexpected amount of data remaining -- have: ${this._buffer.length - this._buffer._offset}, expected: ${this.header.msg_len - _structure_size(header_fmt)}. This product may not parse correctly.`);
        }

        // Handle GSM and jump out
        if (this.header.code == 2) {
            this.gsm = this._buffer.read_struct(gsm_fmt);
            this.product_name = 'General Status Message';
            console.assert(this.gsm.divider == -1);
            if (this.gsm.block_len > 82) {
                // Due to the way the structures read it in, one bit from the count needs
                // to be popped off and added as the supplemental cut status for the 25th
                // elevation cut.
                var more = this._buffer.read_struct(additional_gsm_fmt);
                var cut_count = more.supplemental_cut_count;
                more.supplemental_cut_map2.push(Boolean(cut_count & 0x1));
                this.gsm_additional = {...more, supplemental_cut_count: cut_count >> 1};
                console.assert(this.gsm.block_len == 178);
            } else {
                console.assert(this.gsm.block_len == 82);
            }
            return;
        }

        // Convert thresholds and dependent values to lists of values
        this.prod_desc = this._buffer.read_struct(prod_desc_fmt);
        this.thresholds = Array.from({length: 16}, (_, i) => this.prod_desc[`thr${i+1}`]);
        this.depVals = Array.from({length: 10}, (_, i) => this.prod_desc[`dep${i+1}`]);

        // Set up some time/location metadata
        this.metadata['msg_time'] = _julian_and_millis_to_date(this.header.date, this.header.time * 1000);
        this.metadata['vol_time'] = _julian_and_millis_to_date(this.prod_desc.vol_date, this.prod_desc.vol_start_time * 1000);
        this.metadata['prod_time'] = _julian_and_millis_to_date(this.prod_desc.prod_gen_date, this.prod_desc.prod_gen_time * 1000);
        this.lat = this.prod_desc.lat * 0.001;
        this.lon = this.prod_desc.lon * 0.001;
        this.height = this.prod_desc.height;

        // Handle product-specific blocks. Default to compression and elevation angle
        // Also get other product specific information, like name,
        // maximum range, and how to map data bytes to values
        const defaultValues = ['Unknown Product', 230.0, LegacyMapper, [
            ['el_angle', scaled_elem(2, 0.1)],
            ['compression', 7],
            ['uncompressed_size', combine_elem(8, 9)],
            ['defaultVals', 0]
        ]];
        var [product_name, max_range, mapper, meta] = prod_spec_map[this.header.code] || defaultValues;
        this.product_name = product_name;
        this.max_range = max_range;

        for (var [name, block] of meta) {
            if (typeof block === 'function') {
                this.metadata[name] = block(this.depVals);
            } else {
                this.metadata[name] = this.depVals[block];
            }
        }

        // Now that we have the header, we have everything needed to make tables
        // Store as class that can be called
        this.map_data = new mapper(this);

        // Process compression if indicated. We need to fail
        // gracefully here since we default to it being on
        if (this.metadata.compression || false) {
            try {
                function bz2_decompress(buffer) {
                    // skip 32 bits 'BZh9' header
                    return bzip.decodeBlock(buffer, 32);
                }
                var comp_start = this._buffer.set_mark();
                var decomp_data = this._buffer.read_func(bz2_decompress);
                this._buffer.splice(comp_start, decomp_data);
                console.assert(this._buffer.check_remains(this.metadata['uncompressed_size']))
            } catch (e) {
                // Compression didn't work, so we just assume it wasn't actually compressed.
                console.warn(e);
            }
        }

        // Unpack the various blocks, if present. The factor of 2 converts from
        // 'half-words' to bytes
        // Check to see if this is one of the "special" products that uses
        // header-free blocks and re-assigns the offsets
        if (standalone_tabular.includes(this.header.code)) {
            if (this.prod_desc.sym_off) {
                // For standalone tabular alphanumeric, symbology offset is
                // actually tabular
                this._unpack_tabblock(msg_start, 2 * this.prod_desc.sym_off, false);
            }
            if (this.prod_desc.graph_off) {
                // Offset seems to be off by 1 from where we're counting, but
                // it's not clear why.
                this._unpack_standalone_graphblock(msg_start, 2 * (this.prod_desc.graph_off - 1));
            }
        } else if (this.header.code == 74) {
            // Need special handling for (old) radar coded message format
            this._unpack_rcm(msg_start, 2 * this.prod_desc.sym_off);
        } else {
            if (this.prod_desc.sym_off) {
                this._unpack_symblock(msg_start, 2 * this.prod_desc.sym_off);
            }
            if (this.prod_desc.graph_off) {
                this._unpack_graphblock(msg_start, 2 * this.prod_desc.graph_off);
            }
            if (this.prod_desc.tab_off) {
                this._unpack_tabblock(msg_start, 2 * this.prod_desc.tab_off);
            }
        }
        // console.log(this.product_name);
    }

    _unpack_symblock(start, offset) {
        this._buffer.jump_to(start, offset);
        var blk = this._buffer.read_struct(sym_block_fmt);

        this.sym_block = [];
        console.assert(blk.divider == -1, `Bad divider for symbology block: ${blk.divider} should be -1`);
        console.assert(blk.block_id == 1, `Bad block ID for symbology block: ${blk.block_id} should be 1`);

        for (var _ = 0; _ < blk.nlayer; _++) {
            var layer_hdr = this._buffer.read_struct(sym_layer_fmt);
            console.assert(layer_hdr.divider == -1);
            var layer = [];
            this.sym_block.push(layer);
            var layer_start = this._buffer.set_mark();
            while (this._buffer.offset_from(layer_start) < layer_hdr['length']) {
                var packet_code = this._buffer.read_int(2, 'big', false);
                if (this.packet_map.hasOwnProperty(packet_code)) {
                    layer.push(this.packet_map[packet_code].apply(this, [packet_code, true]));
                } else {
                    var packet_code_to_print = packet_code;
                    if (packet_code > 29) {
                        packet_code_to_print = _decimal_to_hex(packet_code);
                    }
                    console.warn(`${this.filename}: Unknown symbology packet type ${packet_code_to_print}.`);
                    this._buffer.jump_to(layer_start, layer_hdr['length']);
                }
            }
            console.assert(this._buffer.offset_from(layer_start) == layer_hdr['length']);
        }
    }

    _unpack_graphblock(start, offset) {
        this._buffer.jump_to(start, offset);
        var hdr = this._buffer.read_struct(graph_block_fmt);
        console.assert(hdr.divider == -1, `Bad divider for graphical block: ${hdr.divider} should be -1`);
        console.assert(hdr.block_id == 2, `Bad block ID for graphical block: ${hdr.block_id} should be 2`);
        this.graph_pages = [];
        for (var page = 0; page < hdr.num_pages; page++) {
            var page_num = this._buffer.read_int(2, 'big', false);
            console.assert(page + 1 == page_num);
            var page_size = this._buffer.read_int(2, 'big', false);
            var page_start = this._buffer.set_mark();
            var packets = [];
            while (this._buffer.offset_from(page_start) < page_size) {
                var packet_code = this._buffer.read_int(2, 'big', false);
                if (this.packet_map.hasOwnProperty(packet_code)) {
                    packets.push(this.packet_map[packet_code].apply(this, [packet_code, false]));
                } else {
                    var packet_code_to_print = packet_code;
                    if (packet_code > 29) {
                        packet_code_to_print = _decimal_to_hex(packet_code);
                    }
                    console.warn(`${this.filename}: Unknown graphical packet type ${packet_code_to_print}.`);
                    this._buffer.skip(page_size);
                }
            }
            this.graph_pages.push(packets);
        }
    }
    _unpack_standalone_graphblock(start, offset) {
        this._buffer.jump_to(start, offset);
        var packets = [];
        while (!this._buffer.at_end()) {
            var packet_code = this._buffer.read_int(2, 'big', false);
            if (this.packet_map.hasOwnProperty(packet_code)) {
                packets.push(this.packet_map[packet_code].apply(this, [packet_code, false]));
            } else {
                var packet_code_to_print = packet_code;
                if (packet_code > 29) {
                    packet_code_to_print = _decimal_to_hex(packet_code);
                }
                console.warn(`${this.filename}: Unknown standalone graphical packet type ${packet_code_to_print}.`);
                // Assume next 2 bytes is packet length and try skipping
                var num_bytes = this._buffer.read_int(2, 'big', false);
                this._buffer.skip(num_bytes);
            }
        }
        this.graph_pages = [packets];
    }
    _unpack_tabblock(start, offset, have_header = true) {
        this._buffer.jump_to(start, offset);
        var block_start = this._buffer.set_mark();

        // Read the header and validate if needed
        if (have_header) {
            var header = this._buffer.read_struct(tab_header_fmt);
            console.assert(header.divider == -1);
            console.assert(header.block_id == 3);

            // Read off secondary message and product description blocks,
            // but as far as I can tell, all we really need is the text that follows
            this._buffer.read_struct(header_fmt);
            this._buffer.read_struct(prod_desc_fmt);
        }

        // Get the start of the block with number of pages and divider
        var blk = this._buffer.read_struct(tab_block_fmt);
        console.assert(blk.divider == -1);

        // Read the pages line by line, break pages on a -1 character count
        this.tab_pages = [];
        for (var _ = 0; _ < blk.num_pages; _++) {
            var lines = [];
            var num_chars = this._buffer.read_int(2, 'big', true);
            while (num_chars != -1) {
                lines.push(this._buffer.read_ascii(num_chars));
                num_chars = this._buffer.read_int(2, 'big', true);
            }
            this.tab_pages.push(lines.join('\n'));
        }

        if (have_header) {
            console.assert(this._buffer.offset_from(block_start) == header.block_len);
        }
    }
    _unpack_rcm(start, offset) {
        this._buffer.jump_to(start, offset);
        var header = this._buffer.read_ascii(10);
        console.assert(header == '1234 ROBUU');
        var text_data = this._buffer.read_ascii();
        var end = 0;
        // Appendix B of ICD tells how to interpret this stuff, but that just
        // doesn't seem worth it.
        for (var [marker, name] of [['AA', 'ref'], ['BB', 'vad'], ['CC', 'remarks']]) {
            var start = text_data.indexOf('/NEXR' + marker, end);
            // For part C the search for end fails, but returns -1, which works
            end = text_data.indexOf('/END' + marker, start);
            this['rcm_' + name] = text_data.slice(start, end);
        }
    }

    _process_wmo_header() {
        // read off the WMO header if necessary

        // remove invalid characters
        // https://stackoverflow.com/a/12754325
        var data = this._buffer.get_next(64).toString('UTF-8').replace(/\uFFFD/g, '');
        var match = data.match(wmo_finder);
        if (match) {
            this.wmo_code = match[1];
            this.siteID = match[2];
            this._buffer.skip(match.index + match[0].length);
        } else {
            this.wmo_code = '';
        }
    }
    _process_end_bytes() {
        var check_bytes = this._buffer.buffer.slice(-4, -1);
        if (check_bytes.equals(Buffer.from([13, 13, 10])) || check_bytes.equals(Buffer.from([255, 255, 10]))) {
            this._buffer.truncate(4);
        }
    }

    pos_scale(is_sym_block) {
        /* Scale of the position information in km. */
        return is_sym_block ? 0.25 : 1;
    }

    _read_trends() {
        var [num_vols, latest] = this._buffer.read(2);
        var vals = Array.from({length: num_vols}, () => this._buffer.read_int(2, 'big', true));

        // Wrap the circular buffer so that latest is last
        return vals.slice(latest).concat(vals.slice(0, latest));
    }

    _unpack_rle_data(data) {
        // Unpack Run-length encoded data
        var unpacked = [];
        for (var i = 0; i < data.length; i++) {
            var run = data[i];
            var num = run >> 4;
            var val = run & 0x0F;
            for (var j = 0; j < num; j++) {
                unpacked.push(val);
            }
        }
        return unpacked;
    }

    _setup_packet_map() {
        this.packet_map = {
            1: this._unpack_packet_uniform_text,
            2: this._unpack_packet_special_text_symbol,
            3: this._unpack_packet_special_graphic_symbol,
            4: this._unpack_packet_wind_barbs,
            6: this._unpack_packet_linked_vector,
            8: this._unpack_packet_uniform_text,
            // // 9: this._unpack_packet_linked_vector,
            10: this._unpack_packet_vector,
            11: this._unpack_packet_special_graphic_symbol,
            12: this._unpack_packet_special_graphic_symbol,
            13: this._unpack_packet_special_graphic_symbol,
            14: this._unpack_packet_special_graphic_symbol,
            15: this._unpack_packet_special_graphic_symbol,
            16: this._unpack_packet_digital_radial,
            17: this._unpack_packet_digital_precipitation,
            18: this._unpack_packet_digital_precipitation,
            19: this._unpack_packet_special_graphic_symbol,
            20: this._unpack_packet_special_graphic_symbol,
            21: this._unpack_packet_cell_trend,
            22: this._unpack_packet_trend_times,
            23: this._unpack_packet_scit,
            24: this._unpack_packet_scit,
            25: this._unpack_packet_special_graphic_symbol,
            26: this._unpack_packet_special_graphic_symbol,
            // 28: this._unpack_packet_generic,
            // 29: this._unpack_packet_generic,
            0x0802: this._unpack_packet_contour_color,
            0x0E03: this._unpack_packet_linked_contour,
            0xaf1f: this._unpack_packet_radial_data,
            0xba07: this._unpack_packet_raster_data
        }
    }

    _unpack_packet_radial_data(code, in_sym_block) {
        const hdr_fmt = [
            ['ind_first_bin', 'H'], ['nbins', 'H'],
            ['i_center', 'h'], ['j_center', 'h'],
            ['scale_factor', 'h'], ['num_rad', 'H']
        ];
        const rad_fmt = [
            ['num_hwords', 'H'], ['start_angle', 'h'], ['angle_delta', 'h']
        ];
        var hdr = this._buffer.read_struct(hdr_fmt);
        var rads = [];
        for (var _ = 0; _ < hdr.num_rad; _++) {
            var rad = this._buffer.read_struct(rad_fmt);
            var start_az = rad.start_angle * 0.1;
            var end_az = start_az + rad.angle_delta * 0.1;
            rads.push([start_az, end_az, this._unpack_rle_data(this._buffer.read_binary(2 * rad.num_hwords))]);
        }
        var [start, end, vals] = rads.reduce((acc, val) => (val.forEach((v, i) => acc[i].push(v)), acc), [[], [], []]);
        return {
            'start_az': _copy(start),
            'end_az': _copy(end),
            'data': _copy(vals),
            'center': [hdr.i_center * this.pos_scale(in_sym_block), hdr.j_center * this.pos_scale(in_sym_block)],
            'gate_scale': hdr.scale_factor * 0.001,
            'first': hdr.ind_first_bin
        }
    }

    _unpack_packet_raster_data(code, in_sym_block) {
        const hdr_fmt = [
            ['code', 'L'],
            ['i_start', 'h'], ['j_start', 'h'], // start in km/4
            ['xscale_int', 'h'], ['xscale_frac', 'h'],
            ['yscale_int', 'h'], ['yscale_frac', 'h'],
            ['num_rows', 'h'], ['packing', 'h']
        ];
        var hdr = this._buffer.read_struct(hdr_fmt);
        console.assert(hdr.code == 0x800000C0);
        console.assert(hdr.packing == 2);
        var rows = [];
        for (var _ = 0; _ < hdr.num_rows; _++) {
            var num_bytes = this._buffer.read_int(2, 'big', false);
            rows.push(this._unpack_rle_data(this._buffer.read_binary(num_bytes)));
        }
        return {
            'start_x': hdr.i_start * hdr.xscale_int,
            'start_y': hdr.j_start * hdr.yscale_int,
            'data': rows
        }
    }

    _unpack_packet_linked_contour(code, in_sym_block) {
        // Check for initial point indicator
        console.assert(this._buffer.read_int(2, 'big', false) == 0x8000);

        var scale = this.pos_scale(in_sym_block);
        var startx = this._buffer.read_int(2, 'big', true) * scale;
        var starty = this._buffer.read_int(2, 'big', true) * scale;
        var vectors = [[startx, starty]];
        var num_bytes = this._buffer.read_int(2, 'big', false);
        var pos = this._buffer.read_binary(num_bytes / 2, '>h').map(p => p * scale);
        for (let i = 0; i < pos.length; i += 2) {
            vectors.push([pos[i], pos[i + 1]]);
        }
        return {
            'vectors': vectors
        };
    }

    _unpack_packet_contour_color(code, in_sym_block) {
        // Check for color value indicator
        console.assert(this._buffer.read_int(2, 'big', false) == 0x0002);

        // Read and return value (level) of contour
        return {
            'color': this._buffer.read_int(2, 'big', false)
        };
    }

    _unpack_packet_wind_barbs(code, in_sym_block) {
        // Figure out how much to read
        var num_bytes = this._buffer.read_int(2, 'big', true);
        var packet_data_start = this._buffer.set_mark();
        var ret = {};

        // Read while we have data, then return
        while (this._buffer.offset_from(packet_data_start) < num_bytes) {
            ret = _check_property_exists(ret, ['color', 'x', 'y', 'direc', 'speed']);

            ret['color'].push(this._buffer.read_int(2, 'big', true));
            ret['x'].push(this._buffer.read_int(2, 'big', true) * this.pos_scale(in_sym_block));
            ret['y'].push(this._buffer.read_int(2, 'big', true) * this.pos_scale(in_sym_block));
            ret['direc'].push(this._buffer.read_int(2, 'big', true));
            ret['speed'].push(this._buffer.read_int(2, 'big', true));
        }
        return ret;
    }

    _unpack_packet_linked_vector(code, in_sym_block) {
        var num_bytes = this._buffer.read_int(2, 'big', true);
        var value;
        if (code == 9) {
            value = this._buffer.read_int(2, 'big', true);
            num_bytes -= 2;
        } else {
            value = null;
        }
        var scale = this.pos_scale(in_sym_block);
        var pos = this._buffer.read_binary(num_bytes / 2, '>h').map(p => p * scale);
        var vectors = [...Array(pos.length / 2).keys()].map(i => [pos[i * 2], pos[i * 2 + 1]]);
        return {
            'vectors': vectors,
            'color': value
        };
    }

    _unpack_packet_scit(code, in_sym_block) {
        var num_bytes = this._buffer.read_int(2, 'big', false);
        var packet_data_start = this._buffer.set_mark();
        var ret = {};
        while (this._buffer.offset_from(packet_data_start) < num_bytes) {
            var next_code = this._buffer.read_int(2, 'big', false);
            if (!this.packet_map.hasOwnProperty(next_code)) {
                console.warn(`${this.filename}: Unknown packet in SCIT ${next_code}.`);
                this._buffer.jump_to(packet_data_start, num_bytes);
                return ret;
            } else {
                var next_packet = this.packet_map[next_code].apply(this, [next_code, in_sym_block]);
                if (next_code == 6) {
                    ret = _check_property_exists(ret, 'track');
                    ret['track'].push(next_packet['vectors']);
                } else if (next_code == 25) {
                    ret = _check_property_exists(ret, 'STI Circle');
                    ret['STI Circle'].push(next_packet);
                } else if (next_code == 2) {
                    ret = _check_property_exists(ret, 'markers');
                    ret['markers'].push(next_packet);
                } else {
                    console.warn(`${this.filename}: Unsupported packet in SCIT ${next_code}.`);
                    ret = _check_property_exists(ret, 'data');
                    ret['data'].push(next_packet);
                }
            }
            ret = reduce_lists(ret);
            return ret;
        }
    }

    _unpack_packet_special_text_symbol(code, in_sym_block) {
        var d = this._unpack_packet_uniform_text(code, in_sym_block);

        // Translate special characters to their meaning
        const symbol_map = {
            '!': 'past storm position',
            '"': 'current storm position',
            '#': 'forecast storm position',
            '$': 'past MDA position',
            '%': 'forecast MDA position',
            ' ': null
        };
        var ret = {};

        // Use this meaning as the key in the returned packet
        for (var i = 0; i < d['text'].length; i++) {
            var c = d['text'][i];
            if (!symbol_map.hasOwnProperty(c)) {
                console.warn(`${this.filename}: Unknown special symbol ${c}/${c.charCodeAt(0)}.`);
            } else {
                var key = symbol_map[c];
                if (key) {
                    ret[key] = [d['x'], d['y']];
                }
            }
        }
        delete d['text'];

        return ret;
    }

    _unpack_packet_digital_precipitation(code, in_sym_block) {
        // Read off a couple of unused spares
        this._buffer.read_int(2, 'big', false);
        this._buffer.read_int(2, 'big', false);

        // Get the size of the grid
        var lfm_boxes = this._buffer.read_int(2, 'big', false);
        var num_rows = this._buffer.read_int(2, 'big', false);
        var rows = [];

        // Read off each row and decode the RLE data
        for (var _ = 0; _ < num_rows; _++) {
            var row_num_bytes = this._buffer.read_int(2, 'big', false);
            var row_bytes = this._buffer.read_binary(row_num_bytes);
            var row;
            if (code == 18) {
                row = this._unpack_rle_data(row_bytes);
            } else {
                row = [];
                for (var i = 0; i < row_bytes.length; i += 2) {
                    var run = row_bytes[i];
                    var level = row_bytes[i + 1];
                    for (let j = 0; j < run; j++) {
                        row.push(level);
                    }
                }
            }
            console.assert(row.length == lfm_boxes);
            rows.push(row);
        }

        return {
            'data': rows
        };
    }

    _unpack_packet_cell_trend(code, in_sym_block) {
        const code_map = ['Cell Top', 'Cell Base', 'Max Reflectivity Height',
            'Probability of Hail', 'Probability of Severe Hail',
            'Cell-based VIL', 'Maximum Reflectivity',
            'Centroid Height'];
        const code_scales = [100, 100, 100, 1, 1, 1, 1, 100];
        var num_bytes = this._buffer.read_int(2, 'big', true);
        var packet_data_start = this._buffer.set_mark();
        var cell_id = this._buffer.read_ascii(2);
        var x = this._buffer.read_int(2, 'big', true) * this.pos_scale(in_sym_block);
        var y = this._buffer.read_int(2, 'big', true) * this.pos_scale(in_sym_block);
        var ret = {'id': cell_id, 'x': x, 'y': y};
        while (this._buffer.offset_from(packet_data_start) < num_bytes) {
            var code = this._buffer.read_int(2, 'big', true);
            var key, scale;
            try {
                var ind = code - 1;
                key = code_map[ind];
                scale = code_scales[ind];
            } catch (e) {
                console.warn(`${this.filename}: Unsupported trend code ${code}.`);
                key = 'Unknown';
                scale = 1;
            }
            var vals = this._read_trends();
            if (code == 1 || code == 2) {
                ret[key + ' Limited'] = vals.map(v => v > 700);
                vals = vals.map(v => v > 700 ? v - 1000 : v);
            }
            ret[key] = vals.map(v => v * scale);
        }

        return ret;
    }

    _unpack_packet_trend_times(code, in_sym_block) {
        this._buffer.read_int(2, 'big', true)  // number of bytes, not needed to process
        return {
            'times': this._read_trends()
        };
    }

    _unpack_packet_vector(code, in_sym_block) {
        var num_bytes = this._buffer.read_int(2, 'big', true);
        var value;
        if (code == 10) {
            value = this._buffer.read_int(2, 'big', true);
            num_bytes -= 2;
        } else {
            value = null;
        }
        var scale = this.pos_scale(in_sym_block);
        var pos = this._buffer.read_binary(num_bytes / 2, '>h').map(p => p * scale);
        var vectors = Array.from({ length: pos.length / 4 }, (_, i) => [pos[i * 4], pos[i * 4 + 1], pos[i * 4 + 2], pos[i * 4 + 3]]);
        return {
            'vectors': vectors,
            'color': value
        };
    }

    _unpack_packet_uniform_text(code, in_sym_block) {
        // By not using a struct, we can handle multiple codes
        var num_bytes = this._buffer.read_int(2, 'big', false);
        var value, read_bytes;
        if (code == 8) {
            value = this._buffer.read_int(2, 'big', false);
            read_bytes = 6;
        } else {
            value = null;
            read_bytes = 4;
        }
        var i_start = this._buffer.read_int(2, 'big', true);
        var j_start = this._buffer.read_int(2, 'big', true);

        // Text is what remains beyond what's been read, not including byte count
        var text = this._buffer.read_ascii(num_bytes - read_bytes);
        return {
            'x': i_start * this.pos_scale(in_sym_block),
            'y': j_start * this.pos_scale(in_sym_block),
            'color': value,
            'text': text
        };
    }

    _unpack_packet_special_graphic_symbol(code, in_sym_block) {
        const type_map = {
            3: 'Mesocyclone', 11: '3D Correlated Shear', 12: 'TVS',
            26: 'ETVS', 13: 'Positive Hail', 14: 'Probable Hail',
            15: 'Storm ID', 19: 'HDA', 25: 'STI Circle'
        };
        const point_feature_map = {
            1: 'Mesocyclone (ext.)', 3: 'Mesocyclone',
            5: 'TVS (Ext.)', 6: 'ETVS (Ext.)', 7: 'TVS',
            8: 'ETVS', 9: 'MDA', 10: 'MDA (Elev.)', 11: 'MDA (Weak)'
        };

        // Read the number of bytes and set a mark for sanity checking
        var num_bytes = this._buffer.read_int(2, 'big', false);
        var packet_data_start = this._buffer.set_mark();

        var scale = this.pos_scale(in_sym_block);

        // Loop over the bytes we have
        var ret = {};

        while (this._buffer.offset_from(packet_data_start) < num_bytes) {
            // Read position
            ret = _check_property_exists(ret, ['x', 'y']);
            ret['x'].push(this._buffer.read_int(2, 'big', true) * scale);
            ret['y'].push(this._buffer.read_int(2, 'big', true) * scale);

            // Handle any types that have additional info
            if ([3, 11, 25].includes(code)) {
                ret = _check_property_exists(ret, 'radius');
                ret['radius'].push(this._buffer.read_int(2, 'big', true) * scale);
            } else if (code == 15) {
                ret = _check_property_exists(ret, 'id');
                ret['id'].push(this._buffer.read_ascii(2));
            } else if (code == 19) {
                ret = _check_property_exists(ret, ['POH', 'POSH', 'Max Size']);
                ret['POH'].push(this._buffer.read_int(2, 'big', true));
                ret['POSH'].push(this._buffer.read_int(2, 'big', true));
                ret['Max Size'].push(this._buffer.read_int(2, 'big', false));
            } else if (code == 20) {
                var kind = this._buffer.read_int(2, 'big', false);
                var attr = this._buffer.read_int(2, 'big', false);
                if (kind < 5 || kind > 8) {
                    ret = _check_property_exists(ret, 'radius');
                    ret['radius'].push(attr * scale);
                }

                if (!point_feature_map.hasOwnProperty(kind)) {
                    console.warn(`${this.filename}: Unknown graphic symbol point kind ${kind}.`);
                    ret = _check_property_exists(ret, 'type');
                    ret['type'].push(`Unknown ${kind}`);
                } else {
                    ret = _check_property_exists(ret, 'type');
                    ret['type'].push(point_feature_map[kind]);
                }
            }
        }

        // Map the code to a name for this type of symbol
        if (code != 20) {
            if (!type_map.hasOwnProperty(code)) {
                console.warn(`${this.filename}: Unknown graphic symbol type ${code}.`);
                ret = _check_property_exists(ret, 'type');
                ret['type'] = 'Unknown';
            } else {
                ret = _check_property_exists(ret, 'type');
                ret['type'] = type_map[code];
            }
        }

        // Check and return
        console.assert(this._buffer.offset_from(packet_data_start) == num_bytes);

        // Reduce dimensions of lists if possible
        ret = reduce_lists(ret);

        return ret;
    }

    _unpack_packet_digital_radial(code, in_sym_block) {
        var hdr = this._buffer.read_struct(digital_radial_hdr_fmt);
        var rads = [];
        for (var _ = 0; _ < hdr.num_rad; _++) {
            var rad = this._buffer.read_struct(digital_radial_fmt);
            var start_az = rad.start_angle * 0.1;
            var end_az = start_az + rad.angle_delta * 0.1;
            rads.push([start_az, end_az, this._buffer.read_binary(rad.num_bytes)]);
        }
        var [start, end, vals] = rads.reduce((acc, val) => (val.forEach((v, i) => acc[i].push(v)), acc), [[], [], []]);
        return {
            'start_az': start,
            'end_az': end,
            'data': vals,
            'center': [
                hdr.i_center * this.pos_scale(in_sym_block),
                hdr.j_center * this.pos_scale(in_sym_block)
            ],
            'gate_scale': hdr.scale_factor * 0.001,
            'first': hdr.ind_first_bin,
            'num_bins': hdr.nbins
        };
    }
}

const wmo_finder = /((?:NX|SD|NO)US)\d{2}[\s\w\d]+\w*(\w{3})\r\r\n/;
const header_fmt = [
    ['code', 'H'], ['date', 'H'], ['time', 'l'],
    ['msg_len', 'L'], ['src_id', 'h'], ['dest_id', 'h'],
    ['num_blks', 'H']
];
// See figure 3-17 in 2620001 document for definition of status bit fields
const gsm_fmt = [
    ['divider', 'h'], ['block_len', 'H'],
    ['op_mode', 'h', new BitField('Clear Air', 'Precip')],
    ['rda_op_status', 'h', new BitField('Spare', 'Online',
        'Maintenance Required',
        'Maintenance Mandatory',
        'Commanded Shutdown', 'Inoperable',
        'Spare', 'Wideband Disconnect')],
    ['vcp', 'h'], ['num_el', 'h'],
    ['el1', 'h', scaler(0.1)], ['el2', 'h', scaler(0.1)],
    ['el3', 'h', scaler(0.1)], ['el4', 'h', scaler(0.1)],
    ['el5', 'h', scaler(0.1)], ['el6', 'h', scaler(0.1)],
    ['el7', 'h', scaler(0.1)], ['el8', 'h', scaler(0.1)],
    ['el9', 'h', scaler(0.1)], ['el10', 'h', scaler(0.1)],
    ['el11', 'h', scaler(0.1)], ['el12', 'h', scaler(0.1)],
    ['el13', 'h', scaler(0.1)], ['el14', 'h', scaler(0.1)],
    ['el15', 'h', scaler(0.1)], ['el16', 'h', scaler(0.1)],
    ['el17', 'h', scaler(0.1)], ['el18', 'h', scaler(0.1)],
    ['el19', 'h', scaler(0.1)], ['el20', 'h', scaler(0.1)],
    ['rda_status', 'h', new BitField('Spare', 'Startup', 'Standby',
        'Restart', 'Operate',
        'Off-line Operate')],
    ['rda_alarms', 'h', new BitField('Indeterminate', 'Tower/Utilities',
        'Pedestal', 'Transmitter', 'Receiver',
        'RDA Control', 'RDA Communications',
        'Signal Processor')],
    ['tranmission_enable', 'h', new BitField('Spare', 'None',
        'Reflectivity',
        'Velocity', 'Spectrum Width',
        'Dual Pol')],
    ['rpg_op_status', 'h', new BitField('Loadshed', 'Online',
        'Maintenance Required',
        'Maintenance Mandatory',
        'Commanded shutdown')],
    ['rpg_alarms', 'h', new BitField('None', 'Node Connectivity',
        'Wideband Failure',
        'RPG Control Task Failure',
        'Data Base Failure', 'Spare',
        'RPG Input Buffer Loadshed',
        'Spare', 'Product Storage Loadshed',
        'Spare', 'Spare', 'Spare',
        'RPG/RPG Intercomputer Link Failure',
        'Redundant Channel Error',
        'Task Failure', 'Media Failure')],
    ['rpg_status', 'h', new BitField('Restart', 'Operate', 'Standby')],
    ['rpg_narrowband_status', 'h', new BitField('Commanded Disconnect',
        'Narrowband Loadshed')],
    ['h_ref_calib', 'h', scaler(0.25)],
    ['prod_avail', 'h', new BitField('Product Availability',
        'Degraded Availability',
        'Not Available')],
    ['super_res_cuts', 'h', new Bits(16)],
    ['cmd_status', 'h', new Bits(6)],
    ['v_ref_calib', 'h', scaler(0.25)],
    ['rda_build', 'h', version], ['rda_channel', 'h'],
    ['reserved', 'h'], ['reserved2', 'h'],
    ['build_version', 'h', version]
];
// Build 14.0 added more bytes to the GSM
const additional_gsm_fmt = [
    ['el21', 'h', scaler(0.1)],
    ['el22', 'h', scaler(0.1)],
    ['el23', 'h', scaler(0.1)],
    ['el24', 'h', scaler(0.1)],
    ['el25', 'h', scaler(0.1)],
    ['vcp_supplemental', 'H',
        new BitField('AVSET', 'SAILS', 'Site VCP', 'RxR Noise',
            'CBT', 'VCP Sequence', 'SPRT', 'MRLE',
            'Base Tilt', 'MPDA')],
    ['supplemental_cut_map', 'H', new Bits(16)],
    ['supplemental_cut_count', 'B'],
    ['supplemental_cut_map2', 'B', new Bits(8)],
    ['spare', '80s']
];
const prod_desc_fmt = [
    ['divider', 'h'], ['lat', 'l'], ['lon', 'l'],
    ['height', 'h'], ['prod_code', 'h'],
    ['op_mode', 'h'], ['vcp', 'h'], ['seq_num', 'h'],
    ['vol_num', 'h'], ['vol_date', 'h'],
    ['vol_start_time', 'l'], ['prod_gen_date', 'h'],
    ['prod_gen_time', 'l'], ['dep1', 'h'],
    ['dep2', 'h'], ['el_num', 'h'], ['dep3', 'h'],
    ['thr1', 'h'], ['thr2', 'h'], ['thr3', 'h'],
    ['thr4', 'h'], ['thr5', 'h'], ['thr6', 'h'],
    ['thr7', 'h'], ['thr8', 'h'], ['thr9', 'h'],
    ['thr10', 'h'], ['thr11', 'h'], ['thr12', 'h'],
    ['thr13', 'h'], ['thr14', 'h'], ['thr15', 'h'],
    ['thr16', 'h'], ['dep4', 'h'], ['dep5', 'h'],
    ['dep6', 'h'], ['dep7', 'h'], ['dep8', 'h'],
    ['dep9', 'h'], ['dep10', 'h'], ['version', 'b'],
    ['spot_blank', 'b'], ['sym_off', 'L'], ['graph_off', 'L'],
    ['tab_off', 'L']
];
const sym_block_fmt = [
    ['divider', 'h'], ['block_id', 'h'],
    ['block_len', 'L'], ['nlayer', 'H']
];
const tab_header_fmt = [
    ['divider', 'h'], ['block_id', 'h'],
    ['block_len', 'L']
];
const tab_block_fmt = [
    ['divider', 'h'], ['num_pages', 'h']
];
const sym_layer_fmt = [
    ['divider', 'h'], ['length', 'L']
];
const graph_block_fmt = [
    ['divider', 'h'], ['block_id', 'h'],
    ['block_len', 'L'], ['num_pages', 'H']
];
const standalone_tabular = [62, 73, 75, 82];
const digital_radial_hdr_fmt = [
    ['ind_first_bin', 'H'], ['nbins', 'H'],
    ['i_center', 'h'], ['j_center', 'h'],
    ['scale_factor', 'h'], ['num_rad', 'H']
];
const digital_radial_fmt = [
    ['num_bytes', 'H'], ['start_angle', 'h'],
    ['angle_delta', 'h']
];
const prod_spec_map = {
    16: ['Base Reflectivity', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    17: ['Base Reflectivity', 460., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    18: ['Base Reflectivity', 460., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    19: ['Base Reflectivity', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)],
        ['calib_const', float_elem(7, 8)]]],
    20: ['Base Reflectivity', 460., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)],
        ['calib_const', float_elem(7, 8)]]],
    21: ['Base Reflectivity', 460., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    22: ['Base Velocity', 60., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3], ['max', 4]]],
    23: ['Base Velocity', 115., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3], ['max', 4]]],
    24: ['Base Velocity', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3], ['max', 4]]],
    25: ['Base Velocity', 60., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3], ['max', 4]]],
    26: ['Base Velocity', 115., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3], ['max', 4]]],
    27: ['Base Velocity', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3], ['max', 4],
        ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)]]],
    28: ['Base Spectrum Width', 60., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3]]],
    29: ['Base Spectrum Width', 115., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3]]],
    30: ['Base Spectrum Width', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)]]],
    31: ['User Selectable Storm Total Precipitation', 230., LegacyMapper,
        [['end_hour', 0],
        ['hour_span', 1],
        ['null_product', 2],
        ['max_rainfall', scaled_elem(3, 0.1)],
        ['rainfall_begin', date_elem(4, 5)],
        ['rainfall_end', date_elem(6, 7)],
        ['bias', scaled_elem(8, 0.01)],
        ['gr_pairs', scaled_elem(5, 0.01)]]],
    32: ['Digital Hybrid Scan Reflectivity', 230., DigitalRefMapper,
        [['max', 3],
        ['avg_time', date_elem(4, 5)],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    33: ['Hybrid Scan Reflectivity', 230., LegacyMapper,
        [['max', 3], ['avg_time', date_elem(4, 5)]]],
    34: ['Clutter Filter Control', 230., LegacyMapper,
        [['clutter_bitmap', 0],
        ['cmd_map', 1],
        ['bypass_map_date', date_elem(4, 5)],
        ['notchwidth_map_date', date_elem(6, 7)]]],
    35: ['Composite Reflectivity', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    36: ['Composite Reflectivity', 460., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    37: ['Composite Reflectivity', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    38: ['Composite Reflectivity', 460., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    41: ['Echo Tops', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', scaled_elem(3, 1000)]]],  // Max in ft
    48: ['VAD Wind Profile', null, LegacyMapper,
        [['max', 3],
        ['dir_max', 4],
        ['alt_max', scaled_elem(5, 10)]]],  // Max in ft
    50: ['Cross Section Reflectivity', 230., LegacyMapper,
        [['azimuth1', scaled_elem(0, 0.1)],
        ['range1', scaled_elem(1, 0.1)],
        ['azimuth2', scaled_elem(2, 0.1)],
        ['range2', scaled_elem(3, 0.1)]]],
    51: ['Cross Section Velocity', 230., LegacyMapper,
        [['azimuth1', scaled_elem(0, 0.1)],
        ['range1', scaled_elem(1, 0.1)],
        ['azimuth2', scaled_elem(2, 0.1)],
        ['range2', scaled_elem(3, 0.1)]]],
    55: ['Storm Relative Mean Radial Velocity', 50., LegacyMapper,
        [['window_az', scaled_elem(0, 0.1)],
        ['window_range', scaled_elem(1, 0.1)],
        ['el_angle', scaled_elem(2, 0.1)],
        ['min', 3],
        ['max', 4],
        ['source', 5],
        ['height', 6],
        ['avg_speed', scaled_elem(7, 0.1)],
        ['avg_dir', scaled_elem(8, 0.1)],
        ['alert_category', 9]]],
    56: ['Storm Relative Mean Radial Velocity', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3],
        ['max', 4],
        ['source', 5],
        ['avg_speed', scaled_elem(7, 0.1)],
        ['avg_dir', scaled_elem(8, 0.1)]]],
    57: ['Vertically Integrated Liquid', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3]]],  // Max in kg / m^2
    58: ['Storm Tracking Information', 460., LegacyMapper,
        [['num_storms', 3],]],
    59: ['Hail Index', 230., LegacyMapper, []],
    61: ['Tornado Vortex Signature', 230., LegacyMapper,
        [['num_tvs', 3], ['num_etvs', 4]]],
    62: ['Storm Structure', 460., LegacyMapper, []],
    63: ['Layer Composite Reflectivity [Layer 1 Average]', 230., LegacyMapper,
        [['max', 3],
        ['layer_bottom', scaled_elem(4, 1000.)],
        ['layer_top', scaled_elem(5, 1000.)],
        ['calib_const', float_elem(7, 8)]]],
    64: ['Layer Composite Reflectivity [Layer 2 Average]', 230., LegacyMapper,
        [['max', 3],
        ['layer_bottom', scaled_elem(4, 1000.)],
        ['layer_top', scaled_elem(5, 1000.)],
        ['calib_const', float_elem(7, 8)]]],
    65: ['Layer Composite Reflectivity [Layer 1 Max]', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['layer_bottom', scaled_elem(4, 1000.)],
        ['layer_top', scaled_elem(5, 1000.)],
        ['calib_const', float_elem(7, 8)]]],
    66: ['Layer Composite Reflectivity [Layer 2 Max]', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['layer_bottom', scaled_elem(4, 1000.)],
        ['layer_top', scaled_elem(5, 1000.)],
        ['calib_const', float_elem(7, 8)]]],
    67: ['Layer Composite Reflectivity - AP Removed', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['layer_bottom', scaled_elem(4, 1000.)],
        ['layer_top', scaled_elem(5, 1000.)],
        ['calib_const', float_elem(7, 8)]]],
    74: ['Radar Coded Message', 460., LegacyMapper, []],
    78: ['Surface Rainfall Accumulation [1 hour]', 230., LegacyMapper,
        [['max_rainfall', scaled_elem(3, 0.1)],
        ['bias', scaled_elem(4, 0.01)],
        ['gr_pairs', scaled_elem(5, 0.01)],
        ['rainfall_end', date_elem(6, 7)]]],
    79: ['Surface Rainfall Accumulation [3 hour]', 230., LegacyMapper,
        [['max_rainfall', scaled_elem(3, 0.1)],
        ['bias', scaled_elem(4, 0.01)],
        ['gr_pairs', scaled_elem(5, 0.01)],
        ['rainfall_end', date_elem(6, 7)]]],
    80: ['Storm Total Rainfall Accumulation', 230., LegacyMapper,
        [['max_rainfall', scaled_elem(3, 0.1)],
        ['rainfall_begin', date_elem(4, 5)],
        ['rainfall_end', date_elem(6, 7)],
        ['bias', scaled_elem(8, 0.01)],
        ['gr_pairs', scaled_elem(9, 0.01)]]],
    81: ['Hourly Digital Precipitation Array', 230., PrecipArrayMapper,
        [['max_rainfall', scaled_elem(3, 0.001)],
        ['bias', scaled_elem(4, 0.01)],
        ['gr_pairs', scaled_elem(5, 0.01)],
        ['rainfall_end', date_elem(6, 7)]]],
    82: ['Supplemental Precipitation Data', null, LegacyMapper, []],
    89: ['Layer Composite Reflectivity [Layer 3 Average]', 230., LegacyMapper,
        [['max', 3],
        ['layer_bottom', scaled_elem(4, 1000.)],
        ['layer_top', scaled_elem(5, 1000.)],
        ['calib_const', float_elem(7, 8)]]],
    90: ['Layer Composite Reflectivity [Layer 3 Max]', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['layer_bottom', scaled_elem(4, 1000.)],
        ['layer_top', scaled_elem(5, 1000.)],
        ['calib_const', float_elem(7, 8)]]],
    93: ['ITWS Digital Base Velocity', 115., DigitalVelMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3],
        ['max', 4], ['precision', 6]]],
    94: ['Base Reflectivity Data Array', 460., DigitalRefMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    95: ['Composite Reflectivity Edited for AP', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    96: ['Composite Reflectivity Edited for AP', 460., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    97: ['Composite Reflectivity Edited for AP', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    98: ['Composite Reflectivity Edited for AP', 460., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['calib_const', float_elem(7, 8)]]],
    99: ['Base Velocity Data Array', 300., DigitalVelMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3],
        ['max', 4],
        ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    113: ['Power Removed Control', 300., LegacyMapper,
        [['rpg_cut_num', 0], ['cmd_generated', 1],
        ['el_angle', scaled_elem(2, 0.1)],
        ['clutter_filter_map_dt', date_elem(4, 3)],
        // While the 2620001Y ICD doesn't talk about using these
        // product-specific blocks for this product, they have data in them
        // and the compression info is necessary for proper decoding.
        ['compression', 7], ['uncompressed_size', combine_elem(8, 9)]]],
    132: ['Clutter Likelihood Reflectivity', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)]]],
    133: ['Clutter Likelihood Doppler', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)]]],
    134: ['High Resolution VIL', 460., DigitalVILMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['num_edited', 4],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    135: ['Enhanced Echo Tops', 345., DigitalEETMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', scaled_elem(3, 1000.)],  // Max in ft
        ['num_edited', 4],
        ['ref_thresh', 5],
        ['points_removed', 6],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    138: ['Digital Storm Total Precipitation', 230., DigitalStormPrecipMapper,
        [['rainfall_begin', date_elem(0, 1)],
        ['bias', scaled_elem(2, 0.01)],
        ['max', scaled_elem(3, 0.01)],
        ['rainfall_end', date_elem(4, 5)],
        ['gr_pairs', scaled_elem(6, 0.01)],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    141: ['Mesocyclone Detection', 230., LegacyMapper,
        [['min_ref_thresh', 0],
        ['overlap_display_filter', 1],
        ['min_strength_rank', 2]]],
    152: ['Archive III Status Product', null, LegacyMapper,
        [['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    153: ['Super Resolution Reflectivity Data Array', 460., DigitalRefMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)], ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    154: ['Super Resolution Velocity Data Array', 300., DigitalVelMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3], ['max', 4], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)], ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    155: ['Super Resolution Spectrum Width Data Array', 300.,
        DigitalSPWMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)], ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    156: ['Turbulence Detection [Eddy Dissipation Rate]', 230., EDRMapper,
        [['el_start_time', 0],
        ['el_end_time', 1],
        ['el_angle', scaled_elem(2, 0.1)],
        ['min_el', scaled_elem(3, 0.01)],
        ['mean_el', scaled_elem(4, 0.01)],
        ['max_el', scaled_elem(5, 0.01)]]],
    157: ['Turbulence Detection [Eddy Dissipation Rate Confidence]', 230.,
        EDRMapper,
        [['el_start_time', 0],
        ['el_end_time', 1],
        ['el_angle', scaled_elem(2, 0.1)],
        ['min_el', scaled_elem(3, 0.01)],
        ['mean_el', scaled_elem(4, 0.01)],
        ['max_el', scaled_elem(5, 0.01)]]],
    158: ['Differential Reflectivity', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', scaled_elem(3, 0.1)],
        ['max', scaled_elem(4, 0.1)]]],
    159: ['Digital Differential Reflectivity', 300., GenericDigitalMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', scaled_elem(3, 0.1)],
        ['max', scaled_elem(4, 0.1)], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)], ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    160: ['Correlation Coefficient', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', scaled_elem(3, 0.00333)],
        ['max', scaled_elem(4, 0.00333)]]],
    161: ['Digital Correlation Coefficient', 300., GenericDigitalMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', scaled_elem(3, 0.00333)],
        ['max', scaled_elem(4, 0.00333)], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)], ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    162: ['Specific Differential Phase', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', scaled_elem(3, 0.05)],
        ['max', scaled_elem(4, 0.05)]]],
    163: ['Digital Specific Differential Phase', 300., GenericDigitalMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', scaled_elem(3, 0.05)],
        ['max', scaled_elem(4, 0.05)], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)], ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    164: ['Hydrometeor Classification', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],]],
    165: ['Digital Hydrometeor Classification', 300., DigitalHMCMapper,
        [['el_angle', scaled_elem(2, 0.1)], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)], ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    166: ['Melting Layer', 230., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)],]],
    167: ['Super Res Digital Correlation Coefficient', 300.,
        GenericDigitalMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', scaled_elem(3, 0.00333)],
        ['max', scaled_elem(4, 0.00333)], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)], ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    168: ['Super Res Digital Phi', 300., GenericDigitalMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3], ['max', 4], ['delta_time', delta_time(6)],
        ['supplemental_scan', supplemental_scan(6)], ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    169: ['One Hour Accumulation', 230., LegacyMapper,
        [['null_product', low_byte(2)],
        ['max', scaled_elem(3, 0.1)],
        ['rainfall_end', date_elem(4, 5)],
        ['bias', scaled_elem(6, 0.01)],
        ['gr_pairs', scaled_elem(7, 0.01)]]],
    170: ['Digital Accumulation Array', 230., GenericDigitalMapper,
        [['null_product', low_byte(2)],
        ['max', scaled_elem(3, 0.1)],
        ['rainfall_end', date_elem(4, 5)],
        ['bias', scaled_elem(6, 0.01)],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    171: ['Storm Total Accumulation', 230., LegacyMapper,
        [['rainfall_begin', date_elem(0, 1)],
        ['null_product', low_byte(2)],
        ['max', scaled_elem(3, 0.1)],
        ['rainfall_end', date_elem(4, 5)],
        ['bias', scaled_elem(6, 0.01)],
        ['gr_pairs', scaled_elem(7, 0.01)]]],
    172: ['Digital Storm Total Accumulation', 230., GenericDigitalMapper,
        [['rainfall_begin', date_elem(0, 1)],
        ['null_product', low_byte(2)],
        ['max', scaled_elem(3, 0.1)],
        ['rainfall_end', date_elem(4, 5)],
        ['bias', scaled_elem(6, 0.01)],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    173: ['Digital User-Selectable Accumulation', 230., GenericDigitalMapper,
        [['period', 1],
        ['missing_period', high_byte(2)],
        ['null_product', low_byte(2)],
        ['max', scaled_elem(3, 0.1)],
        ['rainfall_end', date_elem(4, 0)],
        ['start_time', 5],
        ['bias', scaled_elem(6, 0.01)],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    174: ['Digital One-Hour Difference Accumulation', 230.,
        GenericDigitalMapper,
        [['max', scaled_elem(3, 0.1)],
        ['rainfall_end', date_elem(4, 5)],
        ['min', scaled_elem(6, 0.1)],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    175: ['Digital Storm Total Difference Accumulation', 230.,
        GenericDigitalMapper,
        [['rainfall_begin', date_elem(0, 1)],
        ['null_product', low_byte(2)],
        ['max', scaled_elem(3, 0.1)],
        ['rainfall_end', date_elem(4, 5)],
        ['min', scaled_elem(6, 0.1)],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    176: ['Digital Instantaneous Precipitation Rate', 230.,
        GenericDigitalMapper,
        [['rainfall_begin', date_elem(0, 1)],
        ['precip_detected', high_byte(2)],
        ['need_bias', low_byte(2)],
        ['max', 3],
        ['percent_filled', scaled_elem(4, 0.01)],
        ['max_elev', scaled_elem(5, 0.1)],
        ['bias', scaled_elem(6, 0.01)],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    177: ['Hybrid Hydrometeor Classification', 230., DigitalHMCMapper,
        [['mode_filter_size', 3],
        ['hybrid_percent_filled', 4],
        ['max_elev', scaled_elem(5, 0.1)],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    180: ['TDWR Base Reflectivity', 90., DigitalRefMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    181: ['TDWR Base Reflectivity', 90., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3]]],
    182: ['TDWR Base Velocity', 90., DigitalVelMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3],
        ['max', 4],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    183: ['TDWR Base Velocity', 90., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['min', 3],
        ['max', 4]]],
    185: ['TDWR Base Spectrum Width', 90., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3]]],
    186: ['TDWR Long Range Base Reflectivity', 416., DigitalRefMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3],
        ['compression', 7],
        ['uncompressed_size', combine_elem(8, 9)]]],
    187: ['TDWR Long Range Base Reflectivity', 416., LegacyMapper,
        [['el_angle', scaled_elem(2, 0.1)],
        ['max', 3]]]
}

module.exports = NEXRADLevel3File;