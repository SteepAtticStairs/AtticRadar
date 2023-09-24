//check if pthreads will work in browser
importScripts('./radar.js');

function closest (num, arr) {
    let idx = 0;
    let curr = arr[0];
    let diff = Math.abs (num - curr);
    for (let val = 0; val < arr.length; val++) {
        let newdiff = Math.abs (num - arr[val]);
        if (newdiff < diff) {
            diff = newdiff;
            curr = arr[val];
            idx = val;
        }
    }
    return idx;
}
let fileCount = 0;
let api = {};
let testCount = 1;

function contentFinished(file, fileName) {
    postMessage({
        data: {
            "file":file,
            "fileName": fileName
        },
        "action":"contentFinished"
    })
}

function printMetadata(elevation, file, fileName) {
    const metaPtr = api.metadata(elevation, file);
    const metaResultView = new Uint8Array(Module.HEAP8.buffer, metaPtr, api.metadataSize(elevation, file));
    const metaResult = new Uint8Array(metaResultView);
    
    const dataView = new DataView(metaResult.buffer);
   
    const el = dataView.getFloat32(24, true);
    //console.log("el", el);

    const month = dataView.getInt32(0, true);
    const day = dataView.getInt32(4, true);

    //special consideration needed based on 1900s vs 2000s
    const year = dataView.getInt32(8, true).toString();
    const hour = dataView.getInt32(12, true);
    const minute = dataView.getInt32(16, true);
    const second = dataView.getInt32(20, true);

    let formattedYear;
    //console.log("js year", year);
    if (year.length === 3) {
        //year will have leading 1 if 2000s
        formattedYear = 2000 + parseInt(year.slice(1,3), 10);
    } else {
        //formattedYear = 1900 + parseInt(year, 10);
        formattedYear = year;
    }

    const date = new Date(Date.UTC(formattedYear, month-1, day, hour, minute, second));

    const nfields = dataView.getInt32(48, true);

    let fields = [];
    //get fields in elevation
    for (let i=0; i<nfields; i++) {
        fields.push(dataView.getInt32(52+4*i, true));
    }

    //console.log("fields", fields)
   
    postMessage({
        data: {
            "date":date,
            "file":file,
            "elevation": el,
            "lat": dataView.getFloat32(28, true),
            "lon": dataView.getFloat32(32, true), 
            "block":dataView.getInt32(36,true),
            "idx":dataView.getInt32(40,true),
            "percent":dataView.getFloat32(44, true),
            "fields":fields,
            "fileName":fileName
        },
        "action":"metadata"
    })
}

function getVertData(elevation, file, type, fileName, override=null) {

    //this is all for TDWR velocity. Show raw velocity instead of dealiased
    if (!override) {
        override = type;
    }

    const length = api.returnVertArraySize(elevation, file, override);
    //console.log("length",length);
   
    const floatPtr = api.returnVertArray(elevation, file, override);
    const floatResultView = new Float32Array(Module.HEAP8.buffer, floatPtr, length);
    const floatResult = new Float32Array(floatResultView);
    //console.log("floatResult", floatResult[floatResult.length-1],floatResult[floatResult.length-2],
    //floatResult[floatResult.length-3], floatResult[0], floatResult[1], floatResult[2]);

    postMessage(
        {
        "data": {
            "type":type,
            "elevation":elevation,
            "file":file,
            "fileName":fileName,
            "float":floatResult
        },
        "action":"loadData"
        }, 
        [floatResult.buffer]
        ); 
    api.free_buffer(elevation, file, override);
}

Module.onRuntimeInitialized = async _ => {
    api = {
      create_buffer: Module.cwrap('create_buffer', 'number', ['number']),
      destroy_buffer: Module.cwrap('destroy_buffer', '', ['number']),
      read: Module.cwrap('read_local', '', ['number']),
      initialize: Module.cwrap('initialize', 'number', ['number','number']),
      station: Module.cwrap('returnStation', 'number', ['number']),
      returnFile: Module.cwrap('returnFile', 'number', ['number']),
      returnFullFile: Module.cwrap('returnFullFile', 'number', ['number']),
      vcp: Module.cwrap('returnVCP', 'number', ['number']),
      floats: Module.cwrap('returnFloats', 'number', []),
      size: Module.cwrap('returnSize', 'number', []),
      metadata: Module.cwrap('returnMetadata', 'number', ['number', 'number']),
      metadataSize: Module.cwrap('returnMetadataSize', 'number', ['number', 'number']),
      advance: Module.cwrap('advanceElevation', 'number', ['number']),
      processElevationData: Module.cwrap('processElevationData', '', ['number', 'number', 'number']),
      createVertices: Module.cwrap('createVertices', '', ['number', 'number', 'number']),
      processKdp: Module.cwrap('processKdp', '', ['number', 'number']),
      returnVertArraySize: Module.cwrap('returnVertArraySize', 'number', ['number', 'number', 'number']),
      returnVertArray: Module.cwrap('returnVertArray', 'number', ['number', 'number', 'number']),
      free_buffer: Module.cwrap('free_buffer', '', ['number', 'number', 'number']),
      dealiasVelocityData: Module.cwrap('dealiasVelocityData', '', ['number', 'number', 'number']),
      separate: Module.cwrap('separate', 'number', ['number', 'number', 'number']),
      setElevations3d: Module.cwrap('set_3d_elevations', 'number', ['number', 'number']),
      setTexture3d: Module.cwrap('set_3d_texture', 'number', ['number', 'number']),
      returnScaleOffset: Module.cwrap('returnScaleOffset', 'number', ['number', 'number']),
      returnIsProcessed: Module.cwrap('returnIsProcessed', 'number', ['number', 'number', 'number']),
      deleteFile: Module.cwrap('deleteFile', 'number', ['number']),
      cleanupFile: Module.cwrap('cleanupFile', '', ['number']),
      checkAvailable: Module.cwrap('checkAvailable', 'number', []),
      free3d: Module.cwrap('free_3d', 'number', []),
      returnTestFile: Module.cwrap('returnTestFile', 'number', []),
    };

    postMessage("loaded");
}

function checkFileExists(fileNum, fileName, elevation, type) {
    const metaPtr = api.returnFullFile(fileNum);

    //know it's of size 255
    const metaResultView = new Uint8Array(Module.HEAP8.buffer, metaPtr, 255);
    const metaResult = new Uint8Array(metaResultView);
    
    for (let i=0; i<fileName.length; i++) {
        if (metaResult[i] != fileName.charCodeAt(i)) {
            
            postMessage(
                {
                "data": {
                    "type":type,
                    "elevation":elevation,
                    "file":fileNum,
                    "fileName":fileName
                },
                "action":"didNotExist"
                }
            ); 
            
            return false;
        }
    }

    return true;
}

function returnStation(fileNum, action) {
    const ptr = api.station(fileNum);
    const resultView = new Uint8Array(Module.HEAP8.buffer, ptr, 4);
    let station = "";
    for (let i=0; i<resultView.length; i++) {
        station += String.fromCharCode(resultView[i]);
    }

    const vcp = api.vcp(fileNum);

    postMessage({
        action: action,
        data:{
            station:station,
            file: fileNum,
            vcp:vcp
        }
    })
}

function runTimeout(i) {
    setTimeout(function() {
        postMessage(i);
        if (i-- > 0) {
            runTimeout(i);
        }
    }, 1000);
}
onmessage = function(e) {
    
    let elevation = 0;
    const file = fileCount;
    const eventData = e.data;

    if (eventData.message === "deleteFile") {
        
        const fileToDelete = eventData.data.fileNum;
        api.deleteFile(fileToDelete);
        postMessage({
            action:"clearMap",
            data:{
                fileNum:fileToDelete,
                fileName:eventData.data.fileName
            }
        });
    }

    if (eventData.message === "initialize") {
        //set full file name for check
        const ptrTestFile = api.returnTestFile();

        //const bufViewTest = new Uint8Array(eventData.fileName.length);
        const bufViewTest = new Uint8Array(255);

        //need to fill in all 255 or do something to reset correctly
        for (let i=0; i<eventData.fileName.length; i++) {
            bufViewTest[i] = eventData.fileName.charCodeAt(i);
        }

        //place array in memory
        Module.HEAP8.set(bufViewTest, ptrTestFile);

        //first, check if there is space for it. If not
        //need to send message to socket that need to reprocess
        let available;
        if (testCount < 0) {
            available = -1;
        } else {
            available = api.checkAvailable();
        }

        //console.log("available", available);
        //const 
        //const 
        if (available === -1) {
           
            postMessage({
                action:"try_again",
                data:{
                    //file:fileNum,
                    fileName:eventData.fileName
                },
                buffer:e.data.buffer
            }, [e.data.buffer]);

            //don't proceed
            return;
        } else if (available === -2) {
            console.log("already loaded")
            postMessage({
                action:"noop",
                data:{
                    //file:fileNum,
                    fileName:eventData.fileName
                },
            })
            //don't proceed
            return;
        }

        //create 8 bit integer array
        const buffer = e.data.buffer;
       
        const uint8View = new Uint8Array(buffer);
       
        //pointer to where memory starts
        const ptr = api.create_buffer(uint8View.length);

        //place array in memory
        Module.HEAP8.set(uint8View, ptr);

        //call C function to do work with memory
        const fileNum = api.initialize(ptr, uint8View.length);

        if (fileNum < 0) {
            postMessage({
                action:"error",
                data:{
                    message:'The application cannot load more than 5 files. Remove a file by clicking the trashcan icon in the File View before loading another.',
                    header:'Too many files'
                }
            });
            return;
        }

        let first4;
        if (eventData.fileName.length >= 4) {
            first4 = eventData.fileName.substring(0,4);
        } else {
            first4 = "XXXX";
        }

        const ptrFile = api.returnFile(fileNum);

        const bufView = new Uint8Array(4);

        for (let i=0; i<4; i++) {
            bufView[i] = first4.charCodeAt(i);
        }

        //place array in memory
        Module.HEAP8.set(bufView, ptrFile);

        //full file name, not 4 char station code
        const ptrFullFile = api.returnFullFile(fileNum);

        const bufViewFull = new Uint8Array(eventData.fileName.length);

        for (let i=0; i<eventData.fileName.length; i++) {
            bufViewFull[i] = eventData.fileName.charCodeAt(i);
        }

        //place array in memory
        Module.HEAP8.set(bufViewFull, ptrFullFile);

        postMessage({
            action:"initialize",
            data:{
                file:fileNum,
                fileName:eventData.fileName
            }
        });

        //read file
        api.read(fileNum);

        //return station name
        returnStation(fileNum, "update");
        //console.log("after returnStation");

        let status = 1;
        let count = 0;
        while (status != 0 && status != -999 && count <=30) {
        
            status = api.advance(fileNum);
           
            if (status != -999) {
                printMetadata(elevation, fileNum, eventData.fileName);
                elevation++;
                count++;
            } 
        }
        //console.log("finished content");
        //another for case of archive2
        returnStation(fileNum, "archive2");
        contentFinished(fileNum, eventData.fileName);
    }

    if (eventData.message === "loadData") {
        // if (!checkFileExists(eventData.data.fileNum, eventData.data.fileName, eventData.data.idx, eventData.data.field)) {
        //     return;
        // }

        //special case for kdp
        if (eventData.data.field == 10) {
            //console.log("processing dkp");
            api.processKdp(eventData.data.fileNum, eventData.data.idx);
            api.createVertices(eventData.data.fileNum, eventData.data.idx, eventData.data.field);
        } else {
            //generate vertex arrays
            api.processElevationData(eventData.data.fileNum, eventData.data.idx, eventData.data.field);
            api.createVertices(eventData.data.fileNum, eventData.data.idx, eventData.data.field);
        }

        //retrieve arrays from memory
        getVertData(eventData.data.idx, eventData.data.fileNum, eventData.data.field, eventData.data.fileName);

        //free all data needed to create vertices
        api.cleanupFile(eventData.data.fileNum);
    }

    if (eventData.message === "loadVelocity") {
        if (!checkFileExists(eventData.data.fileNum, eventData.data.fileName,eventData.data.idx, 1)) {
            return;
        }
        //process radar then velocity
        api.processElevationData(eventData.data.fileNum, eventData.data.idx, 0);
        api.createVertices(eventData.data.fileNum, eventData.data.idx, 0);
        api.processElevationData(eventData.data.fileNum, eventData.data.idx, 1);
        api.createVertices(eventData.data.fileNum, eventData.data.idx, 1);
        getVertData(eventData.data.idx, eventData.data.fileNum, 1, eventData.data.fileName);
        //every process needs to be followed by getVertData so free_buffer can be called
        getVertData(eventData.data.idx, eventData.data.fileNum, 0, eventData.data.fileName);

        //free all data needed to create vertices
        api.cleanupFile(eventData.data.fileNum);
    }

    if (eventData.message === "dealiasVelocity") {
        // if (!checkFileExists(eventData.data.fileNum, eventData.data.fileName,eventData.data.idx, 255)) {
        //     return;
        // }
        //check if raw velocity processed yet
        //const isProcessed = api.returnIsProcessed(eventData.data.idx, eventData.data.fileNum, 1);
        //console.log(eventData);
        //if (!isProcessed) {
            //console.log("wasn't processed");
            api.processElevationData(eventData.data.fileNum, eventData.data.idx, 0);
            api.createVertices(eventData.data.fileNum, eventData.data.idx, 0);
            api.processElevationData(eventData.data.fileNum, eventData.data.idx, 1);
            api.createVertices(eventData.data.fileNum, eventData.data.idx, 1);
            getVertData(eventData.data.idx, eventData.data.fileNum, 1, eventData.data.fileName);
            //every process needs to be followed by getVertData so free_buffer can be called
            getVertData(eventData.data.idx, eventData.data.fileNum, 0, eventData.data.fileName);
        //}

        //dealias velocity
        //console.log("before dealias");
        api.dealiasVelocityData(eventData.data.fileNum, eventData.data.idx, 1);
        //console.log("after dealias");
        const override = api.separate(eventData.data.fileNum, eventData.data.idx, 1);
        if (override) {
            getVertData(eventData.data.idx, eventData.data.fileNum, 255, eventData.data.fileName, 1);
        } else {
            getVertData(eventData.data.idx, eventData.data.fileNum, 255, eventData.data.fileName);
        }

        //free all data needed to create vertices
        api.cleanupFile(eventData.data.fileNum);
        
    }

    if (eventData.message === "set3d") {
      
        const fileNum = eventData.data.selections[0].file;
        const scans = eventData.data.scans[fileNum].scans;
        const fileName = eventData.data.fileName;
       
        let array = [];
       
        for (let i=0; i<scans.length; i++) {
            //first lowest may not be closest in time
            if (scans[i].length > 1) {
                if (scans[i+1]) {
                    let currentTime = scans[i+1][0][0].date.getTime();
                   
                    let targetTimes = scans[i].map(d=>d[0].date.getTime());
                    let idx = closest(currentTime, targetTimes);
                    array.push(scans[i][idx][0].idx);
                } else {
                    array.push(scans[i][0][0].idx);
                } 
            } else {
                array.push(scans[i][0][0].idx);
            }
            
        }
        
        const view = Uint8Array.from(array);

        const ptr = api.setElevations3d(array.length, fileNum);

        Module.HEAP8.set(view, ptr);

        const ptrOut = api.setTexture3d(array.length, fileNum);

        //always use elevation 0?
        const scalePtrOut = api.returnScaleOffset(0, fileNum);
        const scaleResultView = new Uint8Array(Module.HEAP8.buffer, scalePtrOut, 24);
        const scaleResult = new Uint8Array(scaleResultView);
    
        const dataView = new DataView(scaleResult.buffer);
        const scale = dataView.getInt32(0, true);
        const offset = dataView.getInt32(4, true);
        const bin1 = dataView.getFloat32(8, true);
        const binMax = dataView.getFloat32(12, true);
        let ngates = dataView.getInt32(16, true);
        let gate_size = dataView.getFloat32(20, true);

        //make adjustment
        if (ngates > 2048) {
            gate_size = gate_size * 2;
            ngates = Math.floor(ngates/2);
        }

        const charResultView = new Uint8Array(Module.HEAP8.buffer, ptrOut, array.length*360*ngates);
        const charResult = new Uint8Array(charResultView);

        //free 3d texture
        api.free3d(fileNum);
       
        postMessage(
            {
            "data": {
                "float":charResult,
                "size":[ngates, 360, array.length],
                "scale": scale,
                "offset": offset,
                "bin1":bin1,
                "binMax":binMax,
                "ngates":ngates,
                "gate_size":gate_size,
                "fileNum":fileNum,
                "fileName":fileName,
                "type":eventData.data.field,
                "elevation":eventData.data.idx
            },
            "action":"loadTexture"
            }, 
            [charResult.buffer]
        ); 
    }

}