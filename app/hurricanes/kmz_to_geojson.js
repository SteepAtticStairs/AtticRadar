function kmz_to_geojson(kmz_blob, callback) {
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

module.exports = kmz_to_geojson;