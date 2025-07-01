(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
'use strict';

var possibleNames = [
	'BigInt64Array',
	'BigUint64Array',
	'Float32Array',
	'Float64Array',
	'Int16Array',
	'Int32Array',
	'Int8Array',
	'Uint16Array',
	'Uint32Array',
	'Uint8Array',
	'Uint8ClampedArray'
];

var g = typeof globalThis === 'undefined' ? global : globalThis;

module.exports = function availableTypedArrays() {
	var out = [];
	for (var i = 0; i < possibleNames.length; i++) {
		if (typeof g[possibleNames[i]] === 'function') {
			out[out.length] = possibleNames[i];
		}
	}
	return out;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],3:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":2,"buffer":3,"ieee754":15}],4:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var callBind = require('./');

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};

},{"./":5,"get-intrinsic":10}],5:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var GetIntrinsic = require('get-intrinsic');

var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	var func = $reflectApply(bind, $call, arguments);
	if ($gOPD && $defineProperty) {
		var desc = $gOPD(func, 'length');
		if (desc.configurable) {
			// original length, plus the receiver, minus any additional arguments (after the receiver)
			$defineProperty(
				func,
				'length',
				{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
			);
		}
	}
	return func;
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}

},{"function-bind":9,"get-intrinsic":10}],6:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

module.exports = $gOPD;

},{"get-intrinsic":10}],7:[function(require,module,exports){
'use strict';

var isCallable = require('is-callable');

var toStr = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

var forEachArray = function forEachArray(array, iterator, receiver) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            if (receiver == null) {
                iterator(array[i], i, array);
            } else {
                iterator.call(receiver, array[i], i, array);
            }
        }
    }
};

var forEachString = function forEachString(string, iterator, receiver) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        if (receiver == null) {
            iterator(string.charAt(i), i, string);
        } else {
            iterator.call(receiver, string.charAt(i), i, string);
        }
    }
};

var forEachObject = function forEachObject(object, iterator, receiver) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            if (receiver == null) {
                iterator(object[k], k, object);
            } else {
                iterator.call(receiver, object[k], k, object);
            }
        }
    }
};

var forEach = function forEach(list, iterator, thisArg) {
    if (!isCallable(iterator)) {
        throw new TypeError('iterator must be a function');
    }

    var receiver;
    if (arguments.length >= 3) {
        receiver = thisArg;
    }

    if (toStr.call(list) === '[object Array]') {
        forEachArray(list, iterator, receiver);
    } else if (typeof list === 'string') {
        forEachString(list, iterator, receiver);
    } else {
        forEachObject(list, iterator, receiver);
    }
};

module.exports = forEach;

},{"is-callable":18}],8:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],9:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":8}],10:[function(require,module,exports){
'use strict';

var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = require('has-symbols')();

var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = require('function-bind');
var hasOwn = require('has');
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
var $exec = bind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/g, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

},{"function-bind":9,"has":14,"has-symbols":11}],11:[function(require,module,exports){
'use strict';

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = require('./shams');

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

},{"./shams":12}],12:[function(require,module,exports){
'use strict';

/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

},{}],13:[function(require,module,exports){
'use strict';

var hasSymbols = require('has-symbols/shams');

module.exports = function hasToStringTagShams() {
	return hasSymbols() && !!Symbol.toStringTag;
};

},{"has-symbols/shams":12}],14:[function(require,module,exports){
'use strict';

var bind = require('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":9}],15:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],16:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],17:[function(require,module,exports){
'use strict';

var hasToStringTag = require('has-tostringtag/shams')();
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');

var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return $toString(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

},{"call-bind/callBound":4,"has-tostringtag/shams":13}],18:[function(require,module,exports){
'use strict';

var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
var badArrayLike;
var isCallableMarker;
if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike = Object.defineProperty({}, 'length', {
			get: function () {
				throw isCallableMarker;
			}
		});
		isCallableMarker = {};
		// eslint-disable-next-line no-throw-literal
		reflectApply(function () { throw 42; }, null, badArrayLike);
	} catch (_) {
		if (_ !== isCallableMarker) {
			reflectApply = null;
		}
	}
} else {
	reflectApply = null;
}

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && !!Symbol.toStringTag; // better: use `has-tostringtag`
/* globals document: false */
var documentDotAll = typeof document === 'object' && typeof document.all === 'undefined' && document.all !== undefined ? document.all : {};

module.exports = reflectApply
	? function isCallable(value) {
		if (value === documentDotAll) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (typeof value === 'function' && !value.prototype) { return true; }
		try {
			reflectApply(value, null, badArrayLike);
		} catch (e) {
			if (e !== isCallableMarker) { return false; }
		}
		return !isES6ClassFn(value);
	}
	: function isCallable(value) {
		if (value === documentDotAll) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (typeof value === 'function' && !value.prototype) { return true; }
		if (hasToStringTag) { return tryFunctionObject(value); }
		if (isES6ClassFn(value)) { return false; }
		var strClass = toStr.call(value);
		return strClass === fnClass || strClass === genClass;
	};

},{}],19:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag = require('has-tostringtag/shams')();
var getProto = Object.getPrototypeOf;
var getGeneratorFunc = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var GeneratorFunction;

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}
	if (!hasToStringTag) {
		var str = toStr.call(fn);
		return str === '[object GeneratorFunction]';
	}
	if (!getProto) {
		return false;
	}
	if (typeof GeneratorFunction === 'undefined') {
		var generatorFunc = getGeneratorFunc();
		GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
	}
	return getProto(fn) === GeneratorFunction;
};

},{"has-tostringtag/shams":13}],20:[function(require,module,exports){
(function (global){(function (){
'use strict';

var forEach = require('for-each');
var availableTypedArrays = require('available-typed-arrays');
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');
var hasToStringTag = require('has-tostringtag/shams')();

var g = typeof globalThis === 'undefined' ? global : globalThis;
var typedArrays = availableTypedArrays();

var $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};
var $slice = callBound('String.prototype.slice');
var toStrTags = {};
var gOPD = require('es-abstract/helpers/getOwnPropertyDescriptor');
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		var arr = new g[typedArray]();
		if (Symbol.toStringTag in arr) {
			var proto = getPrototypeOf(arr);
			var descriptor = gOPD(proto, Symbol.toStringTag);
			if (!descriptor) {
				var superProto = getPrototypeOf(proto);
				descriptor = gOPD(superProto, Symbol.toStringTag);
			}
			toStrTags[typedArray] = descriptor.get;
		}
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var anyTrue = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!anyTrue) {
			try {
				anyTrue = getter.call(value) === typedArray;
			} catch (e) { /**/ }
		}
	});
	return anyTrue;
};

module.exports = function isTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag || !(Symbol.toStringTag in value)) {
		var tag = $slice($toString(value), 8, -1);
		return $indexOf(typedArrays, tag) > -1;
	}
	if (!gOPD) { return false; }
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"available-typed-arrays":1,"call-bind/callBound":4,"es-abstract/helpers/getOwnPropertyDescriptor":6,"for-each":7,"has-tostringtag/shams":13}],21:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":22}],22:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],23:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],24:[function(require,module,exports){
// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

'use strict';

var isArgumentsObject = require('is-arguments');
var isGeneratorFunction = require('is-generator-function');
var whichTypedArray = require('which-typed-array');
var isTypedArray = require('is-typed-array');

function uncurryThis(f) {
  return f.call.bind(f);
}

var BigIntSupported = typeof BigInt !== 'undefined';
var SymbolSupported = typeof Symbol !== 'undefined';

var ObjectToString = uncurryThis(Object.prototype.toString);

var numberValue = uncurryThis(Number.prototype.valueOf);
var stringValue = uncurryThis(String.prototype.valueOf);
var booleanValue = uncurryThis(Boolean.prototype.valueOf);

if (BigIntSupported) {
  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
}

if (SymbolSupported) {
  var symbolValue = uncurryThis(Symbol.prototype.valueOf);
}

function checkBoxedPrimitive(value, prototypeValueOf) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    prototypeValueOf(value);
    return true;
  } catch(e) {
    return false;
  }
}

exports.isArgumentsObject = isArgumentsObject;
exports.isGeneratorFunction = isGeneratorFunction;
exports.isTypedArray = isTypedArray;

// Taken from here and modified for better browser support
// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
function isPromise(input) {
	return (
		(
			typeof Promise !== 'undefined' &&
			input instanceof Promise
		) ||
		(
			input !== null &&
			typeof input === 'object' &&
			typeof input.then === 'function' &&
			typeof input.catch === 'function'
		)
	);
}
exports.isPromise = isPromise;

function isArrayBufferView(value) {
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
    return ArrayBuffer.isView(value);
  }

  return (
    isTypedArray(value) ||
    isDataView(value)
  );
}
exports.isArrayBufferView = isArrayBufferView;


function isUint8Array(value) {
  return whichTypedArray(value) === 'Uint8Array';
}
exports.isUint8Array = isUint8Array;

function isUint8ClampedArray(value) {
  return whichTypedArray(value) === 'Uint8ClampedArray';
}
exports.isUint8ClampedArray = isUint8ClampedArray;

function isUint16Array(value) {
  return whichTypedArray(value) === 'Uint16Array';
}
exports.isUint16Array = isUint16Array;

function isUint32Array(value) {
  return whichTypedArray(value) === 'Uint32Array';
}
exports.isUint32Array = isUint32Array;

function isInt8Array(value) {
  return whichTypedArray(value) === 'Int8Array';
}
exports.isInt8Array = isInt8Array;

function isInt16Array(value) {
  return whichTypedArray(value) === 'Int16Array';
}
exports.isInt16Array = isInt16Array;

function isInt32Array(value) {
  return whichTypedArray(value) === 'Int32Array';
}
exports.isInt32Array = isInt32Array;

function isFloat32Array(value) {
  return whichTypedArray(value) === 'Float32Array';
}
exports.isFloat32Array = isFloat32Array;

function isFloat64Array(value) {
  return whichTypedArray(value) === 'Float64Array';
}
exports.isFloat64Array = isFloat64Array;

function isBigInt64Array(value) {
  return whichTypedArray(value) === 'BigInt64Array';
}
exports.isBigInt64Array = isBigInt64Array;

function isBigUint64Array(value) {
  return whichTypedArray(value) === 'BigUint64Array';
}
exports.isBigUint64Array = isBigUint64Array;

function isMapToString(value) {
  return ObjectToString(value) === '[object Map]';
}
isMapToString.working = (
  typeof Map !== 'undefined' &&
  isMapToString(new Map())
);

function isMap(value) {
  if (typeof Map === 'undefined') {
    return false;
  }

  return isMapToString.working
    ? isMapToString(value)
    : value instanceof Map;
}
exports.isMap = isMap;

function isSetToString(value) {
  return ObjectToString(value) === '[object Set]';
}
isSetToString.working = (
  typeof Set !== 'undefined' &&
  isSetToString(new Set())
);
function isSet(value) {
  if (typeof Set === 'undefined') {
    return false;
  }

  return isSetToString.working
    ? isSetToString(value)
    : value instanceof Set;
}
exports.isSet = isSet;

function isWeakMapToString(value) {
  return ObjectToString(value) === '[object WeakMap]';
}
isWeakMapToString.working = (
  typeof WeakMap !== 'undefined' &&
  isWeakMapToString(new WeakMap())
);
function isWeakMap(value) {
  if (typeof WeakMap === 'undefined') {
    return false;
  }

  return isWeakMapToString.working
    ? isWeakMapToString(value)
    : value instanceof WeakMap;
}
exports.isWeakMap = isWeakMap;

function isWeakSetToString(value) {
  return ObjectToString(value) === '[object WeakSet]';
}
isWeakSetToString.working = (
  typeof WeakSet !== 'undefined' &&
  isWeakSetToString(new WeakSet())
);
function isWeakSet(value) {
  return isWeakSetToString(value);
}
exports.isWeakSet = isWeakSet;

function isArrayBufferToString(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}
isArrayBufferToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  isArrayBufferToString(new ArrayBuffer())
);
function isArrayBuffer(value) {
  if (typeof ArrayBuffer === 'undefined') {
    return false;
  }

  return isArrayBufferToString.working
    ? isArrayBufferToString(value)
    : value instanceof ArrayBuffer;
}
exports.isArrayBuffer = isArrayBuffer;

function isDataViewToString(value) {
  return ObjectToString(value) === '[object DataView]';
}
isDataViewToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  typeof DataView !== 'undefined' &&
  isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1))
);
function isDataView(value) {
  if (typeof DataView === 'undefined') {
    return false;
  }

  return isDataViewToString.working
    ? isDataViewToString(value)
    : value instanceof DataView;
}
exports.isDataView = isDataView;

// Store a copy of SharedArrayBuffer in case it's deleted elsewhere
var SharedArrayBufferCopy = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined;
function isSharedArrayBufferToString(value) {
  return ObjectToString(value) === '[object SharedArrayBuffer]';
}
function isSharedArrayBuffer(value) {
  if (typeof SharedArrayBufferCopy === 'undefined') {
    return false;
  }

  if (typeof isSharedArrayBufferToString.working === 'undefined') {
    isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
  }

  return isSharedArrayBufferToString.working
    ? isSharedArrayBufferToString(value)
    : value instanceof SharedArrayBufferCopy;
}
exports.isSharedArrayBuffer = isSharedArrayBuffer;

function isAsyncFunction(value) {
  return ObjectToString(value) === '[object AsyncFunction]';
}
exports.isAsyncFunction = isAsyncFunction;

function isMapIterator(value) {
  return ObjectToString(value) === '[object Map Iterator]';
}
exports.isMapIterator = isMapIterator;

function isSetIterator(value) {
  return ObjectToString(value) === '[object Set Iterator]';
}
exports.isSetIterator = isSetIterator;

function isGeneratorObject(value) {
  return ObjectToString(value) === '[object Generator]';
}
exports.isGeneratorObject = isGeneratorObject;

function isWebAssemblyCompiledModule(value) {
  return ObjectToString(value) === '[object WebAssembly.Module]';
}
exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

function isNumberObject(value) {
  return checkBoxedPrimitive(value, numberValue);
}
exports.isNumberObject = isNumberObject;

function isStringObject(value) {
  return checkBoxedPrimitive(value, stringValue);
}
exports.isStringObject = isStringObject;

function isBooleanObject(value) {
  return checkBoxedPrimitive(value, booleanValue);
}
exports.isBooleanObject = isBooleanObject;

function isBigIntObject(value) {
  return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
}
exports.isBigIntObject = isBigIntObject;

function isSymbolObject(value) {
  return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
}
exports.isSymbolObject = isSymbolObject;

function isBoxedPrimitive(value) {
  return (
    isNumberObject(value) ||
    isStringObject(value) ||
    isBooleanObject(value) ||
    isBigIntObject(value) ||
    isSymbolObject(value)
  );
}
exports.isBoxedPrimitive = isBoxedPrimitive;

function isAnyArrayBuffer(value) {
  return typeof Uint8Array !== 'undefined' && (
    isArrayBuffer(value) ||
    isSharedArrayBuffer(value)
  );
}
exports.isAnyArrayBuffer = isAnyArrayBuffer;

['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
  Object.defineProperty(exports, method, {
    enumerable: false,
    value: function() {
      throw new Error(method + ' is not supported in userland');
    }
  });
});

},{"is-arguments":17,"is-generator-function":19,"is-typed-array":20,"which-typed-array":26}],25:[function(require,module,exports){
(function (process){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  // Allow for deprecating things in the process of starting up.
  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnvRegex = /^$/;

if (process.env.NODE_DEBUG) {
  var debugEnv = process.env.NODE_DEBUG;
  debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i');
}
exports.debuglog = function(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (debugEnvRegex.test(set)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
exports.types = require('./support/types');

function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
exports.types.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;
exports.types.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;
exports.types.isNativeError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
}

exports.promisify.custom = kCustomPromisifiedSymbol

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb.bind(null, null, ret)) },
            function(rej) { process.nextTick(callbackifyOnRejected.bind(null, rej, cb)) });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;

}).call(this)}).call(this,require('_process'))
},{"./support/isBuffer":23,"./support/types":24,"_process":22,"inherits":16}],26:[function(require,module,exports){
(function (global){(function (){
'use strict';

var forEach = require('for-each');
var availableTypedArrays = require('available-typed-arrays');
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');
var hasToStringTag = require('has-tostringtag/shams')();

var g = typeof globalThis === 'undefined' ? global : globalThis;
var typedArrays = availableTypedArrays();

var $slice = callBound('String.prototype.slice');
var toStrTags = {};
var gOPD = require('es-abstract/helpers/getOwnPropertyDescriptor');
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		if (typeof g[typedArray] === 'function') {
			var arr = new g[typedArray]();
			if (Symbol.toStringTag in arr) {
				var proto = getPrototypeOf(arr);
				var descriptor = gOPD(proto, Symbol.toStringTag);
				if (!descriptor) {
					var superProto = getPrototypeOf(proto);
					descriptor = gOPD(superProto, Symbol.toStringTag);
				}
				toStrTags[typedArray] = descriptor.get;
			}
		}
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var foundName = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!foundName) {
			try {
				var name = getter.call(value);
				if (name === typedArray) {
					foundName = name;
				}
			} catch (e) {}
		}
	});
	return foundName;
};

var isTypedArray = require('is-typed-array');

module.exports = function whichTypedArray(value) {
	if (!isTypedArray(value)) { return false; }
	if (!hasToStringTag || !(Symbol.toStringTag in value)) { return $slice($toString(value), 8, -1); }
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"available-typed-arrays":1,"call-bind/callBound":4,"es-abstract/helpers/getOwnPropertyDescriptor":6,"for-each":7,"has-tostringtag/shams":13,"is-typed-array":20}],27:[function(require,module,exports){
const { parser } = require('../packets');
const graphic22 = require('./graphic22');

const parse = (raf) => {
	const blockDivider = raf.readShort();
	// for product 62 the block divider is not present and is a packet code 22
	if (blockDivider === 22) {
		// jump back to allow full parsing of packet
		raf.skip(-2);
		// call the special packet 22 parser
		return graphic22(raf);
	}

	const blockId = raf.readShort();
	const blockLength = raf.readInt();

	// test some known values
	if (blockDivider !== -1) throw new Error(`Invalid graphic block divider: ${blockDivider}`);
	if (blockId !== 2) throw new Error(`Invalid graphic id: ${blockId}`);
	if (blockLength < 1 || blockLength > 65535) throw new Error(`Invalid block length ${blockLength}`);
	if ((blockLength + raf.getPos() - 8) > raf.getLength()) throw new Error(`Block length ${blockLength} overruns file length for block id: ${blockId}`);

	const numberPages = raf.readShort();

	const packets = [];

	if (numberPages < 1 || numberPages > 48 - 1) throw new Error(`Invalid graphic number of pages: ${numberPages}`);

	// read each page
	for (let pageNum = 0; pageNum < numberPages; pageNum += 1) {
		const pageNumber = raf.readShort();
		const pageLength = raf.readShort();

		// calculate end byte
		const endByte = raf.getPos() + pageLength;

		// test page number
		if (pageNum + 1 !== pageNumber) throw new Error(`Invalid page number: ${pageNumber}`);

		// loop through all packets
		while (raf.getPos() < endByte) {
			packets.push(parser(raf));
		}
	}

	return packets;
};

//

module.exports = parse;

},{"../packets":54,"./graphic22":28}],28:[function(require,module,exports){
// parse data in the graphic area as packet 22 and related packets
const { parser } = require('../packets');

const parse22 = (raf) => {
	let result = {
		cells: {},
	};
	// there is no length header so we parse packets until we get a -1 divider
	let divider = raf.readShort();
	while (divider !== -1 && raf.getPos() < raf.getLength()) {
		raf.skip(-2);
		// add parsed data to result
		// parse the data
		const data = parser(raf);
		// one packet 22 (volume times) is returned, add it directly to the output
		if (data.volumeTimes) result = { ...result, ...data };
		// multiple packet 21 (cell data) are returned, add to existing cells
		if (!data.volumeTimes) result.cells = { ...result.cells, ...data };
		// test for end of file
		if (raf.getPos() < raf.getLength())	divider = raf.readShort();
	}

	// skip back final time if there's more data
	if (raf.getPos() < raf.getLength()) raf.skip(-2);
	return result;
};

module.exports = parse22;

},{"../packets":54}],29:[function(require,module,exports){
const parse = (raf) => ({

	code: raf.readShort(),
	julianDate: raf.readShort(),
	seconds: raf.readInt(),
	length: raf.readInt(),
	source: raf.readShort(),
	dest: raf.readShort(),
	blocks: raf.readShort(),

});

module.exports = parse;

},{}],30:[function(require,module,exports){
const MODE_MAINTENANCE = 0;
const MODE_CLEAN_AIR = 1;
const MODE_PRECIPITATION = 2;

const parse = (raf, product) => {
	const divider = raf.readShort();
	// check fixed data values
	if (divider !== -1) throw new Error(`Invalid product description divider: ${divider}`);

	const result = {
		abbreviation: product.abbreviation,
		description: product.description,
		latitude: raf.readInt() / 1000,
		longitude: raf.readInt() / 1000,
		height: raf.readShort(),
		code: raf.readShort(),
		mode: raf.readShort(),
		vcp: raf.readShort(),
		sequenceNumber: raf.readShort(),
		volumeScanNumber: raf.readShort(),
		volumeScanDate: raf.readShort(),
		volumeScanTime: raf.readInt(),
		productDate: raf.readShort(),
		productTime: raf.readInt(),
		// halfwords 27-28 are product dependent
		...(product?.productDescription?.halfwords27_28?.(raf.read(4)) ?? { dependent27_28: raf.read(4) }),
		elevationNumber: raf.readShort(),
		// halfwords 30-53 are product dependent
		...(product?.productDescription?.halfwords30_53?.(raf.read(48)) ?? { dependent30_53: raf.read(48) }),
		version: raf.readByte(),
		spotBlank: raf.readByte(),
		offsetSymbology: raf.readInt(),
		offsetGraphic: raf.readInt(),
		offsetTabular: raf.readInt(),
		supplemental: product.supplemental,
	};

	return result;
};

//

module.exports = {
	parse,
	MODE_MAINTENANCE,
	MODE_CLEAN_AIR,
	MODE_PRECIPITATION,
};

},{}],31:[function(require,module,exports){
// register packet parsers

const { parser } = require('../packets');

const parse = (raf, productDescription, layerCount, options) => {
	const layers = [];
	for (let layerIndex = 0; layerIndex < layerCount; layerIndex += 1) {
		// store starting so skipping the block is possible if layer can't be parsed
		const startPos = raf.getPos();

		// read the header
		const layerDivider = raf.readShort();
		const layerLength = raf.readInt();
		if (layerDivider !== -1) throw new Error(`Invalid layer divider ${layerDivider} in layer ${layerIndex}`);
		if (layerLength + raf.getPos() > raf.getLength()) throw new Error(`Layer size overruns block size for layer ${layerIndex}`);

		try {
			const packets = [];
			while (raf.getPos() < startPos + layerLength) {
				packets.push(parser(raf, productDescription));
			}
			// if there's only one packet return it directly, otherwise return the array
			if (packets.length === 1) {
				layers.push(packets[0]);
			} else {
				layers.push(packets);
			}
		} catch (e) {
			options.logger.warn(e.stack);
			// skip this layer
			raf.seek(startPos + layerLength);
			layers.push(undefined);
		}
	}
	return layers;
};

module.exports = parse;

},{"../packets":54}],32:[function(require,module,exports){
const symbologyText = require('./symbologytext');
// some block ids just have text, this is not well documented so we do our best to parse these
const textSymbologies = [3, 4, 5, 6, 7];

const parse = (raf) => {
	const blockDivider = raf.readShort();
	const blockId = raf.readShort();
	// block id 6 is undocumented but appears to be text
	if (textSymbologies.includes(blockId)) return symbologyText(raf);
	const blockLength = raf.readInt();

	// test some known values
	if (blockDivider !== -1) throw new Error(`Invalid symbology block divider: ${blockDivider}`);
	if (blockId !== 1) throw new Error(`Invalid symbology id: ${blockId}`);
	if ((blockLength + raf.getPos() - 8) > raf.getLength()) throw new Error(`Block length ${blockLength} overruns file length for block id: ${blockId}`);

	const result = {
		numberLayers: raf.readShort(),
	};

	return result;
};

//

module.exports = parse;

},{"./symbologytext":33}],33:[function(require,module,exports){
// block id 6 is undocumented but appears to be text

const parse = (raf) => {
	const pages = [];
	let lines = [];

	// loop until a -1 is encountered
	let length = raf.readShort();
	do {
		while (length !== -1) {
			lines.push(raf.readString(length));
			length = raf.readShort();
		}
		pages.push(lines);
		lines = [];
		// catch the end of file
		if (raf.getPos() < raf.getLength()) {
			length = raf.readShort();
		} else {
			length = -1;
		}
	} while (length === 80);

	// roll back the 4 bytes used to detect the end of the text area
	raf.skip(-4);

	return { pages };
};

//

module.exports = parse;

},{}],34:[function(require,module,exports){
const parseMessageHeader = require('./message');
const { parse: parseProductDescription } = require('./productdescription');

const parse = (raf, product) => {
	const blockDivider = raf.readShort();
	const blockId = raf.readShort();
	const blockLength = raf.readInt();

	// test some known values
	if (blockDivider !== -1) throw new Error(`Invalid tabular block divider: ${blockDivider}`);
	if (blockId !== 3) throw new Error(`Invalid tabular id: ${blockId}`);
	if (blockLength < 1 || blockLength > 65535) throw new Error(`Invalid block length ${blockLength}`);
	if ((blockLength + raf.getPos() - 8) > raf.getLength()) throw new Error(`Block length ${blockLength} overruns file length for block id: ${blockId}`);

	const messageHeader = parseMessageHeader(raf);
	const productDescription = parseProductDescription(raf, product);
	const blockDivider2 = raf.readShort();

	// test some known values
	if (blockDivider2 !== -1) throw new Error(`Invalid second tabular block divider: ${blockDivider2}`);

	const result = {
		messageHeader,
		productDescription,
		totalPages: raf.readShort(),
		charactersPerLine: raf.readShort(),
		pages: [],
	};

	// loop through data until end of page reached
	for (let i = 0; i < result.totalPages; i += 1) {
		// page string
		const lines = [];
		let line = '';
		// loop through lines until end of page reached
		// read two characters at a time to detect end of page
		let chars = raf.readShort();
		while (chars !== -1) {
			// not in specification, but appears to be a line ending
			if (chars !== 0x0050) {
				// write the first character to the line
				line += String.fromCharCode(chars >> 8);
				// test length
				if (line.length % result.charactersPerLine === 0) { lines.push(line); line = ''; }
				// write the first character to the line
				line += String.fromCharCode(chars & 0x00FF);
				// test length
				if (line.length % result.charactersPerLine === 0) { lines.push(line); line = ''; }
			}
			// get next characters
			chars = raf.readShort();
		}
		result.pages.push(lines);
	}

	return result;
};

//

module.exports = parse;

},{"./message":29,"./productdescription":30}],35:[function(require,module,exports){
// file header as 30 byte string

const parse = (raf) => {
	const text = {};
	text.fileType = raf.readString(6);
	// always a space
	raf.readString(1);
	// radar site id
	text.id = raf.readString(4);
	// always a space
	raf.readString(1);
	// ddhhmm day-hour-minute timestamp, returned as a string as a more useful timestamp is contained within the data of the file
	text.ddhhmm = raf.readString(6);
	// line breaks
	raf.readString(3);
	// type of data
	text.type = raf.readString(3);
	// site identifier as 3-letter code
	text.id3 = raf.readString(3);
	// line breaks
	raf.readString(3);

	return text;
};

module.exports = parse;

},{}],36:[function(require,module,exports){
(function (Buffer){(function (){
const bzip = require('seek-bzip');
const { RandomAccessFile } = require('./randomaccessfile');
const textHeader = require('./headers/text');
const messageHeader = require('./headers/message');
const { parse: productDescription } = require('./headers/productdescription');
const symbologyHeader = require('./headers/symbology');
const tabularHeader = require('./headers/tabular');
const graphicHeader = require('./headers/graphic');
const radialPackets = require('./headers/radialpackets');
const { products, productAbbreviations } = require('./products');

// parse data provided from string or buffer
const nexradLevel3Data = (file, _options) => {
	const options = combineOptions(_options);

	// convert to random access file
	const raf = new RandomAccessFile(file);

	// result object
	const result = {};

	// get the header
	result.textHeader = textHeader(raf);

	// text header is not accounted for in data description. Note the length here for additional offset calculations
	const textHeaderLength = raf.getPos();

	// test for valid file
	if (!result.textHeader.fileType.startsWith('SDUS')) throw new Error(`Incorrect file type header: ${result.textHeader.fileType}`);
	if (!productAbbreviations.includes(result.textHeader.type)) throw new Error(`Unsupported product type: ${result.textHeader.type}`);

	// message header
	result.messageHeader = messageHeader(raf);
	// get the product
	const product = products[result.messageHeader.code.toString()];

	// test for product type again
	if (!product) throw new Error(`Unsupported product code: ${result.messageHeader.code}`);

	// product description
	result.productDescription = productDescription(raf, product);

	// test for compressed file and decompress
	let decompressed;
	if (result.productDescription.compressionMethod > 0) {
		// store position in file
		const rafPos = raf.getPos();
		// get the remainder of the file
		const compressed = raf.read(raf.getLength() - raf.getPos());
		const data = bzip.decode(compressed);
		// combine the header from the original file with the decompressed data
		raf.seek(0);
		decompressed = new RandomAccessFile(Buffer.concat([
			raf.read(rafPos),
			data,
		]));
		decompressed.seek(rafPos);
	} else {
		// pass file through
		decompressed = raf;
	}

	// symbology parsing
	try {
		if (result.productDescription.offsetSymbology !== 0) {
			// jump to symbology, convert halfwords to bytes
			const offsetSymbologyBytes = textHeaderLength + result.productDescription.offsetSymbology * 2;
			// error checking
			if (offsetSymbologyBytes > decompressed.getLength()) throw new Error(`Invalid symbology offset: ${result.productDescription.offsetSymbology}`);
			decompressed.seek(offsetSymbologyBytes);

			// read the symbology header
			result.symbology = symbologyHeader(decompressed);
			// read the radial packet header
			result.radialPackets = radialPackets(decompressed, result.productDescription, result.symbology.numberLayers, options);
		}
	} catch (e) {
		options.logger.warn(e.stack);
		options.logger.warn('Unable to parse symbology data');
	}

	// graphic parsing
	try {
		if (result.productDescription.offsetGraphic !== 0) {
		// jump to graphic, convert halfwords to bytes
			const offsetGraphicBytes = textHeaderLength + result.productDescription.offsetGraphic * 2;
			// error checking
			if (offsetGraphicBytes > decompressed.getLength()) throw new Error(`Invalid graphic offset: ${result.productDescription.offsetGraphic}`);
			decompressed.seek(offsetGraphicBytes);

			// read the graphic header
			result.graphic = graphicHeader(decompressed);
		}
	} catch (e) {
		options.logger.warn(e.stack);
		options.logger.warn('Unable to parse graphic data');
	}

	// tabular parsing
	try {
		if (result.productDescription.offsetTabular !== 0) {
		// jump to tabular, convert halfwords to bytes
			const offsetTabularBytes = textHeaderLength + result.productDescription.offsetTabular * 2;
			// error checking
			if (offsetTabularBytes > decompressed.getLength()) throw new Error(`Invalid tabular offset: ${result.productDescription.offsetTabular}`);
			decompressed.seek(offsetTabularBytes);

			// read the tabular header
			result.tabular = tabularHeader(decompressed, product);
		}
	} catch (e) {
		options.logger.warn(e.stack);
		options.logger.warn('Unable to parse tabular data');
	}

	// get formatted data if it exists
	try {
		const formatted = product?.formatter?.(result);
		if (formatted) result.formatted = formatted;
	} catch (e) {
		options.logger.warn(e.stack);
		options.logger.warn('Unable to parse formatted tabular data');
	}

	return result;
};

// combine options and defaults
const combineOptions = (newOptions) => {
	let logger = newOptions?.logger ?? console;
	if (logger === false) logger = nullLogger;
	return {
		...newOptions, logger,
	};
};

const nullLogger = {
	log: () => {},
	error: () => {},
	warn: () => {},
};

module.exports = nexradLevel3Data;

}).call(this)}).call(this,require("buffer").Buffer)
},{"./headers/graphic":27,"./headers/message":29,"./headers/productdescription":30,"./headers/radialpackets":31,"./headers/symbology":32,"./headers/tabular":34,"./headers/text":35,"./products":74,"./randomaccessfile":75,"buffer":3,"seek-bzip":79}],37:[function(require,module,exports){
const code = 1;
const description = 'Text and Special Symbol Packets';

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		iStartingPoint: raf.readShort(),
		jStartingPoint: raf.readShort(),
	};
	// also providethe packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// read the result length
	result.text = raf.readString(lengthOfBlock - 4);

	return result;
};

module.exports = {
	code,
	description,
	parser,
};

},{}],38:[function(require,module,exports){
const code = 16;
const description = 'Digital Radial Data Array Packet';

const parser = (raf, productDescription) => {
	// packet header
	const packetCode = raf.readUShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		firstBin: raf.readShort(),
		numberBins: raf.readShort(),
		iSweepCenter: raf.readShort(),
		jSweepCenter: raf.readShort(),
		rangeScale: raf.readShort() / 1000,
		numberRadials: raf.readShort(),
	};
	// also providethe packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// set up scaling or defaults
	const scaling = {
		scale: productDescription?.plot?.scale ?? 1,
		offset: productDescription?.plot?.offset ?? 0,
	};

	// create a lookup table mapping raw bin values to scaled values
	const scaled = [];
	let start = 0;
	// if a plot object is defined add scaling options
	if (productDescription?.plot?.leadingFlags?.noData === 0) {
		start = 1;
		scaled[0] = null;
	}
	if (productDescription?.plot?.maxDataValue !== undefined) {
		for (let i = start; i <= productDescription.plot.maxDataValue; i += 1) {
			scaled.push(((i - scaling.offset) / scaling.scale));
		}
	} else if (productDescription?.plot?.dataLevels !== undefined) {
		// below threshold and missing are null
		scaled[0] = null;
		scaled[1] = null;
		for (let i = 2; i <= productDescription.plot.dataLevels; i += 1) {
			scaled[i] = productDescription.plot.minimumDataValue + (i * productDescription.plot.dataIncrement);
		}
	}

	// loop through the radials and bins
	// return a structure of [radial][bin]
	// radials provides scaled values per the product's scaling, radialsRaw provides bytes as read from the file
	const radials = [];
	const radialsRaw = [];
	for (let r = 0; r < result.numberRadials; r += 1) {
		const bytesInRadial = raf.readShort();
		const radial = {
			startAngle: raf.readShort() / 10,
			angleDelta: raf.readShort() / 10,
			bins: [],
		};
		const radialRaw = { ...radial, bins: [] };
		for (let i = 0; i < result.numberBins; i += 1) {
			const value = raf.readByte();
			radial.bins.push(scaled[value]);
			radialRaw.bins.push(value);
		}
		radials.push(radial);
		radialsRaw.push(radialRaw);
		// must end on a halfword boundary, skip any additional data if required
		if (bytesInRadial !== result.numberBins) raf.skip(bytesInRadial - result.numberBins);
	}
	result.radials = radials;
	result.radialsRaw = radialsRaw;

	return result;
};

module.exports = {
	code,
	description,
	parser,
};

},{}],39:[function(require,module,exports){
const code = 19;
const description = 'Special Graphic Symbol Packet';

// feature key
const featureKey = {
	1: 'mesocyclone (extrapolated)',
	3: 'mesocyclone (persistent, new or increasing)',
	5: 'TVS (extrapolated)',
	6: 'ETVS (extrapolated)',
	7: 'TVS (persistent, new or increasing)',
	8: 'ETVS (persistent, new or increasing)',
	9: 'MDA Circulation with Strength Rank >= 5 AND with a Base Height <= 1 km ARL or with its base on the lowest elevation angle',
	10: 'MDA Circulation with Strength Rank >= 5 AND with a Base Height > 1 km ARL AND that Base is not on the lowest elevation angle',
	11: ' MDA Circulation with Strength Rank< 5',
};

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		points: [],
	};
	// also providethe packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// read all special symbols
	let i = 0;
	for (i = 0; (i < lengthOfBlock) && (i + 8 < lengthOfBlock); i += 8) {
		const iStartingPoint = raf.readShort();
		const jStartingPoint = raf.readShort();
		const pointFeatureType = raf.readShort();
		const pointFeatureAttribute = raf.readShort();
		result.points.push({
			iStartingPoint,
			jStartingPoint,
			pointFeatureType,
			pointFeatureAttribute,
		});
	}

	// skip past extra data
	raf.skip(result.lengthOfBlock - i);

	return result;
};

module.exports = {
	code,
	description,
	parser,
	supplemental: { featureKey },
};

},{}],40:[function(require,module,exports){
const code = 20;
const description = 'Special Graphic Symbol Packet';

// feature key
const featureKey = {
	1: 'mesocyclone (extrapolated)',
	3: 'mesocyclone (persistent, new or increasing)',
	5: 'TVS (extrapolated)',
	6: 'ETVS (extrapolated)',
	7: 'TVS (persistent, new or increasing)',
	8: 'ETVS (persistent, new or increasing)',
	9: 'MDA Circulation with Strength Rank >= 5 AND with a Base Height <= 1 km ARL or with its base on the lowest elevation angle',
	10: 'MDA Circulation with Strength Rank >= 5 AND with a Base Height > 1 km ARL AND that Base is not on the lowest elevation angle',
	11: ' MDA Circulation with Strength Rank< 5',
};

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		points: [],
	};
	// also providethe packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// read all special symbols
	let i = 0;
	for (i = 0; (i < lengthOfBlock) && (i + 8 <= lengthOfBlock); i += 8) {
		const iStartingPoint = raf.readShort();
		const jStartingPoint = raf.readShort();
		const pointFeatureType = raf.readShort();
		const pointFeatureAttribute = raf.readShort() / 4; // radius in kilometers
		result.points.push({
			iStartingPoint,
			jStartingPoint,
			pointFeatureType,
			pointFeatureAttribute,
		});
	}

	// skip past extra data
	raf.skip(result.lengthOfBlock - i);

	return result;
};

module.exports = {
	code,
	description,
	parser,
	supplemental: { featureKey },
};

},{}],41:[function(require,module,exports){
const code = 21;
const description = 'Special Graphic Symbol Packet';
const { ijToAzDeg } = require('./utilities/ij');

// scaling data for each trend code
const trendCodeScale = [
	null,	// index zero is unused
	100.0,	// feet
	100.0, // feet
	100.0, // feet
	1.00, // %
	1.00, // %
	1.00, // kg/m^2
	1.00, // dBz
	100.0, // feet
];

// trend code meaning
const trendCodes = {
	1: 'Cell top, feet',
	2: 'Cell base, feet',
	3: 'Max ref height, feet',
	4: 'Probability of Hail, %',
	5: 'Probability of Severe Hail, %',
	6: 'Cell based VIL, kg/m^2',
	7: 'Max ref, dBz',
	8: 'Centroid height, feet',
};

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const packetLength = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);
	const startPos = raf.getPos();
	const endPos = startPos + packetLength;

	// parse the data
	const cellId = raf.readString(2);
	const result = {
		iPosition: raf.readShort(),
		jPosition: raf.readShort(),
		trends: [],
	};

	// provide convenience conversions
	const converted = ijToAzDeg(result.iPosition, result.jPosition);
	result.nm = converted.nm;
	result.deg = converted.deg;

	// read the trend packet
	// end is calculated from length
	while (raf.getPos() < endPos) {
		const trendCode = raf.readShort();
		const numberVolumes = raf.readByte();
		// pointer is 1-based, shift to align with javascript 0-based array
		const latestVolumePointer = raf.readByte() - 1;

		const trend = {
			type: trendCodes[trendCode],
			data: [],
		};

		// add a friendly trend code name
		trend.type = trendCodes[trendCode];

		// read data for each volume and scale
		for (let j = 0; j < numberVolumes; j += 1) {
			let value = raf.readShort();
			// test codes 1 and 2 have a special considerating for scaling, subtract 1000 from values over 700
			if ([1, 2].includes(trendCode) && value > 700) value -= 1000;
			trend.data.push(value * trendCodeScale[trendCode]);
		}
		// reshuffle the array with the newest data first
		trend.data = [...trend.data.slice(latestVolumePointer + 1), ...trend.data.slice(0, latestVolumePointer + 1)].reverse();

		// index trends by code
		result.trends[trendCode] = trend;
	}

	return { [cellId]: result };
};

module.exports = {
	code,
	description,
	parser,
};

},{"./utilities/ij":55}],42:[function(require,module,exports){
const code = 22;
const description = 'Cell Trend Data Packet';

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const numberVolumes = raf.readByte();
	// pointer is 1-based, shift to align with javascript 0-based array
	const latestVolumePointer = raf.readByte() - 1;
	const result = {
		volumeTimes: [],
	};

	// read the result length
	for (let i = 0; i < numberVolumes; i += 1) {
		result.volumeTimes.push(raf.readShort());
	}
	// reshuffle the array with the newest data first
	result.volumeTimes = [...result.volumeTimes.slice(latestVolumePointer + 1), ...result.volumeTimes.slice(0, latestVolumePointer + 1)].reverse();

	return result;
};

module.exports = {
	code,
	description,
	parser,
};

},{}],43:[function(require,module,exports){
const code = 23;
const description = 'Special Graphic Symbol Packet';

const parser = (raf) => {
	// must require dynamically to avoid circular dependency when not yet fully executed
	// eslint-disable-next-line global-require
	const { parser: packetParser } = require('.');
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// parse the data as a series of packets
	const endPos = raf.getPos() + lengthOfBlock;
	const result = {
		packets: [],
	};
	while (raf.getPos() < endPos) {
		result.packets.push(packetParser(raf));
	}

	// also provide the packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	return result;
};

module.exports = {
	code,
	description,
	parser,
};

},{".":54}],44:[function(require,module,exports){
const code = 24;
const description = 'Special Graphic Symbol Packet';

// uses the same parser as 23 (0x17)
const { parser } = require('./17');

module.exports = {
	code,
	description,
	parser,
};

},{"./17":43}],45:[function(require,module,exports){
const code = 25;
const description = 'Special Graphic Symbol Packet';

// uses the same parser as 23 (0x17)
const { parser } = require('./17');

module.exports = {
	code,
	description,
	parser,
};

},{"./17":43}],46:[function(require,module,exports){
const code = 2;
const description = 'Text and Special Symbol Packets';

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		iStartingPoint: raf.readShort(),
		jStartingPoint: raf.readShort(),
		text: raf.readString(lengthOfBlock - 4),
	};
	// also providethe packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	return result;
};

module.exports = {
	code,
	description,
	parser,
};

},{}],47:[function(require,module,exports){
const code = 32;
const description = 'Special Graphic Symbol Packet';

// feature key
const featureKey = {
	1: 'mesocyclone (extrapolated)',
	3: 'mesocyclone (persistent, new or increasing)',
	5: 'TVS (extrapolated)',
	6: 'ETVS (extrapolated)',
	7: 'TVS (persistent, new or increasing)',
	8: 'ETVS (persistent, new or increasing)',
	9: 'MDA Circulation with Strength Rank >= 5 AND with a Base Height <= 1 km ARL or with its base on the lowest elevation angle',
	10: 'MDA Circulation with Strength Rank >= 5 AND with a Base Height > 1 km ARL AND that Base is not on the lowest elevation angle',
	11: ' MDA Circulation with Strength Rank< 5',
};

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		points: [],
	};
	// also providethe packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// read all special symbols
	let i = 0;
	for (i = 0; (i < lengthOfBlock) && (i + 8 < lengthOfBlock); i += 8) {
		const iStartingPoint = raf.readShort();
		const jStartingPoint = raf.readShort();
		const pointFeatureType = raf.readShort();
		const pointFeatureAttribute = raf.readShort();
		result.points.push({
			iStartingPoint,
			jStartingPoint,
			pointFeatureType,
			pointFeatureAttribute,
		});
	}

	// skip past extra data
	raf.skip(result.lengthOfBlock - i);

	return result;
};

module.exports = {
	code,
	description,
	parser,
	supplemental: { featureKey },
};

},{}],48:[function(require,module,exports){
const code = 6;
const description = 'Linked Vector Packet';

// i and j = -2048 < i,j < 2047

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		iStartingPoint: raf.readShort(),
		jStartingPoint: raf.readShort(),
		vectors: [],
	};
	// also provide the packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// calculate end byte (off by 4 from starting point)
	const endByte = raf.getPos() + lengthOfBlock - 4;

	// read vectors for length of packet
	while (raf.getPos() < endByte) {
		// read start and end coordinate pairs per vector
		result.vectors.push({
			i: raf.readShort(),
			j: raf.readShort(),
		});
	}

	return result;
};

module.exports = {
	code,
	description,
	parser,
};

},{}],49:[function(require,module,exports){
const code = 8;
const description = 'Text and Special Symbol Packets';

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// parse the data
	const result = {
		color: raf.readShort(),
		iStartingPoint: raf.readShort(),
		jStartingPoint: raf.readShort(),
	};
	// also provide the packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// read the result length
	result.text = raf.readString(lengthOfBlock - 6);

	return result;
};

module.exports = {
	code,
	description,
	parser,
};

},{}],50:[function(require,module,exports){
const code = 10;
const description = 'Unlinked Vector Packet';

// i and j = -2048 < i,j < 2047

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		color: raf.readShort(),
		vectors: [],
	};
	// also provide the packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// calculate end byte (off by 2 from result.color)
	const endByte = raf.getPos() + lengthOfBlock - 2;

	// read vectors for length of packet
	while (raf.getPos() < endByte) {
		// read start and end coordinate pairs per vector
		result.vectors.push({
			start: {
				i: raf.readShort(),
				j: raf.readShort(),

			},
			end: {
				i: raf.readShort(),
				j: raf.readShort(),
			},
		});
	}

	return result;
};

module.exports = {
	code,
	description,
	parser,
};

},{}],51:[function(require,module,exports){
const code = 0xaf1f;
const description = 'Radial Data Packet (16 Data Levels)';
const rle = require('./utilities/rle');

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		firstBin: raf.readShort(),
		numberBins: raf.readShort(),
		iSweepCenter: raf.readShort(),
		jSweepCenter: raf.readShort(),
		rangeScale: raf.readShort() / 1000,
		numRadials: raf.readShort(),
	};
	// also providethe packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// loop through the radials and bins
	// return a structure of [radial][bin]
	const radials = [];
	for (let r = 0; r < result.numRadials; r += 1) {
		// get the rle length
		const rleLength = raf.readShort() * 2;
		const radial = {
			startAngle: raf.readShort() / 10,
			angleDelta: raf.readShort() / 10,
			bins: [],
		};
		for (let i = 0; i < rleLength; i += 1) {
			radial.bins.push(...(rle.expand4_4(raf.readByte())));
		}
		radials.push(radial);
	}
	result.radials = radials;

	return result;
};

module.exports = {
	code,
	description,
	parser,
};

},{"./utilities/rle":56}],52:[function(require,module,exports){
const code = 12;
const description = 'Tornado Vortex Signautre';

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		points: [],
	};
	// also providethe packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// read all special symbols
	let i = 0;
	for (i = 0; (i < lengthOfBlock) && (i + 4 <= lengthOfBlock); i += 4) {
		const iStartingPoint = raf.readShort();
		const jStartingPoint = raf.readShort();
		result.points.push({
			iStartingPoint,
			jStartingPoint,
		});
	}

	// skip past extra data
	raf.skip(result.lengthOfBlock - i);

	return result;
};

module.exports = {
	code,
	description,
	parser,
};

},{}],53:[function(require,module,exports){
const code = 15;
const description = 'Special Graphic Symbol Packet';

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// parse the data
	const result = {
		symbols: [],
	};
	const endPos = raf.getPos() + lengthOfBlock;
	while (raf.getPos() < endPos) {
		result.symbols.push({
			iStartingPoint: raf.readShort(),
			jStartingPoint: raf.readShort(),
			text: raf.readString(2),
		});
	}
	// also provide the packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	return result;
};

module.exports = {
	code,
	description,
	parser,
};

},{}],54:[function(require,module,exports){

const path = require('path');
require('./1')
require('./10')
require('./13')
require('./14')
require('./15')
require('./16')
require('./17')
require('./18')
require('./19')
require('./2')
require('./32')
require('./6')
require('./8')

require('./a')
require('./af1f')
require('./c')
require('./f')

// load all packets in folder automatically
const files = ["1.js","10.js","13.js","14.js","15.js","16.js","17.js","18.js","19.js","2.js","32.js","6.js","8.js","a.js","af1f.js","c.js","f.js","index.js","utilities"].filter((file) => file !== 'utilities' && file !== 'index.js');
// eslint-disable-next-line import/no-dynamic-require, global-require
const packetsRaw = files.map((file) => require('./' + file.slice(0, -3)));

// make up a list of packets by integer type
const packets = {};
packetsRaw.forEach((packet) => {
	if (packets[packet.code]) { throw new Error(`Duplicate packet code ${packet.code}`); }
	packets[packet.code] = packet;
});

// generic packet parser
const parser = (raf, productDescription) => {
	// get the packet code and then jump back in the file so it can be consumed by the packet parser
	const packetCode = raf.readUShort();
	raf.skip(-2);

	// turn into hex packet code
	const packetCodeHex = packetCode.toString(16).padStart(4, '0');

	// look up the packet code
	const packet = packets[packetCode];
	// first layer always results in an error
	if (!packet) throw new Error(`Unsupported packet code 0x${packetCodeHex}`);
	return packet.parser(raf, productDescription);
};

module.exports = {
	packets,
	parser,
};

},{"./1":37,"./10":38,"./13":39,"./14":40,"./15":41,"./16":42,"./17":43,"./18":44,"./19":45,"./2":46,"./32":47,"./6":48,"./8":49,"./a":50,"./af1f":51,"./c":52,"./f":53,"path":21}],55:[function(require,module,exports){
// i,j coordinate functions

// i,j to azimuth/nmi

// default is 4096 i/j units * 0.125 km, converted to nautical miles = 1km = 0.539957nmi
const ijToAzDeg = (i, j, rawScale = 8, conversion = 0.539957) => {
	// calculate nautical miles
	const nm = (Math.sqrt(i ** 2 + j ** 2) / rawScale) * conversion;
	let deg = 0;
	// short circuit potential divide by zero
	if (i === 0) {
		// calculate degrees, then rotate due to north = up = 0 deg convention
		deg = (Math.atan(-j / i) * 180) / Math.PI + 90;
		// coerce to 0<=deg<360
		if (deg < 0) deg += 180;
	}
	return {
		deg,
		nm,
	};
};

module.exports = {
	ijToAzDeg,
};

},{}],56:[function(require,module,exports){
// run length encoding expansion methods

// expand rle from rrrrvvvv, 4-bit run, 4-bit value
// eslint-disable-next-line camelcase
const expand4_4 = (byte) => {
	const run = byte >> 4;
	const value = byte & 0x0F;
	const result = [];
	for (let i = 0; i < run; i += 1) {
		result.push(value);
	}
	return result;
};

module.exports = {
	expand4_4,
};

},{}],57:[function(require,module,exports){
// format the text data provided
// extract data from lines that follow this format
// "        U3               0                   50                <0.50            "
// using this header information
// " CIRC  AZRAN   SR STM |-LOW LEVEL-|  |--DEPTH--|  |-MAX RV-| TVS  MOTION   MSI  "
// "  ID   deg/nm     ID  RV   DV  BASE  kft STMREL%  kft    kts     deg/kts        "
// returns an array of objects

module.exports = (data) => {
	// extract relevant data
	const pages = data?.tabular?.pages;
	if (!pages) return {};
	const result = {};

	// format line by line
	pages.forEach((page) => {
		page.forEach((line) => {
			// extrat values
			const rawMatch = line.match(/ +([0-9.]+) +([0-9.]+)\/ *([0-9.]+) +([0-9.]+) +([A-Z0-9]{2}) +([0-9.]+) +([0-9.]+)[ <]+([0-9.]+)[ <>]+([0-9.]+)[ <>]+([0-9.]+)[ <>]+([0-9.]+)[ <>]+([0-9.]+) +([YN]) {1,4}([0-9.]*)\/* {0,3}([0-9.]*) +([0-9.]*)/);
			if (!rawMatch) return;

			// format the result
			const [, id, az, ran, sr, stmId, llRv, llDv, llBase, depthKft, depthStmrel, maxRvKft, maxrvKts, tvs, motionDeg, motionKts, msi] = [...rawMatch];
			// check for motion
			let motion = false;
			if (motionDeg !== '') {
				motion = {
					deg: +motionDeg,
					kts: +motionKts,
				};
			}
			// store to array
			result[id] = {
				az: +az,
				ran: +ran,
				sr: +sr,
				stmId,
				lowLevel: {
					rv: +llRv,
					dv: +llDv,
					base: +llBase,
				},
				depth: {
					kft: +depthKft,
					stmrel: +depthStmrel,
				},
				maxRv: {
					kft: +maxRvKft,
					kts: +maxrvKts,
				},
				tvs: tvs === 'Y',
				motion,
				msi: msi ?? null,
			};
		});
	});

	return {
		mesocyclone: result,
	};
};

},{}],58:[function(require,module,exports){
const code = 141;
const abbreviation = ['NMD'];
const description = 'Mesocyclone';
const formatter = require('./formatter');
const { RandomAccessFile } = require('../../randomaccessfile');

// 124 Nmi, Geographic and Non-geographic alphanumeric

// eslint-disable-next-line camelcase
const halfwords27_28 = (data) => {
	const raf = new RandomAccessFile(data);
	return {
		minimumReflectivity: raf.readShort(),
		overlapDisplayFilter: raf.readShort(),
	};
};

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	const raf = new RandomAccessFile(data);
	return {
		filterStrengthRank: raf.readShort(),
	};
};

module.exports = {
	code,
	abbreviation,
	description,
	formatter,
	productDescription: {
		halfwords27_28,
		halfwords30_53,
	},
};

},{"../../randomaccessfile":75,"./formatter":57}],59:[function(require,module,exports){
const code = 165;
const abbreviation = ['N0H', 'N1H', 'N2H', 'N3H'];
const description = 'Hydrometeor Classification';
const { RandomAccessFile } = require('../../randomaccessfile');

const key = {
	0: 'ND: Below Threshold',
	10: 'BI: Biological',
	20: 'GC: Anomalous Propagation/Ground Clutter',
	30: 'IC: Ice Crystals',
	40: 'DS: Dry Snow',
	50: 'WS: Wet Snow',
	60: 'RA: Light and/or Moderate Rain',
	70: 'HR: Heavy Rain',
	80: 'BD: Big Drops (rain)',
	90: 'GR: Graupel',
	100: 'HA: Hail, possibly with rain',
	110: 'LH: Large Hail',
	120: 'GH: Giant Hail',
	140: 'UK: Unknown Classification',
	150: 'RF: Range Folded',
};

// eslint-disable-next-line camelcase
const halfwords27_28 = (data) => ({
	halfwords27_28: data,
});

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		elevationAngle: raf.readShort() / 10,
		dependent31_49: raf.read(38),
		...deltaTime(raf.readShort()),
		compressionMethod: raf.readShort(),
		uncompressedSize: (raf.readUShort() << 16) + raf.readUShort(),
		plot: { maxDataValue: 150 },
	};
};

// delta and time are compressed into one field
const deltaTime = (value) => ({
	deltaTime: (value & 0xFFE0) >> 5,
	nonSupplementalScan: (value & 0x001F) === 0,
	sailsScan: (value & 0x001F) === 1,
	mrleScan: (value & 0x001F) === 2,
});

module.exports = {
	code,
	abbreviation,
	description,
	productDescription: {
		halfwords27_28,
		halfwords30_53,
	},
	supplemental: { key },
};

},{"../../randomaccessfile":75}],60:[function(require,module,exports){
const code = 170;
const abbreviation = 'DAA';
const description = 'Digital One Hour Accumulation';
const { RandomAccessFile } = require('../../randomaccessfile');

// eslint-disable-next-line camelcase
const halfwords27_28 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		thresholdMinTime: raf.readShort(),
		totalTime: raf.readShort(),
	};
};

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		nullProductFlag: nullProductFlag(raf.readShort()),
		plot: {
			scale: raf.readFloat() * 100,
			offset: raf.readFloat(),
			dependent35: raf.readShort(),
			maxDataValue: raf.readShort(),
			leadingFlags: leadingFlags(raf.readShort()),
			trailingFlags: raf.readShort(),
		},
		dependent39_46: raf.read(16),
		maxAccumulation: raf.readShort() / 10,
		accumulationEndDate: raf.readShort(),
		accumulationEndMinutes: raf.readShort(),
		meanFieldBias: raf.readShort() / 1000,
		compressionMethod: raf.readShort(),
		uncompressedSize: (raf.readUShort() << 16) + raf.readUShort(),
	};
};

const nullProductFlag = (data) => {
	if (data === 0) return false;
	let reason = '';
	switch (data) {
	case 0:
		reason = false;
		break;
	case 1:
		reason = 'No accumulation available. Threshold: ‘Elapsed Time to Restart’ [TIMRS] xx minutes exceeded.';
		break;
	case 2:
		reason = 'No precipitation detected during the specified time span.';
		break;
	case 3:
		reason = 'No accumulation data available for the specified time span.';
		break;
	case 4:
		reason = 'No precipitation detected since hh:mmZ. Threshold: \'Time Without Precipitation for Resetting Storm Totals\' [RAINT] is xx minutes or No precipitation detected since RPG startup.';
		break;
	case 5:
		reason = 'No precipitation detected since hh:mmZ or No precipitation detected since RPG startup.';
		break;
	case 6:
		reason = 'No Top_of_Hour accumulation - Some problem encountered with the SQL query resulted in an error.';
		break;
	case 7:
		reason = 'No Top_of_Hour accumulation because of excessive missing time encountered.';
		break;
	default:
		reason = 'Undefined';
	}
	return {
		value: data,
		reason,
	};
};

const leadingFlags = (data) => ({
	noData: data & 0x01 === 0,
});

module.exports = {
	code,
	abbreviation,
	description,
	productDescription: {
		halfwords27_28,
		halfwords30_53,
	},
};

},{"../../randomaccessfile":75}],61:[function(require,module,exports){
const code = 172;
const abbreviation = 'DTA';
const description = 'Storm Total Precipitation';
const { RandomAccessFile } = require('../../randomaccessfile');

// eslint-disable-next-line camelcase
const halfwords27_28 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		accumulationStartDate: raf.readShort(),
		accumulationStartMinutes: raf.readShort(),
	};
};

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		nullProductFlag: nullProductFlag(raf.readShort()),
		plot: {
			scale: raf.readFloat() * 100,
			offset: raf.readFloat(),
			dependent35: raf.readShort(),
			maxDataValue: raf.readShort(),
			leadingFlags: leadingFlags(raf.readShort()),
			trailingFlags: raf.readShort(),
		},
		dependent39_46: raf.read(16),
		maxAccumulation: raf.readShort() / 10,
		accumulationEndDate: raf.readShort(),
		accumulationEndMinutes: raf.readShort(),
		meanFieldBias: raf.readShort() / 1000,
		compressionMethod: raf.readShort(),
		uncompressedSize: (raf.readUShort() << 16) + raf.readUShort(),
	};
};

const nullProductFlag = (data) => {
	if (data === 0) return false;
	let reason = '';
	switch (data) {
	case 0:
		reason = false;
		break;
	case 1:
		reason = 'No accumulation available. Threshold: ‘Elapsed Time to Restart’ [TIMRS] xx minutes exceeded.';
		break;
	case 2:
		reason = 'No precipitation detected during the specified time span.';
		break;
	case 3:
		reason = 'No accumulation data available for the specified time span.';
		break;
	case 4:
		reason = 'No precipitation detected since hh:mmZ. Threshold: \'Time Without Precipitation for Resetting Storm Totals\' [RAINT] is xx minutes or No precipitation detected since RPG startup.';
		break;
	case 5:
		reason = 'No precipitation detected since hh:mmZ or No precipitation detected since RPG startup.';
		break;
	case 6:
		reason = 'No Top_of_Hour accumulation - Some problem encountered with the SQL query resulted in an error.';
		break;
	case 7:
		reason = 'No Top_of_Hour accumulation because of excessive missing time encountered.';
		break;
	default:
		reason = 'Undefined';
	}
	return {
		value: data,
		reason,
	};
};

const leadingFlags = (data) => ({
	noData: data & 0x01 === 0,
});

module.exports = {
	code,
	abbreviation,
	description,
	productDescription: {
		halfwords27_28,
		halfwords30_53,
	},
};

},{"../../randomaccessfile":75}],62:[function(require,module,exports){
const code = 177;
const abbreviation = 'HHC';
const description = 'Hybrid Hydrometeor Classification';
const { RandomAccessFile } = require('../../randomaccessfile');

// uses the same data coding as 165
const { key } = require('../165').supplemental;

// eslint-disable-next-line camelcase
const halfwords27_28 = (data) => ({
	halfwords27_28: data,
});

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		dependent30_46: raf.read(34),
		modeFilter: raf.readShort(),
		hybridRatePercentBinsFilled: raf.readShort() / 100,
		highestElevation: raf.readShort() / 10,
		dependent50: raf.read(2),
		compressionMethod: raf.readShort(),
		uncompressedSize: (raf.readUShort() << 16) + raf.readUShort(),
		plot: { maxDataValue: 150 },
	};
};

module.exports = {
	code,
	abbreviation,
	description,
	productDescription: {
		halfwords27_28,
		halfwords30_53,
	},
	supplemental: { key },
};

},{"../../randomaccessfile":75,"../165":59}],63:[function(require,module,exports){
const code = 56;
const abbreviation = ['N0S', 'N1S', 'N2S', 'N3S'];
const description = 'Storm relative velocity';
const { RandomAccessFile } = require('../../randomaccessfile');

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		elevationAngle: raf.readShort() / 10,
		dependent31_46: raf.read(32),
		maxNegativeVelocity: raf.readShort(),	// knots
		maxPositiveVelocity: raf.readShort(),	// knots
		motionSourceFlag: raf.readShort(),	// = -1
		dependent50: raf.readShort(),
		averageStormSpeed: raf.readShort() / 10,	// knots
		averageStormDirection: raf.readShort() / 10, // degrees
	};
};

module.exports = {
	code,
	abbreviation,
	description,

	productDescription: {
		halfwords30_53,
	},
};

},{"../../randomaccessfile":75}],64:[function(require,module,exports){
// format the text data provided
// extract data from lines that follow this format
// "  P2     244/125   232/ 38     245/116   246/107   247/ 97   NO DATA    1.1/ 0.9"
// using this header information
// " STORM    CURRENT POSITION              FORECAST POSITIONS               ERROR  ",
// "  ID     AZRAN     MOVEMENT    15 MIN    30 MIN    45 MIN    60 MIN    FCST/MEAN",
// "        (DEG/NM)  (DEG/KTS)   (DEG/NM)  (DEG/NM)  (DEG/NM)  (DEG/NM)     (NM)   "
// returns an an arrya of objects {
// id: id of storm assigned by algorithm
// current: {deg,nm} current position from radar in degrees and nautical miles
// movement: {deg,kts} movement of storm in degrees and knots
// forecast: [{deg, nm},...] forecasted position of storm in degrees and nm from radar site at [15,30,45,60] minutes
// }

module.exports = (data) => {
	// extract relevant data
	const pages = data?.tabular?.pages;
	if (!pages) return {};
	const result = {};

	// format line by line
	pages.forEach((page) => {
		page.forEach((line) => {
			// look for ID and current position to find valid line
			const idMatch = line.match(/ {2}([A-Z][0-9]) {5}[0-9 ]{3}\/[0-9 ]{3} {3}/);
			if (!idMatch) return;

			// store the id
			const id = idMatch[1];

			// extract 6 positional values
			const rawPositions = [...line.matchAll(/([ 0-9]{3}\/[ 0-9]{3}|NO DATA| {2}NEW {2})/g)];
			// extract the matched strings and parse into objects
			// second string (index 1) is in knots
			const stringPositions = rawPositions.map((position, index) => parseStringPosition(position[1], index === 1));

			// format the result
			const [current, movement, ...forecast] = stringPositions;
			// store to array
			result[id] = {
				current, movement, forecast,
			};
		});
	});

	return {
		storms: result,
	};
};

// parse no data, new and positional info
// kts returns {deg,kts} instead of the default {deg,nm}
const parseStringPosition = (position, kts = false) => {
	// fixed strings
	if (position === 'NO DATA') return null;
	if (position === '  NEW  ') return 'new';

	// extract the two numbers
	const values = position.match(/([ 0-9]{3})\/([ 0-9]{3})/);
	// couldn't find two numbers
	if (!values) return undefined;
	// return the formatted numbers
	if (kts) {
		return {
			deg: +values[1],
			kts: +values[2],
		};
	}
	return {
		deg: +values[1],
		nm: +values[2],
	};
};

},{}],65:[function(require,module,exports){
const code = 58;
const abbreviation = ['NST'];
const description = 'Storm Tracking Information';
const { RandomAccessFile } = require('../../randomaccessfile');
const formatter = require('./formatter');

// 248 Nmi, Geographic and Non-geographic alphanumeric

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		elevationAngle: raf.readShort() / 10,
		dependent31_46: raf.read(32),
		maxNegativeVelocity: raf.readShort(),	// knots
		maxPositiveVelocity: raf.readShort(),	// knots
		motionSourceFlag: raf.readShort(),	// = -1
		dependent50: raf.readShort(),
		averageStormSpeed: raf.readShort() / 10,	// knots
		averageStormDirection: raf.readShort() / 10, // degrees
	};
};

module.exports = {
	code,
	abbreviation,
	description,
	formatter,

	productDescription: {
		halfwords30_53,
	},
};

},{"../../randomaccessfile":75,"./formatter":64}],66:[function(require,module,exports){
// format the text data provided
// extract data from lines that follow this format
// "        U3               0                   50                <0.50            "
// using this header information
// "      STORM       PROBABILITY OF       PROBABILITY OF       MAX EXPECTED        "
// "        ID        SEVERE HAIL (%)         HAIL (%)         HAIL SIZE (IN)       "
// returns an array of objects {
// id: id of storm assigned by algorithm
// probSevere: probability of severe hail %
// probHail: probability of hail %
// maxSize: max expected size of hail (read as <x.xx in)
// }

module.exports = (data) => {
	// extract relevant data
	const pages = data?.tabular?.pages;
	if (!pages) return {};
	const result = {};

	// format line by line
	pages.forEach((page) => {
		page.forEach((line) => {
			// extrat values
			const rawMatch = line.match(/ {8}([A-Z]\d) {4} *([0-9.]{1,3}) *([0-9.]{1,3}) *<?>?([0-9.]{4,6}) */);
			if (!rawMatch) return;

			// format the result
			const [, id, probSevere, probHail, maxSize] = [...rawMatch];
			// store to array
			result[id] = {
				probSevere: +probSevere,
				probHail: +probHail,
				maxSize: +maxSize,
			};
		});
	});

	return {
		hail: result,
	};
};

},{}],67:[function(require,module,exports){
const code = 59;
const abbreviation = ['NHI'];
const description = 'Hail Index';
const formatter = require('./formatter');

// 124 Nmi, Geographic and Non-geographic alphanumeric

module.exports = {
	code,
	abbreviation,
	description,
	formatter,

	productDescription: {
	},
};

},{"./formatter":66}],68:[function(require,module,exports){
// format the text data provided
// extract data from lines that follow this format
// "  TVS    F0    74/ 52    35    52    52/ 4.9   >11.1  < 4.9/ 16.0    16/ 4.9    "
// using this header information
// " Feat  Storm   AZ/RAN  AVGDV  LLDV  MXDV/Hgt   Depth    Base/Top   MXSHR/Hgt    "
// " Type    ID   (deg,nm)  (kt)  (kt)  (kt,kft)   (kft)     (kft)     (E-3/s,kft)  "
// returns an array of objects {
// type: feature type
// id: id of storm assigned by algorithm
// az: azimuth
// range: range to storm
// avgdv
// lldv
// mxdv
// mxdvhgt
// depth
// base
// top
// maxshear
// maxshearheight
// }

module.exports = (data) => {
	// extract relevant data
	const pages = data?.tabular?.pages;
	if (!pages) return {};
	const result = {};

	// format line by line
	pages.forEach((page) => {
		page.forEach((line) => {
			// extrat values
			const rawMatch = line.match(/ {2}([A-Z0-9]{3}) {4}([A-Z][0-9]) {3,5}([0-9.]{1,3})\/ {0,2}([0-9.]{1,3}) {3,5}([0-9.]{1,3}) {3,5}([0-9.]{1,3}) {3,5}([0-9.]{1,3})\/ {0,2}([0-9.]{1,3})[ <>]{4}([0-9.]{4})[ <>]{3,4}([0-9.]{3,4})\/ {0,2}([0-9.]{1,4}) {3,5}([0-9.]{2,4})\/ {0,2}([0-9.]{1,4})/);
			if (!rawMatch) return;

			// format the result
			const [, type, id, az, range, avfdv, lldv, mxdv, mvdvhgt, depth, base, top, maxshear, maxshearheight] = [...rawMatch];
			// store to array
			result[id] = {
				type,
				az: +az,
				range: +range,
				avfdv: +avfdv,
				lldv: +lldv,
				mxdv: +mxdv,
				mvdvhgt: +mvdvhgt,
				depth: +depth,
				base: +base,
				top: +top,
				maxshear: +maxshear,
				maxshearheight: +maxshearheight,
			};
		});
	});

	return {
		tvs: result,
	};
};

},{}],69:[function(require,module,exports){
const code = 61;
const abbreviation = ['NTV'];
const description = 'Tornadic Vortex Signature';
const formatter = require('./formatter');

module.exports = {
	code,
	abbreviation,
	description,
	formatter,

	productDescription: {
	},
};

},{"./formatter":68}],70:[function(require,module,exports){
const code = 62;
const abbreviation = ['NSS'];
const description = 'Storm Structure';

// not much work to do for this product
// the data resides in the headers directly
// see symbology6.js and graphic22.js

module.exports = {
	code,
	abbreviation,
	description,

	productDescription: {
	},
};

},{}],71:[function(require,module,exports){
const code = 78;
const abbreviation = 'N1P';
const description = 'One-hour precipitation';
const { RandomAccessFile } = require('../../randomaccessfile');

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	raf.seek(34);
	return {
		maxRainfall: raf.readShort() / 10,
		meanFieldBias: raf.readShort() / 100,
		sampleSize: raf.readShort() / 100,
		endRanifallDate: raf.readShort(),
		endRainfallMinutes: raf.readShort(),
		plot: {
			maxDataValue: 16,
		},
	};
};

module.exports = {
	code,
	abbreviation,
	description,
	productDescription: {
		halfwords30_53,
	},
};

},{"../../randomaccessfile":75}],72:[function(require,module,exports){
const code = 80;
const abbreviation = 'NTP';
const description = 'Storm Total Rainfall Accumulation';
const { RandomAccessFile } = require('../../randomaccessfile');

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	raf.seek(34);
	return {
		maxRainfall: raf.readShort() / 10,
		beginRanifallDate: raf.readShort(),
		beginRainfallMinutes: raf.readShort(),
		endRanifallDate: raf.readShort(),
		endRainfallMinutes: raf.readShort(),
		meanFieldBias: raf.readShort() / 100,
		sampleSize: raf.readShort() / 100,
		plot: {
			maxDataValue: 16,
		},
	};
};

module.exports = {
	code,
	abbreviation,
	description,
	productDescription: {
		halfwords30_53,
	},
};

},{"../../randomaccessfile":75}],73:[function(require,module,exports){
const code = 94;
const abbreviation = ['NXQ', 'NYQ', 'NZQ', 'N0Q', 'NAQ', 'N1Q', 'NBQ', 'N2Q', 'N3Q'];
const description = 'Digital Base Reflectivity';
const { RandomAccessFile } = require('../../randomaccessfile');

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		elevationAngle: raf.readShort() / 10,
		plot: {
			minimumDataValue: raf.readShort() / 10,
			dataIncrement: raf.readShort() / 10,
			dataLevels: raf.readShort(),
		},
		dependent34_46: raf.read(26),
		maxReflectivity: raf.readShort(),	// dBZ
		dependent48_49: raf.read(4),
		...deltaTime(raf.readShort()),
		compressionMethod: raf.readShort(),
		uncompressedProductSize: (raf.readUShort() << 16) + raf.readUShort(),
	};
};

// delta and time are compressed into one field
const deltaTime = (value) => ({
	deltaTime: (value & 0xFFE0) >> 5,
	nonSupplementalScan: (value & 0x001F) === 0,
	sailsScan: (value & 0x001F) === 1,
	mrleScan: (value & 0x001F) === 2,
});

module.exports = {
	code,
	abbreviation,
	description,

	productDescription: {
		halfwords30_53,
	},
};

},{"../../randomaccessfile":75}],74:[function(require,module,exports){

const path = require('path');

require('./56')
require('./58')
require('./59')
require('./61')
require('./62')
require('./78')
require('./80')
require('./94')
require('./141')
require('./165')
require('./170')
require('./172')
require('./177')

// load all products in folder automatically
const folders = ["141","165","170","172","177","56","58","59","61","62","78","80","94","index.js"].filter((folder) => folder !== 'index.js');
// eslint-disable-next-line import/no-dynamic-require, global-require
const productsRaw = folders.map((folder) => require('./' + folder));

// make up a list of products by integer type
const products = {};
productsRaw.forEach((product) => {
	if (products[product.code]) { throw new Error(`Duplicate product code ${product.code}`); }
	products[product.code] = product;
});

// list of available product code abbreviations for type-checking
const productAbbreviations = productsRaw.map((product) => product.abbreviation).flat();

module.exports = {
	products,
	productAbbreviations,
};

},{"./141":58,"./165":59,"./170":60,"./172":61,"./177":62,"./56":63,"./58":65,"./59":67,"./61":69,"./62":70,"./78":71,"./80":72,"./94":73,"path":21}],75:[function(require,module,exports){
(function (Buffer){(function (){
const BIG_ENDIAN = 0;
const LITTLE_ENDIAN = 1;

// store a buffer or string and add functionality for random access
class RandomAccessFile {
	constructor(file, endian = BIG_ENDIAN, stringFormat = 'utf-8') {
		this.offset = 0;
		this.buffer = null;
		this.stringFormat = stringFormat;

		// set the binary endian order
		if (endian < 0) return;
		this.bigEndian = (endian === BIG_ENDIAN);

		// string to buffer if string was provided
		if (typeof file === 'string') {
			this.buffer = Buffer.from(file, 'binary');
		} else {
			// load the buffer directly
			this.buffer = file;
		}

		// set up local read functions so we don't constantly query endianess
		if (this.bigEndian) {
			this.readFloatLocal = this.buffer.readFloatBE.bind(this.buffer);
			this.readIntLocal = this.buffer.readIntBE.bind(this.buffer);
			this.readUIntLocal = this.buffer.readUIntBE.bind(this.buffer);
		}	else {
			this.readFloatLocal = this.buffer.readFloatLE.bind(this.buffer);
			this.readIntLocal = this.buffer.readIntLE.bind(this.buffer);
			this.readUIntLocal = this.buffer.readUIntLE.bind(this.buffer);
		}
	}

	// return the current buffer length
	getLength() {
		return this.buffer.length;
	}

	// return the current position in the file
	getPos() {
		return this.offset;
	}

	// seek to a provided buffer offset
	seek(byte) {
		this.offset = byte;
	}

	// read a string from the buffer
	readString(bytes) {
		const data = this.buffer.toString(this.stringFormat, this.offset, (this.offset += bytes));
		return data;
	}

	// read a float from the buffer
	readFloat() {
		const float = this.readFloatLocal(this.offset);
		this.offset += 4;
		return float;
	}

	// read a number from the buffer
	readInt() {
		const int = this.readIntLocal(this.offset, 4);
		this.offset += 4;
		return int;
	}

	// read an unsigned number from the buffer
	readUInt() {
		const int = this.readUIntLocal(this.offset, 4);
		this.offset += 4;
		return int;
	}

	// read a short from the buffer
	readShort() {
		const short = this.readIntLocal(this.offset, 2);
		this.offset += 2;
		return short;
	}

	// read an unsigned short from the buffer
	readUShort() {
		const short = this.readUIntLocal(this.offset, 2);
		this.offset += 2;
		return short;
	}

	// read a byte from the buffer
	readByte() {
		return this.read()[0];
	}

	// read a set number of bytes from the buffer and return as an array
	read(bytes = 1) {
		const data = this.buffer.slice(this.offset, this.offset + bytes);
		this.offset += bytes;
		return data;
	}

	// skip a set number of bites and update the offset
	skip(bytes) {
		this.offset += bytes;
	}
}

module.exports.RandomAccessFile = RandomAccessFile;
module.exports.BIG_ENDIAN = BIG_ENDIAN;
module.exports.LITTLE_ENDIAN = LITTLE_ENDIAN;

}).call(this)}).call(this,require("buffer").Buffer)
},{"buffer":3}],76:[function(require,module,exports){
(function (Buffer){(function (){
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */


const util = require('util');
const nexradLevel3Data = require('./src');
const parser = require('./src');

// read file

// 56 N0S Storm relative velocity
// const file = fs.readFileSync('./data/LOT_N0S_2021_01_31_11_06_30');

// 58 NTP Storm Tracking Information
// const file = fs.readFileSync('./data/JAX_NST_2021_04_11_19_37_00');
// const file = fs.readFileSync('./data/TBW_NST_2021_04_19_19_02');
// const file = fs.readFileSync('./data/KDGX_NST_2022_01_16_09_31');	// error packet id 0x0019

// 59 NHI Hail Index
// const file = fs.readFileSync('./data/DTW_NHI_2021_04_08_19_47');
// const file = fs.readFileSync('./data/TBW_NHI_2021_04_19_19_02');

// 61 NTV
// const file = fs.readFileSync('./data/sn.0011');
// const file = fs.readFileSync('./data/sn.0012');

// 62 NSS
// const file = fs.readFileSync('./data/TBW_NSS_2021_04_19_19_02');
// const file = fs.readFileSync('./data/KBYX_NSS_2022_01_16_09_31');	// error with block id 4
// const file = fs.readFileSync('./data/KCAE_NSS_2022_01_16_09_31');	// error with block id 5
// const file = fs.readFileSync('./data/KFFC_NSS_2022_01_16_09_31');	// error with block id 7
// const file = fs.readFileSync('./data-error/KLOT_NSS_2022_01_16_09_31');	// error with block id 3
// const file = fs.readFileSync('./data-error/KLTX_NSS_2022_02_15_06_44');	// error with block id 3

// 78 One-hour precipitation
// const file = fs.readFileSync('./data/LOT_N1P_2021_01_31_11_06_30');

// 80 NTP Storm total accumulation
// const file = fs.readFileSync('./data/LOT_NTP_2021_01_31_11_06_30');

// 94 NXQ Digital Base Reflectivy
// const file = fs.readFileSync('./data/SDUS53 KLOT 150709');

// 141 NMD Mesocyclone
// const file = fs.readFileSync('./data/LOT_NMD_2021_06_21_04_22_17');

// 165 N0H Hydrometeor classification
// const file = fs.readFileSync('./data/LOT_N0H_2021_01_31_11_06_30');

// 172 DTA Storm Total Precipitation
// const file = fs.readFileSync('./data/LOT_DTA_2021_02_28_15_05_33');
// const file = fs.readFileSync('./data/LOT_DTA_2021_05_08_03_47_25');	// has error
// const file = fs.readFileSync('./data/LOT_DAA_2021_05_08_03_40_29');	// different radial packet from standard = 1, no radial data

// 177 HHC Hybrid Hydrometeor classification
const file = Buffer("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","base64");

// pass to parser as a string or buffer
const level3Data = nexradLevel3Data(file);

// try different loggers
// const level3Data = parser(file, { logger: false });
// const level3Data = parser(file, { logger: customLogger });

// console.log(util.inspect(level3Data, true, 10));
console.log(level3Data);

}).call(this)}).call(this,require("buffer").Buffer)
},{"./src":36,"buffer":3,"util":25}],77:[function(require,module,exports){
(function (Buffer){(function (){
/*
node-bzip - a pure-javascript Node.JS module for decoding bzip2 data

Copyright (C) 2012 Eli Skeggs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Adapted from bzip2.js, copyright 2011 antimatter15 (antimatter15@gmail.com).

Based on micro-bunzip by Rob Landley (rob@landley.net).

Based on bzip2 decompression code by Julian R Seward (jseward@acm.org),
which also acknowledges contributions by Mike Burrows, David Wheeler,
Peter Fenwick, Alistair Moffat, Radford Neal, Ian H. Witten,
Robert Sedgewick, and Jon L. Bentley.
*/

var BITMASK = [0x00, 0x01, 0x03, 0x07, 0x0F, 0x1F, 0x3F, 0x7F, 0xFF];

// offset in bytes
var BitReader = function(stream) {
  this.stream = stream;
  this.bitOffset = 0;
  this.curByte = 0;
  this.hasByte = false;
};

BitReader.prototype._ensureByte = function() {
  if (!this.hasByte) {
    this.curByte = this.stream.readByte();
    this.hasByte = true;
  }
};

// reads bits from the buffer
BitReader.prototype.read = function(bits) {
  var result = 0;
  while (bits > 0) {
    this._ensureByte();
    var remaining = 8 - this.bitOffset;
    // if we're in a byte
    if (bits >= remaining) {
      result <<= remaining;
      result |= BITMASK[remaining] & this.curByte;
      this.hasByte = false;
      this.bitOffset = 0;
      bits -= remaining;
    } else {
      result <<= bits;
      var shift = remaining - bits;
      result |= (this.curByte & (BITMASK[bits] << shift)) >> shift;
      this.bitOffset += bits;
      bits = 0;
    }
  }
  return result;
};

// seek to an arbitrary point in the buffer (expressed in bits)
BitReader.prototype.seek = function(pos) {
  var n_bit = pos % 8;
  var n_byte = (pos - n_bit) / 8;
  this.bitOffset = n_bit;
  this.stream.seek(n_byte);
  this.hasByte = false;
};

// reads 6 bytes worth of data using the read method
BitReader.prototype.pi = function() {
  var buf = new Buffer(6), i;
  for (i = 0; i < buf.length; i++) {
    buf[i] = this.read(8);
  }
  return buf.toString('hex');
};

module.exports = BitReader;

}).call(this)}).call(this,require("buffer").Buffer)
},{"buffer":3}],78:[function(require,module,exports){
/* CRC32, used in Bzip2 implementation.
 * This is a port of CRC32.java from the jbzip2 implementation at
 *   https://code.google.com/p/jbzip2
 * which is:
 *   Copyright (c) 2011 Matthew Francis
 *
 *   Permission is hereby granted, free of charge, to any person
 *   obtaining a copy of this software and associated documentation
 *   files (the "Software"), to deal in the Software without
 *   restriction, including without limitation the rights to use,
 *   copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following
 *   conditions:
 *
 *   The above copyright notice and this permission notice shall be
 *   included in all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 *   OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 *   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *   OTHER DEALINGS IN THE SOFTWARE.
 * This JavaScript implementation is:
 *   Copyright (c) 2013 C. Scott Ananian
 * with the same licensing terms as Matthew Francis' original implementation.
 */
module.exports = (function() {

  /**
   * A static CRC lookup table
   */
  var crc32Lookup = new Uint32Array([
    0x00000000, 0x04c11db7, 0x09823b6e, 0x0d4326d9, 0x130476dc, 0x17c56b6b, 0x1a864db2, 0x1e475005,
    0x2608edb8, 0x22c9f00f, 0x2f8ad6d6, 0x2b4bcb61, 0x350c9b64, 0x31cd86d3, 0x3c8ea00a, 0x384fbdbd,
    0x4c11db70, 0x48d0c6c7, 0x4593e01e, 0x4152fda9, 0x5f15adac, 0x5bd4b01b, 0x569796c2, 0x52568b75,
    0x6a1936c8, 0x6ed82b7f, 0x639b0da6, 0x675a1011, 0x791d4014, 0x7ddc5da3, 0x709f7b7a, 0x745e66cd,
    0x9823b6e0, 0x9ce2ab57, 0x91a18d8e, 0x95609039, 0x8b27c03c, 0x8fe6dd8b, 0x82a5fb52, 0x8664e6e5,
    0xbe2b5b58, 0xbaea46ef, 0xb7a96036, 0xb3687d81, 0xad2f2d84, 0xa9ee3033, 0xa4ad16ea, 0xa06c0b5d,
    0xd4326d90, 0xd0f37027, 0xddb056fe, 0xd9714b49, 0xc7361b4c, 0xc3f706fb, 0xceb42022, 0xca753d95,
    0xf23a8028, 0xf6fb9d9f, 0xfbb8bb46, 0xff79a6f1, 0xe13ef6f4, 0xe5ffeb43, 0xe8bccd9a, 0xec7dd02d,
    0x34867077, 0x30476dc0, 0x3d044b19, 0x39c556ae, 0x278206ab, 0x23431b1c, 0x2e003dc5, 0x2ac12072,
    0x128e9dcf, 0x164f8078, 0x1b0ca6a1, 0x1fcdbb16, 0x018aeb13, 0x054bf6a4, 0x0808d07d, 0x0cc9cdca,
    0x7897ab07, 0x7c56b6b0, 0x71159069, 0x75d48dde, 0x6b93dddb, 0x6f52c06c, 0x6211e6b5, 0x66d0fb02,
    0x5e9f46bf, 0x5a5e5b08, 0x571d7dd1, 0x53dc6066, 0x4d9b3063, 0x495a2dd4, 0x44190b0d, 0x40d816ba,
    0xaca5c697, 0xa864db20, 0xa527fdf9, 0xa1e6e04e, 0xbfa1b04b, 0xbb60adfc, 0xb6238b25, 0xb2e29692,
    0x8aad2b2f, 0x8e6c3698, 0x832f1041, 0x87ee0df6, 0x99a95df3, 0x9d684044, 0x902b669d, 0x94ea7b2a,
    0xe0b41de7, 0xe4750050, 0xe9362689, 0xedf73b3e, 0xf3b06b3b, 0xf771768c, 0xfa325055, 0xfef34de2,
    0xc6bcf05f, 0xc27dede8, 0xcf3ecb31, 0xcbffd686, 0xd5b88683, 0xd1799b34, 0xdc3abded, 0xd8fba05a,
    0x690ce0ee, 0x6dcdfd59, 0x608edb80, 0x644fc637, 0x7a089632, 0x7ec98b85, 0x738aad5c, 0x774bb0eb,
    0x4f040d56, 0x4bc510e1, 0x46863638, 0x42472b8f, 0x5c007b8a, 0x58c1663d, 0x558240e4, 0x51435d53,
    0x251d3b9e, 0x21dc2629, 0x2c9f00f0, 0x285e1d47, 0x36194d42, 0x32d850f5, 0x3f9b762c, 0x3b5a6b9b,
    0x0315d626, 0x07d4cb91, 0x0a97ed48, 0x0e56f0ff, 0x1011a0fa, 0x14d0bd4d, 0x19939b94, 0x1d528623,
    0xf12f560e, 0xf5ee4bb9, 0xf8ad6d60, 0xfc6c70d7, 0xe22b20d2, 0xe6ea3d65, 0xeba91bbc, 0xef68060b,
    0xd727bbb6, 0xd3e6a601, 0xdea580d8, 0xda649d6f, 0xc423cd6a, 0xc0e2d0dd, 0xcda1f604, 0xc960ebb3,
    0xbd3e8d7e, 0xb9ff90c9, 0xb4bcb610, 0xb07daba7, 0xae3afba2, 0xaafbe615, 0xa7b8c0cc, 0xa379dd7b,
    0x9b3660c6, 0x9ff77d71, 0x92b45ba8, 0x9675461f, 0x8832161a, 0x8cf30bad, 0x81b02d74, 0x857130c3,
    0x5d8a9099, 0x594b8d2e, 0x5408abf7, 0x50c9b640, 0x4e8ee645, 0x4a4ffbf2, 0x470cdd2b, 0x43cdc09c,
    0x7b827d21, 0x7f436096, 0x7200464f, 0x76c15bf8, 0x68860bfd, 0x6c47164a, 0x61043093, 0x65c52d24,
    0x119b4be9, 0x155a565e, 0x18197087, 0x1cd86d30, 0x029f3d35, 0x065e2082, 0x0b1d065b, 0x0fdc1bec,
    0x3793a651, 0x3352bbe6, 0x3e119d3f, 0x3ad08088, 0x2497d08d, 0x2056cd3a, 0x2d15ebe3, 0x29d4f654,
    0xc5a92679, 0xc1683bce, 0xcc2b1d17, 0xc8ea00a0, 0xd6ad50a5, 0xd26c4d12, 0xdf2f6bcb, 0xdbee767c,
    0xe3a1cbc1, 0xe760d676, 0xea23f0af, 0xeee2ed18, 0xf0a5bd1d, 0xf464a0aa, 0xf9278673, 0xfde69bc4,
    0x89b8fd09, 0x8d79e0be, 0x803ac667, 0x84fbdbd0, 0x9abc8bd5, 0x9e7d9662, 0x933eb0bb, 0x97ffad0c,
    0xafb010b1, 0xab710d06, 0xa6322bdf, 0xa2f33668, 0xbcb4666d, 0xb8757bda, 0xb5365d03, 0xb1f740b4
  ]);

  var CRC32 = function() {
    /**
     * The current CRC
     */
    var crc = 0xffffffff;

    /**
     * @return The current CRC
     */
    this.getCRC = function() {
      return (~crc) >>> 0; // return an unsigned value
    };

    /**
     * Update the CRC with a single byte
     * @param value The value to update the CRC with
     */
    this.updateCRC = function(value) {
      crc = (crc << 8) ^ crc32Lookup[((crc >>> 24) ^ value) & 0xff];
    };

    /**
     * Update the CRC with a sequence of identical bytes
     * @param value The value to update the CRC with
     * @param count The number of bytes
     */
    this.updateCRCRun = function(value, count) {
      while (count-- > 0) {
        crc = (crc << 8) ^ crc32Lookup[((crc >>> 24) ^ value) & 0xff];
      }
    };
  };
  return CRC32;
})();

},{}],79:[function(require,module,exports){
(function (Buffer){(function (){
/*
seek-bzip - a pure-javascript module for seeking within bzip2 data

Copyright (C) 2013 C. Scott Ananian
Copyright (C) 2012 Eli Skeggs
Copyright (C) 2011 Kevin Kwok

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Adapted from node-bzip, copyright 2012 Eli Skeggs.
Adapted from bzip2.js, copyright 2011 Kevin Kwok (antimatter15@gmail.com).

Based on micro-bunzip by Rob Landley (rob@landley.net).

Based on bzip2 decompression code by Julian R Seward (jseward@acm.org),
which also acknowledges contributions by Mike Burrows, David Wheeler,
Peter Fenwick, Alistair Moffat, Radford Neal, Ian H. Witten,
Robert Sedgewick, and Jon L. Bentley.
*/

var BitReader = require('./bitreader');
var Stream = require('./stream');
var CRC32 = require('./crc32');
var pjson = require('../package.json');

var MAX_HUFCODE_BITS = 20;
var MAX_SYMBOLS = 258;
var SYMBOL_RUNA = 0;
var SYMBOL_RUNB = 1;
var MIN_GROUPS = 2;
var MAX_GROUPS = 6;
var GROUP_SIZE = 50;

var WHOLEPI = "314159265359";
var SQRTPI = "177245385090";

var mtf = function(array, index) {
  var src = array[index], i;
  for (i = index; i > 0; i--) {
    array[i] = array[i-1];
  }
  array[0] = src;
  return src;
};

var Err = {
  OK: 0,
  LAST_BLOCK: -1,
  NOT_BZIP_DATA: -2,
  UNEXPECTED_INPUT_EOF: -3,
  UNEXPECTED_OUTPUT_EOF: -4,
  DATA_ERROR: -5,
  OUT_OF_MEMORY: -6,
  OBSOLETE_INPUT: -7,
  END_OF_BLOCK: -8
};
var ErrorMessages = {};
ErrorMessages[Err.LAST_BLOCK] =            "Bad file checksum";
ErrorMessages[Err.NOT_BZIP_DATA] =         "Not bzip data";
ErrorMessages[Err.UNEXPECTED_INPUT_EOF] =  "Unexpected input EOF";
ErrorMessages[Err.UNEXPECTED_OUTPUT_EOF] = "Unexpected output EOF";
ErrorMessages[Err.DATA_ERROR] =            "Data error";
ErrorMessages[Err.OUT_OF_MEMORY] =         "Out of memory";
ErrorMessages[Err.OBSOLETE_INPUT] = "Obsolete (pre 0.9.5) bzip format not supported.";

var _throw = function(status, optDetail) {
  var msg = ErrorMessages[status] || 'unknown error';
  if (optDetail) { msg += ': '+optDetail; }
  var e = new TypeError(msg);
  e.errorCode = status;
  throw e;
};

var Bunzip = function(inputStream, outputStream) {
  this.writePos = this.writeCurrent = this.writeCount = 0;

  this._start_bunzip(inputStream, outputStream);
};
Bunzip.prototype._init_block = function() {
  var moreBlocks = this._get_next_block();
  if ( !moreBlocks ) {
    this.writeCount = -1;
    return false; /* no more blocks */
  }
  this.blockCRC = new CRC32();
  return true;
};
/* XXX micro-bunzip uses (inputStream, inputBuffer, len) as arguments */
Bunzip.prototype._start_bunzip = function(inputStream, outputStream) {
  /* Ensure that file starts with "BZh['1'-'9']." */
  var buf = new Buffer(4);
  if (inputStream.read(buf, 0, 4) !== 4 ||
      String.fromCharCode(buf[0], buf[1], buf[2]) !== 'BZh')
    _throw(Err.NOT_BZIP_DATA, 'bad magic');

  var level = buf[3] - 0x30;
  if (level < 1 || level > 9)
    _throw(Err.NOT_BZIP_DATA, 'level out of range');

  this.reader = new BitReader(inputStream);

  /* Fourth byte (ascii '1'-'9'), indicates block size in units of 100k of
     uncompressed data.  Allocate intermediate buffer for block. */
  this.dbufSize = 100000 * level;
  this.nextoutput = 0;
  this.outputStream = outputStream;
  this.streamCRC = 0;
};
Bunzip.prototype._get_next_block = function() {
  var i, j, k;
  var reader = this.reader;
  // this is get_next_block() function from micro-bunzip:
  /* Read in header signature and CRC, then validate signature.
     (last block signature means CRC is for whole file, return now) */
  var h = reader.pi();
  if (h === SQRTPI) { // last block
    return false; /* no more blocks */
  }
  if (h !== WHOLEPI)
    _throw(Err.NOT_BZIP_DATA);
  this.targetBlockCRC = reader.read(32) >>> 0; // (convert to unsigned)
  this.streamCRC = (this.targetBlockCRC ^
                    ((this.streamCRC << 1) | (this.streamCRC>>>31))) >>> 0;
  /* We can add support for blockRandomised if anybody complains.  There was
     some code for this in busybox 1.0.0-pre3, but nobody ever noticed that
     it didn't actually work. */
  if (reader.read(1))
    _throw(Err.OBSOLETE_INPUT);
  var origPointer = reader.read(24);
  if (origPointer > this.dbufSize)
    _throw(Err.DATA_ERROR, 'initial position out of bounds');
  /* mapping table: if some byte values are never used (encoding things
     like ascii text), the compression code removes the gaps to have fewer
     symbols to deal with, and writes a sparse bitfield indicating which
     values were present.  We make a translation table to convert the symbols
     back to the corresponding bytes. */
  var t = reader.read(16);
  var symToByte = new Buffer(256), symTotal = 0;
  for (i = 0; i < 16; i++) {
    if (t & (1 << (0xF - i))) {
      var o = i * 16;
      k = reader.read(16);
      for (j = 0; j < 16; j++)
        if (k & (1 << (0xF - j)))
          symToByte[symTotal++] = o + j;
    }
  }

  /* How many different huffman coding groups does this block use? */
  var groupCount = reader.read(3);
  if (groupCount < MIN_GROUPS || groupCount > MAX_GROUPS)
    _throw(Err.DATA_ERROR);
  /* nSelectors: Every GROUP_SIZE many symbols we select a new huffman coding
     group.  Read in the group selector list, which is stored as MTF encoded
     bit runs.  (MTF=Move To Front, as each value is used it's moved to the
     start of the list.) */
  var nSelectors = reader.read(15);
  if (nSelectors === 0)
    _throw(Err.DATA_ERROR);

  var mtfSymbol = new Buffer(256);
  for (i = 0; i < groupCount; i++)
    mtfSymbol[i] = i;

  var selectors = new Buffer(nSelectors); // was 32768...

  for (i = 0; i < nSelectors; i++) {
    /* Get next value */
    for (j = 0; reader.read(1); j++)
      if (j >= groupCount) _throw(Err.DATA_ERROR);
    /* Decode MTF to get the next selector */
    selectors[i] = mtf(mtfSymbol, j);
  }

  /* Read the huffman coding tables for each group, which code for symTotal
     literal symbols, plus two run symbols (RUNA, RUNB) */
  var symCount = symTotal + 2;
  var groups = [], hufGroup;
  for (j = 0; j < groupCount; j++) {
    var length = new Buffer(symCount), temp = new Uint16Array(MAX_HUFCODE_BITS + 1);
    /* Read huffman code lengths for each symbol.  They're stored in
       a way similar to mtf; record a starting value for the first symbol,
       and an offset from the previous value for everys symbol after that. */
    t = reader.read(5); // lengths
    for (i = 0; i < symCount; i++) {
      for (;;) {
        if (t < 1 || t > MAX_HUFCODE_BITS) _throw(Err.DATA_ERROR);
        /* If first bit is 0, stop.  Else second bit indicates whether
           to increment or decrement the value. */
        if(!reader.read(1))
          break;
        if(!reader.read(1))
          t++;
        else
          t--;
      }
      length[i] = t;
    }

    /* Find largest and smallest lengths in this group */
    var minLen,  maxLen;
    minLen = maxLen = length[0];
    for (i = 1; i < symCount; i++) {
      if (length[i] > maxLen)
        maxLen = length[i];
      else if (length[i] < minLen)
        minLen = length[i];
    }

    /* Calculate permute[], base[], and limit[] tables from length[].
     *
     * permute[] is the lookup table for converting huffman coded symbols
     * into decoded symbols.  base[] is the amount to subtract from the
     * value of a huffman symbol of a given length when using permute[].
     *
     * limit[] indicates the largest numerical value a symbol with a given
     * number of bits can have.  This is how the huffman codes can vary in
     * length: each code with a value>limit[length] needs another bit.
     */
    hufGroup = {};
    groups.push(hufGroup);
    hufGroup.permute = new Uint16Array(MAX_SYMBOLS);
    hufGroup.limit = new Uint32Array(MAX_HUFCODE_BITS + 2);
    hufGroup.base = new Uint32Array(MAX_HUFCODE_BITS + 1);
    hufGroup.minLen = minLen;
    hufGroup.maxLen = maxLen;
    /* Calculate permute[].  Concurently, initialize temp[] and limit[]. */
    var pp = 0;
    for (i = minLen; i <= maxLen; i++) {
      temp[i] = hufGroup.limit[i] = 0;
      for (t = 0; t < symCount; t++)
        if (length[t] === i)
          hufGroup.permute[pp++] = t;
    }
    /* Count symbols coded for at each bit length */
    for (i = 0; i < symCount; i++)
      temp[length[i]]++;
    /* Calculate limit[] (the largest symbol-coding value at each bit
     * length, which is (previous limit<<1)+symbols at this level), and
     * base[] (number of symbols to ignore at each bit length, which is
     * limit minus the cumulative count of symbols coded for already). */
    pp = t = 0;
    for (i = minLen; i < maxLen; i++) {
      pp += temp[i];
      /* We read the largest possible symbol size and then unget bits
         after determining how many we need, and those extra bits could
         be set to anything.  (They're noise from future symbols.)  At
         each level we're really only interested in the first few bits,
         so here we set all the trailing to-be-ignored bits to 1 so they
         don't affect the value>limit[length] comparison. */
      hufGroup.limit[i] = pp - 1;
      pp <<= 1;
      t += temp[i];
      hufGroup.base[i + 1] = pp - t;
    }
    hufGroup.limit[maxLen + 1] = Number.MAX_VALUE; /* Sentinal value for reading next sym. */
    hufGroup.limit[maxLen] = pp + temp[maxLen] - 1;
    hufGroup.base[minLen] = 0;
  }
  /* We've finished reading and digesting the block header.  Now read this
     block's huffman coded symbols from the file and undo the huffman coding
     and run length encoding, saving the result into dbuf[dbufCount++]=uc */

  /* Initialize symbol occurrence counters and symbol Move To Front table */
  var byteCount = new Uint32Array(256);
  for (i = 0; i < 256; i++)
    mtfSymbol[i] = i;
  /* Loop through compressed symbols. */
  var runPos = 0, dbufCount = 0, selector = 0, uc;
  var dbuf = this.dbuf = new Uint32Array(this.dbufSize);
  symCount = 0;
  for (;;) {
    /* Determine which huffman coding group to use. */
    if (!(symCount--)) {
      symCount = GROUP_SIZE - 1;
      if (selector >= nSelectors) { _throw(Err.DATA_ERROR); }
      hufGroup = groups[selectors[selector++]];
    }
    /* Read next huffman-coded symbol. */
    i = hufGroup.minLen;
    j = reader.read(i);
    for (;;i++) {
      if (i > hufGroup.maxLen) { _throw(Err.DATA_ERROR); }
      if (j <= hufGroup.limit[i])
        break;
      j = (j << 1) | reader.read(1);
    }
    /* Huffman decode value to get nextSym (with bounds checking) */
    j -= hufGroup.base[i];
    if (j < 0 || j >= MAX_SYMBOLS) { _throw(Err.DATA_ERROR); }
    var nextSym = hufGroup.permute[j];
    /* We have now decoded the symbol, which indicates either a new literal
       byte, or a repeated run of the most recent literal byte.  First,
       check if nextSym indicates a repeated run, and if so loop collecting
       how many times to repeat the last literal. */
    if (nextSym === SYMBOL_RUNA || nextSym === SYMBOL_RUNB) {
      /* If this is the start of a new run, zero out counter */
      if (!runPos){
        runPos = 1;
        t = 0;
      }
      /* Neat trick that saves 1 symbol: instead of or-ing 0 or 1 at
         each bit position, add 1 or 2 instead.  For example,
         1011 is 1<<0 + 1<<1 + 2<<2.  1010 is 2<<0 + 2<<1 + 1<<2.
         You can make any bit pattern that way using 1 less symbol than
         the basic or 0/1 method (except all bits 0, which would use no
         symbols, but a run of length 0 doesn't mean anything in this
         context).  Thus space is saved. */
      if (nextSym === SYMBOL_RUNA)
        t += runPos;
      else
        t += 2 * runPos;
      runPos <<= 1;
      continue;
    }
    /* When we hit the first non-run symbol after a run, we now know
       how many times to repeat the last literal, so append that many
       copies to our buffer of decoded symbols (dbuf) now.  (The last
       literal used is the one at the head of the mtfSymbol array.) */
    if (runPos){
      runPos = 0;
      if (dbufCount + t > this.dbufSize) { _throw(Err.DATA_ERROR); }
      uc = symToByte[mtfSymbol[0]];
      byteCount[uc] += t;
      while (t--)
        dbuf[dbufCount++] = uc;
    }
    /* Is this the terminating symbol? */
    if (nextSym > symTotal)
      break;
    /* At this point, nextSym indicates a new literal character.  Subtract
       one to get the position in the MTF array at which this literal is
       currently to be found.  (Note that the result can't be -1 or 0,
       because 0 and 1 are RUNA and RUNB.  But another instance of the
       first symbol in the mtf array, position 0, would have been handled
       as part of a run above.  Therefore 1 unused mtf position minus
       2 non-literal nextSym values equals -1.) */
    if (dbufCount >= this.dbufSize) { _throw(Err.DATA_ERROR); }
    i = nextSym - 1;
    uc = mtf(mtfSymbol, i);
    uc = symToByte[uc];
    /* We have our literal byte.  Save it into dbuf. */
    byteCount[uc]++;
    dbuf[dbufCount++] = uc;
  }
  /* At this point, we've read all the huffman-coded symbols (and repeated
     runs) for this block from the input stream, and decoded them into the
     intermediate buffer.  There are dbufCount many decoded bytes in dbuf[].
     Now undo the Burrows-Wheeler transform on dbuf.
     See http://dogma.net/markn/articles/bwt/bwt.htm
  */
  if (origPointer < 0 || origPointer >= dbufCount) { _throw(Err.DATA_ERROR); }
  /* Turn byteCount into cumulative occurrence counts of 0 to n-1. */
  j = 0;
  for (i = 0; i < 256; i++) {
    k = j + byteCount[i];
    byteCount[i] = j;
    j = k;
  }
  /* Figure out what order dbuf would be in if we sorted it. */
  for (i = 0; i < dbufCount; i++) {
    uc = dbuf[i] & 0xff;
    dbuf[byteCount[uc]] |= (i << 8);
    byteCount[uc]++;
  }
  /* Decode first byte by hand to initialize "previous" byte.  Note that it
     doesn't get output, and if the first three characters are identical
     it doesn't qualify as a run (hence writeRunCountdown=5). */
  var pos = 0, current = 0, run = 0;
  if (dbufCount) {
    pos = dbuf[origPointer];
    current = (pos & 0xff);
    pos >>= 8;
    run = -1;
  }
  this.writePos = pos;
  this.writeCurrent = current;
  this.writeCount = dbufCount;
  this.writeRun = run;

  return true; /* more blocks to come */
};
/* Undo burrows-wheeler transform on intermediate buffer to produce output.
   If start_bunzip was initialized with out_fd=-1, then up to len bytes of
   data are written to outbuf.  Return value is number of bytes written or
   error (all errors are negative numbers).  If out_fd!=-1, outbuf and len
   are ignored, data is written to out_fd and return is RETVAL_OK or error.
*/
Bunzip.prototype._read_bunzip = function(outputBuffer, len) {
    var copies, previous, outbyte;
    /* james@jamestaylor.org: writeCount goes to -1 when the buffer is fully
       decoded, which results in this returning RETVAL_LAST_BLOCK, also
       equal to -1... Confusing, I'm returning 0 here to indicate no
       bytes written into the buffer */
  if (this.writeCount < 0) { return 0; }

  var gotcount = 0;
  var dbuf = this.dbuf, pos = this.writePos, current = this.writeCurrent;
  var dbufCount = this.writeCount, outputsize = this.outputsize;
  var run = this.writeRun;

  while (dbufCount) {
    dbufCount--;
    previous = current;
    pos = dbuf[pos];
    current = pos & 0xff;
    pos >>= 8;
    if (run++ === 3){
      copies = current;
      outbyte = previous;
      current = -1;
    } else {
      copies = 1;
      outbyte = current;
    }
    this.blockCRC.updateCRCRun(outbyte, copies);
    while (copies--) {
      this.outputStream.writeByte(outbyte);
      this.nextoutput++;
    }
    if (current != previous)
      run = 0;
  }
  this.writeCount = dbufCount;
  // check CRC
  if (this.blockCRC.getCRC() !== this.targetBlockCRC) {
    _throw(Err.DATA_ERROR, "Bad block CRC "+
           "(got "+this.blockCRC.getCRC().toString(16)+
           " expected "+this.targetBlockCRC.toString(16)+")");
  }
  return this.nextoutput;
};

var coerceInputStream = function(input) {
  if ('readByte' in input) { return input; }
  var inputStream = new Stream();
  inputStream.pos = 0;
  inputStream.readByte = function() { return input[this.pos++]; };
  inputStream.seek = function(pos) { this.pos = pos; };
  inputStream.eof = function() { return this.pos >= input.length; };
  return inputStream;
};
var coerceOutputStream = function(output) {
  var outputStream = new Stream();
  var resizeOk = true;
  if (output) {
    if (typeof(output)==='number') {
      outputStream.buffer = new Buffer(output);
      resizeOk = false;
    } else if ('writeByte' in output) {
      return output;
    } else {
      outputStream.buffer = output;
      resizeOk = false;
    }
  } else {
    outputStream.buffer = new Buffer(16384);
  }
  outputStream.pos = 0;
  outputStream.writeByte = function(_byte) {
    if (resizeOk && this.pos >= this.buffer.length) {
      var newBuffer = new Buffer(this.buffer.length*2);
      this.buffer.copy(newBuffer);
      this.buffer = newBuffer;
    }
    this.buffer[this.pos++] = _byte;
  };
  outputStream.getBuffer = function() {
    // trim buffer
    if (this.pos !== this.buffer.length) {
      if (!resizeOk)
        throw new TypeError('outputsize does not match decoded input');
      var newBuffer = new Buffer(this.pos);
      this.buffer.copy(newBuffer, 0, 0, this.pos);
      this.buffer = newBuffer;
    }
    return this.buffer;
  };
  outputStream._coerced = true;
  return outputStream;
};

/* Static helper functions */
Bunzip.Err = Err;
// 'input' can be a stream or a buffer
// 'output' can be a stream or a buffer or a number (buffer size)
Bunzip.decode = function(input, output, multistream) {
  // make a stream from a buffer, if necessary
  var inputStream = coerceInputStream(input);
  var outputStream = coerceOutputStream(output);

  var bz = new Bunzip(inputStream, outputStream);
  while (true) {
    if ('eof' in inputStream && inputStream.eof()) break;
    if (bz._init_block()) {
      bz._read_bunzip();
    } else {
      var targetStreamCRC = bz.reader.read(32) >>> 0; // (convert to unsigned)
      if (targetStreamCRC !== bz.streamCRC) {
        _throw(Err.DATA_ERROR, "Bad stream CRC "+
               "(got "+bz.streamCRC.toString(16)+
               " expected "+targetStreamCRC.toString(16)+")");
      }
      if (multistream &&
          'eof' in inputStream &&
          !inputStream.eof()) {
        // note that start_bunzip will also resync the bit reader to next byte
        bz._start_bunzip(inputStream, outputStream);
      } else break;
    }
  }
  if ('getBuffer' in outputStream)
    return outputStream.getBuffer();
};
Bunzip.decodeBlock = function(input, pos, output) {
  // make a stream from a buffer, if necessary
  var inputStream = coerceInputStream(input);
  var outputStream = coerceOutputStream(output);
  var bz = new Bunzip(inputStream, outputStream);
  bz.reader.seek(pos);
  /* Fill the decode buffer for the block */
  var moreBlocks = bz._get_next_block();
  if (moreBlocks) {
    /* Init the CRC for writing */
    bz.blockCRC = new CRC32();

    /* Zero this so the current byte from before the seek is not written */
    bz.writeCopies = 0;

    /* Decompress the block and write to stdout */
    bz._read_bunzip();
    // XXX keep writing?
  }
  if ('getBuffer' in outputStream)
    return outputStream.getBuffer();
};
/* Reads bzip2 file from stream or buffer `input`, and invoke
 * `callback(position, size)` once for each bzip2 block,
 * where position gives the starting position (in *bits*)
 * and size gives uncompressed size of the block (in *bytes*). */
Bunzip.table = function(input, callback, multistream) {
  // make a stream from a buffer, if necessary
  var inputStream = new Stream();
  inputStream.delegate = coerceInputStream(input);
  inputStream.pos = 0;
  inputStream.readByte = function() {
    this.pos++;
    return this.delegate.readByte();
  };
  if (inputStream.delegate.eof) {
    inputStream.eof = inputStream.delegate.eof.bind(inputStream.delegate);
  }
  var outputStream = new Stream();
  outputStream.pos = 0;
  outputStream.writeByte = function() { this.pos++; };

  var bz = new Bunzip(inputStream, outputStream);
  var blockSize = bz.dbufSize;
  while (true) {
    if ('eof' in inputStream && inputStream.eof()) break;

    var position = inputStream.pos*8 + bz.reader.bitOffset;
    if (bz.reader.hasByte) { position -= 8; }

    if (bz._init_block()) {
      var start = outputStream.pos;
      bz._read_bunzip();
      callback(position, outputStream.pos - start);
    } else {
      var crc = bz.reader.read(32); // (but we ignore the crc)
      if (multistream &&
          'eof' in inputStream &&
          !inputStream.eof()) {
        // note that start_bunzip will also resync the bit reader to next byte
        bz._start_bunzip(inputStream, outputStream);
        console.assert(bz.dbufSize === blockSize,
                       "shouldn't change block size within multistream file");
      } else break;
    }
  }
};

Bunzip.Stream = Stream;

Bunzip.version = pjson.version;
Bunzip.license = pjson.license;

module.exports = Bunzip;

}).call(this)}).call(this,require("buffer").Buffer)
},{"../package.json":81,"./bitreader":77,"./crc32":78,"./stream":80,"buffer":3}],80:[function(require,module,exports){
/* very simple input/output stream interface */
var Stream = function() {
};

// input streams //////////////
/** Returns the next byte, or -1 for EOF. */
Stream.prototype.readByte = function() {
  throw new Error("abstract method readByte() not implemented");
};
/** Attempts to fill the buffer; returns number of bytes read, or
 *  -1 for EOF. */
Stream.prototype.read = function(buffer, bufOffset, length) {
  var bytesRead = 0;
  while (bytesRead < length) {
    var c = this.readByte();
    if (c < 0) { // EOF
      return (bytesRead===0) ? -1 : bytesRead;
    }
    buffer[bufOffset++] = c;
    bytesRead++;
  }
  return bytesRead;
};
Stream.prototype.seek = function(new_pos) {
  throw new Error("abstract method seek() not implemented");
};

// output streams ///////////
Stream.prototype.writeByte = function(_byte) {
  throw new Error("abstract method readByte() not implemented");
};
Stream.prototype.write = function(buffer, bufOffset, length) {
  var i;
  for (i=0; i<length; i++) {
    this.writeByte(buffer[bufOffset++]);
  }
  return length;
};
Stream.prototype.flush = function() {
};

module.exports = Stream;

},{}],81:[function(require,module,exports){
module.exports={
  "name": "seek-bzip",
  "version": "2.0.0",
  "contributors": [
    "C. Scott Ananian (http://cscott.net)",
    "Eli Skeggs",
    "Kevin Kwok",
    "Rob Landley (http://landley.net)"
  ],
  "description": "a pure-JavaScript Node.JS module for random-access decoding bzip2 data",
  "main": "./lib/index.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/cscott/seek-bzip.git"
  },
  "license": "MIT",
  "bin": {
    "seek-bunzip": "./bin/seek-bunzip",
    "seek-table": "./bin/seek-bzip-table"
  },
  "directories": {
    "test": "test"
  },
  "dependencies": {
    "commander": "^6.0.0"
  },
  "devDependencies": {
    "fibers": "^5.0.0",
    "mocha": "^8.1.0"
  },
  "scripts": {
    "test": "mocha"
  }
}

},{}]},{},[76]);
