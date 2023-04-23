const luxon = require('luxon');

// https://stackoverflow.com/a/544429/18758797
function get_date_diff_obj(date1, date2) {
    // var diff = Date.parse( date2 ) - Date.parse( date1 );
    // var isNegative = (diff < 0);
    // if (isNegative) {
    //     // negative
    //     diff = Math.abs(diff);
    // }
    // return isNaN( diff ) ? NaN : {
    //     //diff : diff,
    //     ms : Math.floor( diff            % 1000 ),
    //     s  : Math.floor( diff /     1000 %   60 ),
    //     m  : Math.floor( diff /    60000 %   60 ),
    //     h  : Math.floor( diff /  3600000 %   24 ),
    //     d  : Math.floor( diff / 86400000        ),
    //     mo  : Math.floor( diff / 2629746000     ),
    //     y  : Math.floor( diff / 31536000000     ),
    //     negative: isNegative
    // }

    date1 = luxon.DateTime.fromJSDate(date1);
    date2 = luxon.DateTime.fromJSDate(date2);

    const diff = date2.diff(date1, ['years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds']);
    const duration = luxon.Duration.fromObject(diff.toObject());
    return duration.toObject();
}

/**
 * Function to calculate the difference between two date objects.
 * 
 * @param {Date} date_obj The date object to begin with.
 * This function will calculate the difference between the passed date object and the current time.
 * @param {String} usage This is a parameter that defines how the function will classify 'old' versus 'new'.
 * The two options are 'radar_message' and 'radar_plot', which adjust the age range to better fit the situation.
 * @returns {Object} An object with two paramaters:
 * 'formatted' - a string with the formatted date difference, e.g. '4m 16s'
 * 'class' - a string that contains the class you would apply to an HTML element to give it the appropriate color for its age.
 */
function get_date_diff(date_obj, usage) {
    const date_diff = get_date_diff_obj(date_obj, new Date());
    const duration = luxon.Duration.fromObject(date_diff);
    const duration_minutes = duration.shiftTo('minutes').toObject().minutes;

    var formatted_date_diff;
    var age_class;
    if (duration.as('seconds') >= 1) { formatted_date_diff = `${date_diff.seconds}s`; }
    if (duration.as('minutes') >= 1) { formatted_date_diff = `${date_diff.minutes}m ${date_diff.seconds}s`; }
    if (duration.as('hours') >= 1) { formatted_date_diff = `${date_diff.hours}h ${date_diff.minutes}m`; }
    if (duration.as('days') >= 1) { formatted_date_diff = `${date_diff.days}d ${date_diff.hours}h`; }
    if (duration.as('months') >= 1) { formatted_date_diff = `${date_diff.months}mo ${date_diff.days}d`; }
    if (duration.as('years') >= 1) { formatted_date_diff = `${date_diff.years}y ${date_diff.months}mo`; }

    if (usage == 'radar_message') {
        // 0 days
        if (duration_minutes < 1440) { age_class = 'new-file'; }
    } else if (usage == 'radar_plot') {
        // less than 0 hours 10 minutes
        if (duration_minutes < 10) { age_class = 'new-file'; }
    }

    if (usage == 'radar_message') {
        // greater than or equal to 1 days but less than 3 days
        if (duration_minutes >= 1440 && duration_minutes < 4320) { age_class = 'recent-file'; }
    } else if (usage == 'radar_plot') {
        // greater than or equal to 0 hours 10 minutes
        if (duration_minutes >= 10) { age_class = 'recent-file'; }
    }

    if (usage == 'radar_message') {
        // greater than or equal to 3 days
        if (duration_minutes >= 4320) { age_class = 'old-file'; }
    } else if (usage == 'radar_plot') {
        // greater than or equal to 0 hours 30 minutes
        if (duration_minutes >= 30) { age_class = 'old-file'; }
    }

    return {
        'formatted': formatted_date_diff,
        'class': age_class
    }
}

module.exports = {
    get_date_diff,
    get_date_diff_obj
};