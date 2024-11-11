const express = require("express");
const router = express.Router();
const Faculty = require("../schema/facultySchema"); // Import Faculty schema

// Register a new faculty member
router.post("/register", async (req, res) => {
  const { facultyName, email, password } = req.body;

  if (!facultyName || !email || !password) {
    return res
      .status(400)
      .json({ message: "Faculty name, email, and password are required" });
  }

  try {
    // Check if a faculty member with the same email already exists
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create a new faculty member
    const newFaculty = new Faculty({
      facultyName,
      email,
      password, // Store the plain text password
    });

    // Save the faculty member to the database
    const savedFaculty = await newFaculty.save();
    res.status(201).json({
      message: "Faculty registered successfully",
      faculty: savedFaculty,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login an existing faculty member
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find the faculty member by email
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the provided password matches the stored password (plain text comparison)
    if (faculty.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // If login is successful, return the faculty's information (excluding the password)
    const { password: _, ...facultyWithoutPassword } = faculty.toObject();
    res.status(200).json(facultyWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/addProject", async (req, res) => {
  const { email, projectName, projectDescription } = req.body;

  if (!email || !projectName || !projectDescription) {
    return res.status(400).json({
      message: "Email, project name, and project description are required",
    });
  }

  try {
    // Find the faculty member by email
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(400).json({ message: "Faculty member not found" });
    }

    // Add the project to the faculty member's projects array
    const newProject = {
      projectName,
      projectDescription,
      studentPerformance: [], // Initialize with an empty array for student performance
    };

    // Push the new project into the projects array
    faculty.projects.push(newProject);

    // Save the updated faculty document
    const updatedFaculty = await faculty.save();

    // Get the new project that was added (last one in the array)
    const addedProject =
      updatedFaculty.projects[updatedFaculty.projects.length - 1];

    // Send response with only the new project's details
    res.status(200).json({
      message: "Project added successfully",
      project: addedProject, // Send only the new project
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/addStudentPerformance", async (req, res) => {
  const { email, projectId, regNo, studentEmail, marks } = req.body;

  // Check if all fields are provided
  if (!email || !projectId || !regNo || !studentEmail || !marks) {
    return res.status(400).json({
      message:
        "Faculty email, project id, regNo, student email, and marks are required",
    });
  }

  try {
    // Find the faculty by email
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(400).json({ message: "Faculty member not found" });
    }

    // Find the project by projectId within the faculty's projects
    const project = faculty.projects.id(projectId);
    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }

    // Add the student performance to the project
    const newStudentPerformance = {
      regNo,
      studentEmail,
      marks,
    };

    // Push the student performance data into the project's studentPerformance array
    project.studentPerformance.push(newStudentPerformance);

    // Save the updated faculty document with the new student performance
    const updatedFaculty = await faculty.save();

    // Return the updated project with the new student performance
    res.status(200).json({
      message: "Student performance added successfully",
      project: updatedFaculty.projects.id(projectId), // Return the updated project
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
