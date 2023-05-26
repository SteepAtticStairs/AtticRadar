class HurricaneParser {
    constructor(master_storms_list, callback) {
        this.master_storms_list = master_storms_list;

        this.parse_kmz(() => {
            callback(this.master_storms_list);
        });
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