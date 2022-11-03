const ut = require('../radar/utils');

// https://github.com/mapbox/mapbox-gl-js/issues/2848#issuecomment-354447882

function createCssClasses() {
    $("<style>")
    .prop("type", "text/css")
    .html(`
    .TD.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[0][1]}; }
    .TD.mapboxgl-popup-anchor-top .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[0][1]}; }
    .TD.mapboxgl-popup-anchor-left .mapboxgl-popup-tip { border-right-color: ${ut.sshwsValues[0][1]}; }
    .TD.mapboxgl-popup-anchor-right .mapboxgl-popup-tip { border-left-color: ${ut.sshwsValues[0][1]}; }
    .TD.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[0][1]}; }
    .TD.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[0][1]}; }
    .TD.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[0][1]}; }
    .TD.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[0][1]}; }

    .TS.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[1][1]}; }
    .TS.mapboxgl-popup-anchor-top .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[1][1]}; }
    .TS.mapboxgl-popup-anchor-left .mapboxgl-popup-tip { border-right-color: ${ut.sshwsValues[1][1]}; }
    .TS.mapboxgl-popup-anchor-right .mapboxgl-popup-tip { border-left-color: ${ut.sshwsValues[1][1]}; }
    .TS.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[1][1]}; }
    .TS.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[1][1]}; }
    .TS.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[1][1]}; }
    .TS.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[1][1]}; }

    .C1.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[2][1]}; }
    .C1.mapboxgl-popup-anchor-top .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[2][1]}; }
    .C1.mapboxgl-popup-anchor-left .mapboxgl-popup-tip { border-right-color: ${ut.sshwsValues[2][1]}; }
    .C1.mapboxgl-popup-anchor-right .mapboxgl-popup-tip { border-left-color: ${ut.sshwsValues[2][1]}; }
    .C1.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[2][1]}; }
    .C1.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[2][1]}; }
    .C1.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[2][1]}; }
    .C1.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[2][1]}; }

    .C2.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[3][1]}; }
    .C2.mapboxgl-popup-anchor-top .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[3][1]}; }
    .C2.mapboxgl-popup-anchor-left .mapboxgl-popup-tip { border-right-color: ${ut.sshwsValues[3][1]}; }
    .C2.mapboxgl-popup-anchor-right .mapboxgl-popup-tip { border-left-color: ${ut.sshwsValues[3][1]}; }
    .C2.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[3][1]}; }
    .C2.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[3][1]}; }
    .C2.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[3][1]}; }
    .C2.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[3][1]}; }

    .C3.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[4][1]}; }
    .C3.mapboxgl-popup-anchor-top .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[4][1]}; }
    .C3.mapboxgl-popup-anchor-left .mapboxgl-popup-tip { border-right-color: ${ut.sshwsValues[4][1]}; }
    .C3.mapboxgl-popup-anchor-right .mapboxgl-popup-tip { border-left-color: ${ut.sshwsValues[4][1]}; }
    .C3.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[4][1]}; }
    .C3.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[4][1]}; }
    .C3.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[4][1]}; }
    .C3.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[4][1]}; }

    .C4.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[5][1]}; }
    .C4.mapboxgl-popup-anchor-top .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[5][1]}; }
    .C4.mapboxgl-popup-anchor-left .mapboxgl-popup-tip { border-right-color: ${ut.sshwsValues[5][1]}; }
    .C4.mapboxgl-popup-anchor-right .mapboxgl-popup-tip { border-left-color: ${ut.sshwsValues[5][1]}; }
    .C4.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[5][1]}; }
    .C4.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[5][1]}; }
    .C4.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[5][1]}; }
    .C4.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[5][1]}; }

    .C5.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[6][1]}; }
    .C5.mapboxgl-popup-anchor-top .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[6][1]}; }
    .C5.mapboxgl-popup-anchor-left .mapboxgl-popup-tip { border-right-color: ${ut.sshwsValues[6][1]}; }
    .C5.mapboxgl-popup-anchor-right .mapboxgl-popup-tip { border-left-color: ${ut.sshwsValues[6][1]}; }
    .C5.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[6][1]}; }
    .C5.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[6][1]}; }
    .C5.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[6][1]}; }
    .C5.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[6][1]}; }

    .Other.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[7][1]}; }
    .Other.mapboxgl-popup-anchor-top .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[7][1]}; }
    .Other.mapboxgl-popup-anchor-left .mapboxgl-popup-tip { border-right-color: ${ut.sshwsValues[7][1]}; }
    .Other.mapboxgl-popup-anchor-right .mapboxgl-popup-tip { border-left-color: ${ut.sshwsValues[7][1]}; }
    .Other.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[7][1]}; }
    .Other.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip { border-bottom-color: ${ut.sshwsValues[7][1]}; }
    .Other.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[7][1]}; }
    .Other.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip { border-top-color: ${ut.sshwsValues[7][1]}; }

    .TD .mapboxgl-popup-content { background-color: ${ut.sshwsValues[0][1]}; color: black; border-radius: 10px; pointer-events: none; }
    .TS .mapboxgl-popup-content { background-color: ${ut.sshwsValues[1][1]}; color: black; border-radius: 10px; pointer-events: none; }
    .C1 .mapboxgl-popup-content { background-color: ${ut.sshwsValues[2][1]}; color: black; border-radius: 10px; pointer-events: none; }
    .C2 .mapboxgl-popup-content { background-color: ${ut.sshwsValues[3][1]}; color: black; border-radius: 10px; pointer-events: none; }
    .C3 .mapboxgl-popup-content { background-color: ${ut.sshwsValues[4][1]}; color: white; border-radius: 10px; pointer-events: none; }
    .C4 .mapboxgl-popup-content { background-color: ${ut.sshwsValues[5][1]}; color: white; border-radius: 10px; pointer-events: none; }
    .C5 .mapboxgl-popup-content { background-color: ${ut.sshwsValues[6][1]}; color: white; border-radius: 10px; pointer-events: none; }
    .Other .mapboxgl-popup-content { background-color: ${ut.sshwsValues[7][1]}; color: white; border-radius: 10px; pointer-events: none; }
    `)
    .appendTo("head");
}

module.exports = {
    createCssClasses
}