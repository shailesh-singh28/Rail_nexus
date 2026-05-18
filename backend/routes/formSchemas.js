const express = require('express');
const FormSchema = require('../models/FormSchema');
const { protect, restrict } = require('../middleware/auth');

const router = express.Router();

// GET /api/formschema/:parameterId
router.get('/:parameterId', protect, async (req, res) => {
  try {
    const schema = await FormSchema.findOne({ parameter: req.params.parameterId });
    if (!schema) return res.status(404).json({ error: 'No form schema found for this parameter.' });
    res.json(schema);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch form schema.' });
  }
});

// POST /api/formschema — create (admin only)
router.post('/', protect, restrict('admin'), async (req, res) => {
  try {
    const schema = await FormSchema.create(req.body);
    res.status(201).json(schema);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Form schema already exists for this parameter.' });
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/formschema/:parameterId — upsert (admin only)
router.put('/:parameterId', protect, restrict('admin'), async (req, res) => {
  try {
    const schema = await FormSchema.findOneAndUpdate(
      { parameter: req.params.parameterId },
      { ...req.body, parameter: req.params.parameterId },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(schema);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/formschema/:parameterId (admin only)
router.delete('/:parameterId', protect, restrict('admin'), async (req, res) => {
  try {
    const schema = await FormSchema.findOneAndDelete({ parameter: req.params.parameterId });
    if (!schema) return res.status(404).json({ error: 'Form schema not found.' });
    res.json({ message: 'Form schema deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
