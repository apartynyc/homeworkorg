// routes/assignments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');

// Get all assignments for a user
router.get('/', auth, async (req, res) => {
    try {
        const assignments = await Assignment.find({ user: req.user.id })
            .populate('class', 'name')
            .sort({ dueDate: 1 });
        res.json(assignments);
    } catch (err) {
        console.error('Error fetching assignments:', err);
        res.status(500).json({ msg: 'Server error' });
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
        console.error('Error fetching class assignments:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Add a new assignment
router.post('/', auth, async (req, res) => {
    try {
        const { name, class: classId, dueDate, priority, description } = req.body;

        const newAssignment = new Assignment({
            name,
            class: classId,
            dueDate,
            priority,
            description,
            user: req.user.id
        });

        const assignment = await newAssignment.save();
        res.json(assignment);
    } catch (err) {
        console.error('Error creating assignment:', err);
        res.status(500).json({ msg: 'Server error' });
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

        const { name, dueDate, priority, completed, description } = req.body;
        const assignmentFields = {};
        if (name) assignmentFields.name = name;
        if (dueDate) assignmentFields.dueDate = dueDate;
        if (priority) assignmentFields.priority = priority;
        if (description) assignmentFields.description = description;
        if (completed !== undefined) assignmentFields.completed = completed;

        assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { $set: assignmentFields },
            { new: true }
        );

        res.json(assignment);
    } catch (err) {
        console.error('Error updating assignment:', err);
        res.status(500).json({ msg: 'Server error' });
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
        console.error('Error toggling assignment:', err);
        res.status(500).json({ msg: 'Server error' });
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
        console.error('Error deleting assignment:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;