const fs = require('fs');
const path = require('path');

// Fix remaining empty links in blog.html (Categories)
let blogPath = path.join(__dirname, 'blog.html');
if (fs.existsSync(blogPath)) {
    let blogContent = fs.readFileSync(blogPath, 'utf8');
    // The footer categories have href="#"
    blogContent = blogContent.replace(/<li><a href="#">AI & Automation<\/a><\/li>/g, '<li><a href="services.html">AI & Automation</a></li>');
    blogContent = blogContent.replace(/<li><a href="#">Web Development<\/a><\/li>/g, '<li><a href="services.html">Web Development</a></li>');
    blogContent = blogContent.replace(/<li><a href="#">SaaS Business<\/a><\/li>/g, '<li><a href="services.html">SaaS Business</a></li>');
    blogContent = blogContent.replace(/<li><a href="#">SEO Tips<\/a><\/li>/g, '<li><a href="services.html">SEO Tips</a></li>');
    fs.writeFileSync(blogPath, blogContent, 'utf8');
    console.log('Fixed Blog Categories links');
}

// Fix empty link in contact.html (Social missing href)
let contactPath = path.join(__dirname, 'contact.html');
if (fs.existsSync(contactPath)) {
    let contactContent = fs.readFileSync(contactPath, 'utf8');
    // Look for empty social links
    // <li><a href="#"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16"
    contactContent = contactContent.replace(/href="#"/g, 'href="https://twitter.com/shaivikagroups" target="_blank"');
    fs.writeFileSync(contactPath, contactContent, 'utf8');
    console.log('Fixed Contact empty links');
}
