"use server";

import fs from "fs";
import path from "path";

export async function getAllTilePaths(): Promise<string[]> {
  const tilesDirectory = path.join(process.cwd(), "public/tiles");
  let allFiles: string[] = [];

  const getFilesRecursively = (dir: string): string[] => {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat && stat.isDirectory()) {
        results = results.concat(getFilesRecursively(filePath));
      } else if (/\.(jpg|jpeg|png|webp|avif)$/i.test(file)) {
        const relativePath = path.relative(tilesDirectory, filePath);
        results.push(relativePath.replace(/\\/g, '/'));
      }
    });

    return results;
  };

  try {
    allFiles = getFilesRecursively(tilesDirectory);
  } catch (e) {
    console.error("Error reading tiles directory:", e);
  }

  return allFiles;
}
