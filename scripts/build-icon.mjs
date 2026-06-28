// Rasterizes assets/icon.svg into build/icon.png and a multi-size build/icon.ico
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const svgPath = path.join(root, "assets", "icon.svg");
const buildDir = path.join(root, "build");

const svg = await readFile(svgPath);
await mkdir(buildDir, { recursive: true });

// Master PNG (used by mac/linux + as a fallback)
await sharp(svg, { density: 384 })
  .resize(512, 512)
  .png()
  .toFile(path.join(buildDir, "icon.png"));

// Windows .ico wants several sizes embedded
const sizes = [256, 128, 64, 48, 32, 16];
const buffers = await Promise.all(
  sizes.map((s) =>
    sharp(svg, { density: 384 }).resize(s, s).png().toBuffer()
  )
);

const ico = await pngToIco(buffers);
await writeFile(path.join(buildDir, "icon.ico"), ico);

console.log("✓ Wrote build/icon.png and build/icon.ico");
