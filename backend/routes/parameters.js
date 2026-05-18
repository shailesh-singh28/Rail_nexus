const express = require('express');
const Parameter = require('../models/Parameter');
const { protect, restrict } = require('../middleware/auth');

const router = express.Router();

// GET /api/parameters/:testTypeId
router.get('/:testTypeId', protect, async (req, res) => {
  try {
    const parameters = await Parameter.find({
      testType: req.params.testTypeId,
      isActive: true
    }).sort('name');
    res.json(parameters);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch parameters.' });
  }
});

// POST /api/parameters (admin only)
router.post('/', protect, restrict('admin'), async (req, res) => {
  try {
    const parameter = await Parameter.create(req.body);
    res.status(201).json(parameter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/parameters/:id (admin only)
router.patch('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const parameter = await Parameter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!parameter) return res.status(404).json({ error: 'Parameter not found.' });
    res.json(parameter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/parameters/:id — soft delete (admin only)
router.delete('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const parameter = await Parameter.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!parameter) return res.status(404).json({ error: 'Parameter not found.' });
    res.json({ message: 'Parameter deactivated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
