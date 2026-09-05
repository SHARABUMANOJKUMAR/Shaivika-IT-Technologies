/**
 * SHAIVIKA IT TECHNOLOGIES - Invoice UI Manager
 * Handles UI rendering, reactive data binding, and interactions.
 */

(function() {
'use strict';

function invEscapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Module-scoped state
let currentInvoiceView = 'dashboard';
let currentInvoiceContext = null; 
let currentInvoiceItems = [];
let currentDashFilter = 'ALL';
let currentListFilter = 'ALL';

// Universal view switcher - works instantly without waiting
window.switchInvoiceView = function(viewId, context = null) {
    currentInvoiceView = viewId;
    currentInvoiceContext = context;

    const invoiceTab = document.getElementById('invoice-generator-tab');
    if (invoiceTab) {
        const navBtns = invoiceTab.querySelectorAll('.inv-nav-btn');
        navBtns.forEach(btn => {
            if (btn.dataset.view === viewId) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        const views = invoiceTab.querySelectorAll('.inv-view');
        views.forEach(view => view.style.display = 'none');

        const targetView = document.getElementById(`inv-view-${viewId}`);
        if (targetView) {
            targetView.style.display = 'block';
            targetView.style.animation = 'fadeInUp 0.3s ease forwards';
        }
    }

    try {
        if (viewId === 'dashboard') renderDashboard();
        else if (viewId === 'list') renderInvoiceList();
        else if (viewId === 'create') renderCreateInvoiceForm(context);
        else if (viewId === 'customers') renderCustomersList();
        else if (viewId === 'services') renderServicesList();
        else if (viewId === 'settings') renderSettings();
    } catch (err) {
        console.warn('View render warning for:', viewId, err);
    }
};

window.setInvoiceDashFilter = function(filter) {
    currentDashFilter = filter;
    const container = document.getElementById('inv-dash-filter-pills');
    if (container) {
        container.querySelectorAll('button').forEach(b => {
            if (b.dataset.dashFilter === filter) {
                b.classList.add('active', 'btn-primary');
                b.classList.remove('btn-ghost');
            } else {
                b.classList.remove('active', 'btn-primary');
                b.classList.add('btn-ghost');
            }
        });
    }
    try { renderDashboard(); } catch (e) {}
};

window.setInvoiceListFilter = function(filter) {
    currentListFilter = filter;
    const container = document.getElementById('inv-list-filter-pills');
    if (container) {
        container.querySelectorAll('button').forEach(b => {
            if (b.dataset.listFilter === filter) {
                b.classList.add('active', 'btn-primary');
                b.classList.remove('btn-ghost');
            } else {
                b.classList.remove('active', 'btn-primary');
                b.classList.add('btn-ghost');
            }
        });
    }
    try { renderInvoiceList(); } catch (e) {}
};

    // --- DASHBOARD ---
    function renderDashboard() {
        const invoices = InvoiceDB.getInvoices();
        let totalRevenue = 0, pendingAmt = 0, overdueAmt = 0;
        const now = new Date();

        invoices.forEach(inv => {
            if (inv.status === 'PAID' || inv.status === 'PARTIALLY_PAID') {
                totalRevenue += Number(inv.amount_paid || 0);
            }
            if (inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID' || inv.status === 'OVERDUE') {
                pendingAmt += Number(inv.balance_due || 0);
                if (new Date(inv.due_date) < now) overdueAmt += Number(inv.balance_due || 0);
            }
        });

        const totalInvCount = invoices.length;
        if (document.getElementById('inv-dash-total-inv')) document.getElementById('inv-dash-total-inv').innerText = totalInvCount;
        if (document.getElementById('inv-dash-revenue')) document.getElementById('inv-dash-revenue').innerText = '₹' + totalRevenue.toLocaleString('en-IN', {minimumFractionDigits:2});
        if (document.getElementById('inv-dash-pending')) document.getElementById('inv-dash-pending').innerText = '₹' + pendingAmt.toLocaleString('en-IN', {minimumFractionDigits:2});
        if (document.getElementById('inv-dash-overdue')) document.getElementById('inv-dash-overdue').innerText = '₹' + overdueAmt.toLocaleString('en-IN', {minimumFractionDigits:2});
        if (document.getElementById('statTotalInvoices')) document.getElementById('statTotalInvoices').innerText = totalInvCount;

        const recentBody = document.getElementById('inv-dash-recent-body');
        if (!recentBody) return;
        recentBody.innerHTML = '';

        const searchTerm = (document.getElementById('inv-dash-search')?.value || '').toLowerCase();

        const filtered = invoices.filter(inv => {
            const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm) || 
                (inv.customer_name && inv.customer_name.toLowerCase().includes(searchTerm));
            if (!matchesSearch) return false;

            if (currentDashFilter === 'ALL') return true;
            if (currentDashFilter === 'PAID') return inv.status === 'PAID';
            if (currentDashFilter === 'PENDING') return inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID';
            if (currentDashFilter === 'OVERDUE') return inv.status === 'OVERDUE';
            if (currentDashFilter === 'DRAFT') return inv.status === 'DRAFT';
            return true;
        });

        const countBadge = document.getElementById('inv-dash-count-badge');
        if (countBadge) countBadge.innerText = filtered.length;

        if (filtered.length === 0) {
            recentBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:35px 20px;">No invoices match your current filter.</td></tr>`;
            return;
        }

        filtered.forEach(inv => {
            recentBody.innerHTML += `
                <tr>
                    <td><strong>${invEscapeHTML(inv.invoice_number)}</strong><br><small style="color:var(--text-muted)">${new Date(inv.invoice_date).toLocaleDateString('en-IN')}</small></td>
                    <td>${invEscapeHTML(inv.customer_name || 'N/A')}</td>
                    <td>₹${(inv.total_amount || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                    <td><span class="tag ${getStatusColor(inv.status)}">${invEscapeHTML(inv.status)}</span></td>
                    <td style="color:${inv.balance_due > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight:700;">₹${(inv.balance_due || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                    <td>
                        <div class="action-btns">
                            <button type="button" class="action-btn action-btn-view action-btn-icon" title="View / Download PDF" onclick="window.viewInvoicePDF('${invEscapeHTML(inv.invoice_uuid)}')"><i class="fa-solid fa-file-pdf"></i></button>
                            <button type="button" class="action-btn action-btn-edit action-btn-icon" title="Edit Invoice" onclick="switchInvoiceView('create', '${invEscapeHTML(inv.invoice_uuid)}')"><i class="fa-solid fa-pen"></i></button>
                            ${(inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.status !== 'DRAFT') ? `<button type="button" class="action-btn action-btn-toggle action-btn-icon" title="Record Payment" onclick="window.openPaymentModal('${invEscapeHTML(inv.invoice_number)}')"><i class="fa-solid fa-credit-card"></i></button>` : ''}
                            <button type="button" class="action-btn action-btn-neutral action-btn-icon" title="Audit Log" onclick="window.openAuditModal('${invEscapeHTML(inv.invoice_number)}')"><i class="fa-solid fa-clock-rotate-left"></i></button>
                            ${(inv.status === 'SENT' || inv.status === 'OVERDUE') ? `<button type="button" class="action-btn action-btn-toggle action-btn-icon" title="Cancel Invoice" onclick="window.cancelInvoice('${invEscapeHTML(inv.invoice_uuid)}')"><i class="fa-solid fa-ban"></i></button>` : ''}
                            <button type="button" class="action-btn action-btn-delete action-btn-icon" title="Delete Invoice" onclick="window.deleteInvoice('${invEscapeHTML(inv.invoice_uuid)}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    // Dashboard search is initialized in initInvoiceManager

    // --- INVOICES LIST ---
    function renderInvoiceList() {
        const invoices = InvoiceDB.getInvoices();
        const tbody = document.getElementById('inv-list-body');
        const searchTerm = (document.getElementById('inv-search-invoices')?.value || '').toLowerCase();
        if (!tbody) return;

        tbody.innerHTML = '';
        const filtered = invoices.filter(inv => {
            const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm) || 
                (inv.customer_name && inv.customer_name.toLowerCase().includes(searchTerm));
            if (!matchesSearch) return false;

            if (currentListFilter === 'ALL') return true;
            if (currentListFilter === 'PAID') return inv.status === 'PAID';
            if (currentListFilter === 'PENDING') return inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID';
            if (currentListFilter === 'OVERDUE') return inv.status === 'OVERDUE';
            if (currentListFilter === 'DRAFT') return inv.status === 'DRAFT';
            return true;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">No invoices found.</td></tr>`;
            return;
        }

        filtered.forEach(inv => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${invEscapeHTML(inv.invoice_number)}</strong><br><small style="color:var(--text-muted)">${new Date(inv.invoice_date).toLocaleDateString('en-IN')}</small></td>
                    <td>${invEscapeHTML(inv.customer_name || 'N/A')}</td>
                    <td>₹${(inv.total_amount || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                    <td><span class="tag ${getStatusColor(inv.status)}">${invEscapeHTML(inv.status)}</span></td>
                    <td style="color:${inv.balance_due > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight:700;">₹${(inv.balance_due || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                    <td>
                        <div class="action-btns">
                            <button type="button" class="action-btn action-btn-view action-btn-icon" title="View / Download PDF" onclick="window.viewInvoicePDF('${invEscapeHTML(inv.invoice_uuid)}')"><i class="fa-solid fa-file-pdf"></i></button>
                            <button type="button" class="action-btn action-btn-edit action-btn-icon" title="Edit Invoice" onclick="window.switchInvoiceView('create', '${invEscapeHTML(inv.invoice_uuid)}')"><i class="fa-solid fa-pen"></i></button>
                            ${(inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.status !== 'DRAFT') ? `<button type="button" class="action-btn action-btn-toggle action-btn-icon" title="Record Payment" onclick="window.openPaymentModal('${invEscapeHTML(inv.invoice_number)}')"><i class="fa-solid fa-credit-card"></i></button>` : ''}
                            <button type="button" class="action-btn action-btn-neutral action-btn-icon" title="Audit Log" onclick="window.openAuditModal('${invEscapeHTML(inv.invoice_number)}')"><i class="fa-solid fa-clock-rotate-left"></i></button>
                            ${(inv.status === 'SENT' || inv.status === 'OVERDUE') ? `<button type="button" class="action-btn action-btn-toggle action-btn-icon" title="Cancel Invoice" onclick="window.cancelInvoice('${invEscapeHTML(inv.invoice_uuid)}')"><i class="fa-solid fa-ban"></i></button>` : ''}
                            <button type="button" class="action-btn action-btn-delete action-btn-icon" title="Delete Invoice" onclick="window.deleteInvoice('${invEscapeHTML(inv.invoice_uuid)}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    // List search is initialized in initInvoiceManager

    window.viewInvoicePDF = function(uuid) {
        if (window.InvoicePDF) InvoicePDF.generate(uuid);
    };

    window.deleteInvoice = function(uuid) {
        const inv = InvoiceDB.getInvoiceById(uuid);
        const invNum = inv ? inv.invoice_number : 'this invoice';
        if(confirm(`Are you sure you want to delete invoice ${invNum}? This action cannot be undone.`)) {
            const success = InvoiceDB.deleteInvoice(uuid, true);
            if (success) {
                if (inv && inv.invoice_number) {
                    window.deleteInvoiceFromGoogleSheet(inv.invoice_number);
                }
                if (window.showToast) window.showToast(`Invoice ${invNum} deleted successfully.`, 'success');
                if (typeof updateDashboardStats === 'function') updateDashboardStats();
            } else {
                if (window.showToast) window.showToast('Failed to delete invoice.', 'error');
            }
        }
    };

    window.deleteInvoiceFromGoogleSheet = async function(invoiceNumber) {
        const settings = InvoiceDB.getSettings();
        const gasUrl = settings.gasInvoiceUrl;
        if (!gasUrl || !invoiceNumber) return;
        try {
            await fetch(gasUrl, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'delete', invoice_number: invoiceNumber })
            });
        } catch (err) {
            console.log('GAS Delete sync output:', err);
        }
    };
    
    window.cancelInvoice = function(uuid) {
        if(confirm('Are you sure you want to cancel this issued invoice?')) {
            InvoiceDB.cancelInvoice(uuid);
        }
    };

    // --- CREATE / EDIT (BUILDER) ---
    function renderCreateInvoiceForm(uuid = null) {
        if (!window.InvoiceDB) return;
        const services = InvoiceDB.getServices();
        const srvSelect = document.getElementById('inv-flat-service');
        if (srvSelect) {
            srvSelect.innerHTML = '<option value="">-- Select Service (From Services Page) --</option>';
            services.forEach(s => {
                const sPrice = s.default_price !== undefined ? s.default_price : (s.price !== undefined ? s.price : 0);
                const sTax = s.default_tax_rate !== undefined ? s.default_tax_rate : (s.tax_rate !== undefined ? s.tax_rate : 18);
                const sDesc = invEscapeHTML(s.description || '');
                srvSelect.innerHTML += `<option value="${s.service_id}" data-price="${sPrice}" data-tax="${sTax}" data-desc="${sDesc}">${invEscapeHTML(s.name)}</option>`;
            });
        }

        const today = new Date().toISOString().split('T')[0];

        if (uuid) {
            const inv = InvoiceDB.getInvoiceById(uuid);
            if (inv) {
                if (document.getElementById('inv-form-uuid')) document.getElementById('inv-form-uuid').value = inv.invoice_uuid;
                if (document.getElementById('inv-form-id')) document.getElementById('inv-form-id').value = inv.invoice_number;
                if (document.getElementById('inv-form-date')) document.getElementById('inv-form-date').value = inv.invoice_date.split('T')[0];
                if (document.getElementById('inv-form-state')) document.getElementById('inv-form-state').value = inv.state_code || 'AP';
                if(document.getElementById('inv-form-payment-method')) document.getElementById('inv-form-payment-method').value = inv.payment_method || 'Online / Bank Transfer';
                if (document.getElementById('inv-flat-summary')) document.getElementById('inv-flat-summary').value = inv.notes || '';
                
                const customer = InvoiceDB.getCustomerById(inv.customer_id);
                if (customer) {
                    if (document.getElementById('inv-flat-name')) document.getElementById('inv-flat-name').value = customer.name || '';
                    if (document.getElementById('inv-flat-phone')) document.getElementById('inv-flat-phone').value = customer.phone || '';
                    if (document.getElementById('inv-flat-email')) document.getElementById('inv-flat-email').value = customer.email || '';
                }

                if (inv.items && inv.items.length > 0) {
                    const item = inv.items[0];
                    if (srvSelect && item.service_id) {
                        srvSelect.value = item.service_id;
                    }
                    if (document.getElementById('inv-flat-price')) document.getElementById('inv-flat-price').value = item.rate || 0;
                    if (document.getElementById('inv-flat-gst')) document.getElementById('inv-flat-gst').value = item.taxRate || 0;
                }
                
                // Disable certain fields if SENT or PAID
                const isLocked = (inv.status === 'SENT' || inv.status === 'PAID' || inv.status === 'PARTIALLY_PAID');
                ['inv-flat-name', 'inv-flat-phone', 'inv-flat-email', 'inv-flat-service', 'inv-flat-price', 'inv-flat-gst', 'inv-form-date', 'inv-form-state', 'inv-form-payment-method', 'inv-flat-summary'].forEach(id => {
                    if (document.getElementById(id)) document.getElementById(id).disabled = isLocked;
                });
            }
        } else {
            if (document.getElementById('inv-form-uuid')) document.getElementById('inv-form-uuid').value = '';
            if (document.getElementById('inv-form-id')) document.getElementById('inv-form-id').value = '';
            if (document.getElementById('inv-form-date')) document.getElementById('inv-form-date').value = today;
            if (document.getElementById('inv-form-state')) document.getElementById('inv-form-state').value = 'AP';
            if(document.getElementById('inv-form-payment-method')) document.getElementById('inv-form-payment-method').value = 'Online / Bank Transfer';
            if (document.getElementById('inv-flat-summary')) document.getElementById('inv-flat-summary').value = '';
            if (document.getElementById('inv-flat-name')) document.getElementById('inv-flat-name').value = '';
            if (document.getElementById('inv-flat-phone')) document.getElementById('inv-flat-phone').value = '';
            if (document.getElementById('inv-flat-email')) document.getElementById('inv-flat-email').value = '';
            if (document.getElementById('inv-flat-price')) document.getElementById('inv-flat-price').value = 0;
            if (document.getElementById('inv-flat-gst')) document.getElementById('inv-flat-gst').value = InvoiceDB.getSettings().defaultTaxRate || 18;
            if(srvSelect) srvSelect.value = '';
            
            ['inv-flat-name', 'inv-flat-phone', 'inv-flat-email', 'inv-flat-service', 'inv-flat-price', 'inv-flat-gst', 'inv-form-date', 'inv-form-state', 'inv-form-payment-method', 'inv-flat-summary'].forEach(id => {
                if (document.getElementById(id)) document.getElementById(id).disabled = false;
            });
        }
        
        window.calculateFormTotals(false);
        updateLivePreview();
    }

    window.calculateFormTotals = function(skipPreview = false) {
        const price = parseFloat(document.getElementById('inv-flat-price')?.value) || 0;
        const gstRate = parseFloat(document.getElementById('inv-flat-gst')?.value) || 0;
        
        const taxAmount = price * (gstRate / 100);
        const total = price + taxAmount;

        const totalEl = document.getElementById('inv-flat-total');
        if (totalEl) {
            totalEl.value = '₹' + total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        
        if (!skipPreview) {
            updateLivePreview();
        }
        return { subtotal: price, taxTotal: taxAmount, grandTotal: total, discount: 0, balanceDue: total };
    };



    function getCurrentInvoiceData() {
        const totals = window.calculateFormTotals(true);
        const uuid = document.getElementById('inv-form-uuid')?.value || '';
        const existingInv = uuid ? InvoiceDB.getInvoiceById(uuid) : null;
        
        const name = document.getElementById('inv-flat-name')?.value || '';
        const phone = document.getElementById('inv-flat-phone')?.value || '';
        const email = document.getElementById('inv-flat-email')?.value || '';
        
        const srvSelect = document.getElementById('inv-flat-service');
        const serviceName = srvSelect && srvSelect.selectedIndex > 0 ? srvSelect.options[srvSelect.selectedIndex].text.replace(/\s*\(₹[\d,]+\)/, '') : 'Service';
        const serviceId = srvSelect ? srvSelect.value : null;

        const date = document.getElementById('inv-form-date')?.value || new Date().toISOString().split('T')[0];
        const stateCode = document.getElementById('inv-form-state')?.value || 'AP';
        const paymentMethod = document.getElementById('inv-form-payment-method')?.value || 'Online / Bank Transfer';

        // Temporary customer_id for rendering
        let customer_id = existingInv ? existingInv.customer_id : ('CUST-' + Date.now());
        
        const item = {
            service_id: serviceId,
            description: serviceName,
            hsn: '998313', 
            qty: 1,
            rate: totals.subtotal,
            taxRate: parseFloat(document.getElementById('inv-flat-gst')?.value) || 0,
            taxAmount: totals.taxTotal,
            total: totals.grandTotal
        };

        const generatedNumber = existingInv ? existingInv.invoice_number : (document.getElementById('inv-form-id')?.value || ('SIT-INV-' + String(Date.now()).slice(-6)));
        const verifyId = existingInv ? existingInv.verification_id : ('SIT-VER-' + String(Date.now()).slice(-6));

        return {
            invoice_uuid: uuid,
            invoice_number: generatedNumber,
            verification_id: verifyId,
            customer_id: customer_id,
            customer_name: name || 'Client Name',
            customer_phone: phone,
            customer_email: email,
            invoice_date: date,
            due_date: date, // Keep same as invoice date
            state_code: stateCode,
            items: [item],
            subtotal: totals.subtotal,
            discount_amount: 0,
            tax_amount: totals.taxTotal,
            total_amount: totals.grandTotal,
            amount_paid: existingInv ? (existingInv.amount_paid || 0) : 0,
            balance_due: totals.grandTotal - (existingInv ? (existingInv.amount_paid || 0) : 0),
            payment_method: paymentMethod,
            notes: document.getElementById('inv-flat-summary')?.value || '',
            status: existingInv ? existingInv.status : 'DRAFT'
        };
    }

    let previewTimeout;
    function updateLivePreview() {
        const previewElement = document.getElementById('invoice-preview-sheet');
        if (!previewElement) return;
        clearTimeout(previewTimeout);
        previewTimeout = setTimeout(() => {
            if (window.InvoicePDF) {
                const data = getCurrentInvoiceData();
                InvoicePDF.renderLivePreview(data);
            }
        }, 10);
    }
    window.updateLivePreview = updateLivePreview;

    window.handleServiceChange = function(selectEl) {
        if (!selectEl) selectEl = document.getElementById('inv-flat-service');
        if (!selectEl) return;
        const option = selectEl.options[selectEl.selectedIndex];
        if (option && option.value) {
            const pr = option.dataset.price || '0';
            const tx = option.dataset.tax || '18';
            const ds = option.dataset.desc || '';
            const priceEl = document.getElementById('inv-flat-price');
            const gstEl = document.getElementById('inv-flat-gst');
            const sumEl = document.getElementById('inv-flat-summary');
            if (priceEl) priceEl.value = pr;
            if (gstEl) gstEl.value = tx;
            if (sumEl && (!sumEl.value || sumEl.value.trim().length === 0)) {
                sumEl.value = ds;
            }
        }
        window.calculateFormTotals(false);
    };

    // Attach reactive listeners to all builder inputs
    ['inv-flat-name', 'inv-flat-phone', 'inv-flat-email', 'inv-flat-service', 'inv-flat-price', 'inv-flat-gst', 'inv-form-date', 'inv-form-state', 'inv-form-payment-method', 'inv-flat-summary'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => { window.calculateFormTotals(false); });
            el.addEventListener('change', () => { window.calculateFormTotals(false); });
            el.addEventListener('keyup', () => { window.calculateFormTotals(false); });
        }
    });

    document.getElementById('inv-flat-service')?.addEventListener('change', (e) => {
        window.handleServiceChange(e.target);
    });

    window.saveInvoiceForm = function(targetStatus = 'DRAFT') {
        const data = getCurrentInvoiceData();
        
        if (!data.customer_name) { alert("Please enter the customer's full name."); return; }
        if (!data.items[0].service_id && !data.items[0].rate) { alert("Please select a service or enter a price."); return; }

        // Automatically create or link the customer record
        if (data.customer_id && data.customer_id.startsWith('CUST-')) {
            const customers = InvoiceDB.getCustomers();
            let existingCust = customers.find(c => c.name === data.customer_name && c.phone === data.customer_phone);
            if (existingCust) {
                data.customer_id = existingCust.customer_id;
            } else {
                InvoiceDB.saveCustomer({
                    customer_id: undefined,
                    name: data.customer_name,
                    phone: data.customer_phone,
                    email: data.customer_email
                });
                const updatedCustomers = InvoiceDB.getCustomers();
                data.customer_id = updatedCustomers[updatedCustomers.length - 1].customer_id;
            }
        }

        // Prevent lowering status backwards (except cancelled)
        if (data.status === 'PAID' || data.status === 'PARTIALLY_PAID' || data.status === 'SENT') {
            data.status = data.status; // keep original status if it's already issued
        } else {
            data.status = targetStatus;
        }

        const saved = InvoiceDB.saveInvoice(data);
        
        // Populate UUID immediately if newly created
        if (!document.getElementById('inv-form-uuid')?.value && saved) {
             if (document.getElementById('inv-form-uuid')) document.getElementById('inv-form-uuid').value = saved.invoice_uuid;
             if (document.getElementById('inv-form-id')) document.getElementById('inv-form-id').value = saved.invoice_number;
        }

        if(window.showToast) window.showToast('Invoice Saved Successfully!', 'success');
        
        return saved;
    };

    window.generateFinalInvoice = function() {
        const data = getCurrentInvoiceData();
        if (data.status === 'SENT' || data.status === 'PAID') {
            // Already generated, just download
            window.viewInvoicePDF(data.invoice_uuid);
            return;
        }

        if(confirm("Are you sure you want to generate the final invoice? Once issued, items cannot be modified.")) {
            const saved = window.saveInvoiceForm('SENT');
            if (saved) {
                switchInvoiceView('list');
                window.viewInvoicePDF(saved.invoice_uuid);
                if (window.syncInvoicesToGoogleSheet) window.syncInvoicesToGoogleSheet(saved);
            }
        }
    };

    window.downloadInvoicePDF = function() {
        let uuid = document.getElementById('inv-form-uuid')?.value;
        if (!uuid) {
            const saved = window.saveInvoiceForm('DRAFT');
            if (saved) uuid = saved.invoice_uuid;
        }
        if (uuid) {
            window.viewInvoicePDF(uuid);
        }
    };

    window.sendInvoiceEmail = function() {
        let uuid = document.getElementById('inv-form-uuid')?.value;
        let invoiceNum = document.getElementById('inv-form-id')?.value || 'Invoice';
        if (!uuid) {
            const saved = window.saveInvoiceForm('DRAFT');
            if (saved) {
                uuid = saved.invoice_uuid;
                invoiceNum = saved.invoice_number;
            } else return;
        }
        const email = document.getElementById('inv-flat-email')?.value;
        if (email) {
            const verifyLink = window.location.origin + '/verify.html?id=' + window.InvoiceDB.getInvoiceById(uuid).verification_id;
            const body = `Hello,\n\nPlease find your official invoice (${invoiceNum}) from Shaivika IT Technologies.\n\nYou can securely view and download your PDF invoice online using this link:\n${verifyLink}\n\nThank you for your business!`;
            window.location.href = `mailto:${email}?subject=Invoice ${invoiceNum} from Shaivika IT Technologies&body=${encodeURIComponent(body)}`;
        } else {
            alert('Please enter a customer email in the builder before sending.');
        }
    };

    window.sendInvoiceWhatsApp = function() {
        let uuid = document.getElementById('inv-form-uuid')?.value;
        let invoiceNum = document.getElementById('inv-form-id')?.value || 'Invoice';
        if (!uuid) {
            const saved = window.saveInvoiceForm('DRAFT');
            if (saved) {
                uuid = saved.invoice_uuid;
                invoiceNum = saved.invoice_number;
            } else return;
        }
        const phone = document.getElementById('inv-flat-phone')?.value;
        if (phone) {
            let cleanPhone = phone.replace(/\D/g, '');
            if(cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
            const verifyLink = window.location.origin + '/verify.html?id=' + window.InvoiceDB.getInvoiceById(uuid).verification_id;
            const text = `Hello! Please find your official invoice (${invoiceNum}) from *Shaivika IT Technologies*.\n\nYou can securely view and download your PDF invoice here:\n${verifyLink}\n\nThank you!`;
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
        } else {
            alert('Please enter a customer phone number in the builder before sending.');
        }
    };


    // --- CUSTOMERS ---
    function renderCustomersList() {
        const customers = InvoiceDB.getCustomers();
        const tbody = document.getElementById('inv-cust-body');
        const searchTerm = (document.getElementById('inv-search-customers')?.value || '').toLowerCase();
        if(!tbody) return;

        tbody.innerHTML = '';
        const filtered = customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            (c.company && c.company.toLowerCase().includes(searchTerm)) ||
            (c.customer_id && c.customer_id.toLowerCase().includes(searchTerm))
        );

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">No customers found.</td></tr>`;
            return;
        }

        filtered.forEach(c => {
            tbody.innerHTML += `
                <tr>
                    <td><span class="tag tag-cyan">${invEscapeHTML(c.customer_id)}</span></td>
                    <td><strong>${invEscapeHTML(c.name)}</strong></td>
                    <td>${invEscapeHTML(c.company || '-')}</td>
                    <td>${invEscapeHTML(c.email || '-')}</td>
                    <td>
                        <div class="action-btns">
                            <button type="button" class="action-btn action-btn-edit" onclick="window.editCustomer('${invEscapeHTML(c.customer_id)}')" title="Edit Customer">
                                <i class="fa-solid fa-pen"></i> <span>Edit</span>
                            </button>
                            <button type="button" class="action-btn action-btn-delete" onclick="window.deleteCustomer('${invEscapeHTML(c.customer_id)}')" title="Delete Customer">
                                <i class="fa-solid fa-trash"></i> <span>Delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    document.getElementById('inv-search-customers')?.addEventListener('input', renderCustomersList);

    window.deleteCustomer = function(id) {
        const c = InvoiceDB.getCustomerById(id);
        if (!c) return;
        if (confirm(`Are you sure you want to delete customer "${c.name}"?`)) {
            InvoiceDB.deleteCustomer(id);
            renderCustomersList();
            if (window.showToast) window.showToast('Customer deleted.', 'success');
        }
    };

    window.openCustomerModal = function(id = null) {
        document.getElementById('inv-cust-id').value = '';
        document.getElementById('inv-cust-name').value = '';
        document.getElementById('inv-cust-company').value = '';
        document.getElementById('inv-cust-email').value = '';
        document.getElementById('inv-cust-phone').value = '';
        document.getElementById('inv-cust-gstin').value = '';
        document.getElementById('inv-cust-pan').value = '';
        document.getElementById('inv-cust-address').value = '';
        document.getElementById('invCustomerModalTitle').innerText = 'Add Customer';

        if (id) {
            const c = InvoiceDB.getCustomerById(id);
            if (c) {
                document.getElementById('invCustomerModalTitle').innerText = 'Edit Customer';
                document.getElementById('inv-cust-id').value = c.customer_id;
                document.getElementById('inv-cust-name').value = c.name || '';
                document.getElementById('inv-cust-company').value = c.company || '';
                document.getElementById('inv-cust-email').value = c.email || '';
                document.getElementById('inv-cust-phone').value = c.phone || '';
                document.getElementById('inv-cust-gstin').value = c.gstin || '';
                document.getElementById('inv-cust-pan').value = c.pan || '';
                document.getElementById('inv-cust-address').value = c.address || '';
            }
        }
        document.getElementById('invCustomerModal').classList.add('open');
    };

    window.editCustomer = function(id) { window.openCustomerModal(id); };

    window.saveCustomerRecord = function() {
        const id = document.getElementById('inv-cust-id').value;
        const name = document.getElementById('inv-cust-name').value.trim();
        if (!name) { alert('Name is required'); return; }

        InvoiceDB.saveCustomer({
            customer_id: id || undefined,
            name: name,
            company: document.getElementById('inv-cust-company').value,
            email: document.getElementById('inv-cust-email').value,
            phone: document.getElementById('inv-cust-phone').value,
            gstin: document.getElementById('inv-cust-gstin').value,
            pan: document.getElementById('inv-cust-pan').value,
            address: document.getElementById('inv-cust-address').value,
        });

        document.getElementById('invCustomerModal').classList.remove('open');
        if(window.showToast) window.showToast('Customer saved!', 'success');
        
        renderCustomersList();
        if (currentInvoiceView === 'create') renderCreateInvoiceForm(currentInvoiceContext); // update dropdown
    };


    // --- SERVICES ---
    function renderServicesList() {
        const services = InvoiceDB.getServices();
        const tbody = document.getElementById('inv-srv-body');
        const searchTerm = (document.getElementById('inv-search-services')?.value || '').toLowerCase();
        if(!tbody) return;

        tbody.innerHTML = '';
        const filtered = services.filter(s => 
            s.name.toLowerCase().includes(searchTerm) || 
            (s.service_id && s.service_id.toLowerCase().includes(searchTerm))
        );

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No services found.</td></tr>`;
            return;
        }

        filtered.forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td><span class="tag tag-cyan">${invEscapeHTML(s.service_id)}</span></td>
                    <td><strong>${invEscapeHTML(s.name)}</strong></td>
                    <td>${invEscapeHTML(s.hsn || '-')}</td>
                    <td>₹${Number(s.price).toLocaleString('en-IN')} (${s.tax_rate}%)</td>
                    <td>
                        <div class="action-btns">
                            <button type="button" class="action-btn action-btn-edit" onclick="window.editService('${invEscapeHTML(s.service_id)}')" title="Edit Service">
                                <i class="fa-solid fa-pen"></i> <span>Edit</span>
                            </button>
                            <button type="button" class="action-btn action-btn-delete" onclick="window.deleteService('${invEscapeHTML(s.service_id)}')" title="Delete Service">
                                <i class="fa-solid fa-trash"></i> <span>Delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    document.getElementById('inv-search-services')?.addEventListener('input', renderServicesList);

    window.deleteService = function(id) {
        const s = InvoiceDB.getServiceById(id);
        if (!s) return;
        if (confirm(`Are you sure you want to delete service "${s.name}"?`)) {
            InvoiceDB.deleteService(id);
            renderServicesList();
            if (window.showToast) window.showToast('Service deleted.', 'success');
        }
    };

    window.openServiceModal = function(id = null) {
        document.getElementById('inv-srv-id').value = '';
        document.getElementById('inv-srv-name').value = '';
        document.getElementById('inv-srv-desc').value = '';
        document.getElementById('inv-srv-hsn').value = '';
        document.getElementById('inv-srv-tax').value = InvoiceDB.getSettings().defaultTaxRate;
        document.getElementById('inv-srv-price').value = 0;
        document.getElementById('invServiceModalTitle').innerText = 'Add Service';

        if (id) {
            const s = InvoiceDB.getServiceById(id);
            if (s) {
                document.getElementById('invServiceModalTitle').innerText = 'Edit Service';
                document.getElementById('inv-srv-id').value = s.service_id;
                document.getElementById('inv-srv-name').value = s.name || '';
                document.getElementById('inv-srv-desc').value = s.description || '';
                document.getElementById('inv-srv-hsn').value = s.hsn || '';
                document.getElementById('inv-srv-tax').value = s.tax_rate || 18;
                document.getElementById('inv-srv-price').value = s.price || 0;
            }
        }
        document.getElementById('invServiceModal').classList.add('open');
    };

    window.editService = function(id) { window.openServiceModal(id); };

    window.saveServiceRecord = function() {
        const id = document.getElementById('inv-srv-id').value;
        const name = document.getElementById('inv-srv-name').value.trim();
        if (!name) { alert('Name is required'); return; }

        InvoiceDB.saveService({
            service_id: id || undefined,
            name: name,
            description: document.getElementById('inv-srv-desc').value,
            hsn: document.getElementById('inv-srv-hsn').value,
            tax_rate: parseFloat(document.getElementById('inv-srv-tax').value) || 0,
            price: parseFloat(document.getElementById('inv-srv-price').value) || 0
        });

        document.getElementById('invServiceModal').classList.remove('open');
        if(window.showToast) window.showToast('Service saved!', 'success');
        renderServicesList();
    };

    window.openServiceSelectorModal = function() {
        const tbody = document.getElementById('inv-srv-selector-body');
        const services = InvoiceDB.getServices();
        tbody.innerHTML = '';
        if(services.length === 0) {
            tbody.innerHTML = `<tr><td style="text-align:center;">No services in database. Add some first.</td></tr>`;
        } else {
            services.forEach(s => {
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${invEscapeHTML(s.name)}</strong><br><small>${invEscapeHTML(s.hsn||'')}</small></td>
                        <td>₹${Number(s.price).toLocaleString('en-IN')}</td>
                        <td style="text-align:right;"><button class="btn btn-sm btn-primary" onclick="window.selectServiceForInvoice('${invEscapeHTML(s.service_id)}')">Add</button></td>
                    </tr>
                `;
            });
        }
        document.getElementById('invSelectServiceModal').classList.add('open');
    };

    window.selectServiceForInvoice = function(id) {
        const s = InvoiceDB.getServiceById(id);
        if (s) {
            const srvSelect = document.getElementById('inv-flat-service');
            if (srvSelect) srvSelect.value = s.service_id;
            if (document.getElementById('inv-flat-price')) document.getElementById('inv-flat-price').value = s.price || 0;
            if (document.getElementById('inv-flat-gst')) document.getElementById('inv-flat-gst').value = s.tax_rate || 18;
            calculateFormTotals();
            document.getElementById('invSelectServiceModal')?.classList.remove('open');
            if(window.showToast) window.showToast('Service selected.', 'info');
        }
    };


    // --- SETTINGS ---
    function renderSettings() {
        const settings = InvoiceDB.getSettings();
        document.getElementById('inv-set-companyName').value = settings.companyName || '';
        document.getElementById('inv-set-tagline').value = settings.companyTagline || '';
        document.getElementById('inv-set-email').value = settings.companyEmail || '';
        document.getElementById('inv-set-phone').value = settings.companyPhone || '';
        document.getElementById('inv-set-address').value = settings.companyAddress || '';
        document.getElementById('inv-set-gstin').value = settings.gstin || '';
        document.getElementById('inv-set-pan').value = settings.pan || '';
        
        document.getElementById('inv-set-bankName').value = settings.bankName || '';
        document.getElementById('inv-set-accountName').value = settings.accountName || '';
        document.getElementById('inv-set-accountNo').value = settings.accountNo || '';
        document.getElementById('inv-set-ifsc').value = settings.ifsc || '';
        document.getElementById('inv-set-upiId').value = settings.upiId || '';
        document.getElementById('inv-set-defaultTaxRate').value = settings.defaultTaxRate || 18;
        document.getElementById('inv-set-defaultTerms').value = settings.defaultTerms || '';
        if (document.getElementById('inv-set-gasInvoiceUrl')) {
            document.getElementById('inv-set-gasInvoiceUrl').value = settings.gasInvoiceUrl || '';
        }
    }

    window.saveBillingSettings = function() {
        const settings = InvoiceDB.getSettings();
        settings.companyName = document.getElementById('inv-set-companyName').value;
        settings.companyTagline = document.getElementById('inv-set-tagline').value;
        settings.companyEmail = document.getElementById('inv-set-email').value;
        settings.companyPhone = document.getElementById('inv-set-phone').value;
        settings.companyAddress = document.getElementById('inv-set-address').value;
        settings.gstin = document.getElementById('inv-set-gstin').value;
        settings.pan = document.getElementById('inv-set-pan').value;
        
        settings.bankName = document.getElementById('inv-set-bankName').value;
        settings.accountName = document.getElementById('inv-set-accountName').value;
        settings.accountNo = document.getElementById('inv-set-accountNo').value;
        settings.ifsc = document.getElementById('inv-set-ifsc').value;
        settings.upiId = document.getElementById('inv-set-upiId').value;
        settings.defaultTaxRate = parseFloat(document.getElementById('inv-set-defaultTaxRate').value) || 18;
        settings.defaultTerms = document.getElementById('inv-set-defaultTerms').value;
        if (document.getElementById('inv-set-gasInvoiceUrl')) {
            settings.gasInvoiceUrl = document.getElementById('inv-set-gasInvoiceUrl').value.trim();
        }

        InvoiceDB.saveSettings(settings);
        if(window.showToast) window.showToast('Settings saved successfully.', 'success');
    };

    window.syncInvoicesToGoogleSheet = async function(singleInvoice = null) {
        const settings = InvoiceDB.getSettings();
        const gasUrl = settings.gasInvoiceUrl || (document.getElementById('inv-set-gasInvoiceUrl') ? document.getElementById('inv-set-gasInvoiceUrl').value.trim() : '');
        if (!gasUrl) {
            if (window.showToast) window.showToast('Please enter your Google Apps Script Web App URL in Billing Settings.', 'warning');
            else alert('Please enter your Google Apps Script Web App URL in Billing Settings.');
            return;
        }

        const payload = singleInvoice ? singleInvoice : InvoiceDB.getInvoices();
        if (Array.isArray(payload) && payload.length === 0) {
            if (window.showToast) window.showToast('No invoices found to sync.', 'info');
            return;
        }

        try {
            if (window.showToast) window.showToast('Syncing invoice(s) to Google Sheet...', 'info');
            const res = await fetch(gasUrl, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.status === 'success') {
                if (window.showToast) window.showToast(json.message || 'Synced to Google Sheet!', 'success');
            } else {
                if (window.showToast) window.showToast('Google Sheet Sync Error: ' + (json.message || 'Failed'), 'error');
            }
        } catch (err) {
            console.log('GAS Sync output:', err);
            if (window.showToast) window.showToast('Invoice sync request sent to Google Sheet!', 'success');
        }
    };

    // --- PAYMENTS & AUDIT ---
    window.openPaymentModal = function(invoiceNumber) {
        document.getElementById('inv-pay-invoice-id').value = invoiceNumber;
        const inv = InvoiceDB.getInvoices().find(i => i.invoice_number === invoiceNumber);
        document.getElementById('inv-pay-amount').value = inv ? inv.balance_due : '';
        document.getElementById('inv-pay-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('inv-pay-ref').value = '';
        document.getElementById('invPaymentModal').classList.add('open');
    };

    window.savePaymentRecord = function() {
        const invNum = document.getElementById('inv-pay-invoice-id').value;
        const amt = parseFloat(document.getElementById('inv-pay-amount').value);
        if (!invNum || !amt || amt <= 0) { alert("Invalid amount."); return; }

        InvoiceDB.savePayment({
            invoice_number: invNum,
            amount: amt,
            method: document.getElementById('inv-pay-method').value,
            reference: document.getElementById('inv-pay-ref').value,
            date: document.getElementById('inv-pay-date').value
        });
        
        document.getElementById('invPaymentModal').classList.remove('open');
        if(window.showToast) window.showToast('Payment recorded!', 'success');
    };

    window.openAuditModal = function(invoiceNumber) {
        const logs = InvoiceDB.getAuditLogs(invoiceNumber);
        const list = document.getElementById('inv-audit-list');
        list.innerHTML = '';
        
        if (logs.length === 0) {
            list.innerHTML = `<li style="text-align:center; color:var(--text-muted);">No logs found.</li>`;
        } else {
            logs.forEach(log => {
                list.innerHTML += `
                    <li>
                        <div>
                            <strong>${invEscapeHTML(log.action)}</strong>
                            <div class="audit-meta">${new Date(log.timestamp).toLocaleString('en-IN')} by ${invEscapeHTML(log.user)}</div>
                        </div>
                        <span class="tag ${getStatusColor(log.status)}">${invEscapeHTML(log.status)}</span>
                    </li>
                `;
            });
        }
        document.getElementById('invAuditModal').classList.add('open');
    };

    function getStatusColor(status) {
        switch(status) {
            case 'PAID': return 'tag-green';
            case 'SENT': return 'tag-blue';
            case 'DRAFT': return 'tag-purple';
            case 'OVERDUE': return 'tag-amber';
            case 'CANCELLED': return 'tag-red';
            case 'PARTIALLY_PAID': return 'tag-cyan';
            case 'PAYMENT': return 'tag-green';
            default: return 'tag-blue';
        }
    }

    // Event Listeners for DB Updates
    window.addEventListener('shaivika_invoice_updated', () => {
        if(currentInvoiceView === 'dashboard') renderDashboard();
        if(currentInvoiceView === 'list') renderInvoiceList();
    });

    // Global event delegation for invoice nav buttons & filter pills
    document.addEventListener('click', function(e) {
        const navBtn = e.target.closest('.inv-nav-btn');
        if (navBtn && navBtn.dataset.view) {
            e.preventDefault();
            window.switchInvoiceView(navBtn.dataset.view);
            return;
        }
        const dashBtn = e.target.closest('#inv-dash-filter-pills button');
        if (dashBtn && dashBtn.dataset.dashFilter) {
            e.preventDefault();
            window.setInvoiceDashFilter(dashBtn.dataset.dashFilter);
            return;
        }
        const listBtn = e.target.closest('#inv-list-filter-pills button');
        if (listBtn && listBtn.dataset.listFilter) {
            e.preventDefault();
            window.setInvoiceListFilter(listBtn.dataset.listFilter);
            return;
        }
    }, true);

    function initInvoiceManager() {
        // Search listeners
        document.getElementById('inv-dash-search')?.addEventListener('input', renderDashboard);
        document.getElementById('inv-search-invoices')?.addEventListener('input', renderInvoiceList);
        document.getElementById('inv-search-customers')?.addEventListener('input', renderCustomersList);
        document.getElementById('inv-search-services')?.addEventListener('input', renderServicesList);

        // Builder inputs reactive binding
        ['inv-flat-name', 'inv-flat-phone', 'inv-flat-email', 'inv-flat-service', 'inv-flat-price', 'inv-flat-gst', 'inv-form-date', 'inv-form-state', 'inv-form-payment-method', 'inv-flat-summary'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => window.calculateFormTotals());
            document.getElementById(id)?.addEventListener('change', () => window.calculateFormTotals());
        });

        document.getElementById('inv-flat-service')?.addEventListener('change', (e) => {
            const option = e.target.options[e.target.selectedIndex];
            if (option && option.dataset.price) {
                document.getElementById('inv-flat-price').value = option.dataset.price;
                document.getElementById('inv-flat-gst').value = option.dataset.tax || 18;
                window.calculateFormTotals();
            }
        });

        if (window._pendingInvoiceView) {
            const p = window._pendingInvoiceView;
            window._pendingInvoiceView = null;
            window.switchInvoiceView(p.viewId, p.context);
        } else {
            window.switchInvoiceView('dashboard');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInvoiceManager);
    } else {
        initInvoiceManager();
    }
})();
