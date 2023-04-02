const BufferPack = require('bufferpack');

function _access_object_by_index(object, index) {
    var keys = Object.keys(object);
    return object[keys[index]];
}

class IOBuffer {
    /* Holds bytes from a buffer to simplify parsing and random access. */

    constructor (source) {
        /* Initialize the IOBuffer with the source data */
        this.buffer = source;
        this._data = source;
        this.reset();
    }
    reset() {
        /* Reset buffer back to initial state */
        this._offset = 0;
        this.clear_marks();
    }
    set_mark() {
        /* Mark the current location and return its id so that the buffer can return later */
        this._bookmarks.push(this._offset);
        return this._bookmarks.length - 1;
    }
    jump_to(mark, offset = 0) {
        /* Jump to a previously set mark */
        this._offset = this._bookmarks[mark] + offset;
    }
    offset_from(mark) {
        /* Calculate the current offset relative to a marked location */
        return this._offset - this._bookmarks[mark];
    }
    clear_marks() {
        /* Clear all marked locations */
        this._bookmarks = [];
    }
    splice(mark, newdata) {
        /* Replace the data after the marked location with the specified data */
        this.jump_to(mark);
        this._data = Buffer.from([...this._data.slice(0, this._offset), ...newdata]);
    }
    read_struct(struct_class) {
        /* Parse and return a structure from the current buffer offset */
        var struct = _unpack_from_buf(this._data, this._offset, struct_class);
        struct = this._check_if_modifier_func(struct_class, struct);
        this.skip(_structure_size(struct_class));
        return struct;
    }
    read_func(func, num_bytes = null) {
        /* Parse data from the current buffer offset using a function */
        // only advance if func succeeds
        var res = func(this.get_next(num_bytes));
        this.skip(num_bytes);
        return res;
    }
    read_ascii(num_bytes = null) {
        /* Return the specified bytes as ascii-formatted text */
        return this.read(num_bytes).toString('ascii');
    }
    read_binary(num, item_type = 'B') {
        /* Parse the current buffer offset as the specified code */
        if (item_type.includes('B')) {
            return this.read(num);
        }

        var order;
        if (['@', '=', '<', '>', '!'].includes(item_type[0])) {
            order = item_type[0];
            item_type = item_type.substring(1);
        } else {
            order = '@';
        }

        var format = `${order}${parseInt(num)}${item_type}`;
        var size = BufferPack.calcLength(format);
        return BufferPack.unpack(format, this.read(size));
    }
    read_int(size, endian, signed) {
        let buffer = this.read(size);
        let offset = 0;
        if (endian == 'little') {
            if (signed) {
                return buffer.readIntLE(offset, size);
            } else {
                return buffer.readUIntLE(offset, size);
            }
        } else {
            if (signed) {
                return buffer.readIntBE(offset, size);
            } else {
                return buffer.readUIntBE(offset, size);
            }
        }
    }
    read_array(count, dtype) {
        /* Read an array of values from the buffer */
        var dataView = new DataView(this._data.buffer, this._offset);
        var elementSize = dtype === 'float64' || dtype === 'int64' ? 8 : 4;
        var length = count === -1 ? (this._data.length - this._offset) / elementSize : count;
        var ret = new window[dtype + 'Array'](this._data.buffer, this._offset, length);
        for (let i = 0; i < length; i++) {
            ret[i] = dataView['get' + dtype](i * elementSize, true);
        }
        this.skip(ret.byteLength);
        return ret;
    }
    read(num_bytes = null) {
        /* Read and return the specified bytes from the buffer */
        var res = this.get_next(num_bytes);
        this.skip(res.length);
        return res;
    }
    get_next(num_bytes = null) {
        /* Get the next bytes in the buffer without modifying the offset */
        if (num_bytes == null) {
            return this._data.slice(this._offset);
        } else {
            return this._data.subarray(this._offset, this._offset + num_bytes);
        }
    }
    skip(num_bytes) {
        /* Jump the ahead the specified bytes in the buffer */
        if (num_bytes == null) {
            this._offset = this._data.length;
        } else {
            this._offset += num_bytes;
        }
    }
    check_remains(num_bytes) {
        /* Check that the number of bytes specified remains in the buffer */
        return this._data.length - this._offset >= num_bytes;
    }
    truncate(num_bytes) {
        /* Remove the specified number of bytes from the end of the buffer */
		this._data = this._data.slice(0, -num_bytes);
	}
    at_end() {
        /* Return whether the buffer has reached the end of data */
        return this._offset >= this._data.length;
    }
    __getitem__(item) {
        /* Return the data at the specified location */
        return this._data[item];
    }
    __str__() {
        /* Return a string representation of the IOBuffer */
        return `Size: ${this._data.length} Offset: ${this._offset}`;
    }
    __len__() {
        /* Return the amount of data in the buffer */
        return this._data.length;
    }

    _check_if_modifier_func(struct_class, struct) {
        for (var i in struct_class) {
            var func = struct_class[i][2];
            var val = _access_object_by_index(struct, i);
            if (func instanceof Function) {
                var converted = func(val);
                struct[Object.keys(struct)[i]] = converted;
            } else if (func instanceof Object) {
                var converted = func.__call__(val);
                struct[Object.keys(struct)[i]] = converted;
            }
        }
        return struct;
    }
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

function _unpack_structure(buffer, structure) {
    /* Unpack a structure from a buffer. */
    var fmt = '>' + structure.map(i => i[1]).join('');  // NEXRAD is big-endian
    var lst = BufferPack.unpack(fmt, buffer);
    var result = structure.reduce((acc, curr, index) => {
        acc[curr[0]] = lst[index];
        return acc;
    }, {});
    return result;
}

// class IOBuffer:
//     """Holds bytes from a buffer to simplify parsing and random access."""

//     def __init__(self, source):
//         """Initialize the IOBuffer with the source data."""
//         self._data = bytearray(source)
//         self.reset()

//     @classmethod
//     def fromfile(cls, fobj):
//         """Initialize the IOBuffer with the contents of the file object."""
//         return cls(fobj.read())

//     def reset(self):
//         """Reset buffer back to initial state."""
//         self._offset = 0
//         self.clear_marks()

//     def set_mark(self):
//         """Mark the current location and return its id so that the buffer can return later."""
//         self._bookmarks.append(self._offset)
//         return len(self._bookmarks) - 1

//     def jump_to(self, mark, offset=0):
//         """Jump to a previously set mark."""
//         self._offset = self._bookmarks[mark] + offset

//     def offset_from(self, mark):
//         """Calculate the current offset relative to a marked location."""
//         return self._offset - self._bookmarks[mark]

//     def clear_marks(self):
//         """Clear all marked locations."""
//         self._bookmarks = []

//     def splice(self, mark, newdata):
//         """Replace the data after the marked location with the specified data."""
//         self.jump_to(mark)
//         self._data = self._data[:self._offset] + bytearray(newdata)

//     def read_struct(self, struct_class):
//         """Parse and return a structure from the current buffer offset."""
//         struct = struct_class.unpack_from(memoryview(self._data), self._offset)
//         self.skip(struct_class.size)
//         return struct

//     def read_func(self, func, num_bytes=None):
//         """Parse data from the current buffer offset using a function."""
//         # only advance if func succeeds
//         res = func(self.get_next(num_bytes))
//         self.skip(num_bytes)
//         return res

//     def read_ascii(self, num_bytes=None):
//         """Return the specified bytes as ascii-formatted text."""
//         return self.read(num_bytes).decode('ascii')

//     def read_binary(self, num, item_type='B'):
//         """Parse the current buffer offset as the specified code."""
//         if 'B' in item_type:
//             return self.read(num)

//         if item_type[0] in ('@', '=', '<', '>', '!'):
//             order = item_type[0]
//             item_type = item_type[1:]
//         else:
//             order = '@'

//         return list(self.read_struct(Struct(order + f'{int(num):d}' + item_type)))

//     def read_int(self, size, endian, signed):
//         """Parse the current buffer offset as the specified integer code."""
//         return int.from_bytes(self.read(size), endian, signed=signed)

//     def read_array(self, count, dtype):
//         """Read an array of values from the buffer."""
//         ret = np.frombuffer(self._data, offset=self._offset, dtype=dtype, count=count)
//         self.skip(ret.nbytes)
//         return ret

//     def read(self, num_bytes=None):
//         """Read and return the specified bytes from the buffer."""
//         res = self.get_next(num_bytes)
//         self.skip(len(res))
//         return res

//     def get_next(self, num_bytes=None):
//         """Get the next bytes in the buffer without modifying the offset."""
//         if num_bytes is None:
//             return self._data[self._offset:]
//         else:
//             return self._data[self._offset:self._offset + num_bytes]

//     def skip(self, num_bytes):
//         """Jump the ahead the specified bytes in the buffer."""
//         if num_bytes is None:
//             self._offset = len(self._data)
//         else:
//             self._offset += num_bytes

//     def check_remains(self, num_bytes):
//         """Check that the number of bytes specified remains in the buffer."""
//         return len(self._data[self._offset:]) == num_bytes

//     def truncate(self, num_bytes):
//         """Remove the specified number of bytes from the end of the buffer."""
//         self._data = self._data[:-num_bytes]

//     def at_end(self):
//         """Return whether the buffer has reached the end of data."""
//         return self._offset >= len(self._data)

//     def __getitem__(self, item):
//         """Return the data at the specified location."""
//         return self._data[item]

//     def __str__(self):
//         """Return a string representation of the IOBuffer."""
//         return f'Size: {len(self._data)} Offset: {self._offset}'

//     def __len__(self):
//         """Return the amount of data in the buffer."""
//         return len(self._data)

module.exports = IOBuffer;