import mongoose from "mongoose";

const scheduleResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  schemaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ScheduleSchema",
    required: true,
  },
  timestamp: { type: Date, default: Date.now },

  fully_colored_jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  color_map: { type: Map, of: [Number] },

  f1: Number,
  f2: Number,
  f3: Number,
  algorithm_used: { type: String },
});

const ScheduleSchemaResult = mongoose.model(
  "ScheduleSchemaResult",
  scheduleResultSchema
);
export default ScheduleSchemaResult;
