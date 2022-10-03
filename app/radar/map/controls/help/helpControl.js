const ut = require('../../../utils');
const createOffCanvasItem = require('../../../menu/createOffCanvasItem');

const helpContent = 
`This is a help screen coming soon.

<!-- This is a <b>help</b> <u>screen</u>
<br>
<br>
Please <strike>balls</strike>s.

<br>
https://stackoverflow.com/a/34202666/18758797
<div style="display: flex; justify-content: center;">
    <img src="../../../../../logo.png" width="20%" height="auto">
</div>
<br>

More <b>content</b> <u>for</u> testing.
<br>
Lm <strike>a</strike>o. -->`

//$.get('app/radar/map/controls/help/helpControlContent.html', function(data) {
    createOffCanvasItem({
        'id': 'helpMenuItem',
        'class': 'alert alert-secondary offCanvasMenuItem',
        'contents': 'Help',
        'icon': 'fa fa-question',
        'css': ''
    }, function(thisObj, innerDiv, iconElem) {
        ut.spawnModal({
            'title': 'Help',
            'headerColor': 'alert-info',
            'body': helpContent
        })
    })
//})