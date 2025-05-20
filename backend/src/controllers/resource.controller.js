import Resource from "../models/resource.model.js";

export const viewResources = async (req, res) => {
  try {
    const resources = await Resource.find({ userId: req.user._id });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: "Eroare la preluarea resurselor", error });
  }
};
export const createResource = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newResource = new Resource({
      userId: req.user._id,
      name,
      description,
    });

    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    res.status(400).json({ message: "Eroare la crearea resursei", error });
  }
};
export const deletedResource = async (req, res) => {
  try {
    const deletedResource = await Resource.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedResource) {
      return res.status(404).json({ message: "Resursa nu a fost găsită" });
    }

    res.json({ message: "Resursa a fost ștearsă cu succes" });
  } catch (error) {
    res.status(500).json({ message: "Eroare la ștergerea resursei", error });
  }
};

export const viewResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resource) {
      return res.status(404).json({ message: "Resursa nu a fost găsită" });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: "Eroare la preluarea resursei", error });
  }
};
