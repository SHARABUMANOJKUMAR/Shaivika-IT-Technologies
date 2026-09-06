const fs = require('fs');
const path = require('path');

const srcCssPath = path.join(__dirname, 'css', 'style.css');
const distCssPath = path.join(__dirname, 'dist', 'css', 'style.css');
const minCssPath = path.join(__dirname, 'css', 'style.min.css');
const distMinCssPath = path.join(__dirname, 'dist', 'css', 'style.min.css');

const cssContent = fs.readFileSync(srcCssPath, 'utf8');

function minifyCSS(css) {
  return css
    // 1. Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // 2. Collapse all whitespace to single spaces
    .replace(/\s+/g, ' ')
    // 3. Remove spaces around structural characters
    .replace(/\s*([{};:,>+~])\s*/g, (match, char) => char)
    // 4. Clean up unnecessary trailing semicolons in blocks
    .replace(/;}/g, '}')
    .trim();
}

const minified = minifyCSS(cssContent);

// Ensure directories exist
fs.mkdirSync(path.dirname(distCssPath), { recursive: true });
fs.mkdirSync(path.dirname(distMinCssPath), { recursive: true });

// Write files
fs.writeFileSync(minCssPath, minified, 'utf8');
fs.writeFileSync(distCssPath, cssContent, 'utf8');
fs.writeFileSync(distMinCssPath, minified, 'utf8');

console.log('Successfully generated CSS files:');
console.log('- css/style.min.css (' + minified.length + ' bytes)');
console.log('- dist/css/style.css (' + cssContent.length + ' bytes)');
console.log('- dist/css/style.min.css (' + minified.length + ' bytes)');
console.log('Sample prefix: ' + minified.substring(0, 100));
