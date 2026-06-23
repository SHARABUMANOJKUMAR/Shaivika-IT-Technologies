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

        // Find the logo-reflection div and the two closing divs, followed by </a>
        // regex: (<div class="logo-reflection">[\s\S]*?<\/div>\s*<\/div>)\s*(<\/a>)
        const regex = /(<div class="logo-reflection">[\s\S]*?<\/div>\s*<\/div>)\s*(<\/a>)/g;

        // This will find all instances of the nav-logo block closing and insert the text
        const updatedContent = content.replace(regex, (match, p1, p2) => {
            // Check if the text is already there to prevent duplication
            if (p1.includes('nav-logo-text')) return match;

            return `${p1}\n          <div class="nav-logo-text" style="font-family: var(--font-display); font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 0.5px; margin-left: 10px;">Shaivika IT&nbsp;<span>Technologies</span></div>\n        ${p2}`;
        });

        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
});
