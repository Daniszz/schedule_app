import mongoose from "mongoose";

// Schema pentru un Job încorporat în Schedule
const embeddedJobSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Asigură-te că este String
    name: { type: String, required: true },
    processing_time: { type: Number, required: true },
    gain: { type: Number, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
  },
  { _id: false }
); // <-- Crucial: nu lăsa Mongoose să adauge un alt _id

const embeddedConflictSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Asigură-te că este String
    job1: { type: String, required: true },
    job2: { type: String, required: true },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  jobs: [embeddedJobSchema], // Acum un array de sub-documente Job
  conflicts: [embeddedConflictSchema], // Acum un array de sub-documente Conflict
  l: { type: Number, required: true },
  D: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Numele modelului ar trebui să fie singular, conform convenției
const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
