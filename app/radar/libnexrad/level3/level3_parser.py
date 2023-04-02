# Copyright (c) 2009,2015,2016,2017 MetPy Developers.
# Distributed under the terms of the BSD 3-Clause License.
# SPDX-License-Identifier: BSD-3-Clause
"""Support reading information from various NEXRAD formats."""

import bz2
from collections import defaultdict, namedtuple, OrderedDict
import contextlib
import datetime
import logging
import pathlib
import re
import struct
from xdrlib import Unpacker
from struct import Struct
import zlib

import numpy as np

from metpy.io._tools import open_as_needed

log = logging.getLogger(__name__)

class IOBuffer:
    """Holds bytes from a buffer to simplify parsing and random access."""

    def __init__(self, source):
        """Initialize the IOBuffer with the source data."""
        self._data = bytearray(source)
        self.reset()

    @classmethod
    def fromfile(cls, fobj):
        """Initialize the IOBuffer with the contents of the file object."""
        return cls(fobj.read())

    def reset(self):
        """Reset buffer back to initial state."""
        self._offset = 0
        self.clear_marks()

    def set_mark(self):
        """Mark the current location and return its id so that the buffer can return later."""
        self._bookmarks.append(self._offset)
        return len(self._bookmarks) - 1

    def jump_to(self, mark, offset=0):
        """Jump to a previously set mark."""
        self._offset = self._bookmarks[mark] + offset

    def offset_from(self, mark):
        """Calculate the current offset relative to a marked location."""
        return self._offset - self._bookmarks[mark]

    def clear_marks(self):
        """Clear all marked locations."""
        self._bookmarks = []

    def splice(self, mark, newdata):
        """Replace the data after the marked location with the specified data."""
        self.jump_to(mark)
        self._data = self._data[:self._offset] + bytearray(newdata)

    def read_struct(self, struct_class):
        """Parse and return a structure from the current buffer offset."""
        struct = struct_class.unpack_from(memoryview(self._data), self._offset)
        self.skip(struct_class.size)
        return struct

    def read_func(self, func, num_bytes=None):
        """Parse data from the current buffer offset using a function."""
        # only advance if func succeeds
        res = func(self.get_next(num_bytes))
        self.skip(num_bytes)
        return res

    def read_ascii(self, num_bytes=None):
        """Return the specified bytes as ascii-formatted text."""
        return self.read(num_bytes).decode('ascii')

    def read_binary(self, num, item_type='B'):
        """Parse the current buffer offset as the specified code."""
        if 'B' in item_type:
            return self.read(num)

        if item_type[0] in ('@', '=', '<', '>', '!'):
            order = item_type[0]
            item_type = item_type[1:]
        else:
            order = '@'

        return list(self.read_struct(Struct(order + f'{int(num):d}' + item_type)))

    def read_int(self, size, endian, signed):
        """Parse the current buffer offset as the specified integer code."""
        return int.from_bytes(self.read(size), endian, signed=signed)

    def read_array(self, count, dtype):
        """Read an array of values from the buffer."""
        ret = np.frombuffer(self._data, offset=self._offset, dtype=dtype, count=count)
        self.skip(ret.nbytes)
        return ret

    def read(self, num_bytes=None):
        """Read and return the specified bytes from the buffer."""
        res = self.get_next(num_bytes)
        self.skip(len(res))
        return res

    def get_next(self, num_bytes=None):
        """Get the next bytes in the buffer without modifying the offset."""
        if num_bytes is None:
            return self._data[self._offset:]
        else:
            return self._data[self._offset:self._offset + num_bytes]

    def skip(self, num_bytes):
        """Jump the ahead the specified bytes in the buffer."""
        if num_bytes is None:
            self._offset = len(self._data)
        else:
            self._offset += num_bytes

    def check_remains(self, num_bytes):
        """Check that the number of bytes specified remains in the buffer."""
        return len(self._data[self._offset:]) == num_bytes

    def truncate(self, num_bytes):
        """Remove the specified number of bytes from the end of the buffer."""
        self._data = self._data[:-num_bytes]

    def at_end(self):
        """Return whether the buffer has reached the end of data."""
        return self._offset >= len(self._data)

    def __getitem__(self, item):
        """Return the data at the specified location."""
        return self._data[item]

    def __str__(self):
        """Return a string representation of the IOBuffer."""
        return f'Size: {len(self._data)} Offset: {self._offset}'

    def __len__(self):
        """Return the amount of data in the buffer."""
        return len(self._data)

class BitField:
    """Convert an integer to a string for each bit."""

    def __init__(self, *names):
        """Initialize the list of named bits."""
        self._names = names

    def __call__(self, val):
        """Return a list with a string for each True bit in the integer."""
        if not val:
            return None

        bits = []
        for n in self._names:
            if val & 0x1:
                bits.append(n)
            val >>= 1
            if not val:
                break

        # Return whole list if empty or multiple items, otherwise just single item
        return bits[0] if len(bits) == 1 else bits

class Bits:
    """Breaks an integer into a specified number of True/False bits."""

    def __init__(self, num_bits):
        """Initialize the number of bits."""
        self._bits = range(num_bits)

    def __call__(self, val):
        """Convert the integer to the list of True/False values."""
        return [bool((val >> i) & 0x1) for i in self._bits]

# This works around times when we have more than 255 items and can't use
# NamedStruct. This is a CPython limit for arguments.
class DictStruct(Struct):
    """Parse bytes using :class:`Struct` but provide named fields using dictionary access."""

    def __init__(self, info, prefmt=''):
        """Initialize the DictStruct."""
        names, formats = zip(*info)

        # Remove empty names
        self._names = [n for n in names if n]

        super().__init__(prefmt + ''.join(f for f in formats if f))

    def _create(self, items):
        return dict(zip(self._names, items))

    def unpack(self, s):
        """Parse bytes and return a dict."""
        return self._create(super().unpack(s))

    def unpack_from(self, buff, offset=0):
        """Unpack the next bytes from a file object."""
        return self._create(super().unpack_from(buff, offset))

class NamedStruct(Struct):
    """Parse bytes using :class:`Struct` but provide named fields."""

    def __init__(self, info, prefmt='', tuple_name=None):
        """Initialize the NamedStruct."""
        if tuple_name is None:
            tuple_name = 'NamedStruct'
        names, fmts = zip(*info)
        self.converters = {}
        conv_off = 0
        for ind, i in enumerate(info):
            if len(i) > 2:
                self.converters[ind - conv_off] = i[-1]
            elif not i[0]:  # Skip items with no name
                conv_off += 1
        self._tuple = namedtuple(tuple_name, ' '.join(n for n in names if n))
        super().__init__(prefmt + ''.join(f for f in fmts if f))

    def _create(self, items):
        if self.converters:
            items = list(items)
            for ind, conv in self.converters.items():
                items[ind] = conv(items[ind])
            if len(items) < len(self._tuple._fields):
                items.extend([None] * (len(self._tuple._fields) - len(items)))
        return self.make_tuple(*items)

    def make_tuple(self, *args, **kwargs):
        """Construct the underlying tuple from values."""
        return self._tuple(*args, **kwargs)

    def unpack(self, s):
        """Parse bytes and return a namedtuple."""
        return self._create(super().unpack(s))

    def unpack_from(self, buff, offset=0):
        """Read bytes from a buffer and return as a namedtuple."""
        return self._create(super().unpack_from(buff, offset))

    def unpack_file(self, fobj):
        """Unpack the next bytes from a file object."""
        return self.unpack(fobj.read(self.size))

    def pack(self, **kwargs):
        """Pack the arguments into bytes using the structure."""
        t = self.make_tuple(**kwargs)
        return super().pack(*t)

def zlib_decompress_all_frames(data):
    """Decompress all frames of zlib-compressed bytes.
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
    """
    frames = bytearray()
    data = bytes(data)
    while data:
        decomp = zlib.decompressobj()
        try:
            frames += decomp.decompress(data)
            data = decomp.unused_data
            log.debug('Decompressed zlib frame (total %d bytes). %d bytes remain.',
                        len(frames), len(data))
        except zlib.error:
            log.debug('Remaining %d bytes are not zlib compressed.', len(data))
            frames.extend(data)
            break
    return frames

def version(val):
    """Calculate a string version from an integer value."""
    ver = val / 100. if val > 2. * 100. else val / 10.
    return f'{ver:.1f}'

def scaler(scale):
    """Create a function that scales by a specific value."""
    def inner(val):
        return val * scale
    return inner

def nexrad_to_datetime(julian_date, ms_midnight):
    from scipy.constants import day, milli
    """Convert NEXRAD date time format to python `datetime.datetime`."""
    # Subtracting one from julian_date is because epoch date is 1
    return datetime.datetime.utcfromtimestamp((julian_date - 1) * day + ms_midnight * milli)

def reduce_lists(d):
    """Replace single item lists in a dictionary with the single item."""
    for field in d:
        old_data = d[field]
        if len(old_data) == 1:
            d[field] = old_data[0]

def two_comp16(val):
    """Return the two's-complement signed representation of a 16-bit unsigned integer."""
    if val >> 15:
        val = -(~val & 0x7fff) - 1
    return val


def float16(val):
    """Convert a 16-bit floating point value to a standard Python float."""
    # Fraction is 10 LSB, Exponent middle 5, and Sign the MSB
    frac = val & 0x03ff
    exp = (val >> 10) & 0x1F
    sign = val >> 15

    if exp:
        value = 2 ** (exp - 16) * (1 + float(frac) / 2**10)
    else:
        value = float(frac) / 2**9

    if sign:
        value *= -1

    return value


def float32(short1, short2):
    """Unpack a pair of 16-bit integers as a Python float."""
    # Masking below in python will properly convert signed values to unsigned
    return struct.unpack('>f', struct.pack('>HH', short1 & 0xFFFF, short2 & 0xFFFF))[0]


def date_elem(ind_days, ind_minutes):
    """Create a function to parse a datetime from the product-specific blocks."""
    def inner(seq):
        return nexrad_to_datetime(seq[ind_days], seq[ind_minutes] * 60 * 1000)
    return inner


def scaled_elem(index, scale):
    """Create a function to scale a certain product-specific block."""
    def inner(seq):
        return seq[index] * scale
    return inner


def combine_elem(ind1, ind2):
    """Create a function to combine two specified product-specific blocks into a single int."""
    def inner(seq):
        shift = 2**16
        if seq[ind1] < 0:
            seq[ind1] += shift
        if seq[ind2] < 0:
            seq[ind2] += shift
        return (seq[ind1] << 16) | seq[ind2]
    return inner


def float_elem(ind1, ind2):
    """Create a function to combine two specified product-specific blocks into a float."""
    return lambda seq: float32(seq[ind1], seq[ind2])


def high_byte(ind):
    """Create a function to return the high-byte of a product-specific block."""
    def inner(seq):
        return seq[ind] >> 8
    return inner


def low_byte(ind):
    """Create a function to return the low-byte of a product-specific block."""
    def inner(seq):
        return seq[ind] & 0x00FF
    return inner


def delta_time(ind):
    """Create a function to return the delta time from a product-specific block."""
    def inner(seq):
        return seq[ind] >> 5
    return inner


def supplemental_scan(ind):
    """Create a function to return the supplement scan type from a product-specific block."""
    def inner(seq):
        # ICD says 1->SAILS, 2->MRLE, but testing on 2020-08-17 makes this seem inverted
        # given what's being reported by sites in the GSM.
        return {0: 'Non-supplemental scan',
                2: 'SAILS scan', 1: 'MRLE scan'}.get(seq[ind] & 0x001F, 'Unknown')
    return inner


# Data mappers used to take packed data and turn into physical units
# Default is to use numpy array indexing to use LUT to change data bytes
# into physical values. Can also have a 'labels' attribute to give
# categorical labels
class DataMapper:
    """Convert packed integer data into physical units."""

    # Need to find way to handle range folded
    # RANGE_FOLD = -9999
    RANGE_FOLD = float('nan')
    MISSING = float('nan')

    def __init__(self, num=256):
        print(num)
        self.lut = np.full(num, self.MISSING, dtype=float)

    def __call__(self, data):
        """Convert the values."""
        return self.lut[data]


class DigitalMapper(DataMapper):
    """Maps packed integers to floats using a scale and offset from the product."""

    _min_scale = 0.1
    _inc_scale = 0.1
    _min_data = 2
    _max_data = 255
    range_fold = False

    def __init__(self, prod):
        """Initialize the mapper and the lookup table."""
        super().__init__()
        min_val = two_comp16(prod.thresholds[0]) * self._min_scale
        inc = prod.thresholds[1] * self._inc_scale
        num_levels = prod.thresholds[2]

        # Generate lookup table -- sanity check on num_levels handles
        # the fact that DHR advertises 256 levels, which *includes*
        # missing, differing from other products
        num_levels = min(num_levels, self._max_data - self._min_data + 1)
        for i in range(num_levels):
            self.lut[i + self._min_data] = min_val + i * inc


class DigitalRefMapper(DigitalMapper):
    """Mapper for digital reflectivity products."""

    units = 'dBZ'


class DigitalVelMapper(DigitalMapper):
    """Mapper for digital velocity products."""

    units = 'm/s'
    range_fold = True


class DigitalSPWMapper(DigitalVelMapper):
    """Mapper for digital spectrum width products."""

    _min_data = 129
    # ICD says up to 152, but also says max value is 19, which implies 129 + 19/0.5 -> 167
    _max_data = 167


class PrecipArrayMapper(DigitalMapper):
    """Mapper for precipitation array products."""

    _inc_scale = 0.001
    _min_data = 1
    _max_data = 254
    units = 'dBA'


class DigitalStormPrecipMapper(DigitalMapper):
    """Mapper for digital storm precipitation products."""

    units = 'inches'
    _inc_scale = 0.01


class DigitalVILMapper(DataMapper):
    """Mapper for digital VIL products."""

    def __init__(self, prod):
        """Initialize the VIL mapper."""
        super().__init__()
        lin_scale = float16(prod.thresholds[0])
        lin_offset = float16(prod.thresholds[1])
        log_start = prod.thresholds[2]
        log_scale = float16(prod.thresholds[3])
        log_offset = float16(prod.thresholds[4])

        # VIL is allowed to use 2 through 254 inclusive. 0 is thresholded,
        # 1 is flagged, and 255 is reserved
        ind = np.arange(255)
        self.lut[2:log_start] = (ind[2:log_start] - lin_offset) / lin_scale
        self.lut[log_start:-1] = np.exp((ind[log_start:] - log_offset) / log_scale)


class DigitalEETMapper(DataMapper):
    """Mapper for digital echo tops products."""

    def __init__(self, prod):
        """Initialize the mapper."""
        super().__init__()
        data_mask = prod.thresholds[0]
        scale = prod.thresholds[1]
        offset = prod.thresholds[2]
        topped_mask = prod.thresholds[3]
        self.topped_lut = [False] * 256
        for i in range(2, 256):
            self.lut[i] = ((i & data_mask) - offset) / scale
            self.topped_lut[i] = bool(i & topped_mask)

        self.topped_lut = np.array(self.topped_lut)

    def __call__(self, data_vals):
        """Convert the data values."""
        return self.lut[data_vals], self.topped_lut[data_vals]


class GenericDigitalMapper(DataMapper):
    """Maps packed integers to floats using a scale and offset from the product.

    Also handles special data flags.
    """

    def __init__(self, prod):
        """Initialize the mapper by pulling out all the information from the product."""
        # Need to treat this value as unsigned, so we can use the full 16-bit range. This
        # is necessary at least for the DPR product, otherwise it has a value of -1.
        max_data_val = prod.thresholds[5] & 0xFFFF

        # Values will be [0, max] inclusive, so need to add 1 to max value to get proper size.
        super().__init__(max_data_val + 1)

        scale = float32(prod.thresholds[0], prod.thresholds[1])
        offset = float32(prod.thresholds[2], prod.thresholds[3])
        leading_flags = prod.thresholds[6]
        trailing_flags = prod.thresholds[7]

        if leading_flags > 1:
            self.lut[1] = self.RANGE_FOLD

        # Need to add 1 to the end of the range so that it's inclusive
        for i in range(leading_flags, max_data_val - trailing_flags + 1):
            self.lut[i] = (i - offset) / scale


class DigitalHMCMapper(DataMapper):
    """Mapper for hydrometeor classification products.

    Handles assigning string labels based on values.
    """

    labels = ['ND', 'BI', 'GC', 'IC', 'DS', 'WS', 'RA', 'HR',
              'BD', 'GR', 'HA', 'LH', 'GH', 'UK', 'RF']

    def __init__(self, prod):
        """Initialize the mapper."""
        super().__init__()
        for i in range(10, 256):
            self.lut[i] = i // 10
        self.lut[150] = self.RANGE_FOLD


# 156, 157
class EDRMapper(DataMapper):
    """Mapper for eddy dissipation rate products."""

    def __init__(self, prod):
        """Initialize the mapper based on the product."""
        data_levels = prod.thresholds[2]
        super().__init__(data_levels)
        scale = prod.thresholds[0] / 1000.
        offset = prod.thresholds[1] / 1000.
        leading_flags = prod.thresholds[3]
        for i in range(leading_flags, data_levels):
            self.lut[i] = scale * i + offset


class LegacyMapper(DataMapper):
    """Mapper for legacy products."""

    lut_names = ['Blank', 'TH', 'ND', 'RF', 'BI', 'GC', 'IC', 'GR', 'WS',
                 'DS', 'RA', 'HR', 'BD', 'HA', 'UK']

    def __init__(self, prod):
        """Initialize the values and labels from the product."""
        # Don't worry about super() since we're using our own lut assembled sequentially
        self.labels = []
        self.lut = []
        for t in prod.thresholds:
            codes, val = t >> 8, t & 0xFF
            label = ''
            if codes >> 7:
                label = self.lut_names[val]
                if label in ('Blank', 'TH', 'ND'):
                    val = self.MISSING
                elif label == 'RF':
                    val = self.RANGE_FOLD

            elif codes >> 6:
                val *= 0.01
                label = f'{val:.2f}'
            elif codes >> 5:
                val *= 0.05
                label = f'{val:.2f}'
            elif codes >> 4:
                val *= 0.1
                label = f'{val:.1f}'

            if codes & 0x1:
                val *= -1
                label = '-' + label
            elif (codes >> 1) & 0x1:
                label = '+' + label

            if (codes >> 2) & 0x1:
                label = '<' + label
            elif (codes >> 3) & 0x1:
                label = '>' + label

            if not label:
                label = str(val)

            self.lut.append(val)
            self.labels.append(label)
        self.lut = np.array(self.lut)


class NEXRADLevel3File:
    r"""Handle reading the wide array of NEXRAD Level 3 (NIDS) product files.

    This class attempts to decode every byte that is in a given product file.
    It supports all the various compression formats that exist for these
    products in the wild.

    Attributes
    ----------
    metadata : dict
        Various general metadata available from the product
    header : `collections.namedtuple`
        Decoded product header
    prod_desc : `collections.namedtuple`
        Decoded product description block
    siteID : str
        ID of the site found in the header, empty string if none found
    lat : float
        Radar site latitude
    lon : float
        Radar site longitude
    height : float
        Radar site height AMSL
    product_name : str
        Name of the product contained in file
    max_range : float
        Maximum kilometer range of the product, taken from the NIDS ICD
    map_data : `DataMapper`
        Class instance mapping data int values to proper floating point values
    sym_block : list, optional
        Any symbology block packets that were found
    tab_pages : list, optional
        Any tabular pages that were found
    graph_pages : list, optional
        Any graphical pages that were found

    Notes
    -----
    The internal data structure that things are decoded into is still to be
    determined.

    """

    def __init__(self, filename):
        r"""Create instance of `Level3File`.

        Parameters
        ----------
        filename : str or file-like object
            If str, the name of the file to be opened. If file-like object,
            this will be read from directly.

        """
        fobj = open_as_needed(filename)
        if isinstance(filename, str):
            self.filename = filename
        elif isinstance(filename, pathlib.Path):
            self.filename = str(filename)
        else:
            self.filename = 'No File'

        # Just read in the entire set of data at once
        with contextlib.closing(fobj):
            self._buffer = IOBuffer.fromfile(fobj)

        # Pop off the WMO header if we find it
        self._process_wmo_header()

        # Pop off last 4 bytes if necessary
        self._process_end_bytes()

        # Set up places to store data and metadata
        self.metadata = {}

        # Handle free text message products that are pure text
        if self.wmo_code == 'NOUS':
            self.header = None
            self.prod_desc = None
            self.thresholds = None
            self.depVals = None
            self.product_name = 'Free Text Message'
            self.text = ''.join(self._buffer.read_ascii())
            return

        # Decompress the data if necessary, and if so, pop off new header
        self._buffer = IOBuffer(self._buffer.read_func(zlib_decompress_all_frames))
        self._process_wmo_header()

        # Check for empty product
        if len(self._buffer) == 0:
            log.warning('%s: Empty product!', self.filename)
            return

        # Unpack the message header and the product description block
        msg_start = self._buffer.set_mark()
        self.header = self._buffer.read_struct(header_fmt)
        log.debug('Buffer size: %d (%d expected) Header: %s', len(self._buffer),
                  self.header.msg_len, self.header)

        if not self._buffer.check_remains(self.header.msg_len - header_fmt.size):
            log.warning('Product contains an unexpected amount of data remaining--have: %d '
                        'expected: %d. This product may not parse correctly.',
                        len(self._buffer) - self._buffer._offset,
                        self.header.msg_len - header_fmt.size)

        # Handle GSM and jump out
        if self.header.code == 2:
            self.gsm = self._buffer.read_struct(gsm_fmt)
            self.product_name = 'General Status Message'
            assert self.gsm.divider == -1
            if self.gsm.block_len > 82:
                # Due to the way the structures read it in, one bit from the count needs
                # to be popped off and added as the supplemental cut status for the 25th
                # elevation cut.
                more = self._buffer.read_struct(additional_gsm_fmt)
                cut_count = more.supplemental_cut_count
                more.supplemental_cut_map2.append(bool(cut_count & 0x1))
                self.gsm_additional = more._replace(supplemental_cut_count=cut_count >> 1)
                assert self.gsm.block_len == 178
            else:
                assert self.gsm.block_len == 82
            return

        self.prod_desc = self._buffer.read_struct(prod_desc_fmt)
        log.debug('Product description block: %s', self.prod_desc)

        # Convert thresholds and dependent values to lists of values
        self.thresholds = [getattr(self.prod_desc, f'thr{i}') for i in range(1, 17)]
        self.depVals = [getattr(self.prod_desc, f'dep{i}') for i in range(1, 11)]

        # Set up some time/location metadata
        self.metadata['msg_time'] = nexrad_to_datetime(self.header.date,
                                                       self.header.time * 1000)
        self.metadata['vol_time'] = nexrad_to_datetime(self.prod_desc.vol_date,
                                                       self.prod_desc.vol_start_time * 1000)
        self.metadata['prod_time'] = nexrad_to_datetime(self.prod_desc.prod_gen_date,
                                                        self.prod_desc.prod_gen_time * 1000)
        self.lat = self.prod_desc.lat * 0.001
        self.lon = self.prod_desc.lon * 0.001
        self.height = self.prod_desc.height

        # Handle product-specific blocks. Default to compression and elevation angle
        # Also get other product specific information, like name,
        # maximum range, and how to map data bytes to values
        default = ('Unknown Product', 230., LegacyMapper,
                   (('el_angle', scaled_elem(2, 0.1)), ('compression', 7),
                    ('uncompressed_size', combine_elem(8, 9)), ('defaultVals', 0)))
        self.product_name, self.max_range, mapper, meta = prod_spec_map.get(
            self.header.code, default)
        log.debug('Product info--name: %s max_range: %f mapper: %s metadata: %s',
                  self.product_name, self.max_range, mapper, meta)

        for name, block in meta:
            if callable(block):
                self.metadata[name] = block(self.depVals)
            else:
                self.metadata[name] = self.depVals[block]

        # Now that we have the header, we have everything needed to make tables
        # Store as class that can be called
        self.map_data = mapper(self)

        # Process compression if indicated. We need to fail
        # gracefully here since we default to it being on
        if self.metadata.get('compression', False):
            try:
                comp_start = self._buffer.set_mark()
                decomp_data = self._buffer.read_func(bz2.decompress)
                self._buffer.splice(comp_start, decomp_data)
                assert self._buffer.check_remains(self.metadata['uncompressed_size'])
            except OSError:
                # Compression didn't work, so we just assume it wasn't actually compressed.
                pass

        # Unpack the various blocks, if present. The factor of 2 converts from
        # 'half-words' to bytes
        # Check to see if this is one of the "special" products that uses
        # header-free blocks and re-assigns the offsets
        if self.header.code in standalone_tabular:
            if self.prod_desc.sym_off:
                # For standalone tabular alphanumeric, symbology offset is
                # actually tabular
                self._unpack_tabblock(msg_start, 2 * self.prod_desc.sym_off, False)
            if self.prod_desc.graph_off:
                # Offset seems to be off by 1 from where we're counting, but
                # it's not clear why.
                self._unpack_standalone_graphblock(msg_start,
                                                   2 * (self.prod_desc.graph_off - 1))
        # Need special handling for (old) radar coded message format
        elif self.header.code == 74:
            self._unpack_rcm(msg_start, 2 * self.prod_desc.sym_off)
        else:
            if self.prod_desc.sym_off:
                self._unpack_symblock(msg_start, 2 * self.prod_desc.sym_off)
            if self.prod_desc.graph_off:
                self._unpack_graphblock(msg_start, 2 * self.prod_desc.graph_off)
            if self.prod_desc.tab_off:
                self._unpack_tabblock(msg_start, 2 * self.prod_desc.tab_off)

        if 'defaultVals' in self.metadata:
            log.warning('%s: Using default metadata for product %d',
                        self.filename, self.header.code)

    def _process_wmo_header(self):
        # Read off the WMO header if necessary
        data = self._buffer.get_next(64).decode('ascii', 'ignore')
        match = wmo_finder.search(data)
        log.debug('WMO Header: %s', match)
        if match:
            self.wmo_code = match.groups()[0]
            self.siteID = match.groups()[-1]
            self._buffer.skip(match.end())
        else:
            self.wmo_code = ''

    def _process_end_bytes(self):
        check_bytes = self._buffer[-4:-1]
        log.debug('End Bytes: %s', check_bytes)
        if check_bytes in (b'\r\r\n', b'\xff\xff\n'):
            self._buffer.truncate(4)

    @staticmethod
    def _unpack_rle_data(data):
        # Unpack Run-length encoded data
        unpacked = []
        for run in data:
            num, val = run >> 4, run & 0x0F
            unpacked.extend([val] * num)
        return unpacked

    @staticmethod
    def pos_scale(is_sym_block):
        """Scale of the position information in km."""
        return 0.25 if is_sym_block else 1

    def _unpack_rcm(self, start, offset):
        self._buffer.jump_to(start, offset)
        header = self._buffer.read_ascii(10)
        assert header == '1234 ROBUU'
        text_data = self._buffer.read_ascii()
        end = 0
        # Appendix B of ICD tells how to interpret this stuff, but that just
        # doesn't seem worth it.
        for marker, name in [('AA', 'ref'), ('BB', 'vad'), ('CC', 'remarks')]:
            start = text_data.find('/NEXR' + marker, end)
            # For part C the search for end fails, but returns -1, which works
            end = text_data.find('/END' + marker, start)
            setattr(self, 'rcm_' + name, text_data[start:end])

    def _unpack_symblock(self, start, offset):
        self._buffer.jump_to(start, offset)
        blk = self._buffer.read_struct(sym_block_fmt)
        log.debug('Symbology block info: %s', blk)

        self.sym_block = []
        assert blk.divider == -1, ('Bad divider for symbology block: {:d} should be -1'
                                   .format(blk.divider))
        assert blk.block_id == 1, ('Bad block ID for symbology block: {:d} should be 1'
                                   .format(blk.block_id))
        for _ in range(blk.nlayer):
            layer_hdr = self._buffer.read_struct(sym_layer_fmt)
            assert layer_hdr.divider == -1
            layer = []
            self.sym_block.append(layer)
            layer_start = self._buffer.set_mark()
            while self._buffer.offset_from(layer_start) < layer_hdr.length:
                packet_code = self._buffer.read_int(2, 'big', signed=False)
                log.debug('Symbology packet: %d', packet_code)
                if packet_code in self.packet_map:
                    layer.append(self.packet_map[packet_code](self, packet_code, True))
                else:
                    log.warning('%s: Unknown symbology packet type %d/%x.',
                                self.filename, packet_code, packet_code)
                    self._buffer.jump_to(layer_start, layer_hdr.length)
            assert self._buffer.offset_from(layer_start) == layer_hdr.length

    def _unpack_graphblock(self, start, offset):
        self._buffer.jump_to(start, offset)
        hdr = self._buffer.read_struct(graph_block_fmt)
        assert hdr.divider == -1, ('Bad divider for graphical block: {:d} should be -1'
                                   .format(hdr.divider))
        assert hdr.block_id == 2, ('Bad block ID for graphical block: {:d} should be 1'
                                   .format(hdr.block_id))
        self.graph_pages = []
        for page in range(hdr.num_pages):
            page_num = self._buffer.read_int(2, 'big', signed=False)
            assert page + 1 == page_num
            page_size = self._buffer.read_int(2, 'big', signed=False)
            page_start = self._buffer.set_mark()
            packets = []
            while self._buffer.offset_from(page_start) < page_size:
                packet_code = self._buffer.read_int(2, 'big', signed=False)
                if packet_code in self.packet_map:
                    packets.append(self.packet_map[packet_code](self, packet_code, False))
                else:
                    log.warning('%s: Unknown graphical packet type %d/%x.',
                                self.filename, packet_code, packet_code)
                    self._buffer.skip(page_size)
            self.graph_pages.append(packets)

    def _unpack_standalone_graphblock(self, start, offset):
        self._buffer.jump_to(start, offset)
        packets = []
        while not self._buffer.at_end():
            packet_code = self._buffer.read_int(2, 'big', signed=False)
            if packet_code in self.packet_map:
                packets.append(self.packet_map[packet_code](self, packet_code, False))
            else:
                log.warning('%s: Unknown standalone graphical packet type %d/%x.',
                            self.filename, packet_code, packet_code)
                # Assume next 2 bytes is packet length and try skipping
                num_bytes = self._buffer.read_int(2, 'big', signed=False)
                self._buffer.skip(num_bytes)
        self.graph_pages = [packets]

    def _unpack_tabblock(self, start, offset, have_header=True):
        self._buffer.jump_to(start, offset)
        block_start = self._buffer.set_mark()

        # Read the header and validate if needed
        if have_header:
            header = self._buffer.read_struct(tab_header_fmt)
            assert header.divider == -1
            assert header.block_id == 3

            # Read off secondary message and product description blocks,
            # but as far as I can tell, all we really need is the text that follows
            self._buffer.read_struct(header_fmt)
            self._buffer.read_struct(prod_desc_fmt)

        # Get the start of the block with number of pages and divider
        blk = self._buffer.read_struct(tab_block_fmt)
        assert blk.divider == -1

        # Read the pages line by line, break pages on a -1 character count
        self.tab_pages = []
        for _ in range(blk.num_pages):
            lines = []
            num_chars = self._buffer.read_int(2, 'big', signed=True)
            while num_chars != -1:
                lines.append(''.join(self._buffer.read_ascii(num_chars)))
                num_chars = self._buffer.read_int(2, 'big', signed=True)
            self.tab_pages.append('\n'.join(lines))

        if have_header:
            assert self._buffer.offset_from(block_start) == header.block_len

    def __repr__(self):
        """Return the string representation of the product."""
        attrs = ('product_name', 'header', 'prod_desc', 'thresholds', 'depVals', 'metadata',
                 'gsm', 'gsm_additional', 'siteID')
        blocks = [str(getattr(self, name)) for name in attrs if hasattr(self, name)]
        return self.filename + ': ' + '\n'.join(blocks)

    def _unpack_packet_radial_data(self, code, in_sym_block):
        hdr_fmt = NamedStruct([('ind_first_bin', 'H'), ('nbins', 'H'),
                               ('i_center', 'h'), ('j_center', 'h'),
                               ('scale_factor', 'h'), ('num_rad', 'H')],
                              '>', 'RadialHeader')
        rad_fmt = NamedStruct([('num_hwords', 'H'), ('start_angle', 'h'),
                               ('angle_delta', 'h')], '>', 'RadialData')
        hdr = self._buffer.read_struct(hdr_fmt)
        rads = []
        for _ in range(hdr.num_rad):
            rad = self._buffer.read_struct(rad_fmt)
            start_az = rad.start_angle * 0.1
            end_az = start_az + rad.angle_delta * 0.1
            rads.append((start_az, end_az,
                         self._unpack_rle_data(
                             self._buffer.read_binary(2 * rad.num_hwords))))
        start, end, vals = zip(*rads)
        return {'start_az': list(start), 'end_az': list(end), 'data': list(vals),
                'center': (hdr.i_center * self.pos_scale(in_sym_block),
                           hdr.j_center * self.pos_scale(in_sym_block)),
                'gate_scale': hdr.scale_factor * 0.001, 'first': hdr.ind_first_bin}

    digital_radial_hdr_fmt = NamedStruct([('ind_first_bin', 'H'), ('nbins', 'H'),
                                          ('i_center', 'h'), ('j_center', 'h'),
                                          ('scale_factor', 'h'), ('num_rad', 'H')],
                                         '>', 'DigitalRadialHeader')
    digital_radial_fmt = NamedStruct([('num_bytes', 'H'), ('start_angle', 'h'),
                                      ('angle_delta', 'h')], '>', 'DigitalRadialData')

    def _unpack_packet_digital_radial(self, code, in_sym_block):
        hdr = self._buffer.read_struct(self.digital_radial_hdr_fmt)
        rads = []
        for _ in range(hdr.num_rad):
            rad = self._buffer.read_struct(self.digital_radial_fmt)
            start_az = rad.start_angle * 0.1
            end_az = start_az + rad.angle_delta * 0.1
            rads.append((start_az, end_az, self._buffer.read_binary(rad.num_bytes)))
        start, end, vals = zip(*rads)
        return {'start_az': list(start), 'end_az': list(end), 'data': list(vals),
                'center': (hdr.i_center * self.pos_scale(in_sym_block),
                           hdr.j_center * self.pos_scale(in_sym_block)),
                'gate_scale': hdr.scale_factor * 0.001, 'first': hdr.ind_first_bin}

    def _unpack_packet_raster_data(self, code, in_sym_block):
        hdr_fmt = NamedStruct([('code', 'L'),
                               ('i_start', 'h'), ('j_start', 'h'),  # start in km/4
                               ('xscale_int', 'h'), ('xscale_frac', 'h'),
                               ('yscale_int', 'h'), ('yscale_frac', 'h'),
                               ('num_rows', 'h'), ('packing', 'h')], '>', 'RasterData')
        hdr = self._buffer.read_struct(hdr_fmt)
        assert hdr.code == 0x800000C0
        assert hdr.packing == 2
        rows = []
        for _ in range(hdr.num_rows):
            num_bytes = self._buffer.read_int(2, 'big', signed=False)
            rows.append(self._unpack_rle_data(self._buffer.read_binary(num_bytes)))
        return {'start_x': hdr.i_start * hdr.xscale_int,
                'start_y': hdr.j_start * hdr.yscale_int, 'data': rows}

    def _unpack_packet_uniform_text(self, code, in_sym_block):
        # By not using a struct, we can handle multiple codes
        num_bytes = self._buffer.read_int(2, 'big', signed=False)
        if code == 8:
            value = self._buffer.read_int(2, 'big', signed=False)
            read_bytes = 6
        else:
            value = None
            read_bytes = 4
        i_start = self._buffer.read_int(2, 'big', signed=True)
        j_start = self._buffer.read_int(2, 'big', signed=True)

        # Text is what remains beyond what's been read, not including byte count
        text = ''.join(self._buffer.read_ascii(num_bytes - read_bytes))
        return {'x': i_start * self.pos_scale(in_sym_block),
                'y': j_start * self.pos_scale(in_sym_block), 'color': value, 'text': text}

    def _unpack_packet_special_text_symbol(self, code, in_sym_block):
        d = self._unpack_packet_uniform_text(code, in_sym_block)

        # Translate special characters to their meaning
        ret = {}
        symbol_map = {'!': 'past storm position', '"': 'current storm position',
                      '#': 'forecast storm position', '$': 'past MDA position',
                      '%': 'forecast MDA position', ' ': None}

        # Use this meaning as the key in the returned packet
        for c in d['text']:
            if c not in symbol_map:
                log.warning('%s: Unknown special symbol %d/%x.', self.filename, c, ord(c))
            else:
                key = symbol_map[c]
                if key:
                    ret[key] = d['x'], d['y']
        del d['text']

        return ret

    def _unpack_packet_special_graphic_symbol(self, code, in_sym_block):
        type_map = {3: 'Mesocyclone', 11: '3D Correlated Shear', 12: 'TVS',
                    26: 'ETVS', 13: 'Positive Hail', 14: 'Probable Hail',
                    15: 'Storm ID', 19: 'HDA', 25: 'STI Circle'}
        point_feature_map = {1: 'Mesocyclone (ext.)', 3: 'Mesocyclone',
                             5: 'TVS (Ext.)', 6: 'ETVS (Ext.)', 7: 'TVS',
                             8: 'ETVS', 9: 'MDA', 10: 'MDA (Elev.)', 11: 'MDA (Weak)'}

        # Read the number of bytes and set a mark for sanity checking
        num_bytes = self._buffer.read_int(2, 'big', signed=False)
        packet_data_start = self._buffer.set_mark()

        scale = self.pos_scale(in_sym_block)

        # Loop over the bytes we have
        ret = defaultdict(list)
        while self._buffer.offset_from(packet_data_start) < num_bytes:
            # Read position
            ret['x'].append(self._buffer.read_int(2, 'big', signed=True) * scale)
            ret['y'].append(self._buffer.read_int(2, 'big', signed=True) * scale)

            # Handle any types that have additional info
            if code in (3, 11, 25):
                ret['radius'].append(self._buffer.read_int(2, 'big', signed=True) * scale)
            elif code == 15:
                ret['id'].append(''.join(self._buffer.read_ascii(2)))
            elif code == 19:
                ret['POH'].append(self._buffer.read_int(2, 'big', signed=True))
                ret['POSH'].append(self._buffer.read_int(2, 'big', signed=True))
                ret['Max Size'].append(self._buffer.read_int(2, 'big', signed=False))
            elif code == 20:
                kind = self._buffer.read_int(2, 'big', signed=False)
                attr = self._buffer.read_int(2, 'big', signed=False)
                if kind < 5 or kind > 8:
                    ret['radius'].append(attr * scale)

                if kind not in point_feature_map:
                    log.warning('%s: Unknown graphic symbol point kind %d/%x.',
                                self.filename, kind, kind)
                    ret['type'].append(f'Unknown ({kind:d})')
                else:
                    ret['type'].append(point_feature_map[kind])

        # Map the code to a name for this type of symbol
        if code != 20:
            if code not in type_map:
                log.warning('%s: Unknown graphic symbol type %d/%x.',
                            self.filename, code, code)
                ret['type'] = 'Unknown'
            else:
                ret['type'] = type_map[code]

        # Check and return
        assert self._buffer.offset_from(packet_data_start) == num_bytes

        # Reduce dimensions of lists if possible
        reduce_lists(ret)

        return ret

    def _unpack_packet_scit(self, code, in_sym_block):
        num_bytes = self._buffer.read_int(2, 'big', signed=False)
        packet_data_start = self._buffer.set_mark()
        ret = defaultdict(list)
        while self._buffer.offset_from(packet_data_start) < num_bytes:
            next_code = self._buffer.read_int(2, 'big', signed=False)
            if next_code not in self.packet_map:
                log.warning('%s: Unknown packet in SCIT %d/%x.',
                            self.filename, next_code, next_code)
                self._buffer.jump_to(packet_data_start, num_bytes)
                return ret
            else:
                next_packet = self.packet_map[next_code](self, next_code, in_sym_block)
                if next_code == 6:
                    ret['track'].append(next_packet['vectors'])
                elif next_code == 25:
                    ret['STI Circle'].append(next_packet)
                elif next_code == 2:
                    ret['markers'].append(next_packet)
                else:
                    log.warning('%s: Unsupported packet in SCIT %d/%x.',
                                self.filename, next_code, next_code)
                    ret['data'].append(next_packet)
        reduce_lists(ret)
        return ret

    def _unpack_packet_digital_precipitation(self, code, in_sym_block):
        # Read off a couple of unused spares
        self._buffer.read_int(2, 'big', signed=False)
        self._buffer.read_int(2, 'big', signed=False)

        # Get the size of the grid
        lfm_boxes = self._buffer.read_int(2, 'big', signed=False)
        num_rows = self._buffer.read_int(2, 'big', signed=False)
        rows = []

        # Read off each row and decode the RLE data
        for _ in range(num_rows):
            row_num_bytes = self._buffer.read_int(2, 'big', signed=False)
            row_bytes = self._buffer.read_binary(row_num_bytes)
            if code == 18:
                row = self._unpack_rle_data(row_bytes)
            else:
                row = []
                for run, level in zip(row_bytes[::2], row_bytes[1::2]):
                    row.extend([level] * run)
            assert len(row) == lfm_boxes
            rows.append(row)

        return {'data': rows}

    def _unpack_packet_linked_vector(self, code, in_sym_block):
        num_bytes = self._buffer.read_int(2, 'big', signed=True)
        if code == 9:
            value = self._buffer.read_int(2, 'big', signed=True)
            num_bytes -= 2
        else:
            value = None
        scale = self.pos_scale(in_sym_block)
        pos = [b * scale for b in self._buffer.read_binary(num_bytes / 2, '>h')]
        vectors = list(zip(pos[::2], pos[1::2]))
        return {'vectors': vectors, 'color': value}

    def _unpack_packet_vector(self, code, in_sym_block):
        num_bytes = self._buffer.read_int(2, 'big', signed=True)
        if code == 10:
            value = self._buffer.read_int(2, 'big', signed=True)
            num_bytes -= 2
        else:
            value = None
        scale = self.pos_scale(in_sym_block)
        pos = [p * scale for p in self._buffer.read_binary(num_bytes / 2, '>h')]
        vectors = list(zip(pos[::4], pos[1::4], pos[2::4], pos[3::4]))
        return {'vectors': vectors, 'color': value}

    def _unpack_packet_contour_color(self, code, in_sym_block):
        # Check for color value indicator
        assert self._buffer.read_int(2, 'big', signed=False) == 0x0002

        # Read and return value (level) of contour
        return {'color': self._buffer.read_int(2, 'big', signed=False)}

    def _unpack_packet_linked_contour(self, code, in_sym_block):
        # Check for initial point indicator
        assert self._buffer.read_int(2, 'big', signed=False) == 0x8000

        scale = self.pos_scale(in_sym_block)
        startx = self._buffer.read_int(2, 'big', signed=True) * scale
        starty = self._buffer.read_int(2, 'big', signed=True) * scale
        vectors = [(startx, starty)]
        num_bytes = self._buffer.read_int(2, 'big', signed=False)
        pos = [b * scale for b in self._buffer.read_binary(num_bytes / 2, '>h')]
        vectors.extend(zip(pos[::2], pos[1::2]))
        return {'vectors': vectors}

    def _unpack_packet_wind_barbs(self, code, in_sym_block):
        # Figure out how much to read
        num_bytes = self._buffer.read_int(2, 'big', signed=True)
        packet_data_start = self._buffer.set_mark()
        ret = defaultdict(list)

        # Read while we have data, then return
        while self._buffer.offset_from(packet_data_start) < num_bytes:
            ret['color'].append(self._buffer.read_int(2, 'big', signed=True))
            ret['x'].append(self._buffer.read_int(2, 'big', signed=True)
                            * self.pos_scale(in_sym_block))
            ret['y'].append(self._buffer.read_int(2, 'big', signed=True)
                            * self.pos_scale(in_sym_block))
            ret['direc'].append(self._buffer.read_int(2, 'big', signed=True))
            ret['speed'].append(self._buffer.read_int(2, 'big', signed=True))
        return ret

    def _unpack_packet_generic(self, code, in_sym_block):
        # Reserved HW
        assert self._buffer.read_int(2, 'big', signed=True) == 0

        # Read number of bytes (2 HW) and return
        num_bytes = self._buffer.read_int(4, 'big', signed=True)
        hunk = self._buffer.read(num_bytes)
        xdrparser = Level3XDRParser(hunk)
        return xdrparser(code)

    def _unpack_packet_trend_times(self, code, in_sym_block):
        self._buffer.read_int(2, 'big', signed=True)  # number of bytes, not needed to process
        return {'times': self._read_trends()}

    def _unpack_packet_cell_trend(self, code, in_sym_block):
        code_map = ['Cell Top', 'Cell Base', 'Max Reflectivity Height',
                    'Probability of Hail', 'Probability of Severe Hail',
                    'Cell-based VIL', 'Maximum Reflectivity',
                    'Centroid Height']
        code_scales = [100, 100, 100, 1, 1, 1, 1, 100]
        num_bytes = self._buffer.read_int(2, 'big', signed=True)
        packet_data_start = self._buffer.set_mark()
        cell_id = ''.join(self._buffer.read_ascii(2))
        x = self._buffer.read_int(2, 'big', signed=True) * self.pos_scale(in_sym_block)
        y = self._buffer.read_int(2, 'big', signed=True) * self.pos_scale(in_sym_block)
        ret = {'id': cell_id, 'x': x, 'y': y}
        while self._buffer.offset_from(packet_data_start) < num_bytes:
            code = self._buffer.read_int(2, 'big', signed=True)
            try:
                ind = code - 1
                key = code_map[ind]
                scale = code_scales[ind]
            except IndexError:
                log.warning('%s: Unsupported trend code %d/%x.', self.filename, code, code)
                key = 'Unknown'
                scale = 1
            vals = self._read_trends()
            if code in (1, 2):
                ret[f'{key} Limited'] = [v > 700 for v in vals]
                vals = [v - 1000 if v > 700 else v for v in vals]
            ret[key] = [v * scale for v in vals]

        return ret

    def _read_trends(self):
        num_vols, latest = self._buffer.read(2)
        vals = [self._buffer.read_int(2, 'big', signed=True) for _ in range(num_vols)]

        # Wrap the circular buffer so that latest is last
        return vals[latest:] + vals[:latest]

    packet_map = {1: _unpack_packet_uniform_text,
                  2: _unpack_packet_special_text_symbol,
                  3: _unpack_packet_special_graphic_symbol,
                  4: _unpack_packet_wind_barbs,
                  6: _unpack_packet_linked_vector,
                  8: _unpack_packet_uniform_text,
                  # 9: _unpack_packet_linked_vector,
                  10: _unpack_packet_vector,
                  11: _unpack_packet_special_graphic_symbol,
                  12: _unpack_packet_special_graphic_symbol,
                  13: _unpack_packet_special_graphic_symbol,
                  14: _unpack_packet_special_graphic_symbol,
                  15: _unpack_packet_special_graphic_symbol,
                  16: _unpack_packet_digital_radial,
                  17: _unpack_packet_digital_precipitation,
                  18: _unpack_packet_digital_precipitation,
                  19: _unpack_packet_special_graphic_symbol,
                  20: _unpack_packet_special_graphic_symbol,
                  21: _unpack_packet_cell_trend,
                  22: _unpack_packet_trend_times,
                  23: _unpack_packet_scit,
                  24: _unpack_packet_scit,
                  25: _unpack_packet_special_graphic_symbol,
                  26: _unpack_packet_special_graphic_symbol,
                  28: _unpack_packet_generic,
                  29: _unpack_packet_generic,
                  0x0802: _unpack_packet_contour_color,
                  0x0E03: _unpack_packet_linked_contour,
                  0xaf1f: _unpack_packet_radial_data,
                  0xba07: _unpack_packet_raster_data}


class Level3XDRParser(Unpacker):
    """Handle XDR-formatted Level 3 NEXRAD products."""

    def __call__(self, code):
        """Perform the actual unpacking."""
        xdr = OrderedDict()

        if code == 28:
            xdr.update(self._unpack_prod_desc())
        else:
            log.warning('XDR: code %d not implemented', code)

        # Check that we got it all
        self.done()
        return xdr

    def unpack_string(self):
        """Unpack the internal data as a string."""
        return Unpacker.unpack_string(self).decode('ascii')

    def _unpack_prod_desc(self):
        xdr = OrderedDict()

        # NOTE: The ICD (262001U) incorrectly lists op-mode, vcp, el_num, and
        # spare as int*2. Changing to int*4 makes things parse correctly.
        xdr['name'] = self.unpack_string()
        xdr['description'] = self.unpack_string()
        xdr['code'] = self.unpack_int()
        xdr['type'] = self.unpack_int()
        xdr['prod_time'] = self.unpack_uint()
        xdr['radar_name'] = self.unpack_string()
        xdr['latitude'] = self.unpack_float()
        xdr['longitude'] = self.unpack_float()
        xdr['height'] = self.unpack_float()
        xdr['vol_time'] = self.unpack_uint()
        xdr['el_time'] = self.unpack_uint()
        xdr['el_angle'] = self.unpack_float()
        xdr['vol_num'] = self.unpack_int()
        xdr['op_mode'] = self.unpack_int()
        xdr['vcp_num'] = self.unpack_int()
        xdr['el_num'] = self.unpack_int()
        xdr['compression'] = self.unpack_int()
        xdr['uncompressed_size'] = self.unpack_int()
        xdr['parameters'] = self._unpack_parameters()
        xdr['components'] = self._unpack_components()

        return xdr

    def _unpack_parameters(self):
        num = self.unpack_int()

        # ICD documents a "pointer" here, that seems to be garbage. Just read
        # and use the number, starting the list immediately.
        self.unpack_int()

        if num == 0:
            return None

        ret = []
        for i in range(num):
            ret.append((self.unpack_string(), self.unpack_string()))
            if i < num - 1:
                self.unpack_int()  # Another pointer for the 'list' ?

        if num == 1:
            ret = ret[0]

        return ret

    def _unpack_components(self):
        num = self.unpack_int()

        # ICD documents a "pointer" here, that seems to be garbage. Just read
        # and use the number, starting the list immediately.
        self.unpack_int()

        ret = []
        for i in range(num):
            try:
                code = self.unpack_int()
                ret.append(self._component_lookup[code](self))
                if i < num - 1:
                    self.unpack_int()  # Another pointer for the 'list' ?
            except KeyError:
                log.warning('Unknown XDR Component: %d', code)
                break

        if num == 1:
            ret = ret[0]

        return ret

    radial_fmt = namedtuple('RadialComponent', ['description', 'gate_width',
                                                'first_gate', 'parameters',
                                                'radials'])
    radial_data_fmt = namedtuple('RadialData', ['azimuth', 'elevation', 'width',
                                                'num_bins', 'attributes',
                                                'data'])

    def _unpack_radial(self):
        ret = self.radial_fmt(description=self.unpack_string(),
                              gate_width=self.unpack_float(),
                              first_gate=self.unpack_float(),
                              parameters=self._unpack_parameters(),
                              radials=None)
        num_rads = self.unpack_int()
        rads = []
        for _ in range(num_rads):
            # ICD is wrong, says num_bins is float, should be int
            rads.append(self.radial_data_fmt(azimuth=self.unpack_float(),
                                             elevation=self.unpack_float(),
                                             width=self.unpack_float(),
                                             num_bins=self.unpack_int(),
                                             attributes=self.unpack_string(),
                                             data=self.unpack_array(self.unpack_int)))
        return ret._replace(radials=rads)

    text_fmt = namedtuple('TextComponent', ['parameters', 'text'])

    def _unpack_text(self):
        return self.text_fmt(parameters=self._unpack_parameters(),
                             text=self.unpack_string())

    _component_lookup = {1: _unpack_radial, 4: _unpack_text}

ij_to_km = 0.25
wmo_finder = re.compile('((?:NX|SD|NO)US)\\d{2}[\\s\\w\\d]+\\w*(\\w{3})\r\r\n')
header_fmt = NamedStruct([('code', 'H'), ('date', 'H'), ('time', 'l'),
                            ('msg_len', 'L'), ('src_id', 'h'), ('dest_id', 'h'),
                            ('num_blks', 'H')], '>', 'MsgHdr')
# See figure 3-17 in 2620001 document for definition of status bit fields
gsm_fmt = NamedStruct([('divider', 'h'), ('block_len', 'H'),
                        ('op_mode', 'h', BitField('Clear Air', 'Precip')),
                        ('rda_op_status', 'h', BitField('Spare', 'Online',
                                                        'Maintenance Required',
                                                        'Maintenance Mandatory',
                                                        'Commanded Shutdown', 'Inoperable',
                                                        'Spare', 'Wideband Disconnect')),
                        ('vcp', 'h'), ('num_el', 'h'),
                        ('el1', 'h', scaler(0.1)), ('el2', 'h', scaler(0.1)),
                        ('el3', 'h', scaler(0.1)), ('el4', 'h', scaler(0.1)),
                        ('el5', 'h', scaler(0.1)), ('el6', 'h', scaler(0.1)),
                        ('el7', 'h', scaler(0.1)), ('el8', 'h', scaler(0.1)),
                        ('el9', 'h', scaler(0.1)), ('el10', 'h', scaler(0.1)),
                        ('el11', 'h', scaler(0.1)), ('el12', 'h', scaler(0.1)),
                        ('el13', 'h', scaler(0.1)), ('el14', 'h', scaler(0.1)),
                        ('el15', 'h', scaler(0.1)), ('el16', 'h', scaler(0.1)),
                        ('el17', 'h', scaler(0.1)), ('el18', 'h', scaler(0.1)),
                        ('el19', 'h', scaler(0.1)), ('el20', 'h', scaler(0.1)),
                        ('rda_status', 'h', BitField('Spare', 'Startup', 'Standby',
                                                    'Restart', 'Operate',
                                                    'Off-line Operate')),
                        ('rda_alarms', 'h', BitField('Indeterminate', 'Tower/Utilities',
                                                    'Pedestal', 'Transmitter', 'Receiver',
                                                    'RDA Control', 'RDA Communications',
                                                    'Signal Processor')),
                        ('tranmission_enable', 'h', BitField('Spare', 'None',
                                                            'Reflectivity',
                                                            'Velocity', 'Spectrum Width',
                                                            'Dual Pol')),
                        ('rpg_op_status', 'h', BitField('Loadshed', 'Online',
                                                        'Maintenance Required',
                                                        'Maintenance Mandatory',
                                                        'Commanded shutdown')),
                        ('rpg_alarms', 'h', BitField('None', 'Node Connectivity',
                                                    'Wideband Failure',
                                                    'RPG Control Task Failure',
                                                    'Data Base Failure', 'Spare',
                                                    'RPG Input Buffer Loadshed',
                                                    'Spare', 'Product Storage Loadshed'
                                                    'Spare', 'Spare', 'Spare',
                                                    'RPG/RPG Intercomputer Link Failure',
                                                    'Redundant Channel Error',
                                                    'Task Failure', 'Media Failure')),
                        ('rpg_status', 'h', BitField('Restart', 'Operate', 'Standby')),
                        ('rpg_narrowband_status', 'h', BitField('Commanded Disconnect',
                                                                'Narrowband Loadshed')),
                        ('h_ref_calib', 'h', scaler(0.25)),
                        ('prod_avail', 'h', BitField('Product Availability',
                                                    'Degraded Availability',
                                                    'Not Available')),
                        ('super_res_cuts', 'h', Bits(16)),
                        ('cmd_status', 'h', Bits(6)),
                        ('v_ref_calib', 'h', scaler(0.25)),
                        ('rda_build', 'h', version), ('rda_channel', 'h'),
                        ('reserved', 'h'), ('reserved2', 'h'),
                        ('build_version', 'h', version)], '>', 'GSM')
# Build 14.0 added more bytes to the GSM
additional_gsm_fmt = NamedStruct([('el21', 'h', scaler(0.1)),
                                    ('el22', 'h', scaler(0.1)),
                                    ('el23', 'h', scaler(0.1)),
                                    ('el24', 'h', scaler(0.1)),
                                    ('el25', 'h', scaler(0.1)),
                                    ('vcp_supplemental', 'H',
                                    BitField('AVSET', 'SAILS', 'Site VCP', 'RxR Noise',
                                            'CBT', 'VCP Sequence', 'SPRT', 'MRLE',
                                            'Base Tilt', 'MPDA')),
                                    ('supplemental_cut_map', 'H', Bits(16)),
                                    ('supplemental_cut_count', 'B'),
                                    ('supplemental_cut_map2', 'B', Bits(8)),
                                    ('spare', '80s')], '>', 'GSM')
prod_desc_fmt = NamedStruct([('divider', 'h'), ('lat', 'l'), ('lon', 'l'),
                                ('height', 'h'), ('prod_code', 'h'),
                                ('op_mode', 'h'), ('vcp', 'h'), ('seq_num', 'h'),
                                ('vol_num', 'h'), ('vol_date', 'h'),
                                ('vol_start_time', 'l'), ('prod_gen_date', 'h'),
                                ('prod_gen_time', 'l'), ('dep1', 'h'),
                                ('dep2', 'h'), ('el_num', 'h'), ('dep3', 'h'),
                                ('thr1', 'h'), ('thr2', 'h'), ('thr3', 'h'),
                                ('thr4', 'h'), ('thr5', 'h'), ('thr6', 'h'),
                                ('thr7', 'h'), ('thr8', 'h'), ('thr9', 'h'),
                                ('thr10', 'h'), ('thr11', 'h'), ('thr12', 'h'),
                                ('thr13', 'h'), ('thr14', 'h'), ('thr15', 'h'),
                                ('thr16', 'h'), ('dep4', 'h'), ('dep5', 'h'),
                                ('dep6', 'h'), ('dep7', 'h'), ('dep8', 'h'),
                                ('dep9', 'h'), ('dep10', 'h'), ('version', 'b'),
                                ('spot_blank', 'b'), ('sym_off', 'L'), ('graph_off', 'L'),
                                ('tab_off', 'L')], '>', 'ProdDesc')
sym_block_fmt = NamedStruct([('divider', 'h'), ('block_id', 'h'),
                                ('block_len', 'L'), ('nlayer', 'H')], '>', 'SymBlock')
tab_header_fmt = NamedStruct([('divider', 'h'), ('block_id', 'h'),
                                ('block_len', 'L')], '>', 'TabHeader')
tab_block_fmt = NamedStruct([('divider', 'h'), ('num_pages', 'h')], '>', 'TabBlock')
sym_layer_fmt = NamedStruct([('divider', 'h'), ('length', 'L')], '>',
                            'SymLayer')
graph_block_fmt = NamedStruct([('divider', 'h'), ('block_id', 'h'),
                                ('block_len', 'L'), ('num_pages', 'H')], '>', 'GraphBlock')
standalone_tabular = [62, 73, 75, 82]
prod_spec_map = {16: ('Base Reflectivity', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    17: ('Base Reflectivity', 460., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    18: ('Base Reflectivity', 460., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    19: ('Base Reflectivity', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)),
                        ('calib_const', float_elem(7, 8)))),
                    20: ('Base Reflectivity', 460., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)),
                        ('calib_const', float_elem(7, 8)))),
                    21: ('Base Reflectivity', 460., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    22: ('Base Velocity', 60., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3), ('max', 4))),
                    23: ('Base Velocity', 115., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3), ('max', 4))),
                    24: ('Base Velocity', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3), ('max', 4))),
                    25: ('Base Velocity', 60., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3), ('max', 4))),
                    26: ('Base Velocity', 115., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3), ('max', 4))),
                    27: ('Base Velocity', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3), ('max', 4),
                        ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)))),
                    28: ('Base Spectrum Width', 60., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3))),
                    29: ('Base Spectrum Width', 115., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3))),
                    30: ('Base Spectrum Width', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)))),
                    31: ('User Selectable Storm Total Precipitation', 230., LegacyMapper,
                        (('end_hour', 0),
                        ('hour_span', 1),
                        ('null_product', 2),
                        ('max_rainfall', scaled_elem(3, 0.1)),
                        ('rainfall_begin', date_elem(4, 5)),
                        ('rainfall_end', date_elem(6, 7)),
                        ('bias', scaled_elem(8, 0.01)),
                        ('gr_pairs', scaled_elem(5, 0.01)))),
                    32: ('Digital Hybrid Scan Reflectivity', 230., DigitalRefMapper,
                        (('max', 3),
                        ('avg_time', date_elem(4, 5)),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    33: ('Hybrid Scan Reflectivity', 230., LegacyMapper,
                        (('max', 3), ('avg_time', date_elem(4, 5)))),
                    34: ('Clutter Filter Control', 230., LegacyMapper,
                        (('clutter_bitmap', 0),
                        ('cmd_map', 1),
                        ('bypass_map_date', date_elem(4, 5)),
                        ('notchwidth_map_date', date_elem(6, 7)))),
                    35: ('Composite Reflectivity', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    36: ('Composite Reflectivity', 460., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    37: ('Composite Reflectivity', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    38: ('Composite Reflectivity', 460., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    41: ('Echo Tops', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', scaled_elem(3, 1000)))),  # Max in ft
                    48: ('VAD Wind Profile', None, LegacyMapper,
                        (('max', 3),
                        ('dir_max', 4),
                        ('alt_max', scaled_elem(5, 10)))),  # Max in ft
                    50: ('Cross Section Reflectivity', 230., LegacyMapper,
                        (('azimuth1', scaled_elem(0, 0.1)),
                        ('range1', scaled_elem(1, 0.1)),
                        ('azimuth2', scaled_elem(2, 0.1)),
                        ('range2', scaled_elem(3, 0.1)))),
                    51: ('Cross Section Velocity', 230., LegacyMapper,
                        (('azimuth1', scaled_elem(0, 0.1)),
                        ('range1', scaled_elem(1, 0.1)),
                        ('azimuth2', scaled_elem(2, 0.1)),
                        ('range2', scaled_elem(3, 0.1)))),
                    55: ('Storm Relative Mean Radial Velocity', 50., LegacyMapper,
                        (('window_az', scaled_elem(0, 0.1)),
                        ('window_range', scaled_elem(1, 0.1)),
                        ('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3),
                        ('max', 4),
                        ('source', 5),
                        ('height', 6),
                        ('avg_speed', scaled_elem(7, 0.1)),
                        ('avg_dir', scaled_elem(8, 0.1)),
                        ('alert_category', 9))),
                    56: ('Storm Relative Mean Radial Velocity', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3),
                        ('max', 4),
                        ('source', 5),
                        ('avg_speed', scaled_elem(7, 0.1)),
                        ('avg_dir', scaled_elem(8, 0.1)))),
                    57: ('Vertically Integrated Liquid', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3))),  # Max in kg / m^2
                    58: ('Storm Tracking Information', 460., LegacyMapper,
                        (('num_storms', 3),)),
                    59: ('Hail Index', 230., LegacyMapper, ()),
                    61: ('Tornado Vortex Signature', 230., LegacyMapper,
                        (('num_tvs', 3), ('num_etvs', 4))),
                    62: ('Storm Structure', 460., LegacyMapper, ()),
                    63: ('Layer Composite Reflectivity (Layer 1 Average)', 230., LegacyMapper,
                        (('max', 3),
                        ('layer_bottom', scaled_elem(4, 1000.)),
                        ('layer_top', scaled_elem(5, 1000.)),
                        ('calib_const', float_elem(7, 8)))),
                    64: ('Layer Composite Reflectivity (Layer 2 Average)', 230., LegacyMapper,
                        (('max', 3),
                        ('layer_bottom', scaled_elem(4, 1000.)),
                        ('layer_top', scaled_elem(5, 1000.)),
                        ('calib_const', float_elem(7, 8)))),
                    65: ('Layer Composite Reflectivity (Layer 1 Max)', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('layer_bottom', scaled_elem(4, 1000.)),
                        ('layer_top', scaled_elem(5, 1000.)),
                        ('calib_const', float_elem(7, 8)))),
                    66: ('Layer Composite Reflectivity (Layer 2 Max)', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('layer_bottom', scaled_elem(4, 1000.)),
                        ('layer_top', scaled_elem(5, 1000.)),
                        ('calib_const', float_elem(7, 8)))),
                    67: ('Layer Composite Reflectivity - AP Removed', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('layer_bottom', scaled_elem(4, 1000.)),
                        ('layer_top', scaled_elem(5, 1000.)),
                        ('calib_const', float_elem(7, 8)))),
                    74: ('Radar Coded Message', 460., LegacyMapper, ()),
                    78: ('Surface Rainfall Accumulation (1 hour)', 230., LegacyMapper,
                        (('max_rainfall', scaled_elem(3, 0.1)),
                        ('bias', scaled_elem(4, 0.01)),
                        ('gr_pairs', scaled_elem(5, 0.01)),
                        ('rainfall_end', date_elem(6, 7)))),
                    79: ('Surface Rainfall Accumulation (3 hour)', 230., LegacyMapper,
                        (('max_rainfall', scaled_elem(3, 0.1)),
                        ('bias', scaled_elem(4, 0.01)),
                        ('gr_pairs', scaled_elem(5, 0.01)),
                        ('rainfall_end', date_elem(6, 7)))),
                    80: ('Storm Total Rainfall Accumulation', 230., LegacyMapper,
                        (('max_rainfall', scaled_elem(3, 0.1)),
                        ('rainfall_begin', date_elem(4, 5)),
                        ('rainfall_end', date_elem(6, 7)),
                        ('bias', scaled_elem(8, 0.01)),
                        ('gr_pairs', scaled_elem(9, 0.01)))),
                    81: ('Hourly Digital Precipitation Array', 230., PrecipArrayMapper,
                        (('max_rainfall', scaled_elem(3, 0.001)),
                        ('bias', scaled_elem(4, 0.01)),
                        ('gr_pairs', scaled_elem(5, 0.01)),
                        ('rainfall_end', date_elem(6, 7)))),
                    82: ('Supplemental Precipitation Data', None, LegacyMapper, ()),
                    89: ('Layer Composite Reflectivity (Layer 3 Average)', 230., LegacyMapper,
                        (('max', 3),
                        ('layer_bottom', scaled_elem(4, 1000.)),
                        ('layer_top', scaled_elem(5, 1000.)),
                        ('calib_const', float_elem(7, 8)))),
                    90: ('Layer Composite Reflectivity (Layer 3 Max)', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('layer_bottom', scaled_elem(4, 1000.)),
                        ('layer_top', scaled_elem(5, 1000.)),
                        ('calib_const', float_elem(7, 8)))),
                    93: ('ITWS Digital Base Velocity', 115., DigitalVelMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3),
                        ('max', 4), ('precision', 6))),
                    94: ('Base Reflectivity Data Array', 460., DigitalRefMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    95: ('Composite Reflectivity Edited for AP', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    96: ('Composite Reflectivity Edited for AP', 460., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    97: ('Composite Reflectivity Edited for AP', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    98: ('Composite Reflectivity Edited for AP', 460., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('calib_const', float_elem(7, 8)))),
                    99: ('Base Velocity Data Array', 300., DigitalVelMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3),
                        ('max', 4),
                        ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    113: ('Power Removed Control', 300., LegacyMapper,
                        (('rpg_cut_num', 0), ('cmd_generated', 1),
                        ('el_angle', scaled_elem(2, 0.1)),
                        ('clutter_filter_map_dt', date_elem(4, 3)),
                        # While the 2620001Y ICD doesn't talk about using these
                        # product-specific blocks for this product, they have data in them
                        # and the compression info is necessary for proper decoding.
                        ('compression', 7), ('uncompressed_size', combine_elem(8, 9)))),
                    132: ('Clutter Likelihood Reflectivity', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)),)),
                    133: ('Clutter Likelihood Doppler', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)),)),
                    134: ('High Resolution VIL', 460., DigitalVILMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('num_edited', 4),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    135: ('Enhanced Echo Tops', 345., DigitalEETMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', scaled_elem(3, 1000.)),  # Max in ft
                        ('num_edited', 4),
                        ('ref_thresh', 5),
                        ('points_removed', 6),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    138: ('Digital Storm Total Precipitation', 230., DigitalStormPrecipMapper,
                        (('rainfall_begin', date_elem(0, 1)),
                        ('bias', scaled_elem(2, 0.01)),
                        ('max', scaled_elem(3, 0.01)),
                        ('rainfall_end', date_elem(4, 5)),
                        ('gr_pairs', scaled_elem(6, 0.01)),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    141: ('Mesocyclone Detection', 230., LegacyMapper,
                        (('min_ref_thresh', 0),
                        ('overlap_display_filter', 1),
                        ('min_strength_rank', 2))),
                    152: ('Archive III Status Product', None, LegacyMapper,
                        (('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    153: ('Super Resolution Reflectivity Data Array', 460., DigitalRefMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)), ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    154: ('Super Resolution Velocity Data Array', 300., DigitalVelMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3), ('max', 4), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)), ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    155: ('Super Resolution Spectrum Width Data Array', 300.,
                        DigitalSPWMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)), ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    156: ('Turbulence Detection (Eddy Dissipation Rate)', 230., EDRMapper,
                        (('el_start_time', 0),
                        ('el_end_time', 1),
                        ('el_angle', scaled_elem(2, 0.1)),
                        ('min_el', scaled_elem(3, 0.01)),
                        ('mean_el', scaled_elem(4, 0.01)),
                        ('max_el', scaled_elem(5, 0.01)))),
                    157: ('Turbulence Detection (Eddy Dissipation Rate Confidence)', 230.,
                        EDRMapper,
                        (('el_start_time', 0),
                        ('el_end_time', 1),
                        ('el_angle', scaled_elem(2, 0.1)),
                        ('min_el', scaled_elem(3, 0.01)),
                        ('mean_el', scaled_elem(4, 0.01)),
                        ('max_el', scaled_elem(5, 0.01)))),
                    158: ('Differential Reflectivity', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', scaled_elem(3, 0.1)),
                        ('max', scaled_elem(4, 0.1)))),
                    159: ('Digital Differential Reflectivity', 300., GenericDigitalMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', scaled_elem(3, 0.1)),
                        ('max', scaled_elem(4, 0.1)), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)), ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    160: ('Correlation Coefficient', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', scaled_elem(3, 0.00333)),
                        ('max', scaled_elem(4, 0.00333)))),
                    161: ('Digital Correlation Coefficient', 300., GenericDigitalMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', scaled_elem(3, 0.00333)),
                        ('max', scaled_elem(4, 0.00333)), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)), ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    162: ('Specific Differential Phase', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', scaled_elem(3, 0.05)),
                        ('max', scaled_elem(4, 0.05)))),
                    163: ('Digital Specific Differential Phase', 300., GenericDigitalMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', scaled_elem(3, 0.05)),
                        ('max', scaled_elem(4, 0.05)), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)), ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    164: ('Hydrometeor Classification', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),)),
                    165: ('Digital Hydrometeor Classification', 300., DigitalHMCMapper,
                        (('el_angle', scaled_elem(2, 0.1)), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)), ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    166: ('Melting Layer', 230., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)),)),
                    167: ('Super Res Digital Correlation Coefficient', 300.,
                        GenericDigitalMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', scaled_elem(3, 0.00333)),
                        ('max', scaled_elem(4, 0.00333)), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)), ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    168: ('Super Res Digital Phi', 300., GenericDigitalMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3), ('max', 4), ('delta_time', delta_time(6)),
                        ('supplemental_scan', supplemental_scan(6)), ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    169: ('One Hour Accumulation', 230., LegacyMapper,
                        (('null_product', low_byte(2)),
                        ('max', scaled_elem(3, 0.1)),
                        ('rainfall_end', date_elem(4, 5)),
                        ('bias', scaled_elem(6, 0.01)),
                        ('gr_pairs', scaled_elem(7, 0.01)))),
                    170: ('Digital Accumulation Array', 230., GenericDigitalMapper,
                        (('null_product', low_byte(2)),
                        ('max', scaled_elem(3, 0.1)),
                        ('rainfall_end', date_elem(4, 5)),
                        ('bias', scaled_elem(6, 0.01)),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    171: ('Storm Total Accumulation', 230., LegacyMapper,
                        (('rainfall_begin', date_elem(0, 1)),
                        ('null_product', low_byte(2)),
                        ('max', scaled_elem(3, 0.1)),
                        ('rainfall_end', date_elem(4, 5)),
                        ('bias', scaled_elem(6, 0.01)),
                        ('gr_pairs', scaled_elem(7, 0.01)))),
                    172: ('Digital Storm Total Accumulation', 230., GenericDigitalMapper,
                        (('rainfall_begin', date_elem(0, 1)),
                        ('null_product', low_byte(2)),
                        ('max', scaled_elem(3, 0.1)),
                        ('rainfall_end', date_elem(4, 5)),
                        ('bias', scaled_elem(6, 0.01)),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    173: ('Digital User-Selectable Accumulation', 230., GenericDigitalMapper,
                        (('period', 1),
                        ('missing_period', high_byte(2)),
                        ('null_product', low_byte(2)),
                        ('max', scaled_elem(3, 0.1)),
                        ('rainfall_end', date_elem(4, 0)),
                        ('start_time', 5),
                        ('bias', scaled_elem(6, 0.01)),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    174: ('Digital One-Hour Difference Accumulation', 230.,
                        GenericDigitalMapper,
                        (('max', scaled_elem(3, 0.1)),
                        ('rainfall_end', date_elem(4, 5)),
                        ('min', scaled_elem(6, 0.1)),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    175: ('Digital Storm Total Difference Accumulation', 230.,
                        GenericDigitalMapper,
                        (('rainfall_begin', date_elem(0, 1)),
                        ('null_product', low_byte(2)),
                        ('max', scaled_elem(3, 0.1)),
                        ('rainfall_end', date_elem(4, 5)),
                        ('min', scaled_elem(6, 0.1)),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    176: ('Digital Instantaneous Precipitation Rate', 230.,
                        GenericDigitalMapper,
                        (('rainfall_begin', date_elem(0, 1)),
                        ('precip_detected', high_byte(2)),
                        ('need_bias', low_byte(2)),
                        ('max', 3),
                        ('percent_filled', scaled_elem(4, 0.01)),
                        ('max_elev', scaled_elem(5, 0.1)),
                        ('bias', scaled_elem(6, 0.01)),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    177: ('Hybrid Hydrometeor Classification', 230., DigitalHMCMapper,
                        (('mode_filter_size', 3),
                        ('hybrid_percent_filled', 4),
                        ('max_elev', scaled_elem(5, 0.1)),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    180: ('TDWR Base Reflectivity', 90., DigitalRefMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    181: ('TDWR Base Reflectivity', 90., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3))),
                    182: ('TDWR Base Velocity', 90., DigitalVelMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3),
                        ('max', 4),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    183: ('TDWR Base Velocity', 90., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('min', 3),
                        ('max', 4))),
                    185: ('TDWR Base Spectrum Width', 90., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3))),
                    186: ('TDWR Long Range Base Reflectivity', 416., DigitalRefMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3),
                        ('compression', 7),
                        ('uncompressed_size', combine_elem(8, 9)))),
                    187: ('TDWR Long Range Base Reflectivity', 416., LegacyMapper,
                        (('el_angle', scaled_elem(2, 0.1)),
                        ('max', 3)))}