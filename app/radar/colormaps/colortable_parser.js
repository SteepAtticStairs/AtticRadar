// https://www.grlevelx.com/manuals/color_tables/files_color_table.htm
function colortable_parser(colortable_string, should_print = false) {
    // console.log(colortable_string);

    var colors = [];
    var values = [];
    var range_fold = undefined;

    // this removes empty lines and splits at new lines.
    // https://stackoverflow.com/a/16369666/18758797
    const lines = colortable_string.replace(/(^[ \t]*\n)/gm, '').replaceAll('\r', '\n').split('\n');
    for (var i = 0; i < lines.length; i++) {
        const prev_line = lines[i - 1]?.toLowerCase();
        const cur_line = lines[i].toLowerCase();
        const next_line = lines[i + 1]?.toLowerCase();
        if (['color', 'color4', 'solidcolor', 'solidcolor4', 'rf'].some(prefix => cur_line.startsWith(prefix))) {
            // https://stackoverflow.com/a/32727737/18758797
            const prev_line_parts = prev_line?.replaceAll(',', '').split(/\s+/).filter(n => n);
            const line_parts = cur_line.replaceAll(',', '').split(/\s+/).filter(n => n);
            const next_line_parts = next_line?.replaceAll(',', '').split(/\s+/).filter(n => n);
            const prefix = line_parts[0];
            var has_alpha = false;
            if (prefix.includes('4')) { has_alpha = true; }

            if (prefix.includes('rf')) {
                const [r, g, b] = [line_parts[1], line_parts[2], line_parts[3]];
                var color_string = `rgb(${r}, ${g}, ${b})`;
                range_fold = color_string;
            } else {
                const prev_value = parseFloat(prev_line_parts?.[1]);
                const value = parseFloat(line_parts[1]);
                const next_value = parseFloat(next_line_parts?.[1]);
                const [r, g, b] = [line_parts[2], line_parts[3], line_parts[4]];
                var color_string = `rgb(${r}, ${g}, ${b}`;
                // var a;
                // if (has_alpha) {
                //     a = line_parts[5];
                //     color_string += `, ${a}`;
                //     color_string = color_string.replaceAll('rgb', 'rgba');
                // }
                color_string += ')';

                colors.push(color_string);
                values.push(value);

                if (prefix.includes('solidcolor')) {
                    colors.push(color_string);
                    if (!Number.isNaN(next_value)) {
                        values.push(next_value);
                    } else { // this is for hydrometer products, you generally can't use SolidColors as the last color
                        const spacing = value - prev_value;
                        values.push(value + spacing);
                    }
                }

                check_length = 5;
                if (has_alpha) {
                    check_length = 6;
                }
                if (line_parts.length > check_length) {
                    var offset = 0;
                    if (has_alpha) {
                        offset = 1;
                    }
                    const [r2, g2, b2] = [line_parts[5 + offset], line_parts[6 + offset], line_parts[7 + offset]];
                    var color_string2 = `rgb(${r2}, ${g2}, ${b2}`;
                    // var a2;
                    // if (has_alpha) {
                    //     a2 = line_parts[9];
                    //     color_string2 += `, ${a2}`;
                    //     color_string2 = color_string2.replaceAll('rgb', 'rgba');
                    // }
                    color_string2 += ')';

                    colors.push(color_string2);
                    if (!Number.isNaN(next_value)) {
                        values.push(next_value);
                    }
                }
            }
        }
    }

    const return_obj = {
        'colors': colors,
        'values': values,
    }
    if (range_fold != undefined) {
        return_obj.range_fold = range_fold;
    }
    if (should_print) {
        console.log(return_obj)
    }
    return return_obj;
}

module.exports = colortable_parser;