const Timetable = require('../models/Timetable');

const createTimetable = async (req, res) => {
  try {
    const { batch, semester, academicYear, schedule } = req.body;

    if (!batch || !schedule || schedule.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let timetable = await Timetable.findOne({ batch, semester, academicYear });

    if (timetable) {
      timetable.schedule = schedule;
    } else {
      timetable = new Timetable({
        batch,
        semester,
        academicYear,
        schedule,
        createdBy: req.user.id,
      });
    }

    await timetable.populate('schedule.subject schedule.teacher');
    await timetable.save();

    res.status(201).json({ success: true, message: 'Timetable created/updated', timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTimetableByBatch = async (req, res) => {
  try {
    const { batch, semester } = req.query;

    const query = {};
    if (batch) query.batch = batch;
    if (semester) query.semester = parseInt(semester);

    const timetable = await Timetable.findOne(query)
      .populate('schedule.subject', 'subjectName')
      .populate('schedule.teacher', 'personalDetails');

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    res.status(200).json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTimetableById = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findById(id)
      .populate('schedule.subject', 'subjectName')
      .populate('schedule.teacher', 'personalDetails employeeId');

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    res.status(200).json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;

    const timetable = await Timetable.findByIdAndUpdate(
      id,
      { schedule, updatedBy: req.user.id },
      { new: true }
    )
      .populate('schedule.subject', 'subjectName')
      .populate('schedule.teacher', 'personalDetails');

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    res.status(200).json({ success: true, message: 'Timetable updated', timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllTimetables = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const timetables = await Timetable.find({ isActive: true })
      .populate('schedule.subject', 'subjectName')
      .populate('schedule.teacher', 'personalDetails')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Timetable.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      timetables,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findByIdAndDelete(id);

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    res.status(200).json({ success: true, message: 'Timetable deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTimetable,
  getTimetableByBatch,
  getTimetableById,
  updateTimetable,
  getAllTimetables,
  deleteTimetable,
};
