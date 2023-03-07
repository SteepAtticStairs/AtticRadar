uniform mat4 u_matrix;
// uniform vec4 u_eye_high;
// uniform vec4 u_eye_low;
attribute vec2 aPosition;
uniform vec2 radarLatLng;
attribute float aColor;
varying float color;

float PI = 3.141592654;

vec2 ds_set(float a) {
    vec2 z;
    z.x = a;
    z.y = 0.0;
    return z;
}

float add(float a, float b) { return (b != 0.) ? a + b : a; }
float sub(float a, float b) { return (b != 0.) ? a - b : a; }
float mul(float a, float b) { return (b != 1.) ? a * b : a; }
float div(float a, float b) { return (b != 1.) ? a / b : a; }
float fma(float a, float b, float c) { return a * b + c; }

vec2 fastTwoSum(float a, float b) {
    float s = add(a, b);
    return vec2(s, sub(b, sub(s, a)));
}

vec2 twoSum(float a, float b) {
    float s = add(a, b);
    float b1 = sub(s, a);
    return vec2(s, add(sub(b, b1), sub(a, sub(s, b1))));
}

vec2 twoProd(float a, float b) {
    float ab = mul(a, b);
    return vec2(ab, fma(a, b, -ab));
}

vec2 add22(vec2 X, vec2 Y) {
    vec2 S = twoSum(X[0], Y[0]);
    vec2 T = twoSum(X[1], Y[1]);
    vec2 V = fastTwoSum(S[0], add(S[1], T[0]));
    return fastTwoSum(V[0], add(T[1], V[1]));
}

vec2 sub22(vec2 X, vec2 Y) {
    vec2 S = twoSum(X[0], -Y[0]);
    vec2 T = twoSum(X[1], -Y[1]);
    vec2 V = fastTwoSum(S[0], add(S[1], T[0]));
    return fastTwoSum(V[0], add(T[1], V[1]));
}

vec2 mul22(vec2 X, vec2 Y) {
    vec2 S = twoProd(X[0], Y[0]);
    float t = mul(X[0], Y[1]);
    float c = fma(X[1], Y[0], mul(X[0], Y[1]));
    return fastTwoSum(S[0], add(S[1], c));
}

vec2 div22(vec2 X, vec2 Y) {
    float s = div(X[0], Y[0]);
    vec2 T = twoProd(s, Y[0]);
    float c = add(sub(sub(X[0], T[0]), T[1]), X[1]);
    return fastTwoSum(s, div(sub(c, mul(s, Y[1])), Y[0]));
}

float atan2(float x, float y) {
    return atan(x / y);
}

float toRad(float degree) {
    return degree * (PI / 180.0);
}
float toDeg(float radian) {
    return radian * (180.0 / PI);
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

// https://github.com/TankofVines/node-vincenty
vec2 destVincenty(float az, float distance) {
    // convert azimuth to bearing
    float brng = az;
    // convert distance from meters to kilometers
    float dist = distance * 1000.0;
    float lat1 = radarLatLng.x;
    float lon1 = radarLatLng.y;

    /*
    * Define Earth's ellipsoidal constants (WGS-84 ellipsoid)
    */
    // length of semi-major axis of the ellipsoid (radius at equator) - meters
    float a = 6378137.0;
    // flattening of the ellipsoid
    float f = 1.0 / 298.257223563; // (a − b) / a
    // length of semi-minor axis of the ellipsoid (radius at the poles) - meters
    float b = 6356752.3142; // (1 − ƒ) * a

    float s = dist;
    float alpha1 = toRad(brng);
    float sinAlpha1 = sin(alpha1);
    float cosAlpha1 = cos(alpha1);

    float tanU1 = (1.0 - f) * tan(toRad(lat1));
    float cosU1 = 1.0 / sqrt((1.0 + tanU1 * tanU1));
    float sinU1 = tanU1 * cosU1;
    float sigma1 = atan2(tanU1, cosAlpha1);
    float sinAlpha = cosU1 * sinAlpha1;
    float cosSqAlpha = 1.0 - sinAlpha * sinAlpha;
    float uSq = cosSqAlpha * (a * a - b * b) / (b * b);
    float A = 1.0 + uSq / 16384.0 * (4096.0 + uSq * (-768.0 + uSq * (320.0 - 175.0 * uSq)));
    float B = uSq / 1024.0 * (256.0 + uSq * (-128.0 + uSq * (74.0 - 47.0 * uSq)));

    // float x = 0.0;
    // for (int i = 0; i < 100; i++) {
    //     x = x + 1.0;
    //     if (x == 10.0) {
    //         break;
    //     }
    // }

    float sigma = s / (b * A);
    float sigmaP = 2.0 * PI;

    float cos2SigmaM;
    float sinSigma;
    float cosSigma;
    float deltaSigma;
    // 100 checks should be enough
    for (int i = 0; i < 100; i++) {
        cos2SigmaM = cos(2.0 * sigma1 + sigma);
        sinSigma = sin(sigma);
        cosSigma = cos(sigma);
        deltaSigma = B * sinSigma * (cos2SigmaM + B / 4.0 * (cosSigma * (-1.0 + 2.0 * cos2SigmaM * cos2SigmaM) -
            B / 6.0 * cos2SigmaM * (-3.0 + 4.0 * sinSigma * sinSigma) * (-3.0 + 4.0 * cos2SigmaM * cos2SigmaM)));
        sigmaP = sigma;
        sigma = s / (b * A) + deltaSigma;

        if (abs(sigma - sigmaP) > 1e-12) {
            break;
        }
    }

    float tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
    float lat2 = atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
        (1.0 - f) * sqrt(sinAlpha * sinAlpha + tmp * tmp));
    float lambda = atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);
    float C = f / 16.0 * cosSqAlpha * (4.0 + f * (4.0 - 3.0 * cosSqAlpha));
    float L = lambda - (1.0 - C) * f * sinAlpha *
        (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1.0 + 2.0 * cos2SigmaM * cos2SigmaM)));
    float lon2 = mod((toRad(lon1) + L + 3.0 * PI), (2.0 * PI) - PI);  // normalise to -180...+180

    // float revAz = atan2(sinAlpha, -tmp);  // final bearing, if required
    //float result = { lat: toDeg(lat2), lon: toDeg(lon2), finalBearing: toDeg(revAz) };

    float x = (toDeg(lon2)) / 360.0;
    float y = (180.0 - (180.0 / PI * log(tan(PI / 4.0 + toDeg(lat2) * PI / 360.0)))) / 360.0;

    return vec2(x, y);
}

void main() {
    // float azimuth = float(aPosition.x);
    // float distance = float(aPosition.y);
    // vec2 mercatorCoords = destVincenty(azimuth, distance);
    // vec4 coords = vec4(
    //     mercatorCoords.x,
    //     mercatorCoords.y,
    //     ds_sub(ds_set(mercatorCoords.x), ds_set(mercatorCoords.x)).x,
    //     ds_sub(ds_set(mercatorCoords.y), ds_set(mercatorCoords.y)).x
    // );

    // float x = div22((
    //     add22(add22(
    //     mul22(twoSum(u_high_matrix[0][0], u_low_matrix[0][0]), ds_set(mercatorCoords.x)),
    //     mul22(twoSum(u_high_matrix[1][0], u_low_matrix[1][0]), ds_set(mercatorCoords.y))),
    //     mul22(twoSum(u_high_matrix[3][0], u_low_matrix[3][0]), ds_set(1.0)))
    // ), (
    //     add22(add22(
    //     mul22(twoSum(u_high_matrix[0][3], u_low_matrix[0][3]), ds_set(mercatorCoords.x)),
    //     mul22(twoSum(u_high_matrix[1][3], u_low_matrix[1][3]), ds_set(mercatorCoords.y))),
    //     mul22(twoSum(u_high_matrix[3][3], u_low_matrix[3][3]), ds_set(1.0)))
    // )).x;
    // float y = div22((
    //     add22(add22(
    //     mul22(twoSum(u_high_matrix[0][1], u_low_matrix[0][1]), ds_set(mercatorCoords.x)),
    //     mul22(twoSum(u_high_matrix[1][1], u_low_matrix[1][1]), ds_set(mercatorCoords.y))),
    //     mul22(twoSum(u_high_matrix[3][1], u_low_matrix[3][1]), ds_set(1.0)))
    // ), (
    //     add22(add22(
    //     mul22(twoSum(u_high_matrix[0][3], u_low_matrix[0][3]), ds_set(mercatorCoords.x)),
    //     mul22(twoSum(u_high_matrix[1][3], u_low_matrix[1][3]), ds_set(mercatorCoords.y))),
    //     mul22(twoSum(u_high_matrix[3][3], u_low_matrix[3][3]), ds_set(1.0)))
    // )).x;

    gl_Position = u_matrix * vec4(aPosition.x, aPosition.y, 0.0, 1.0);
    // gl_Position = vec4(vec3(coords.x, coords.y, 0.0) - u_eye_high.xyz, 0.0);
    // gl_Position += vec4(vec3(coords.z, coords.w, 0.0) - u_eye_low.xyz, 0.0);
    // gl_Position = u_matrix * gl_Position;
    // gl_Position.w += u_eye_high.w;
    color = aColor;
}