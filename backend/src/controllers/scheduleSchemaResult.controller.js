import ScheduleSchemaResult from "../models/scheduleSchemaResult.model.js"; // Presupun că modelul ScheduleSchemaResult este definit corect
import Schedule from "../models/scheduleSchema.model.js"; // Importăm modelul Schedule (numit acum 'Schedule' nu 'ScheduleSchema')
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
    console.error("Error fetching results:", error); // Adaugă logare pentru depanare
    res.status(500).json({
      message: "Eroare la preluarea rezultatelor",
      error: error.message,
    });
  }
};

export const createResult = async (req, res) => {
  try {
    const { schemaId } = req.params;

    // Am schimbat 'ScheduleSchema' în 'Schedule' conform noii denumiri a modelului
    const schedule = await Schedule.findOne({
      _id: schemaId,
      userId: req.user._id,
    });
    // ELIMINAT: .populate("jobs") .populate("conflicts");
    // Job-urile și conflictele sunt acum încorporate, nu mai este nevoie de populare.

    if (!schedule) {
      return res
        .status(404)
        .json({ message: "Schema nu a fost găsită sau nu vă aparține" });
    }

    // Datele sunt deja încorporate, le accesăm direct
    const jobs = schedule.jobs;
    const conflicts = schedule.conflicts;
    const l = schedule.l;
    const D = schedule.D;

    const jobData = jobs.map((job) => ({
      id: job._id.toString(), // Asigură-te că _id-ul job-ului încorporat este un string
      processing_time: job.processing_time,
      gain: job.gain,
    }));

    const conflictsArray = conflicts.map((c) => [
      c.job1.toString(), // Referă la _id-ul job-ului încorporat
      c.job2.toString(), // Referă la _id-ul job-ului încorporat
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
        console.error("Python script error output:", pythonError); // Log the Python error
        return res.status(500).json({
          message: "Python script error",
          error: pythonError,
        });
      }

      try {
        console.log("Raw Python output:", pythonOutput); // Debug
        const resultData = JSON.parse(pythonOutput);

        // Validare simplă pentru a evita erori la salvare
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
          schemaId: schemaId, // ID-ul schedule-ului la care se referă rezultatul
          // Asigură-te că fully_colored_jobs de la Python sunt ID-urile de job-uri (string-uri)
          // și că se potrivesc cu _id-urile job-urilor încorporate în Schedule.
          fully_colored_jobs: resultData.fully_colored_jobs,
          color_map: resultData.color_map || {}, // Asigură-te că e un obiect
          f1: resultData.f1,
          f2: resultData.f2,
          f3: resultData.f3,
          algorithm_used: resultData.algorithm_used,
          timestamp: new Date(), // Adaugă un timestamp pentru când a fost generat rezultatul
        });

        await newResult.save();
        res.status(201).json(newResult);
      } catch (error) {
        console.error(
          "Error processing Python output or saving result:",
          error
        ); // Log the error
        res.status(500).json({
          message: "Error processing Python output or saving result",
          error: error.message,
        });
      }
    });
  } catch (error) {
    console.error("Error in createResult controller:", error); // Log the initial error
    res.status(400).json({
      message: "Eroare la crearea rezultatului",
      error: error.message,
    });
  }
};

// GET /api/results/:id - detalii pentru un rezultat
export const detailedResult = async (req, res) => {
  try {
    const result = await ScheduleSchemaResult.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("schemaId"); // Păstrăm populate pentru schemaId
    // ELIMINAT: .populate("fully_colored_jobs");

    if (!result) {
      return res.status(404).json({ message: "Rezultatul nu a fost găsit" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching detailed result:", error); // Log the error
    res.status(500).json({
      message: "Eroare la preluarea rezultatului",
      error: error.message,
    });
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
    console.error("Error deleting result:", error); // Log the error
    res.status(500).json({
      message: "Eroare la ștergerea rezultatului",
      error: error.message,
    });
  }
};
