const fs = require('fs');
const path = require('path');

// Create a simple 1x1 transparent PNG (base64 encoded)
const transparentPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Ensure assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Write PNG files
fs.writeFileSync(path.join(assetsDir, 'icon.png'), transparentPNG);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), transparentPNG);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), transparentPNG);

console.log('✅ Created placeholder PNG files in assets/');
console.log('   - icon.png');
console.log('   - splash.png');
console.log('   - adaptive-icon.png');
