# AtticRadar

A clean, simple, but powerful weather toolkit for the web browser. Includes NEXRAD parsing and plotting, doppler velocity dealiasing, weather alerts, real time lightning data, METAR station data, and much more.

## Website

You can find the app live here:<br>
<b>[https://steepatticstairs.net/AtticRadar](https://steepatticstairs.net/AtticRadar)</b>

## Credits

The libraries that parse NEXRAD files client-side were provided by two python packages, which can be found here:
- Level 2 parsing comes from [nexrad_level2.py](https://github.com/ARM-DOE/pyart/blob/main/pyart/io/nexrad_level2.py), ported to JavaScript from [pyart](https://github.com/ARM-DOE/pyart/)
- Level 3 parsing comes from [nexrad.py](https://github.com/Unidata/MetPy/blob/main/src/metpy/io/nexrad.py), ported to JavaScript from [MetPy](https://github.com/Unidata/MetPy/)

Inspiration for the app to be created, and some of the code for WebGL rendering, came from [QuadWeather's](https://twitter.com/quadweather) radar app, which can be found here: [https://radar.quadweather.com](https://radar.quadweather.com)

Virtually all of the code for the doppler dealiasing algorithm comes from [pyart](https://github.com/ARM-DOE/pyart). I used their [region-based](https://github.com/ARM-DOE/pyart/blob/main/pyart/correct/region_dealias.py) dealiasing algorithm. I go into more depth about the process behind this in the JavaScript dealiasing file in this project.

## Setup
```
git clone https://github.com/SteepAtticStairs/AtticRadar.git
cd AtticRadar
npm install
npm run build
php -S 127.0.0.1:3333
```
then you can go to `localhost:3333` or `127.0.0.1:3333` to view the website.

Using PHP as the local server was intentional, because of development that I do of server-side code that affects AtticRadar.

Browserify is used in AtticRadar to implement a moduling system. `npm run build` bundles the project with Browserify to be used in distribution.

You can also run
```
npm run serve
```
to use `watchify` (another project by Browserify) to auto-bundle the project every time you make a change.

## History
* `Jul 13 2022` - On that morning, I stumbled across QuadWeather's radar app, which was still in development, while browsing Twitter. This was the initial inspiration to create AtticRadar (called "NexradJS" at the time).
* `Sep 10 2022` - Renamed this project from "NexradJS" to "AtticRadar"
