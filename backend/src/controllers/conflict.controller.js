import Conflict from "../models/conflict.model.js";

export const viewConflicts = async (req, res) => {
  try {
    const conflicts = await Conflict.find({ userId: req.user._id });
    res.json(conflicts);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la preluarea conflictelor",
      error: error.message,
    });
  }
};

export const createConflict = async (req, res) => {
  try {
    const { job1, job2 } = req.body;

    const existing = await Conflict.findOne({
      userId: req.user._id,
      $or: [
        { job1, job2 },
        { job1: job2, job2: job1 },
      ],
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Conflict already exists between these jobs" });
    }

    const newConflict = new Conflict({
      userId: req.user._id,
      job1,
      job2,
    });
    const savedConflict = await newConflict.save();
    res.status(201).json(savedConflict);
  } catch (error) {
    res.status(400).json({
      message: "Eroare la crearea conflictului",
      error: error.message,
    });
  }
};

export const deleteConflict = async (req, res) => {
  try {
    const deletedConflict = await Conflict.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedConflict) {
      return res.status(404).json({ message: "Conflictul nu a fost găsit" });
    }

    res.json({ message: "Conflictul a fost șters cu succes" });
  } catch (error) {
    res.status(500).json({
      message: "Eroare la ștergerea conflictului",
      error: error.message,
    });
  }
};
