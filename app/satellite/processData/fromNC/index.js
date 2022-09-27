const fs = require('fs');
const { exec } = require("child_process");

/*
https://gist.github.com/spestana/876fcd2ca1fbac441f28243bdc406c22
https://edc.occ-data.org/goes16/getdata/ (this gives product abbreviations)
*/
// gdal_translate -ot float32 -unscale -CO COMPRESS=deflate NETCDF:"goes16-c13.nc":Rad ugly.tif
// gdal_translate -ot Byte -of png -scale 0 650 0 255 ugly.tif bw.png
// gdalwarp -t_srs EPSG:4326 -dstnodata -999.0 bw.png bwProj.png
// gdaldem color-relief -alpha bwProj.png color.txt colored.png

function removeFile(fileName) {
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }
}
function execCmd(command, cb) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            cb();
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            cb();
            return;
        }
        console.log(`stdout: ${stdout}`);
        cb();
    });
}

var args = process.argv;

if (args.includes('changeColor')) {
    execCmd(`gdaldem color-relief -alpha bwProj.png color.txt colored.png`, function(){});
} else {
    removeFile('bw.png');
    removeFile('bw.png.aux.xml');
    removeFile('bwProj.png');
    removeFile('bwProj.png.aux.xml');
    removeFile('colored.png');
    removeFile('colored.png.aux.xml');
    removeFile('ugly.tif');

    execCmd(`gdal_translate -unscale NETCDF:"goes16-c13.nc":Rad ugly.tif`, function() {
    execCmd(`gdal_translate -ot Byte -of png ugly.tif bw.png`, function() {
    execCmd(`gdalwarp -t_srs EPSG:4326 -dstnodata -999.0 bw.png bwProj.png`, function() {
    execCmd(`gdaldem color-relief -alpha bwProj.png IR4AVHRR6.cpt colored.png`, function(){});

    //execCmd(`gdal_translate -ot float32 -unscale -CO COMPRESS=deflate NETCDF:"goes16-c13.nc":Rad ugly.tif`, function() {
    //execCmd(`gdal_translate -ot Byte -of png -scale 0 650 0 255 ugly.tif bw.png`, function() {
    //execCmd(`gdalwarp -t_srs EPSG:4326 -dstnodata -999.0 bw.png bwProj.png`, function() {
    //execCmd(`gdaldem color-relief -alpha bwProj.png color.txt colored.png`, function(){});
    });});});
}