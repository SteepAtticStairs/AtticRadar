const parseHurricaneFile = require('./plotIBTRACS');

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
                name = capitalizeFirstLetter(name.toLowerCase());
                if (name.toLowerCase().includes(textValue)) {
                    buildDropdownElement(`${name} ${year}`, sid)
                } else if (year.includes(textValue)) {
                    buildDropdownElement(`${name} ${year}`, sid)
                }
            } catch (e) {
                console.warn(e);
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