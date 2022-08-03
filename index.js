//const fetch = require('node-fetch');
const { Level2Radar } = require('./nexrad-level-2-data/src');
const Level3Radar = require('./nexrad-level-3-data/src');
const { plot } = require('./nexrad-level-2-plot/src');
const { map } = require('./nexrad-level-2-plot/src/draw/palettes/hexlookup');

const fs = require('fs');
const { plotAndData, writePngToFile } = require('./nexrad-level-3-plot/src');

function toBuffer(ab) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

function printFancyTime(dateObj, tz) {
    return dateObj.toLocaleDateString(undefined, {timeZone: tz}) + " " + dateObj.toLocaleTimeString(undefined, {timeZone: tz}) + ` ${tz}`;
}
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
function msToTime(s) {
    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    return {
        'hours': pad(hrs),
        'minutes': pad(mins),
        'seconds': pad(secs),
        'milliseconds': pad(ms, 3),
    }
    //return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
function findTerminalCoordinates(startLat, startLng, distanceNM, bearingDEG) {
    var metersInNauticalMiles = 1852;
    var startPoint = { latitude: startLat, longitude: startLng };
    var distanceMeters = distanceNM * metersInNauticalMiles;
    var bearing = bearingDEG;
    const destination = geolib.computeDestinationPoint(
        startPoint,
        distanceMeters,
        bearing 
    );
    return destination;
}
document.getElementById('fileInput').addEventListener('input', function() {
    // Create the event
    var event = new CustomEvent("loadFile", { "detail": [
        document.getElementById('fileInput').files[0],
        'level2'
    ] });
    // Dispatch/Trigger/Fire the event
    document.dispatchEvent(event);
})

setTimeout(function() {
    //const file = fs.readFileSync('./data/level3/LWX_HHC_2022_04_18_15_21_24');
    //const level3Plot = plotAndData(file);
}, 1000)

document.addEventListener('loadFile', function(event) {
    //logToModal('starting')
    document.getElementById('spinnerParent').style.display = 'block';
    document.getElementById('productStuff').style.display = 'block';
    document.getElementById('levelInput').style.display = 'none';
    removeTestFileControl();
    //console.log(URL.createObjectURL(document.getElementById("fileInput").files[0]));
    setTimeout(function() {
        var uploadedFile = event.detail[0];
        var fileLevel = event.detail[1];
        const reader = new FileReader();

        reader.addEventListener("load", function () {
            console.log('file uploaded, parsing now');
            if (fileLevel == 'level2') {
                var wholeOrPart = event.detail[2];
                document.getElementById('elevStuff').style.display = 'block';
                document.getElementById('extraStuff').style.display = 'block';
                var l2rad = new Level2Radar(toBuffer(this.result), {wholeOrPart})
                console.log(l2rad)
                var theFileVersion = l2rad.header.version;
                document.getElementById('fileVersion').innerHTML = theFileVersion;

                // older file versions only have reflectivity and velocity data - check for that here
                if (theFileVersion == "06") {
                    document.getElementById('productInput').add(new Option('Reflectivity', 'REF'));
                    document.getElementById('productInput').add(new Option('Velocity', 'VEL'));
                    document.getElementById('productInput').add(new Option('Correlation Coefficient', 'RHO'));
                    document.getElementById('productInput').add(new Option('Differential Phase Shift', 'PHI'));
                    document.getElementById('productInput').add(new Option('Differential Reflectivity', 'ZDR'));
                    document.getElementById('productInput').add(new Option('Spectrum Width', 'SW '));
                } else {
                    document.getElementById('productInput').add(new Option('Reflectivity', 'REF'));
                    document.getElementById('productInput').add(new Option('Velocity', 'VEL'));
                }

                function displayElevations(displayedProduct) {
                    $('#elevInput').empty();
                    var elevs = l2rad.listElevations();
                    var elevAngles = l2rad.listElevations('angle', l2rad);
                    const preferredWaveformUsage = {
                        1: ['REF', 'ZDR', 'PHI', 'RHO'],
                        2: ['VEL'],
                        3: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
                        4: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
                        5: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
                    };
                    for (var key in elevAngles) {
                        if (theFileVersion == "06") {
                            if (preferredWaveformUsage[elevAngles[key][1]].includes(displayedProduct)) {
                                document.getElementById('elevInput').add(new Option(round(elevAngles[key][0], 1), elevs[key]));
                            }
                        } else {
                            if (elevAngles[key][1].includes(displayedProduct)) {
                                document.getElementById('elevInput').add(new Option(round(elevAngles[key][0], 1), elevs[key]));
                            }
                        }
                    }
                }
                //var blob = new Blob([JSON.stringify(l2rad)], {type: "text/plain"});
                //var url = window.URL.createObjectURL(blob);
                //document.getElementById('decodedRadarDataURL').innerHTML = url;
                //showPlotBtn();
                //document.getElementById('plotRef').style.display = 'inline';
                //document.getElementById('plotVel').style.display = 'inline';
                document.getElementById('fileInput').style.display = 'none';
                document.getElementById('radarInfoDiv').style.display = 'inline';

                document.getElementById('radFileName').innerHTML = uploadedFile.name;

                var theFileStation = l2rad.header.ICAO;
                document.getElementById('radStation').innerHTML = theFileStation;

                var theFileVCP;
                if (!(theFileVersion == "01")) {
                    theFileVCP = l2rad.vcp.record.pattern_number;
                } else {
                    theFileVCP = l2rad.data[1][0].record.vcp;
                }
                document.getElementById('radVCP').innerHTML = theFileVCP;

                var theFileDate = l2rad.header.modified_julian_date;
                var theFileTime = l2rad.header.milliseconds;
                var fileDateObj = new Date(0).addDays(theFileDate);
                var fileHours = msToTime(theFileTime).hours;
                var fileMinutes = msToTime(theFileTime).minutes;
                var fileSeconds = msToTime(theFileTime).seconds;
                fileDateObj.setUTCHours(fileHours);
                fileDateObj.setUTCMinutes(fileMinutes);
                fileDateObj.setUTCSeconds(fileSeconds);
                var finalRadarDateTime = printFancyTime(fileDateObj, "UTC");

                document.getElementById('radDate').innerHTML = finalRadarDateTime;

                $('.reflPlotButton').on('click', function() {
                    if ($('#reflPlotThing').hasClass('icon-selected')) {
                        console.log('plot reflectivity data button clicked');
                        const level2Plot = plot(l2rad, 'REF', {
                            elevations: parseInt($('#elevInput').val()),
                        });
                    }
                })
                //$('.reflPlotButton').trigger('click');
                //console.log('initial reflectivity plot');
                //displayElevations('REF');
                var btnsArr = [
                    "l2-ref",
                    "l2-vel",
                    "l2-rho",
                    "l2-phi",
                    "l2-zdr",
                    "l2-sw "
                ]
                for (key in btnsArr) {
                    var curElemIter = document.getElementById(btnsArr[key]);
                    curElemIter.disabled = false;
                    $(curElemIter).addClass('btn-outline-primary');
                    $(curElemIter).removeClass('btn-outline-secondary');
                }
                document.getElementById('loadl2').style.display = 'none';
                $('.level2btns button').off();
                console.log('turned off listener')
                $('.level2btns button').on('click', function() {
                    console.log(this.value)
                    removeMapLayer('baseReflectivity');
                    if (this.value == 'load') {
                        getLatestFile($('#stationInp').val(), function(fileName, y, m, d, s) {
                            var individualFileURL = `https://noaa-nexrad-level2.s3.amazonaws.com/${y}/${m}/${d}/${s}/${fileName}`
                            console.log(phpProxy + individualFileURL)
                            loadFileObject(phpProxy + individualFileURL, 'balls', 2, 'REF');
                        });
                    }
                    if (this.value == 'l2-ref') {
                        const level2Plot = plot(l2rad, 'REF', {
                            elevations: 1,
                        });
                    } else if (this.value == 'l2-vel') {
                        const level2Plot = plot(l2rad, 'VEL', {
                            elevations: 2,
                        });
                    } else if (this.value == 'l2-rho') {
                        const level2Plot = plot(l2rad, 'RHO', {
                            elevations: 1,
                        });
                    } else if (this.value == 'l2-phi') {
                        const level2Plot = plot(l2rad, 'PHI', {
                            elevations: 1,
                        });
                    } else if (this.value == 'l2-zdr') {
                        const level2Plot = plot(l2rad, 'ZDR', {
                            elevations: 1,
                        });
                    } else if (this.value == 'l2-sw ') {
                        displayElevations('SW ');
                        const level2Plot = plot(l2rad, 'SW ', {
                            elevations: parseInt($('#elevInput').val()),
                        });
                    }
                });
                console.log('turned on listener i think')
                $('#productInput').on('change', function() {
                    removeMapLayer('baseReflectivity');
                    if ($('#productInput').val() == 'REF') {
                        document.getElementById('extraStuff').style.display = 'block';
                        displayElevations('REF');
                        const level2Plot = plot(l2rad, 'REF', {
                            elevations: 1,
                        });
                    } else if ($('#productInput').val() == 'VEL') {
                        document.getElementById('extraStuff').style.display = 'none';
                        displayElevations('VEL');
                        const level2Plot = plot(l2rad, 'VEL', {
                            elevations: 2,
                        });
                    } else if ($('#productInput').val() == 'RHO') {
                        document.getElementById('extraStuff').style.display = 'none';
                        displayElevations('RHO');
                        const level2Plot = plot(l2rad, 'RHO', {
                            elevations: 1,
                        });
                    } else if ($('#productInput').val() == 'PHI') {
                        document.getElementById('extraStuff').style.display = 'none';
                        displayElevations('PHI');
                        const level2Plot = plot(l2rad, 'PHI', {
                            elevations: 1,
                        });
                    } else if ($('#productInput').val() == 'ZDR') {
                        document.getElementById('extraStuff').style.display = 'none';
                        displayElevations('ZDR');
                        const level2Plot = plot(l2rad, 'ZDR', {
                            elevations: 1,
                        });
                    } else if ($('#productInput').val() == 'SW ') {
                        document.getElementById('extraStuff').style.display = 'none';
                        displayElevations('SW ');
                        const level2Plot = plot(l2rad, 'SW ', {
                            elevations: parseInt($('#elevInput').val()),
                        });
                    }
                })
                $('#elevInput').on('change', function() {
                    if ($('#reflPlotThing').hasClass('icon-selected')) {
                        removeMapLayer('baseReflectivity');
                        //$("#settingsDialog").dialog('close');
                        const level2Plot = plot(l2rad, $('#productInput').val(), {
                            elevations: parseInt($('#elevInput').val()),
                        });
                    }
                })
                $('#shouldLowFilter').on('change', function() {
                    if ($('#reflPlotThing').hasClass('icon-selected')) {
                        removeMapLayer('baseReflectivity');
                        //$("#settingsDialog").dialog('close');
                        const level2Plot = plot(l2rad, 'REF', {
                            elevations: parseInt($('#elevInput').val()),
                        });
                    }
                })
                /*const level2Plot = plot(l2rad, 'REF', {
                    elevations: 1,
                    background: 'rgba(0, 0, 0, 0)',
                    //size: 500,
                    //cropTo: 500,
                    dpi: $('#userDPI').val(),
                });
                console.log('dpi set to ' + $('#userDPI').val())*/
            } else if (fileLevel == 'level3') {
                console.log('level 3 file')
                var l3rad = Level3Radar(toBuffer(this.result))
                console.log(l3rad)

                //showPlotBtn();
                document.getElementById('fileInput').style.display = 'none';
                document.getElementById('radarInfoDiv').style.display = 'inline';

                document.getElementById('radFileName').innerHTML = uploadedFile.name;

                var theFileStation = 'K' + l3rad.textHeader.id3;
                document.getElementById('radStation').innerHTML = theFileStation;

                var theFileVCP = l3rad.productDescription.vcp;
                document.getElementById('radVCP').innerHTML = theFileVCP;

                var theFileDate = l3rad.messageHeader.julianDate;
                var theFileTime = l3rad.messageHeader.seconds * 1000;
                var fileDateObj = new Date(0).addDays(theFileDate);
                var fileHours = msToTime(theFileTime).hours;
                var fileMinutes = msToTime(theFileTime).minutes;
                var fileSeconds = msToTime(theFileTime).seconds;
                fileDateObj.setUTCHours(fileHours);
                fileDateObj.setUTCMinutes(fileMinutes);
                fileDateObj.setUTCSeconds(fileSeconds);
                var finalRadarDateTime = printFancyTime(fileDateObj, "UTC");

                document.getElementById('radDate').innerHTML = finalRadarDateTime;

                if (l3rad.textHeader.type == "NTV") {
                    var tornadoLayersArr = [];
                    var geojsonPointTemplate = {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'Point',
                            'coordinates': 'he'
                        }
                    }
                    $.getJSON('https://steepatticstairs.github.io/weather/json/radarStations.json', function(data) {
                        var staLat = data[theFileStation][1];
                        var staLng = data[theFileStation][2];

                        var tornadoObj = l3rad.formatted.tvs;
                        console.log(tornadoObj)
                        var tornadoList = Object.keys(tornadoObj);

                        function loadTornado(identifier) {
                            // store all map layers being added to be able to manipulate later
                            tornadoLayersArr.push(identifier)
                            // reset geojson coordinates
                            geojsonPointTemplate.geometry.coordinates = [];

                            // current storm track
                            var curTVS = tornadoObj[identifier];
                            var curTVSCoords = findTerminalCoordinates(staLat, staLng, curTVS.az, curTVS.range);
                            // push the initial coordinate point - we do not know if the current track is a line or a point yet
                            geojsonPointTemplate.geometry.coordinates = [curTVSCoords.longitude, curTVSCoords.latitude];

                            setGeojsonLayer(geojsonPointTemplate, 'yellowCircle', identifier)
                        }
                        for (key in tornadoList) {
                            loadTornado(tornadoList[key])
                        }
                        document.getElementById('allTornadoLayers').innerHTML = JSON.stringify(tornadoLayersArr);
                    });
                } else if (l3rad.textHeader.type == "NMD") {
                    var mesocycloneLayersArr = [];
                    var geojsonPointTemplate = {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'Point',
                            'coordinates': 'he'
                        }
                    }
                    $.getJSON('https://steepatticstairs.github.io/weather/json/radarStations.json', function(data) {
                        var staLat = data[theFileStation][1];
                        var staLng = data[theFileStation][2];

                        var mesocycloneObj = l3rad.formatted.mesocyclone;
                        if (mesocycloneObj != undefined) {
                            var mesocycloneList = Object.keys(mesocycloneObj);

                            function loadMesocyclone(identifier) {
                                // store all map layers being added to be able to manipulate later
                                mesocycloneLayersArr.push(identifier)
                                // reset geojson coordinates
                                geojsonPointTemplate.geometry.coordinates = [];

                                // current storm track
                                var curMC = mesocycloneObj[identifier];
                                var curMCCoords = findTerminalCoordinates(staLat, staLng, curMC.az, curMC.ran);
                                // push the initial coordinate point - we do not know if the current track is a line or a point yet
                                geojsonPointTemplate.geometry.coordinates = [curMCCoords.longitude, curMCCoords.latitude];

                                setGeojsonLayer(geojsonPointTemplate, 'greenCircle', identifier)
                            }
                            for (key in mesocycloneList) {
                                loadMesocyclone(mesocycloneList[key])
                            }
                            document.getElementById('allMesocycloneLayers').innerHTML = JSON.stringify(mesocycloneLayersArr);
                        }
                    });
                } else if (l3rad.textHeader.type == "NST") {
                    var stormTracksLayerArr = [];
                    // load storm tracking information
                    var geojsonLineTemplate = {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': []
                        }
                    }
                    var geojsonPointTemplate = {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'Point',
                            'coordinates': []
                        }
                    }

                    $.getJSON('https://steepatticstairs.github.io/weather/json/radarStations.json', function(data) {
                        var staLat = data[theFileStation][1];
                        var staLng = data[theFileStation][2];

                        var stormTracks = l3rad.formatted.storms;
                        console.log(stormTracks)
                        var stormTracksList = Object.keys(stormTracks);

                        function loadStormTrack(identifier) {
                            // store all map layers being added to be able to manipulate later
                            stormTracksLayerArr.push(identifier)
                            // reset geojson coordinates
                            geojsonLineTemplate.geometry.coordinates = [];
                            geojsonLineTemplate.geometry.type = 'LineString';

                            // current storm track
                            var curST = stormTracks[identifier].current;
                            var curSTCoords = findTerminalCoordinates(staLat, staLng, curST.nm, curST.deg);
                            // push the initial coordinate point - we do not know if the current track is a line or a point yet
                            geojsonLineTemplate.geometry.coordinates.push([curSTCoords.longitude, curSTCoords.latitude])

                            // future storm track (forecast)
                            var futureST = stormTracks[identifier].forecast;
                            var isLine;
                            // if the first forecast value for the current track is null, there is no line track - it is a point
                            if (futureST[0] == null) {
                                isLine = false;
                            } else if (futureST[0] != null) {
                                isLine = true;
                            }
                            if (isLine) {
                                for (key in futureST) {
                                    // the current index in the futureST variable being looped through
                                    var indexedFutureST = futureST[key];
                                    // check if the value is null, in which case the storm track is over
                                    if (indexedFutureST != null) {
                                        var indexedFutureSTCoords = findTerminalCoordinates(staLat, staLng, indexedFutureST.nm, indexedFutureST.deg);
                                        // push the current index point to the line geojson object
                                        geojsonLineTemplate.geometry.coordinates.push([indexedFutureSTCoords.longitude, indexedFutureSTCoords.latitude]);
                                        // add a circle for each edge on a storm track line
                                        geojsonPointTemplate.geometry.coordinates = [indexedFutureSTCoords.longitude, indexedFutureSTCoords.latitude]
                                        setGeojsonLayer(geojsonLineTemplate, 'lineCircleEdge', identifier + '_pointEdge' + key)
                                        stormTracksLayerArr.push(identifier + '_pointEdge' + key)
                                    }
                                }
                                // push the finished geojson line object to a function that adds to the map
                                setGeojsonLayer(geojsonLineTemplate, 'line', identifier)
                                // adds a blue circle at the start of the storm track
                                geojsonLineTemplate.geometry.coordinates = geojsonLineTemplate.geometry.coordinates[0]
                                geojsonLineTemplate.geometry.type = 'Point';
                                setGeojsonLayer(geojsonLineTemplate, 'lineCircle', identifier + '_point')
                                stormTracksLayerArr.push(identifier + '_point')
                            } else if (!isLine) {
                                // if the storm track does not have a forecast, display a Point geojson
                                geojsonLineTemplate.geometry.coordinates = geojsonLineTemplate.geometry.coordinates[0]
                                geojsonLineTemplate.geometry.type = 'Point';
                                setGeojsonLayer(geojsonLineTemplate, 'circle', identifier)
                            }
                        }
                        // Z0 = line, R1 = point
                        for (key in stormTracksList) {
                            loadStormTrack(stormTracksList[key])
                        }
                        document.getElementById('allStormTracksLayers').innerHTML = JSON.stringify(stormTracksLayerArr);
                        var stLayersText = document.getElementById('allStormTracksLayers').innerHTML;
                        var stLayers = stLayersText.replace(/"/g, '').replace(/\[/g, '').replace(/\]/g, '').split(',');
                        // setting layer orders
                        for (key in stLayers) {
                            if (stLayers[key].includes('_pointEdge')) {
                                moveMapLayer(stLayers[key])
                            }
                        }
                        for (key in stLayers) {
                            if (stLayers[key].includes('_point')) {
                                moveMapLayer(stLayers[key])
                            }
                        }
                    });
                } else {
                    const level3Plot = plotAndData(l3rad);
                }

                //document.getElementById('settingsDialog').innerHTML = 'No settings for Level 3 files yet.'
                if (l3rad.textHeader.type != "NST") {
                    document.getElementById('elevStuff').style.display = 'none';
                }
                document.getElementById('extraStuff').style.display = 'none';
                document.getElementById('spinnerParent').style.display = 'none';
            }
        }, false);
        reader.readAsArrayBuffer(uploadedFile);
    }, 300)
})

/*
document.getElementById('fileThatWorks').addEventListener('click', function() {
    $.ajax({
        url: './data/' + document.getElementById('fileThatWorks').innerHTML,
        method: 'GET',
        xhrFields: { responseType: 'arraybuffer'}
    }).then(function(responseData) {
        //console.clear();
        console.log('loaded ' + document.getElementById('fileThatWorks').innerHTML + ' file from click, reading now')
        var l2rad = new Level2Radar(toBuffer(responseData))
        console.log(l2rad)
    })
})*/

//console.clear();

// https://php-cors-proxy.herokuapp.com/?https://noaa-nexrad-level2.s3.amazonaws.com/2017/08/25/KCRP/KCRP20170825_235733_V06
// https://php-cors-proxy.herokuapp.com/?https://noaa-nexrad-level2.s3.amazonaws.com/2017/08/25/KCRP/KCRP20170825_235733_V06
// https://php-cors-proxy.herokuapp.com/?https://noaa-nexrad-level2.s3.amazonaws.com/2009/06/03/KBLX/KBLX20090603_004417_V03.gz
/*fetch('https://php-cors-proxy.herokuapp.com/?https://noaa-nexrad-level2.s3.amazonaws.com/2017/08/25/KCRP/KCRP20170825_235733_V06')
    .then(res => res.arrayBuffer())
    .then(rawData => {
        var l2rad = new Level2Radar(toBuffer(rawData))
        console.log(l2rad)
    })
    .catch(err => console.error(err));*/