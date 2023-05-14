const nwrStations = require('./data/nwr_stations');
const radioStreams = require('./data/radio_streams');
const turf = require('@turf/turf');
const setLayerOrder = require('../core/map/setLayerOrder');
const ut = require('../core/utils');
var map = require('../core/map/map');

const radioBtnGreen = 'rgb(57, 161, 53)';
const radioBtnRed = 'rgb(200, 44, 44)';

function plotToMap() {
    console.log(nwrStations);

    function checkIfHasLivestream(callsign) {
        if (radioStreams[callsign] != undefined) {
            return radioStreams[callsign].radiourl; //`${callsign}: ${radioStreams[callsign].radiourl}`;
        } else {
            return false;
        }
    }

    var coords = [];
    for (var i in nwrStations) {
        try {
            nwrStations[i].hasUrl = checkIfHasLivestream(nwrStations[i].CALLSIGN);
            var point = turf.point([parseFloat(nwrStations[i].LON), parseFloat(nwrStations[i].LAT)], nwrStations[i]);
            coords.push(point);
        } catch (e) { /*console.warn(e)*/ }
    }

    var radioStationGeojson = turf.featureCollection(coords);

    function addToMap() {
        map.addSource('radioStationSource', {
            type: 'geojson',
            data: radioStationGeojson
        });
        map.addLayer({
            'id': 'radioStationLayer',
            'type': 'circle',
            'source': 'radioStationSource',
            'paint': {
                'circle-radius': [
                    'case',
                    ['==', ['get', 'hasUrl'], false],
                    2,
                    ['==', ['get', 'STATUS'], 'NORMAL'],
                    4,
                    4
                ],
                'circle-color': [
                    'case',
                    ['==', ['get', 'hasUrl'], false],
                    '#82cfd9', // lighter blue
                    '#16a61a', // lighter green
                    // ['==', ['get', 'STATUS'], 'NORMAL'],
                    // '#16a61a', // lighter green
                    // // ['==', ['get', 'STATUS'], 'OUT OF SERVICE'],
                    // // '#de1818', // lighter red
                    // 'black'
                ],
                'circle-stroke-width': [
                    'case',
                    ['==', ['get', 'hasUrl'], false],
                    2,
                    ['==', ['get', 'STATUS'], 'NORMAL'],
                    4,
                    4
                ],
                'circle-stroke-color': [
                    'case',
                    ['==', ['get', 'hasUrl'], false],
                    '#64a7b0', // darker blue
                    '#107514', // darker green
                    // ['==', ['get', 'STATUS'], 'NORMAL'],
                    // '#107514', // darker green
                    // // ['==', ['get', 'STATUS'], 'OUT OF SERVICE'],
                    // // '#991111', // darker red
                    // 'black'
                ],
            }
        });
        setLayerOrder();

        var sound = document.createElement('audio');
        sound.id = 'radioAudio';
        document.body.appendChild(sound);

        function displayErrorModal(content) {
            ut.displayAtticDialog({
                'title': 'Error',
                'body': content,
                'color': '#ba3043',
                'textColor': 'white',
            })
        }

        $('#radioAudio').on('error', function (e) {
            // audio playback failed - show a message saying why
            switch (e.target.error.code) {
                case e.target.error.MEDIA_ERR_ABORTED:
                    displayErrorModal('You aborted the video playback.');
                    break;
                case e.target.error.MEDIA_ERR_NETWORK:
                    displayErrorModal('A network error caused the audio download to fail.');
                    break;
                case e.target.error.MEDIA_ERR_DECODE:
                    displayErrorModal('The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.');
                    break;
                case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    displayErrorModal('The video audio not be loaded, either because the server or network failed or because the format is not supported.');
                    break;
                default:
                    displayErrorModal('An unknown error occurred.');
                    break;
            }
        });

        map.on('click', 'radioStationLayer', (e) => {
            // console.log(`${e.features[0].properties.LAT}, ${e.features[0].properties.LON}`);
            const properties = e.features[0].properties;
            const callsign = properties.CALLSIGN;
            const radioStreamURL = checkIfHasLivestream(callsign);
            console.log(properties);

            var initColor;
            var iconType;
            if (window.currentStreamURL == radioStreamURL) {
                initColor = radioBtnRed;
                iconType = 'pause';
            } else {
                initColor = radioBtnGreen;
                iconType = 'play';
            }
            //var radioPlayBtn = `<button id="radioPlayBtn" url="${radioStreamURL}">Play</button>`;
            var radioPlayBtn = `<div id="radioPlayBtn" class="radioPausePlayBtn" style="color: ${initColor};" url="${radioStreamURL}"><i id="radioPlayBtnIcon" class="fa-solid fa-${iconType}"></i></div>`;
            if (radioStreamURL == false) { radioPlayBtn = '' }

            const popupContents = `
<div><b>${properties.CALLSIGN}</b></div>
<div>${properties.FREQ} MHz</div>
<div>${properties.SITENAME}, ${properties.SITESTATE}</div>
${radioPlayBtn}`

            const popup = new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
                .setLngLat([properties.LON, properties.LAT])
                .setHTML(popupContents)
                .addTo(map);

            $('#radioPlayBtn').click((e) => {
                const radioPlayBtnIcon = document.getElementById('radioPlayBtnIcon');
                const radioPlayBtn = document.getElementById('radioPlayBtn');

                const btnColor = radioPlayBtn.style.color;
                const streamURL = radioPlayBtn.getAttribute('url');
                var radioAudioElem = document.getElementById('radioAudio');

                if (btnColor == radioBtnGreen) {
                    $('#radioPlayBtnIcon').removeClass('fa-play').addClass('fa-spinner fa-spin');

                    if (streamURL != 'false') {
                        window.currentStreamURL = streamURL;
                        radioAudioElem.src = streamURL;
                        radioAudioElem.play();
                    }

                    /* audio started loading */
                    // $('#radioAudio').on('loadstart', (e) => {})

                    /* audio will now start playing */
                    // $('#radioAudio').on('loadeddata', (e) => {})
                    $('#radioAudio').on('loadeddata', (e) => {
                        radioPlayBtn.style.color = radioBtnRed;
                        $('#radioPlayBtnIcon').removeClass('fa-spinner fa-spin').addClass('fa-pause');
                    })
                } else {
                    radioPlayBtn.style.color = radioBtnGreen
                    $('#radioPlayBtnIcon').removeClass('fa-pause').addClass('fa-play');

                    radioAudioElem.pause();
                }
            })
        })

        map.on('mouseenter', 'radioStationLayer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'radioStationLayer', () => {
            map.getCanvas().style.cursor = '';
        });

        // map.on('click', (e) => {
        //     const popup = new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
        //         .setLngLat(e.lngLat) // [-98.5606744, 36.8281576]
        //         .setHTML('This is a test.')
        //         .addTo(map);
        // })
    }

    if (map.loaded()) { addToMap() }
    else { map.on('load', function() { addToMap() }) }
}

module.exports = plotToMap;