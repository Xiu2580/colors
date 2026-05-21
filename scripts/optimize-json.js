import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, '..', 'public', 'colors_organized.json');
const outPath = join(__dirname, '..', 'public', 'colors_organized.json');

console.log('[optimize-json] Reading', srcPath);
const raw = readFileSync(srcPath, 'utf-8');
const data = JSON.parse(raw);

// Validate structure
if (!data.solidColors || !Array.isArray(data.solidColors)) {
  console.error('[optimize-json] ERROR: missing solidColors array');
  process.exit(1);
}
if (!data.gradients || !Array.isArray(data.gradients)) {
  console.error('[optimize-json] ERROR: missing gradients array');
  process.exit(1);
}

const stats = {
  solidColors: data.solidColors.length,
  gradients: data.gradients.length,
  sizeBefore: raw.length,
};

// Minify
const minified = JSON.stringify(data);
stats.sizeAfter = minified.length;
stats.saved = ((1 - stats.sizeAfter / stats.sizeBefore) * 100).toFixed(1);

writeFileSync(outPath, minified, 'utf-8');
console.log('[optimize-json] Solid colors:', stats.solidColors);
console.log('[optimize-json] Gradients:', stats.gradients);
console.log('[optimize-json] Size: %s → %s (saved %s%)',
  (stats.sizeBefore / 1024).toFixed(1) + ' KB',
  (stats.sizeAfter / 1024).toFixed(1) + ' KB',
  stats.saved
);
