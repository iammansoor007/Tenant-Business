import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, 'src/assets');

// Write compressed copies with "-c" suffix (components will import these)
const webpTasks = [
  { in: 'hero-bg.webp',              out: 'hero-bg-c.webp',              quality: 80 },
  { in: 'portfolio-hero.webp',        out: 'portfolio-hero-c.webp',        quality: 78 },
  { in: 'portfolio-1.webp',           out: 'portfolio-1-c.webp',           quality: 78 },
  { in: 'portfolio-3.webp',           out: 'portfolio-3-c.webp',           quality: 78 },
  { in: 'portfolio-4.webp',           out: 'portfolio-4-c.webp',           quality: 78 },
  { in: 'framing.webp',               out: 'framing-c.webp',               quality: 78 },
  { in: 'flooring.webp',              out: 'flooring-c.webp',              quality: 78 },
  { in: 'residentaljunkremoval.webp', out: 'residentaljunkremoval-c.webp', quality: 78 },
  { in: 'propertycleanout.webp',      out: 'propertycleanout-c.webp',      quality: 78 },
  { in: 'faqvector.webp',             out: 'faqvector-c.webp',             quality: 78 },
  { in: 'ctavector.webp',             out: 'ctavector-c.webp',             quality: 78 },
];

async function run() {
  for (const t of webpTasks) {
    const inPath  = path.join(assetsDir, t.in);
    const outPath = path.join(assetsDir, t.out);

    if (!fs.existsSync(inPath)) { console.log(`⚠  SKIP: ${t.in}`); continue; }

    const before = fs.statSync(inPath).size;
    try {
      const buf = await sharp(inPath).webp({ quality: t.quality }).toBuffer();
      fs.writeFileSync(outPath, buf);
      console.log(`✅ ${t.in} → ${t.out}  ${(before/1024).toFixed(0)}KB → ${(buf.length/1024).toFixed(0)}KB`);
    } catch (e) {
      console.error(`❌ ${t.in}: ${e.message}`);
    }
  }
  console.log('\nDone!');
}

run();
