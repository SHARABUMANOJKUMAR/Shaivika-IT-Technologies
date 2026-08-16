/**
 * SHAIVIKA IT TECHNOLOGIES - Invoice UI Manager
 * Handles UI rendering and interactions for the Invoice System.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Only run if the invoice tab exists
    const invoiceTab = document.getElementById('invoice-generator-tab');
    if (!invoiceTab) return;

    // Current State
    let currentInvoiceView = 'dashboard'; // dashboard, list, create, view, customers, services, settings
    let currentInvoiceContext = null; // Used when editing/viewing a specific invoice

    // Setup Sub-Navigation
    const invNavBtns = document.querySelectorAll('.inv-nav-btn');
    const invViews = document.querySelectorAll('.inv-view');

    function switchInvoiceView(viewId, context = null) {
        currentInvoiceView = viewId;
        currentInvoiceContext = context;

        // Update nav buttons
        invNavBtns.forEach(btn => {
            if (btn.dataset.view === viewId) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // Hide all views, show target
        invViews.forEach(view => {
            view.style.display = 'none';
        });

        const targetView = document.getElementById(`inv-view-${viewId}`);
        if (targetView) {
            targetView.style.display = 'block';
            targetView.style.animation = 'fadeInUp 0.3s ease forwards';
        }

        // Trigger specific render logic
        if (viewId === 'dashboard') renderDashboard();
        if (viewId === 'list') renderInvoiceList();
        if (viewId === 'create') renderCreateInvoiceForm(context);
        if (viewId === 'customers') renderCustomersList();
        if (viewId === 'services') renderServicesList();
    }

    invNavBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchInvoiceView(btn.dataset.view);
        });
    });

    // ---------------------------------------------------------
    // DASHBOARD VIEW
    // ---------------------------------------------------------
    function renderDashboard() {
        const invoices = InvoiceDB.getInvoices();
        
        let totalRevenue = 0;
        let pendingAmt = 0;
        let overdueCount = 0;

        const now = new Date();

        invoices.forEach(inv => {
            if (inv.status === 'PAID') totalRevenue += (inv.amount_paid || inv.total_amount);
            if (inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID') {
                pendingAmt += (inv.balance_due || inv.total_amount);
                
                const due = new Date(inv.due_date);
                if (due < now) overdueCount++;
            }
        });

        document.getElementById('inv-dash-total-inv').innerText = invoices.length;
        document.getElementById('inv-dash-revenue').innerText = '₹' + totalRevenue.toLocaleString('en-IN');
        document.getElementById('inv-dash-pending').innerText = '₹' + pendingAmt.toLocaleString('en-IN');
        document.getElementById('inv-dash-overdue').innerText = overdueCount;

        // Render Recent 5 Invoices
        const recentBody = document.getElementById('inv-dash-recent-body');
        if (!recentBody) return;

        recentBody.innerHTML = '';
        const recent = invoices.slice(0, 5);

        if (recent.length === 0) {
            recentBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">No invoices yet.</td></tr>`;
            return;
        }

        recent.forEach(inv => {
            const statusColor = getStatusColor(inv.status);
            recentBody.innerHTML += `
                <tr>
                    <td><strong>${inv.invoice_number}</strong></td>
                    <td>${inv.customer_name || 'N/A'}</td>
                    <td>₹${(inv.total_amount || 0).toLocaleString('en-IN')}</td>
                    <td><span class="tag ${statusColor}">${inv.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-ghost" onclick="window.viewInvoice('${inv.invoice_uuid}')">View</button>
                    </td>
                </tr>
            `;
        });
    }

    // ---------------------------------------------------------
    // LIST VIEW
    // ---------------------------------------------------------
    function renderInvoiceList() {
        const invoices = InvoiceDB.getInvoices();
        const tbody = document.getElementById('inv-list-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (invoices.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color:var(--text-muted);">No invoices found. <br><br><button class="btn btn-primary" onclick="document.querySelector('[data-view=create]').click()">Create Invoice</button></td></tr>`;
            return;
        }

        invoices.forEach(inv => {
            const statusColor = getStatusColor(inv.status);
            tbody.innerHTML += `
                <tr>
                    <td><strong>${inv.invoice_number}</strong><br><small style="color:var(--text-muted)">${new Date(inv.invoice_date).toLocaleDateString()}</small></td>
                    <td>${inv.customer_name || 'N/A'}</td>
                    <td>₹${(inv.total_amount || 0).toLocaleString('en-IN')}</td>
                    <td><span class="tag ${statusColor}">${inv.status}</span></td>
                    <td>₹${(inv.balance_due || 0).toLocaleString('en-IN')}</td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="btn btn-sm btn-ghost" title="View" onclick="window.viewInvoice('${inv.invoice_uuid}')">👁️</button>
                            <button class="btn btn-sm btn-ghost" title="Edit" onclick="window.editInvoice('${inv.invoice_uuid}')">✏️</button>
                            ${inv.status === 'DRAFT' ? `<button class="btn btn-sm btn-ghost" style="color:var(--danger)" title="Delete" onclick="window.deleteInvoice('${inv.invoice_uuid}')">🗑️</button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    function getStatusColor(status) {
        switch(status) {
            case 'PAID': return 'tag-green';
            case 'SENT': return 'tag-blue';
            case 'DRAFT': return 'tag-purple';
            case 'OVERDUE': return 'tag-amber';
            case 'CANCELLED': return 'tag-red';
            case 'PARTIALLY_PAID': return 'tag-cyan';
            default: return 'tag-blue';
        }
    }

    // Global hooks for inline onclick
    window.viewInvoice = function(uuid) {
        // We will build a detailed view modal or switch view later
        // For now, redirect to PDF generation logic
        if (window.InvoicePDF) {
            window.InvoicePDF.generate(uuid);
        } else {
            alert('PDF Generator not loaded.');
        }
    };

    window.editInvoice = function(uuid) {
        switchInvoiceView('create', uuid);
    };

    window.deleteInvoice = function(uuid) {
        if(confirm('Are you sure you want to delete this draft invoice?')) {
            InvoiceDB.deleteInvoice(uuid);
            renderInvoiceList();
            renderDashboard();
        }
    };

    // ---------------------------------------------------------
    // CREATE / EDIT VIEW
    // ---------------------------------------------------------
    let currentInvoiceItems = [];

    function renderCreateInvoiceForm(uuid = null) {
        const customers = InvoiceDB.getCustomers();
        const custSelect = document.getElementById('inv-form-customer');
        if (custSelect) {
            custSelect.innerHTML = '<option value="">-- Select Customer --</option>';
            customers.forEach(c => {
                custSelect.innerHTML += `<option value="${c.id}">${c.name} (${c.company || 'Individual'})</option>`;
            });
        }

        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];

        if (uuid) {
            const inv = InvoiceDB.getInvoiceById(uuid);
            if (inv) {
                document.getElementById('inv-form-id').value = inv.invoice_number;
                document.getElementById('inv-form-date').value = inv.invoice_date.split('T')[0];
                document.getElementById('inv-form-due').value = inv.due_date.split('T')[0];
                if(custSelect) custSelect.value = inv.customer_id || '';
                currentInvoiceItems = inv.items || [];
                document.getElementById('inv-form-notes').value = inv.notes || '';
            }
        } else {
            // New
            document.getElementById('inv-form-id').value = InvoiceDB.generateInvoiceNumber();
            document.getElementById('inv-form-date').value = today;
            document.getElementById('inv-form-due').value = nextWeek;
            if(custSelect) custSelect.value = '';
            currentInvoiceItems = [];
            document.getElementById('inv-form-notes').value = InvoiceDB.getSettings().defaultNotes || 'Thank you for your business!';
        }

        renderInvoiceItemsTable();
    }

    function renderInvoiceItemsTable() {
        const tbody = document.getElementById('inv-form-items-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (currentInvoiceItems.length === 0) {
            currentInvoiceItems.push({ description: '', qty: 1, rate: 0, taxRate: 18 });
        }

        currentInvoiceItems.forEach((item, index) => {
            const amt = (item.qty * item.rate);
            const tax = amt * (item.taxRate / 100);
            const total = amt + tax;

            tbody.innerHTML += `
                <tr>
                    <td><input type="text" class="inv-input form-desc" data-idx="${index}" value="${item.description}" placeholder="Item description"></td>
                    <td><input type="number" class="inv-input form-qty" data-idx="${index}" value="${item.qty}" min="1" style="width:70px"></td>
                    <td><input type="number" class="inv-input form-rate" data-idx="${index}" value="${item.rate}" min="0" style="width:100px"></td>
                    <td>
                        <select class="inv-input form-tax" data-idx="${index}">
                            <option value="0" ${item.taxRate==0?'selected':''}>0%</option>
                            <option value="5" ${item.taxRate==5?'selected':''}>5%</option>
                            <option value="12" ${item.taxRate==12?'selected':''}>12%</option>
                            <option value="18" ${item.taxRate==18?'selected':''}>18%</option>
                            <option value="28" ${item.taxRate==28?'selected':''}>28%</option>
                        </select>
                    </td>
                    <td style="text-align:right; font-weight:600;">₹${amt.toLocaleString('en-IN')}</td>
                    <td style="text-align:right; font-weight:700; color:var(--primary)">₹${total.toLocaleString('en-IN')}</td>
                    <td><button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="window.removeInvoiceItem(${index})">✕</button></td>
                </tr>
            `;
        });

        // Attach listeners
        document.querySelectorAll('#inv-form-items-body .inv-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const idx = e.target.dataset.idx;
                if (e.target.classList.contains('form-desc')) currentInvoiceItems[idx].description = e.target.value;
                if (e.target.classList.contains('form-qty')) currentInvoiceItems[idx].qty = parseFloat(e.target.value) || 0;
                if (e.target.classList.contains('form-rate')) currentInvoiceItems[idx].rate = parseFloat(e.target.value) || 0;
                if (e.target.classList.contains('form-tax')) currentInvoiceItems[idx].taxRate = parseFloat(e.target.value) || 0;
                
                // Debounce render to prevent input focus loss issues - actually just calc totals
                calculateFormTotals();
            });
            inp.addEventListener('change', () => {
                renderInvoiceItemsTable(); // Re-render to update row totals on blur/change
            });
        });

        calculateFormTotals();
    }

    window.addInvoiceItemRow = function() {
        currentInvoiceItems.push({ description: '', qty: 1, rate: 0, taxRate: InvoiceDB.getSettings().defaultTaxRate || 18 });
        renderInvoiceItemsTable();
    };

    window.removeInvoiceItem = function(idx) {
        currentInvoiceItems.splice(idx, 1);
        renderInvoiceItemsTable();
    };

    function calculateFormTotals() {
        let subtotal = 0;
        let taxTotal = 0;

        currentInvoiceItems.forEach(item => {
            const amt = item.qty * item.rate;
            subtotal += amt;
            taxTotal += amt * (item.taxRate / 100);
        });

        const grandTotal = subtotal + taxTotal;

        document.getElementById('inv-form-subtotal').innerText = '₹' + subtotal.toLocaleString('en-IN', {minimumFractionDigits:2});
        document.getElementById('inv-form-taxtotal').innerText = '₹' + taxTotal.toLocaleString('en-IN', {minimumFractionDigits:2});
        document.getElementById('inv-form-grandtotal').innerText = '₹' + grandTotal.toLocaleString('en-IN', {minimumFractionDigits:2});

        return { subtotal, taxTotal, grandTotal };
    }

    window.saveInvoiceForm = function(status = 'DRAFT') {
        const custSelect = document.getElementById('inv-form-customer');
        const customerId = custSelect ? custSelect.value : '';
        const customerName = custSelect && custSelect.selectedIndex > 0 ? custSelect.options[custSelect.selectedIndex].text : '';
        
        if (!customerId) {
            alert("Please select a customer.");
            return;
        }

        if (currentInvoiceItems.length === 0 || currentInvoiceItems.every(i => !i.description.trim())) {
            alert("Please add at least one valid item.");
            return;
        }

        const totals = calculateFormTotals();

        const invoice = {
            invoice_uuid: currentInvoiceContext || '',
            invoice_number: document.getElementById('inv-form-id').value,
            customer_id: customerId,
            customer_name: customerName,
            invoice_date: new Date(document.getElementById('inv-form-date').value).toISOString(),
            due_date: new Date(document.getElementById('inv-form-due').value).toISOString(),
            items: currentInvoiceItems,
            subtotal: totals.subtotal,
            tax_amount: totals.taxTotal,
            total_amount: totals.grandTotal,
            amount_paid: 0,
            balance_due: totals.grandTotal,
            notes: document.getElementById('inv-form-notes').value,
            status: status
        };

        const saved = InvoiceDB.saveInvoice(invoice);
        
        if (status === 'SENT') {
            alert('Invoice saved and marked as SENT.');
            window.viewInvoice(saved.invoice_uuid); // Triggers PDF download
        } else {
            alert('Invoice Draft Saved.');
            switchInvoiceView('list');
        }
    };

    // ---------------------------------------------------------
    // CUSTOMERS VIEW
    // ---------------------------------------------------------
    function renderCustomersList() {
        const customers = InvoiceDB.getCustomers();
        const tbody = document.getElementById('inv-cust-body');
        if(!tbody) return;

        tbody.innerHTML = '';
        if (customers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No customers found.</td></tr>`;
            return;
        }

        customers.forEach(c => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.company || '-'}</td>
                    <td>${c.email || '-'}</td>
                    <td>${c.gstin || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-ghost" onclick="editCustomer('${c.id}')">Edit</button>
                    </td>
                </tr>
            `;
        });
    }

    window.saveNewCustomer = function() {
        const name = prompt("Customer/Contact Name:");
        if(!name) return;
        const company = prompt("Company Name (optional):") || '';
        const email = prompt("Email:") || '';
        const gstin = prompt("GSTIN (optional):") || '';
        const address = prompt("Address:") || '';

        InvoiceDB.saveCustomer({ name, company, email, gstin, address });
        renderCustomersList();
        
        // If we are currently in create invoice form, re-render it to update dropdown
        if (currentInvoiceView === 'create') renderCreateInvoiceForm(currentInvoiceContext);
    };


    // ---------------------------------------------------------
    // INITIALIZATION
    // ---------------------------------------------------------
    
    // Listen for DB updates to refresh current view
    window.addEventListener('shaivika_invoice_updated', () => {
        if(currentInvoiceView === 'dashboard') renderDashboard();
        if(currentInvoiceView === 'list') renderInvoiceList();
    });

    // Default view
    switchInvoiceView('dashboard');
});
