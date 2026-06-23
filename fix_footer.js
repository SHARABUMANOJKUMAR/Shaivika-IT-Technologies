const fs = require('fs');
const path = require('path');

const replacement = `<div class="nav-logo-text" style="font-family: var(--font-display); font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 0.5px; margin-left: 10px; margin-bottom: 14px; display: flex; align-items: center;">Shaivika <span>Groups</span></div>`;

const filesToFix = ['portfolio.html', 'blog.html', 'about.html', 'services.html', 'contact.html'];

filesToFix.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace('</div> Solutions</span>', `</div>\n                            ${replacement}`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
