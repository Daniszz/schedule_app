import mongoose from "mongoose";

const conflictSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  job1: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  job2: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
});

const Conflict = mongoose.model("Conflict", conflictSchema);
export default Conflict;
