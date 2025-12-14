const mongoose = require('mongoose');

const marksheetSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    subjectName: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    courseName: String,
    marksObtained: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    },
    gradePoints: Number,
    semester: Number,
    academicYear: String,
    isPublished: {
      type: Boolean,
      default: false,
    },
    remarks: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  },
  {
    timestamps: true,
  }
);

marksheetSchema.pre('save', function (next) {
  this.percentage = (this.marksObtained / this.totalMarks) * 100;

  if (this.percentage >= 90) this.grade = 'A+';
  else if (this.percentage >= 80) this.grade = 'A';
  else if (this.percentage >= 70) this.grade = 'B+';
  else if (this.percentage >= 60) this.grade = 'B';
  else if (this.percentage >= 50) this.grade = 'C+';
  else if (this.percentage >= 40) this.grade = 'C';
  else if (this.percentage >= 30) this.grade = 'D';
  else this.grade = 'F';

  const gradePoints = {
    'A+': 10,
    A: 9,
    'B+': 8,
    B: 7,
    'C+': 6,
    C: 5,
    D: 4,
    F: 0,
  };
  this.gradePoints = gradePoints[this.grade];

  next();
});

module.exports = mongoose.model('Marksheet', marksheetSchema);
