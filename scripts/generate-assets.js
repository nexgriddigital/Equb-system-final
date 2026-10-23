import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const publicDir = path.resolve('public');
  const faviconSvgPath = path.join(publicDir, 'equb-draw-favicon.svg');
  const logoSvgPath = path.join(publicDir, 'equb-draw-logo.svg');

  // 1. Copy equb-draw-favicon.svg to favicon.svg
  fs.copyFileSync(faviconSvgPath, path.join(publicDir, 'favicon.svg'));
  console.log('Copied favicon.svg');

  const faviconSvg = fs.readFileSync(faviconSvgPath);
  const logoSvg = fs.readFileSync(logoSvgPath);

  // 2. Favicon & Home screen PNGs from favicon SVG
  await sharp(faviconSvg).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('Generated favicon-32x32.png');

  await sharp(faviconSvg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  await sharp(faviconSvg).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Generated icon-192.png');

  await sharp(faviconSvg).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Generated icon-512.png');

  // 3. Email logo PNG (120px wide) from equb-draw-logo.svg
  await sharp(logoSvg).resize(120, 120).png().toFile(path.join(publicDir, 'logo-120.png'));
  console.log('Generated logo-120.png');

  // 4. Open Graph image (1200x630, #0E3B2E background, centered logo, text "Equb Draw")
  const ogSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0E3B2E"/>
    
    <!-- Decorative subtle circular glow -->
    <circle cx="600" cy="240" r="220" fill="#F2B705" opacity="0.06"/>
    
    <!-- Logo element (embedded at cx=600, cy=230, size=240) -->
    <g transform="translate(480, 110) scale(0.46875)">
      <rect width="512" height="512" rx="112" fill="#0A2D23" stroke="#F2B705" stroke-opacity="0.3" stroke-width="4"/>
      <circle cx="256" cy="256" r="145" fill="none" stroke="#FFF1CC" stroke-opacity="0.35" stroke-width="8"/>
      <g stroke="#FFF1CC" stroke-opacity="0.25" stroke-width="6" stroke-linecap="round">
        <line x1="256" y1="256" x2="256" y2="111"/>
        <line x1="256" y1="256" x2="381.6" y2="183.5"/>
        <line x1="256" y1="256" x2="381.6" y2="328.5"/>
        <line x1="256" y1="256" x2="256" y2="401"/>
        <line x1="256" y1="256" x2="130.4" y2="328.5"/>
        <line x1="256" y1="256" x2="130.4" y2="183.5"/>
      </g>
      <g fill="#FFF1CC">
        <circle cx="381.6" cy="183.5" r="36"/>
        <circle cx="381.6" cy="328.5" r="36"/>
        <circle cx="256" cy="401" r="36"/>
        <circle cx="130.4" cy="328.5" r="36"/>
        <circle cx="130.4" cy="183.5" r="36"/>
      </g>
      <circle cx="256" cy="111" r="58" fill="none" stroke="#F2B705" stroke-opacity="0.45" stroke-width="8"/>
      <circle cx="256" cy="111" r="46" fill="#F2B705"/>
      <circle cx="256" cy="256" r="50" fill="#F2B705"/>
      <circle cx="256" cy="256" r="30" fill="#0E3B2E"/>
      <circle cx="256" cy="256" r="12" fill="#F2B705"/>
    </g>

    <!-- Typography -->
    <text x="600" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="700" fill="#FFF1CC" text-anchor="middle" letter-spacing="1">Equb Draw</text>
    <text x="600" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="500" fill="#F2B705" text-anchor="middle" letter-spacing="0.5">ዕቁብ ድልድል • Fair Lottery &amp; Ledger for Equb Groups</text>
    <text x="600" y="530" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#FFF1CC" fill-opacity="0.75" text-anchor="middle">Transparent • Verifiable • Zero Money Held</text>
  </svg>
  `;

  await sharp(Buffer.from(ogSvg)).png().toFile(path.join(publicDir, 'og-image.png'));
  console.log('Generated og-image.png');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
