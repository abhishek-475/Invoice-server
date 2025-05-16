const express = require('express')
const jwt_Middle = require('../middleware/jwtMiddle')
const { createInvoice, getInvoices, updateInvoice, deleteInvoice} = require('../controller/invoiceController');

const router = express.Router();


router.post('/', jwt_Middle, createInvoice);
router.get('/', jwt_Middle, updateInvoice);
router.put('/:invoiceNumber', jwt_Middle, updateInvoice);
router.delete('/', jwt_Middle, deleteInvoice);


module.exports = router;