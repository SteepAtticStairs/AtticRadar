const display_attic_dialog = require('../menu/attic_dialog');

const html_content = 
`<div style="text-align: center; padding-left: 20px; padding-right: 20px; color: rgb(200, 200, 200)">
Hey everyone,

AtticRadar is back (again)! Sorry for all the confusion.<br> 
I'll do my best in the future to make sure this stays up permanently.
-SteepAtticStairs
</div>
</div>`

// localStorage.removeItem('displayed_dialog');
const dd = localStorage.getItem('displayed_dialog');
if (!dd) {
    display_attic_dialog({
        'title': 'AtticRadar is back (again)',
        'body': html_content,
        'color': 'rgb(120, 120, 120)',
        'textColor': 'black',
    })
    localStorage.setItem('displayed_dialog', true);
}