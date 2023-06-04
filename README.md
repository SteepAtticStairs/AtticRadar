# AtticRadar

A clean, simple, but powerful weather toolkit for the web browser. Includes NEXRAD parsing and plotting, doppler velocity dealiasing, weather alerts, real time lightning data, METAR station data, and much more.

## Website

You can find the app live here:<br>
<b>[https://steepatticstairs.net/AtticRadar](https://steepatticstairs.net/AtticRadar)</b>

## Credits

The libraries that parse NEXRAD files client-side were provided by [netbymatt](https://github.com/netbymatt). This app wouldn't exist without his hard work on these projects.

Inspiration for the app to be created, and some of the code for WebGL rendering, came from [QuadWeather's](https://twitter.com/quadweather) radar app, which can be found here: [https://radar.quadweather.com](https://radar.quadweather.com)

Virtually all of the code for the doppler dealiasing algorithm comes from [pyart](https://github.com/ARM-DOE/pyart). I used their [region-based](https://github.com/ARM-DOE/pyart/blob/main/pyart/correct/region_dealias.py) dealiasing algorithm. I go into more depth about the process behind this in the JavaScript dealiasing file in this project.

## Setup
```
git clone https://github.com/SteepAtticStairs/AtticRadar.git
cd AtticRadar
npm install
npm run build
php -S 127.0.0.1:8080
```
then you can go to `localhost:8080` or `127.0.0.1:8080` to view the website.

(I used to use `python3 -m http.server 8080`, but it would frequently crash or freeze, which became extremely irritating. Although the php server functionality is really meant for php development, I have found that it works fine for this app, and it doesn't break like python's local server does.)

You can also run
```
npm run serve
```
to use `watchify` (a part of Browserify) to auto-bundle the project every time you make a change.

## History
* `Sep 10 2022` - Renamed this project from "NexradJS" to "AtticRadar"

<!-- # AtticRadar

**FULL CREDIT GOES TO [netbymatt](https://github.com/netbymatt) for pretty much all of this project.**

He provided **FOUR** libraries:<br>[nexrad-level-2-data](https://github.com/netbymatt/nexrad-level-2-data)<br>[nexrad-level-2-plot](https://github.com/netbymatt/nexrad-level-2-plot)<br>[nexrad-level-3-data](https://github.com/netbymatt/nexrad-level-3-data)<br>[nexrad-level-3-plot](https://github.com/netbymatt/nexrad-level-3-plot)<br>that allowed for the development of this project. I only take credit for porting these Node apps to the browser with [Browserify](https://browserify.org).

<br>

**Pretty much all of the code that plots the data to the map using WebGL came from [QuadWeather's Radar Demo page](https://quadweather.com/radar-demo)**. Please go share him some love [on Twitter](https://twitter.com/quadweather).

His main radar page (which inspired this entire repository to be made) can be found here: [https://radar.quadweather.com](https://radar.quadweather.com)

<br><br>

In summary, the majority of this app was not made by me. I wanted to give the credit that was due to the people that made the frameworks of this app, because this website would not exist today if it weren't for the libraries / code snippets they provided. Here are their links again:

[netbymatt](https://github.com/netbymatt) (link to GitHub profile)<br>
[QuadWeather](https://twitter.com/quadweather) (link to Twitter profile)

# Setup
```
git clone https://github.com/SteepAtticStairs/AtticRadar.git
cd AtticRadar
npm install
npm run build
php -S 127.0.0.1:8080
```
then you can go to `localhost:8080` or `127.0.0.1:8080` to view the website.

(I used to use `python3 -m http.server 8080`, but it would frequently crash or freeze, which became extremely irritating. Although the php server functionality is really meant for php development, I have found that it works fine for this app, and it doesn't break like python's local server does.)

You can also run
```
npm run serve
```
to use `watchify` (a part of Browserify) to auto-bundle the project every time you make a change.

# Notes

**The website can be found live here:
<br>
https://steepatticstairs.github.io/AtticRadar/**
<br><br><br>
You can add some parameters to the URL to make the app easier to use / bookmark. You can add 
* `#station=ICAO`
* `#tideStation=TIDESTATIONID`

The first one is to set the app's initial station. This is the station the map would load radar products for / load METAR stations around, if there isn't a selected station. (The default will likely be either `KLWX` or `KMHX`, because those are the stations I use the most.)  The second one is to set the default tide station. Here are some examples:
<br>

Sets the app's initial station to `KHGX`:
```
https://steepatticstairs.github.io/AtticRadar/#station=KHGX
```
Sets the app's initial tide station to `8724698` (Loggerhead Key):
```
https://steepatticstairs.github.io/AtticRadar/#tideStation=8724698
```
Sets the app's initial station to `KHGX` AND sets the tide station to `8724698`:
```
https://steepatticstairs.github.io/AtticRadar/#station=KHGX&#tideStation=8724698
```
Notice how in the last example, the two parameters are separated by an ampersand (`&`) and still require a hash (`#`) before each parameter.


# History
* `Sep 10 2022` - Renamed this project from "NexradJS" to "AtticRadar" -->
