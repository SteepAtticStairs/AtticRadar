precision highp float;
uniform vec2 minmax;
varying float color;

vec4 EncodeFloatRGBA(float v) {
    vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * v;
    enc = fract(enc);
    enc -= enc.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);
    return enc;
}

void main() {
    vec4 encoded;

    // get on 0-1 scale
    float calcolor = min(1.0, max((color - minmax.x) / (minmax.y - minmax.x), 0.0));

    // if upper end, need this check because [0,1)
    if (abs(calcolor - 1.0) < 0.00001) {
        encoded = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
        encoded = EncodeFloatRGBA(calcolor);
        encoded.a = 1.0;
    }

    gl_FragColor = encoded;
}