// schema/facultySchema.js
const mongoose = require("mongoose");

// Define the schema for a Faculty member
const facultySchema = new mongoose.Schema({
  facultyName: {
    type: String,
    required: true, // Required field for the faculty's name
    trim: true, // Trim whitespace around the name
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure the email is unique
    lowercase: true, // Store email in lowercase
    trim: true, // Remove extra spaces
  },
  password: {
    type: String,
    required: true, // Required field for the faculty's password
  },
  projects: [
    {
      projectName: {
        type: String,
        required: true, // Ensure project name is provided
      },
      projectDescription: {
        type: String,
        required: true, // Ensure project description is provided
      },
      studentPerformance: [
        {
          regNo: {
            type: String,
            required: true, // Required field for the student registration number
          },
          studentEmail: {
            type: String,
            required: true, // Required field for the student email
          },
          marks: {
            type: String,
            required: true, // Marks are required for each student
          },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Faculty", facultySchema);
