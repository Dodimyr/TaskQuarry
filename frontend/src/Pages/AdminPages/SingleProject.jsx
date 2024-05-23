import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import DataTable from "react-data-table-component";

import {
  Card,
  Typography,
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
} from "@material-tailwind/react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import UpdateProjectDialog from "../../Components/Admin/SingleProject/UpdateProjectDialog";

const SingleProject = () => {
  const navigate = useNavigate();

  // get the ID in url parameter
  const { projectID } = useParams();

  // loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Single Project
  const [singleProject, setSingleProject] = useState(null);

  const fetchProject = async () => {
    try {
      const { data } = await axios.get(`/api/v1/projects/${projectID}`);
      setSingleProject(data.project);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectID]);

  // Fetch features
  const [features, setFeatures] = useState([]);

  const fetchFeatures = async () => {
    try {
      const { data } = await axios.get(`/api/v1/features/project/${projectID}`);
      setFeatures(data.features);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [projectID]);

  // Fetch Users
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`/api/v1/users`);
      setUsers(data.user);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [projectID]);

  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(!open);
    setNewFeature({
      name: "",
      description: "",
      status: "Not Yet Started",
      dueDate: null,
      assignedTo: null,
    });
  };

  // table for react data table
  const columns = [
    {
      name: <p className="font-bold">Feature</p>,
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: <p className="font-bold">Description</p>,
      selector: (row) => row.description,
      sortable: true,
    },
    {
      name: <p className="font-bold">Status</p>,
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: <p className="font-bold">Due Date</p>,
      selector: (row) => row.dueDate,
      format: (row) =>
        row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "No Due",
      sortable: true,
    },
    {
      name: <p className="font-bold">Assigned To</p>,
      selector: (row) => row.assignedTo,
      format: (row) => getAssignedToName(row.assignedTo),
      sortable: true,
    },
  ];

  // PROJECT states and handlers
  // open project to update
  const [openProjectToUpdate, setOpenProjectToUpdate] = useState(false);
  const [projectToUpdate, setProjectToUpdate] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "",
    isDone: false,
  });

  const handleOpenUpdateProject = () => {
    setProjectToUpdate({
      name: singleProject.name,
      description: singleProject.description,
      startDate: new Date(singleProject.startDate).toISOString().split("T")[0],
      endDate: new Date(singleProject.endDate).toISOString().split("T")[0],
      priority: singleProject.priority,
      isDone: singleProject.isDone,
    });
    setOpenProjectToUpdate(!openProjectToUpdate);
  };

  // FEATURES

  const [openUpdate, setOpenUpdate] = useState(false);
  const [featureToUpdate, setFeatureToUpdate] = useState(null);

  const handleOpenUpdate = (id) => {
    const featureToUpdate = features.find((feature) => feature._id === id);
    setFeatureToUpdate(featureToUpdate);

    // Convert dueDate to the format "YYYY-MM-DD"
    const formattedDueDate = featureToUpdate.dueDate
      ? new Date(featureToUpdate.dueDate).toISOString().split("T")[0]
      : null;

    setUpdatedFeature({
      name: featureToUpdate.name,
      description: featureToUpdate.description,
      status: featureToUpdate.status,
      dueDate: formattedDueDate, // Set the formatted dueDate
      assignedTo: featureToUpdate.assignedTo,
    });

    setOpenUpdate(true);
  };

  // CREATE/ADD HANDLER
  const [newFeature, setNewFeature] = useState({
    name: "",
    description: "",
    status: "Not Yet Started",
    dueDate: null,
    assignedTo: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target; // Destructure name and value from the event target
    setNewFeature((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelect = (value) => {
    setNewFeature((prev) => ({
      ...prev,
      assignedTo: value,
    }));

    console.log(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`/api/v1/features/${projectID}`, {
        ...newFeature,
        parentProject: projectID, // Assign the parent project ID to the feature
      });
      console.log("New Feature Created:", data.feature);

      setOpen(false);
      setFeatures((prevFeatures) => [...prevFeatures, data.feature]);
      fetchFeatures();
    } catch (error) {
      setError(error.message);
    }
  };

  // For Update Feature
  const [updatedFeature, setUpdatedFeature] = useState({
    name: "",
    description: "",
    status: "",
    dueDate: null,
    assignedTo: null,
  });

  const handleUpdateFeatureChange = (e) => {
    const { name, value } = e.target;
    setUpdatedFeature((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSelect = (name, value) => {
    setUpdatedFeature((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.patch(
        `/api/v1/features/${featureToUpdate._id}`,
        {
          ...updatedFeature,
          parentProject: featureToUpdate.parentProject, // Maintain the parent project ID
        }
      );
      console.log("Feature Updated:", data.feature);
      setOpenUpdate(false);
      setFeatures((prevFeatures) =>
        prevFeatures.map((feature) =>
          feature._id === data.feature._id ? data.feature : feature
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteFeature = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this feature?"
    );
    if (confirmation) {
      try {
        await axios.delete(`/api/v1/features/${featureToUpdate._id}`);
        setFeatures((prevFeatures) =>
          prevFeatures.filter((feature) => feature._id !== featureToUpdate._id)
        );
        setFeatureToUpdate(null);
        setOpenUpdate(false);
        fetchFeatures();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const getAssignedToName = (assignedToId) => {
    const user = users.find((user) => user._id === assignedToId);
    return user ? user.name : "Not Assigned";
  };

  const handleDeleteProject = async () => {
    if (features.length > 0) {
      const confirmation = window.confirm(
        "This project has associated features. Deleting this project will also delete its features. Are you sure you want to proceed?"
      );
      if (confirmation) {
        try {
          await Promise.all(
            features.map((feature) =>
              axios.delete(`/api/v1/features/${feature._id}`)
            )
          );
          await axios.delete(`/api/v1/projects/${projectID}`);
          navigate("../projects");
        } catch (error) {
          setError(error.message);
        }
      }
    } else {
      const confirmation = window.confirm(
        "Are you sure you want to delete this project?"
      );
      if (confirmation) {
        try {
          await axios.delete(`/api/v1/projects/${projectID}`);
          navigate("../projects");
        } catch (error) {
          setError(error.message);
        }
      }
    }
  };

  // Date Formatter
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const options = {
      timeZone: "Asia/Manila",
      month: "numeric",
      day: "numeric",
      year: "numeric",
      // timeZoneName: "short",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", options);
  };

  if (loading || users.length === 0) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex flex-col">
        <Card className="p-5 rounded-md shadow-md bg-white">
          <div>
            <p className="text-lg font-semibold mb-1">Project Information</p>
          </div>

          <div className="flex flex-col justify-evenly items-start mt-2 space-y-3  md:flex-row md:items-end md:space-x-6">
            <div className="flex-none w-36 mr-5">
              <p className="text-xs mb-2 uppercase font-semibold">Project</p>
              <Typography className="border-b-2 w-36">
                {singleProject.name}
              </Typography>
            </div>

            <div className="w-64">
              <p className="text-xs mb-2 uppercase font-semibold">
                Description
              </p>
              <Typography className="border-b-2 w-64">
                {singleProject.description}
              </Typography>
            </div>

            <div>
              <p className="text-xs mb-2 uppercase font-semibold">Status</p>
              <Typography
                className={`border-b-2 w-[80px] ${
                  singleProject.isDone ? "text-green-900" : "text-yellow-900"
                }`}
              >
                {singleProject.isDone ? "Done" : "Ongoing"}
              </Typography>
            </div>

            <div>
              <p className="text-xs mb-2 uppercase font-semibold">Priority</p>
              <Typography
                className={`w-[80px] border-b-2 text-${
                  singleProject.priority === "Urgent"
                    ? "red-900"
                    : singleProject.priority === "Important"
                    ? "deep-orange-500"
                    : singleProject.priority === "Medium"
                    ? "blue-900"
                    : "light-green-800"
                }`}
              >
                {singleProject.priority}
              </Typography>
            </div>

            <div>
              <p className="text-xs mb-2 uppercase font-semibold">
                Date / Duration
              </p>
              <Typography className="w-[180px] border-b-2">
                {formatDate(singleProject.startDate)} -{" "}
                {formatDate(singleProject.endDate)}
              </Typography>
            </div>
          </div>

          <div className="flex flex-row justify-end items-center mt-3">
            <div className="flex justify-end items-center space-x-2 ">
              <div>
                <Button size="sm" onClick={handleOpenUpdateProject}>
                  Update
                </Button>
              </div>
              <div>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={handleDeleteProject}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-md mt-4">
        <div className="p-2">
          <div className="flex shrink-0 flex-col gap-2 py-5 px-3 justify-between sm:flex-row ">
            <div>
              <p className="text-lg font-semibold">Project Features</p>
            </div>
            <div>
              <Button
                className="flex items-center gap-3"
                size="sm"
                onClick={handleOpen}
              >
                <PlusIcon strokeWidth={2} className="h-5 w-5" /> ADD A FEATURE
              </Button>
            </div>
          </div>
          {features.length > 0 ? (
            <DataTable
              columns={columns}
              data={features}
              highlightOnHover
              pointerOnHover
              pagination
              fixedHeader
              onRowClicked={(row) => handleOpenUpdate(row._id)}
            />
          ) : (
            <p className="text-center">No Features Data</p>
          )}
        </div>
      </Card>

      {/* PROJECT UPDATE DIALOG */}
      <UpdateProjectDialog
        openProjectToUpdate={openProjectToUpdate}
        handleOpenUpdateProject={handleOpenUpdateProject}
        projectToUpdate={projectToUpdate}
        setProjectToUpdate={setProjectToUpdate}
        fetchProject={fetchProject}
        projectID={projectID}
      />

      {/* ADD FEATURE */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        className="p-3"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="text-md text-gray-800 uppercase">
            Add New Feature
          </DialogHeader>
          <DialogBody className="flex flex-col gap-7">
            <Input
              label="Enter Feature Name"
              variant="standard"
              size="md"
              name="name"
              value={newFeature.name || ""}
              onChange={handleChange}
              required
            />
            <Input
              label="Enter Feature Description"
              variant="standard"
              size="md"
              name="description"
              value={newFeature.description || ""}
              onChange={handleChange}
              required
            />
            <Input
              type="date"
              label="Enter Due Date"
              variant="standard"
              size="md"
              name="dueDate"
              value={newFeature.dueDate || ""}
              onChange={handleChange}
            />
            <Select
              label="Assign To"
              variant="standard"
              size="md"
              name="assignedTo"
              value={newFeature.assignedTo || ""}
              onChange={handleSelect}
              required
            >
              {users.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          </DialogBody>
          <DialogFooter className="space-x-2">
            <Button
              variant="outlined"
              onClick={() => setOpen(false)}
              className="rounded-md hover:text-red-700 hover:border-red-700"
            >
              <span>Cancel</span>
            </Button>
            <Button
              variant="filled"
              type="submit"
              className="rounded-md hover:opacity-75"
            >
              <span>Create</span>
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* UPDATE FEATURE */}
      <Dialog
        open={openUpdate && featureToUpdate !== null}
        onClose={() => {
          setFeatureToUpdate(null);
          setOpenUpdate(false);
        }}
        size="sm"
        className="p-3"
      >
        <form onSubmit={handleUpdateSubmit}>
          <DialogHeader className="text-md text-gray-800 uppercase flex justify-between">
            <p>Update Feature</p>
            <button onClick={handleDeleteFeature}>
              <TrashIcon
                strokeWidth={2}
                className="h-6 w-6 text-red-600 hover:text-red-900 hover:cursor-pointer"
              />
            </button>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-7">
            <Input
              label="Feature Name"
              variant="standard"
              size="md"
              name="name"
              value={updatedFeature.name || ""}
              onChange={handleUpdateFeatureChange}
              required
            />
            <Input
              label="Feature Description"
              variant="standard"
              size="md"
              name="description"
              value={updatedFeature.description || ""}
              onChange={handleUpdateFeatureChange}
              required
            />
            <Select
              label="Status"
              variant="standard"
              size="md"
              name="status"
              value={updatedFeature.status || features.status}
              onChange={(value) => handleUpdateSelect("status", value)}
              required
            >
              <Option value="Not Yet Started">Not Yet Started</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Done">Done</Option>
            </Select>
            <Input
              type="date"
              label="Due Date"
              variant="standard"
              size="md"
              name="dueDate"
              value={updatedFeature.dueDate || ""}
              onChange={handleUpdateFeatureChange}
            />
            <Select
              label="Assign To"
              variant="standard"
              size="md"
              name="assignedTo"
              value={updatedFeature.assignedTo || ""}
              onChange={(value) => handleUpdateSelect("assignedTo", value)}
              required
            >
              {users.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          </DialogBody>
          <DialogFooter className="space-x-2">
            <Button
              variant="outlined"
              onClick={() => {
                setFeatureToUpdate(null);
                setOpenUpdate(false);
              }}
              className="rounded-md hover:text-red-700 hover:border-red-700"
            >
              <span>Cancel</span>
            </Button>
            <Button
              variant="filled"
              type="submit"
              className="rounded-md hover:opacity-75"
            >
              <span>Update</span>
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* UPDATE PROJECT DIALOG */}
    </div>
  );
};

export default SingleProject;
