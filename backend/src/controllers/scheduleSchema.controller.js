import ScheduleSchema from "../models/scheduleSchema.model.js";
import Job from "../models/job.model.js";

export const viewSchemas = async (req, res) => {
  try {
    const schedules = await ScheduleSchema.find({
      userId: req.user._id, // direct după utilizator
    }).populate({
      path: "jobs",
      populate: {
        path: "critical_resources",
      },
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Eroare la preluarea schemelor", error });
  }
};

export const createSchema = async (req, res) => {
  try {
    const { name, jobs, l, D } = req.body;

    const invalidJobs = await Job.find({
      _id: { $in: jobs },
      userId: { $ne: req.user._id },
    });

    if (invalidJobs.length > 0) {
      return res.status(403).json({ message: "Unele job-uri nu vă aparțin" });
    }

    const newSchedule = new ScheduleSchema({
      userId: req.user._id,
      name,
      jobs,
      l,
      D,
      updated_at: Date.now(),
    });

    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res.status(400).json({ message: "Eroare la crearea schemei", error });
  }
};

export const viewSchema = async (req, res) => {
  try {
    // Verifică indirect prin job-uri dacă schema aparține userului
    const schedule = await ScheduleSchema.findById(req.params.id).populate({
      path: "jobs",
      match: { userId: req.user._id }, // Filtrează doar job-urile userului
      populate: { path: "critical_resources" },
    });

    if (!schedule || schedule.jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "Schemă nu a fost găsită sau nu aveți acces" });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Eroare la preluarea schemei", error });
  }
};

export const updateSchema = async (req, res) => {
  try {
    const { name, jobs, l, D } = req.body;

    // 1. Verifică dacă schema conține job-uri ale userului
    const existingSchedule = await ScheduleSchema.findById(
      req.params.id
    ).populate({
      path: "jobs",
      match: { userId: req.user._id },
    });

    if (!existingSchedule || existingSchedule.jobs.length === 0) {
      return res.status(404).json({ message: "Schemă invalidă" });
    }

    // 2. Verifică noile job-uri (dacă există în cerere)
    if (jobs) {
      const invalidJobs = await Job.find({
        _id: { $in: jobs },
        userId: { $ne: req.user._id },
      });
      if (invalidJobs.length > 0) {
        return res.status(403).json({ message: "Unele job-uri nu vă aparțin" });
      }
    }

    // 3. Actualizează
    const updatedSchedule = await ScheduleSchema.findByIdAndUpdate(
      req.params.id,
      {
        name,
        ...(jobs && { jobs }), // Actualizează jobs doar dacă este în req.body
        l,
        D,
        updated_at: Date.now(),
      },
      { new: true } // Returnează documentul actualizat
    );

    res.json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ message: "Eroare la actualizarea schemei", error });
  }
};

export const deleteSchema = async (req, res) => {
  try {
    // Șterge doar dacă schema conține job-uri ale userului
    const scheduleToDelete = await ScheduleSchema.findOne({
      _id: req.params.id,
      jobs: {
        $in: await Job.find({ userId: req.user._id }).distinct("_id"),
      },
    });

    if (!scheduleToDelete) {
      return res.status(404).json({ message: "Schemă nu a fost găsită" });
    }

    await ScheduleSchema.deleteOne({ _id: req.params.id });
    res.json({ message: "Schemă ștearsă cu succes" });
  } catch (error) {
    res.status(500).json({ message: "Eroare la ștergerea schemei", error });
  }
};
