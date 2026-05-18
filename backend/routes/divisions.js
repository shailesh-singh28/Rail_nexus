const express = require('express');
const Division = require('../models/Division');
const { protect, restrict } = require('../middleware/auth');

const router = express.Router();

// GET /api/divisions — list all active divisions
router.get('/', protect, async (req, res) => {
  try {
    const divisions = await Division.find({ isActive: true }).sort('name');
    res.json(divisions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch divisions.' });
  }
});

// POST /api/divisions — create (admin only)
router.post('/', protect, restrict('admin'), async (req, res) => {
  try {
    const division = await Division.create(req.body);
    res.status(201).json(division);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Division name already exists.' });
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/divisions/:id — update (admin only)
router.patch('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const division = await Division.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!division) return res.status(404).json({ error: 'Division not found.' });
    res.json(division);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/divisions/:id — soft delete (admin only)
router.delete('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const division = await Division.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!division) return res.status(404).json({ error: 'Division not found.' });
    res.json({ message: 'Division deactivated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
