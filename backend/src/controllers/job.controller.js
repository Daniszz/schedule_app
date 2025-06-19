import Job from "../models/job.model.js";
import Conflict from "../models/conflict.model.js";
export const viewJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user._id });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Eroare la preluarea joburilor", error });
  }
};
export const createJob = async (req, res) => {
  try {
    const { name, processing_time, gain, position } = req.body;

    const newJob = new Job({
      userId: req.user._id,
      name,
      processing_time,
      gain,
      position: position || { x: 0, y: 0 },
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: "Eroare la crearea jobului", error });
  }
};

export const viewJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({ message: "Jobul nu a fost găsit" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Eroare la preluarea jobului", error });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { name, processing_time, gain, position } = req.body;

    const updatedJob = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      {
        name,
        processing_time,
        gain,
        ...(position && { position }),
      },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Jobul nu a fost găsit" });
    }
    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: "Eroare la actualizarea jobului", error });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const deletedJob = await Job.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedJob) {
      return res.status(404).json({ message: "Jobul nu a fost găsit" });
    }

    // Șterge conflictele unde jobul apare ca job1 sau job2
    await Conflict.deleteMany({
      $or: [{ job1: deletedJob._id }, { job2: deletedJob._id }],
    });

    res.json({
      message: "Jobul și conflictele aferente au fost șterse cu succes",
    });
  } catch (error) {
    res.status(500).json({ message: "Eroare la ștergerea jobului", error });
  }
};

export const deleteJobs = async (req, res) => {
  try {
    // Găsește toate joburile ce vor fi șterse (ca să ai id-urile lor)
    const jobsToDelete = await Job.find({ userId: req.user._id });

    const jobIds = jobsToDelete.map((job) => job._id);

    // Șterge joburile
    await Job.deleteMany({ userId: req.user._id });

    // Șterge conflictele asociate cu acele joburi
    await Conflict.deleteMany({
      $or: [{ job1: { $in: jobIds } }, { job2: { $in: jobIds } }],
    });

    res.json({
      message:
        "Toate joburile și conflictele aferente au fost șterse cu succes",
    });
  } catch (error) {
    res.status(500).json({ message: "Eroare la ștergerea joburilor", error });
  }
};

export const updateJobPosition = async (req, res) => {
  try {
    const { position } = req.body;

    if (
      !position ||
      typeof position.x !== "number" ||
      typeof position.y !== "number"
    ) {
      return res.status(400).json({ message: "Invalid position data" });
    }

    const updatedJob = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      {
        position,
      },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: "Error updating job position", error });
  }
};
