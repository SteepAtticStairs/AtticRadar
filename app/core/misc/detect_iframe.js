const display_attic_dialog = require('../menu/attic_dialog');

function in_iframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

if (in_iframe()) {
    const html_content = 
`<div style="text-align: center; padding-left: 20px; padding-right: 20px; color: rgb(200, 200, 200)">
<div style="font-size: 20px"><b>Hey!</b></div>
<div style="font-size: 15px">I see that you're loading AtticRadar from an iframe. \
<b>Don't worry!</b> That's totally fine! \
<b>However</b>, this project was made by an independent developer - a high school student! \
So I do think you'd agree that giving credit isn't objectionable here!

You can find AtticRadar on Twitter: <a href="https://twitter.com/AtticRadar" style="color: #53a2e0;">@AtticRadar</a>
Be sure to check there for updates and general info about the project.

AtticRadar is free to use and doesn't have any ads. \
I hope that you enjoy the app, and feel free to shoot me a message on Twitter if you have a question! \
My email is also open: <a href="mailto:steepatticstairs@gmail.com" style="color: #53a2e0;">steepatticstairs@gmail.com</a>
</div>
</div>`

    display_attic_dialog({
        'title': 'Notice',
        'body': html_content,
        'color': 'rgb(120, 120, 120)',
        'textColor': 'black',
    })
}