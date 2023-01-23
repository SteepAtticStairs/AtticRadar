class colorScaleHelper {
    constructor (colors, values) {
        this.colors = colors;
        this.values = this._editValuesArr(values);
        //this.sortedValues = values.sort((a, b) => a - b);
    }
    _getClosestValues(value) {
        const valuesLessThan = this.values.filter(function(element) { return element < value });
        const valuesGreaterThan = this.values.filter(function(element) { return element > value });

        // https://stackoverflow.com/a/19277804/18758797
        const closestLessThan = valuesLessThan.reduce(function(prev, curr) {
            return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
        });
        const closestGreaterThan = valuesGreaterThan.reduce(function(prev, curr) {
            return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
        });

        return [closestLessThan, closestGreaterThan];
    }
    // _getClosestColors(color) {
    //     var closestHigh, closestLow;
    //     var closestHighDist = 0, closestLowDist = Infinity;
    //     //split the input string to get the r, g, b values
    //     var rgbVal = color.match(/\d+/g);
    //     for (var i = 0; i < this.colors.length; i++) {
    //         var colorVal = this.colors[i].match(/\d+/g);
    //         //euclidean distance calculation
    //         var dist = Math.sqrt(
    //             Math.pow(rgbVal[0] - colorVal[0], 2) +
    //             Math.pow(rgbVal[1] - colorVal[1], 2) +
    //             Math.pow(rgbVal[2] - colorVal[2], 2)
    //         );
    //         if (dist < closestLowDist) {
    //             closestLow = this.colors[i];
    //             closestLowDist = dist;
    //         }
    //         if (dist > closestHighDist) {
    //             closestHigh = this.colors[i];
    //             closestHighDist = dist;
    //         }
    //     }
    //     return [closestLow, closestHigh];
    // }    
    _colorLog(content, color, otherCss) {
        console.log(`%c${content}`, `color: ${color}; ${otherCss}`);
    }
    // this just makes it so that color scales with hard stops will be plotted accurately
    _editValuesArr(values) {
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
        return values;
    }
    _rgbToArray(rgb) {
        return rgb.replace(/[^\d,]/g, '').split(',');
    }
    _arrayToRgb(array) {
        return `rgb(${array[0]}, ${array[1]}, ${array[2]})`;
    }
    _getColorFromPercentage(color1, color2, weight) {
        var w1 = weight / 100;
        var w2 = 1 - w1;
        var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
            Math.round(color1[1] * w1 + color2[1] * w2),
            Math.round(color1[2] * w1 + color2[2] * w2)];
        return this._arrayToRgb(rgb);
    }
    getColorFromValue(value) {
        if (this.values.includes(value)) {
            return this.colors[this.values.indexOf(value)];
        } else {
            const closestValues = this._getClosestValues(value);
            const minClosest = closestValues[0];
            const maxClosest = closestValues[1];
            var minColor = this.getColorFromValue(minClosest);
            minColor = this._rgbToArray(minColor);
            var maxColor = this.getColorFromValue(maxClosest);
            maxColor = this._rgbToArray(maxColor);

            const percent = (value - minClosest) / (maxClosest - minClosest) * 100;
            const gradientColor = this._getColorFromPercentage(maxColor, minColor, percent);

            return gradientColor;
        }
    }
    _colorDistance(color1, color2) {
        var color1Vals = color1.match(/\d+/g);
        var color2Vals = color2.match(/\d+/g);
        //euclidean distance calculation
        var dist = Math.sqrt(
            Math.pow(color1Vals[0] - color2Vals[0], 2) +
            Math.pow(color1Vals[1] - color2Vals[1], 2) +
            Math.pow(color1Vals[2] - color2Vals[2], 2)
        );
        return dist;
    }
    getValueFromColor(color, precision) {
        if (this.colors.includes(color)) {
            return this.values[this.colors.indexOf(color)];
        } else {
            var lowestDistance;
            var bestValueMatch;
            for (var i = this.values[0]; i <= this.values[this.values.length - 1]; i += precision) {
                var curColor = csh.getColorFromValue(i);
                var distance = this._colorDistance(color, curColor);
                if (distance < lowestDistance || lowestDistance == undefined) {
                    lowestDistance = distance;
                    bestValueMatch = i;
                }
            }
            return bestValueMatch;
        }
    }
}

// const colors = ['rgb(116, 78, 173)', 'rgb(147, 141, 117)', 'rgb(150, 145, 83)', 'rgb(210, 212, 180)', 'rgb(204, 207, 180)', 'rgb(65, 91, 158)', 'rgb(67, 97, 162)', 'rgb(106, 208, 225)', 'rgb(111, 214, 232)', 'rgb(53, 213, 91)', 'rgb(17, 213, 24)', 'rgb(9, 94, 9)', 'rgb(29, 104, 9)', 'rgb(234, 210, 4)', 'rgb(255, 226, 0)', 'rgb(255, 128, 0)', 'rgb(255, 0, 0)', 'rgb(113, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 146, 255)', 'rgb(255, 117, 255)', 'rgb(225, 11, 227)', 'rgb(178, 0, 255)', 'rgb(99, 0, 214)', 'rgb(5, 236, 240)', 'rgb(1, 32, 32)', 'rgb(1, 32, 32)', 'rgb(1, 32, 32)'];
// const values = [-30, -20, -20, -10, -10, 10, 10, 18, 18, 22, 22, 35, 35, 40, 40, 50, 50, 60, 60, 65, 65, 70, 70, 75, 75, 85, 85, 95];
const colors = ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)'];
const values = [10, 20, 30];


var csh = new colorScaleHelper(colors, values);
console.log(csh.getValueFromColor('rgb(12, 86, 223)', 0.1))
console.log(csh.getColorFromValue(27.5))
// console.log(csh.getColorFromValue(25))
// for (var i = values[0]; i < values[values.length - 1]; i += 0.5) {
//     var v = csh.getColorFromValue(i);
//     csh._colorLog(i, v)
// }