/**
 * SHAIVIKA IT TECHNOLOGIES - Invoice Database Manager
 * Handles local storage for Invoices, Customers, and Services.
 */

const InvoiceDB = {
    // Keys
    K_INVOICES: 'shaivika_invoices',
    K_CUSTOMERS: 'shaivika_customers',
    K_SERVICES: 'shaivika_services',
    K_SETTINGS: 'shaivika_invoice_settings',

    // Default Settings
    defaultSettings: {
        companyName: 'Shaivika IT Technologies',
        companyAddress: 'Kadapa, Andhra Pradesh, India',
        companyEmail: 'contact@shaivikait.com',
        companyPhone: '+91 90000 00000',
        bankName: 'HDFC Bank',
        accountName: 'Shaivika IT',
        accountNo: '50100XXXXXXX',
        ifsc: 'HDFC0001234',
        defaultTaxRate: 18,
        invoicePrefix: 'SIT-INV-',
        nextSequence: 1000
    },

    init: function() {
        if (!localStorage.getItem(this.K_INVOICES)) localStorage.setItem(this.K_INVOICES, JSON.stringify([]));
        if (!localStorage.getItem(this.K_CUSTOMERS)) localStorage.setItem(this.K_CUSTOMERS, JSON.stringify([]));
        if (!localStorage.getItem(this.K_SERVICES)) localStorage.setItem(this.K_SERVICES, JSON.stringify([]));
        if (!localStorage.getItem(this.K_SETTINGS)) localStorage.setItem(this.K_SETTINGS, JSON.stringify(this.defaultSettings));
    },

    getSettings: function() {
        return JSON.parse(localStorage.getItem(this.K_SETTINGS)) || this.defaultSettings;
    },

    saveSettings: function(settings) {
        localStorage.setItem(this.K_SETTINGS, JSON.stringify(settings));
    },

    // --- CUSTOMERS ---
    getCustomers: function() {
        return JSON.parse(localStorage.getItem(this.K_CUSTOMERS)) || [];
    },

    saveCustomer: function(customer) {
        const customers = this.getCustomers();
        if (!customer.id) {
            customer.id = 'SIT-CUS-' + Date.now().toString().slice(-6);
            customer.createdAt = new Date().toISOString();
            customers.push(customer);
        } else {
            const index = customers.findIndex(c => c.id === customer.id);
            if (index !== -1) customers[index] = { ...customers[index], ...customer };
            else customers.push(customer);
        }
        localStorage.setItem(this.K_CUSTOMERS, JSON.stringify(customers));
        return customer;
    },

    // --- SERVICES ---
    getServices: function() {
        return JSON.parse(localStorage.getItem(this.K_SERVICES)) || [];
    },

    saveService: function(service) {
        const services = this.getServices();
        if (!service.id) {
            service.id = 'SRV-' + Date.now().toString().slice(-6);
            services.push(service);
        } else {
            const index = services.findIndex(s => s.id === service.id);
            if (index !== -1) services[index] = { ...services[index], ...service };
            else services.push(service);
        }
        localStorage.setItem(this.K_SERVICES, JSON.stringify(services));
        return service;
    },

    // --- INVOICES ---
    generateInvoiceNumber: function() {
        const settings = this.getSettings();
        const year = new Date().getFullYear();
        // SIT-INV-2026-0001000
        const invNum = `${settings.invoicePrefix}${year}-${String(settings.nextSequence).padStart(6, '0')}`;
        
        // Auto increment
        settings.nextSequence += 1;
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
            invoice.invoice_number = invoice.invoice_number || this.generateInvoiceNumber();
            invoice.verification_id = 'SIT-VER-' + invoice.invoice_uuid.split('-')[0].toUpperCase();
            invoice.created_at = new Date().toISOString();
            invoice.status = invoice.status || 'DRAFT';
            invoices.unshift(invoice); // Add to top
        } else {
            // Update
            invoice.updated_at = new Date().toISOString();
            const index = invoices.findIndex(i => i.invoice_uuid === invoice.invoice_uuid);
            if (index !== -1) invoices[index] = invoice;
            else invoices.unshift(invoice);
        }
        
        localStorage.setItem(this.K_INVOICES, JSON.stringify(invoices));
        this.logAudit(invoice.invoice_number, 'Saved Invoice', invoice.status);
        
        // Dispatch event for UI update
        window.dispatchEvent(new Event('shaivika_invoice_updated'));
        return invoice;
    },
    
    deleteInvoice: function(uuid) {
        let invoices = this.getInvoices();
        invoices = invoices.filter(i => i.invoice_uuid !== uuid);
        localStorage.setItem(this.K_INVOICES, JSON.stringify(invoices));
        window.dispatchEvent(new Event('shaivika_invoice_updated'));
    },

    // --- AUDIT LOGS ---
    logAudit: function(invoiceNumber, action, status) {
        let logs = JSON.parse(localStorage.getItem('shaivika_invoice_logs')) || [];
        logs.unshift({
            invoice_number: invoiceNumber,
            action: action,
            status: status,
            timestamp: new Date().toISOString(),
            user: 'Admin'
        });
        if (logs.length > 500) logs = logs.slice(0, 500);
        localStorage.setItem('shaivika_invoice_logs', JSON.stringify(logs));
    },
    
    getAuditLogs: function(invoiceNumber) {
        const logs = JSON.parse(localStorage.getItem('shaivika_invoice_logs')) || [];
        if (invoiceNumber) return logs.filter(l => l.invoice_number === invoiceNumber);
        return logs;
    }
};

// Initialize on load
InvoiceDB.init();
