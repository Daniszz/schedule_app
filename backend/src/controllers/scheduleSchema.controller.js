import Schedule from "../models/scheduleSchema.model.js";
// Nu mai avem nevoie de importul Job aici, deoarece job-urile sunt încorporate
// import Job from "../models/job.model.js";

export const viewSchemas = async (req, res) => {
  try {
    // Nu mai este nevoie de .populate('jobs').populate('conflicts')
    // deoarece datele sunt încorporate
    const schedules = await Schedule.find({
      userId: req.user._id,
    });

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Eroare la preluarea schemelor", error: error.message });
  }
};

export const viewSchema = async (req, res) => {
  try {
    // Nu mai este nevoie de .populate('jobs').populate('conflicts')
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schema nu a fost găsită" });
    }

    res.json(schedule);
  } catch (error) {
    console.error("Error fetching schema:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Eroare la preluarea schemei", error: error.message });
  }
};

export const createSchema = async (req, res) => {
  try {
    // jobs și conflicts vin acum ca array-uri de obiecte complete, nu doar ID-uri
    const { name, jobs = [], conflicts = [], l, D } = req.body; // Setăm default la array-uri goale

    // Nu mai este necesară validarea ownership-ului job-urilor externe
    // deoarece job-urile sunt create ca parte a schedule-ului.
    // Presupunem că job-urile și conflictele trimise în req.body
    // sunt deja în formatul embeddedJobSchema/embeddedConflictSchema.

    const newSchedule = new Schedule({
      userId: req.user._id,
      name,
      jobs, // Salvăm direct array-ul de obiecte job
      conflicts, // Salvăm direct array-ul de obiecte conflict
      l,
      D,
      created_at: Date.now(), // Poți păstra created_at dacă vrei să înregistrezi crearea inițială
      updated_at: Date.now(),
    });

    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    console.error("Error creating schema:", error); // Log the error for debugging
    // Verifică dacă eroarea este de validare a datelor
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: error.message, errors: error.errors });
    }
    res
      .status(400)
      .json({ message: "Eroare la crearea schemei", error: error.message });
  }
};

export const updateSchema = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, jobs = [], conflicts = [], l, D } = req.body;

    // 1. Găsește documentul schedule-ului
    const schedule = await Schedule.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schema nu a fost găsită" });
    }

    // 2. Actualizează câmpurile direct pe documentul găsit
    schedule.name = name;
    schedule.l = l;
    schedule.D = D;

    // Atribuie direct noile array-uri
    schedule.jobs = jobs;
    schedule.conflicts = conflicts;

    // 3. Spune-i explicit lui Mongoose că array-urile au fost modificate
    // Aceasta este CRUCIAL pentru array-urile de sub-documente atunci când le înlocuiești
    schedule.markModified("jobs");
    schedule.markModified("conflicts");

    schedule.updated_at = Date.now();

    // 4. Salvează documentul, rulând validatoarele
    const updatedSchedule = await schedule.save({ runValidators: true });

    res.json(updatedSchedule);
  } catch (error) {
    console.error("Error updating schema:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: error.message, errors: error.errors });
    }
    res.status(400).json({
      message: "Eroare la actualizarea schemei",
      error: error.message,
    });
  }
};

export const deleteSchema = async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedSchedule) {
      return res.status(404).json({ message: "Schema nu a fost găsită" });
    }

    res.json({ message: "Schema a fost ștearsă cu succes" });
  } catch (error) {
    console.error("Error deleting schema:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Eroare la ștergerea schemei", error: error.message });
  }
};
