function _remove_empty_strings_from_array(array) {
    return array.filter(line => { return line.trim() != '' });
}

class HurricaneParser {
    constructor(master_storms_list, callback) {
        this.master_storms_list = master_storms_list;

        this.parse_kmz(() => {
            this.parse_forecast_text();
            callback(this.master_storms_list);
        });
    }

    parse_forecast_text() {
        const keys = Object.keys(this.master_storms_list.jtwc);
        for (var i = 0; i < keys.length; i++) {
            const current_storm = keys[i];
            const forecast_text = this.master_storms_list.jtwc[current_storm].forecast_text;

            const lines = forecast_text.split('\n');
            for (var n = 0; n < lines.length; n++) {
                const line = lines[n];
                const parts = _remove_empty_strings_from_array(line.split(/\s+/).map(elem => elem.replaceAll(',', '')));

                if (parts.length != 0) {
                    const obj = {
                        'basin': parts[0], // WP
                        'storm_index': parts[1], // 02
                        'start_date': parts[2], // 2023052618
                        'agency': parts[4], // JTWC
                        'forecast_hour': parts[5], // 120
                        'latitude': parts[6], // 227N
                        'longitude': parts[7], // 1248E
                        'storm_type_abbv': parts[10], // TY
                    }
                }
            }
        }
    }

    parse_kmz(callback) {
        const keys = Object.keys(this.master_storms_list.jtwc);

        function _parse_all_kmz(cb, index = 0) {
            const kmz_blob = this.master_storms_list.jtwc[keys[index]].kmz;
            this._kmz_to_geojson(kmz_blob, (geojson) => {
                this.master_storms_list.jtwc[keys[index]].geojson = geojson;

                if (index < keys.length - 1) {
                    _parse_all_kmz(cb, index + 1);
                } else {
                    cb(this.master_storms_list);
                }
            })
        }

        _parse_all_kmz.apply(this, [() => {
            callback();
        }]);
    }

    _kmz_to_geojson(kmz_blob, callback) {
        let getDom = xml => (new DOMParser()).parseFromString(xml, "text/xml")
        let getExtension = fileName => fileName.split(".").pop()

        let getKmlDom = (kmzFile) => {
            var zip = new JSZip()
            return zip.loadAsync(kmzFile)
                .then(zip => {
                    let kmlDom = null
                    zip.forEach((relPath, file) => {
                        if (getExtension(relPath) === "kml" && kmlDom === null) {
                            kmlDom = file.async("string").then(getDom)
                        }
                    })
                    return kmlDom || Promise.reject("No kml file found")
                });
        }

        getKmlDom(kmz_blob).then(kmlDom => {
            let geoJsonObject = toGeoJSON.kml(kmlDom)
            callback(geoJsonObject);
            // //console.log(`${hurricaneID} - KMZ successfully unzipped.`);
            // //drawHurricanesToMap(geoJsonObject, type, index, hurricaneID);
            // cb(geoJsonObject);
        })
    }
}

module.exports = HurricaneParser;