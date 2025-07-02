import mongoose from "mongoose";

const embeddedJobSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    processing_time: { type: Number, required: true },
    gain: { type: Number, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
  },
  { _id: false }
);

const embeddedConflictSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    job1: { type: String, required: true },
    job2: { type: String, required: true },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  jobs: [embeddedJobSchema],
  conflicts: [embeddedConflictSchema],
  l: { type: Number, required: true },
  D: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
