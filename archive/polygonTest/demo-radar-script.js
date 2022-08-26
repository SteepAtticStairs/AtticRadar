function drawRadarShape(jsonObj, lati, lngi, produc, shouldFilter) {
  var settings = {};
  settings["rlat"] = lati;
  settings["rlon"] = lngi;
  // phi is elevation
  settings["phi"] = 0.483395;
  settings["base"] = jsonObj;


  var divider;
  function createTexture(gl) {
    /*
    color: -120 0 0 155
    color: -50 0 255 255
    color: -10 0 102 0
    color: 0 128 128 128 
    color: 10 96 13 23
    color: 30 200 0 0
    color: 60 255 255 0
    color: 120 120 60 0
    */
    // https://github.com/Unidata/MetPy/blob/main/src/metpy/plots/colortable_files/NWSReflectivityExpanded.tbl
    var colors = {"ref":[]}
    var values = {"ref":[]}
    if (produc == "REF" || produc[0] == "N0B") {
      console.log('base reflectivity!?-.,')
      if (!shouldFilter) {
        // if the user doesnt want to filter low values,
        // push the normal colors
        colors["ref"].push(
          "#646464",
          '#ccffff',
          '#cc99cc',
          '#996699',
          '#663366',
          '#999966',
        )
      } else if (shouldFilter) {
        // if the user DOES want to filter low values,
        // push transparent colors in their place
        colors["ref"].push(
          "#00000000",
          "#00000000",
          "#00000000",
          "#00000000",
          "#00000000",
          "#00000000",
        )
      }
      // push the rest of the normal values
      colors["ref"].push(
        '#646464',
        '#04e9e7',
        '#019ff4',
        '#0300f4',
        '#02fd02',
        '#01c501',
        '#008e00',
        '#fdf802',
        '#e5bc00',
        '#fd9500',
        '#fd0000',
        '#d40000',
        '#bc0000',
        '#f800fd',
        '#9854c6',
        '#fdfdfd'
      )
      values["ref"].push(
        -30, -25, -20, -15, -10, -5, 0,
        5, 10, 15, 20, 25, 30, 35, 40,
        45, 50, 55, 60, 65, 70, 75
      )
    } else if (produc == "VEL") {
      console.log('velocity??')
      colors["ref"].push(
        //"#ffffff",
        //"#FC52FF",
        //"#871FFF",
        //"#0011CC",
        //"#0088CC",
        "#B3F0FF",
  
        "#42FF42",
        "#009402",
        "#A3A3A3",
        "#8A0000",
        "#FF5269",
  
        "#FFB3E0",
        //"#FFF1C2",
        //"#FF9214",
        //"#B85C00",
        //"#572100",
        //"#000000"
      )
      values["ref"].push(
        -50, -30, -10, -5, 10, 20, 50
      )
    } else if (produc == "RHO" || produc[0] == "N0C") {
      console.log('cor coef --')
      colors["ref"].push(
        "#000000", "#949494", "#7593FF", "#0045BD", "#ADF4FF", "#00FA32", "#FFD53D", "#F01000", "#C20047", "#FFB8D8", "#FFEBF2"
      )
      values["ref"].push(
        0.2, 0.4, 0.55, 0.65, 0.8, 0.85, 0.95, 0.975, 1, 1.04, 1.05
      )
    } else if (produc == "PHI") {
      console.log('diff phase!')
      // https://github.com/paulyc/NOAA-WCT/blob/master/ext/config/colormaps/nexrad_dp_phi.wctpal
      colors["ref"].push(
        //'rgb(150, 150, 150)', 'rgb(75, 0, 0)', 'rgb(235, 120, 185)', 'rgb(170, 149, 203)', 'rgb(98, 255, 250)', 'rgb(20, 185, 50)', 'rgb(10, 255, 10)', 'rgb(255, 255, 0)', 'rgb(255, 120, 20)', 'rgb(164, 72, 0)',
        'rgb(255, 255, 255)',
        'rgb(210, 210, 180)',
        'rgb(10, 20, 95)',
        'rgb(0, 255, 0)',
        'rgb(30, 100, 0)',
        'rgb(255, 255, 0)',
        'rgb(255, 125, 0)',
        'rgb(90, 0, 0)',
        'rgb(255, 140, 255)',
      )
      values["ref"].push(
        0, 40, 80, 120, 160, 200, 240, 280, 320, 360
        //0, 36, 72, 108, 144, 180, 216, 252, 288, 324, 360
      )
    } else if (produc == "ZDR" || produc[0] == "N0X") {
      console.log('diff refl...')
      // https://github.com/paulyc/NOAA-WCT/blob/master/ext/config/colormaps/nexrad_dp_zdr.pal
      colors["ref"].push(
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
        'rgb(145, 45, 150)',
      )
      values["ref"].push(
        -8, -6, -4, -2, 0, 0, 0.25, 1, 1.5, 2, 3, 4, 5, 6, 8
      )
    } else if (produc == "SW " || produc[0] == "NSW") {
      console.log('spect width,')
      // https://github.com/paulyc/NOAA-WCT/blob/master/ext/config/colormaps/nexrad_spec.wctpal
      colors["ref"].push(
        'rgb(118, 118, 118)',
        'rgb(137, 137, 137)',
        'rgb(156, 156, 156)',
        'rgb(78, 171, 78)',
        'rgb(0, 187, 0)',
        'rgb(127, 93, 0)',
        'rgb(255, 0, 0)',
        'rgb(231, 56, 0)',
        'rgb(208, 112, 0)',
        'rgb(231, 183, 0)',
        'rgb(255, 255, 0)',
      )
      values["ref"].push(
        0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30
        //0, 4, 9.7, 13, 19, 25, 30, 40
      )
    } else if (produc == "HHC" || produc[0] == "N0H") {
      console.log('hhc')
      // https://github.com/paulyc/NOAA-WCT/blob/master/ext/config/colormaps/nexrad_spec.wctpal
      colors["ref"].push(
        // '#9C9C9C',
        // '#767676',
        // '#FFB0B0',
        // '#00FFFF',
        // '#0090FF',
        // '#00FB90',
        // '#00BB00',
        // '#D0D060',
        // '#D28484',
        // '#FF0000',
        // '#A01414',
        // '#FFFF00',
        // '#FFFFFF',
        // '#E700FF',
        // '#77007D',

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

        'rgb(212, 45, 246)',
        'rgb(212, 45, 246)',

        'rgb(109, 18, 121)',
        'rgb(109, 18, 121)',

        'rgb(119, 0, 255)',
        'rgb(119, 0, 255)',
      )
      values["ref"].push(
        0, 10,
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
        140, 140
      )
    } else if (produc[0] == "N0S") {
      console.log('n0s')
      // https://github.com/paulyc/NOAA-WCT/blob/master/ext/config/colormaps/nexrad_l3_p56.wctpal
      colors["ref"].push(
        'rgb(0, 224, 255)',
        'rgb(0, 224, 255)',

        'rgb(0, 138, 255)',
        'rgb(0, 138, 255)',

        'rgb(50, 0, 150)',
        'rgb(50, 0, 150)',

        'rgb(0, 251, 144)',
        'rgb(0, 251, 144)',

        'rgb(0, 187, 0)',
        'rgb(0, 187, 0)',

        'rgb(0, 143, 0)',
        'rgb(0, 143, 0)',

        'rgb(205, 192, 159)',
        'rgb(205, 192, 159)',

        'rgb(118, 118, 118)',
        'rgb(118, 118, 118)',

        'rgb(248, 135, 0)',
        'rgb(248, 135, 0)',

        'rgb(255, 207, 0)',
        'rgb(255, 207, 0)',

        'rgb(255, 255, 0)',
        'rgb(255, 255, 0)',

        'rgb(174, 0, 0)',
        'rgb(174, 0, 0)',

        'rgb(208, 122, 0)',
        'rgb(208, 122, 0)',

        'rgb(255, 0, 0)',
        'rgb(255, 0, 0)',

        'rgb(119, 0, 125)',
        'rgb(119, 0, 125)',
      )
      values["ref"].push(
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
      )
    } else if (produc[0] == "NXQ") {
      console.log('l3 reflectivity')
      colors["ref"].push(
        '#646464',
        '#04e9e7',
        '#019ff4',
        '#0300f4',
        '#02fd02',
        '#01c501',
        '#008e00',
        '#fdf802',
        '#e5bc00',
        '#fd9500',
        '#fd0000',
        '#d40000',
        '#bc0000',
        '#f800fd',
        '#9854c6',
        '#fdfdfd'
      )
      values["ref"].push(
        0,
        5, 10, 15, 20, 25, 30, 35, 40,
        45, 50, 55, 60, 65, 70, 75
      )
    } else if (produc[0] == "N0U" || produc[0] == "N0G") {
      console.log('l3 velocity')
      colors["ref"].push(
        "#ffffff",
        "#FC52FF",
        "#871FFF",
        "#0011CC",
        "#0088CC",
        "#B3F0FF",

        "#42FF42",
        "#009402",
        "#A3A3A3",
        "#8A0000",
        "#FF5269",

        "#FFB3E0",
        "#FFF1C2",
        "#FF9214",
        "#B85C00",
        "#572100",
        "#000000"

        // 'rgb(0, 0, 155)',
        // 'rgb(0, 255, 255)',
        // 'rgb(0, 102, 0)',
        // 'rgb(128, 128, 128)',
        // 'rgb(96, 13, 23)',
        // 'rgb(200, 0, 0)',
        // 'rgb(255, 255, 0)',
        // 'rgb(120, 60, 0)',
      )
      values["ref"].push(
        //-80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80
        //-120, -50, -10, 0, 10, 30, 60, 120
        -260, -250, -220, -190, -150, -90, -60, -30,
        0,
        30, 60, 90, 150, 190, 220, 250, 260
      )
    } else if (produc[0] == "DVL") {
      console.log('digital vil')
      colors["ref"].push(
        'rgb(120, 120, 120)',
        'rgb(0, 236, 236)',
        'rgb(1, 160, 246)',
        'rgb(0, 0, 246)',
        'rgb(0, 255, 0)',
        'rgb(0, 200, 0)',
        'rgb(0, 144, 0)',
        'rgb(255, 255, 0)',
        'rgb(231, 192, 0)',
        'rgb(255, 144, 0)',
        'rgb(214, 0, 0)',
        'rgb(192, 0, 0)',
        'rgb(255, 0, 255)',
        'rgb(153, 85, 201)',
        'rgb(235, 235, 235)',
      )
      values["ref"].push(
        -50, 0.1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75,
      )
    }
    var colors=colors["ref"];
    var levs=values["ref"];
    var colortcanvas=document.getElementById("texturecolorbar");
    colortcanvas.width=300;
    colortcanvas.height=30;
    var ctxt = colortcanvas.getContext('2d');
    ctxt.clearRect(0,0,colortcanvas.width,colortcanvas.height); 
    var grdt=ctxt.createLinearGradient(0,0,colortcanvas.width,0);
    var cmax=levs[levs.length-1];
    var cmin=levs[0];
    var clen=colors.length;

    for (var i=0;i<clen;++i) {
      grdt.addColorStop((levs[i]-cmin)/(cmax-cmin),colors[i]);
    }
    ctxt.fillStyle=grdt;
    ctxt.fillRect(0,0,colortcanvas.width,colortcanvas.height);
    imagedata=ctxt.getImageData(0,0,colortcanvas.width,colortcanvas.height);
    imagetexture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,imagetexture);
    pageState.imagetexture = imagetexture;
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,imagedata)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    var hycObj = {
      0: 'ND: Below Threshold',
      1: 'ND: Below Threshold',
      2: 'BI: Biological',
      3: 'GC: Anomalous Propagation/Ground Clutter',
      4: 'IC: Ice Crystals',
      5: 'DS: Dry Snow',
      6: 'WS: Wet Snow',
      7: 'RA: Light and/or Moderate Rain',
      8: 'HR: Heavy Rain',
      9: 'BD: Big Drops (rain)',
      10: 'GR: Graupel',
      11: 'HA: Hail, possibly with rain',
      12: 'LH: Large Hail',
      13: 'GH: Giant Hail',
      14: 'UK: Unknown Classification',
      15: 'RF: Range Folded',
    };
    const tooltip = bootstrap.Tooltip.getInstance('#texturecolorbar')
    if (produc == "HHC" || produc[0] == "N0H") {
      function getCursorPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        return ({"x": x, "y": y});
      }
      colortcanvas.addEventListener('mousemove', function(e) {
        if (document.getElementById('curProd').innerHTML == 'hyc' || document.getElementById('curProd').innerHTML == 'hhc') {
          var xPos = getCursorPosition(colortcanvas, e).x;
          var thearr = [];
          var numOfColors = 14;
          for (var e = 0; e < numOfColors; e++) {
            thearr.push(Math.round((colortcanvas.width / numOfColors) * e))
          }
          var thearr2 = thearr;
          thearr.push(xPos);
          thearr2.sort(function(a, b){return a - b});
          var xPosIndex = thearr2.indexOf(xPos);
          var xPosProduct = hycObj[thearr2.indexOf(xPos)];
          //console.log(xPosProduct)
          tooltip.enable();
          tooltip.setContent({'.tooltip-inner': xPosProduct})
        }
      })
    } else {
      tooltip.disable();
    }
    //$('#texturecolorbar').off()
  }

  function dataStore() {
    return {
      positions:null,
      indices:null,
      colors:null
    }
  }

  var pageState = dataStore();

  var myWorker = new Worker('./polygonTest/generateVerticesRadarDemo.js');
  myWorker.onmessage=function(oEvent) {
    var data = new Float32Array(oEvent.data.data);
    var indices = new Int32Array(oEvent.data.indices);
    var colors = new Float32Array(oEvent.data.colors);
    var returnedGeojson = oEvent.data.geojson;
    pageState.positions = data;
    pageState.indices = indices;
    pageState.colors = colors;
    //console.log(Math.max(...[...new Set(colors)]))
    map.addLayer(layer);

    var phpProxy = 'https://php-cors-proxy.herokuapp.com/?';
    function addStormTracksLayers() {
      var fileUrl = `${phpProxy}https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.58sti/SI.${$('#stationInp').val().toLowerCase()}/sn.last`
      console.log(fileUrl, $('#stationInp').val().toLowerCase())
      loadFileObject(fileUrl, document.getElementById('radFileName').innerHTML, 3);
    }
    function addMesocycloneLayers() {
      var fileUrl = `${phpProxy}https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.141md/SI.${$('#stationInp').val().toLowerCase()}/sn.last`
      console.log(fileUrl, $('#stationInp').val().toLowerCase())
      loadFileObject(fileUrl, document.getElementById('radFileName').innerHTML, 3);
    }
    function addTornadoLayers() {
      var fileUrl = `${phpProxy}https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.61tvs/SI.${$('#stationInp').val().toLowerCase()}/sn.last`
      console.log(fileUrl, $('#stationInp').val().toLowerCase())
      loadFileObject(fileUrl, document.getElementById('radFileName').innerHTML, 3);
    }
    function arrayify(text) {
      return text.replace(/"/g, '').replace(/\[/g, '').replace(/\]/g, '').split(',');
    }
    function removeAMapLayer(lay) {
      if (map.getLayer(lay)) {
        map.removeLayer(lay);
      }
      if (map.getSource(lay)) {
          map.removeSource(lay);
      }
    }
    var stLayersText = document.getElementById('allStormTracksLayers').innerHTML;
    var mdLayersText = document.getElementById('allMesocycloneLayers').innerHTML;
    var tvLayersText = document.getElementById('allTornadoLayers').innerHTML;
    var stLayers = arrayify(stLayersText);
    var mdLayers = arrayify(mdLayersText);
    var tvLayers = arrayify(tvLayersText);
  
    if (document.getElementById('prevStat').innerHTML != document.getElementById('fileStation').innerHTML) {
      var station = document.getElementById('fileStation').innerHTML;
      $.getJSON('resources/radarStations.json', function(data) {
          var stationLat = data[station][1];
          var stationLng = data[station][2];
          map.flyTo({
              center: [stationLng, stationLat],
              zoom: 8,
              duration: 1000,
          });
      })
      for (key in stLayers) {
        removeAMapLayer(stLayers[key]);
      }
      addStormTracksLayers();
      for (key in mdLayers) {
        removeAMapLayer(mdLayers[key]);
      }
      addMesocycloneLayers();
      for (key in tvLayers) {
        removeAMapLayer(tvLayers[key]);
      }
      addTornadoLayers();
    } else {
      for (key in stLayers) {
        map.moveLayer(stLayers[key]);
      }
      for (key in mdLayers) {
        map.moveLayer(mdLayers[key]);
      }
      for (key in tvLayers) {
        map.moveLayer(tvLayers[key]);
      }
    }
    document.getElementById('prevStat').innerHTML = document.getElementById('fileStation').innerHTML;
    document.getElementById('testEventElem').innerHTML = 'changed'
  }

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var vers = JSON.parse(this.responseText).version;

        myWorker.postMessage([
          settings["base"],
          settings["phi"],
          settings["rlat"],
          settings["rlon"],
          vers
        ]);
      }
  };
  xhttp.open("GET", jsonObj, true);
  xhttp.send();

  if (produc == "REF" || produc[0] == "N0B") {
    divider = '/(70.0)';
  } else if (produc == "VEL") {
    divider = '/(70.0)';
  } else if (produc == "RHO") {
    divider = '';
  } else if (produc == "PHI") {
    divider = '/(135.0)';
  } else if (produc == "ZDR") {
    divider = '/(20.0)';
  } else if (produc == "SW " || produc[0] == "NSW") {
    divider = '/(10.0)';
  }

  else if (produc == "HHC" || produc[0] == "N0H") {
    divider = '/(155.0)';
  } else if (produc[0] == "N0S") {
    divider = '/(16.0)';
  } else if (produc[0] == "NXQ") {
    divider = '/(70.0)';
  } else if (produc[0] == "N0U") {
    divider = '/(135.0)';
  } else if (produc[0] == "N0G") {
    divider = '/(135.0)';
  } else if (produc[0] == "DVL") {
    divider = '/(90.0)';
  } else if (produc[0] == "N0C") {
    divider = '/(255.0)';
  } else if (produc[0] == "N0X") {
    divider = '/(255.0)';
  }
  console.log(divider)
  //compile shaders
  var vertexSource = `
    //x: azimuth
    //y: range
    //z: value
    attribute vec2 aPosition;
    attribute float aColor;
    uniform mat4 u_matrix;
    varying float color;

    void main() {
        color = aColor;
        gl_Position = u_matrix * vec4(aPosition.x,aPosition.y,0.0,1.0);
    }`;
  var fragmentSource = `
    precision mediump float;
    varying float color;
    uniform sampler2D u_texture;
    void main() {
        //gl_FragColor = vec4(0.0,color/60.0,0.0,1.0);
        float calcolor = (color)${divider};
        gl_FragColor = texture2D(u_texture,vec2(min(max(calcolor,0.0),1.0),0.0));
        //gl_FragColor = vec4(1.0,0.0,0.0,1.0);
    }`
  var masterGl;
  var layer = {
    id:"baseReflectivity",
    type:"custom",
    minzoom:0,
    maxzoom:18,

    onAdd: function(map,gl) {
      masterGl = gl;
      createTexture(gl);

      var ext = gl.getExtension('OES_element_index_uint');
      var vertexShader=gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexSource);
      gl.compileShader(vertexShader);
      var compilationLog = gl.getShaderInfoLog(vertexShader);
      var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentSource);
      gl.compileShader(fragmentShader);
      var compilationLog = gl.getShaderInfoLog(fragmentShader);
      this.program = gl.createProgram();
      gl.attachShader(this.program, vertexShader);
      gl.attachShader(this.program, fragmentShader);
      gl.linkProgram(this.program);
      this.matrixLocation = gl.getUniformLocation(this.program, "u_matrix");
      this.positionLocation = gl.getAttribLocation(this.program, "aPosition");
      this.colorLocation = gl.getAttribLocation(this.program, "aColor");
      this.textureLocation=gl.getUniformLocation(this.program,"u_texture");

      //data buffers
      this.positionBuffer = gl.createBuffer();
      this.indexBuffer = gl.createBuffer();
      this.colorBuffer = gl.createBuffer();
    },//end onAdd
    render: function(gl,matrix) {
      //console.log("render base");
      var ext = gl.getExtension('OES_element_index_uint');
      //use program
      gl.useProgram(this.program);
      //how to remove vertices from position buffer
      var size=2;
      var type=gl.FLOAT;
      var normalize=false;
      var stride=0;
      var offset=0;
      //calculate matrices
      gl.uniformMatrix4fv(this.matrixLocation,false,matrix);
      gl.uniform1i(this.textureLocation,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,pageState.positions,gl.STATIC_DRAW);
      gl.enableVertexAttribArray(this.positionLocation);
      gl.vertexAttribPointer(this.positionLocation,size,type,normalize,stride,offset);
      
      gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,pageState.colors,gl.STATIC_DRAW);
      gl.enableVertexAttribArray(this.colorLocation);
      gl.vertexAttribPointer(this.colorLocation,1,type,normalize,stride,offset);

      gl.bindTexture(gl.TEXTURE_2D,pageState.imagetexture);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,imagedata)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      var primitiveType = gl.TRIANGLES;
      var count = pageState.indices.length;
      gl.drawArrays(primitiveType, offset, pageState.positions.length/2);

    }//end render
  }
}