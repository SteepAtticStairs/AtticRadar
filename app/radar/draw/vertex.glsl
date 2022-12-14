uniform mat4 u_matrix;
attribute vec2 aPosition;
uniform vec2 radarLatLng;
attribute float aColor;
varying float color;

float PI = 3.141592654;

float atan2(float x, float y) {
    return atan(x / y);
}

vec2 calcLngLat(float az, float distance) {
    // convert distance from meters to kilometers
    distance = distance * 1000.0;

    // Define the starting latitude and longitude
    float lat1 = radarLatLng.x;
    float lon1 = radarLatLng.y;

    // Convert the azimuth and starting coordinates to radians
    float azRad = az * (PI / 180.0);
    float lat1Rad = lat1 * (PI / 180.0);
    float lon1Rad = lon1 * (PI / 180.0);

    // the earth radius in meters
    float earthRadius = 6378137.0;

    // Calculate the destination latitude and longitude in radians
    float lat2Rad = asin(sin(lat1Rad) * cos(distance / earthRadius) + cos(lat1Rad) * sin(distance / earthRadius) * cos(azRad));
    float lon2Rad = lon1Rad + atan2(sin(azRad) * sin(distance / earthRadius) * cos(lat1Rad), cos(distance / earthRadius) - sin(lat1Rad) * sin(lat2Rad));

    // Convert the destination latitude and longitude from radians to degrees
    float lat2 = lat2Rad * (180.0 / PI);
    float lon2 = lon2Rad * (180.0 / PI);

    float x = (180.0 + lon2) / 360.0;
    float y = (180.0 - (180.0 / PI * log(tan(PI / 4.0 + lat2 * PI / 360.0)))) / 360.0;

    return vec2(x, y);
}

void main() {
    float azimuth = float(aPosition.x);
    float distance = float(aPosition.y);
    vec2 mercatorCoords = calcLngLat(azimuth, distance);

    gl_Position = u_matrix * vec4(mercatorCoords.x, mercatorCoords.y, 0.0, 1.0);
    color = aColor;
}