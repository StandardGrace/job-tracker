const mongoose = require('mongoose'); // Import mongoose

const applicationSchema = new mongoose.Schema({
  company: { type: String, required: true }, // simple string fields
  role: { type: String, required: true },
  status: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'], // enum validation for status
    default: 'Applied'
  },
  dateApplied: { type: Date, default: Date.now }, // default to current date
  source: String,
  notes: String,
  statusHistory: [{ // array of status history objects
    status: String,
    date: { type: Date, default: Date.now }
  }],
  folderLink: String,
  documents: [{ // array of document objects
    type: {
      type: String,
      enum: ['resume', 'cover_letter', 'job_posting', 'other']
    },
    label: String,
    url: String,
    snapshotText: String,
    dateAdded: { type: Date, default: Date.now }
  }]
}, { timestamps: true }); // automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Application', applicationSchema); // Export the model for use in other parts of the application