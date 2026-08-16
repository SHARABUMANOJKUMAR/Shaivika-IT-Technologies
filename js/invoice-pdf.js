/**
 * SHAIVIKA IT TECHNOLOGIES - Invoice PDF Generator
 * Uses html2pdf.js and qrcode.js to generate professional A4 PDFs.
 */

const InvoicePDF = {
    
    // Generates a QR Code as a Data URI so html2pdf can render it cleanly
    generateQR: async function(text) {
        return new Promise((resolve) => {
            const tempDiv = document.createElement('div');
            // Uses global QRCode from qrcode.js (loaded via CDN)
            new QRCode(tempDiv, {
                text: text,
                width: 150,
                height: 150,
                colorDark : "#1e3a8a",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            setTimeout(() => {
                const img = tempDiv.querySelector('img');
                const canvas = tempDiv.querySelector('canvas');
                if (img && img.src) resolve(img.src);
                else if (canvas) resolve(canvas.toDataURL("image/png"));
                else resolve('');
            }, 100);
        });
    },

    generate: async function(uuid) {
        const inv = InvoiceDB.getInvoiceById(uuid);
        if (!inv) {
            alert('Invoice not found!');
            return;
        }

        const settings = InvoiceDB.getSettings();
        const customer = InvoiceDB.getCustomers().find(c => c.id === inv.customer_id) || {};
        
        // Prepare Verification URL
        const verifyUrl = window.location.origin + '/verify.html?id=' + inv.verification_id;
        const qrDataUrl = await this.generateQR(verifyUrl);

        // Generate Item Rows
        let itemsHtml = '';
        (inv.items || []).forEach(item => {
            const amt = item.qty * item.rate;
            const taxAmt = amt * (item.taxRate / 100);
            const total = amt + taxAmt;
            itemsHtml += `
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 13px;">${item.description}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px;">${item.qty}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px;">₹${item.rate.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px;">${item.taxRate}%</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: 600; font-size: 13px;">₹${total.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                </tr>
            `;
        });

        // HTML Layout for PDF (Styled inline carefully for html2pdf support)
        const html = `
            <div style="font-family: 'Inter', Helvetica, sans-serif; color: #1e293b; background: #fff; position: relative; padding: 40px; box-sizing: border-box;">
                
                <!-- Top Color Bar -->
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 10px; background: linear-gradient(90deg, #2563eb, #7c3aed, #ec4899);"></div>
                
                <!-- Watermark -->
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; z-index: 0; pointer-events: none;">
                    <img src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1786872082/Shaivika_IT_Technologies_Logo_p3p7iw.png" style="width: 400px; filter: grayscale(100%);">
                </div>

                <div style="position: relative; z-index: 1;">
                    <!-- Header -->
                    <table style="width: 100%; margin-bottom: 40px; border-collapse: collapse;">
                        <tr>
                            <td style="vertical-align: top; width: 50%;">
                                <img src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1786872082/Shaivika_IT_Technologies_Logo_p3p7iw.png" style="height: 60px; margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
                                    <strong>${settings.companyName}</strong><br>
                                    ${settings.companyAddress.replace(/\n/g, '<br>')}<br>
                                    ${settings.companyEmail} | ${settings.companyPhone}
                                </div>
                            </td>
                            <td style="vertical-align: top; text-align: right; width: 50%;">
                                <h1 style="margin: 0 0 10px 0; font-size: 36px; color: #1e3a8a; letter-spacing: 2px;">INVOICE</h1>
                                <div style="display: inline-block; background: #f8fafc; padding: 15px; border-radius: 8px; text-align: left; border: 1px solid #e2e8f0;">
                                    <table style="font-size: 12px;">
                                        <tr>
                                            <td style="color: #64748b; padding-right: 15px; padding-bottom: 5px; font-weight: 600;">Invoice No:</td>
                                            <td style="color: #0f172a; font-weight: 700;">${inv.invoice_number}</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #64748b; padding-right: 15px; padding-bottom: 5px; font-weight: 600;">Issue Date:</td>
                                            <td style="color: #0f172a; font-weight: 700;">${new Date(inv.invoice_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #64748b; padding-right: 15px; font-weight: 600;">Due Date:</td>
                                            <td style="color: #0f172a; font-weight: 700;">${new Date(inv.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Billing Grid -->
                    <table style="width: 100%; margin-bottom: 40px; background: #f1f5f9; border-radius: 8px; border-left: 4px solid #3b82f6; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 20px; vertical-align: top; width: 50%;">
                                <h3 style="margin: 0 0 10px 0; font-size: 11px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">Billed To</h3>
                                <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 5px;">${inv.customer_name}</div>
                                <div style="font-size: 13px; color: #475569; line-height: 1.5;">
                                    ${customer.address ? customer.address.replace(/\n/g, '<br>') : ''}<br>
                                    ${customer.email ? customer.email + '<br>' : ''}
                                    ${customer.gstin ? '<strong>GSTIN:</strong> ' + customer.gstin : ''}
                                </div>
                            </td>
                            <td style="padding: 20px; vertical-align: top; border-left: 2px dashed #cbd5e1; width: 50%;">
                                <h3 style="margin: 0 0 10px 0; font-size: 11px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">Payment Info</h3>
                                <table style="font-size: 13px; color: #475569; line-height: 1.6;">
                                    <tr><td style="padding-right: 10px; font-weight: 600; color: #1e293b;">Bank:</td><td>${settings.bankName}</td></tr>
                                    <tr><td style="padding-right: 10px; font-weight: 600; color: #1e293b;">A/C Name:</td><td>${settings.accountName}</td></tr>
                                    <tr><td style="padding-right: 10px; font-weight: 600; color: #1e293b;">A/C No:</td><td>${settings.accountNo}</td></tr>
                                    <tr><td style="padding-right: 10px; font-weight: 600; color: #1e293b;">IFSC:</td><td>${settings.ifsc}</td></tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <!-- Items Table -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr>
                                <th style="background: #0f172a; color: #fff; padding: 12px 15px; text-align: left; font-size: 12px; text-transform: uppercase;">Description</th>
                                <th style="background: #0f172a; color: #fff; padding: 12px 15px; text-align: center; font-size: 12px; text-transform: uppercase; width: 60px;">Qty</th>
                                <th style="background: #0f172a; color: #fff; padding: 12px 15px; text-align: right; font-size: 12px; text-transform: uppercase; width: 100px;">Rate</th>
                                <th style="background: #0f172a; color: #fff; padding: 12px 15px; text-align: right; font-size: 12px; text-transform: uppercase; width: 60px;">Tax</th>
                                <th style="background: #0f172a; color: #fff; padding: 12px 15px; text-align: right; font-size: 12px; text-transform: uppercase; width: 120px;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <!-- Totals Block -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                        <tr>
                            <td style="width: 50%; vertical-align: bottom;">
                                <!-- Verification Note -->
                                <div style="font-size: 11px; color: #64748b; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; display: inline-block;">
                                    <strong>Verification ID:</strong> ${inv.verification_id}<br>
                                    Scan QR code below to verify authenticity online.
                                </div>
                            </td>
                            <td style="width: 50%;">
                                <table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 12px 20px; font-size: 14px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Subtotal</td>
                                        <td style="padding: 12px 20px; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; border-bottom: 1px solid #e2e8f0;">₹${inv.subtotal.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 20px; font-size: 14px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Total Tax</td>
                                        <td style="padding: 12px 20px; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; border-bottom: 1px solid #e2e8f0;">₹${inv.tax_amount.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 16px 20px; font-size: 18px; color: #fff; font-weight: 700; background: #1e3a8a;">Grand Total</td>
                                        <td style="padding: 16px 20px; font-size: 18px; color: #fff; font-weight: 700; text-align: right; background: #1e3a8a;">₹${inv.total_amount.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <!-- Footer -->
                    <table style="width: 100%; border-collapse: collapse; margin-top: 30px; border-top: 2px dashed #cbd5e1; padding-top: 30px;">
                        <tr>
                            <td style="vertical-align: top;">
                                <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px; margin-top: 30px;">Thank you for your business!</div>
                                <div style="font-size: 12px; color: #64748b; line-height: 1.5; max-width: 300px;">
                                    ${inv.notes ? inv.notes.replace(/\n/g, '<br>') : ''}
                                </div>
                            </td>
                            <td style="vertical-align: top; text-align: right; width: 150px;">
                                <div style="background: #fff; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; display: inline-block; margin-top: 30px;">
                                    <img src="${qrDataUrl}" style="width: 100px; height: 100px; display: block;">
                                </div>
                            </td>
                        </tr>
                    </table>

                </div>
            </div>
        `;

        // Create an invisible div for html2pdf
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        const filename = `${inv.invoice_number}_${inv.customer_name.replace(/[^a-z0-9]/gi, '_')}.pdf`;

        // html2pdf options
        const opt = {
            margin:       0,
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // Notify user
        if(window.showToast) window.showToast('Generating PDF...', 'info');

        try {
            await html2pdf().set(opt).from(container).save();
            if(window.showToast) window.showToast('PDF Downloaded!', 'success');
        } catch(e) {
            console.error('PDF Generation Error:', e);
            alert('Failed to generate PDF. Check console.');
        } finally {
            document.body.removeChild(container);
        }
    }
};

window.InvoicePDF = InvoicePDF;
