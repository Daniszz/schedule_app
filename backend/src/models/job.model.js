import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  processing_time: { type: Number, required: true },
  gain: { type: Number, required: true },
  position: {
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 },
  },
});
const Job = mongoose.model("Job", jobSchema);
export default Job;
