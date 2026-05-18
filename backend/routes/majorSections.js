const express = require('express');
const MajorSection = require('../models/MajorSection');
const { protect, restrict } = require('../middleware/auth');

const router = express.Router();

// GET /api/major-sections/:divisionId — list by division
router.get('/:divisionId', protect, async (req, res) => {
  try {
    const sections = await MajorSection.find({
      division: req.params.divisionId,
      isActive: true
    }).sort('name');
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch major sections.' });
  }
});

// POST /api/major-sections — create (admin only)
router.post('/', protect, restrict('admin'), async (req, res) => {
  try {
    const section = await MajorSection.create(req.body);
    res.status(201).json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/major-sections/:id — update (admin only)
router.patch('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const section = await MajorSection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!section) return res.status(404).json({ error: 'Major section not found.' });
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/major-sections/:id — soft delete (admin only)
router.delete('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const section = await MajorSection.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!section) return res.status(404).json({ error: 'Major section not found.' });
    res.json({ message: 'Major section deactivated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
