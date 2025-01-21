const fs = require('fs');
const path = require('path');

// Path to the folder containing SVG files
const iconsFolderPath = path.resolve(__dirname, '../icons');
const outputFilePath = path.resolve(__dirname, 'icons.js');

/**
 * Reads all SVG files from a folder and generates a JavaScript module.
 */
function generateIconsModule() {
  const iconsMap = {};

  // Read all files in the icons folder
  const files = fs.readdirSync(iconsFolderPath);

  files.forEach((file) => {
    const ext = path.extname(file);
    const iconName = path.basename(file, ext);

    // Process only SVG files
    if (ext === '.svg') {
      const svgPath = path.join(iconsFolderPath, file);
      const svgContent = fs.readFileSync(svgPath, 'utf-8').trim();

      // Add SVG content to the JavaScript object
      iconsMap[iconName] = svgContent;
    }
  });

  // Generate JavaScript module content
  const moduleContent = `// Auto-generated icons module
const iconsMap = ${JSON.stringify(iconsMap, null, 2)};

export default iconsMap;
`;

  // Write the module content to the output file
  fs.writeFileSync(outputFilePath, moduleContent, 'utf-8');
  console.log(`Icons JavaScript module generated at: ${outputFilePath}`);
}

// Run the script
generateIconsModule();
