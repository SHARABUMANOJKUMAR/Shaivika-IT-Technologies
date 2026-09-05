(function() {
    window.toggleOtherServiceField = function(value) {
        const group = document.getElementById('inv-other-service-group');
        const input = document.getElementById('inv-flat-other-service');
        const isOther = value === 'others';
        if (group) group.style.display = isOther ? '' : 'none';
        if (input) {
            input.required = isOther;
            if (!isOther) input.value = '';
        }
    };

    function getPreviewData() {
        const serviceSelect = document.getElementById('inv-flat-service');
        const selected = serviceSelect?.selectedOptions[0];
        const price = Number(document.getElementById('inv-flat-price')?.value || 0);
        const taxRate = Number(document.getElementById('inv-flat-gst')?.value || 0);
        const taxAmount = price * taxRate / 100;
        const total = price + taxAmount;
        const totalField = document.getElementById('inv-flat-total');
        if (totalField) totalField.value = total.toFixed(2);
        const paymentMethod = document.getElementById('inv-form-payment-method')?.value || 'Online / Bank Transfer';
        const invoiceNumber = document.getElementById('inv-form-id')?.value || 'INV-PREVIEW';
        const verificationOrigin = window.location.protocol === 'https:' && !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
            ? window.location.origin : 'https://shaivika-it-technologies.netlify.app';
        const serviceName = selected?.value === 'others'
            ? (document.getElementById('inv-flat-other-service')?.value.trim() || 'Other Service')
            : (selected?.textContent.trim() || 'Service');

        return {
            verification_id: 'SIT-VER-PREVIEW',
            verificationId: invoiceNumber,
            verificationUrl: `${verificationOrigin}/verify.html?id=${encodeURIComponent(invoiceNumber)}`,
            invoice_number: invoiceNumber,
            customer_name: document.getElementById('inv-flat-name')?.value || '',
            customer_phone: document.getElementById('inv-flat-phone')?.value || '',
            customer_email: document.getElementById('inv-flat-email')?.value || '',
            invoice_date: document.getElementById('inv-form-date')?.value || '',
            due_date: document.getElementById('inv-form-date')?.value || '',
            state_code: document.getElementById('inv-form-state')?.value || 'AP',
            payment_method: paymentMethod,
            paymentMethod,
            status: 'DRAFT',
            notes: document.getElementById('inv-flat-summary')?.value || '',
            subtotal: price,
            tax_amount: taxAmount,
            total_amount: total,
            items: [{
                description: serviceName,
                qty: 1,
                rate: price,
                taxRate: taxRate,
                taxAmount: taxAmount,
                total: total
            }]
        };
    }

    function renderPreview() {
        if (window.InvoicePDF?.renderLivePreview) {
            window.InvoicePDF.renderLivePreview(getPreviewData());
        }
    }

    function bindPreview() {
        if (window.__invoicePreviewBound) return;
        window.__invoicePreviewBound = true;

        ['inv-flat-name', 'inv-flat-phone', 'inv-flat-email', 'inv-flat-service',
            'inv-flat-other-service', 'inv-flat-price', 'inv-flat-gst', 'inv-form-date',
            'inv-form-state', 'inv-flat-summary'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', renderPreview);
            document.getElementById(id)?.addEventListener('change', renderPreview);
        });

        document.addEventListener('change', event => {
            if (event.target?.id === 'inv-flat-service') {
                window.toggleOtherServiceField(event.target.value);
            }
        });

        window.toggleOtherServiceField(document.getElementById('inv-flat-service')?.value || '');

        renderPreview();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindPreview);
    } else {
        bindPreview();
    }

    window.renderInvoicePreview = renderPreview;
})();