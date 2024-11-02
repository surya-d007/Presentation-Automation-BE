const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
require("dotenv").config();

const app = express();
app.use(cors());

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Azure Speech SDK configuration
const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.API_KEY,
  process.env.REGION
);
speechConfig.speechRecognitionLanguage = "en-US";

// Function to convert WebM to WAV
const convertWebMtoWAV = (inputPath) => {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(".webm", ".wav");
    ffmpeg(inputPath)
      .setFfmpegPath(ffmpegPath) // Set ffmpeg path
      .toFormat("wav")
      .on("end", () => {
        console.log("Conversion finished:", outputPath);
        resolve(outputPath);
      })
      .on("error", (error) => {
        console.error("Error during conversion:", error);
        reject(error);
      })
      .save(outputPath); // Specify the output path here
  });
};

// Function to transcribe audio to text
const transcribeAudio = async (filePath) => {
  return new Promise((resolve, reject) => {
    console.log("Transcribing audio from file:", filePath); // Log file path

    const audioConfig = sdk.AudioConfig.fromWavFileInput(
      fs.readFileSync(filePath)
    );
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync((result) => {
      if (result.reason === sdk.ResultReason.RecognizedSpeech) {
        console.log("Recognized Text:", result.text);
        resolve(result.text);
      } else {
        console.error("Speech recognition error:", result.errorDetails);
        reject(result.errorDetails);
      }
      recognizer.close();
    });
  });
};

// API to handle audio file upload and transcription
app.post("/api/upload-audio", upload.single("audioFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Log the details of the uploaded file
  console.log("Uploaded file details:", req.file);
  console.log("Saved file path:", req.file.path); // Log saved file path

  let wavFilePath; // Declare wavFilePath here for broader scope

  try {
    // No need to convert if you receive a WAV file
    // Just transcribe the uploaded WAV audio file directly
    const transcript = await transcribeAudio(req.file.path);

    res.status(200).json({
      message: "Audio file uploaded and transcribed successfully",
      transcript,
    });
  } catch (error) {
    console.error("Error during processing:", error); // Log any errors during processing
    res.status(500).json({ message: "Error processing audio file", error });
  } finally {
    // Delete the uploaded audio file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting file:", err);
      else console.log("Successfully deleted file:", req.file.path); // Log successful deletion
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
