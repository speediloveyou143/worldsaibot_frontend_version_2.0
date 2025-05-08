import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { BACKEND_URL } from '../../../config/constant';

const App = () => {
  const [code, setCode] = useState("# Write your Python code here");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodide, setPyodide] = useState(null);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

  const languages = [
    { value: "javascript", label: "JavaScript 🔽" },
    { value: "python", label: "Python 🔽" },
    { value: "html", label: "HTML 🔽" },
    { value: "css", label: "CSS 🔽" },
    { value: "java", label: "Java 🔽" },
    { value: "cpp", label: "C++ 🔽" },
  ];

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setProgress(100);
  };

  const dismissAlert = () => {
    setAlert(null);
    setProgress(100);
  };

  useEffect(() => {
    if (alert) {
      const duration = 3000;
      const interval = 50;
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            dismissAlert();
            clearInterval(timer);
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [alert]);

  useEffect(() => {
    const initializePyodide = async () => {
      try {
        showAlert("Initializing Python interpreter...", "info");
        if (typeof window.loadPyodide !== "function") {
          throw new Error("Pyodide script not loaded properly");
        }

        const pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });
        await pyodideInstance.loadPackage(["numpy", "pandas"]);

        setPyodide(pyodideInstance);
        setPyodideReady(true);
        showAlert("Python interpreter ready!", "success");
        setOutput("Here is your output...");
      } catch (error) {
        showAlert(`Failed to load Python interpreter: ${error.message}`, "error");
        setOutput("");
        setPyodideReady(false);
      }
    };

    if (!window.loadPyodide) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
      script.async = true;
      script.onload = () => initializePyodide();
      script.onerror = () => {
        showAlert(
          "Failed to load Pyodide script. Check your internet connection.",
          "error"
        );
        setOutput("");
        setPyodideReady(false);
      };
      document.body.appendChild(script);
    } else {
      initializePyodide();
    }

    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/all-tests`, {
        withCredentials: true,
      });
      const data = response.data;
      const formattedQuestions = data.map((item, index) => ({
        id: item._id || index + 1,
        question: `${index + 1}. ${item.question}`,
        testCases: item.test.map((testCase) => ({
          input: testCase.input,
          output: testCase.output,
        })),
      }));
      setQuestions(formattedQuestions);
      if (formattedQuestions.length > 0) {
        setSelectedQuestion(formattedQuestions[0]);
        showAlert("Questions loaded successfully!", "success");
      } else {
        showAlert("No questions available.", "info");
      }
    } catch (error) {
      showAlert(
        error.response?.data?.message || "Failed to fetch questions.",
        "error"
      );
      setQuestions([]);
      setSelectedQuestion(null);
    }
  };

  const convertReactStyleToHTML = (htmlCode) => {
    try {
      return htmlCode.replace(/style={{([^}]+)}}/g, (match, styleContent) => {
        const styles = styleContent
          .replace(/["']/g, "")
          .replace(/,\s*/g, ";")
          .replace(/([a-zA-Z]+)\s*:/g, "$1:")
          .replace(/([a-z])([A-Z])/g, "$1-$2")
          .toLowerCase();
        return `style="${styles}"`;
      });
    } catch (error) {
      showAlert("Failed to process HTML styles.", "error");
      return htmlCode;
    }
  };

  const executeCode = async () => {
    setLoading(true);
    setOutput("");

    try {
      switch (language) {
        case "javascript":
          const originalConsoleLog = console.log;
          const originalConsoleError = console.error;
          let consoleOutput = "";

          console.log = (...args) => {
            const formattedArgs = args.map((arg) => {
              if (typeof arg === "object" && arg !== null) {
                return JSON.stringify(arg, null, 2);
              }
              return String(arg);
            });
            consoleOutput += formattedArgs.join(" ") + "\n";
          };
          console.error = (...args) => {
            consoleOutput += "Error: " + args.join(" ") + "\n";
          };

          try {
            showAlert(
              "Warning: JavaScript execution may pose security risks.",
              "warning"
            );
            const asyncCode = `
              return new Promise((resolve) => {
                const log = console.log;
                const error = console.error;
                ${code}
                setTimeout(resolve, 1000);
              });
            `;
            const executionFunction = new Function(asyncCode);
            await executionFunction();
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
            setOutput(
              consoleOutput || "Code executed successfully (no console output)"
            );
          } catch (error) {
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
            setOutput(consoleOutput || `Error: ${error.message}`);
            showAlert(`JavaScript Error: ${error.message}`, "error");
          }
          break;

        case "html":
          const convertedCode = convertReactStyleToHTML(code);
          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
              </head>
              <body>
                ${convertedCode}
              </body>
            </html>
          `;
          setOutput(htmlContent);
          break;

        case "css":
          const cssPreview = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <style>${code}</style>
              </head>
              <body>
                <div class="preview-content">
                  <h1>Sample Heading</h1>
                  <p>This is a sample paragraph to preview your CSS.</p>
                  <button>Sample Button</button>
                </div>
              </body>
            </html>
          `;
          setOutput(cssPreview);
          break;

        case "python":
          if (!pyodideReady || !pyodide) {
            showAlert(
              "Python interpreter is not ready yet. Please wait or check your connection.",
              "error"
            );
            setOutput("");
          } else {
            try {
              pyodide.runPython(`
                import sys
                import io
                sys.stdout = io.StringIO()
              `);

              if (selectedQuestion?.testCases?.length > 0) {
                const inputs = selectedQuestion.testCases[0].input.split(",");
                let inputIndex = 0;
                pyodide.globals.set("input", () => {
                  return inputIndex < inputs.length ? inputs[inputIndex++] : "";
                });
              }

              await pyodide.runPythonAsync(code);
              const stdout = pyodide.runPython("sys.stdout.getvalue()");
              setOutput(stdout || "Code executed successfully (no output)");
            } catch (error) {
              showAlert(`Python Error: ${error.message}`, "error");
              setOutput("");
            }
          }
          break;

        case "java":
        case "cpp":
          let outputMessage = `Note: ${language} execution is not supported in this browser-based editor.\n`;
          outputMessage += `Your ${language} code:\n${code}\n\n`;
          if (selectedQuestion?.testCases?.length > 0) {
            const testResults = selectedQuestion.testCases
              .map(
                (testCase, index) =>
                  `Test Case ${index + 1}:\nInput: ${
                    testCase.input
                  }\nExpected Output: ${testCase.output}`
              )
              .join("\n\n");
            outputMessage += `Available Test Cases:\n${testResults}`;
          } else {
            outputMessage += "No test cases available for this question.";
          }
          setOutput(outputMessage);
          break;

        default:
          showAlert("Language not supported for execution", "error");
          setOutput("");
      }
    } catch (error) {
      showAlert(`Error: ${error.message}`, "error");
      setOutput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden sm:pb-[0px] pb-[100px]">
      {/* Alert Component */}
      {alert && (
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
            alert.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`px-6 py-4 rounded-xl shadow-xl backdrop-blur-sm flex flex-col w-80 ${
              alert.type === 'success'
                ? 'bg-green-600/90'
                : alert.type === 'info'
                ? 'bg-blue-600/90'
                : 'bg-red-600/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{alert.message}</span>
              <button
                onClick={dismissAlert}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="w-full h-1.5 mt-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
  
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>Code Editor</span>
            {!pyodideReady && (
              <span className="text-sm font-normal bg-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="animate-pulse">Loading Python</span>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
          </h1>
          
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800/80 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={executeCode}
              disabled={loading || (language === "python" && !pyodideReady)}
              className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-gray-100 hover:scale-[1.02] active:scale-95 shadow-md'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Run Code
                </>
              )}
            </button>
          </div>
        </div>
      </header>
  
      {/* Mobile Sidebar Toggle */}
      <div className="p-4 md:hidden">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          {showSidebar ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Hide Questions
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              Show Questions
            </>
          )}
        </button>
      </div>
  
      {/* Main Content */}
      <main className="flex flex-col md:flex-row h-[calc(100vh-112px)] max-w-7xl mx-auto">
        {/* Sidebar */}
        <div
          className={`fixed md:relative inset-y-0 left-0 w-72 bg-gray-800/80 backdrop-blur-sm rounded-r-xl md:rounded-none overflow-y-auto p-4 transform transition-transform duration-300 ease-in-out z-20 ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:border-r md:border-gray-700 shadow-xl`}
        >
          <div className="flex justify-between items-center mb-4 p-2">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Coding Questions
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedQuestion?.id === question.id
                      ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30"
                      : "bg-gray-700/50 hover:bg-gray-700 border border-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedQuestion(question);
                    if (window.innerWidth < 768) setShowSidebar(false);
                  }}
                >
                  <h3 className="font-semibold text-white ">
                    {question.question}
                  </h3>
                  <div className="mt-3 space-y-2">
                    {question.testCases.slice(0, 2).map((testCase, index) => (
                      <div
                        key={index}
                        className="text-xs bg-gray-800/70 p-2 rounded-lg"
                      >
                        <p className="text-gray-300 font-medium">Input: <span className="text-white">{testCase.input}</span></p>
                        <p className="text-gray-300 font-medium">Output: <span className="text-white">{testCase.output}</span></p>
                      </div>
                    ))}
                    {question.testCases.length > 2 && (
                      <p className="text-xs text-gray-400 mt-1">+{question.testCases.length - 2} more test cases</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-10 w-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="mt-2 text-gray-400">No questions available</p>
            </div>
          )}
        </div>
  
        {/* Editor and Output */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Editor */}
          <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
            <Editor
              height="100%"
              defaultLanguage={language}
              defaultValue={code}
              onChange={(value) => setCode(value)}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 15, bottom: 15 },
                renderWhitespace: "selection",
                lineNumbersMinChars: 3,
              }}
            />
          </div>
  
          {/* Output */}
          <div className="mt-4 bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 flex flex-col h-[40vh]">
            <div className="bg-gray-700/50 p-3 flex justify-between items-center border-b border-gray-700">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Output
              </h2>
              <button
                onClick={() => setOutput("")}
                className="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Clear
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 bg-gray-900/50">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : language === "html" || language === "css" ? (
                <iframe
                  srcDoc={output}
                  title="output"
                  sandbox="allow-scripts"
                  className="w-full h-full bg-white rounded-b-lg"
                />
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-200 overflow-auto h-full">
                  {output || <span className="text-gray-500">Run code to see output...</span>}
                </pre>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;