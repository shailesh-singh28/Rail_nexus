const express = require('express');
const TestType = require('../models/TestType');
const { protect, restrict } = require('../middleware/auth');

const router = express.Router();

// GET /api/test-types/:subCategoryId
router.get('/:subCategoryId', protect, async (req, res) => {
  try {
    const testTypes = await TestType.find({
      subCategory: req.params.subCategoryId,
      isActive: true
    }).sort('name');
    res.json(testTypes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test types.' });
  }
});

// POST /api/test-types (admin only)
router.post('/', protect, restrict('admin'), async (req, res) => {
  try {
    const testType = await TestType.create(req.body);
    res.status(201).json(testType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/test-types/:id (admin only)
router.patch('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const testType = await TestType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!testType) return res.status(404).json({ error: 'Test type not found.' });
    res.json(testType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/test-types/:id — soft delete (admin only)
router.delete('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const testType = await TestType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!testType) return res.status(404).json({ error: 'Test type not found.' });
    res.json({ message: 'Test type deactivated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
