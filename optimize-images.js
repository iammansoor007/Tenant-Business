import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const assetsDir = './src/assets';

async function optimizeImages() {
  const files = fs.readdirSync(assetsDir);
  console.log(`Scanning ${files.length} assets...`);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') continue;

    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);
    
    // Process files larger than 150KB
    if (stats.size > 150 * 1024) {
      const baseName = path.basename(file, ext);
      const webpFileName = `${baseName}.webp`;
      const webpPath = path.join(assetsDir, webpFileName);

      console.log(`Optimizing ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)...`);
      try {
        await sharp(filePath)
          .webp({ quality: 80, effort: 6 })
          .toFile(webpPath);
        
        const newStats = fs.statSync(webpPath);
        console.log(`  -> Saved as ${webpFileName} (${(newStats.size / 1024).toFixed(2)} KB) - Saved ${((1 - newStats.size / stats.size) * 100).toFixed(1)}%`);
        
        // Delete original file to save space and ensure it's not used
        fs.unlinkSync(filePath);
        console.log(`  -> Deleted original ${file}`);
      } catch (err) {
        console.error(`  [ERROR] Failed to optimize ${file}:`, err);
      }
    }
  }
  console.log('Optimization complete!');
}

optimizeImages();
