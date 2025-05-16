const Invoice = require('../models/invoiceModel')


const getFinancialYear = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    return d.getMonth() < 3 ? `${year - 1}-${year}` : `${year}-${year + 1}`;
};


exports.createInvoice = async (req, res) => {
    const { invoiceNumber, invoiceDate, invoiceAmount } = req.body;
    const { userId } = req.user;

    try {
        const financialYear = getFinancialYear(invoiceDate);

        // Date validation
        const sameFYInvoices = await Invoice.find({ financialYear }).sort({ invoiceNumber: 1 });

        const prev = sameFYInvoices.find(inv => inv.invoiceNumber === invoiceNumber - 1);
        const next = sameFYInvoices.find(inv => inv.invoiceNumber === invoiceNumber + 1);

        if (prev && new Date(invoiceDate) <= new Date(prev.invoiceDate)) {
            return res.status(400).json({ error: `Invoice date should be after invoice #${prev.invoiceNumber}` });
        }
        if (next && new Date(invoiceDate) >= new Date(next.invoiceDate)) {
            return res.status(400).json({ error: `Invoice date should be before invoice #${next.invoiceNumber}` });
        }

        const newInvoice = new Invoice({
            invoiceNumber,
            invoiceDate,
            invoiceAmount,
            financialYear,
            createdBy: userId
        });

        await newInvoice.save();
        res.status(201).json({ message: 'Invoice created', invoice: newInvoice });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



exports.getInvoices = async (req, res) => {
    const { page = 1, limit = 10, fy, startDate, endDate, search } = req.query;

    const filters = {};

    if (fy) filters.financialYear = fy;
    if (search) filters.invoiceNumber = search;
    if (startDate && endDate) {
        filters.invoiceDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    try {
        const invoices = await Invoice.find(filters)
            .sort({ invoiceNumber: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Invoice.countDocuments(filters);

        res.json({ invoices, total, page: parseInt(page), pages: Math.ceil(total / limit) });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateInvoice = async (req, res) => {
    const { invoiceNumber } = req.params;
    const { invoiceDate, invoiceAmount } = req.body;

    try {
        const existing = await Invoice.findOne({ invoiceNumber });

        if (!existing) return res.status(404).json({ error: 'Invoice not found' });

        const financialYear = getFinancialYear(invoiceDate);
        const sameFYInvoices = await Invoice.find({ financialYear }).sort({ invoiceNumber: 1 });

        const prev = sameFYInvoices.find(inv => inv.invoiceNumber === existing.invoiceNumber - 1);
        const next = sameFYInvoices.find(inv => inv.invoiceNumber === existing.invoiceNumber + 1);

        if (prev && new Date(invoiceDate) <= new Date(prev.invoiceDate)) {
            return res.status(400).json({ error: `Invoice date should be after invoice #${prev.invoiceNumber}` });
        }
        if (next && new Date(invoiceDate) >= new Date(next.invoiceDate)) {
            return res.status(400).json({ error: `Invoice date should be before invoice #${next.invoiceNumber}` });
        }

        existing.invoiceDate = invoiceDate;
        existing.invoiceAmount = invoiceAmount;
        existing.financialYear = financialYear;

        await existing.save();
        res.json({ message: 'Invoice updated', invoice: existing });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.deleteInvoice = async (req, res) => {
    const { ids } = req.body; // Array of invoice IDs

    try {
        await Invoice.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Invoices deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

