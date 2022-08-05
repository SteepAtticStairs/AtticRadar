const utilFuncs = require('../utils');
const loaders = require('../loaders');
const phpProxy = require('../utils').phpProxy;

var tiltObject = require('../utils').tiltObject;
var numOfTiltsObj = require('../utils').numOfTiltsObj;
var allL2Btns = require('../utils').allL2Btns;

function tiltClickFunc() {
    document.getElementById('tiltDropdownBtn').innerHTML = this.innerHTML;
    $('#tiltDropdownBtn').attr('value', $(this).attr('value'))

    if (document.getElementById('curProd').innerHTML != '') {
        loaders.loadLatestFile(
            'l3',
            document.getElementById('curProd').innerHTML,
            $(this).attr('value'),
            $('#stationInp').val().toLowerCase()
        );
    }
}
$('.productBtnGroup button').on('click', function () {
    if (this.value == 'load') {
        loaders.getLatestFile($('#stationInp').val(), function (fileName, y, m, d, s) {
            var individualFileURL = `https://noaa-nexrad-level2.s3.amazonaws.com/${y}/${m}/${d}/${s}/${fileName}`
            //console.log(phpProxy + individualFileURL)
            loaders.loadFileObject(phpProxy + individualFileURL, 'balls', 2, 'REF');
        });
    }

    //$('#productInput').val()
    var initInnerHTML = this.innerHTML;
    if (!initInnerHTML.includes('span')) {
        this.innerHTML = `<span class="spinner-border spinner-border-sm text-dark" role="status" aria-hidden="true"></span>&nbsp;&nbsp;` + initInnerHTML;
        var thisBtn = this;
        document.getElementById('testEventElem').addEventListener('DOMSubtreeModified', function () {
            thisBtn.innerHTML = initInnerHTML;
        }, { once: true })
    }
    $('.btn-outline-success').each(function () {
        $(this).removeClass('btn-outline-success');
        $(this).addClass('btn-outline-primary');
    });
    $(this).removeClass('btn-outline-primary');
    $(this).addClass('btn-outline-success');
    document.getElementById('curProd').innerHTML = this.value;

    if (this.value.includes('l2')) {
        //console.log('level twoo')
    } else {
        loaders.listTilts(numOfTiltsObj[this.value]);
        $('#tiltDropdownBtn').attr('value', 'tilt' + numOfTiltsObj[this.value][0]);
        $('#tiltDropdown a').on('click', tiltClickFunc);
        if (!allL2Btns.includes(this.value)) {
            loaders.loadLatestFile(
                'l3',
                this.value,
                $('#tiltDropdownBtn').attr('value'),
                $('#stationInp').val().toLowerCase()
            );
        } else {
            loaders.loadLatestFile('l2', this.value);
        }
    }
});