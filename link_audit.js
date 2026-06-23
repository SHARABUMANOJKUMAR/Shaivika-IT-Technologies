const fs = require('fs');
const path = require('path');

const files = [
    'index.html',
    'about.html',
    'services.html',
    'portfolio.html',
    'blog.html',
    'contact.html'
];

let hasErrors = false;

// 1. Audit Internal Links
console.log("--- 1. Link & Navigation Audits ---");
files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Find href="..."
        const hrefRegex = /href="([^"]+)"/g;
        let match;
        while ((match = hrefRegex.exec(content)) !== null) {
            const link = match[1];

            // Ignore external and special links
            if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('css/') || link.startsWith('img/') || link.startsWith('#')) {
                continue;
            }

            // Check if internal HTML file exists
            if (!files.includes(link) && !link.includes('?')) {
                console.error(`[ERROR] Broken link found in ${file}: ${link}`);
                hasErrors = true;
            }
        }
    }
});

if (!hasErrors) {
    console.log("[SUCCESS] All internal HTML links are valid.");
}

// 2. Audit empty links href="#"
console.log("\n--- Checking for empty or placeholder links (href=\"#\") ---");
files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const emptyLinks = (content.match(/href="#"/g) || []).length;
        if (emptyLinks > 0) {
            console.log(`[WARNING] Found ${emptyLinks} empty link(s) (href="#") in ${file}. Please verify if intentional.`);
        }
    }
});
