# NexradJS

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
git clone https://github.com/SteepAtticStairs/NexradJS.git
cd NexradJS
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

**A live demo of this webpage can be found here:
<br>
https://steepatticstairs.github.io/NexradJS/**
<br><br><br>
You can add some parameters to the URL to make the app easier to use / bookmark. You can add 
* `#development`
* `#station=ICAO`
* `#tideStation=TIDESTATIONID`

The first one is to allow for extra development features (this is mainly for my own use, I wouldn't recommend trying this). The second one is to set the app's initial station view. (The default will likely be either `KLWX` or `KMHX`, because those are the stations I use the most.)  The third one is to set the default tide station. Here are some examples:
<br>

Sets the app's initial station to `KHGX`:
```
https://steepatticstairs.github.io/NexradJS/#station=KHGX
```
Sets the app's initial tide station to `8724698` (Loggerhead Key):
```
https://steepatticstairs.github.io/NexradJS/#tideStation=8724698
```
Sets the app into development mode:
```
https://steepatticstairs.github.io/NexradJS/#development
```
Sets the app's initial station to `KHGX` AND into development mode:
```
https://steepatticstairs.github.io/NexradJS/#station=KHGX&#development
```
Notice how in the last example, the two parameters are separated by an ampersand (`&`) and still require a hash (`#`) before each parameter.
