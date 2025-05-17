const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'ADMIN', 'UNIT_MANAGER', 'USER'],
        default: 'USER',
        required: true
    },
    password: {
        type: String,
        required: true
    },
     uniqueId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    group: { 
        type: String 
    },
       timezone: { 
      type: String,
      default: 'UTC'
    }
},{timestamps: true}
)

module.exports = mongoose.model('User', userSchema)