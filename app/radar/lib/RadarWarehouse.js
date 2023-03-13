const allMoments = ['REF', 'VEL', 'SW', 'ZDR', 'PHI', 'RHO', 'CFP'];

function npDiff(arr) {
    var returnArr = [];
    for (var i in arr) {
        i = parseInt(i);
        var theDiff = arr[i + 1] - arr[i];
        if (!Number.isNaN(theDiff)) {
            // if (theDiff > 180) { theDiff -= 360 }
            // if (theDiff < -180) { theDiff += 360 }
            returnArr.push(theDiff);
        }
    }
    return returnArr;
}
const mean = array => array.reduce((a, b) => a + b) / array.length;
function removeLast(arr) {
	arrCopy = [...arr];
	arrCopy.pop();
    return arrCopy;
}
function removeFirst(arr) {
	arrCopy = [...arr];
	arrCopy.shift();
    return arrCopy;
}

// https://stackoverflow.com/a/40475362/18758797
function npLinspace(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
    }
    return arr;
}

class RadarWarehouse {
    constructor(initialRadarObj) {
        this._initialRadarObj = initialRadarObj;

        this.fileHeader = initialRadarObj.volume_header;
        this.vcp = initialRadarObj.vcp;
        this.nexradLevel = initialRadarObj.nexradLevel;

        if (this.nexradLevel == 2) {
            var momentDataScans = [];
            for (var i in initialRadarObj.radial_records) {
                var curRadialRecord = initialRadarObj.radial_records[i];
                var elevNumber = curRadialRecord['msg_header'].elevation_number;
                if (momentDataScans[elevNumber] == undefined) { momentDataScans[elevNumber] = [] }
                momentDataScans[elevNumber].push(curRadialRecord);
            }
            this.momentDataScans = momentDataScans;

            // this.scale_values();
            this._format_like_l2rad();
        }
    }
    get_azimuths(elevationNumber) {
        var az = [];
        if (this.nexradLevel == 2) {
            for (var i in this.formattedData[elevationNumber]) { az.push(this.formattedData[elevationNumber][i].record.azimuth_angle) }
        }/* else if (this.nexradLevel == 3) {
            for (var i in radarObj.radialPackets[0].radials) { az.push(radarObj.radialPackets[0].radials[i].startAngle) }
        }
        if (this.nexradLevel == 3) { az.push(az[0]) } */

        /*
        * Perform some adjustments on the azimuth values
        */
        if (this.nexradLevel == 2) {
            var diff = npDiff(az);
            var crossed;
            for (var i in diff) { if (diff[i] < -180) { crossed = parseInt(i) } }
            diff[crossed] += 360;
            var avg_spacing = mean(diff);

            var rL = removeLast(az);
            var rF = removeFirst(az);

            az = [];
            for (var i in rL) { az.push((rL[i] + rF[i]) / 2) }
            az[crossed] += 180;
            az.unshift(az[0] - avg_spacing);
            az.push(az[az.length - 1] + avg_spacing);
        }

        return az;
    }
    get_data(elevationNumber, product) {
        var prodValues = [];
        if (this.nexradLevel == 2) {
            for (var i in this.formattedData[elevationNumber]) { prodValues.push(this.formattedData[elevationNumber][i].record[product]['moment_data']) }
        }/* else if (level == 3) {
            for (var i in radarObj.radialPackets[0].radials) { prodValues.push(radarObj.radialPackets[0].radials[i].bins) }
        }
        if (level == 3) { prodValues.push(prodValues[0]) } */
        return prodValues;
    }
    get_ranges(elevationNumber, product) {
        var prod_range;
        if (this.nexradLevel == 2) {
            var prod_hdr = this.formattedData[elevationNumber][0].record[product];
            var gate_count = prod_hdr.ngates;
            var gate_size = prod_hdr.gate_spacing / 1000;
            var first_gate = prod_hdr.first_gate / 1000;
            // level 2 = 1832 0.25 2.125
            prod_range = [...Array(gate_count + 1).keys()];
            for (var i in prod_range) {
                prod_range[i] = (prod_range[i] - 0.5) * gate_size + first_gate;
            }
        }/* else if (this.nexradLevel == 3) {
            var prod_hdr = radarObj.radialPackets[0];
            var maxRange = maxRanges[radarObj.messageHeader.code]; // km
            prod_range = npLinspace(0, maxRange, prod_hdr.numberBins + 1)
            // gate_count = prod_hdr.numberBins;
            // gate_size = prod_hdr.radials[0].angleDelta;
            // first_gate = prod_hdr.firstBin;
        } */
        return prod_range;
    }

    _format_like_l2rad() {
        var formattedData = [];
        for (var i in this.momentDataScans) {
            var curElev = this.momentDataScans[i];
            var curElevDataStorage = [];
            for (var n in curElev) {
                var obj = {}
                obj = curElev[n].header;
                obj.record = curElev[n].msg_header;

                for (var x in allMoments) {
                    if (curElev[n].hasOwnProperty(allMoments[x])) {
                        obj.record[allMoments[x]] = curElev[n][allMoments[x]];
                        obj.record[allMoments[x]].moment_data = obj.record[allMoments[x]].data;
                        delete obj.record[allMoments[x]].data;
                    }
                }
                curElevDataStorage.push(obj);
            }
            formattedData[i] = curElevDataStorage;
        }
        this.formattedData = formattedData;
        delete this.momentDataScans;
    }
    // get_moment_for_elevation(moment, elevationNum) {
    //     var finalDataArr = [];
    //     var requestedElevData = this.momentDataScans[elevationNum];
    //     for (var i in requestedElevData) {
    //         if (requestedElevData[i].hasOwnProperty(moment)) {
    //             finalDataArr.push(requestedElevData[i][moment]);
    //         }
    //     }
    //     return finalDataArr;
    // }
    // get_data(moment, elevationNum) {
    //     var finalDataArr = [];
    //     var momentDataForElev = this.getMomentForElevation(moment, elevationNum);
    //     for (var i in momentDataForElev) {
    //         finalDataArr.push(momentDataForElev[i].data);
    //     }
    //     return finalDataArr;
    // }
}

module.exports = RadarWarehouse;