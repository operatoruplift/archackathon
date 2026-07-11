/**
 * Generated crystal artwork for the masked-card sections. Shipping vector
 * art as data URIs keeps the hero self-hosted (no external image CDN can
 * take the demo down mid-judging) and weighs a few KB instead of megabytes.
 *
 * Canvas is 4200×1600 so the image always overflows the section width and
 * the focal-point math in MaskedCard has room to pan.
 */

const W = 4200;
const H = 1600;

function diamond(cx: number, cy: number, r: number, fill: string, opacity: number): string {
  return `<polygon points="${cx},${cy - r} ${cx + r * 0.7},${cy} ${cx},${cy + r} ${cx - r * 0.7},${cy}" fill="${fill}" opacity="${opacity}"/>`;
}

function sparkle(cx: number, cy: number, r: number, opacity: number): string {
  return `<path d="M${cx} ${cy - r} L${cx + r * 0.22} ${cy - r * 0.22} L${cx + r} ${cy} L${cx + r * 0.22} ${cy + r * 0.22} L${cx} ${cy + r} L${cx - r * 0.22} ${cy + r * 0.22} L${cx - r} ${cy} L${cx - r * 0.22} ${cy - r * 0.22} Z" fill="#FFFFFF" opacity="${opacity}"/>`;
}

const DEFS = `<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#F4EEE1"/><stop offset="0.26" stop-color="#E7E0CE"/>
<stop offset="0.38" stop-color="#C2D5D4"/><stop offset="0.52" stop-color="#4E8496"/>
<stop offset="0.68" stop-color="#14556B"/><stop offset="1" stop-color="#0A2833"/>
</linearGradient>
<linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#0F3D4D"/><stop offset="0.45" stop-color="#14556B"/>
<stop offset="0.78" stop-color="#1B2C55"/><stop offset="1" stop-color="#131A3A"/>
</linearGradient>
<linearGradient id="gcyan" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#8FE9E2"/><stop offset="1" stop-color="#1E7D96"/>
</linearGradient>
<linearGradient id="gviolet" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#B3A0FF"/><stop offset="1" stop-color="#5A3FD6"/>
</linearGradient>
<linearGradient id="ggold" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#F0CD82"/><stop offset="1" stop-color="#C9972F"/>
</linearGradient>
<radialGradient id="glowc" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#3EC9C0" stop-opacity="0.5"/><stop offset="1" stop-color="#3EC9C0" stop-opacity="0"/>
</radialGradient>
<radialGradient id="glowv" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#7C5CFF" stop-opacity="0.42"/><stop offset="1" stop-color="#7C5CFF" stop-opacity="0"/>
</radialGradient>
</defs>`;

function encode(svg: string): string {
  // encodeURIComponent leaves ( ) ' unescaped, all of which can terminate a
  // CSS url() token — encode them too so the artwork survives inline styles.
  const uri = encodeURIComponent(svg)
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/'/g, '%27');
  return `data:image/svg+xml,${uri}`;
}

/** Section 1: dawn gradient, large crystal cluster on the focal right. */
export const HERO_ART = encode(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}` +
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
    `<circle cx="3050" cy="1000" r="760" fill="url(#glowc)"/>` +
    `<circle cx="2450" cy="1250" r="480" fill="url(#glowv)"/>` +
    // main gem
    `<polygon points="3060,430 3280,680 3195,1440 2930,1440 2840,700" fill="url(#gcyan)" opacity="0.95"/>` +
    `<polygon points="3060,430 3195,1440 2930,1440" fill="#FFFFFF" opacity="0.12"/>` +
    `<polygon points="3060,430 3280,680 3195,1440" fill="#0C2F3A" opacity="0.18"/>` +
    // violet companion
    `<polygon points="3400,820 3555,990 3495,1460 3300,1460 3280,970" fill="url(#gviolet)" opacity="0.88"/>` +
    `<polygon points="3400,820 3495,1460 3300,1460" fill="#FFFFFF" opacity="0.08"/>` +
    // gold companion
    `<polygon points="2660,950 2775,1070 2725,1430 2565,1430 2545,1075" fill="url(#ggold)" opacity="0.9"/>` +
    `<polygon points="2660,950 2725,1430 2565,1430" fill="#FFFFFF" opacity="0.1"/>` +
    // floating shards across the pan range
    diamond(2380, 620, 34, 'url(#gcyan)', 0.75) +
    diamond(3660, 600, 26, 'url(#gviolet)', 0.65) +
    diamond(2900, 300, 20, 'url(#ggold)', 0.8) +
    diamond(3900, 1120, 30, 'url(#gcyan)', 0.55) +
    diamond(1500, 900, 26, 'url(#gcyan)', 0.4) +
    diamond(900, 1150, 32, 'url(#gviolet)', 0.35) +
    diamond(1950, 1250, 22, 'url(#ggold)', 0.45) +
    sparkle(3210, 520, 26, 0.7) +
    sparkle(2760, 820, 18, 0.55) +
    sparkle(3520, 760, 15, 0.6) +
    sparkle(2280, 1050, 14, 0.4) +
    `</svg>`,
);

/** Section 2: night gradient, scattered constellation of crystals. */
export const GALLERY_ART = encode(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}` +
    `<rect width="${W}" height="${H}" fill="url(#night)"/>` +
    `<circle cx="2650" cy="520" r="620" fill="url(#glowv)"/>` +
    `<circle cx="3500" cy="1200" r="640" fill="url(#glowc)"/>` +
    `<circle cx="1400" cy="1000" r="500" fill="url(#glowc)"/>` +
    `<polygon points="3070,640 3225,810 3165,1330 2975,1330 2955,800" fill="url(#gviolet)" opacity="0.8"/>` +
    `<polygon points="3070,640 3165,1330 2975,1330" fill="#FFFFFF" opacity="0.08"/>` +
    `<polygon points="2440,900 2560,1030 2510,1400 2360,1400 2340,1035" fill="url(#gcyan)" opacity="0.7"/>` +
    diamond(1450, 550, 36, 'url(#gcyan)', 0.6) +
    diamond(1850, 1150, 28, 'url(#gviolet)', 0.55) +
    diamond(3650, 480, 30, 'url(#ggold)', 0.6) +
    diamond(3900, 950, 24, 'url(#gcyan)', 0.5) +
    diamond(2150, 420, 22, 'url(#ggold)', 0.5) +
    diamond(800, 700, 30, 'url(#gviolet)', 0.4) +
    diamond(3300, 350, 18, 'url(#gcyan)', 0.55) +
    sparkle(2850, 480, 20, 0.6) +
    sparkle(3450, 820, 16, 0.5) +
    sparkle(1650, 850, 18, 0.45) +
    sparkle(2300, 1250, 14, 0.4) +
    sparkle(3850, 1350, 16, 0.45) +
    `</svg>`,
);

/** Section 3 right column: portrait crop of the night constellation. */
export const REWARDS_ART = encode(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">${DEFS}` +
    `<rect width="1200" height="1600" fill="url(#night)"/>` +
    `<circle cx="620" cy="520" r="560" fill="url(#glowv)"/>` +
    `<circle cx="500" cy="1250" r="520" fill="url(#glowc)"/>` +
    `<polygon points="600,300 780,500 710,1120 490,1120 420,520" fill="url(#gcyan)" opacity="0.9"/>` +
    `<polygon points="600,300 710,1120 490,1120" fill="#FFFFFF" opacity="0.1"/>` +
    `<polygon points="600,300 780,500 710,1120" fill="#0C2F3A" opacity="0.16"/>` +
    `<polygon points="880,700 990,830 950,1180 810,1180 795,830" fill="url(#gviolet)" opacity="0.85"/>` +
    `<polygon points="290,820 390,930 350,1230 230,1230 215,935" fill="url(#ggold)" opacity="0.85"/>` +
    diamond(220, 420, 26, 'url(#gcyan)', 0.6) +
    diamond(950, 380, 22, 'url(#ggold)', 0.6) +
    diamond(1020, 1350, 26, 'url(#gcyan)', 0.5) +
    sparkle(760, 420, 20, 0.65) +
    sparkle(340, 660, 15, 0.5) +
    sparkle(900, 1250, 14, 0.45) +
    `</svg>`,
);
