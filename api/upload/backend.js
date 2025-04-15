const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const videoPath = path.join(__dirname, req.file.path);

  // Simulated analysis
  const mockAnalysis = "Good explanation. Mentioned key AWS services like EKS, IAM, Terraform.";

  // Clean up video
  fs.unlinkSync(videoPath);

  res.json({ analysis: mockAnalysis });
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
