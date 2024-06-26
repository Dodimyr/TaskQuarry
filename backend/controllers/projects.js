const Project = require("../models/project");

// const getAllProjects = async (req, res) => {
//   try {
//     const sortField = req.query.sortField || "priority";
//     const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

//     const projects = await Project.find({})
//       .sort({ [sortField]: sortOrder })
//       .populate("features");

//     res.status(201).json({ projects });
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// };

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .sort({ isDone: 1, priority: -1, endDate: 1, name: 1 })
      .populate("features");
    res.status(201).json({ projects });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getSingleProject = async (req, res) => {
  try {
    const { id: projectID } = req.params;
    const project = await Project.findById({ _id: projectID });
    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id: projectID } = req.params;
    const data = req.body;
    const project = await Project.findOneAndUpdate({ _id: projectID }, data, {
      new: true,
      runValidators: true,
    });
    if (!project) {
      return res.status(404).json({ msg: `No project with id: ${project}` });
    }
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id: projectID } = req.params;
    const project = await Project.findByIdAndDelete({ _id: projectID });
    if (!project) {
      return res.status(404).json({ msg: `No project with id: ${project}` });
    }
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

module.exports = {
  getAllProjects,
  getSingleProject,
  createProject,
  updateProject,
  deleteProject,
};
