// Sets Windows PE metadata + icon on the compiled doas.exe
// Uses rcedit for metadata, png-to-ico for icon conversion

import { rcedit } from 'rcedit';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import pngToIco from 'png-to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const exePath = resolve(rootDir, 'dist', 'doas.exe');
const pngPath = resolve(rootDir, 'README.logo.png');
const icoPath = resolve(rootDir, 'dist', 'doas.ico');

if (!existsSync(exePath)) {
  console.error(`ERROR: ${exePath} not found. Run "bun run build" first.`);
  process.exit(1);
}

const VERSION = '1.1.1.0';

// Step 1: Embed version strings
console.log('Embedding version strings...');
await rcedit(exePath, {
  'version-string': {
    CompanyName: 'BL.BlueLighting',
    FileDescription: 'doas -su mylife.root',
    InternalFilename: 'doas',
    LegalCopyright: '(C) BL.BlueLighting. All rights reserved.',
    OriginalFilename: 'doas.exe',
    ProductName: 'doas -su mylife.root',
  },
  'file-version': VERSION,
  'product-version': VERSION,
});
console.log('Version strings embedded.');

// Step 2: Convert PNG to ICO and embed icon
if (existsSync(pngPath)) {
  console.log(`Converting ${pngPath} to ICO...`);
  const pngBuffer = readFileSync(pngPath);
  const icoBuffer = await pngToIco(pngBuffer);
  writeFileSync(icoPath, icoBuffer);
  console.log('ICO created, embedding icon...');

  await rcedit(exePath, { icon: icoPath });

  unlinkSync(icoPath);
  console.log('Icon embedded.');
}

console.log('Metadata + icon embedded successfully.');
console.log(`  ProductName:    doas -su mylife.root`);
console.log(`  ProductVersion: ${VERSION}`);
console.log(`  FileVersion:    ${VERSION}`);
console.log(`  Copyright:      (C) BL.BlueLighting. All rights reserved.`);
