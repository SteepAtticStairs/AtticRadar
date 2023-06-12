// https://www.spc.noaa.gov/gis/
const urls = {
    convective: {
        categorical: {
            'day1': 'https://www.spc.noaa.gov/products/outlook/day1otlk_cat.nolyr.geojson',
            'day2': 'https://www.spc.noaa.gov/products/outlook/day2otlk_cat.nolyr.geojson',
            'day3': 'https://www.spc.noaa.gov/products/outlook/day3otlk_cat.nolyr.geojson',
        },

        probabalistic: {
            'day3': 'https://www.spc.noaa.gov/products/outlook/day3otlk_prob.nolyr.geojson',
            'day4': 'https://www.spc.noaa.gov/products/exper/day4-8/day4prob.nolyr.geojson',
            'day5': 'https://www.spc.noaa.gov/products/exper/day4-8/day5prob.nolyr.geojson',
            'day6': 'https://www.spc.noaa.gov/products/exper/day4-8/day6prob.nolyr.geojson',
            'day7': 'https://www.spc.noaa.gov/products/exper/day4-8/day7prob.nolyr.geojson',
            'day8': 'https://www.spc.noaa.gov/products/exper/day4-8/day8prob.nolyr.geojson',
        },
        significant_probabalistic: {
            'day3': 'https://www.spc.noaa.gov/products/outlook/day3otlk_sigprob.nolyr.geojson',
        },

        tornado: {
            'day1': 'https://www.spc.noaa.gov/products/outlook/day1otlk_torn.nolyr.geojson',
            'day2': 'https://www.spc.noaa.gov/products/outlook/day2otlk_torn.nolyr.geojson',
        },
        significant_tornado: {
            'day1': 'https://www.spc.noaa.gov/products/outlook/day1otlk_sigtorn.nolyr.geojson',
            'day2': 'https://www.spc.noaa.gov/products/outlook/day2otlk_sigtorn.nolyr.geojson',
        },

        wind: {
            'day1': 'https://www.spc.noaa.gov/products/outlook/day1otlk_wind.nolyr.geojson',
            'day2': 'https://www.spc.noaa.gov/products/outlook/day2otlk_wind.nolyr.geojson',
        },
        significant_wind: {
            'day1': 'https://www.spc.noaa.gov/products/outlook/day1otlk_sigwind.nolyr.geojson',
            'day2': 'https://www.spc.noaa.gov/products/outlook/day2otlk_sigwind.nolyr.geojson',
        },

        hail: {
            'day1': 'https://www.spc.noaa.gov/products/outlook/day1otlk_hail.nolyr.geojson',
            'day2': 'https://www.spc.noaa.gov/products/outlook/day2otlk_hail.nolyr.geojson',
        },
        significant_hail: {
            'day1': 'https://www.spc.noaa.gov/products/outlook/day1otlk_sighail.nolyr.geojson',
            'day2': 'https://www.spc.noaa.gov/products/outlook/day2otlk_sighail.nolyr.geojson',
        }
    },
    fire: {
        dryt: {
            'day1': 'https://www.spc.noaa.gov/products/fire_wx/day1fw_dryt.nolyr.geojson',
            'day2': 'https://www.spc.noaa.gov/products/fire_wx/day2fw_dryt.nolyr.geojson'
        },
        windrh: {
            'day1': 'https://www.spc.noaa.gov/products/fire_wx/day1fw_windrh.nolyr.geojson',
            'day2': 'https://www.spc.noaa.gov/products/fire_wx/day2fw_windrh.nolyr.geojson'
        },

        dryt_categorical: {
            'day3': 'https://www.spc.noaa.gov/products/exper/fire_wx/day3fw_drytcat.nolyr.geojson',
            'day4': 'https://www.spc.noaa.gov/products/exper/fire_wx/day4fw_drytcat.nolyr.geojson',
            'day5': 'https://www.spc.noaa.gov/products/exper/fire_wx/day5fw_drytcat.nolyr.geojson',
            'day6': 'https://www.spc.noaa.gov/products/exper/fire_wx/day6fw_drytcat.nolyr.geojson',
            'day7': 'https://www.spc.noaa.gov/products/exper/fire_wx/day7fw_drytcat.nolyr.geojson',
            'day8': 'https://www.spc.noaa.gov/products/exper/fire_wx/day8fw_drytcat.nolyr.geojson',
        },
        dryt_probabalistic: {
            'day3': 'https://www.spc.noaa.gov/products/exper/fire_wx/day3fw_drytprob.nolyr.geojson',
            'day4': 'https://www.spc.noaa.gov/products/exper/fire_wx/day4fw_drytprob.nolyr.geojson',
            'day5': 'https://www.spc.noaa.gov/products/exper/fire_wx/day5fw_drytprob.nolyr.geojson',
            'day6': 'https://www.spc.noaa.gov/products/exper/fire_wx/day6fw_drytprob.nolyr.geojson',
            'day7': 'https://www.spc.noaa.gov/products/exper/fire_wx/day7fw_drytprob.nolyr.geojson',
            'day8': 'https://www.spc.noaa.gov/products/exper/fire_wx/day8fw_drytprob.nolyr.geojson',
        },

        windrh_categorical: {
            'day3': 'https://www.spc.noaa.gov/products/exper/fire_wx/day3fw_windrhcat.nolyr.geojson',
            'day4': 'https://www.spc.noaa.gov/products/exper/fire_wx/day4fw_windrhcat.nolyr.geojson',
            'day5': 'https://www.spc.noaa.gov/products/exper/fire_wx/day5fw_windrhcat.nolyr.geojson',
            'day6': 'https://www.spc.noaa.gov/products/exper/fire_wx/day6fw_windrhcat.nolyr.geojson',
            'day7': 'https://www.spc.noaa.gov/products/exper/fire_wx/day7fw_windrhcat.nolyr.geojson',
            'day8': 'https://www.spc.noaa.gov/products/exper/fire_wx/day8fw_windrhcat.nolyr.geojson',
        },
        windrh_probabalistic: {
            'day3': 'https://www.spc.noaa.gov/products/exper/fire_wx/day3fw_windrhprob.nolyr.geojson',
            'day4': 'https://www.spc.noaa.gov/products/exper/fire_wx/day4fw_windrhprob.nolyr.geojson',
            'day5': 'https://www.spc.noaa.gov/products/exper/fire_wx/day5fw_windrhprob.nolyr.geojson',
            'day6': 'https://www.spc.noaa.gov/products/exper/fire_wx/day6fw_windrhprob.nolyr.geojson',
            'day7': 'https://www.spc.noaa.gov/products/exper/fire_wx/day7fw_windrhprob.nolyr.geojson',
            'day8': 'https://www.spc.noaa.gov/products/exper/fire_wx/day8fw_windrhprob.nolyr.geojson',
        },
    },

    // day1: {
    //     convective: {
    //         categorical: 'https://www.spc.noaa.gov/products/outlook/day1otlk_cat.nolyr.geojson',
    //         tornado: 'https://www.spc.noaa.gov/products/outlook/day1otlk_torn.nolyr.geojson',
    //         significant_tornado: 'https://www.spc.noaa.gov/products/outlook/day1otlk_sigtorn.nolyr.geojson',
    //         wind: 'https://www.spc.noaa.gov/products/outlook/day1otlk_wind.nolyr.geojson',
    //         significant_wind: 'https://www.spc.noaa.gov/products/outlook/day1otlk_sigwind.nolyr.geojson',
    //         hail: 'https://www.spc.noaa.gov/products/outlook/day1otlk_hail.nolyr.geojson',
    //         significant_hail: 'https://www.spc.noaa.gov/products/outlook/day1otlk_sighail.nolyr.geojson',
    //     },
    //     fire: {
    //         dryt: 'https://www.spc.noaa.gov/products/fire_wx/day1fw_dryt.nolyr.geojson',
    //         windrh: 'https://www.spc.noaa.gov/products/fire_wx/day1fw_windrh.nolyr.geojson',
    //     }
    // },
    // day2: {
    //     convective: {
    //         categorical: 'https://www.spc.noaa.gov/products/outlook/day2otlk_cat.nolyr.geojson',
    //         tornado: 'https://www.spc.noaa.gov/products/outlook/day2otlk_torn.nolyr.geojson',
    //         significant_tornado: 'https://www.spc.noaa.gov/products/outlook/day2otlk_sigtorn.nolyr.geojson',
    //         wind: 'https://www.spc.noaa.gov/products/outlook/day2otlk_wind.nolyr.geojson',
    //         significant_wind: 'https://www.spc.noaa.gov/products/outlook/day2otlk_sigwind.nolyr.geojson',
    //         hail: 'https://www.spc.noaa.gov/products/outlook/day2otlk_hail.nolyr.geojson',
    //         significant_hail: 'https://www.spc.noaa.gov/products/outlook/day2otlk_sighail.nolyr.geojson',
    //     },
    //     fire: {
    //         dryt: 'https://www.spc.noaa.gov/products/fire_wx/day2fw_dryt.nolyr.geojson',
    //         windrh: 'https://www.spc.noaa.gov/products/fire_wx/day2fw_windrh.nolyr.geojson',
    //     }
    // },
    // day3: {
    //     convective: {
    //         categorical: 'https://www.spc.noaa.gov/products/outlook/day3otlk_cat.nolyr.geojson',
    //         probabalistic: 'https://www.spc.noaa.gov/products/outlook/day3otlk_prob.nolyr.geojson',
    //         significant_probabalistic: 'https://www.spc.noaa.gov/products/outlook/day3otlk_sigprob.nolyr.geojson',
    //     },
    //     fire: {
    //         dryt_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day3fw_drytcat.nolyr.geojson',
    //         dryt_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day3fw_drytprob.nolyr.geojson',
    //         windrh_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day3fw_windrhcat.nolyr.geojson',
    //         windrh_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day3fw_windrhprob.nolyr.geojson',
    //     }
    // },
    // day4: {
    //     convective: {
    //         probabalistic: 'https://www.spc.noaa.gov/products/exper/day4-8/day4prob.nolyr.geojson',
    //     },
    //     fire: {
    //         dryt_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day4fw_drytcat.nolyr.geojson',
    //         dryt_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day4fw_drytprob.nolyr.geojson',
    //         windrh_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day4fw_windrhcat.nolyr.geojson',
    //         windrh_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day4fw_windrhprob.nolyr.geojson',
    //     }
    // },
    // day5: {
    //     convective: {
    //         probabalistic: 'https://www.spc.noaa.gov/products/exper/day4-8/day5prob.nolyr.geojson',
    //     },
    //     fire: {
    //         dryt_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day5fw_drytcat.nolyr.geojson',
    //         dryt_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day5fw_drytprob.nolyr.geojson',
    //         windrh_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day5fw_windrhcat.nolyr.geojson',
    //         windrh_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day5fw_windrhprob.nolyr.geojson',
    //     }
    // },
    // day6: {
    //     convective: {
    //         probabalistic: 'https://www.spc.noaa.gov/products/exper/day4-8/day6prob.nolyr.geojson',
    //     },
    //     fire: {
    //         dryt_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day6fw_drytcat.nolyr.geojson',
    //         dryt_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day6fw_drytprob.nolyr.geojson',
    //         windrh_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day6fw_windrhcat.nolyr.geojson',
    //         windrh_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day6fw_windrhprob.nolyr.geojson',
    //     }
    // },
    // day7: {
    //     convective: {
    //         probabalistic: 'https://www.spc.noaa.gov/products/exper/day4-8/day7prob.nolyr.geojson',
    //     },
    //     fire: {
    //         dryt_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day7fw_drytcat.nolyr.geojson',
    //         dryt_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day7fw_drytprob.nolyr.geojson',
    //         windrh_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day7fw_windrhcat.nolyr.geojson',
    //         windrh_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day7fw_windrhprob.nolyr.geojson',
    //     }
    // },
    // day8: {
    //     convective: {
    //         probabalistic: 'https://www.spc.noaa.gov/products/exper/day4-8/day8prob.nolyr.geojson',
    //     },
    //     fire: {
    //         dryt_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day8fw_drytcat.nolyr.geojson',
    //         dryt_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day8fw_drytprob.nolyr.geojson',
    //         windrh_categorical: 'https://www.spc.noaa.gov/products/exper/fire_wx/day8fw_windrhcat.nolyr.geojson',
    //         windrh_probabalistic: 'https://www.spc.noaa.gov/products/exper/fire_wx/day8fw_windrhprob.nolyr.geojson',
    //     }
    // },
}

module.exports = urls;