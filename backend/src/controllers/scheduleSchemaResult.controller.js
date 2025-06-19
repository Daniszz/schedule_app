import ScheduleSchemaResult from "../models/scheduleSchemaResult.model.js";

import ScheduleSchema from "../models/scheduleSchema.model.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const viewResults = async (req, res) => {
  try {
    const results = await ScheduleSchemaResult.find({ userId: req.user._id })
      .populate("schemaId")
      .populate("fully_colored_jobs");

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare la preluarea rezultatelor", error });
  }
};

export const createResult = async (req, res) => {
  try {
    const { schemaId } = req.params;

    const scheduleSchema = await ScheduleSchema.findOne({
      _id: schemaId,
      userId: req.user._id,
    })
      .populate("jobs")
      .populate("conflicts");

    if (!scheduleSchema) {
      return res
        .status(404)
        .json({ message: "Schema nu a fost găsită sau nu vă aparține" });
    }

    const jobs = scheduleSchema.jobs;
    const conflicts = scheduleSchema.conflicts;
    const l = scheduleSchema.l;
    const D = scheduleSchema.D;

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
        return res.status(500).json({
          message: "Python script error",
          error: pythonError,
        });
      }

      try {
        console.log("Raw Python output:", pythonOutput); // Debug
        const resultData = JSON.parse(pythonOutput);

        const newResult = new ScheduleSchemaResult({
          userId: req.user._id,
          schemaId: schemaId,
          fully_colored_jobs: resultData.fully_colored_jobs,
          color_map: resultData.color_map,
          f1: resultData.f1,
          f2: resultData.f2,
          f3: resultData.f3,
          algorithm_used: resultData.algorithm_used,
        });

        await newResult.save();
        res.status(201).json(newResult);
      } catch (error) {
        res.status(500).json({
          message: "Error processing Python output",
          error: error.message,
        });
      }
    });
  } catch (error) {
    res.status(400).json({ message: "Eroare la crearea rezultatului", error });
  }
};

// GET /api/results/:id - detalii pentru un rezultat
export const detailedResult = async (req, res) => {
  try {
    const result = await ScheduleSchemaResult.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate("schemaId")
      .populate("fully_colored_jobs");

    if (!result) {
      return res.status(404).json({ message: "Rezultatul nu a fost găsit" });
    }

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare la preluarea rezultatului", error });
  }
};

// DELETE /api/results/:id - șterge un rezultat
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
    res
      .status(500)
      .json({ message: "Eroare la ștergerea rezultatului", error });
  }
};
