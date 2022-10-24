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

		// need to set the prototype because it can't access the methods in a web worker
		Object.setPrototypeOf(this.buffer, Buffer(0));

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
