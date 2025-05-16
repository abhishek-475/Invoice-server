const mongoose = require('mongoose');

mongoose
  .connect(process.env.DB_CONNECTION, {
    
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));