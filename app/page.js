"use client";
import { useState, useEffect } from "react";
import { FaCheck, FaCopy, FaSpinner, FaFileUpload } from "react-icons/fa";
import Editor from "@monaco-editor/react";

export default function Home() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [modifiedCode, setModifiedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [correctedLang, setCorrectedLang] = useState("javascript");

  const isLikelyCode = (text) => {
    const keywords = [
      "function", "const", "let", "var", "=>", "return", "if", "else", "class", "import", "export",
      "<html", "</html>", "style", "color:", "def", "print", "public", "private", "void", "System.out",
      "#include", "printf", "main", "std::", "using namespace", "package", "extends", "@Override",
      "View", "Text", "StyleSheet", "TouchableOpacity", "useState", "useEffect"
    ];
    return keywords.some((kw) => text.includes(kw));
  };

  useEffect(() => {
    setLanguage(detectLanguage(code));
  }, [code]);

  const detectLanguage = (codeText) => {
    if (codeText.includes("<html")) return "html";
    if (codeText.includes("style") || codeText.includes("color:")) return "css";
    if (codeText.includes("#include") || codeText.includes("std::")) return "cpp";
    if (codeText.includes("def") || codeText.includes("print")) return "python";
    if (codeText.includes("public class") || codeText.includes("System.out")) return "java";
    if (
      codeText.includes("View") || codeText.includes("Text") ||
      codeText.includes("StyleSheet") || codeText.includes("TouchableOpacity")
    ) return "javascript";
    if (codeText.includes("function") || codeText.includes("const")) return "javascript";
    return "plaintext";
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setResult("⚠️ من فضلك الصق الكود الأول.");
      return;
    }

    if (!isLikelyCode(code)) {
      setResult("⚠️ الرجاء إدخال كود برمجي فقط، مش نص عادي.");
      return;
    }

    setLoading(true);
    setResult("");
    setModifiedCode("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      const message = data.message;

      const codeBlockMatch = message.match(/```(\w+)?\n([\s\S]*?)```/);
      const lang = codeBlockMatch?.[1]?.toLowerCase() || "javascript";
      const codeOnly = codeBlockMatch?.[2]?.trim() || "";

      const error = message.match(/❌\s*الخطأ\s*[:：]\s*(.*)/);
      const solution = message.match(/🛠\s*الحل\s*[:：]\s*(.*)/);

      const finalResult = [
        error ? `❌ الخطأ: ${error[1]}` : "",
        solution ? `🛠 الحل: ${solution[1]}` : ""
      ].filter(Boolean).join("\n\n");

      setResult(finalResult);
      setModifiedCode(codeOnly);
      setCorrectedLang(lang);
    } catch (err) {
      setResult("حصل خطأ أثناء التحليل. جرب تاني.");
    }

    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await file.text();
      setCode(text);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#0f172a] to-[#1e293b] text-white px-6 py-12 font-sans">
      <div className="max-w-5xl mx-auto bg-[#111827] p-10 rounded-3xl shadow-2xl border border-indigo-600/40 animate-fade-in">
        <h1 className="text-5xl font-extrabold text-indigo-400 mb-4 text-center tracking-tight drop-shadow-lg">
          WebBoost Analyzer <span className="animate-pulse">🚀</span>
        </h1>
        <p className="text-center mt-4 text-gray-400 mb-10 text-lg">
          أدخل الكود البرمجي الخاص بك، وسنقوم بتحليله وتصحيحه لك تلقائيًا 🔧
        </p>

        <div className="h-72  mb-6">
          <Editor
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              fontLigatures: true,
              roundedSelection: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        <label className="text-sm text-indigo-300 block mb-6 cursor-pointer hover:underline">
          <input type="file" accept=".js,.ts,.jsx,.tsx,.html,.css" className="hidden" onChange={handleFileUpload} />
          <FaFileUpload className="inline-block mr-2" /> أو اختر ملف كود لتحليله
        </label>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
            loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? <FaSpinner className="animate-spin" /> : "🔍 حلل الكود الآن"}
        </button>

        {result && (
          <div className="bg-white text-gray-900 mt-10 p-6 rounded-2xl shadow-xl animate-fadeIn"dir="rtl" >
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">نتيجة التحليل:</h2>
            <p className="whitespace-pre-line leading-relaxed text-sm mb-6 text-gray-800">{result}</p>

            {modifiedCode && (
              <>
                <h3 className="font-semibold text-gray-700 mb-2">الكود بعد التعديل:</h3>

                <pre dir="ltr" className="bg-gray-900 text-green-300 p-5 rounded-xl overflow-auto text-sm whitespace-pre-wrap shadow-inner border border-gray-700">
                  {modifiedCode}
                </pre>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(modifiedCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="bg-black hover:bg-gray-800 text-white font-medium px-6 py-2 rounded-lg mt-5 flex items-center gap-2 shadow"
                >
                  {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
                  {copied ? "تم النسخ!" : "نسخ الكود المصحح"}
                </button>
              </>
            )}

            <button
              onClick={() => {
                setCode("");
                setResult("");
                setModifiedCode("");
              }}
              className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl text-sm shadow-md"
            >
              🔄 تحليل جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
