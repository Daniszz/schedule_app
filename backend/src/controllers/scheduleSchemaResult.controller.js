import ScheduleSchemaResult from "../models/scheduleSchemaResult.model.js";
import Schedule from "../models/scheduleSchema.model.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const viewResults = async (req, res) => {
  try {
    const results = await ScheduleSchemaResult.find({
      userId: req.user._id,
    }).populate("schemaId");
    res.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({
      message: "Eroare la preluarea rezultatelor",
      error: error.message,
    });
  }
};

export const createResult = async (req, res) => {
  try {
    const { schemaId } = req.params;

    const schedule = await Schedule.findOne({
      _id: schemaId,
      userId: req.user._id,
    });

    if (!schedule) {
      return res
        .status(404)
        .json({ message: "Schema nu a fost găsită sau nu vă aparține" });
    }

    const jobs = schedule.jobs;
    const conflicts = schedule.conflicts;
    const l = schedule.l;
    const D = schedule.D;

    const jobData = jobs.map((job) => ({
      id: job._id.toString(),
      processing_time: job.processing_time,
      gain: job.gain,
    }));

    const conflictsArray = conflicts.map((c) => [
      c.job1.toString(),
      c.job2.toString(),
    ]);

    const inputPayload = {
      jobs: jobData,
      conflicts: conflictsArray,
      l,
      D,
    };

    const pythonScriptPath = path.resolve(
      __dirname,
      "../python_script/script.py"
    );

    const pythonProcess = spawn("python", [pythonScriptPath]);

    let pythonOutput = "";
    let pythonError = "";

    pythonProcess.stdin.write(JSON.stringify(inputPayload));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      pythonError += data.toString();
    });

    pythonProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error("Python script error output:", pythonError);
        return res.status(500).json({
          message: "Python script error",
          error: pythonError,
        });
      }

      try {
        console.log("Raw Python output:", pythonOutput);
        const resultData = JSON.parse(pythonOutput);

        if (!resultData || !Array.isArray(resultData.fully_colored_jobs)) {
          console.error("Invalid Python script output format:", resultData);
          return res.status(500).json({
            message:
              "Invalid format from Python script. Expected fully_colored_jobs array.",
            error: "Python script returned unexpected data.",
          });
        }

        const newResult = new ScheduleSchemaResult({
          userId: req.user._id,
          schemaId: schemaId,

          fully_colored_jobs: resultData.fully_colored_jobs,
          color_map: resultData.color_map || {},
          f1: resultData.f1,
          f2: resultData.f2,
          f3: resultData.f3,
          algorithm_used: resultData.algorithm_used,
          timestamp: new Date(),
        });

        await newResult.save();
        res.status(201).json(newResult);
      } catch (error) {
        console.error(
          "Error processing Python output or saving result:",
          error
        );
        res.status(500).json({
          message: "Error processing Python output or saving result",
          error: error.message,
        });
      }
    });
  } catch (error) {
    console.error("Error in createResult controller:", error);
    res.status(400).json({
      message: "Eroare la crearea rezultatului",
      error: error.message,
    });
  }
};

export const detailedResult = async (req, res) => {
  try {
    const result = await ScheduleSchemaResult.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("schemaId");

    if (!result) {
      return res.status(404).json({ message: "Rezultatul nu a fost găsit" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching detailed result:", error);
    res.status(500).json({
      message: "Eroare la preluarea rezultatului",
      error: error.message,
    });
  }
};

export const deleteResult = async (req, res) => {
  try {
    const deletedResult = await ScheduleSchemaResult.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedResult) {
      return res.status(404).json({ message: "Rezultatul nu a fost găsit" });
    }

    res.json({ message: "Rezultatul a fost șters cu succes" });
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({
      message: "Eroare la ștergerea rezultatului",
      error: error.message,
    });
  }
};
