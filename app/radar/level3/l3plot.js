const calculateVerticies = require('../draw/calculateVertices');

function l3plot(l3rad) {
    window.l3rad = l3rad;
    calculateVerticies(l3rad, 3, {
        'mode': 'mapPlot'
    });
}

module.exports = l3plot;