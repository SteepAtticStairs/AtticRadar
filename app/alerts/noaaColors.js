const noaaColors = {
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

module.exports = noaaColors;