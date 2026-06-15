const fs = require('fs');
const path = require('path');

const comingSoonDirectory = path.join(__dirname, '../public/comingsoon');
const outputFile = path.join(__dirname, '../app/comingsoon-list.json');

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
      // relative to the public directory (one level up from comingsoon directory)
      const relativePath = path.relative(path.join(baseDir, '..'), filePath);
      results.push(relativePath.replace(/\\/g, '/'));
    }
  });

  return results;
}

try {
  console.log('Generating comingsoon list from:', comingSoonDirectory);
  const allFiles = getFilesRecursively(comingSoonDirectory, comingSoonDirectory);
  console.log(`Found ${allFiles.length} comingsoon tile images.`);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(allFiles, null, 2));
  console.log('Successfully wrote comingsoon list to:', outputFile);
} catch (e) {
  console.error('Error generating comingsoon list:', e);
  process.exit(1);
}
