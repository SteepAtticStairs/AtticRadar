const ut = require('../radar/utils');

function createCssClasses() {
    $("<style>")
    .prop("type", "text/css")
    .html(`
    .TD .mapboxgl-popup-content { background-color: ${ut.sshwsValues[0][1]}; color: black; }
    .TS .mapboxgl-popup-content { background-color: ${ut.sshwsValues[1][1]}; color: black; }
    .C1 .mapboxgl-popup-content { background-color: ${ut.sshwsValues[2][1]}; color: black; }
    .C2 .mapboxgl-popup-content { background-color: ${ut.sshwsValues[3][1]}; color: black; }
    .C3 .mapboxgl-popup-content { background-color: ${ut.sshwsValues[4][1]}; color: white; }
    .C4 .mapboxgl-popup-content { background-color: ${ut.sshwsValues[5][1]}; color: white; }
    .C5 .mapboxgl-popup-content { background-color: ${ut.sshwsValues[6][1]}; color: white; }

    .TD .mapboxgl-popup-tip { 
        border-top-color: ${ut.sshwsValues[0][1]};
        border-bottom-color: ${ut.sshwsValues[0][1]};
    }
    .TS .mapboxgl-popup-tip {
        border-top-color: ${ut.sshwsValues[1][1]};
        border-bottom-color: ${ut.sshwsValues[1][1]};
    }
    .C1 .mapboxgl-popup-tip {
        border-top-color: ${ut.sshwsValues[2][1]};
        border-bottom-color: ${ut.sshwsValues[2][1]};
    }
    .C2 .mapboxgl-popup-tip {
        border-top-color: ${ut.sshwsValues[3][1]};
        border-bottom-color: ${ut.sshwsValues[3][1]};
    }
    .C3 .mapboxgl-popup-tip {
        border-top-color: ${ut.sshwsValues[4][1]};
        border-bottom-color: ${ut.sshwsValues[4][1]};
    }
    .C4 .mapboxgl-popup-tip {
        border-top-color: ${ut.sshwsValues[5][1]};
        border-bottom-color: ${ut.sshwsValues[5][1]};
    }
    .C5 .mapboxgl-popup-tip {
        border-top-color: ${ut.sshwsValues[6][1]};
        border-bottom-color: ${ut.sshwsValues[6][1]};
    }`)
    .appendTo("head");
}

module.exports = {
    createCssClasses
}