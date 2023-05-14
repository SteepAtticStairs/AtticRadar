const parseHurricaneFile = require('./plotIBTRACS');
const ut = require('../../core/utils');

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function catInformation(mode, cat) {
    cat = parseInt(cat);
    if (mode == 'color') {
        var rgb = hexToRgb(ut.sshwsValues[cat + 1][1])
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
    } else if (mode == 'name') {
        return ut.sshwsValues[cat + 1][2];
    }
}

function initHurricaneArchiveListeners() {
    // <li><a class="dropdown-item" href="#" value="al">Atlantic</a></li>

    function buildDropdownElement(text, stormID, color) {
        var anchor = document.createElement('a');
        anchor.className = 'dropdown-item hurArch';
        anchor.href = '#';
        anchor.innerHTML = text;
        anchor.setAttribute('value', stormID)

        var line = document.createElement('li');
        line.style.backgroundColor = color;
        line.appendChild(anchor);

        document.getElementById('haStormNameDropdownMenu').appendChild(line);
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    $('#haSearchStorm').on('input', function() {
        $('#haStormNameDropdownMenu').empty();

        var textValue = $('#haSearchStorm').val();
        if (textValue == '') {
            $('.thingsToHideWhileTyping').hide();
            // show empty message
            $('#haStormNameDropdownEmpty').show();
        } else {
            $('.thingsToHideWhileTyping').hide();
            // show dropdown menu
            $('#haStormNameDropdownMenu').show();
        }
        textValue = textValue.toLowerCase();

        for (var n in stormList) {
            try {
                var sid = stormList[n][0];
                var name = stormList[n][1];
                var year = stormList[n][2];
                var basin = stormList[n][3];
                var maxCategory = stormList[n][4];
                name = capitalizeFirstLetter(name.toLowerCase());
                if (name.toLowerCase().includes(textValue)) {
                    buildDropdownElement(`${name} ${year} ${catInformation('name', maxCategory)}`, sid, catInformation('color', maxCategory))
                } else if (year.includes(textValue)) {
                    buildDropdownElement(`${name} ${year} ${catInformation('name', maxCategory)}`, sid, catInformation('color', maxCategory))
                }
            } catch (e) {
                //console.warn(e);
            }
        }
        var lengthOfStormSuggestions = document.getElementById("haStormNameDropdownMenu").getElementsByTagName("li").length;
        if (lengthOfStormSuggestions == 0) {
            $('.thingsToHideWhileTyping').hide();
            // show empty message
            $('#haStormNameDropdownError').show();
        }
    })

    window.addEventListener('click', function(e) {
        if ($(e.target).hasClass('hurArch')) {
            var thisText = $(e.target).text();
            var thisValue = e.target.getAttribute('value');

            var stormName = thisText.split(' ')[0];
            var stormYear = thisText.split(' ')[1];

            $('#hurricaneArchiveModalTrigger').click();
            $.getJSON(`https://raw.githubusercontent.com/SteepAtticStairs/hurricaneArchives/main/IBTrACS/storms/${thisValue}.json`, function(data) {
                parseHurricaneFile(data, thisValue);
            })
            //fetchHurricaneFile(thisValue, thisText.split(' ')[1]);
        }
    })
}

module.exports = initHurricaneArchiveListeners;