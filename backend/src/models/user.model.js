import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
 
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  profilePic: {
    type: String,
    default: "https://www.gravatar.com/avatar/?d=mp",
  },},
 {
  timestamps: true
 }
)
const User=mongoose.model("User",userSchema);
export default User;