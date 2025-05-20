import Job from "../models/job.model.js";

export const viewJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user._id }).populate(
      "critical_resources"
    );
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Eroare la preluarea joburilor", error });
  }
};
export const createJob = async (req, res) => {
  try {
    const { name, processing_time, gain, critical_resources } = req.body;

    const newJob = new Job({
      userId: req.user._id,
      name,
      processing_time,
      gain,
      critical_resources,
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
    }).populate("critical_resources");

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
    const { name, processing_time, gain, critical_resources } = req.body;

    const updatedJob = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      {
        name,
        processing_time,
        gain,
        critical_resources,
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
    res.json({ message: "Jobul a fost șters cu succes" });
  } catch (error) {
    res.status(500).json({ message: "Eroare la ștergerea jobului", error });
  }
};
