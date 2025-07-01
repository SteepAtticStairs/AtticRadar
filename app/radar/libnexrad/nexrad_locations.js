function get_nexrad_location(station) {
    var loc = NEXRAD_LOCATIONS?.[station.toUpperCase()];
    if (loc == undefined) {
        return [0, 0, 0];
    }
    return [loc['lat'], loc['lon'], loc['elev']];
}

/**
 * Taken from https://api.weather.gov/radar/stations.
 * Elevation units are in meters.
 */
const NEXRAD_LOCATIONS = {
    'KBGM': {
        'lat': 42.1996899,
        'lon': -75.98472,
        'elev': 489.51,
        'type': 'WSR-88D',
        'name': 'Binghamton'
    },
    'KMVX': {
        'lat': 47.52805,
        'lon': -97.32499,
        'elev': 300.53,
        'type': 'WSR-88D',
        'name': 'Fargo'
    },
    'KHPX': {
        'lat': 36.73666,
        'lon': -87.2849899,
        'elev': 172,
        'type': 'WSR-88D',
        'name': 'Ft. Campbell'
    },
    'KRGX': {
        'lat': 39.75405,
        'lon': -119.46202,
        'elev': 2529.54,
        'type': 'WSR-88D',
        'name': 'Reno'
    },
    'KFSD': {
        'lat': 43.58777,
        'lon': -96.72888,
        'elev': 435.86,
        'type': 'WSR-88D',
        'name': 'Sioux Falls'
    },
    'TEWR': {
        'lat': 40.593,
        'lon': -74.27,
        'elev': 41.45278,
        'type': 'TDWR',
        'name': 'Newark'
    },
    'KCAE': {
        'lat': 33.9486,
        'lon': -81.11861,
        'elev': 70.41,
        'type': 'WSR-88D',
        'name': 'Columbia'
    },
    'TLVE': {
        'lat': 41.29,
        'lon': -82.008,
        'elev': 283.76878,
        'type': 'TDWR',
        'name': 'Cleveland'
    },
    'TMSP': {
        'lat': 44.871,
        'lon': -92.933,
        'elev': 341.68078,
        'type': 'TDWR',
        'name': 'Minneapolis'
    },
    'KMKX': {
        'lat': 42.96777,
        'lon': -88.55055,
        'elev': 292,
        'type': 'WSR-88D',
        'name': 'Milwaukee'
    },
    'KDIX': {
        'lat': 39.94694,
        'lon': -74.41072,
        'elev': 45.42,
        'type': 'WSR-88D',
        'name': 'Mt. Holly'
    },
    'PAKC': {
        'lat': 58.67944,
        'lon': -156.62942,
        'elev': 19.2,
        'type': 'WSR-88D',
        'name': 'King Salmon'
    },
    'PABC': {
        'lat': 60.79194,
        'lon': -161.87637,
        'elev': 49.07,
        'type': 'WSR-88D',
        'name': 'Bethel'
    },
    'KBOX': {
        'lat': 41.95577,
        'lon': -71.13686,
        'elev': 35.97,
        'type': 'WSR-88D',
        'name': 'Boston'
    },
    'KGRR': {
        'lat': 42.89388,
        'lon': -85.54488,
        'elev': 237.13,
        'type': 'WSR-88D',
        'name': 'Grand Rapids'
    },
    'KFTG': {
        'lat': 39.78663,
        'lon': -104.5458,
        'elev': 1675.49,
        'type': 'WSR-88D',
        'name': 'Denver'
    },
    'KLCH': {
        'lat': 30.1253,
        'lon': -93.21588,
        'elev': 17,
        'type': 'WSR-88D',
        'name': 'Lake Charles'
    },
    'KYUX': {
        'lat': 32.49527,
        'lon': -114.65668,
        'elev': 53.04,
        'type': 'WSR-88D',
        'name': 'Yuma'
    },
    'KSHV': {
        'lat': 32.45083,
        'lon': -93.84124,
        'elev': 83.21,
        'type': 'WSR-88D',
        'name': 'Shreveport'
    },
    'KSRX': {
        'lat': 35.29041,
        'lon': -94.36188,
        'elev': 200,
        'type': 'WSR-88D',
        'name': 'Ft. Smith'
    },
    'TJFK': {
        'lat': 40.589,
        'lon': -73.881,
        'elev': 34.13758,
        'type': 'TDWR',
        'name': 'New York City'
    },
    'TMCO': {
        'lat': 28.344,
        'lon': -81.3259999,
        'elev': 51.51118,
        'type': 'TDWR',
        'name': 'Orlando International'
    },
    'KICX': {
        'lat': 37.59104,
        'lon': -112.86221,
        'elev': 3244,
        'type': 'WSR-88D',
        'name': 'Cedar City'
    },
    'KMOB': {
        'lat': 30.67944,
        'lon': -88.23972,
        'elev': 63.4,
        'type': 'WSR-88D',
        'name': 'Mobile'
    },
    'KMRX': {
        'lat': 36.16833,
        'lon': -83.40194,
        'elev': 407.52,
        'type': 'WSR-88D',
        'name': 'Knoxville'
    },
    'KVBX': {
        'lat': 34.83855,
        'lon': -120.3979,
        'elev': 383,
        'type': 'WSR-88D',
        'name': 'Vandenberg AFB'
    },
    'KJGX': {
        'lat': 32.67499,
        'lon': -83.35111,
        'elev': 158.8,
        'type': 'WSR-88D',
        'name': 'Robins AFB'
    },
    'KIWA': {
        'lat': 33.28916,
        'lon': -111.66999,
        'elev': 415,
        'type': 'WSR-88D',
        'name': 'Phoenix'
    },
    'KLOT': {
        'lat': 41.6044399,
        'lon': -88.08444,
        'elev': 202.08,
        'type': 'WSR-88D',
        'name': 'Chicago'
    },
    'KPOE': {
        'lat': 31.15527,
        'lon': -92.97583,
        'elev': 124.36,
        'type': 'WSR-88D',
        'name': 'Ft. Polk'
    },
    'KEAX': {
        'lat': 38.81024,
        'lon': -94.26446,
        'elev': 303.28,
        'type': 'WSR-88D',
        'name': 'Kansas City'
    },
    'PAHG': {
        'lat': 60.72591,
        'lon': -151.35144,
        'elev': 73.76,
        'type': 'WSR-88D',
        'name': 'Kenai'
    },
    'TTUL': {
        'lat': 36.071,
        'lon': -95.827,
        'elev': 250.85038,
        'type': 'TDWR',
        'name': 'Tulsa'
    },
    'TJUA': {
        'lat': 18.1156599,
        'lon': -66.07817,
        'elev': 867,
        'type': 'WSR-88D',
        'name': 'San Juan'
    },
    'KDVN': {
        'lat': 41.61166,
        'lon': -90.58083,
        'elev': 229.82,
        'type': 'WSR-88D',
        'name': 'Quad Cities'
    },
    'KLVX': {
        'lat': 37.97527,
        'lon': -85.9438799,
        'elev': 219.15,
        'type': 'WSR-88D',
        'name': 'Louisville'
    },
    'KHNX': {
        'lat': 36.31416,
        'lon': -119.63213,
        'elev': 74.07,
        'type': 'WSR-88D',
        'name': 'San Joaquin Valley'
    },
    'KLWX': {
        'lat': 38.9761,
        'lon': -77.4875,
        'elev': 88.54,
        'type': 'WSR-88D',
        'name': 'Sterling'
    },
    'KGWX': {
        'lat': 33.89691,
        'lon': -88.32919,
        'elev': 155,
        'type': 'WSR-88D',
        'name': 'Columbus AFB'
    },
    'KDDC': {
        'lat': 37.76083,
        'lon': -99.96888,
        'elev': 789.43,
        'type': 'WSR-88D',
        'name': 'Dodge City'
    },
    'KDMX': {
        'lat': 41.7311,
        'lon': -93.7228499,
        'elev': 299.01,
        'type': 'WSR-88D',
        'name': 'Des Moines'
    },
    'PHKM': {
        'lat': 20.12527,
        'lon': -155.77776,
        'elev': 1174,
        'type': 'WSR-88D',
        'name': 'Kohala'
    },
    'KDLH': {
        'lat': 46.83694,
        'lon': -92.20971,
        'elev': 435.25,
        'type': 'WSR-88D',
        'name': 'Duluth'
    },
    'KEVX': {
        'lat': 30.56503,
        'lon': -85.92166,
        'elev': 42.67,
        'type': 'WSR-88D',
        'name': 'Eglin AFB'
    },
    'TORD': {
        'lat': 41.797,
        'lon': -87.858,
        'elev': 226.77118,
        'type': 'TDWR',
        'name': "Chicago O'Hare"
    },
    'KMAF': {
        'lat': 31.94346,
        'lon': -102.18924,
        'elev': 883,
        'type': 'WSR-88D',
        'name': 'Odessa'
    },
    'KVNX': {
        'lat': 36.74083,
        'lon': -98.12749,
        'elev': 368.81,
        'type': 'WSR-88D',
        'name': 'Vance AFB'
    },
    'KOTX': {
        'lat': 47.6805499,
        'lon': -117.62582,
        'elev': 726.64,
        'type': 'WSR-88D',
        'name': 'Spokane'
    },
    'KBBX': {
        'lat': 39.49611,
        'lon': -121.63165,
        'elev': 52.73,
        'type': 'WSR-88D',
        'name': 'Beale AFB'
    },
    'TADW': {
        'lat': 38.695,
        'lon': -76.845,
        'elev': 105.46078,
        'type': 'TDWR',
        'name': 'Andrews Air Force Base'
    },
    'TCLT': {
        'lat': 35.337,
        'lon': -80.885,
        'elev': 265.48078,
        'type': 'TDWR',
        'name': 'Charlotte'
    },
    'KGRK': {
        'lat': 30.72166,
        'lon': -97.3827699,
        'elev': 163.98,
        'type': 'WSR-88D',
        'name': 'Ft. Hood'
    },
    'TSTL': {
        'lat': 38.805,
        'lon': -90.489,
        'elev': 197.20558,
        'type': 'TDWR',
        'name': 'St. Louis'
    },
    'KEWX': {
        'lat': 29.70405,
        'lon': -98.0286,
        'elev': 204,
        'type': 'WSR-88D',
        'name': 'Austin-San Antonio'
    },
    'KRAX': {
        'lat': 35.66527,
        'lon': -78.49,
        'elev': 106.07,
        'type': 'WSR-88D',
        'name': 'Raleigh-Durham'
    },
    'KLNX': {
        'lat': 41.95794,
        'lon': -100.57621,
        'elev': 919,
        'type': 'WSR-88D',
        'name': 'North Platte'
    },
    'KLBB': {
        'lat': 33.65413,
        'lon': -101.81416,
        'elev': 1005,
        'type': 'WSR-88D',
        'name': 'Lubbock'
    },
    'TSJU': {
        'lat': 18.474,
        'lon': -66.179,
        'elev': 47.85358,
        'type': 'TDWR',
        'name': 'San Juan'
    },
    'HWPA2': {
        'lat': 59.65,
        'lon': -151.46,
        'elev': 7.6,
        'type': 'Profiler',
        'name': 'Homer'
    },
    'KPDT': {
        'lat': 45.69055,
        'lon': -118.8529,
        'elev': 461.77,
        'type': 'WSR-88D',
        'name': 'Pendleton'
    },
    'KGSP': {
        'lat': 34.8833,
        'lon': -82.21983,
        'elev': 291,
        'type': 'WSR-88D',
        'name': 'Greenville-Spartanburg'
    },
    'KEOX': {
        'lat': 31.46055,
        'lon': -85.45938,
        'elev': 144,
        'type': 'WSR-88D',
        'name': 'Ft. Rucker'
    },
    'KBIS': {
        'lat': 46.7708299,
        'lon': -100.76027,
        'elev': 505.36,
        'type': 'WSR-88D',
        'name': 'Bismarck'
    },
    'TDFW': {
        'lat': 33.065,
        'lon': -96.918,
        'elev': 178.30798,
        'type': 'TDWR',
        'name': 'Dallas/Ft. Worth'
    },
    'PAIH': {
        'lat': 59.46194,
        'lon': -146.3010899,
        'elev': 20.42,
        'type': 'WSR-88D',
        'name': 'Middleton Islands'
    },
    'KBYX': {
        'lat': 24.59694,
        'lon': -81.7033299,
        'elev': 2.44,
        'type': 'WSR-88D',
        'name': 'Key West'
    },
    'KJAX': {
        'lat': 30.48463,
        'lon': -81.7019,
        'elev': 19,
        'type': 'WSR-88D',
        'name': 'Jacksonville'
    },
    'KFDX': {
        'lat': 34.63416,
        'lon': -103.61888,
        'elev': 1417.32,
        'type': 'WSR-88D',
        'name': 'Cannon AFB'
    },
    'TSLC': {
        'lat': 40.967,
        'lon': -111.93,
        'elev': 1309.11598,
        'type': 'TDWR',
        'name': 'Salt Lake City'
    },
    'TPHX': {
        'lat': 33.421,
        'lon': -112.163,
        'elev': 331.92718,
        'type': 'TDWR',
        'name': 'Phoenix'
    },
    'KESX': {
        'lat': 35.70111,
        'lon': -114.89138,
        'elev': 1483.46,
        'type': 'WSR-88D',
        'name': 'Las Vegas'
    },
    'TCMH': {
        'lat': 40.006,
        'lon': -82.715,
        'elev': 349.91038,
        'type': 'TDWR',
        'name': 'Columbus'
    },
    'KDYX': {
        'lat': 32.53833,
        'lon': -99.25416,
        'elev': 462.38,
        'type': 'WSR-88D',
        'name': 'Dyess AFB'
    },
    'KTBW': {
        'lat': 27.70527,
        'lon': -82.40194,
        'elev': 12.5,
        'type': 'WSR-88D',
        'name': 'Tampa Bay'
    },
    'TMSY': {
        'lat': 30.022,
        'lon': -90.403,
        'elev': 30.17518,
        'type': 'TDWR',
        'name': 'New Orleans'
    },
    'KDFX': {
        'lat': 29.2725,
        'lon': -100.28027,
        'elev': 344.73,
        'type': 'WSR-88D',
        'name': 'Laughlin AFB'
    },
    'TBNA': {
        'lat': 35.9799999,
        'lon': -86.662,
        'elev': 249.02158,
        'type': 'TDWR',
        'name': 'Nashville'
    },
    'TMIA': {
        'lat': 25.758,
        'lon': -80.491,
        'elev': 38.09998,
        'type': 'TDWR',
        'name': 'Miami'
    },
    'TATL': {
        'lat': 33.647,
        'lon': -84.262,
        'elev': 327.65998,
        'type': 'TDWR',
        'name': 'Atlanta'
    },
    'KMUX': {
        'lat': 37.15522,
        'lon': -121.89843,
        'elev': 1057.35,
        'type': 'WSR-88D',
        'name': 'San Francisco'
    },
    'KBRO': {
        'lat': 25.91555,
        'lon': -97.4186,
        'elev': 7.01,
        'type': 'WSR-88D',
        'name': 'Brownsville'
    },
    'RKJK': {
        'lat': 35.9241699,
        'lon': 126.62222,
        'elev': 23.77,
        'type': 'WSR-88D',
        'name': 'Kunsan AB'
    },
    'KAKQ': {
        'lat': 36.98388,
        'lon': -77.0074999,
        'elev': 48,
        'type': 'WSR-88D',
        'name': 'Norfolk-Richmond'
    },
    'KBMX': {
        'lat': 33.17194,
        'lon': -86.76972,
        'elev': 196.6,
        'type': 'WSR-88D',
        'name': 'Birmingham'
    },
    'TPIT': {
        'lat': 40.501,
        'lon': -80.486,
        'elev': 422.45278,
        'type': 'TDWR',
        'name': 'Pittsburgh'
    },
    'TMDW': {
        'lat': 41.651,
        'lon': -87.73,
        'elev': 232.56238,
        'type': 'TDWR',
        'name': 'Chicago Midway'
    },
    'KABR': {
        'lat': 45.45583,
        'lon': -98.41305,
        'elev': 396.85,
        'type': 'WSR-88D',
        'name': 'Aberdeen'
    },
    'KSFX': {
        'lat': 43.10559,
        'lon': -112.68612,
        'elev': 1363.68,
        'type': 'WSR-88D',
        'name': 'Idaho Falls'
    },
    'KSOX': {
        'lat': 33.81773,
        'lon': -117.63599,
        'elev': 927,
        'type': 'WSR-88D',
        'name': 'Santa Ana Mountains'
    },
    'KTLH': {
        'lat': 30.39749,
        'lon': -84.32889,
        'elev': 19.2,
        'type': 'WSR-88D',
        'name': 'Tallahassee'
    },
    'KHGX': {
        'lat': 29.47194,
        'lon': -95.07888,
        'elev': 5.49,
        'type': 'WSR-88D',
        'name': 'Houston'
    },
    'KAMX': {
        'lat': 25.61055,
        'lon': -80.41305,
        'elev': 4.27,
        'type': 'WSR-88D',
        'name': 'Miami'
    },
    'KMTX': {
        'lat': 41.26277,
        'lon': -112.44777,
        'elev': 1975,
        'type': 'WSR-88D',
        'name': 'Salt Lake City'
    },
    'TDAY': {
        'lat': 40.022,
        'lon': -84.123,
        'elev': 310.59118,
        'type': 'TDWR',
        'name': 'Dayton'
    },
    'KEPZ': {
        'lat': 31.87305,
        'lon': -106.69799,
        'elev': 1250.9,
        'type': 'WSR-88D',
        'name': 'El Paso'
    },
    'KLZK': {
        'lat': 34.83638,
        'lon': -92.26194,
        'elev': 173.13,
        'type': 'WSR-88D',
        'name': 'Little Rock'
    },
    'KHTX': {
        'lat': 34.9305499,
        'lon': -86.0836099,
        'elev': 537.06,
        'type': 'WSR-88D',
        'name': 'Huntsville-Hytop'
    },
    'KEYX': {
        'lat': 35.09777,
        'lon': -117.56074,
        'elev': 846,
        'type': 'WSR-88D',
        'name': 'Edwards AFB'
    },
    'KSGF': {
        'lat': 37.23527,
        'lon': -93.40027,
        'elev': 389.53,
        'type': 'WSR-88D',
        'name': 'Springfield'
    },
    'KBLX': {
        'lat': 45.85377,
        'lon': -108.60679,
        'elev': 1109,
        'type': 'WSR-88D',
        'name': 'Billings'
    },
    'KPUX': {
        'lat': 38.45944,
        'lon': -104.18138,
        'elev': 1615,
        'type': 'WSR-88D',
        'name': 'Pueblo'
    },
    'KHDX': {
        'lat': 33.07699,
        'lon': -106.12002,
        'elev': 1286.87,
        'type': 'WSR-88D',
        'name': 'Holloman AFB'
    },
    'KINX': {
        'lat': 36.17499,
        'lon': -95.56413,
        'elev': 203.61,
        'type': 'WSR-88D',
        'name': 'Tulsa'
    },
    'KIWX': {
        'lat': 41.3586,
        'lon': -85.7,
        'elev': 292.3,
        'type': 'WSR-88D',
        'name': 'North Webster'
    },
    'KGGW': {
        'lat': 48.20635,
        'lon': -106.62468,
        'elev': 702,
        'type': 'WSR-88D',
        'name': 'Glasgow'
    },
    'KNQA': {
        'lat': 35.34472,
        'lon': -89.87333,
        'elev': 103,
        'type': 'WSR-88D',
        'name': 'Memphis'
    },
    'TDAL': {
        'lat': 32.926,
        'lon': -96.968,
        'elev': 189.58558,
        'type': 'TDWR',
        'name': 'Dallas Love Field'
    },
    'RODN': {
        'lat': 26.3019399,
        'lon': 127.90972,
        'elev': 91,
        'type': 'WSR-88D',
        'name': 'Kadena'
    },
    'TPBI': {
        'lat': 26.688,
        'lon': -80.273,
        'elev': 40.53838,
        'type': 'TDWR',
        'name': 'West Palm Beach'
    },
    'KCLX': {
        'lat': 32.65552,
        'lon': -81.04219,
        'elev': 35,
        'type': 'WSR-88D',
        'name': 'Charleston'
    },
    'KIND': {
        'lat': 39.70749,
        'lon': -86.28027,
        'elev': 240.79,
        'type': 'WSR-88D',
        'name': 'Indianapolis'
    },
    'TTPA': {
        'lat': 27.86,
        'lon': -82.518,
        'elev': 28.34638,
        'type': 'TDWR',
        'name': 'Tampa Bay'
    },
    'KOKX': {
        'lat': 40.8655199,
        'lon': -72.8639199,
        'elev': 25.91,
        'type': 'WSR-88D',
        'name': 'New York City'
    },
    'KGLD': {
        'lat': 39.36694,
        'lon': -101.70027,
        'elev': 1112.82,
        'type': 'WSR-88D',
        'name': 'Goodland'
    },
    'KVTX': {
        'lat': 34.41166,
        'lon': -119.1786,
        'elev': 830.88,
        'type': 'WSR-88D',
        'name': 'Los Angeles'
    },
    'KICT': {
        'lat': 37.65444,
        'lon': -97.44305,
        'elev': 406.91,
        'type': 'WSR-88D',
        'name': 'Wichita'
    },
    'TDEN': {
        'lat': 39.728,
        'lon': -104.526,
        'elev': 1737.66478,
        'type': 'TDWR',
        'name': 'Denver'
    },
    'TPHL': {
        'lat': 39.949,
        'lon': -75.069,
        'elev': 46.63438,
        'type': 'TDWR',
        'name': 'Philadelphia'
    },
    'ROCO2': {
        'lat': 35.2299999,
        'lon': -97.45,
        'elev': 363.3,
        'type': 'Profiler',
        'name': 'Norman'
    },
    'TCVG': {
        'lat': 38.898,
        'lon': -84.58,
        'elev': 320.95438,
        'type': 'TDWR',
        'name': 'Covington'
    },
    'KDOX': {
        'lat': 38.82555,
        'lon': -75.44,
        'elev': 15.24,
        'type': 'WSR-88D',
        'name': 'Dover AFB'
    },
    'TBWI': {
        'lat': 39.09,
        'lon': -76.63,
        'elev': 90.52558,
        'type': 'TDWR',
        'name': 'Baltimore/Wash'
    },
    'KRIW': {
        'lat': 43.0661,
        'lon': -108.47729,
        'elev': 1697.13,
        'type': 'WSR-88D',
        'name': 'Riverton'
    },
    'KVAX': {
        'lat': 30.89027,
        'lon': -83.0018,
        'elev': 66,
        'type': 'WSR-88D',
        'name': 'Moody AFB'
    },
    'KABX': {
        'lat': 35.14972,
        'lon': -106.82388,
        'elev': 1789.18,
        'type': 'WSR-88D',
        'name': 'Albuquerque'
    },
    'KNKX': {
        'lat': 32.91888,
        'lon': -117.04193,
        'elev': 291.08,
        'type': 'WSR-88D',
        'name': 'San Diego'
    },
    'PACG': {
        'lat': 56.85277,
        'lon': -135.5291499,
        'elev': 63.09,
        'type': 'WSR-88D',
        'name': 'Biorka Island'
    },
    'KMSX': {
        'lat': 47.0411,
        'lon': -113.9861,
        'elev': 2417,
        'type': 'WSR-88D',
        'name': 'Missoula'
    },
    'KGRB': {
        'lat': 44.49862,
        'lon': -88.1110999,
        'elev': 216,
        'type': 'WSR-88D',
        'name': 'Green Bay'
    },
    'KATX': {
        'lat': 48.19461,
        'lon': -122.49568,
        'elev': 161,
        'type': 'WSR-88D',
        'name': 'Seattle-Tacoma'
    },
    'TSDF': {
        'lat': 38.046,
        'lon': -85.61,
        'elev': 222.80878,
        'type': 'TDWR',
        'name': 'Louisville'
    },
    'KCRP': {
        'lat': 27.78388,
        'lon': -97.51083,
        'elev': 13.72,
        'type': 'WSR-88D',
        'name': 'Corpus Christi'
    },
    'TLAS': {
        'lat': 36.144,
        'lon': -115.007,
        'elev': 627.27838,
        'type': 'TDWR',
        'name': 'Las Vegas'
    },
    'TFLL': {
        'lat': 26.143,
        'lon': -80.344,
        'elev': 36.57598,
        'type': 'TDWR',
        'name': 'Fort Lauderdale'
    },
    'TIAD': {
        'lat': 39.084,
        'lon': -77.529,
        'elev': 144.17038,
        'type': 'TDWR',
        'name': 'Dulles'
    },
    'KSJT': {
        'lat': 31.37111,
        'lon': -100.49221,
        'elev': 576.07,
        'type': 'WSR-88D',
        'name': 'San Angelo'
    },
    'TDTW': {
        'lat': 42.111,
        'lon': -83.515,
        'elev': 235.30558,
        'type': 'TDWR',
        'name': 'Detroit'
    },
    'KPBZ': {
        'lat': 40.53166,
        'lon': -80.21794,
        'elev': 361.19,
        'type': 'WSR-88D',
        'name': 'Pittsburgh'
    },
    'TMEM': {
        'lat': 34.896,
        'lon': -89.993,
        'elev': 147.21838,
        'type': 'TDWR',
        'name': 'Memphis'
    },
    'KPAH': {
        'lat': 37.06833,
        'lon': -88.77194,
        'elev': 119.48,
        'type': 'WSR-88D',
        'name': 'Paducah'
    },
    'KLIX': {
        'lat': 30.33666,
        'lon': -89.82541,
        'elev': 20,
        'type': 'WSR-88D',
        'name': 'New Orleans'
    },
    'KRTX': {
        'lat': 45.71499,
        'lon': -122.96499,
        'elev': 492,
        'type': 'WSR-88D',
        'name': 'Portland'
    },
    'TMCI': {
        'lat': 39.498,
        'lon': -94.742,
        'elev': 332.23198,
        'type': 'TDWR',
        'name': 'Kansas City'
    },
    'KFCX': {
        'lat': 37.02416,
        'lon': -80.27416,
        'elev': 874.17,
        'type': 'WSR-88D',
        'name': 'Roanoke'
    },
    'KARX': {
        'lat': 43.82277,
        'lon': -91.1911,
        'elev': 388.92,
        'type': 'WSR-88D',
        'name': 'LaCrosse'
    },
    'KJKL': {
        'lat': 37.5908299,
        'lon': -83.31305,
        'elev': 415.75,
        'type': 'WSR-88D',
        'name': 'Jackson'
    },
    'KGYX': {
        'lat': 43.8913,
        'lon': -70.25636,
        'elev': 124.66,
        'type': 'WSR-88D',
        'name': 'Portland'
    },
    'KAMA': {
        'lat': 35.23333,
        'lon': -101.70927,
        'elev': 1104,
        'type': 'WSR-88D',
        'name': 'Amarillo'
    },
    'KFSX': {
        'lat': 34.57433,
        'lon': -111.19843,
        'elev': 2260.7,
        'type': 'WSR-88D',
        'name': 'Flagstaff'
    },
    'KMPX': {
        'lat': 44.84888,
        'lon': -93.56552,
        'elev': 301,
        'type': 'WSR-88D',
        'name': 'Minneapolis-St. Paul'
    },
    'TIAH': {
        'lat': 30.065,
        'lon': -95.5669999,
        'elev': 77.11438,
        'type': 'TDWR',
        'name': 'Houston Intercontinental'
    },
    'TICH': {
        'lat': 37.507,
        'lon': -97.437,
        'elev': 411.78478,
        'type': 'TDWR',
        'name': 'Wichita'
    },
    'KCXX': {
        'lat': 44.5111,
        'lon': -73.16639,
        'elev': 96.62,
        'type': 'WSR-88D',
        'name': 'Burlington'
    },
    'KDGX': {
        'lat': 32.27999,
        'lon': -89.98444,
        'elev': 150.92,
        'type': 'WSR-88D',
        'name': 'Jackson'
    },
    'KLSX': {
        'lat': 38.69888,
        'lon': -90.68277,
        'elev': 185.32,
        'type': 'WSR-88D',
        'name': 'St. Louis'
    },
    'KGJX': {
        'lat': 39.06222,
        'lon': -108.21375,
        'elev': 3059,
        'type': 'WSR-88D',
        'name': 'Grand Junction'
    },
    'KOAX': {
        'lat': 41.32027,
        'lon': -96.3668,
        'elev': 349.91,
        'type': 'WSR-88D',
        'name': 'Omaha'
    },
    'PHMO': {
        'lat': 21.13277,
        'lon': -157.18026,
        'elev': 415.44,
        'type': 'WSR-88D',
        'name': 'Molokai'
    },
    'KMXX': {
        'lat': 32.53664,
        'lon': -85.78975,
        'elev': 136,
        'type': 'WSR-88D',
        'name': 'Montgomery-Maxwell AFB'
    },
    'KCBX': {
        'lat': 43.49021,
        'lon': -116.23602,
        'elev': 942,
        'type': 'WSR-88D',
        'name': 'Boise'
    },
    'KRLX': {
        'lat': 38.3111,
        'lon': -81.72277,
        'elev': 335,
        'type': 'WSR-88D',
        'name': 'Charleston'
    },
    'TIDS': {
        'lat': 39.637,
        'lon': -86.436,
        'elev': 258.16558,
        'type': 'TDWR',
        'name': 'Indianapolis'
    },
    'KLTX': {
        'lat': 33.98916,
        'lon': -78.42916,
        'elev': 19.51,
        'type': 'WSR-88D',
        'name': 'Wilmington'
    },
    'KILX': {
        'lat': 40.15049,
        'lon': -89.3367899,
        'elev': 188,
        'type': 'WSR-88D',
        'name': 'Lincoln'
    },
    'KDTX': {
        'lat': 42.69999,
        'lon': -83.47166,
        'elev': 336,
        'type': 'WSR-88D',
        'name': 'Detroit'
    },
    'KLRX': {
        'lat': 40.73972,
        'lon': -116.80277,
        'elev': 2067,
        'type': 'WSR-88D',
        'name': 'Elko'
    },
    'TDCA': {
        'lat': 38.759,
        'lon': -76.962,
        'elev': 105.15598,
        'type': 'TDWR',
        'name': 'Washington National'
    },
    'KENX': {
        'lat': 42.58655,
        'lon': -74.06408,
        'elev': 565,
        'type': 'WSR-88D',
        'name': 'Albany'
    },
    'RKSG': {
        'lat': 37.2075699,
        'lon': 127.28556,
        'elev': 439,
        'type': 'WSR-88D',
        'name': 'Camp Humphreys'
    },
    'TMKE': {
        'lat': 42.819,
        'lon': -88.046,
        'elev': 284.37838,
        'type': 'TDWR',
        'name': 'Milwaukee'
    },
    'KOHX': {
        'lat': 36.24722,
        'lon': -86.5625,
        'elev': 176.48,
        'type': 'WSR-88D',
        'name': 'Nashville'
    },
    'KMAX': {
        'lat': 42.08111,
        'lon': -122.71735,
        'elev': 2289.96,
        'type': 'WSR-88D',
        'name': 'Medford'
    },
    'KFDR': {
        'lat': 34.36219,
        'lon': -98.97666,
        'elev': 386.18,
        'type': 'WSR-88D',
        'name': 'Frederick'
    },
    'KMQT': {
        'lat': 46.5311,
        'lon': -87.54833,
        'elev': 430.07,
        'type': 'WSR-88D',
        'name': 'Marquette'
    },
    'KCBW': {
        'lat': 46.03916,
        'lon': -67.80642,
        'elev': 227.38,
        'type': 'WSR-88D',
        'name': 'Hodgdon'
    },
    'KBUF': {
        'lat': 42.9486,
        'lon': -78.73694,
        'elev': 211.23,
        'type': 'WSR-88D',
        'name': 'Buffalo'
    },
    'KTFX': {
        'lat': 47.45972,
        'lon': -111.38527,
        'elev': 1140,
        'type': 'WSR-88D',
        'name': 'Great Falls'
    },
    'THOU': {
        'lat': 29.516,
        'lon': -95.242,
        'elev': 35.66158,
        'type': 'TDWR',
        'name': 'Houston Hobby'
    },
    'KDAX': {
        'lat': 38.50111,
        'lon': -121.67782,
        'elev': 9.14,
        'type': 'WSR-88D',
        'name': 'Sacramento'
    },
    'KTLX': {
        'lat': 35.33305,
        'lon': -97.27775,
        'elev': 369.72,
        'type': 'WSR-88D',
        'name': 'Oklahoma City'
    },
    'KTWX': {
        'lat': 38.99694,
        'lon': -96.23249,
        'elev': 416.66,
        'type': 'WSR-88D',
        'name': 'Topeka'
    },
    'PAEC': {
        'lat': 64.51139,
        'lon': -165.29498,
        'elev': 17.68,
        'type': 'WSR-88D',
        'name': 'Nome'
    },
    'TOKC': {
        'lat': 35.276,
        'lon': -97.51,
        'elev': 398.67838,
        'type': 'TDWR',
        'name': 'Oklahoma City'
    },
    'KEMX': {
        'lat': 31.89361,
        'lon': -110.63027,
        'elev': 1586.48,
        'type': 'WSR-88D',
        'name': 'Tucson'
    },
    'PHWA': {
        'lat': 19.095,
        'lon': -155.56887,
        'elev': 420.62,
        'type': 'WSR-88D',
        'name': 'South Hawaii'
    },
    'KFWS': {
        'lat': 32.57277,
        'lon': -97.30313,
        'elev': 212,
        'type': 'WSR-88D',
        'name': 'Dallas-Ft. Worth'
    },
    'TBOS': {
        'lat': 42.158,
        'lon': -70.933,
        'elev': 80.46718,
        'type': 'TDWR',
        'name': 'Boston'
    },
    'KUDX': {
        'lat': 44.12471,
        'lon': -102.82999,
        'elev': 939,
        'type': 'WSR-88D',
        'name': 'Rapid City'
    },
    'PHKI': {
        'lat': 21.89389,
        'lon': -159.55249,
        'elev': 69,
        'type': 'WSR-88D',
        'name': 'South Kauai'
    },
    'TRDU': {
        'lat': 36.002,
        'lon': -78.697,
        'elev': 156.97198,
        'type': 'TDWR',
        'name': 'Raleigh Durham'
    },
    'KMLB': {
        'lat': 28.11305,
        'lon': -80.6544399,
        'elev': 10.67,
        'type': 'WSR-88D',
        'name': 'Melbourne'
    },
    'KCYS': {
        'lat': 41.15194,
        'lon': -104.8061,
        'elev': 1867.81,
        'type': 'WSR-88D',
        'name': 'Cheyenne'
    },
    'KFFC': {
        'lat': 33.36333,
        'lon': -84.56583,
        'elev': 261.52,
        'type': 'WSR-88D',
        'name': 'Atlanta'
    },
    'AWPA2': {
        'lat': 61.15,
        'lon': -149.78,
        'elev': 97,
        'type': 'Profiler',
        'name': 'Anchorage'
    },
    'KVWX': {
        'lat': 38.26024,
        'lon': -87.72452,
        'elev': 155.75,
        'type': 'WSR-88D',
        'name': 'Evansville'
    },
    'KAPX': {
        'lat': 44.90634,
        'lon': -84.71953,
        'elev': 446.23,
        'type': 'WSR-88D',
        'name': 'Gaylord'
    },
    'KCCX': {
        'lat': 40.92305,
        'lon': -78.00389,
        'elev': 733.04,
        'type': 'WSR-88D',
        'name': 'State College'
    },
    'KBHX': {
        'lat': 40.49833,
        'lon': -124.29215,
        'elev': 732.13,
        'type': 'WSR-88D',
        'name': 'Eureka'
    },
    'KILN': {
        'lat': 39.42027,
        'lon': -83.82166,
        'elev': 321.87,
        'type': 'WSR-88D',
        'name': 'Wilmington'
    },
    'PGUA': {
        'lat': 13.45583,
        'lon': 144.81112,
        'elev': 83,
        'type': 'WSR-88D',
        'name': 'Anderson AFB'
    },
    'KCLE': {
        'lat': 41.41305,
        'lon': -81.86,
        'elev': 232.56,
        'type': 'WSR-88D',
        'name': 'Cleveland'
    },
    'KUEX': {
        'lat': 40.32083,
        'lon': -98.44194,
        'elev': 602.28,
        'type': 'WSR-88D',
        'name': 'Grand Island'
    },
    'PAPD': {
        'lat': 65.03511,
        'lon': -147.5014,
        'elev': 790.35,
        'type': 'WSR-88D',
        'name': 'Pedro Dome'
    },
    'TLKA2': {
        'lat': 62.31,
        'lon': -150.4199999,
        'elev': 151,
        'type': 'Profiler',
        'name': 'Talkeetna'
    },
    'KMHX': {
        'lat': 34.77583,
        'lon': -76.87639,
        'elev': 9.45,
        'type': 'WSR-88D',
        'name': 'Morehead City'
    },
    'KMBX': {
        'lat': 48.39249,
        'lon': -100.86443,
        'elev': 455.07,
        'type': 'WSR-88D',
        'name': 'Minot AFB'
    },
    'KTYX': {
        'lat': 43.75582,
        'lon': -75.68,
        'elev': 562.66,
        'type': 'WSR-88D',
        'name': 'Montague'
    },
    'KLGX': {
        'lat': 47.11689,
        'lon': -124.10663,
        'elev': 76.8,
        'type': 'WSR-88D',
        'name': 'Langley Hill'
    },

    'KULM': {
        'NONSTANDARD': true,
        'lat': 32.52944,
        'lon': -92.01222,
        'elev': 43,
        'type': 'N/A', // Polarimetric S-band Doppler
        'name': 'Monroe / ULM'
    },
    'WILU': {
        'NONSTANDARD': true,
        'lat': 40.46551,
        'lon': -90.68594,
        'elev': 212,
        'type': 'N/A',
        'name': 'Western Illinois University'
    },
    'FWLX': {
        'NONSTANDARD': true,
        'lat': 35.25498,
        'lon': -87.32543,
        'elev': 303,
        'type': 'N/A',
        'name': 'WLX X-Band'
    },
    'KHDC': {
        'lat': 30.51959991455078,
        'lon': -90.40740203857422,
        'elev': 47,
        'type': 'WSR-88D',
        'name': 'Hammond'
    },
}

module.exports = {
    get_nexrad_location,
    NEXRAD_LOCATIONS
};