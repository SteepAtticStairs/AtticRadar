const range_folded = 'rgb(139, 0, 218)';
const range_folded_val = 999;

const reflectivity = {
    colors: [
        'rgb(116, 78, 173)',
        'rgb(147, 141, 117)',

        'rgb(150, 145, 83)',
        'rgb(210, 212, 180)',

        'rgb(204, 207, 180)',
        'rgb(65, 91, 158)',

        'rgb(67, 97, 162)',
        'rgb(106, 208, 225)',

        'rgb(111, 214, 232)',
        'rgb(53, 213, 91)',

        'rgb(17, 213, 24)',
        'rgb(9, 94, 9)',

        'rgb(29, 104, 9)',
        'rgb(234, 210, 4)',

        'rgb(255, 226, 0)',
        'rgb(255, 128, 0)',

        'rgb(255, 0, 0)',
        'rgb(113, 0, 0)',

        'rgb(255, 255, 255)',
        'rgb(255, 146, 255)',

        'rgb(255, 117, 255)',
        'rgb(225, 11, 227)',

        'rgb(178, 0, 255)',
        'rgb(99, 0, 214)',

        'rgb(5, 236, 240)',
        'rgb(1, 32, 32)',

        'rgb(1, 32, 32)',
        'rgb(1, 32, 32)'
    ],
    values: [
        -30, -20,
        -20, -10,
        -10, 10,
        10, 18,
        18, 22,
        22, 35,
        35, 40,
        40, 50,
        50, 60,
        60, 65,
        65, 70,
        70, 75,
        75, 85,
        85,
        95
    ]
}
const velocity = {
    // Product:bv
    // units: KTS
    // step: 5
    // scale: 1.9426

    // color: 0 137 117 122 130 51 59 
    // color: 10 109 0 0 242 0 7
    // color: 40 249 51 76 255 149 207
    // color: 55 253 160 201 255 232 172
    // color: 60 253 228 160 253 149 83 
    // color: 80 254 142 80 110 14 9
    // color: 120 110 14 9

    // color: -10 78 121 76 116 131 112
    // color: -40 3 234 2  0 100 0
    // color: -50 181 237 239 2 241 3
    // color: -70 47 222 226 181 237 239 
    // color: -80 30 111 188 40 204 220
    // color: -90  24 39 165 30 111 188
    // color: -100 110 3 151 22 13 156
    // color: -120 252 0 130 109 2 150 
    // RF: 139 0 218

    // 'rgb(000, 000, 000)',
    range_folded: true,
    colors: [
        'rgb(252, 0, 130)', // -120
        'rgb(109, 2, 150)', // -100
        'rgb(110, 3, 151)', // -100
        'rgb(22, 13, 156)', // -90
        'rgb(24, 39, 165)', // -90
        'rgb(30, 111, 188)', // -80
        'rgb(30, 111, 188)', // -80
        'rgb(40, 204, 220)', // -70
        'rgb(47, 222, 226)', // -70
        'rgb(181, 237, 239)', // -50
        'rgb(181, 237, 239)', // -50
        'rgb(2, 241, 3)', // -40
        'rgb(3, 234, 2)', // -40

        'rgb(0, 100, 0)', // -10
        'rgb(78, 121, 76)', // -10
        'rgb(116, 131, 112)', // 0
        'rgb(137, 117, 122)', // 0
        'rgb(130, 51, 59)', // 10
        'rgb(109, 0, 0)', // 10

        'rgb(242, 0, 7)', // 40
        'rgb(249, 51, 76)', // 40
        'rgb(255, 149, 207)', // 55
        'rgb(253, 160, 201)', // 55
        'rgb(255, 232, 172)', // 60
        'rgb(253, 228, 160)', // 60
        'rgb(253, 149, 83)', // 80
        'rgb(254, 142, 80)', // 80
        'rgb(110, 14, 9)', // 120
        'rgb(110, 14, 9)', // 120
    ],
    values: [
        -120, -100,
        -100, -90,
        -90, -80,
        -80, -70,
        -70, -50,
        -50, -40,
        -40, -10,
        -10, 0,
        0, 10,
        10, 40,
        40, 55,
        55, 60,
        60, 80,
        80, 120,
        120
    ],
    balance: {
        colors: [
            'rgb(24, 28, 67)', // -120
            'rgb(41, 56, 136)', // -100
            'rgb(12, 94, 190)', // -80
            'rgb(56, 136, 186)', // -60
            'rgb(117, 170, 190)', // -40
            'rgb(182, 201, 207)', // -20
            'rgb(241, 236, 235)', // 0
            'rgb(223, 187, 176)', // 20
            'rgb(208, 139, 115)', // 40
            'rgb(191, 87, 58)', // 60
            'rgb(165, 33, 37)', // 80
            'rgb(115, 14, 39)', // 100
            'rgb(60, 9, 18)' // 120
        ],
        values: [
            -120, -100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100, 120
        ],
    },
}
const diff_reflectivity = {
    colors: [
        'rgb(0, 0, 0)',
        'rgb(55, 55, 55)',
        'rgb(110, 110, 110)',
        'rgb(165, 165, 165)',
        'rgb(220, 220, 220)',
        'rgb(142, 121, 181)',
        'rgb(10, 10, 155)',
        'rgb(68, 248, 212)',
        'rgb(90, 221, 98)',
        'rgb(255, 255, 100)',
        'rgb(220, 10, 5)',
        'rgb(175, 0, 0)',
        'rgb(240, 120, 180)',
        'rgb(255, 255, 255)',
        'rgb(145, 45, 150)'
    ],
    values: [
        -8, -6, -4, -2, 0, 0, 0.25, 1, 1.5, 2, 3, 4, 5, 6, 8
    ],
}
const corr_coeff = {
    colors: [
        '#000000', '#949494', '#7593FF', '#0045BD', '#ADF4FF', '#00FA32', '#FFD53D', '#F01000', '#C20047', '#FFB8D8', '#FFEBF2'
    ],
    values: [
        0.2, 0.4, 0.55, 0.65, 0.8, 0.85, 0.95, 0.975, 1, 1.04, 1.05
    ],
}
const spectrum_width = {
    colors: [
        '#242424',
        '#afafaf',
        '#ff700a',
        '#b30000',
        '#f000ac',
        '#8800c2',
        '#e0fcff',
        '#b4eb00',
        '#7dd100',
    ],
    values: [
        0, 5, 8, 10, 13, 15.5, 18, 20.5, 31 // m/s
        // yes, those are strange values. here are the originals in knots:
        // 0, 10, 15, 20, 25, 30, 35, 40, 60
    ],
}
const hydrometer_class = {
    colors: [
        'rgb(156, 156, 156)',
        'rgb(156, 156, 156)',

        'rgb(118, 118, 118)',
        'rgb(118, 118, 118)',

        'rgb(243, 179, 178)',
        'rgb(243, 179, 178)',

        'rgb(117, 250, 243)',
        'rgb(117, 250, 243)',

        'rgb(63, 141, 247)',
        'rgb(63, 141, 247)',

        'rgb(115, 247, 154)',
        'rgb(115, 247, 154)',

        'rgb(84, 184, 54)',
        'rgb(84, 184, 54)',

        'rgb(208, 207, 112)',
        'rgb(208, 207, 112)',

        'rgb(199, 135, 134)',
        'rgb(199, 135, 134)',

        'rgb(234, 51, 36)',
        'rgb(234, 51, 36)',

        'rgb(147, 37, 30)',
        'rgb(147, 37, 30)',

        'rgb(255, 254, 84)',
        'rgb(255, 254, 84)',

        'rgb(0, 0, 0)',
        'rgb(0, 0, 0)',

        'rgb(212, 45, 246)',
        'rgb(212, 45, 246)',

        'rgb(109, 18, 121)',
        'rgb(109, 18, 121)'
    ],
    values: [
        10, 20,
        20, 30,
        30, 40,
        40, 50,
        50, 60,
        60, 70,
        70, 80,
        80, 90,
        90, 100,
        100, 110,
        110, 120,
        120, 130,
        130, 140,
        140, 150,
        150, 160
    ],
}

/**
 * This is the main object that contains
 * the colormaps for all products.
 */
const productColors = {
    range_folded: range_folded,
    range_folded_val: range_folded_val,

    DVL: {
        colors: [
            'rgb(132, 132, 132)',
            'rgb(8, 183, 183)',
            'rgb(19, 14, 146)',

            'rgb(4, 204, 27)',
            'rgb(4, 100, 4)',

            'rgb(204, 193, 2)',
            'rgb(183, 107, 0)',

            'rgb(230, 31, 5)',
            'rgb(133, 14, 52)',

            'rgb(168, 0, 101)',
            'rgb(219, 152, 193)',

            'rgb(255, 254, 255)',
            'rgb(187, 188, 188)'
        ],
        values: [
            0, 4, 17,
            17, 30,
            30, 43,
            43, 56,
            56, 71,
            71, 79.5
        ],
    },
    HHC: hydrometer_class,

    N0B: reflectivity,
    N1B: reflectivity,
    N2B: reflectivity,
    N3B: reflectivity,

    N0C: corr_coeff,
    N1C: corr_coeff,
    N2C: corr_coeff,
    N3C: corr_coeff,

    N0G: velocity,
    N1G: velocity,
    N2G: velocity,
    N3G: velocity,
    NAG: velocity,
    NBG: velocity,

    N0H: hydrometer_class,
    N1H: hydrometer_class,
    N2H: hydrometer_class,
    N3H: hydrometer_class,

    N0S: {
        colors: [
            'rgb(155, 31, 139)',
            'rgb(155, 31, 139)',

            'rgb(48, 7, 147)',
            'rgb(48, 7, 147)',

            'rgb(64, 128, 189)',
            'rgb(64, 128, 189)',

            'rgb(133, 226, 231)',
            'rgb(133, 226, 231)',

            'rgb(163, 240, 186)',
            'rgb(163, 240, 186)',

            'rgb(96, 209, 62)',
            'rgb(96, 209, 62)',

            'rgb(56, 127, 33)',
            'rgb(56, 127, 33)',

            'rgb(117, 131, 114)',
            'rgb(117, 131, 114)',

            'rgb(121, 21, 13)',
            'rgb(121, 21, 13)',

            'rgb(201, 43, 30)',
            'rgb(201, 43, 30)',

            'rgb(235, 123, 169)',
            'rgb(235, 123, 169)',

            'rgb(251, 229, 166)',
            'rgb(251, 229, 166)',

            'rgb(242, 162, 103)',
            'rgb(242, 162, 103)',

            'rgb(196, 104, 67)',
            'rgb(196, 104, 67)',

            'rgb(115, 20, 198)',
            'rgb(115, 20, 198)'
        ],
        values: [
            1, 2,
            2, 3,
            3, 4,
            4, 5,
            5, 6,
            6, 7,
            7, 8,
            8, 9,
            9, 10,
            10, 11,
            11, 12,
            12, 13,
            13, 14,
            14, 15,
            15, 16
        ],
    },
    N0U: velocity,
    N1U: velocity,
    N2U: velocity,
    N3U: velocity,

    N0X: diff_reflectivity,
    N1X: diff_reflectivity,
    N2X: diff_reflectivity,
    N3X: diff_reflectivity,

    NSW: spectrum_width,

    N0Q: reflectivity,
    N1Q: reflectivity,
    N2Q: reflectivity,
    N3Q: reflectivity,

    PHI: {
        colors: [
            'rgb(255, 255, 255)',
            'rgb(210, 210, 180)',
            'rgb(10, 20, 95)',
            'rgb(0, 255, 0)',
            'rgb(30, 100, 0)',
            'rgb(255, 255, 0)',
            'rgb(255, 125, 0)',
            'rgb(90, 0, 0)',
            'rgb(255, 140, 255)'
        ],
        values: [
            0, 15, 30, 45, 60, 75, 90, 120, 180
        ],
    },
    REF: reflectivity,
    RHO: corr_coeff,
    SW: spectrum_width, // 'SW '

    TV0: velocity,
    TV1: velocity,
    TV2: velocity,

    TZL: reflectivity,
    TZ0: reflectivity,
    TZ1: reflectivity,
    TZ2: reflectivity,
    TZ3: reflectivity,

    VEL: velocity,
    ZDR: diff_reflectivity
}

module.exports = productColors;