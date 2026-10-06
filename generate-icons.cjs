const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgPath = path.join(__dirname, 'public', 'pwa-512x512.svg');
const svg = fs.readFileSync(svgPath);

async function generate() {
  // 512x512
  await sharp(svg).resize(512, 512).png().toFile(path.join(__dirname, 'public', 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 192x192
  await sharp(svg).resize(192, 192).png().toFile(path.join(__dirname, 'public', 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // Apple touch icon 180x180
  await sharp(svg).resize(180, 180).png().toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Favicon
  await sharp(svg).resize(32, 32).png().toFile(path.join(__dirname, 'public', 'favicon.ico'));
  console.log('Generated favicon.ico');

  console.log('All icons generated!');
}

generate().catch(console.error);
