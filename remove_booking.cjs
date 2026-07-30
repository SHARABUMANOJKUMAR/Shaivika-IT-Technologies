const fs = require('fs');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the <li> item
    content = content.replace(/<li>Appointment Booking Agent[^<]+<\/li>/g, '');
    
    // Remove the saas card
    const cardRegex = /<div class="saas-card[^>]*>[\s\S]*?<div class="saas-title">Appointment Booking Platform<\/div>[\s\S]*?<\/div>/g;
    content = content.replace(cardRegex, '');
    
    fs.writeFileSync(filePath, content);
}

fixFile('dist/services.html');
fixFile('services.html');
