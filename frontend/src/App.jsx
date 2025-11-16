// // App.jsx
// import React, { useState } from "react";
// import axios from "axios";
// import ReactMarkdown from "react-markdown";

// const TABS = [
//   { key: "summary", label: "Summary" },
//   { key: "maths", label: "Maths" },
//   { key: "student", label: "Student" },
//   { key: "history", label: "History" },
//   { key: "research", label: "Research" },
// ];

// export default function App() {
//   const [active, setActive] = useState("summary");
//   const [file, setFile] = useState(null);
//   const [prompt, setPrompt] = useState("");
//   const [level, setLevel] = useState("medium");
//   const [output, setOutput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file) return setError("Please upload a PDF.");

//     try {
//       setLoading(true);
//       setOutput("");
//       setError("");

//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("mode", active);

//       if (active === "summary" || prompt.trim() !== "") {
//         formData.append("level", level);
//       }

//       if (prompt.trim() !== "") {
//         formData.append("prompt", prompt.trim());
//       }

//       const res = await axios.post(
//         "http://localhost:5000/api/summarize",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       setOutput(res.data.output);
//     } catch (err) {
//       setError(err.response?.data?.error || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] text-gray-800 flex justify-center">
//       <div className="w-full max-w-3xl p-8 border shadow-2xl backdrop-blur-xl bg-white/50 rounded-3xl border-white/30">
        
//         {/* Header */}
//         <h1 className="mb-8 text-4xl font-extrabold text-center text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
//           AI PDF Intelligence Hub
//         </h1>

//         {/* Tabs */}
//         <div className="flex justify-center gap-3 mb-8">
//           {TABS.map((t) => (
//             <button
//               key={t.key}
//               onClick={() => {
//                 setActive(t.key);
//                 setPrompt("");
//                 setOutput("");
//                 setError("");
//               }}
//               className={`px-5 py-2.5 rounded-full transition-all duration-200 text-sm font-medium shadow
//                 ${
//                   active === t.key
//                     ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
//                     : "bg-white/60 text-gray-700 hover:bg-white shadow"
//                 }
//               `}
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>

//         {/* Card */}
//         <div className="p-6 border border-gray-200 shadow-lg bg-white/70 backdrop-blur-lg rounded-2xl">
//           <form onSubmit={handleSubmit} className="space-y-6">
            
//             {/* File Upload */}
//             <div>
//               <label className="block mb-2 font-semibold text-gray-700">
//                 Upload PDF
//               </label>
//               <div className="flex items-center gap-3">
//                 <input
//                   type="file"
//                   accept="application/pdf"
//                   onChange={(e) => setFile(e.target.files[0])}
//                   className="w-full p-3 border border-gray-300 shadow-sm outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Prompt */}
//             <div>
//               <label className="block mb-2 font-semibold text-gray-700">
//                 Prompt (optional)
//               </label>
//               <input
//                 type="text"
//                 value={prompt}
//                 onChange={(e) => setPrompt(e.target.value)}
//                 placeholder={
//                   active === "summary"
//                     ? "Ask something about the PDF or leave blank for an automatic summary."
//                     : "Optional: Override the mode with your own custom question."
//                 }
//                 className="w-full p-3 border border-gray-300 shadow-sm outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Length control */}
//             {(active === "summary" || prompt.trim() !== "") && (
//               <div>
//                 <label className="block mb-2 font-semibold text-gray-700">
//                   Output Length
//                 </label>
//                 <select
//                   value={level}
//                   onChange={(e) => setLevel(e.target.value)}
//                   className="w-full p-3 border border-gray-300 outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="short">Short (5–7 lines)</option>
//                   <option value="medium">Medium (8–10 lines)</option>
//                   <option value="long">Long (10–12 lines)</option>
//                   <option value="in-depth">In-depth (13–15 lines)</option>
//                 </select>
//               </div>
//             )}

//             {/* Submit button */}
//             <button
//               disabled={!file || loading}
//               className={`w-full py-3 text-white rounded-xl text-lg font-semibold shadow-lg transition-all duration-200
//                 ${
//                   loading
//                     ? "bg-blue-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:scale-[1.02]"
//                 }
//               `}
//             >
//               {loading ? "Analyzing..." : "Run Analysis"}
//             </button>
//           </form>

//           {/* Error */}
//           {error && (
//             <div className="p-3 mt-4 text-red-700 bg-red-100 border border-red-300 rounded-xl">
//               {error}
//             </div>
//           )}
//         </div>

//         {/* Output */}
//         {output && (
//           <div className="p-6 mt-6 border border-gray-200 shadow-xl bg-white/70 backdrop-blur-lg rounded-2xl">
//             <h2 className="mb-4 text-2xl font-bold text-gray-800">
//               Result — {TABS.find((t) => t.key === active).label}
//             </h2>
//             <div className="prose prose-indigo max-w-none">
//               <ReactMarkdown>{output}</ReactMarkdown>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const TABS = [
  { key: "summary", label: "Summary" },
  { key: "maths", label: "Maths" },
  { key: "student", label: "Student" },
  { key: "history", label: "History" },
  { key: "research", label: "Research" },
];

export default function App() {
  const [active, setActive] = useState("summary");
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [level, setLevel] = useState("medium");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please upload a PDF.");

    try {
      setLoading(true);
      setOutput("");
      setError("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", active);

      if (active === "summary" || prompt.trim() !== "") {
        formData.append("level", level);
      }

      if (prompt.trim() !== "") {
        formData.append("prompt", prompt.trim());
      }

      const res = await axios.post(
        "http://localhost:5000/api/summarize",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setOutput(res.data.output);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#0a1a2f] to-[#0f2742] flex p-6 gap-6 overflow-hidden">

      {/* LEFT PANEL */}
      <div className="w-1/2 bg-[#112034]/70 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-[0_0_25px_rgba(30,60,120,0.6)] p-6 flex flex-col overflow-auto">
        <h1 className="mb-6 text-3xl font-extrabold text-center text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
          AI PDF Intelligence Hub
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActive(t.key);
                setPrompt("");
                setOutput("");
                setError("");
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow ${
                active === t.key
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-105 shadow-lg"
                  : "bg-white text-black text-blue-100 hover:bg-[#1e3355]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow gap-4">
          {/* File */}
          <div>
            <label className="block mb-1 font-semibold text-blue-100">Upload PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="block mb-1 font-semibold text-blue-100">Prompt (optional)</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                active === "summary"
                  ? "Ask something or leave blank for auto summary"
                  : "Override mode with custom question"
              }
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Length control */}
          {(active === "summary" || prompt.trim() !== "") && (
            <div>
              <label className="block mb-1 font-semibold text-blue-100">Output Length</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="short">Short (5–7 lines)</option>
                <option value="medium">Medium (8–10 lines)</option>
                <option value="long">Long (10–12 lines)</option>
                <option value="in-depth">In-depth (13–15 lines)</option>
              </select>
            </div>
          )}

          {/* Submit */}
          <button
            disabled={!file || loading}
            className={`w-full py-3 rounded-xl text-lg font-semibold text-white transition-all duration-200 shadow-lg ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(80,120,255,0.5)]"
            }`}
          >
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </form>

        {error && (
          <div className="p-3 mt-3 text-red-700 bg-red-100 border border-red-300 rounded-xl">
            {error}
          </div>
        )}
      </div>

      {/* RIGHT PANEL (OUTPUT) */}
      <div className="w-1/2 bg-[#112034]/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-[0_0_25px_rgba(30,60,120,0.6)] p-6 overflow-hidden flex flex-col">
        <h2 className="mb-4 text-2xl font-bold text-blue-100">
          Result — {TABS.find((t) => t.key === active).label}
        </h2>

        <div className="flex-grow pr-2 overflow-y-auto custom-scrollbar">
          {output ? (
            <div className="p-5 prose text-black bg-white shadow-inner prose-indigo max-w-none rounded-2xl">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-lg text-gray-500 opacity-70">
              Output will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Tailwind custom scrollbar (add in global.css)
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #6366f1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #e5e7eb;
}
*/
