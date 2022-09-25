const https = require('https');
const fs = require('fs');
const { exec } = require("child_process");

function removeFile(fileName) {
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }
}
function downloadFile(url, fileName, cb) {
    removeFile(fileName);
    const file = fs.createWriteStream(fileName);
    const request = https.get(url, function (response) {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            cb(fileName);
        });
    });
}

const satNum = '16'; // 16, 17, or 18
const channel = '13'; // 01 - 16
const sector = 'conus'
/*
alaska (no goes 16)
conus
fulldisk
hawaii (no goes 16)
mesoscale-1
mesoscale-2
puertorico (only goes 16)
*/

function noGoesError() {
    throw new Error(`GOES-${satNum} is not avaliable for Sector ${sector.toUpperCase()}`);
}
if (sector == 'alaska' && satNum == 16) {
    noGoesError();
} else if (sector == 'hawaii' && satNum == 16) {
    noGoesError();
} else if (sector == 'puertorico' && satNum != 16) {
    noGoesError();
}

console.log(' ');
console.log(`GOES-${satNum}`);
console.log(`Channel ${channel}`);
console.log(`Sector ${sector.toUpperCase()}`);
console.log(' ');

var goesImageUrl = `https://mesonet.agron.iastate.edu/data/gis/images/GOES/${sector}/channel${channel}/GOES-${satNum}_C${channel}.png`;
downloadFile(goesImageUrl, 'initialImage.png', function(imageFileName) {

    var goesWldFileUrl = `https://mesonet.agron.iastate.edu/data/gis/images/GOES/${sector}/channel${channel}/GOES-${satNum}_C${channel}.wld`;
    downloadFile(goesWldFileUrl, 'initialImage.wld', function(wldFileName) {

        var goesJsonFileUrl = `https://mesonet.agron.iastate.edu/data/gis/images/GOES/${sector}/channel${channel}/GOES-${satNum}_C${channel}.json`;
        downloadFile(goesJsonFileUrl, 'initialImage.json', function(jsonFileName) {
            https.get(goesJsonFileUrl, function (res) {
                var body = "";
                res.on("data", (chunk) => {
                    body += chunk;
                });
                res.on("end", () => {
                    var json = JSON.parse(body);
                    var proj4str = json.meta.proj4str;

                    removeFile('projectedImage.png');
                    removeFile('projectedImage.png.aux.xml');
                    var command = `
                        gdalwarp \
                        -s_srs "${proj4str}" \
                        -t_srs EPSG:3857 ${imageFileName} \
                        -srcnodata 0 -dstnodata 0 \
                        projectedImage.png
                    `;
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        console.log(`stdout: ${stdout}`);
                    });
                });
            })
        });

    });

});