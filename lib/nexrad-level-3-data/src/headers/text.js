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
