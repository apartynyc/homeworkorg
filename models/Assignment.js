// models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    completed: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    },
    attachments: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

// Add index to improve query performance
assignmentSchema.index({ user: 1, class: 1, dueDate: 1 });

// Middleware to update completedAt when assignment is marked complete
assignmentSchema.pre('save', function(next) {
    if (this.isModified('completed') && this.completed) {
        this.completedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);