const fs = require('fs');
const path = require('path');

const invoicePath = path.join('C:', 'Users', 'shara', '.gemini', 'antigravity-ide', 'brain', 'd2f93219-6b61-4814-8ae0-0d1ed8d501e9', 'scratch', 'invoice.html');
const invoiceHtml = fs.readFileSync(invoicePath, 'utf8');

const sidebarLink = 
                <li class="sidebar-item">
                    <span class="sidebar-link" data-tab="invoice-generator-tab">🧾 Invoice Generator</span>
                </li>
;

function injectInvoice(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already injected
    if (content.includes('data-tab="invoice-generator-tab"')) {
        console.log(filePath + ' already has the link.');
        return;
    }

    // Inject sidebar link
    const settingsLinkRegex = /<li class="sidebar-item">\s*<span class="sidebar-link" data-tab="settings-tab">.*?<\/li>/s;
    content = content.replace(settingsLinkRegex, match => sidebarLink + match);

    // Inject invoice section before </main>
    content = content.replace('</main>', invoiceHtml + '\n</main>');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully injected into ' + filePath);
}

injectInvoice('admin/index.html');
injectInvoice('dist/admin/index.html');
