const ut = require('../../utils');
const chroma = require('chroma-js');

function rgbValToArray(rgbString) {
    return rgbString
            .replace('rgb(', '')
            .replace('rgba(', '')
            .replace(')', '')
            .split(', ')
}
function chromaScaleToRgbString(scaleOutput) {
    return `rgb(${parseInt(scaleOutput._rgb[0])}, ${parseInt(scaleOutput._rgb[1])}, ${parseInt(scaleOutput._rgb[2])})`
}
function scaleForWebGL(num) {
    return ut.scale(num, 0, 255, 0, 1);
}

// this just makes it so that color scales with hard stops will be plotted accurately
function editValuesArr(values) {
    var modifier = 0.000000001;
    for (var i in values) {
        if (values[i] == values[i - 1]) {
            if (values[i - 1] < 0) {
                values[i - 1] = values[i - 1] + modifier;
            } else {
                values[i - 1] = values[i - 1] - modifier;
            }
        }
    }

    // console.log(values);
    return values;
}

//onmessage=function(oEvent) {
function calcPolygons(url, phi, radarLat, radarLon, radVersion, valuesArr, colorsArr, callback) {
    $('#dataDiv').data('calcPolygonsData', [url, phi, radarLat, radarLon, radVersion]);
    //var url = oEvent.data[0];

    //250/2
    //1000/2
    //var gateRes = 125;
    //var multiplier = gateRes*2;
    //var radVersion = oEvent.data[4];

    var rc = ut.getRadialConstants(radVersion);
    var gateRes = rc.gateRes;
    var multiplier = rc.multiplier;

    console.log(gateRes, multiplier)

    function radians(deg) {
        return (3.141592654/180.)*deg;
    }

    var radarLat = radians(radarLat); // radians(oEvent.data[2]);
    var radarLon = radians(radarLon); // radians(oEvent.data[3]);
    var inv = 180.0/3.141592654;
    var re = 6371000.0;
    var phi = radians(phi)//radians(oEvent.data[1]);
    var h0 = 0.0;

    valuesArr = editValuesArr(valuesArr);
    var chromaScale = chroma.scale(colorsArr).domain(valuesArr).mode('lab');

    // for (var i = valuesArr[0]; i < valuesArr[valuesArr.length - 1]; i++) {
    //     var rgba = chromaScaleToRgbString(chromaScale(i));
    //     ut.colorLog(i, rgba);
    // }

    function calculatePosition(az, range) {
        var mathaz = radians(90.0 - az);
        var h = Math.sqrt(Math.pow(range,2.0)+Math.pow(((4./3.)*re+h0),2.0)+2.*range*((4./3.)*re+h0)*Math.sin(phi))-(4./3.)*re;
        var ca = Math.acos((Math.pow(range,2.0)-Math.pow(re,2.0)-Math.pow(re+h,2.0))/(-2.0*re*(re+h)));
        var xcart = (ca*re)*Math.cos(mathaz);
        var ycart = (ca*re)*Math.sin(mathaz);
        //convert to latitude longitude
        var rho = Math.sqrt(Math.pow(xcart,2.0)+Math.pow(ycart,2.0));
        var c = rho/re;
        var lat = Math.asin(Math.cos(c)*Math.sin(radarLat)+(ycart*Math.sin(c)*Math.cos(radarLat))/(rho))*inv;
        lon = (radarLon + Math.atan((xcart*Math.sin(c))/(rho*Math.cos(radarLat)*Math.cos(c)-ycart*Math.sin(radarLat)*Math.sin(c))))*inv;

        //console.log(lat, lon)

        mx = (180.0 + lon)/360.0;
        my = (180. - (180. / 3.141592654 * Math.log(Math.tan(3.141592654 / 4. + lat * 3.141592654 / 360.)))) / 360.; 
        //console.log(mx,my);
        return {
            x:mx,
            y:my
        }
    }

    //function to process file
    function reqListener() {
        var json = JSON.parse(this.responseText);

        var azs = json.azimuths;
        var min = azs[0];
        var max = azs[azs.length-1];

        for (var key in json.radials) {
            if (key == "azimuths") continue;
            key = +key;
            var values = json.radials[key];
            var az = azs[key];
            var leftAz, rightAz, bottomR, topR;

            //case when first az
            if (key == 0) {
                //case when crossing 0
                leftAz = (min + 360 + max)/2;
                rightAz = (az+azs[key+1])/2;
            } else if (key == azs.length-1) {
                //case when crossing 0 the other way
                leftAz = (az + azs[key-1])/2;
                rightAz = (min+360+max)/2;
            } else {
                //case when nothing to worry about
                leftAz = (az + azs[key-1])/2;
                rightAz = (az + azs[key+1])/2;
            }

            //loop through radar range gates
            for (var i=0; i<values.length; i++) {
                bottomR = values[i]*multiplier - gateRes;
                topR = values[i]*multiplier + gateRes;

                var bl = calculatePosition(leftAz, bottomR);
                //console.log(bl, bl.x);
                var tl = calculatePosition(leftAz, topR);
                var br = calculatePosition(rightAz, bottomR);
                var tr = calculatePosition(rightAz, topR);

                output.push(
                    bl.x,//leftAz,
                    bl.y,//bottomR,

                    tl.x,//leftAz,
                    tl.y,//topR,

                    br.x,//rightAz,
                    br.y,//bottomR,
                    br.x,//rightAz,
                    br.y,//bottomR,

                    tl.x,//leftAz,
                    tl.y,//topR,
                    tr.x,//rightAz,
                    tr.y//topR
                )

                var colorVal = json.values[key][i];
                var colorAtVal = chromaScaleToRgbString(chromaScale(colorVal));
                var arrayColorAtVal = rgbValToArray(colorAtVal);
                var r = scaleForWebGL(arrayColorAtVal[0]);
                var g = scaleForWebGL(arrayColorAtVal[1]);
                var b = scaleForWebGL(arrayColorAtVal[2]);
                var a = 1;
                colors.push(
                    r, g, b, a,
                    r, g, b, a,
                    r, g, b, a,
                    r, g, b, a,
                    r, g, b, a,
                    r, g, b, a,
                )
                //colors.push(colorVal, colorVal, colorVal, colorVal, colorVal, colorVal);
            }
        }
        callback({
            'verticies': output,
            'colors': colors
        });
        //postMessage({"data":typedOutput.buffer,"indices":indexOutput.buffer,"colors":colorOutput.buffer},[typedOutput.buffer,indexOutput.buffer,colorOutput.buffer]);
    }

    //get file from server
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();

    var output = [];
    //var maxUn = 467000;
    //var firstGate = 2125;
    //var startingAngle = 0.0;
    var indices = [];
    var colors = [];
}
//}

module.exports = {
    calcPolygons
}