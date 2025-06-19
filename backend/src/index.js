import express from "express";
import authRoutes from "./routes/auth.route.js";
import conflictRoutes from "./routes/conflict.route.js";
import jobRoutes from "./routes/job.route.js";
import scheduleSchemaRoutes from "./routes/scheduleSchema.route.js";
import scheduleSchemaResultRoutes from "./routes/scheduleSchemaResult.route.js";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import cookieParser from "cookie-parser";

import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/conflict", conflictRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/schedule", scheduleSchemaRoutes);
app.use("/api/scheduleResult", scheduleSchemaResultRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
});
