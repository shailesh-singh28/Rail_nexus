const express = require('express');
const MainCategory = require('../models/MainCategory');
const { protect, restrict } = require('../middleware/auth');

const router = express.Router();

// GET /api/main-categories
router.get('/', protect, async (req, res) => {
  try {
    const categories = await MainCategory.find({ isActive: true }).sort('name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch main categories.' });
  }
});

// POST /api/main-categories (admin only)
router.post('/', protect, restrict('admin'), async (req, res) => {
  try {
    const category = await MainCategory.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Main category name already exists.' });
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/main-categories/:id (admin only)
router.patch('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const category = await MainCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) return res.status(404).json({ error: 'Main category not found.' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/main-categories/:id — soft delete (admin only)
router.delete('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const category = await MainCategory.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!category) return res.status(404).json({ error: 'Main category not found.' });
    res.json({ message: 'Main category deactivated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
