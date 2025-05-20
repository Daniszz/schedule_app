import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  l: { type: Number, required: true },
  D: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});
const ScheduleSchema = mongoose.model("ScheduleSchema", scheduleSchema);
export default ScheduleSchema;
