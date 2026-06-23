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

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Fix nav-logo-text alignment
        if (content.includes('margin-left: 10px;">Shaivika')) {
            content = content.replace(/margin-left: 10px;">Shaivika/g, 'margin-left: 10px; margin-bottom: 14px; display: flex; align-items: center;">Shaivika');
        }

        // Fast response via WhatsApp on contact.html
        if (file === 'contact.html') {
            const str1 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16" height="16"';
            const str2 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24"';
            content = content.replace(str1, str2);

            const str3 = 'style="vertical-align:middle;margin-right:6px">';
            const str4 = 'style="vertical-align:middle;margin-right:8px; display:inline-block; transform: translateY(-1px);">';
            content = content.replace(str3, str4);

            content = content.replace('</svg> WhatsApp', '</svg> <span style="font-size: 16px; font-weight: 700;">WhatsApp</span>');
            content = content.replace('</svg>\r\n                            WhatsApp', '</svg> <span style="font-size: 16px; font-weight: 700;">WhatsApp</span>');
            content = content.replace('</svg>\n                            WhatsApp', '</svg> <span style="font-size: 16px; font-weight: 700;">WhatsApp</span>');
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed alignment and SVG in ${file}`);
    }
});
