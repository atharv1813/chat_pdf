import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [summaryLevel, setSummaryLevel] = useState(3);
  const [autoSummary, setAutoSummary] = useState("");
  const [prompt, setPrompt] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  const fetchAutoSummary = async () => {
    try {
      setLoadingAuto(true);
      setError("");
      setAutoSummary("");

      if (!uploadedFile) {
        setError("Please upload a PDF file.");
        return;
      }

      const formData = new FormData();
      formData.append("uploaded_file", uploadedFile);
      formData.append("summary_level", summaryLevel);

      const response = await axios.post("http://localhost:5000/api/autosummarize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAutoSummary(response.data.auto_summary);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while fetching the auto summary.");
    } finally {
      setLoadingAuto(false);
    }
  };

  const fetchCustomOutput = async () => {
    try {
      setLoadingCustom(true);
      setError("");
      setCustomOutput("");

      if (!uploadedFile) {
        setError("Please upload a PDF file.");
        return;
      }
      if (!prompt.trim()) {
        setError("Please enter a custom prompt.");
        return;
      }

      const formData = new FormData();
      formData.append("uploaded_file", uploadedFile);
      formData.append("prompt", prompt);

      const response = await axios.post("http://localhost:5000/api/customprompt", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCustomOutput(response.data.output);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while fetching custom output.");
    } finally {
      setLoadingCustom(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-center text-blue-600">Document Analyzer</h1>
        
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Upload a PDF File:</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="w-full p-2 border rounded-md" />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Summary Level (1-5):</label>
          <input
            type="number"
            value={summaryLevel}
            onChange={(e) => setSummaryLevel(e.target.value)}
            min="1"
            max="5"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <button 
          onClick={fetchAutoSummary} 
          className="w-full py-2 font-semibold text-white transition bg-blue-500 rounded-md hover:bg-blue-600">
          {loadingAuto ? "Processing..." : "Auto Summarize"}
        </button>

        {error && <p className="mt-4 text-center text-red-500">{error}</p>}

        {autoSummary && (
          <div className="p-4 mt-4 border rounded-md bg-gray-50">
            <h2 className="text-xl font-bold text-blue-700">Auto Summary:</h2>
            <ReactMarkdown>{autoSummary}</ReactMarkdown>
          </div>
        )}

        <div className="mt-6">
          <label className="block mb-2 font-semibold">Custom Prompt:</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your custom prompt"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <button 
          onClick={fetchCustomOutput} 
          className="w-full py-2 mt-4 font-semibold text-white transition bg-green-500 rounded-md hover:bg-green-600">
          {loadingCustom ? "Processing..." : "Generate Custom Output"}
        </button>

        {customOutput && (
          <div className="p-4 mt-4 border rounded-md bg-gray-50">
            <h2 className="text-xl font-bold text-green-700">Custom Output:</h2>
            <ReactMarkdown>{customOutput}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
