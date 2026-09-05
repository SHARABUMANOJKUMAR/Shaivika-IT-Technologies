/**
 * SHAIVIKA IT TECHNOLOGIES - Invoice PDF & Preview Generator
 * Uses html2pdf.js and qrcode.js to generate professional A4 PDFs and live previews.
 */

const InvoicePDF = {
    
    // HTML Escaper for Security & XSS Mitigation
    escapeHTML: function(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    // Amount to Words Converter (Indian Numbering System)
    numberToWords: function(num) {
        const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
        const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

        if ((num = num.toString()).length > 9) return 'overflow';
        let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return; let str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';
        return str;
    },

    // Generates a QR Code as a Data URI (safe fallback if QRCode library is unavailable)
    generateQR: async function(text) {
        if (!text || typeof QRCode === 'undefined') return '';
        return new Promise((resolve) => {
            try {
                const tempDiv = document.createElement('div');
                tempDiv.style.cssText = 'position:absolute; left:-9999px; top:-9999px; opacity:0; pointer-events:none;';
                document.body.appendChild(tempDiv);
                new QRCode(tempDiv, {
                    text: text,
                    width: 120,
                    height: 120,
                    colorDark : "#1e3a8a",
                    colorLight : "#ffffff",
                    correctLevel : (typeof QRCode !== 'undefined' && QRCode.CorrectLevel) ? QRCode.CorrectLevel.M : 0
                });
                setTimeout(() => {
                    try {
                        const img = tempDiv.querySelector('img');
                        const canvas = tempDiv.querySelector('canvas');
                        let src = '';
                        if (img && img.src && img.src.length > 50) src = img.src;
                        else if (canvas) src = canvas.toDataURL("image/png");
                        if (tempDiv.parentNode) tempDiv.parentNode.removeChild(tempDiv);
                        resolve(src);
                    } catch (err) {
                        if (tempDiv.parentNode) tempDiv.parentNode.removeChild(tempDiv);
                        resolve('');
                    }
                }, 40);
            } catch (e) {
                resolve('');
            }
        });
    },

    // Generates the core HTML template used by both Preview and PDF export
    getInvoiceHTML: async function(inv, settings, customer) {
        const esc = this.escapeHTML;
        const isInterState = inv.state_code && inv.state_code !== 'AP';
        const invoiceNumber = inv.invoice_number || inv.invoiceNumber || inv.invoice_id || inv.invoiceId || '';
        const verificationUrl = inv.verification_url || inv.verificationUrl ||
            ((window.location.protocol === 'https:' || !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname))
                ? `${window.location.origin}/verify.html?id=${encodeURIComponent(invoiceNumber)}`
                : `https://shaivika-it-technologies.netlify.app/verify.html?id=${encodeURIComponent(invoiceNumber)}`);
        const verifyUrl = verificationUrl;
        const verifyQrData = await this.generateQR(verifyUrl);

        let itemsHtml = '';
        (inv.items || []).forEach(item => {
            const qty = Number(item.qty || 1);
            const rate = Number(item.rate || 0);
            const amt = qty * rate;
            const taxRate = Number(item.taxRate || 0);
            const taxAmount = Number(item.taxAmount || 0);
            const total = Number(item.total || (amt + taxAmount));
            const safeDesc = esc(item.description || 'Service Item');
            const safeHsn = esc(item.hsn || '');

            let taxColumn = '';
            if (isInterState) {
                taxColumn = `
                    <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 12px;">
                        ${taxRate}%<br><span style="color:#64748b">₹${taxAmount.toFixed(2)}</span>
                    </td>
                `;
            } else {
                const halfRate = taxRate / 2;
                const halfAmt = taxAmount / 2;
                taxColumn = `
                    <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 12px;">
                        ${halfRate}%<br><span style="color:#64748b">₹${halfAmt.toFixed(2)}</span>
                    </td>
                    <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 12px;">
                        ${halfRate}%<br><span style="color:#64748b">₹${halfAmt.toFixed(2)}</span>
                    </td>
                `;
            }

            itemsHtml += `
                <tr>
                    <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 13px;">
                        <strong>${safeDesc}</strong>
                        ${safeHsn ? `<div style="font-size:11px; color:#64748b; margin-top: 4px;">HSN: ${safeHsn}</div>` : ''}
                    </td>
                    <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; font-weight: 600;">${qty}</td>
                    <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px;">₹${rate.toFixed(2)}</td>
                    <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px;">₹${amt.toFixed(2)}</td>
                    ${taxColumn}
                    <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #4f46e5; font-weight: 700; font-size: 14px;">₹${total.toFixed(2)}</td>
                </tr>
            `;
        });

        let taxHeaders = isInterState ? 
            `<th style="color: #ffffff; padding: 14px 12px; text-align: right; font-size: 12px;">IGST</th>` : 
            `<th style="color: #ffffff; padding: 14px 12px; text-align: right; font-size: 12px;">CGST</th>
             <th style="color: #ffffff; padding: 14px 12px; text-align: right; font-size: 12px;">SGST</th>`;

        const totalAmt = Number(inv.total_amount || 0);
        const words = this.numberToWords(Math.round(totalAmt));

        const safeCompanyName = esc(settings.companyName || 'Shaivika IT Technologies');
        const safeCompanyAddress = esc(settings.companyAddress || '').replace(/\n/g, '<br>');
        const safeCompanyEmail = esc(settings.companyEmail || '');
        const safeCompanyPhone = esc(settings.companyPhone || '');
        const safeCompanyGstin = esc(settings.gstin || '');

        const safeInvNumber = esc(invoiceNumber || 'INV-001');
        const safeInvDate = inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'N/A';
        const safeDueDate = inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'N/A';

        const safeClientName = esc(customer.company || customer.name || 'Client Name');
        const safeAttn = (customer.name && customer.company) ? 'Attn: ' + esc(customer.name) + '<br>' : '';
        const safeCustAddress = customer.address ? esc(customer.address).replace(/\n/g, '<br>') + '<br>' : '';
        const safeCustPhone = customer.phone ? 'Phone: ' + esc(customer.phone) + '<br>' : '';
        const safeCustEmail = customer.email ? 'Email: ' + esc(customer.email) + '<br>' : '';
        const safeCustGstin = customer.gstin ? 'GSTIN: <strong style="color: #0f172a;">' + esc(customer.gstin) + '</strong>' : '';

        const safePaymentMethod = esc(inv.payment_method || inv.paymentMethod || 'Online / Bank Transfer');
        const safeStatus = esc(inv.status || 'PENDING');
        const safeVerificationId = esc(inv.verification_id || inv.verificationId || invoiceNumber);

        const safeNotes = inv.notes ? `<strong style="color: #334155; font-size: 13px;">Summary:</strong><br>${esc(inv.notes).replace(/\n/g, '<br>')}<br><br>` : '';
        const safeTerms = settings.defaultTerms ? `<strong style="color: #334155; font-size: 13px;">Terms & Conditions:</strong><br>${esc(settings.defaultTerms).replace(/\n/g, '<br>')}` : '';

        const subtotal = Number(inv.subtotal || 0);
        const discountAmt = Number(inv.discount_amount || 0);
        const taxTotal = Number(inv.tax_amount || 0);
        const amtPaid = Number(inv.amount_paid || 0);
        const balanceDue = Number(inv.balance_due || 0);

        return `
            <style>
                /* Force light mode styling for the invoice preview so dark-mode CSS doesn't ruin it */
                #invoice-preview-sheet * { color-scheme: light !important; }
                .invoice-print-wrapper { background: #ffffff !important; color: #1e293b !important; }
                .invoice-print-wrapper table { border-collapse: collapse !important; }
                .invoice-print-wrapper td, .invoice-print-wrapper th { background-color: transparent; }
                @page { size: A4 portrait; margin: 0; }
                .invoice-print-wrapper {
                    padding: 40px 45px 30px !important;
                    font-size: 13px !important;
                }
                .invoice-print-wrapper > div > div:first-child {
                    padding: 40px 45px !important;
                    margin: -40px -45px 30px !important;
                }
            </style>
            <div class="invoice-print-wrapper" style="font-family: 'Inter', Helvetica, sans-serif; color: #1e293b; background: #ffffff; width: 100%; height: 100%; position: relative; box-sizing: border-box; overflow: hidden;">
                <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; border-radius: 50%; background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(236, 72, 153, 0.1)); z-index: 0;"></div>
                <div style="position: absolute; bottom: -50px; left: -50px; width: 200px; height: 200px; border-radius: 50%; background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(56, 189, 248, 0.1)); z-index: 0;"></div>

                <div style="position: relative; z-index: 1; background: #ffffff;">
                    <div style="background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899); padding: 40px 45px; margin: -40px -45px 30px -45px; border-radius: 0 0 16px 16px; color: white;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="vertical-align: middle; width: 50%;">
                                    <div style="background: white; display: inline-block; padding: 12px 18px; border-radius: 8px; margin-bottom: 12px;">
                                        <img src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1786872082/Shaivika_IT_Technologies_Logo_p3p7iw.png" style="height: 65px; max-width: 280px; object-fit: contain;">
                                    </div>
                                    <div style="font-size: 13px; color: rgba(255,255,255,0.95); line-height: 1.6;">
                                        <strong style="font-size: 16px; color: white;">${safeCompanyName}</strong><br>
                                        ${safeCompanyAddress}<br>
                                        ${safeCompanyEmail} | ${safeCompanyPhone}<br>
                                        ${safeCompanyGstin ? 'GSTIN: <strong>' + safeCompanyGstin + '</strong>' : ''}
                                    </div>
                                </td>
                                <td style="vertical-align: middle; text-align: right; width: 50%;">
                                    <h1 style="margin: 0 0 10px 0; font-size: 44px; color: #ffffff; letter-spacing: 2px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">TAX INVOICE</h1>
                                    <div style="font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.95); margin-bottom: 20px; display: inline-block; background: rgba(0,0,0,0.2); padding: 6px 16px; border-radius: 20px;">
                                        # ${safeInvNumber}
                                    </div>
                                    <table style="font-size: 13px; float: right; text-align: right; border-collapse: collapse; color: white;">
                                        <tr>
                                             <td style="padding-right: 14px; padding-bottom: 8px; opacity: 0.9;">Invoice Date:</td>
                                            <td style="font-weight: 600; padding-bottom: 8px;">${safeInvDate}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding-right: 14px; opacity: 0.9;">Due Date:</td>
                                            <td style="font-weight: 600;">${safeDueDate}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <table style="width: 100%; margin-bottom: 30px; border-collapse: collapse; padding: 0;">
                        <tr>
                            <td style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; width: 48%; vertical-align: top; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                                <div style="display: flex; align-items: center; margin-bottom: 14px;">
                                    <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(59, 130, 246, 0.1); display: inline-block; text-align: center; line-height: 36px; margin-right: 12px; color: #3b82f6; font-weight: bold; font-size: 16px;">B</div>
                                    <h3 style="margin: 0; font-size: 13px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Billed To</h3>
                                </div>
                                <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">${safeClientName}</div>
                                <div style="font-size: 13px; color: #475569; line-height: 1.6;">
                                    ${safeAttn}
                                    ${safeCustAddress}
                                    ${safeCustPhone}
                                    ${safeCustEmail}
                                    ${safeCustGstin}
                                </div>
                            </td>
                            <td style="width: 4%;"></td>
                            <td style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; width: 48%; vertical-align: top; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                                <div style="display: flex; align-items: center; margin-bottom: 14px;">
                                    <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(16, 185, 129, 0.1); display: inline-block; text-align: center; line-height: 36px; margin-right: 12px; color: #10b981; font-weight: bold; font-size: 16px;">P</div>
                                    <h3 style="margin: 0; font-size: 13px; color: #10b981; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Payment Method</h3>
                                </div>
                                <table style="font-size: 13px; color: #475569; line-height: 1.6; border-collapse: collapse; width: 100%;">
                                    <tr><td style="padding-bottom: 6px; width: 70px;"><strong>Method:</strong></td><td style="padding-bottom: 6px;">${safePaymentMethod}</td></tr>
                                    <tr><td style="padding-bottom: 6px;"><strong>Status:</strong></td><td style="padding-bottom: 6px; color: ${inv.status === 'PAID' ? '#10b981' : (inv.status === 'DRAFT' ? '#475569' : '#f59e0b')}; font-weight: 600;">${safeStatus}</td></tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <div style="border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: linear-gradient(90deg, #1e293b, #334155);">
                                    <th style="color: #ffffff; padding: 14px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Description</th>
                                    <th style="color: #ffffff; padding: 14px 12px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 50px;">Qty</th>
                                    <th style="color: #ffffff; padding: 14px 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 90px;">Rate</th>
                                    <th style="color: #ffffff; padding: 14px 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 90px;">Amount</th>
                                    ${taxHeaders}
                                    <th style="color: #ffffff; padding: 14px 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 100px;">Total</th>
                                </tr>
                            </thead>
                            <tbody style="background: #ffffff;">
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="width: 50%; vertical-align: bottom; padding-right: 20px;">
                                <div style="background: #f8fafc; border-left: 4px solid #8b5cf6; padding: 18px; border-radius: 0 8px 8px 0;">
                                    <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;"><strong>Amount in Words</strong></div>
                                    <div style="font-size: 14px; font-weight: 500; color: #1e293b; line-height: 1.5;">Rupees ${words}</div>
                                </div>
                            </td>
                            <td style="width: 50%;">
                                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                             <td style="padding: 10px 0; font-size: 14px; color: #475569;">Subtotal</td>
                                            <td style="padding: 10px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">₹${subtotal.toFixed(2)}</td>
                                        </tr>
                                        ${discountAmt > 0 ? `
                                        <tr>
                                            <td style="padding: 10px 0; font-size: 14px; color: #ef4444;">Discount</td>
                                            <td style="padding: 10px 0; font-size: 14px; color: #ef4444; font-weight: 600; text-align: right;">- ₹${discountAmt.toFixed(2)}</td>
                                        </tr>` : ''}
                                        <tr>
                                            <td style="padding: 10px 0; font-size: 14px; color: #475569;">Tax Amount</td>
                                            <td style="padding: 10px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">₹${taxTotal.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2"><hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 12px 0;"></td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 14px 0 10px; font-size: 18px; color: #1e3a8a; font-weight: 800;">Grand Total</td>
                                            <td style="padding: 14px 0 10px; font-size: 22px; color: #1e3a8a; font-weight: 800; text-align: right;">₹${totalAmt.toFixed(2)}</td>
                                        </tr>
                                        ${amtPaid > 0 ? `
                                        <tr>
                                            <td style="padding: 10px 0; font-size: 14px; color: #10b981;">Amount Paid</td>
                                            <td style="padding: 10px 0; font-size: 14px; color: #10b981; font-weight: 600; text-align: right;">- ₹${amtPaid.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 0 4px; font-size: 16px; color: #ef4444; font-weight: 700;">Balance Due</td>
                                            <td style="padding: 12px 0 4px; font-size: 18px; color: #ef4444; font-weight: 800; text-align: right;">₹${balanceDue.toFixed(2)}</td>
                                        </tr>` : ''}
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border-top: 2px solid #f1f5f9; padding-top: 20px;">
                        <tr>
                            <td style="vertical-align: top; width: 70%; padding-top: 20px;">
                                <div style="font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 24px;">
                                    ${safeNotes}
                                    ${safeTerms}
                                </div>
                                <div style="font-size: 11px; color: #94a3b8; background: #f8fafc; padding: 12px 18px; border-radius: 8px; display: inline-block;">
                                    <span style="color: #10b981; font-size: 15px; margin-right: 6px;">✓</span> Invoice Verification: <strong style="color: #475569;">${safeVerificationId}</strong><br>
                                    <span style="margin-left: 24px;">Scan to verify this invoice at the Shaivika verification page. This is not a government GST e-invoice.</span>
                                </div>
                            </td>
                            <td style="vertical-align: middle; text-align: right; width: 30%; padding-top: 20px;">
                                ${verifyQrData ? `
                                    <div style="display: inline-block; text-align: center; background: white; padding: 12px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                                        <img src="${verifyQrData}" style="width: 110px; height: 110px;"><br>
                                        <div style="font-size: 11px; color: #4f46e5; font-weight: 700; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Scan to Verify</div>
                                    </div>
                                ` : `
                                    <div style="display: inline-block; text-align: center; background: white; padding: 16px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                                        <div style="font-size: 28px; color: #4f46e5; margin-bottom: 6px;">🛡️</div>
                                        <div style="font-size: 11px; color: #4f46e5; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Verified Invoice</div>
                                    </div>
                                `}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    },

    renderLivePreview: async function(invoiceData) {
        const previewElement = document.getElementById('invoice-preview-sheet');
        if (!previewElement) return;
        
        try {
            const settings = window.InvoiceDB ? window.InvoiceDB.getSettings() : (this.defaultSettings || {});
            let customer = {
                name: invoiceData.customer_name || 'Client Name',
                phone: invoiceData.customer_phone || '',
                email: invoiceData.customer_email || ''
            };
            if (window.InvoiceDB && invoiceData.customer_id) {
                const dbCust = window.InvoiceDB.getCustomerById(invoiceData.customer_id);
                if (dbCust) customer = Object.assign(customer, dbCust);
            }

            const html = await this.getInvoiceHTML(invoiceData, settings, customer);
            previewElement.innerHTML = html;
            
            // Scale logic for preview based on parent container width
            const container = document.querySelector('.a4-container');
            if (container) {
                const containerWidth = container.clientWidth - 30; // 30px padding
                const a4Width = 794; // approx px width of A4 at 96dpi
                if (containerWidth > 0 && containerWidth < a4Width) {
                    const scale = containerWidth / a4Width;
                    previewElement.style.transform = `scale(${scale})`;
                    previewElement.style.transformOrigin = 'top center';
                    const targetHeight = Math.max((previewElement.scrollHeight || 1123) * scale + 30, 400);
                    container.style.height = `${targetHeight}px`;
                } else {
                    previewElement.style.transform = 'scale(1)';
                    previewElement.style.transformOrigin = 'top center';
                    container.style.height = 'auto';
                }
            }
        } catch (err) {
            console.error('Invoice Live Preview Error:', err);
        }
    },

    generate: async function(invoiceOrId) {
        let container;
        try {
            const inv = typeof invoiceOrId === 'object'
                ? invoiceOrId
                : window.InvoiceDB?.getInvoiceById(invoiceOrId);
            if (!inv) {
                throw new Error('Invoice data is not available for PDF generation.');
            }

            if (typeof html2canvas !== 'function' || typeof (window.jspdf?.jsPDF || window.jsPDF) !== 'function') {
                throw new Error('PDF rendering library is still loading. Please try again.');
            }

            const settings = window.InvoiceDB?.getSettings?.() || {};
            const customer = window.InvoiceDB?.getCustomerById?.(inv.customer_id) || {
                name: inv.customerName || inv.customer_name || '',
                phone: inv.phone || inv.customer_phone || '',
                email: inv.email || inv.customer_email || ''
            };
            const html = await this.getInvoiceHTML(inv, settings, customer);

            container = document.createElement('div');
            container.id = 'invoice-pdf';
            container.setAttribute('data-invoice-pdf-capture', 'true');
            container.innerHTML = html;
            container.style.cssText = 'position:absolute;left:0;top:0;width:794px;height:1123px;min-height:1123px;padding:0;margin:0;background:#fff;overflow:hidden;z-index:2147483647;';
            document.body.appendChild(container);

            if (document.fonts?.ready) await document.fonts.ready;
            await Promise.all(Array.from(container.querySelectorAll('img')).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.addEventListener('load', resolve, { once: true });
                    img.addEventListener('error', resolve, { once: true });
                });
            }));

            const invoiceContent = container.querySelector('.invoice-print-wrapper');
            if (!invoiceContent || invoiceContent.textContent.trim().length < 40) {
                throw new Error('Invoice content is empty; PDF was not created.');
            }
            const captureRect = invoiceContent.getBoundingClientRect();
            console.log('[PDF] Invoice element found', { width: captureRect.width, height: captureRect.height, htmlLength: invoiceContent.innerHTML.length, invoiceNumber: inv.invoice_number || inv.invoiceNumber, customer: inv.customer_name || inv.customerName, paymentMethod: inv.payment_method || inv.paymentMethod, qrUrl: inv.verification_url || inv.verificationUrl });
            if (captureRect.width <= 0 || captureRect.height <= 0) throw new Error('Invoice rendering area has zero dimensions.');
            invoiceContent.style.width = '794px';
            invoiceContent.style.height = '1123px';
            invoiceContent.style.minHeight = '1123px';
            invoiceContent.style.maxHeight = '1123px';
            invoiceContent.style.boxSizing = 'border-box';
            invoiceContent.style.overflow = 'hidden';
            invoiceContent.style.backgroundColor = '#ffffff';

            const number = inv.invoice_number || inv.invoiceNumber || 'INVOICE';
            const filename = `SHAIVIKA_INVOICE_${number}.pdf`;
            if(window.showToast) window.showToast('Generating high-quality PDF...', 'info');
            const canvas = await html2canvas(invoiceContent, {
                width: 794, height: 1123, windowWidth: 794, windowHeight: 1123,
                scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#ffffff',
                logging: false, scrollX: 0, scrollY: 0
            });
            if (!canvas || canvas.width < 100 || canvas.height < 100) throw new Error('Invoice canvas was empty.');
            const JsPdf = window.jspdf?.jsPDF || window.jsPDF;
            const pdf = new JsPdf({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            const pdfBlob = pdf.output('blob');
            console.log('[PDF] Generated PDF size:', pdfBlob.size);
            if (!pdfBlob || pdfBlob.size < 10000) throw new Error('Generated PDF is unexpectedly small.');
            pdf.save(filename);
            if(window.showToast) window.showToast('PDF Downloaded successfully!', 'success');
            return { filename, pageCount: 1 };
        } catch(e) {
            console.error('PDF Generation Error:', e);
            if (window.showToast) window.showToast(`Unable to generate PDF: ${e.message}`, 'error');
            throw e;
        } finally {
            if (container && container.parentNode) container.parentNode.removeChild(container);
        }
    }
};

window.InvoicePDF = InvoicePDF;
