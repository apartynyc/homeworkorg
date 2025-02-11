// routes/classes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Class = require('../models/Class');

// Get all classes for logged in user
router.get('/', auth, async (req, res) => {
    try {
        const classes = await Class.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(classes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Add a new class
router.post('/', auth, async (req, res) => {
    try {
        const newClass = new Class({
            name: req.body.name,
            user: req.user.id,
            color: req.body.color || '#2196F3',
            description: req.body.description
        });

        const classItem = await newClass.save();
        res.json(classItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update a class
router.put('/:id', auth, async (req, res) => {
    try {
        let classItem = await Class.findById(req.params.id);
        
        // Check if class exists
        if (!classItem) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        // Make sure user owns class
        if (classItem.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Update the class
        classItem = await Class.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(classItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete a class
router.delete('/:id', auth, async (req, res) => {
    try {
        const classItem = await Class.findById(req.params.id);

        if (!classItem) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        // Make sure user owns class
        if (classItem.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await classItem.remove();
        res.json({ msg: 'Class removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;