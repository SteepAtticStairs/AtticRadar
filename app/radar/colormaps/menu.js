const product_colors = require('./colormaps');
const colortable_parser = require('./colortable_parser');

function create_css_gradient(colors, values) {
    const cmax = values[values.length - 1];
    const cmin = values[0];
    const clen = colors.length;

    var gradient_colors = '';
    for (var i = 0; i < clen; ++i) {
        var cur_percent = (((values[i] - cmin) / (cmax - cmin)) * 100);
        gradient_colors += `${colors[i]} ${cur_percent}%`;
        if (!(i == clen - 1)) { gradient_colors += ',\n' }
    }

    return gradient_colors;
}

const lookup = {
    'REF': ['REF', 'N0B', 'N1B', 'N2B', 'N3B', 'TZL', 'TZ0', 'TZ1', 'TZ2', 'TZ3'],
    'VEL': ['VEL', 'N0G', 'N1G', 'N2G', 'N3G', 'NAG', 'NBG', 'N0U', 'N1U', 'N2U', 'N3U', 'TV0', 'TV1', 'TV2'],
    'RHO': ['RHO', 'N0C', 'N1C', 'N2C', 'N3C'],
    'ZDR': ['ZDR', 'N0X', 'N1X', 'N2X', 'N3X'],
    'KDP': ['N0K', 'N1K', 'N2K', 'N3K'],
    'DVL': ['DVL']
}
const ctables = [
    'REF1', 'REF2', 'REF3', 'REF4',
    'VEL1', 'VEL2',
    'RHO1',
    'ZDR1',
    'KDP1',
    'DVL1',
];

function _generate_images() {
    for (var product of ctables) {
        const css_gradient = create_css_gradient(product_colors[product].colors, product_colors[product].values);
        $(`#${product}_colortable_preview`).css({ background: `linear-gradient(to right, ${css_gradient})`});
    }
}
_generate_images();

const check = '<span class="colortable_menu_check"><i class="fa fa-circle-check icon-blue"></i></span>';
$(document).on('click', '.colortableRow', function() {
    const current_row_checked = $(this).find('.colortable_menu_check').length == 1;

    if (!current_row_checked) {
        $(this).parent().find('.colortable_menu_check').remove();

        const orig_html = $(this).html();
        $(this).html(`${check}${orig_html}`);

        const this_ctable_name = $(this).attr('name');
        change_colortable(this_ctable_name.slice(0, 3), this_ctable_name);
    }
})

$('.colortable_upload_btn').click(function() {
    const name = $(this).attr('name');
    const matches = ctables.filter(item => item.startsWith(name)).map(item => parseInt(item.slice(-1)));
    const next_num = matches[matches.length - 1] + 1;
    window.atticData.next_ctable_id = `${name}${next_num}`;

    $('#hidden_colortable_file_uploader').click();
})
$('#hidden_colortable_file_uploader').on('input', () => {
    var files = document.getElementById('hidden_colortable_file_uploader').files;
    const uploaded_file = files[0];

    const reader = new FileReader();
    reader.addEventListener('load', function () {
        const buffer = Buffer.from(this.result);
        const colortable_string = buffer.toString('utf-8');
        const next_ctable_id = window.atticData.next_ctable_id;

        const options_section_id = `${next_ctable_id.slice(0, 3)}_ctable_options`;
        document.getElementById(options_section_id).innerHTML +=
`<div class="atticRadarMenuRow colortableRow armrWide armrBottom" id="armr${next_ctable_id}ColortableBtn" name="${next_ctable_id}">
<span class="colortable_menu_text">User Upload</span>
<div class="colortable_menu_image_preview" id="${next_ctable_id}_colortable_preview"></div>
</div>`

        product_colors[next_ctable_id] = colortable_parser(colortable_string, true);
        ctables.push(next_ctable_id);
        _generate_images();
    }, false);
    reader.readAsArrayBuffer(uploaded_file);
})

function change_colortable(product, new_ctable) {
    const colors = product_colors[new_ctable].colors;
    const values = product_colors[new_ctable].values;

    const all_to_change = lookup[product];
    for (var cur_product of all_to_change) {
        product_colors[cur_product].colors = colors;
        product_colors[cur_product].values = values;
    }

    var a_d = window.atticData;
    if (a_d?.nexrad_factory != undefined) {
        if (a_d.nexrad_factory.nexrad_level == 3) {
            a_d.nexrad_factory.plot();
        } else {
            a_d.nexrad_factory.plot(a_d.nexrad_factory_moment, a_d.nexrad_factory_elevation_number);
        }
    }
}