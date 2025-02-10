// routes/classes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Class = require('../models/Class');

// Get all classes for a user
router.get('/', auth, async (req, res) => {
    try {
        const classes = await Class.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(classes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a new class
router.post('/', auth, async (req, res) => {
    try {
        const newClass = new Class({
            name: req.body.name,
            user: req.user.id
        });

        const classItem = await newClass.save();
        res.json(classItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a class
router.delete('/:id', auth, async (req, res) => {
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

        await classItem.remove();
        res.json({ msg: 'Class removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Class not found' });
        }
        res.status(500).send('Server Error');
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

        classItem = await Class.findByIdAndUpdate(
            req.params.id,
            { $set: { name: req.body.name } },
            { new: true }
        );

        res.json(classItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;