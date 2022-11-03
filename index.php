<?php

// https://stackoverflow.com/a/25661403/18758797
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");

// https://stackoverflow.com/a/46890889
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// https://stackoverflow.com/a/11424665
$milliseconds = floor(microtime(true) * 1000);
$page = file_get_contents('https://attic-radar.herokuapp.com/index.html'); // ./index.html
echo $page;

/*
* use this script as such:
* http://127.0.0.1:8888/?https://gis.stackexchange.com/questions/435128/mapbox-gl-js-equivalent-to-leaflet-layergroup
* adding your url after the host and a ?
*/

?>