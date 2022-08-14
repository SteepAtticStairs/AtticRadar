var parser = document.createElement('a');
parser.href = window.location.href;
//console.log(parser.hash);

var allParserArgs = parser.hash.split('&');
//console.log(allParserArgs)

var isDevelopmentMode = false;
for (key in allParserArgs) {
    if (allParserArgs[key].includes('#station=')) {
        //console.log('we got a station URL parameter!');
        $('#stationInp').val(allParserArgs[key].slice(9, 13));
    }
    if (allParserArgs[key].includes('#development')) {
        //console.log('we got a development mode URL parameter!');
        isDevelopmentMode = true;
    }
}

module.exports = isDevelopmentMode;