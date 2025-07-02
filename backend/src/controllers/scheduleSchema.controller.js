import Schedule from "../models/scheduleSchema.model.js";

export const viewSchemas = async (req, res) => {
  try {
    const schedules = await Schedule.find({
      userId: req.user._id,
    });

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res
      .status(500)
      .json({ message: "Eroare la preluarea schemelor", error: error.message });
  }
};

export const viewSchema = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schema nu a fost găsită" });
    }

    res.json(schedule);
  } catch (error) {
    console.error("Error fetching schema:", error);
    res
      .status(500)
      .json({ message: "Eroare la preluarea schemei", error: error.message });
  }
};

export const createSchema = async (req, res) => {
  try {
    const { name, jobs = [], conflicts = [], l, D } = req.body;

    const newSchedule = new Schedule({
      userId: req.user._id,
      name,
      jobs,
      conflicts,
      l,
      D,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    console.error("Error creating schema:", error);

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

    const schedule = await Schedule.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schema nu a fost găsită" });
    }

    schedule.name = name;
    schedule.l = l;
    schedule.D = D;

    schedule.jobs = jobs;
    schedule.conflicts = conflicts;

    schedule.markModified("jobs");
    schedule.markModified("conflicts");

    schedule.updated_at = Date.now();

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
    console.error("Error deleting schema:", error);
    res
      .status(500)
      .json({ message: "Eroare la ștergerea schemei", error: error.message });
  }
};
