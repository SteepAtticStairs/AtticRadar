(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const noaa_colors = {
    "Tsunami Warning": {
        "priority": "1",
        "colorName": "Tomato",
        "rgb": "rgb(253, 99, 71)",
        "hex": "#FD6347"
    },
    "Tornado Warning": {
        "priority": "2",
        "colorName": "Red",
        "rgb": "rgb(233, 51, 35)",
        "hex": "#FF0000",
        "originalColor": "rgb(255, 0, 0)"
    },
    "Extreme Wind Warning": {
        "priority": "3",
        "colorName": "Darkorange",
        "rgb": "rgb(255, 140, 0)",
        "hex": "#FF8C00"
    },
    "Severe Thunderstorm Warning": {
        "priority": "4",
        "colorName": "Orange",
        "rgb": "rgb(244, 185, 65)",
        "hex": "#FFA500",
        "originalColor": "rgb(255, 165, 0)"
    },
    "Flash Flood Warning": {
        "priority": "5",
        "colorName": "Darkred",
        "rgb": "rgb(147, 241, 75)",
        "hex": "#8B0000",
        "originalColor": "rgb(139, 0, 0)"
    },
    "Flash Flood Statement": {
        "priority": "6",
        "colorName": "Darkred",
        "rgb": "rgb(139, 0, 0)",
        "hex": "#8B0000"
    },
    "Severe Weather Statement": {
        "priority": "7",
        "colorName": "Aqua",
        "rgb": "rgb(0, 255, 255)",
        "hex": "#00FFFF"
    },
    "Shelter In Place Warning": {
        "priority": "8",
        "colorName": "Salmon",
        "rgb": "rgb(250, 128, 114)",
        "hex": "#FA8072"
    },
    "Evacuation Immediate": {
        "priority": "9",
        "colorName": "Chartreuse",
        "rgb": "rgb(127, 255, 0)",
        "hex": "#7FFF00"
    },
    "Civil Danger Warning": {
        "priority": "10",
        "colorName": "Lightpink",
        "rgb": "rgb(255, 182, 193)",
        "hex": "#FFB6C1"
    },
    "Nuclear Power Plant Warning": {
        "priority": "11",
        "colorName": "Indigo",
        "rgb": "rgb(75, 0, 130)",
        "hex": "#4B0082"
    },
    "Radiological Hazard Warning": {
        "priority": "12",
        "colorName": "Indigo",
        "rgb": "rgb(75, 0, 130)",
        "hex": "#4B0082"
    },
    "Hazardous Materials Warning": {
        "priority": "13",
        "colorName": "Indigo",
        "rgb": "rgb(75, 0, 130)",
        "hex": "#4B0082"
    },
    "Fire Warning": {
        "priority": "14",
        "colorName": "Sienna",
        "rgb": "rgb(160, 82, 45)",
        "hex": "#A0522D"
    },
    "Civil Emergency Message": {
        "priority": "15",
        "colorName": "Lightpink",
        "rgb": "rgb(255, 182, 193)",
        "hex": "#FFB6C1"
    },
    "Law Enforcement Warning": {
        "priority": "16",
        "colorName": "Silver",
        "rgb": "rgb(192, 192, 192)",
        "hex": "#C0C0C0"
    },
    "Storm Surge Warning": {
        "priority": "17",
        "colorName": "Darkpurple",
        "rgb": "rgb(76, 87, 246)",
        "hex": "#B524F7",
        "originalColor": "rgb(181, 36, 247)"
    },
    "Hurricane Force Wind Warning": {
        "priority": "18",
        "colorName": "Westernred",
        "rgb": "rgb(205, 92, 92)",
        "hex": "#CD5C5C"
    },
    "Hurricane Warning": {
        "priority": "19",
        "colorName": "Crimson",
        "rgb": "rgb(199, 63, 155)",
        "hex": "#DC143C",
        "originalColor": "rgb(220, 20, 60)"
    },
    "Typhoon Warning": {
        "priority": "20",
        "colorName": "Crimson",
        "rgb": "rgb(220, 20, 60)",
        "hex": "#DC143C"
    },
    "Special Marine Warning": {
        "priority": "21",
        "colorName": "Orange",
        "rgb": "rgb(197, 155, 249)",
        "hex": "#FFA500",
        "originalColor": "rgb(255, 165, 0)"
    },
    "Blizzard Warning": {
        "priority": "22",
        "colorName": "Orangered",
        "rgb": "rgb(235, 78, 65)",
        "hex": "#FF4500",
        "originalColor": "rgb(255, 69, 0)"
    },
    "Snow Squall Warning": {
        "priority": "23",
        "colorName": "Mediumvioletred",
        "rgb": "rgb(3, 0, 163)",
        "hex": "#C71585",
        "originalColor": "rgb(199, 21, 133)"
    },
    "Ice Storm Warning": {
        "priority": "24",
        "colorName": "Darkmagenta",
        "rgb": "rgb(173, 74, 248)",
        "hex": "#8B008B",
        "originalColor": "rgb(139, 0, 139)"
    },
    "Winter Storm Warning": {
        "priority": "25",
        "colorName": "Hotpink",
        "rgb": "rgb(240, 141, 233)",
        "hex": "#FF69B4",
        "originalColor": "rgb(255, 105, 180)"
    },
    "High Wind Warning": {
        "priority": "26",
        "colorName": "Goldenrod",
        "rgb": "rgb(218, 165, 32)",
        "hex": "#DAA520"
    },
    "Tropical Storm Warning": {
        "priority": "27",
        "colorName": "Firebrick",
        "rgb": "rgb(251, 231, 88)",
        "hex": "#B22222",
        "originalColor": "rgb(178, 34, 34)"
    },
    "Storm Warning": {
        "priority": "28",
        "colorName": "Darkviolet",
        "rgb": "rgb(148, 0, 211)",
        "hex": "#9400D3"
    },
    "Tsunami Advisory": {
        "priority": "29",
        "colorName": "Chocolate",
        "rgb": "rgb(210, 105, 30)",
        "hex": "#D2691E"
    },
    "Tsunami Watch": {
        "priority": "30",
        "colorName": "Fushsia",
        "rgb": "rgb(255, 0, 255)",
        "hex": "#FF00FF"
    },
    "Avalanche Warning": {
        "priority": "31",
        "colorName": "Dodgerblue",
        "rgb": "rgb(30, 144, 255)",
        "hex": "#1E90FF"
    },
    "Earthquake Warning": {
        "priority": "32",
        "colorName": "Saddlebrown",
        "rgb": "rgb(139, 69, 19)",
        "hex": "#8B4513"
    },
    "Volcano Warning": {
        "priority": "33",
        "colorName": "darkslategray",
        "rgb": "rgb(47, 79, 79)",
        "hex": "#2F4F4F"
    },
    "Ashfall Warning": {
        "priority": "34",
        "colorName": "Darkgray",
        "rgb": "rgb(169, 169, 169)",
        "hex": "#A9A9A9"
    },
    "Coastal Flood Warning": {
        "priority": "35",
        "colorName": "Forestgreen",
        "rgb": "rgb(34, 139, 34)",
        "hex": "#228B22"
    },
    "Lakeshore Flood Warning": {
        "priority": "36",
        "colorName": "Forestgreen",
        "rgb": "rgb(34, 139, 34)",
        "hex": "#228B22"
    },
    "Flood Warning": {
        "priority": "37",
        "colorName": "Lime",
        "rgb": "rgb(147, 241, 75)",
        "hex": "#00FF00",
        "originalColor": "rgb(0, 255, 0)"
    },
    "High Surf Warning": {
        "priority": "38",
        "colorName": "Forestgreen",
        "rgb": "rgb(34, 139, 34)",
        "hex": "#228B22"
    },
    "Dust Storm Warning": {
        "priority": "39",
        "colorName": "Bisque",
        "rgb": "rgb(255, 228, 196)",
        "hex": "#FFE4C4"
    },
    "Blowing Dust Warning": {
        "priority": "40",
        "colorName": "Bisque",
        "rgb": "rgb(255, 228, 196)",
        "hex": "#FFE4C4"
    },
    "Lake Effect Snow Warning": {
        "priority": "41",
        "colorName": "Darkcyan",
        "rgb": "rgb(0, 139, 139)",
        "hex": "#008B8B"
    },
    "Excessive Heat Warning": {
        "priority": "42",
        "colorName": "Mediumvioletred",
        "rgb": "rgb(199, 21, 133)",
        "hex": "#C71585"
    },
    "Tornado Watch": {
        "priority": "43",
        "colorName": "Yellow",
        "rgb": "rgb(245, 254, 83)",
        "hex": "#FFFF00",
        "originalColor": "rgb(255, 255, 0)"
    },
    "Severe Thunderstorm Watch": {
        "priority": "44",
        "colorName": "Palevioletred",
        "rgb": "rgb(238, 135, 134)",
        "hex": "#DB7093",
        "originalColor": "rgb(219, 112, 147)"
    },
    "Flash Flood Watch": {
        "priority": "45",
        "colorName": "Seagreen",
        "rgb": "rgb(58, 111, 29)",
        "hex": "#2E8B57",
        "originalColor": "rgb(46, 139, 87)"
    },
    "Gale Warning": {
        "priority": "46",
        "colorName": "Plum",
        "rgb": "rgb(50, 111, 255)",
        "hex": "#DDA0DD",
        "originalColor": "rgb(221, 160, 221)"
    },
    "Flood Statement": {
        "priority": "47",
        "colorName": "Lime",
        "rgb": "rgb(0, 255, 0)",
        "hex": "#00FF00"
    },
    "Wind Chill Warning": {
        "priority": "48",
        "colorName": "Lightsteelblue",
        "rgb": "rgb(176, 196, 222)",
        "hex": "#B0C4DE"
    },
    "Extreme Cold Warning": {
        "priority": "49",
        "colorName": "Blue",
        "rgb": "rgb(0, 0, 255)",
        "hex": "#0000FF"
    },
    "Hard Freeze Warning": {
        "priority": "50",
        "colorName": "Darkviolet",
        "rgb": "rgb(148, 0, 211)",
        "hex": "#9400D3"
    },
    "Freeze Warning": {
        "priority": "51",
        "colorName": "Darkslateblue",
        "rgb": "rgb(72, 61, 139)",
        "hex": "#483D8B"
    },
    "Red Flag Warning": {
        "priority": "52",
        "colorName": "Deeppink",
        "rgb": "rgb(255, 20, 147)",
        "hex": "#FF1493"
    },
    "Storm Surge Watch": {
        "priority": "53",
        "colorName": "Lightpurple",
        "rgb": "rgb(165, 202, 182)",
        "hex": "#DB7FF7",
        "originalColor": "rgb(219, 127, 247)"
    },
    "Hurricane Watch": {
        "priority": "54",
        "colorName": "Magenta",
        "rgb": "rgb(234, 51, 247)",
        "hex": "#FF00FF",
        "originalColor": "rgb(255, 0, 255)"
    },
    "Hurricane Force Wind Watch": {
        "priority": "55",
        "colorName": "Darkorchid",
        "rgb": "rgb(153, 50, 204)",
        "hex": "#9932CC"
    },
    "Typhoon Watch": {
        "priority": "56",
        "colorName": "Magenta",
        "rgb": "rgb(255, 0, 255)",
        "hex": "#FF00FF"
    },
    "Tropical Storm Watch": {
        "priority": "57",
        "colorName": "Lightcoral",
        "rgb": "rgb(239, 127, 131)",
        "hex": "#F08080",
        "originalColor": "rgb(240, 128, 128)"
    },
    "Storm Watch": {
        "priority": "58",
        "colorName": "Moccasin",
        "rgb": "rgb(255, 228, 181)",
        "hex": "#FFE4B5"
    },
    "Hurricane Local Statement": {
        "priority": "59",
        "colorName": "Moccasin",
        "rgb": "rgb(255, 228, 181)",
        "hex": "#FFE4B5"
    },
    "Typhoon Local Statement": {
        "priority": "60",
        "colorName": "Moccasin",
        "rgb": "rgb(255, 228, 181)",
        "hex": "#FFE4B5"
    },
    "Tropical Storm Local Statement": {
        "priority": "61",
        "colorName": "Moccasin",
        "rgb": "rgb(255, 228, 181)",
        "hex": "#FFE4B5"
    },
    "Tropical Depression Local Statement": {
        "priority": "62",
        "colorName": "Moccasin",
        "rgb": "rgb(255, 228, 181)",
        "hex": "#FFE4B5"
    },
    "Avalanche Advisory": {
        "priority": "63",
        "colorName": "Peru",
        "rgb": "rgb(205, 133, 63)",
        "hex": "#CD853F"
    },
    "Winter Weather Advisory": {
        "priority": "64",
        "colorName": "Mediumslateblue",
        "rgb": "rgb(167, 129, 249)",
        "hex": "#7B68EE",
        "originalColor": "rgb(123, 104, 238)"
    },
    "Wind Chill Advisory": {
        "priority": "65",
        "colorName": "Paleturquoise",
        "rgb": "rgb(175, 238, 238)",
        "hex": "#AFEEEE"
    },
    "Heat Advisory": {
        "priority": "66",
        "colorName": "Coral",
        "rgb": "rgb(255, 127, 80)",
        "hex": "#FF7F50"
    },
    "Urban and Small Stream Flood Advisory": {
        "priority": "67",
        "colorName": "Springgreen",
        "rgb": "rgb(0, 255, 127)",
        "hex": "#00FF7F"
    },
    "Small Stream Flood Advisory": {
        "priority": "68",
        "colorName": "Springgreen",
        "rgb": "rgb(0, 255, 127)",
        "hex": "#00FF7F"
    },
    "Arroyo and Small Stream Flood Advisory": {
        "priority": "69",
        "colorName": "Springgreen",
        "rgb": "rgb(0, 255, 127)",
        "hex": "#00FF7F"
    },
    "Flood Advisory": {
        "priority": "70",
        "colorName": "Springgreen",
        "rgb": "rgb(0, 255, 127)",
        "hex": "#00FF7F"
    },
    "Hydrologic Advisory": {
        "priority": "71",
        "colorName": "Springgreen",
        "rgb": "rgb(0, 255, 127)",
        "hex": "#00FF7F"
    },
    "Lakeshore Flood Advisory": {
        "priority": "72",
        "colorName": "Lawngreen",
        "rgb": "rgb(124, 252, 0)",
        "hex": "#7CFC00"
    },
    "Coastal Flood Advisory": {
        "priority": "73",
        "colorName": "Lawngreen",
        "rgb": "rgb(124, 252, 0)",
        "hex": "#7CFC00"
    },
    "High Surf Advisory": {
        "priority": "74",
        "colorName": "Mediumorchid",
        "rgb": "rgb(186, 85, 211)",
        "hex": "#BA55D3"
    },
    "Heavy Freezing Spray Warning": {
        "priority": "75",
        "colorName": "Deepskyblue",
        "rgb": "rgb(0, 191, 255)",
        "hex": "#00BFFF"
    },
    "Dense Fog Advisory": {
        "priority": "76",
        "colorName": "Slategray",
        "rgb": "rgb(112, 128, 144)",
        "hex": "#708090"
    },
    "Dense Smoke Advisory": {
        "priority": "77",
        "colorName": "Khaki",
        "rgb": "rgb(240, 230, 140)",
        "hex": "#F0E68C"
    },
    "Small Craft Advisory For Hazardous Seas": {
        "priority": "78",
        "colorName": "Thistle",
        "rgb": "rgb(216, 191, 216)",
        "hex": "#D8BFD8"
    },
    "Small Craft Advisory for Rough Bar": {
        "priority": "79",
        "colorName": "Thistle",
        "rgb": "rgb(216, 191, 216)",
        "hex": "#D8BFD8"
    },
    "Small Craft Advisory for Winds": {
        "priority": "80",
        "colorName": "Thistle",
        "rgb": "rgb(216, 191, 216)",
        "hex": "#D8BFD8"
    },
    "Small Craft Advisory": {
        "priority": "81",
        "colorName": "Thistle",
        "rgb": "rgb(109, 186, 150)",
        "hex": "#D8BFD8",
        "originalColor": "rgb(216, 191, 216)"
    },
    "Brisk Wind Advisory": {
        "priority": "82",
        "colorName": "Thistle",
        "rgb": "rgb(216, 191, 216)",
        "hex": "#D8BFD8"
    },
    "Hazardous Seas Warning": {
        "priority": "83",
        "colorName": "Thistle",
        "rgb": "rgb(216, 191, 216)",
        "hex": "#D8BFD8"
    },
    "Dust Advisory": {
        "priority": "84",
        "colorName": "Darkkhaki",
        "rgb": "rgb(189, 183, 107)",
        "hex": "#BDB76B"
    },
    "Blowing Dust Advisory": {
        "priority": "85",
        "colorName": "Darkkhaki",
        "rgb": "rgb(189, 183, 107)",
        "hex": "#BDB76B"
    },
    "Lake Wind Advisory": {
        "priority": "86",
        "colorName": "Tan",
        "rgb": "rgb(210, 180, 140)",
        "hex": "#D2B48C"
    },
    "Wind Advisory": {
        "priority": "87",
        "colorName": "Tan",
        "rgb": "rgb(210, 180, 140)",
        "hex": "#D2B48C"
    },
    "Frost Advisory": {
        "priority": "88",
        "colorName": "Cornflowerblue",
        "rgb": "rgb(100, 149, 237)",
        "hex": "#6495ED"
    },
    "Ashfall Advisory": {
        "priority": "89",
        "colorName": "Dimgray",
        "rgb": "rgb(105, 105, 105)",
        "hex": "#696969"
    },
    "Freezing Fog Advisory": {
        "priority": "90",
        "colorName": "Teal",
        "rgb": "rgb(0, 128, 128)",
        "hex": "#008080"
    },
    "Freezing Spray Advisory": {
        "priority": "91",
        "colorName": "Deepskyblue",
        "rgb": "rgb(0, 191, 255)",
        "hex": "#00BFFF"
    },
    "Low Water Advisory": {
        "priority": "92",
        "colorName": "Brown",
        "rgb": "rgb(165, 42, 42)",
        "hex": "#A52A2A"
    },
    "Local Area Emergency": {
        "priority": "93",
        "colorName": "Silver",
        "rgb": "rgb(192, 192, 192)",
        "hex": "#C0C0C0"
    },
    "Avalanche Watch": {
        "priority": "94",
        "colorName": "Sandybrown",
        "rgb": "rgb(244, 164, 96)",
        "hex": "#F4A460"
    },
    "Blizzard Watch": {
        "priority": "95",
        "colorName": "Greenyellow",
        "rgb": "rgb(234, 254, 89)",
        "hex": "#ADFF2F",
        "originalColor": "rgb(173, 255, 47)"
    },
    "Rip Current Statement": {
        "priority": "96",
        "colorName": "Turquoise",
        "rgb": "rgb(64, 224, 208)",
        "hex": "#40E0D0"
    },
    "Beach Hazards Statement": {
        "priority": "97",
        "colorName": "Turquoise",
        "rgb": "rgb(64, 224, 208)",
        "hex": "#40E0D0"
    },
    "Gale Watch": {
        "priority": "98",
        "colorName": "Pink",
        "rgb": "rgb(102, 147, 255)",
        "hex": "#FFC0CB",
        "originalColor": "rgb(255, 192, 203)"
    },
    "Winter Storm Watch": {
        "priority": "99",
        "colorName": "Steelblue",
        "rgb": "rgb(57, 129, 247)",
        "hex": "#4682B4",
        "originalColor": "rgb(70, 130, 180)"
    },
    "Hazardous Seas Watch": {
        "priority": "100",
        "colorName": "Darkslateblue",
        "rgb": "rgb(72, 61, 139)",
        "hex": "#483D8B"
    },
    "Heavy Freezing Spray Watch": {
        "priority": "101",
        "colorName": "Rosybrown",
        "rgb": "rgb(188, 143, 143)",
        "hex": "#BC8F8F"
    },
    "Coastal Flood Watch": {
        "priority": "102",
        "colorName": "Mediumaquamarine",
        "rgb": "rgb(102, 205, 170)",
        "hex": "#66CDAA"
    },
    "Lakeshore Flood Watch": {
        "priority": "103",
        "colorName": "Mediumaquamarine",
        "rgb": "rgb(102, 205, 170)",
        "hex": "#66CDAA"
    },
    "Flood Watch": {
        "priority": "104",
        "colorName": "Seagreen",
        "rgb": "rgb(58, 111, 29)",
        "hex": "#2E8B57",
        "originalColor": "rgb(46, 139, 87)"
    },
    "High Wind Watch": {
        "priority": "105",
        "colorName": "Darkgoldenrod",
        "rgb": "rgb(184, 134, 11)",
        "hex": "#B8860B"
    },
    "Excessive Heat Watch": {
        "priority": "106",
        "colorName": "Maroon",
        "rgb": "rgb(128, 0, 0)",
        "hex": "#800000"
    },
    "Extreme Cold Watch": {
        "priority": "107",
        "colorName": "Blue",
        "rgb": "rgb(0, 0, 255)",
        "hex": "#0000FF"
    },
    "Wind Chill Watch": {
        "priority": "108",
        "colorName": "Cadetblue",
        "rgb": "rgb(95, 158, 160)",
        "hex": "#5F9EA0"
    },
    "Lake Effect Snow Watch": {
        "priority": "109",
        "colorName": "Lightskyblue",
        "rgb": "rgb(135, 206, 250)",
        "hex": "#87CEFA"
    },
    "Hard Freeze Watch": {
        "priority": "110",
        "colorName": "Royalblue",
        "rgb": "rgb(65, 105, 225)",
        "hex": "#4169E1"
    },
    "Freeze Watch": {
        "priority": "111",
        "colorName": "Cyan",
        "rgb": "rgb(0, 255, 255)",
        "hex": "#00FFFF"
    },
    "Fire Weather Watch": {
        "priority": "112",
        "colorName": "Navajowhite",
        "rgb": "rgb(255, 222, 173)",
        "hex": "#FFDEAD"
    },
    "Extreme Fire Danger": {
        "priority": "113",
        "colorName": "Darksalmon",
        "rgb": "rgb(233, 150, 122)",
        "hex": "#E9967A"
    },
    "911 Telephone Outage": {
        "priority": "114",
        "colorName": "Silver",
        "rgb": "rgb(192, 192, 192)",
        "hex": "#C0C0C0"
    },
    "Coastal Flood Statement": {
        "priority": "115",
        "colorName": "Olivedrab",
        "rgb": "rgb(107, 142, 35)",
        "hex": "#6B8E23"
    },
    "Lakeshore Flood Statement": {
        "priority": "116",
        "colorName": "Olivedrab",
        "rgb": "rgb(107, 142, 35)",
        "hex": "#6B8E23"
    },
    "Special Weather Statement": {
        "priority": "117",
        "colorName": "Moccasin",
        "rgb": "rgb(151, 204, 230)",
        "hex": "#FFE4B5",
        "originalColor": "rgb(255, 228, 181)"
    },
    "Marine Weather Statement": {
        "priority": "118",
        "colorName": "Peachpuff",
        "rgb": "rgb(255, 239, 213)",
        "hex": "#FFDAB9"
    },
    "Air Quality Alert": {
        "priority": "119",
        "colorName": "Gray",
        "rgb": "rgb(128, 128, 128)",
        "hex": "#808080"
    },
    "Air Stagnation Advisory": {
        "priority": "120",
        "colorName": "Gray",
        "rgb": "rgb(128, 128, 128)",
        "hex": "#808080"
    },
    "Hazardous Weather Outlook": {
        "priority": "121",
        "colorName": "Palegoldenrod",
        "rgb": "rgb(238, 232, 170)",
        "hex": "#EEE8AA"
    },
    "Hydrologic Outlook": {
        "priority": "122",
        "colorName": "Lightgreen",
        "rgb": "rgb(144, 238, 144)",
        "hex": "#90EE90"
    },
    "Short Term Forecast": {
        "priority": "123",
        "colorName": "Palegreen",
        "rgb": "rgb(152, 251, 152)",
        "hex": "#98FB98"
    },
    "Administrative Message": {
        "priority": "124",
        "colorName": "Silver",
        "rgb": "rgb(192, 192, 192)",
        "hex": "#C0C0C0"
    },
    "Test": {
        "priority": "125",
        "colorName": "Azure",
        "rgb": "rgb(240, 255, 255)",
        "hex": "#F0FFFF"
    },
    "Child Abduction Emergency": {
        "priority": "126",
        "colorName": "Transperant",
        "rgb": "rgb(255, 255, 255)",
        "hex": "#FFFFFF"
    },
    "Blue Alert": {
        "priority": "127",
        "colorName": "Transperant",
        "rgb": "rgb(255, 255, 255)",
        "hex": "#FFFFFF"
    }
}

module.exports = noaa_colors;
},{}],2:[function(require,module,exports){
var noaa_colors = require('./noaa_colors');

// these are custom colors that override noaa's colors
const my_polygon_colors = {
    'Tornado Watch': 'rgb(117, 20, 12)',
    'Severe Thunderstorm Watch': 'rgb(128, 128, 38)'


    // 'Tornado Warning': 'rgb(233, 51, 35)',
    // 'Severe Thunderstorm Warning': 'rgb(244, 185, 65)',
    // 'Flood Warning': 'rgb(147, 241, 75)',
    // 'Flash Flood Warning': 'rgb(147, 241, 75)',
    // 'Special Marine Warning': 'rgb(197, 155, 249)',
    // 'Special Weather Statement': 'rgb(151, 204, 230)',

    // 'Tornado Watch': 'rgb(245, 254, 83)',
    // 'Severe Thunderstorm Watch': 'rgb(238, 135, 134)',
    // 'Flood Watch': 'rgb(58, 111, 29)',
    // 'Flash Flood Watch': 'rgb(58, 111, 29)',

    // 'Hurricane Warning': 'rgb(199, 63, 155)',
    // 'Tropical Storm Warning': 'rgb(251, 231, 88)',
    // 'Storm Surge Warning': 'rgb(76, 87, 246)',
    // 'Hurricane Watch': 'rgb(234, 51, 247)',
    // 'Tropical Storm Watch': 'rgb(239, 127, 131)',
    // 'Storm Surge Watch': 'rgb(165, 202, 182)',

    // 'Blizzard Warning': 'rgb(235, 78, 65)',
    // 'Winter Storm Warning': 'rgb(240, 141, 233)',
    // 'Ice Storm Warning': 'rgb(173, 74, 248)',
    // 'Snow Squall Warning': 'rgb(3, 0, 163)',
    // 'Winter Weather Advisory': 'rgb(167, 129, 249)',
    // 'Blizzard Watch': 'rgb(234, 254, 89)',
    // 'Winter Storm Watch': 'rgb(57, 129, 247)',

    // 'Small Craft Advisory': 'rgb(109, 186, 150)',
    // 'Gale Watch': 'rgb(102, 147, 255)',
    // 'Gale Warning': 'rgb(50, 111, 255)'
}

function get_polygon_colors(alert_event) {
    if (Object.keys(noaa_colors).includes(alert_event)) {
        var c = noaa_colors[alert_event].rgb;
        if (my_polygon_colors.hasOwnProperty(alert_event)) {
            c = my_polygon_colors[alert_event];
        }
        return {
            'color': c,
            'priority': noaa_colors[alert_event].priority
        }
    } else {
        return {
            'color': 'rgb(128, 128, 128)',
            'priority': '999'
        }
    }
}

module.exports = get_polygon_colors;
},{"./noaa_colors":1}],3:[function(require,module,exports){
const fetch_data = require('./fetch_data');

fetch_data();
},{"./fetch_data":4}],4:[function(require,module,exports){
const plot_alerts = require('./plot_alerts');

const noaa_alerts_url = `https://api.weather.gov/alerts/active`;

var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

function fetch_data() {
    fetch(noaa_alerts_url, {
        cache: 'no-store',
        // headers: headers
    })
    .then(response => response.json())
    .then(alerts_data => {
        plot_alerts(alerts_data);
    })
}

module.exports = fetch_data;
},{"./plot_alerts":5}],5:[function(require,module,exports){
const map = require('../core/map/map');
const get_polygon_colors = require('./colors/polygon_colors');

function _add_alert_layers(geojson) {
    if (map.getSource('alerts_source')) {
        map.getSource('alerts_source').setData(geojson);
    } else {
        map.addSource('alerts_source', {
            type: 'geojson',
            data: geojson,
        })
        map.addLayer({
            'id': 'alerts_layer',
            'type': 'line',
            'source': 'alerts_source',
            'paint': {
                'line-color': [
                    'case',
                    ['==', ['get', 'type'], 'outline'],
                    ['get', 'color'],
                    ['==', ['get', 'type'], 'border'],
                    'black',
                    'rgba(0, 0, 0, 0)'
                ],
                'line-width': [
                    'case',
                    ['==', ['get', 'type'], 'outline'],
                    2,
                    ['==', ['get', 'type'], 'border'],
                    5,
                    0
                ]
            }
        });
        map.addLayer({
            'id': 'alerts_layer_fill',
            'type': 'fill',
            'source': 'alerts_source',
            paint: {
                'fill-color': ['get', 'color'],
                'fill-opacity': 0
            }
        });

        map.on('mouseover', 'alerts_layer_fill', function(e) {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseout', 'alerts_layer_fill', function(e) {
            map.getCanvas().style.cursor = '';
        });

        // map.on('click', 'alerts_layer_fill', click_listener);
    }
}

function _sort_by_priority(data) {
    data.features = data.features.sort((a, b) => b.properties.priority - a.properties.priority);
    return data;
}

function plot_alerts(alerts_data) {
    // console.log(alerts_data);

    for (var item in alerts_data.features) {
        var gpc = get_polygon_colors(alerts_data.features[item].properties.event); // gpc = get polygon colors
        alerts_data.features[item].properties.color = gpc.color;
        alerts_data.features[item].properties.priority = parseInt(gpc.priority);
    }
    alerts_data = _sort_by_priority(alerts_data);

    var index = 0;
    function _next() {
        index++;
        process_alert(index);
    }
    function process_alert(i) {
        console.log(i, alerts_data.features.length);
        if (i >= alerts_data.features.length) {
            var duplicate_features = alerts_data.features.flatMap((element) => [element, element]);
            duplicate_features = JSON.parse(JSON.stringify(duplicate_features));
            for (var i = 0; i < duplicate_features.length; i++) {
                if (i % 2 === 0) {
                    duplicate_features[i].properties.type = 'border';
                } else {
                    duplicate_features[i].properties.type = 'outline';
                }
            }
            alerts_data.features = duplicate_features;

            console.log(alerts_data);
            _add_alert_layers(alerts_data);
            return;
        };

        const this_feature = alerts_data.features[i];
        if (this_feature.geometry == null) {
            const affected_zones = this_feature.properties.affectedZones;
            // for (var x = 0; x < 10; x++) {
            //     fetch(affected_zones[x], {
            //         cache: 'no-store',
            //         // headers: headers
            //     })
            //     .then(response => response.json())
            //     .then(data => {
            //         // console.log(alerts_data.features[i].geometry);
            //         console.log(JSON.parse(JSON.stringify(alerts_data.features[i])))
            //         alerts_data.features[i].geometry = data.geometry;
            //         console.log(JSON.parse(JSON.stringify(alerts_data.features[i])))
            //         _next();
            //     })
            //     .catch((error) => {
            //         // console.error(`repeating ${i}`);
            //         // process_alert(i);
            //     });
            // }
            _next();
        } else {
            // console.log('already has geometry');
            _next();
        }
    }
    process_alert(index);

    // var duplicate_features = alerts_data.features.flatMap((element) => [element, element]);
    // duplicate_features = JSON.parse(JSON.stringify(duplicate_features));
    // for (var i = 0; i < duplicate_features.length; i++) {
    //     if (i % 2 === 0) {
    //         duplicate_features[i].properties.type = 'border';
    //     } else {
    //         duplicate_features[i].properties.type = 'outline';
    //     }
    // }
    // alerts_data.features = duplicate_features;

    // // console.log(alerts_data);
    // _add_alert_layers(alerts_data);
}

module.exports = plot_alerts;
},{"../core/map/map":7,"./colors/polygon_colors":2}],6:[function(require,module,exports){
/*
* This file is the entry point for the project - everything starts here.
*/

function load() {
    // initialize the alerts module
    require('../../alerts/entry');
}

function _load_map() {
    const map = require('../map/map');
    if (map.loaded()) {
        load();
    } else {
        map.on('load', function() {
            load();
        })
    }
}

if (document.readyState == 'complete' || document.readyState == 'interactive') {
    _load_map();
} else if (document.readyState == 'loading') {
    window.onload = function () {
        _load_map();
    }
}
},{"../../alerts/entry":3,"../map/map":7}],7:[function(require,module,exports){
mapboxgl.accessToken = 'pk.eyJ1IjoidHdhbGtlcjkyIiwiYSI6ImNtYnN0cWx2ajA1cTAycnEycWJwMG4zZ3MifQ.jlFBO6utDzfwyEHzRiwoOQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    zoom: 3,
    center: [-97.3302, 38.5667],
    maxZoom: 20,
    preserveDrawingBuffer: true,
    maxPitch: 0,

    fadeDuration: 0,

    attributionControl: false,
    projection: 'mercator',
});

// MOBILE - disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation();
// DESKTOP - disable map rotation using right click + drag
map.dragRotate.disable();
// DESKTOP - disable map rotation using the keyboard
map.keyboard.disableRotation();
// prevent the context menu from opening when right clicking on the map
$('#map').on('contextmenu', function(e) {
    if ($(e.target).hasClass('mapboxgl-canvas')) {
        e.preventDefault();
    }
})

// https://github.com/mapbox/mapbox-gl-js/issues/3265#issuecomment-660400481
setTimeout(() => map.resize(), 0);
window.onresize = () => { map.resize() }
window.onclick = () => { map.resize() }

module.exports = map;
},{}]},{},[6]);
