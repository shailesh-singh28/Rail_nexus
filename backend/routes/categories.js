const express = require('express');
const Category = require('../models/Category');
const { protect, restrict } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories/:mainCategoryId
router.get('/:mainCategoryId', protect, async (req, res) => {
  try {
    const categories = await Category.find({
      mainCategory: req.params.mainCategoryId,
      isActive: true
    }).sort('name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// POST /api/categories (admin only)
router.post('/', protect, restrict('admin'), async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/categories/:id (admin only)
router.patch('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) return res.status(404).json({ error: 'Category not found.' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id — soft delete (admin only)
router.delete('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!category) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: 'Category deactivated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
