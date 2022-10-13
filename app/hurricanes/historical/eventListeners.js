const fetchHurricaneFile = require('./fetchHurricaneFile');

function initHurricaneArchiveListeners() {
    // <li><a class="dropdown-item" href="#" value="al">Atlantic</a></li>

    function buildDropdownElement(text, stormID) {
        var anchor = document.createElement('a');
        anchor.className = 'dropdown-item hurArch';
        anchor.href = '#';
        anchor.innerHTML = text;
        anchor.setAttribute('value', stormID)

        var line = document.createElement('li');
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

        for (var i in allStorms) {
            for (var n in allStorms[i]) {
                try {
                    var currentStormNameIndex = allStorms[i][n][0];
                    currentStormNameIndex = capitalizeFirstLetter(currentStormNameIndex.toLowerCase());
                    var currentStormIDIndex = allStorms[i][n][1].toLowerCase();
                    var currentStormYearIndex = allStorms[i][n][2];
                    if (currentStormNameIndex.toLowerCase().includes(textValue)) {
                        buildDropdownElement(`${currentStormNameIndex} ${currentStormYearIndex}`, currentStormIDIndex)
                    }
                } catch (e) {
                    console.warn(e);
                }
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

            $('#hurricaneArchiveModalTrigger').click();
            fetchHurricaneFile(thisValue, thisText.split(' ')[1]);
        }
    })
}

module.exports = initHurricaneArchiveListeners;