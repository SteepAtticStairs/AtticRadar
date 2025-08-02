function dest_vincenty(start, distance, bearing) {
    const a = 6378137.0;
    const f = 1 / 298.257223563;
    const b = a * (1 - f);
    const one_minus_f = 1 - f;

    if (distance === 0) {
        return [start.lng, start.lat];
    }

    const to_rad = deg => deg * Math.PI / 180;
    const to_deg = rad => rad * 180 / Math.PI;

    const φ1 = to_rad(start.lat);
    const λ1 = to_rad(start.lng);
    const α1 = to_rad(bearing);

    const sinα1 = Math.sin(α1), cosα1 = Math.cos(α1);

    const tanU1 = one_minus_f * Math.tan(φ1);
    const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
    const sinU1 = tanU1 * cosU1;

    const σ1 = Math.atan2(tanU1, cosα1);
    const sinα = cosU1 * sinα1;
    const cosSqα = 1 - sinα * sinα;

    const uSq = cosSqα * (a * a - b * b) / (b * b);
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

    const sOverBA = distance / (b * A);
    let σ = sOverBA + (f / 6.0) * sinα1 * tanU1 * sOverBA * sOverBA;

    const TOL = 3.0 * 1e-6;
    const MAX_ITER = 6;
    let sinσ, cosσ, cos2σm, Δσ;

    for (let i = 0; i < MAX_ITER; i++) {
        sinσ = Math.sin(σ);
        cosσ = Math.cos(σ);
        cos2σm = Math.cos(2 * σ1 + σ);

        const temp1 = cosσ * (-1 + 2 * cos2σm * cos2σm);
        const temp2 = cos2σm * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σm * cos2σm);
        Δσ = B * sinσ * (cos2σm + B / 4 * (temp1 - B / 6 * temp2));

        const sin2σm = Math.sin(2 * σ1 + σ);
        
        const dTemp1Dσ = -sinσ * (-1 + 2 * cos2σm * cos2σm) + cosσ * (-4 * cos2σm * sin2σm);
        const dTemp2Dσ = -sin2σm * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σm * cos2σm)
            + cos2σm * (8 * sinσ * cosσ) * (-3 + 4 * cos2σm * cos2σm)
            + cos2σm * (-3 + 4 * sinσ * sinσ) * (-8 * cos2σm * sin2σm);

        const dΔσDσ = B * cosσ * (cos2σm + B / 4 * (temp1 - B / 6 * temp2))
            + B * sinσ * (-sin2σm + B / 4 * (dTemp1Dσ - B / 6 * dTemp2Dσ));

        const fσ = σ - distance / (b * A) - Δσ;
        const fPrimeσ = 1 - dΔσDσ;

        const ΔσNR = fσ / fPrimeσ;
        const σNew = σ - ΔσNR;

        if (Math.abs(ΔσNR) <= TOL) {
            σ = σNew;
            break;
        }

        σ = σNew;
    }

    sinσ = Math.sin(σ);
    cosσ = Math.cos(σ);
    cos2σm = Math.cos(2 * σ1 + σ);

    const x = sinU1 * sinσ - cosU1 * cosσ * cosα1;
    const φ2 = Math.atan2(
        sinU1 * cosσ + cosU1 * sinσ * cosα1,
        one_minus_f * Math.sqrt(sinα * sinα + x * x)
    );

    const λ = Math.atan2(
        sinσ * sinα1,
        cosU1 * cosσ - sinU1 * sinσ * cosα1
    );

    const C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
    const L = λ - one_minus_f * f * sinα * (
        σ + C * sinσ * (cos2σm + C * cosσ * (-1 + 2 * cos2σm * cos2σm))
    );

    const lat2 = to_deg(φ2);
    const lng2 = to_deg(λ1 + L);

    return [lng2, lat2];
}

module.exports = dest_vincenty;
