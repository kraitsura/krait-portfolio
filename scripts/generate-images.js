#!/usr/bin/env node

/**
 * Build script to detect project images dynamically
 * Scans public/project-images/ and generates src/data/project-images.json
 * Run automatically before dev/build via package.json scripts
 */

const fs = require('fs');
const path = require('path');

// Supported image formats
const SUPPORTED_EXTENSIONS = ['.png', '.gif', '.jpg', '.jpeg'];

/**
 * Detects project images by checking which format exists for each numbered image
 */
function detectProjectImages(projectId, projectDir, maxImages = 10) {
  const images = [];

  // Check for images numbered 1, 2, 3, etc.
  for (let i = 1; i <= maxImages; i++) {
    let found = false;

    // Try each supported extension
    for (const ext of SUPPORTED_EXTENSIONS) {
      const filePath = path.join(projectDir, `${i}${ext}`);
      const publicPath = `/project-images/${projectId}/${i}${ext}`;

      if (fs.existsSync(filePath)) {
        images.push(publicPath);
        found = true;
        break; // Stop checking extensions once we find a match
      }
    }

    // If no image found for this number, stop checking higher numbers
    if (!found && i > 1) {
      break;
    }
  }

  return images;
}

/**
 * Main function to scan all project directories and generate JSON
 */
function generateProjectImagesJson() {
  const projectImagesDir = path.join(process.cwd(), 'public', 'project-images');
  const outputDir = path.join(process.cwd(), 'src', 'data');
  const outputFile = path.join(outputDir, 'project-images.json');

  // Check if project-images directory exists
  if (!fs.existsSync(projectImagesDir)) {
    console.error('Error: public/project-images directory not found');
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Scan all project directories
  const projectDirs = fs.readdirSync(projectImagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  // Generate image paths for each project
  const projectImages = {};

  projectDirs.forEach(projectId => {
    const projectDir = path.join(projectImagesDir, projectId);
    const images = detectProjectImages(projectId, projectDir);

    if (images.length > 0) {
      projectImages[projectId] = images;
      console.log(`✓ ${projectId}: ${images.length} image(s) detected`);
    }
  });

  // Write to JSON file
  fs.writeFileSync(outputFile, JSON.stringify(projectImages, null, 2), 'utf8');
  console.log(`\n✓ Generated: ${outputFile}`);
  console.log(`✓ Total projects: ${Object.keys(projectImages).length}`);
}

// Run the script
try {
  generateProjectImagesJson();
} catch (error) {
  console.error('Error generating project images:', error);
  process.exit(1);
}
