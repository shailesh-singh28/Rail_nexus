const express = require('express');
const Report = require('../models/Report');
const { protect, restrict } = require('../middleware/auth');

const router = express.Router();

// POST /api/reports — submit a new report
router.post('/', protect, async (req, res) => {
  try {
    const {
      divisionId,
      majorSectionId,
      sectionId,
      mainCategoryId,
      categoryId,
      subCategoryId,
      testTypeId,
      parameterId,
      formData
    } = req.body;

    if (!divisionId || !majorSectionId || !sectionId || !mainCategoryId ||
        !categoryId || !subCategoryId || !testTypeId || !parameterId || !formData) {
      return res.status(400).json({ error: 'All location, category, and form data fields are required.' });
    }

    const report = await Report.create({
      submittedBy: req.user._id,
      division: divisionId,
      majorSection: majorSectionId,
      section: sectionId,
      mainCategory: mainCategoryId,
      category: categoryId,
      subCategory: subCategoryId,
      testType: testTypeId,
      parameter: parameterId,
      formData
    });

    res.status(201).json({ message: 'Report submitted successfully.', report });
  } catch (err) {
    console.error('Report submission error:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/reports — list reports (with filters)
router.get('/', protect, async (req, res) => {
  try {
    const { division, section, parameter, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (division) filter.division = division;
    if (section) filter.section = section;
    if (parameter) filter.parameter = parameter;
    if (status) filter.status = status;

    // Engineers can only see their own reports; admins see all
    if (req.user.role === 'engineer') {
      filter.submittedBy = req.user._id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('submittedBy', 'name email')
        .populate('division', 'name')
        .populate('majorSection', 'name')
        .populate('section', 'name')
        .populate('mainCategory', 'name')
        .populate('category', 'name')
        .populate('subCategory', 'name')
        .populate('testType', 'name')
        .populate('parameter', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Report.countDocuments(filter)
    ]);

    res.json({
      reports,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

// GET /api/reports/:id — single report
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('division', 'name')
      .populate('majorSection', 'name')
      .populate('section', 'name')
      .populate('mainCategory', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('testType', 'name')
      .populate('parameter', 'name')
      .populate('reviewedBy', 'name email');

    if (!report) return res.status(404).json({ error: 'Report not found.' });

    // Engineers can only view their own reports
    if (req.user.role === 'engineer' &&
        report.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report.' });
  }
});

// PATCH /api/reports/:id/review — admin review
router.patch('/:id/review', protect, restrict('admin'), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!['reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        remarks,
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!report) return res.status(404).json({ error: 'Report not found.' });
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
