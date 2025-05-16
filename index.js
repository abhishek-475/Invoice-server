require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('./connection/db')

const app = express();
app.use(cors());
app.use(express.json())


const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes');


app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/invoices', invoiceRoutes)



const PORT = 5000 || process.env.PORT



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));