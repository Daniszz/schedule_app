import ScheduleSchemaResult from "../models/scheduleSchemaResult.model.js";

import ScheduleSchema from "../models/scheduleSchema.model.js";
import Job from "../models/job.model.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const viewResults = async (req, res) => {
  try {
    const results = await ScheduleSchemaResult.find({ userId: req.user._id })
      .populate("schema_id", "name") // Afișează doar numele schemei
      .sort({ timestamp: -1 }); // Sortare după dată (cele mai recente primele)

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare la preluarea rezultatelor", error });
  }
};

export const viewResult = async (req, res) => {
  try {
    // Verifică dacă schema aparține utilizatorului
    const schema = await ScheduleSchema.findOne({
      _id: req.params.schemaId,
      jobs: { $in: await Job.find({ userId: req.user._id }).distinct("_id") },
    });

    if (!schema) {
      return res.status(404).json({ message: "Schemă invalidă" });
    }

    const results = await ScheduleSchemaResult.find({
      schema_id: req.params.schemaId,
      userId: req.user._id,
    }).populate("fully_colored_jobs", "name gain");

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare la preluarea rezultatelor", error });
  }
};

export const createResult = async (req, res) => {
  try {
    const scheduleId = req.params.schemaId;
    console.log(scheduleId);
    const userId = req.user._id; // obținut din middleware-ul de autentificare
    console.log(userId);
    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: "Schedule ID is required",
      });
    }

    // Găsește programul doar dacă aparține utilizatorului curent
    const schedule = await ScheduleSchema.findOne({
      _id: scheduleId,
      userId: userId,
    }).populate("jobs");

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found or access denied",
      });
    }
    // Pregătește datele pentru scriptul Python
    const inputData = {
      jobs: schedule.jobs.map((job) => ({
        id: job._id.toString(),
        processing_time: job.processing_time,
        gain: job.gain,
        critical_resources: job.critical_resources,
      })),
      l: schedule.l,
      D: schedule.D,
    };

    // Calea către scriptul Python
    const pythonScriptPath = path.join(__dirname, "../multicoloring/script.py");

    // Creează procesul Python
    const pythonProcess = spawn("python", [pythonScriptPath]);

    let pythonOutput = "";
    let pythonError = "";

    // Scrie datele de input către procesul Python
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    // Colectează output-ul
    pythonProcess.stdout.on("data", (data) => {
      pythonOutput += data.toString();
    });

    // Colectează erorile
    pythonProcess.stderr.on("data", (data) => {
      pythonError += data.toString();
    });

    // Când procesul se termină
    pythonProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error("Python script error:", pythonError);
        return res.status(500).json({
          success: false,
          message: "Error running optimization algorithm",
          error: pythonError,
        });
      }

      try {
        // Parsează rezultatul
        const result = JSON.parse(pythonOutput);

        // Convertește fully_colored_jobs la ObjectId-uri (dacă sunt string-uri)
        const fullyColoredJobsIds = result.fully_colored_jobs.map((jobId) =>
          typeof jobId === "string" ? jobId : jobId.toString()
        );

        // Salvează rezultatul în baza de date
        const savedResult = new ScheduleSchemaResult({
          userId: userId,
          schema_id: scheduleId,
          fully_colored_jobs: fullyColoredJobsIds,
          color_map: new Map(Object.entries(result.color_map)),
          f1: result.f1,
          f2: result.f2,
          f3: result.f3,
          timestamp: new Date(),
        });

        await savedResult.save();

        // Returnează rezultatul
        res.status(200).json({
          success: true,
          data: {
            result_id: savedResult._id,
            userId: userId,
            schedule_id: scheduleId,
            optimization_result: {
              fully_colored_jobs: result.fully_colored_jobs,
              color_map: result.color_map,
              f1: result.f1,
              f2: result.f2,
              f3: result.f3,
            },
            timestamp: savedResult.timestamp,
          },
        });
      } catch (parseError) {
        console.error("Error parsing Python output:", parseError);
        console.error("Python output:", pythonOutput);
        res.status(500).json({
          success: false,
          message: "Error parsing optimization result",
          error: parseError.message,
        });
      }
    });

    // Timeout pentru procesul Python (opțional)
    const timeout = setTimeout(() => {
      pythonProcess.kill("SIGTERM");
      res.status(408).json({
        success: false,
        message: "Optimization timeout - process took too long",
      });
    }, 60000); // 60 secunde timeout

    // Curăță timeout-ul când procesul se termină
    pythonProcess.on("close", () => {
      clearTimeout(timeout);
    });
  } catch (error) {
    console.error("Error in createResult:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const detailedResult = async (req, res) => {
  try {
    const result = await ScheduleSchemaResult.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate("schema_id", "name l D")
      .populate("fully_colored_jobs", "name processing_time gain");

    if (!result) {
      return res.status(404).json({ message: "Rezultat negăsit" });
    }

    const response = result.toObject();
    response.color_map = Object.fromEntries(response.color_map);

    res.json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare la preluarea rezultatului", error });
  }
};

export const deletedResult = async (req, res) => {
  try {
    const deletedResult = await ScheduleSchemaResult.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedResult) {
      return res.status(404).json({ message: "Rezultat negăsit" });
    }

    res.json({ message: "Rezultat șters cu succes" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare la ștergerea rezultatului", error });
  }
};
