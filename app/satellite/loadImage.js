var map = require('../radar/map/map');
const ut = require('../radar/utils');
const proj4 = require('proj4');
const turf = require('@turf/turf')

function parseAuxXML(auxXMLStr, imageUrl, cb) {
    var auxXMLJSON = ut.xmlToJson(auxXMLStr);
    // access the raw text
    var rawGeoTransformText = auxXMLJSON.PAMDataset.GeoTransform['#text'];
    // remove all spaces
    rawGeoTransformText = rawGeoTransformText.replace(/ /g, '');
    // split into an array by the commas
    var finalArr = rawGeoTransformText.split(',');
    // convert scientific notation (e.g. e+02) to actual numbers
    for (var i in finalArr) { finalArr[i] = parseFloat(finalArr[i]) }

    function getWidthHeight(url, cb) {   
        var img = new Image();
        img.onload = function() {
            cb(this.width, this.height);
        };
        img.src = url;
    }
    getWidthHeight(imageUrl, function(width, height) {
        // https://gis.stackexchange.com/questions/389342/getting-extents-of-raster-with-geotransform
        var minx = finalArr[0]
        var maxy = finalArr[3]
        var maxx = minx + finalArr[1] * width;
        var miny = maxy + finalArr[5] * height;

        var coord1 = miny;
        var coord2 = minx;
        var coord3 = maxy;
        var coord4 = maxx;

        var coordArr = [
            proj4('EPSG:3857', 'EPSG:4326', [coord2, coord3]), // top left
            proj4('EPSG:3857', 'EPSG:4326', [coord4, coord3]), // top right
            proj4('EPSG:3857', 'EPSG:4326', [coord4, coord1]), // bottom right
            proj4('EPSG:3857', 'EPSG:4326', [coord2, coord1]) // bottom left
            /*
                2  3
                4  3
                4  1
                2  1
            */
        ]
        cb(coordArr);
    })
}

function setImageFromXML(coordArr, imageUrl, section) {
    if (map.getLayer('satelliteLayer')) {
        map.removeLayer('satelliteLayer');
    }
    if (map.getSource('satelliteLayer')) {
        map.removeSource('satelliteLayer');
    }
    map.addLayer({
        id: `satelliteLayer${section}`,
        'type': 'raster',
        'source': {
            'type': 'image',
            'url': imageUrl,
            'coordinates': coordArr
        },
        'paint': {
            'raster-fade-duration': 0,
            'raster-resampling': 'nearest'
        }
    });
    function moveLayer(layerName) { if (map.getLayer(layerName)) { map.moveLayer(layerName) } }
    //map.moveLayer('stationSymbolLayer')
    var defaultLayers = [ "land", "landcover", "national-park", "landuse", "water-shadow", "waterway", "water", "hillshade", "land-structure-polygon", "land-structure-line", "aeroway-polygon", "aeroway-line", "building-outline", "building", "tunnel-street-minor-low", "tunnel-street-minor-case", "tunnel-primary-secondary-tertiary-case", "tunnel-major-link-case", "tunnel-motorway-trunk-case", "tunnel-construction", "tunnel-path", "tunnel-steps", "tunnel-major-link", "tunnel-pedestrian", "tunnel-street-minor", "tunnel-primary-secondary-tertiary", "tunnel-motorway-trunk", "road-pedestrian-case", "road-minor-low", "road-street-low", "road-minor-case", "road-street-case", "road-secondary-tertiary-case", "road-primary-case", "road-major-link-case", "road-motorway-trunk-case", "road-construction", "road-path", "road-steps", "road-major-link", "road-pedestrian", "road-minor", "road-street", "road-secondary-tertiary", "road-primary", "road-motorway-trunk", "road-rail", "bridge-pedestrian-case", "bridge-street-minor-low", "bridge-street-minor-case", "bridge-primary-secondary-tertiary-case", "bridge-major-link-case", "bridge-motorway-trunk-case", "bridge-construction", "bridge-path", "bridge-steps", "bridge-major-link", "bridge-pedestrian", "bridge-street-minor", "bridge-primary-secondary-tertiary", "bridge-motorway-trunk", "bridge-rail", "bridge-major-link-2-case", "bridge-motorway-trunk-2-case", "bridge-major-link-2", "bridge-motorway-trunk-2", "admin-1-boundary-bg", "admin-0-boundary-bg", "admin-1-boundary", "admin-0-boundary", "admin-0-boundary-disputed", "road-label", "waterway-label", "natural-line-label", "natural-point-label", "water-line-label", "water-point-label", "poi-label", "airport-label", "settlement-subdivision-label", "settlement-label", "state-label", "country-label" ]
    var initialLayerOrder = map.style._order;
    var selfAddedLayers = [];
    for (var i in initialLayerOrder) {
        if (!defaultLayers.includes(initialLayerOrder[i])) {
            selfAddedLayers.push(initialLayerOrder[i]);
        }
    }
    moveLayer(`satelliteLayer${section}`);
    for (var i in selfAddedLayers) {
        if (selfAddedLayers[i] != `satelliteLayer${section}`) {
            moveLayer(selfAddedLayers[i]);
        }
    }

    //map.addLayer({
    //    id: 'statesLayes',
    //    type: "raster",
    //    source: {
    //        type: "raster",
    //        tiles: [
    //            `https://mesonet.agron.iastate.edu/c/tile.py/1.0.0/usstates/{z}/{x}/{y}.png`
    //        ],
    //        tileSize: 256
    //    },
    //});
}

function initSatImage() {
    //map.on('load', function() {
        // var auxXMLFileUrl = '../app/satellite/processData/projectedImage.png.aux.xml';
        // var jsonFileUrl = '../app/satellite/processData/initialImage.json';
        // var imageFileUrl = '../app/satellite/processData/projectedImage.png';

        // $.get(auxXMLFileUrl, function(data) {
        //     var auxXMLData = data;
        //     setImageFromXML(
        //         auxXMLData,
        //         imageFileUrl
        //     )
        // })
    //})
    // https://stackoverflow.com/a/16245768/18758797
    const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    // https://stackoverflow.com/a/30407959/18758797
    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    function sliceImage(url, section, cb) {
        var img = new Image();
        img.src = url;

        img.onload = function () {
            var topLeftCoords;
            var bottomRightCoords;
            if (section == 'tl') {
                topLeftCoords = { x: 0, y: 0 }
                bottomRightCoords = { x: img.width / 2, y: img.height / 2 }
            } else if (section == 'tr') {
                topLeftCoords = { x: img.width / 2, y: 0 }
                bottomRightCoords = { x: img.width, y: img.height / 2 }
            } else if (section == 'bl') {
                topLeftCoords = { x: 0, y: img.height / 2 }
                bottomRightCoords = { x: img.width / 2, y: img.height }
            } else if (section == 'br') {
                topLeftCoords = { x: img.width / 2, y: img.height / 2 }
                bottomRightCoords = { x: img.width, y: img.height }
            }

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            var imageData = ctx.getImageData(topLeftCoords.x, topLeftCoords.y, bottomRightCoords.x, bottomRightCoords.y);

            // create a new cavnas same as clipped size and a context
            var newCan = document.createElement('canvas');
            newCan.width = bottomRightCoords.x - topLeftCoords.x;
            newCan.height = bottomRightCoords.y - topLeftCoords.y;
            var newCtx = newCan.getContext('2d');

            // put the clipped image on the new canvas.
            newCtx.putImageData(imageData, 0, 0);

            var cutUrl = newCan.toDataURL();
            var b = dataURLtoBlob(cutUrl)
            var u = URL.createObjectURL(b);

            cb(u);

            // var image = new Image();
            // image.src = u;
            // document.body.appendChild(image);
            // const a = document.createElement('a');
            // a.style.display = 'none';
            // a.href = u;
            // the filename you want
            // a.download = 'cutUp.png';
            // document.body.appendChild(a);
            // a.click();
        }
    }
    function downloadFile(url, filename) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // the filename you want
        a.download = filename;
        document.body.appendChild(a);
        a.click();
    }

    function loadImageFromSectionBBOX(section, auxXmlStr, initialUrl, url) {
        parseAuxXML(auxXmlStr, initialUrl, function(coordArr) {
            var coord1 = coordArr[3][1];
            var coord2 = coordArr[3][0];
            var coord3 = coordArr[1][1];
            var coord4 = coordArr[1][0];

            var topLeft = [coord2, coord3];
            var topRight = [coord4, coord3];
            var bottomLeft = [coord2, coord1];
            var bottomRight = [coord4, coord1];

            var center = turf.center(turf.points([ topLeft, topRight, bottomLeft, bottomRight ])).geometry.coordinates;

            var topCenter = turf.midpoint(turf.point(topLeft), turf.point(topRight)).geometry.coordinates;
            var bottomCenter = turf.midpoint(turf.point(bottomLeft), turf.point(bottomRight)).geometry.coordinates;
            var leftCenter = turf.midpoint(turf.point(topLeft), turf.point(bottomLeft)).geometry.coordinates;
            var rightCenter = turf.midpoint(turf.point(topRight), turf.point(bottomRight)).geometry.coordinates;

            // theCoordArr = [
            //     leftCenter, // top left
            //     center, // top right
            //     bottomCenter, // bottom right
            //     bottomLeft // bottom left
            // ]
            var theCoordArr;
            if (section == 'tl') {
                theCoordArr = [ topLeft, topCenter, center, leftCenter ]
            } else if (section == 'tr') {
                theCoordArr = [ topCenter, topRight, rightCenter, center ]
            } else if (section == 'bl') {
                theCoordArr = [ leftCenter, center, bottomCenter, bottomLeft ]
            } else if (section == 'br') {
                theCoordArr = [ center, rightCenter, bottomRight, bottomCenter ]
            }

            setImageFromXML(
                theCoordArr,
                url,
                section
            )
        })
    }

    var satNum = '16';
    var channel = '13';
    var sector = 'conus';
    $.ajax({
        type: 'POST',
        // https://attic-server.herokuapp.com/satellite/processData/index.php
        // http://127.0.0.1:3333/server/AtticServer/satellite/processData/index.php
        url: 'https://attic-server.herokuapp.com/satellite/processData/index.php',
        data: {
            'satNum': satNum,
            'channel': channel,
            'sector': sector
        },
        
        // satNum = '16'; // 16, 17, or 18
        // channel = '13'; // 01 - 16
        // sector = 'conus'
        /*
        alaska (no goes 16)
        conus
        fulldisk
        hawaii (no goes 16)
        mesoscale-1
        mesoscale-2
        puertorico (only goes 16)
        */
        success: function(data) {
            var arr = data.split('STEEPATTICSTAIRS');

            const blob = b64toBlob(arr[1], 'image/png');
            const blobUrl = URL.createObjectURL(blob);

            var sections = ['tl', 'tr', 'bl', 'br']
            function doSlice(n) {
                sliceImage(blobUrl, sections[n], function(url) {
                    var filename = `goes${satNum}_ch${channel}_${sector}_${sections[n]}.png`;
                    //downloadFile(url, filename);
                    loadImageFromSectionBBOX(sections[n], arr[0], blobUrl, url);
                    n++;
                    if (n <= 3) { doSlice(n); }
                })
            }
            //doSlice(0);
            // var section = 'tr';
            // sliceImage(blobUrl, section, function(url) {
            //     loadImageFromSectionBBOX(section, arr[0], blobUrl, url);
            // })
            parseAuxXML(arr[0], blobUrl, function(coordArr) {
                setImageFromXML(
                    coordArr,
                    blobUrl,
                    'section'
                )
            })
        }
    });
}

module.exports = initSatImage;