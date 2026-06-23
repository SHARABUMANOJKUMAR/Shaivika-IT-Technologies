const fs = require('fs');
const files = ['index.html', 'about.html', 'services.html', 'portfolio.html', 'blog.html', 'contact.html'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Replace all img/favicon.png with img/favicon.webp and add loading="lazy" if not present
    content = content.replace(/<img([^>]*)src="img\/favicon\.png"([^>]*)>/g, (match, p1, p2) => {
        // Check if loading="lazy" is already there
        if (!match.includes('loading="lazy"')) {
            return `<img${p1}src="img/favicon.webp"${p2} loading="lazy">`;
        }
        return `<img${p1}src="img/favicon.webp"${p2}>`;
    });

    // Also we need to make sure the open graph tag doesn't get loading=lazy. That's a meta tag.
    content = content.replace(/content="https:\/\/shaivikagroups\.in\/img\/favicon\.png"/g, 'content="https://shaivikagroups.in/img/favicon.webp"');
    content = content.replace(/href="img\/favicon\.png"/g, 'href="img/favicon.webp"');

    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
});
