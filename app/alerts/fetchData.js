const ut = require('../radar/utils');

function fetchPolygonData(url, callback) {
    // https://preview.weather.gov/edd/
    for (var y = 0; y < url.length; y++) {
        var alertsXHTTP = new XMLHttpRequest();
        alertsXHTTP.onprogress = (event) => {
            // event.loaded returns how many bytes are downloaded
            // event.total returns the total number of bytes
            // event.total is only available if server sends `Content-Length` header
            //console.log(`%c Downloaded ${formatBytes(event.loaded)} of ${formatBytes(event.total)}`, 'color: #bada55');
            //var complete = (event.loaded / event.total * 50 | 0);
            //document.getElementById('timestampProgress').innerHTML = formatBytes(event.loaded)

            console.log(ut.formatBytes(event.loaded))
        }
        alertsXHTTP.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(this.responseText);
                callback(data);
            }
        };
        alertsXHTTP.open("GET", url[y], true);
        alertsXHTTP.send();
    }
}

module.exports = fetchPolygonData