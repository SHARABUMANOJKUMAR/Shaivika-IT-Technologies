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

        // Replace exactly "Shaivika <span>Groups</span>" with "Shaivika&nbsp;<span>Groups</span>"
        content = content.replace(/Shaivika <span>Groups<\/span>/g, 'Shaivika&nbsp;<span>Groups</span>');

        // Also handle the case where it might be split across lines like in services.html
        content = content.replace(/Shaivika\s+<span>Groups<\/span>/g, 'Shaivika&nbsp;<span>Groups</span>');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
