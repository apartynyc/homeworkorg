// routes/assignments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');

// Get all assignments for a user
router.get('/', auth, async (req, res) => {
    try {
        const assignments = await Assignment.find({ user: req.user.id })
            .populate('class', 'name')
            .sort({ dueDate: 1 });
        res.json(assignments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get assignments for a specific class
router.get('/class/:classId', auth, async (req, res) => {
    try {
        const assignments = await Assignment.find({
            class: req.params.classId,
            user: req.user.id
        }).sort({ dueDate: 1 });
        res.json(assignments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a new assignment
router.post('/', auth, async (req, res) => {
    try {
        const { name, classId, dueDate, priority } = req.body;

        // Verify class exists and belongs to user
        const classItem = await Class.findOne({
            _id: classId,
            user: req.user.id
        });

        if (!classItem) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        const newAssignment = new Assignment({
            name,
            class: classId,
            dueDate,
            priority,
            user: req.user.id
        });

        const assignment = await newAssignment.save();
        res.json(assignment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update an assignment
router.put('/:id', auth, async (req, res) => {
    try {
        let assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ msg: 'Assignment not found' });
        }

        // Make sure user owns assignment
        if (assignment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { name, dueDate, priority, completed } = req.body;
        const assignmentFields = {};
        if (name) assignmentFields.name = name;
        if (dueDate) assignmentFields.dueDate = dueDate;
        if (priority) assignmentFields.priority = priority;
        if (completed !== undefined) assignmentFields.completed = completed;

        assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { $set: assignmentFields },
            { new: true }
        );

        res.json(assignment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Toggle assignment completion status
router.put('/:id/toggle', auth, async (req, res) => {
    try {
        let assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ msg: 'Assignment not found' });
        }

        // Make sure user owns assignment
        if (assignment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { $set: { completed: !assignment.completed } },
            { new: true }
        );

        res.json(assignment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete an assignment
router.delete('/:id', auth, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ msg: 'Assignment not found' });
        }

        // Make sure user owns assignment
        if (assignment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await assignment.remove();
        res.json({ msg: 'Assignment removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;