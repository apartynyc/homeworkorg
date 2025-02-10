// models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    color: {
        type: String,
        default: '#2196F3' // Default blue color
    },
    description: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('Class', classSchema);