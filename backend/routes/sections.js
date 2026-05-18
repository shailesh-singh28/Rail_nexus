const express = require('express');
const Section = require('../models/Section');
const { protect, restrict } = require('../middleware/auth');

const router = express.Router();

// GET /api/sections/:majorSectionId — list by major section
router.get('/:majorSectionId', protect, async (req, res) => {
  try {
    const sections = await Section.find({
      majorSection: req.params.majorSectionId,
      isActive: true
    }).sort('name');
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sections.' });
  }
});

// POST /api/sections — create (admin only)
router.post('/', protect, restrict('admin'), async (req, res) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/sections/:id — update (admin only)
router.patch('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!section) return res.status(404).json({ error: 'Section not found.' });
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/sections/:id — soft delete (admin only)
router.delete('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!section) return res.status(404).json({ error: 'Section not found.' });
    res.json({ message: 'Section deactivated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
