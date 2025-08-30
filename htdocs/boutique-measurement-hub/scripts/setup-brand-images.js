#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🎨 Boutique Hub Brand Image Setup');
console.log('==================================\n');

// Create directories if they don't exist
const directories = [
  'public/images',
  'public/icons',
  'public/screenshots'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`📁 Directory exists: ${dir}`);
  }
});

console.log('\n📋 Next Steps:');
console.log('1. Add your logo files to the public/images/ directory:');
console.log('   - logo.png (default logo)');
console.log('   - logo-white.png (for dark backgrounds)');
console.log('   - logo-dark.png (for light backgrounds)');
console.log('   - favicon.svg (SVG favicon)');
console.log('   - favicon.png (PNG favicon)');
console.log('   - apple-touch-icon.png (180x180px)');
console.log('   - og-image.jpg (1200x630px for social media)');

console.log('\n2. Add PWA icons to public/icons/ directory (optional):');
console.log('   - icon-72x72.png');
console.log('   - icon-96x96.png');
console.log('   - icon-128x128.png');
console.log('   - icon-144x144.png');
console.log('   - icon-152x152.png');
console.log('   - icon-192x192.png');
console.log('   - icon-384x384.png');
console.log('   - icon-512x512.png');

console.log('\n3. Add screenshots to public/screenshots/ directory (optional):');
console.log('   - dashboard.png');
console.log('   - customer.png');

console.log('\n4. Update the Logo component to use your images:');
console.log('   - Set useImage={true} when using the Logo component');
console.log('   - Or replace the SVG path in components/Logo.tsx');

console.log('\n📖 For detailed instructions, see BRAND_GUIDE.md');
console.log('\n✨ Happy branding!'); 