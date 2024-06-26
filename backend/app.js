const express = require("express");
const app = new express();

const connectDB = require("./db/connect");
const User = require("./models/users");

require("dotenv").config();

// routes import
const users = require("./routes/users");
const projects = require("./routes/projects");
const features = require("./routes/features");

// middleware
app.use(express.static("../frontend"));
app.use(express.json()); // middleware to get req.body

// LOG IN
app.post("/api/v1/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Return the entire user object along with isAdmin flag
    return res.status(200).json({ user, isAdmin: user.isAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// API REQUEST ROUTE HANDLERS
// ex. any requests to paths starting with "/api/v1/users" will be handled by users
app.use("/api/v1/users", users);
app.use("/api/v1/projects", projects);
app.use("/api/v1/features", features);

// DB Connection and Port - NOTE: YOU NEED MONGO_URI and PORT(optional) from owner
const PORT = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server is listening to port ${PORT}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
