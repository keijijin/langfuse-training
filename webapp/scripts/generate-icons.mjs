import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const iconsDir = join(publicDir, "icons");

mkdirSync(iconsDir, { recursive: true });

const svgBuffer = readFileSync(join(publicDir, "icon.svg"));

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, name));
  console.log(`✓ ${name} (${size}x${size})`);
}

// Generate favicon.ico (32x32 PNG as ico alternative)
await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile(join(publicDir, "favicon.png"));
console.log("✓ favicon.png (32x32)");

// Also create a 16x16 for smaller contexts
await sharp(svgBuffer)
  .resize(16, 16)
  .png()
  .toFile(join(iconsDir, "icon-16.png"));
console.log("✓ icon-16.png (16x16)");

console.log("\nアイコン生成完了");
