function initPaletteTooltip(produc, colortcanvas) {
    var hycObj = {
        0: 'ND: Below Threshold',
        1: 'ND: Below Threshold',
        2: 'BI: Biological',
        3: 'GC: Anomalous Propagation/Ground Clutter',
        4: 'IC: Ice Crystals',
        5: 'DS: Dry Snow',
        6: 'WS: Wet Snow',
        7: 'RA: Light and/or Moderate Rain',
        8: 'HR: Heavy Rain',
        9: 'BD: Big Drops (rain)',
        10: 'GR: Graupel',
        11: 'HA: Hail, possibly with rain',
        12: 'LH: Large Hail',
        13: 'GH: Giant Hail',
        14: 'UK: Unknown Classification',
        15: 'RF: Range Folded',
    };
    const tooltip = bootstrap.Tooltip.getInstance('#texturecolorbar')
    if (produc == "HHC" || produc == "N0H") {
        function getCursorPosition(canvas, event) {
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            return ({ "x": x, "y": y });
        }
        colortcanvas.addEventListener('mousemove', function (e) {
            if (document.getElementById('curProd').innerHTML == 'hyc' || document.getElementById('curProd').innerHTML == 'hhc') {
                var xPos = getCursorPosition(colortcanvas, e).x;
                var thearr = [];
                var numOfColors = 14;
                for (var e = 0; e < numOfColors; e++) {
                    thearr.push(Math.round((colortcanvas.width / numOfColors) * e))
                }
                var thearr2 = thearr;
                thearr.push(xPos);
                thearr2.sort(function (a, b) { return a - b });
                var xPosIndex = thearr2.indexOf(xPos);
                var xPosProduct = hycObj[thearr2.indexOf(xPos)];
                //console.log(xPosProduct)
                tooltip.enable();
                tooltip.setContent({ '.tooltip-inner': xPosProduct })
            }
        })
    } else {
        tooltip.disable();
    }
    //$('#texturecolorbar').off()
}

module.exports = {
    initPaletteTooltip
}