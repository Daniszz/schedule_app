import mongoose from "mongoose";

const scheduleSchemaResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  schemaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Schedule",
    required: true,
  },
  fully_colored_jobs: [{ type: String }],
  color_map: { type: mongoose.Schema.Types.Mixed, default: {} }, 
  f1: { type: Number },
  f2: { type: Number },
  f3: { type: Number },
  algorithm_used: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const ScheduleSchemaResult = mongoose.model(
  "ScheduleSchemaResult",
  scheduleSchemaResultSchema
);
export default ScheduleSchemaResult;
