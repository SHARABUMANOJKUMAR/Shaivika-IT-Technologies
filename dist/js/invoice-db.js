/**
 * SHAIVIKA IT TECHNOLOGIES - Invoice Database Manager
 * Handles local storage for Invoices, Customers, Services, and Payments.
 */

window.InvoiceDB = {
    // Keys
    K_INVOICES: 'shaivika_invoices',
    K_CUSTOMERS: 'shaivika_customers',
    K_SERVICES: 'shaivika_services',
    K_SETTINGS: 'shaivika_invoice_settings',
    K_PAYMENTS: 'shaivika_payments',
    K_AUDIT: 'shaivika_invoice_logs',

    // Default Settings
    defaultSettings: {
        companyName: 'Shaivika IT Technologies',
        companyTagline: 'Empowering Digital Transformation',
        companyAddress: 'Kadapa, Andhra Pradesh, India',
        companyEmail: 'shaivikagroups@gmail.com',
        companyPhone: '+91 7981431094',
        companyWebsite: 'https://shaivikaittechnologies.in/',
        gstin: '',
        pan: '',
        bankName: 'HDFC Bank',
        accountName: 'Shaivika IT Technologies',
        accountNo: '50100XXXXXXX',
        ifsc: 'HDFC0001234',
        upiId: 'shaivika@hdfcbank',
        defaultTaxRate: 18,
        defaultCurrency: '₹',
        invoicePrefix: 'SIT-INV-',
        customerPrefix: 'SIT-CLI-',
        servicePrefix: 'SIT-SRV-',
        nextInvoiceSeq: 127,
        nextCustomerSeq: 1,
        nextServiceSeq: 1,
        defaultTerms: '1. Payment is due within 15 days.\n2. Late payment is subject to 1.5% monthly interest.\n3. All disputes are subject to Kadapa jurisdiction.',
        gasInvoiceUrl: 'https://script.google.com/macros/s/AKfycbyoSibvTqZNQbmm5AhtYZVUYiy8zUYoToPeQGzY6je3MUPqFJAZO9mk_xa9vT73Fx186w/exec'
    },

    init: function() {
        if (!localStorage.getItem(this.K_INVOICES)) localStorage.setItem(this.K_INVOICES, JSON.stringify([]));
        if (!localStorage.getItem(this.K_CUSTOMERS)) localStorage.setItem(this.K_CUSTOMERS, JSON.stringify([]));
        if (!localStorage.getItem(this.K_SERVICES)) localStorage.setItem(this.K_SERVICES, JSON.stringify([]));
        if (!localStorage.getItem(this.K_PAYMENTS)) localStorage.setItem(this.K_PAYMENTS, JSON.stringify([]));
        if (!localStorage.getItem(this.K_AUDIT)) localStorage.setItem(this.K_AUDIT, JSON.stringify([]));
        
        const existingSettings = JSON.parse(localStorage.getItem(this.K_SETTINGS));
        if (!existingSettings) {
            localStorage.setItem(this.K_SETTINGS, JSON.stringify(this.defaultSettings));
        } else {
            // Merge defaults in case new keys were added
            localStorage.setItem(this.K_SETTINGS, JSON.stringify({ ...this.defaultSettings, ...existingSettings }));
        }
    },

    getSettings: function() {
        return JSON.parse(localStorage.getItem(this.K_SETTINGS)) || this.defaultSettings;
    },

    saveSettings: function(settings) {
        localStorage.setItem(this.K_SETTINGS, JSON.stringify(settings));
        window.dispatchEvent(new Event('shaivika_settings_updated'));
    },

    // --- CUSTOMERS ---
    getCustomers: function() {
        return JSON.parse(localStorage.getItem(this.K_CUSTOMERS)) || [];
    },
    
    getCustomerById: function(id) {
        return this.getCustomers().find(c => c.customer_id === id);
    },

    saveCustomer: function(customer) {
        const customers = this.getCustomers();
        const settings = this.getSettings();
        
        if (!customer.customer_id) {
            customer.customer_id = `${settings.customerPrefix}${String(settings.nextCustomerSeq).padStart(6, '0')}`;
            customer.created_at = new Date().toISOString();
            customer.status = customer.status || 'ACTIVE';
            customers.push(customer);
            
            settings.nextCustomerSeq += 1;
            this.saveSettings(settings);
        } else {
            const index = customers.findIndex(c => c.customer_id === customer.customer_id);
            if (index !== -1) {
                customer.updated_at = new Date().toISOString();
                customers[index] = { ...customers[index], ...customer };
            } else {
                customers.push(customer);
            }
        }
        localStorage.setItem(this.K_CUSTOMERS, JSON.stringify(customers));
        return customer;
    },

    deleteCustomer: function(id) {
        let customers = this.getCustomers();
        customers = customers.filter(c => c.customer_id !== id);
        localStorage.setItem(this.K_CUSTOMERS, JSON.stringify(customers));
        return true;
    },

    // --- SERVICES ---
    getServices: function() {
        return JSON.parse(localStorage.getItem(this.K_SERVICES)) || [];
    },

    getServiceById: function(id) {
        return this.getServices().find(s => s.service_id === id);
    },

    saveService: function(service) {
        const services = this.getServices();
        const settings = this.getSettings();

        if (!service.service_id) {
            service.service_id = `${settings.servicePrefix}${String(settings.nextServiceSeq).padStart(6, '0')}`;
            service.created_at = new Date().toISOString();
            service.status = service.status || 'ACTIVE';
            services.push(service);
            
            settings.nextServiceSeq += 1;
            this.saveSettings(settings);
        } else {
            const index = services.findIndex(s => s.service_id === service.service_id);
            if (index !== -1) {
                service.updated_at = new Date().toISOString();
                services[index] = { ...services[index], ...service };
            } else {
                services.push(service);
            }
        }
        localStorage.setItem(this.K_SERVICES, JSON.stringify(services));
        return service;
    },

    deleteService: function(id) {
        let services = this.getServices();
        services = services.filter(s => s.service_id !== id);
        localStorage.setItem(this.K_SERVICES, JSON.stringify(services));
        return true;
    },

    // --- INVOICES ---
    generateInvoiceNumber: function(year) {
        const settings = this.getSettings();
        const y = year || new Date().getFullYear();
        // SIT-INV-2026-000127
        const invNum = `${settings.invoicePrefix}${y}-${String(settings.nextInvoiceSeq).padStart(6, '0')}`;
        
        // Auto increment
        settings.nextInvoiceSeq += 1;
        this.saveSettings(settings);
        
        return invNum;
    },

    generateUUID: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    getInvoices: function() {
        return JSON.parse(localStorage.getItem(this.K_INVOICES)) || [];
    },

    getInvoiceById: function(id) {
        const invoices = this.getInvoices();
        return invoices.find(i => i.invoice_number === id || i.invoice_uuid === id || i.verification_id === id);
    },

    saveInvoice: function(invoice) {
        const invoices = this.getInvoices();
        
        if (!invoice.invoice_uuid) {
            // New Invoice
            invoice.invoice_uuid = this.generateUUID();
            const year = new Date(invoice.invoice_date || new Date()).getFullYear();
            invoice.invoice_number = invoice.invoice_number || this.generateInvoiceNumber(year);
            // SIT-VER-YYYY-XXXX
            const seqPart = invoice.invoice_number.split('-').pop();
            invoice.verification_id = `SIT-VER-${year}-${seqPart}`;
            invoice.created_at = new Date().toISOString();
            invoice.status = invoice.status || 'DRAFT';
            invoices.unshift(invoice); // Add to top
            this.logAudit(invoice.invoice_number, 'Created Invoice', invoice.status);
        } else {
            // Update Existing Invoice
            const index = invoices.findIndex(i => i.invoice_uuid === invoice.invoice_uuid);
            if (index !== -1) {
                const existing = invoices[index];
                
                // IMMUTABILITY CHECK
                // If invoice is SENT or PAID, only specific fields like status, payments, notes can be updated.
                if (existing.status === 'SENT' || existing.status === 'PAID' || existing.status === 'PARTIALLY_PAID') {
                    // Allowed updates: status, amount_paid, balance_due, payments related
                    existing.status = invoice.status;
                    existing.amount_paid = invoice.amount_paid;
                    existing.balance_due = invoice.balance_due;
                    existing.updated_at = new Date().toISOString();
                    invoices[index] = existing;
                    this.logAudit(existing.invoice_number, `Updated Invoice Status/Payment (${invoice.status})`, existing.status);
                } else {
                    // Fully editable DRAFT/OVERDUE (if not sent)
                    invoice.updated_at = new Date().toISOString();
                    invoices[index] = { ...existing, ...invoice };
                    this.logAudit(invoice.invoice_number, 'Updated Invoice Draft', invoice.status);
                }
            } else {
                invoices.unshift(invoice);
            }
        }
        
        localStorage.setItem(this.K_INVOICES, JSON.stringify(invoices));
        
        // Dispatch event for UI update
        window.dispatchEvent(new Event('shaivika_invoice_updated'));
        return invoice;
    },
    
    cancelInvoice: function(uuid) {
        const invoices = this.getInvoices();
        const index = invoices.findIndex(i => i.invoice_uuid === uuid);
        if (index !== -1) {
            invoices[index].status = 'CANCELLED';
            invoices[index].updated_at = new Date().toISOString();
            localStorage.setItem(this.K_INVOICES, JSON.stringify(invoices));
            this.logAudit(invoices[index].invoice_number, 'Cancelled Invoice', 'CANCELLED');
            window.dispatchEvent(new Event('shaivika_invoice_updated'));
        }
    },
    
    fetchRemoteInvoices: async function() {
        const settings = this.getSettings();
        const gasUrl = settings.gasInvoiceUrl;
        if (!gasUrl) return [];
        try {
            const res = await fetch(`${gasUrl}?action=getInvoices`);
            const json = await res.json();
            if (json && json.status === 'success' && Array.isArray(json.invoices)) {
                // Keep local-only invoices (like DRAFTs that haven't been synced) and merge with remote
                const localInvoices = this.getInvoices().filter(i => i.status === 'DRAFT');
                const remoteInvoices = json.invoices;
                
                // For remote invoices, ensure we map the keys to match local structure if needed
                // The backend getInvoiceRecords maps them back perfectly.
                
                // Overwrite local storage entirely (keeping only drafts + remote)
                const combinedInvoices = [...localInvoices, ...remoteInvoices];
                
                // Sort by descending date
                combinedInvoices.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                
                localStorage.setItem(this.K_INVOICES, JSON.stringify(combinedInvoices));
                
                // Dispatch event so UI updates
                window.dispatchEvent(new Event('shaivika_invoice_updated'));
                return combinedInvoices;
            }
        } catch (err) {
            console.warn('Failed to fetch remote invoices:', err);
        }
        return this.getInvoices();
    },
    
    deleteInvoice: function(uuid, force = true) {
        let invoices = this.getInvoices();
        const invoice = invoices.find(i => i.invoice_uuid === uuid || i.invoice_number === uuid);
        if (!invoice) return false;
        if (!force && invoice.status !== 'DRAFT') {
            console.error("Cannot delete a non-draft invoice without force option.");
            return false;
        }
        invoices = invoices.filter(i => i.invoice_uuid !== invoice.invoice_uuid);
        localStorage.setItem(this.K_INVOICES, JSON.stringify(invoices));
        this.logAudit(invoice.invoice_number, 'Deleted Invoice', 'DELETED');
        window.dispatchEvent(new Event('shaivika_invoice_updated'));
        return true;
    },

    // --- PAYMENTS ---
    getPayments: function(invoiceNumber = null) {
        const payments = JSON.parse(localStorage.getItem(this.K_PAYMENTS)) || [];
        if (invoiceNumber) return payments.filter(p => p.invoice_number === invoiceNumber);
        return payments;
    },

    savePayment: function(payment) {
        const payments = JSON.parse(localStorage.getItem(this.K_PAYMENTS)) || [];
        if (!payment.payment_id) {
            payment.payment_id = 'PAY-' + Date.now().toString().slice(-6);
            payment.created_at = new Date().toISOString();
            payments.push(payment);
        } else {
            const index = payments.findIndex(p => p.payment_id === payment.payment_id);
            if (index !== -1) payments[index] = { ...payments[index], ...payment };
            else payments.push(payment);
        }
        localStorage.setItem(this.K_PAYMENTS, JSON.stringify(payments));
        
        // Auto update invoice totals
        this.recalculateInvoicePaymentStatus(payment.invoice_number);
        
        this.logAudit(payment.invoice_number, `Recorded Payment of ₹${payment.amount}`, 'PAYMENT');
        window.dispatchEvent(new Event('shaivika_payment_updated'));
        window.dispatchEvent(new Event('shaivika_invoice_updated'));
        return payment;
    },

    recalculateInvoicePaymentStatus: function(invoiceNumber) {
        const invoice = this.getInvoiceById(invoiceNumber);
        if (!invoice) return;

        const payments = this.getPayments(invoiceNumber);
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const balance = Number(invoice.total_amount) - totalPaid;

        invoice.amount_paid = totalPaid;
        invoice.balance_due = balance;

        if (balance <= 0) {
            invoice.status = 'PAID';
        } else if (totalPaid > 0) {
            invoice.status = 'PARTIALLY_PAID';
        } else {
            // Keep existing status (SENT, OVERDUE, etc.) or set to SENT if it was paid and refunded
            if (invoice.status === 'PAID' || invoice.status === 'PARTIALLY_PAID') {
                 const due = new Date(invoice.due_date);
                 if (due < new Date()) invoice.status = 'OVERDUE';
                 else invoice.status = 'SENT';
            }
        }
        this.saveInvoice(invoice);
    },

    // --- AUDIT LOGS ---
    logAudit: function(invoiceNumber, action, status) {
        let logs = JSON.parse(localStorage.getItem(this.K_AUDIT)) || [];
        logs.unshift({
            log_id: 'LOG-' + Date.now().toString().slice(-6),
            invoice_number: invoiceNumber,
            action: action,
            status: status,
            timestamp: new Date().toISOString(),
            user: 'Admin'
        });
        if (logs.length > 2000) logs = logs.slice(0, 2000);
        localStorage.setItem(this.K_AUDIT, JSON.stringify(logs));
    },
    
    getAuditLogs: function(invoiceNumber) {
        const logs = JSON.parse(localStorage.getItem(this.K_AUDIT)) || [];
        if (invoiceNumber) return logs.filter(l => l.invoice_number === invoiceNumber);
        return logs;
    }
};

const InvoiceDB = window.InvoiceDB;

// Initialize on load
InvoiceDB.init();
