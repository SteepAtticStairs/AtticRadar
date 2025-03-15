const display_attic_dialog = require('../menu/attic_dialog');

const html_content = 
`<div style="text-align: center; padding-left: 20px; padding-right: 20px; color: rgb(200, 200, 200)">
Hey everyone,

Just a quick message that AtticRadar is no longer in active development. <br> \
<b>This does NOT mean that the website is shutting down!</b> <br> \
This only means that new features are unlikely to be added soon, with the only updates being minor bux fixes. <br><br> \

If AtticRadar suddenly breaks, and I'm not able to fix it in time, I'd recommend you to try another radar site. <br> \
<a href="https://web.weatherwise.app" style="color: #53a2e0;">https://web.weatherwise.app</a> (similar to AtticRadar, more features, active development) <br> \
<a href="https://radar.quadweather.com" style="color: #53a2e0;">https://radar.quadweather.com</a> <br> \
are both great alternatives. I'm not sponsored by them or anything, I just know that they work well. <br>
</div>
</div>`

display_attic_dialog({
    'title': 'Disclaimer',
    'body': html_content,
    'color': 'rgb(120, 120, 120)',
    'textColor': 'black',
})