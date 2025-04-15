require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `${inputPath}.mp3`;

  try {
    // Convert to MP3
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat("mp3")
        .on("end", () => resolve())
        .on("error", reject)
        .save(outputPath);
    });

    // Transcribe via Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: "whisper-1",
    });

    const transcriptText = transcription.text;

    // (Optional) Analyze the transcript with GPT
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You're an AWS Architect interviewer. Evaluate the candidate's answer." },
        { role: "user", content: transcriptText }
      ]
    });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.json({
      transcript: transcriptText,
      analysis: gptResponse.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process the video." });
  }
});

app.listen(3001, () => console.log("Listening on http://localhost:3001"));
