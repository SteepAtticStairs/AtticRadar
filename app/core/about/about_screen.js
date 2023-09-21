const display_attic_dialog = require('../menu/attic_dialog');

$('#armrAboutBtn').click(function() {
    const html_content = 
`<div style="text-align: center; padding-left: 20px; padding-right: 20px; color: rgb(200, 200, 200)">
<div style="font-size: 20px"><b>Hey!</b></div>
Thanks for checking out my project AtticRadar!
This app was made by an independent developer - a high school student.

You can find AtticRadar on Twitter: <a href="https://twitter.com/AtticRadar" style="color: #53a2e0;">@AtticRadar</a>
Be sure to check there for updates and general info about the project.

AtticRadar is free to use and doesn't have any ads. \
I hope that you enjoy the app, and feel free to shoot me a message on Twitter if you have a question! \
My email is also open: <a href="mailto:steepatticstairs@gmail.com" style="color: #53a2e0;">steepatticstairs@gmail.com</a> \
You can also message me on Discord - my username is <code class="about_box_code">steepatticstairs</code>.

Are you looking for AtticRadar's source code?
Due to previous use of my code that I wasn't comfortable with, I have unfortunately decided to make the source code private, for the time being. \
However, if you believe you have a legitimate reason for viewing the code, feel free to send me a message or an message explaining why, and I'll consider it. \
Thanks!

Copyright © 2023 SteepAtticStairs. All rights reserved.
</div>
</div>`

    display_attic_dialog({
        'title': 'About',
        'body': html_content,
        'color': 'rgb(120, 120, 120)',
        'textColor': 'black',
    })
})