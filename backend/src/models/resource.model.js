import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
});
const Resource = mongoose.model("Resource", resourceSchema);
export default Resource;
