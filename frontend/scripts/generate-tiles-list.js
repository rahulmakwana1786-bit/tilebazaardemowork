const fs = require('fs');
const path = require('path');

const tilesDirectory = path.join(__dirname, '../public/tiles');
const outputFile = path.join(__dirname, '../app/tiles-list.json');

function getFilesRecursively(dir, baseDir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath, baseDir));
    } else if (/\.(jpg|jpeg|png|webp|avif)$/i.test(file)) {
      const relativePath = path.relative(baseDir, filePath);
      results.push(relativePath.replace(/\\/g, '/'));
    }
  });

  return results;
}

try {
  console.log('Generating tiles list from:', tilesDirectory);
  const allFiles = getFilesRecursively(tilesDirectory, tilesDirectory);
  console.log(`Found ${allFiles.length} tile images.`);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(allFiles, null, 2));
  console.log('Successfully wrote tiles list to:', outputFile);
} catch (e) {
  console.error('Error generating tiles list:', e);
  process.exit(1);
}
