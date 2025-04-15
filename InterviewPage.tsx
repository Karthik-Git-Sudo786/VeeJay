// components/InterviewPage.tsx
import React, { useRef, useState, useEffect } from "react";

const questions = [
  "Explain the differences between ECS and EKS.",
  "How do you implement CI/CD pipelines in AWS?",
  "What are best practices for securing IAM roles?",
  "How would you design a highly available system in AWS?",
  "What tools do you use for infrastructure as code and why?",
];

export default function InterviewPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");

  useEffect(() => {
    setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
  }, []);

  const startRecording = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) setRecordedChunks((prev) => [...prev, event.data]);
    };
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadVideo = async () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const formData = new FormData();
    formData.append("file", blob, "answer.webm");

    // Send to backend API
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert("Uploaded. Analysis Result: " + data.analysis);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold">AWS/DevOps Architect Interview</h1>
      <div className="text-xl bg-gray-700 p-4 rounded-xl shadow-lg">{currentQuestion}</div>
      <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-xl shadow" />
      <div className="flex space-x-4">
        {!isRecording ? (
          <button onClick={startRecording} className="bg-green-600 px-4 py-2 rounded-xl shadow">
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="bg-red-600 px-4 py-2 rounded-xl shadow">
            Stop Recording
          </button>
        )}
        <button onClick={uploadVideo} disabled={recordedChunks.length === 0} className="bg-blue-600 px-4 py-2 rounded-xl shadow">
          Upload & Analyze
        </button>
      </div>
    </div>
  );
}
