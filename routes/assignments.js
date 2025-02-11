// routes/assignments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');

// Get all assignments for logged in user
router.get('/', auth, async (req, res) => {
    try {
        const assignments = await Assignment.find({ user: req.user.id })
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
        const { name, class: classId, dueDate, priority } = req.body;

        const newAssignment = new Assignment({
            name,
            class: classId,
            user: req.user.id,  // Set the user ID from the auth token
            dueDate,
            priority
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

        // Verify the assignment belongs to the user
        if (assignment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { name, dueDate, priority } = req.body;
        assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    name, 
                    dueDate, 
                    priority 
                } 
            },
            { new: true }
        );

        res.json(assignment);
    } catch (err) {
        console.error('Error updating assignment:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Toggle assignment completion
router.put('/:id/toggle', auth, async (req, res) => {
    try {
        let assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ msg: 'Assignment not found' });
        }

        // Verify the assignment belongs to the user
        if (assignment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        assignment.completed = !assignment.completed;
        if (assignment.completed) {
            assignment.completedAt = Date.now();
        } else {
            assignment.completedAt = null;
        }

        await assignment.save();
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

        // Verify the assignment belongs to the user
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