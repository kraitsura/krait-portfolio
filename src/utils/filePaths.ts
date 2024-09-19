import fs from 'fs';
import path from 'path';

type FileFilter = (file: string) => boolean;

export const getPathsFromDir = (
  directory: string,
  fileFilter?: FileFilter
): string[] => {
  const allPaths: string[] = [];

  const exploreDirectory = (currentPath: string) => {
    let files: string[];
    try {
      files = fs.readdirSync(currentPath);
    } catch (err) {
      console.error(`Error reading directory ${currentPath}:`, err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(currentPath, file);
      let stats: fs.Stats;
      try {
        stats = fs.statSync(filePath);
      } catch (err) {
        console.error(`Error getting stats for file ${filePath}:`, err);
        return;
      }

      if (stats.isDirectory()) {
        exploreDirectory(filePath);
      } else if (!fileFilter || fileFilter(file)) {
        allPaths.push(filePath);
      }
    });
  };

  exploreDirectory(directory);
  return allPaths;
};

// Example usage:
// Get all GIF paths
export const getGifPaths = (directory: string): string[] => 
  getPathsFromDir(directory, (file) => path.extname(file).toLowerCase() === '.gif');

// Get all image paths (you can expand this list as needed)
export const getImagePaths = (directory: string): string[] => 
  getPathsFromDir(directory, (file) => {
    const ext = path.extname(file).toLowerCase();
    return ['.gif', '.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext);
  });

// If you need to get all files without filtering
export const getAllFilePaths = (directory: string): string[] => 
  getPathsFromDir(directory);