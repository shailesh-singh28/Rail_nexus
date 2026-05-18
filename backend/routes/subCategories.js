const express = require('express');
const SubCategory = require('../models/SubCategory');
const { protect, restrict } = require('../middleware/auth');

const router = express.Router();

// GET /api/subcategories/:categoryId
router.get('/:categoryId', protect, async (req, res) => {
  try {
    const subCategories = await SubCategory.find({
      category: req.params.categoryId,
      isActive: true
    }).sort('name');
    res.json(subCategories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sub-categories.' });
  }
});

// POST /api/subcategories (admin only)
router.post('/', protect, restrict('admin'), async (req, res) => {
  try {
    const subCategory = await SubCategory.create(req.body);
    res.status(201).json(subCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/subcategories/:id (admin only)
router.patch('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!subCategory) return res.status(404).json({ error: 'Sub-category not found.' });
    res.json(subCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/subcategories/:id — soft delete (admin only)
router.delete('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!subCategory) return res.status(404).json({ error: 'Sub-category not found.' });
    res.json({ message: 'Sub-category deactivated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
