import ScheduleSchema from "../models/scheduleSchema.model.js";
import Job from "../models/job.model.js";

export const viewSchemas = async (req, res) => {
  try {
    const schedules = await ScheduleSchema.find({
      userId: req.user._id,
    })
      .populate("jobs")
      .populate("conflicts");

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Eroare la preluarea schemelor", error });
  }
};

export const viewSchema = async (req, res) => {
  try {
    const schedule = await ScheduleSchema.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate("jobs")
      .populate("conflicts");

    if (!schedule) {
      return res.status(404).json({ message: "Schema nu a fost găsită" });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Eroare la preluarea schemei", error });
  }
};

export const createSchema = async (req, res) => {
  try {
    const { name, jobs, conflicts, l, D } = req.body;

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
      conflicts,
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

export const updateSchema = async (req, res) => {
  try {
    const { name, jobs, conflicts, l, D } = req.body;

    const updatedSchedule = await ScheduleSchema.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      {
        name,
        jobs,
        conflicts,
        l,
        D,
        updated_at: Date.now(),
      },
      { new: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schema nu a fost găsită" });
    }

    res.json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ message: "Eroare la actualizarea schemei", error });
  }
};

export const deleteSchema = async (req, res) => {
  try {
    const deletedSchedule = await ScheduleSchema.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedSchedule) {
      return res.status(404).json({ message: "Schema nu a fost găsită" });
    }

    res.json({ message: "Schema a fost ștearsă cu succes" });
  } catch (error) {
    res.status(500).json({ message: "Eroare la ștergerea schemei", error });
  }
};
