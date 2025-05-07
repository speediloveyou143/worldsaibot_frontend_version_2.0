import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsPDF } from "jspdf";
import axios from "axios";
import { BACKEND_URL } from "../../../config/constant";

const Loader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
    <p className="text-white mt-4">Generating Report...</p>
  </div>
);

const Interview = () => {
  const [conversation, setConversation] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [webcamPermission, setWebcamPermission] = useState(false);
  const [micPermission, setMicPermission] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [responseCountdown, setResponseCountdown] = useState(null);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const videoRef = useRef(null);
  const utteranceRef = useRef(null);
  const chatBoxRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
const [selectedCategory, setSelectedCategory] = useState(null);

const filteredTopics = topics.filter(topic => {
  const matchesSearch = topic.topic.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = !selectedCategory || topic.category === selectedCategory;
  return matchesSearch && matchesCategory;
});

  let genAI, model;
  if (geminiApiKey) {
    genAI = new GoogleGenerativeAI(geminiApiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/all-questions`);
        setTopics(response.data);
      } catch (error) {
        console.error("Error fetching topics:", error);
        setStatus("Failed to load interview questions.");
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (
      webcamPermission &&
      micPermission &&
      selectedLanguage &&
      !showPermissionModal
    ) {
      const startVideo = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current
                .play()
                .catch((err) => console.error("Play error:", err));
            };
            setStatus("Video and audio feed active");
          }
        } catch (err) {
          console.error("Error accessing webcam/microphone:", err);
          setStatus(
            `Error: Webcam or microphone access denied - ${err.message}`
          );
        }
      };
      startVideo();
    }
  }, [webcamPermission, micPermission, selectedLanguage, showPermissionModal]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      startInterview(selectedLanguage);
      setCountdown(null);
    }
  }, [countdown, selectedLanguage]);

  useEffect(() => {
    if (responseCountdown !== null && responseCountdown > 0) {
      const timer = setInterval(() => {
        setResponseCountdown((prev) => {
          const newCount = prev - 1;
          setConversation((prevConv) => {
            const updatedConv = [...prevConv];
            if (
              updatedConv[updatedConv.length - 1].speaker === "You" &&
              !updatedConv[updatedConv.length - 1].text
            ) {
              updatedConv[updatedConv.length - 1] = {
                speaker: "You",
                text: "",
                countdown: newCount,
              };
            }
            return updatedConv;
          });
          return newCount;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (responseCountdown === 0) {
      setConversation((prev) => {
        const updatedConv = [...prev];
        if (
          updatedConv[updatedConv.length - 1].speaker === "You" &&
          !updatedConv[updatedConv.length - 1].text
        ) {
          updatedConv[updatedConv.length - 1] = { speaker: "You", text: "" };
        }
        return updatedConv;
      });
      setResponseCountdown(null);
    }
  }, [responseCountdown]);

  const stopMediaStreams = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    SpeechRecognition.stopListening();
    setIsListening(false);
    setStatus("Media streams stopped");
  };

  const stopAllSpeech = () => {
    if (isSpeaking && utteranceRef.current) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  };

  const validateAnswer = async (answer, question) => {
    if (!model) return 0;
    try {
      const prompt = `You are an interview assistant. Evaluate the following answer to the question "${question}". Return "correct" if the answer is accurate and relevant, or "incorrect" if it’s not. Answer: "${answer}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      return response.trim() === "correct" ? 1 : 0;
    } catch (error) {
      console.error("Error validating answer with Gemini:", error);
      return 0;
    }
  };

  const getCorrectAnswer = async (question) => {
    if (!model) return "API key not provided";
    try {
      const prompt = `You are an interview assistant. Provide a concise, correct answer to the following interview question: "${question}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      return response.trim();
    } catch (error) {
      console.error("Error generating correct answer with Gemini:", error);
      return "Unable to generate correct answer due to an error.";
    }
  };

  const generateCorrectAnswers = async () => {
    const answers = await Promise.all(
      questions.map((q) => getCorrectAnswer(q))
    );
    setCorrectAnswers(answers);
  };

  const handleUserInput = (input) => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("stop") || lowerInput.includes("end")) {
      setShowStopModal(true);
      return true;
    }
    if (lowerInput.includes("repeat") || lowerInput.includes("again")) {
      const currentQuestion = questions[currentQuestionIndex];
      setConversation((prev) => [
        ...prev,
        { speaker: "AI", text: `No problem, I’ll repeat: ${currentQuestion}` },
      ]);
      speak(`No problem, I’ll repeat: ${currentQuestion}`);
      return true;
    }
    if (lowerInput.includes("skip")) {
      if (currentQuestionIndex < questions.length - 1) {
        setConversation((prev) => [
          ...prev,
          { speaker: "AI", text: "Okay, let’s skip to the next one." },
        ]);
        speak("Okay, let’s skip to the next one.");
        setTimeout(() => askNextQuestion(), 5000);
      } else {
        endInterview();
      }
      return true;
    }
    return false;
  };

  const askNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      const nextQuestion = questions[currentQuestionIndex + 1];
      setConversation((prev) => [
        ...prev,
        { speaker: "AI", text: `Next question: ${nextQuestion}` },
      ]);
      speak(`Next question: ${nextQuestion}`);
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      endInterview();
    }
  };

  const endInterview = () => {
    setIsLoading(true);
    stopAllSpeech();
    stopMediaStreams();
    const finalMessage = `Great job! The interview is over. Your final score is ${score}/${questions.length}.`;
    setConversation((prev) => [...prev, { speaker: "AI", text: finalMessage }]);
    generateCorrectAnswers().then(() => {
      setShowDashboard(true);
      setIsLoading(false);
      // sendReportToWhatsApp(); // Commented out as it's not implemented
    });
    setSelectedLanguage(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setResponseCountdown(null);
  };

  const stopInterview = () => {
    setIsLoading(true);
    stopAllSpeech();
    stopMediaStreams();
    const finalMessage = `Alright, the interview has been stopped. Your score was ${score}/${questions.length}.`;
    setConversation((prev) => {
      const newConversation = [...prev, { speaker: "AI", text: finalMessage }];
      setTimeout(() => {
        generateCorrectAnswers().then(() => {
          setShowDashboard(true);
          setIsLoading(false);
          // sendReportToWhatsApp(); // Commented out as it's not implemented
        });
      }, 1500);
      setShowStopModal(false);
      setSelectedLanguage(null);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setScore(0);
      setResponseCountdown(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return newConversation;
    });
  };

  useEffect(() => {
    if (!listening && transcript && selectedLanguage) {
      setIsListening(false);
      const userInput = transcript;
      setConversation((prev) => {
        const updatedConversation = [...prev];
        updatedConversation[updatedConversation.length - 1] = {
          speaker: "You",
          text: userInput,
        };
        return updatedConversation;
      });
      resetTranscript();

      if (handleUserInput(userInput)) {
        if (chatBoxRef.current)
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        return;
      }

      const currentQuestion = questions[currentQuestionIndex];
      validateAnswer(userInput, currentQuestion).then((points) => {
        setScore((prev) => prev + points);
        const feedback = points
          ? "Nice one! That’s a solid answer."
          : "Hmm, that might need a bit more detail. Let’s try the next question.";
        setConversation((prev) => [...prev, { speaker: "AI", text: feedback }]);
        speak(feedback);

        if (currentQuestionIndex < questions.length - 1) {
          setTimeout(() => askNextQuestion(), 5000);
        } else {
          setTimeout(() => endInterview(), 5000);
        }

        if (chatBoxRef.current)
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      });
    }
  }, [
    listening,
    transcript,
    selectedLanguage,
    questions,
    currentQuestionIndex,
    score,
  ]);

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice =
        voices.find(
          (voice) =>
            voice.name === "Google US English" ||
            voice.name === "Samantha" ||
            voice.gender === "female"
        ) || voices[0];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = femaleVoice;
      utterance.pitch = 1.2;
      utterance.rate = 1;
      utterance.volume = 1;
      utteranceRef.current = utterance;
      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        if (
          text.includes("First question") ||
          text.includes("Next question") ||
          text.includes("I’ll repeat") ||
          text === "Okay, let’s skip to the next one."
        ) {
          setConversation((prev) => [
            ...prev,
            { speaker: "You", text: "", countdown: 3 },
          ]);
          setResponseCountdown(3);
        }
      };
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
        setStatus("Error in speech synthesis");
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setStatus("Error: Text-to-speech not supported");
    }
  };

  const stopSpeaking = () => {
    if (isSpeaking && utteranceRef.current) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setStatus("Speech stopped");
      setResponseCountdown(null);
    }
  };

  const startListening = () => {
    if (micPermission) {
      SpeechRecognition.startListening({ continuous: false });
      setIsListening(true);
      setStatus("Listening to your input...");
    } else {
      setStatus("Error: Microphone permission not granted");
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setStatus("Processing your input...");
  };

  const handleStartInterview = (language, questions) => {
    setSelectedLanguage(language);
    setQuestions(questions);
    setShowUserInfoModal(true);
  };

  const confirmUserInfo = () => {
    if (userName && userEmail && userMobile) {
      setShowUserInfoModal(false);
      setShowApiKeyModal(true);
    } else {
      setStatus("Please provide name, email, and mobile number.");
    }
  };

  const cancelUserInfo = () => {
    setShowUserInfoModal(false);
    setUserName("");
    setUserEmail("");
    setUserMobile("");
    setSelectedLanguage(null);
    setQuestions([]);
  };

  const confirmApiKey = () => {
    if (geminiApiKey) {
      setShowApiKeyModal(false);
      setShowPermissionModal(true);
    } else {
      setStatus("Please provide a valid Gemini API key.");
    }
  };

  const cancelApiKey = () => {
    setShowApiKeyModal(false);
    setGeminiApiKey("");
    setSelectedLanguage(null);
    setQuestions([]);
  };

  const confirmPermissions = async () => {
    if (webcamPermission && micPermission) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              .play()
              .catch((err) => console.error("Play error:", err));
          };
        }
        setShowPermissionModal(false);
        setCountdown(10);
      } catch (err) {
        console.error("Permission error:", err);
        setStatus(`Error: ${err.message}`);
      }
    } else {
      setStatus(
        "Please grant both webcam and microphone permissions to proceed."
      );
    }
  };

  const cancelPermissions = () => {
    setShowPermissionModal(false);
    setSelectedLanguage(null);
    setWebcamPermission(false);
    setMicPermission(false);
    setQuestions([]);
  };

  const startInterview = (language) => {
    setConversation([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStatus(`Starting ${language} interview...`);
    setShowDashboard(false);

    const firstQuestion = questions[0];
    setConversation([
      {
        speaker: "AI",
        text: `Let’s start your ${language} interview! First question: ${firstQuestion}`,
      },
    ]);
    speak(
      `Let’s start your ${language} interview! First question: ${firstQuestion}`
    );
  };

  const downloadChatAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("WAB AI Interview Performance Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${userName}`, 20, 30);
    doc.text(`Email: ${userEmail}`, 20, 40);
    doc.text(`Mobile: +91${userMobile}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Score: ${score}/${questions.length}`, 20, 70);

    doc.setFontSize(14);
    doc.text("Chat History:", 20, 80);
    let yPosition = 90;

    conversation.forEach((entry) => {
      const speakerLabel = entry.speaker === "AI" ? "Assistant" : "You";
      const text = `${speakerLabel} (${getCurrentTime()}): ${
        entry.text || (entry.countdown > 0 ? entry.countdown : "Start")
      }`;
      const splitText = doc.splitTextToSize(text, 170);
      doc.text(splitText, 20, yPosition);
      yPosition += splitText.length * 7;
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.setFontSize(14);
    doc.text("Correct Answers:", 20, yPosition + 10);
    yPosition += 20;

    correctAnswers.forEach((answer, index) => {
      const text = `Q${index + 1}: ${
        questions[index]
      }\nCorrect Answer: ${answer}`;
      const splitText = doc.splitTextToSize(text, 170);
      doc.text(splitText, 20, yPosition);
      yPosition += splitText.length * 7;
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.save(
      `wab_ai_interview_${userName}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gray-950  flex justify-center p-2 sm:p-8 h-full overflow-y-auto">
      {isLoading && <Loader />}

      {(!selectedLanguage ||
        showPermissionModal ||
        showUserInfoModal ||
        showApiKeyModal) &&
      !showDashboard ? (
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold text-white">WAB AI Interview</h2>
          <div className="space-y-6 p-4 max-w-7xl mx-auto">
  {/* Search and Filter Section */}
  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
    <div className="relative w-full sm:w-96">
      <input
        type="text"
        placeholder="Search topics (e.g. Python, React)"
        className="w-full px-4 py-2.5 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <svg
        className="absolute right-3 top-3 h-5 w-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>

    <div className="flex flex-wrap gap-2">
      {['All', 'Programming', 'Web Dev', 'Data Science', 'System Design'].map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category === 'All' ? null : category)}
          className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
            (selectedCategory === category || (category === 'All' && !selectedCategory))
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </div>

  {/* Topics Grid */}
  {filteredTopics.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredTopics.map((topic) => (
        <button
          key={topic._id}
          onClick={() => handleStartInterview(topic.topic, topic.questions)}
          className="relative flex items-center justify-between p-5 h-24 bg-gray-900 rounded-xl border border-gray-800 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group"
          style={{
            border: '2px solid transparent',
            background:
              'linear-gradient(#111827, #111827) padding-box, ' +
              'linear-gradient(to right, #3B82F6, #9333EA) border-box',
          }}
        >
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white truncate max-w-[180px]">
              {topic.topic}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{topic.category}</p>
          </div>
          
          <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full group-hover:animate-pulse shadow-md">
            {topic.questions.length}
          </span>

          {/* Hover effect */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/10 to-purple-600/10 pointer-events-none"></div>
        </button>
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-white">No topics found</h3>
      <p className="mt-1 text-gray-400">
        Try adjusting your search or filter criteria
      </p>
    </div>
  )}
</div>
          {showUserInfoModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-white w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Enter Your Details
                </h2>
                <div className="flex flex-col gap-5">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Your Mobile Number (10 digits)"
                    value={userMobile}
                    onChange={(e) => setUserMobile(e.target.value)}
                    className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-8 flex justify-end gap-4">
                  <button
                    onClick={confirmUserInfo}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition transform hover:scale-105"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={cancelUserInfo}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-400 text-center">
                  {status}
                </p>
              </div>
            </div>
          )}
          {showApiKeyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-white w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Enter Gemini API Key
                </h2>
                <div className="flex flex-col gap-5">
                  <input
                    type="text"
                    placeholder="Paste your Gemini API Key here"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-400 text-center">
                    <a
                      href="https://www.youtube.com/watch?v=your-video-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Watch video to get API key
                    </a>
                  </p>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                  <button
                    onClick={confirmApiKey}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition transform hover:scale-105"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={cancelApiKey}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-400 text-center">
                  {status}
                </p>
              </div>
            </div>
          )}
          {showPermissionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
                <h2 className="text-xl font-bold mb-4">Grant Permissions</h2>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={webcamPermission}
                      onChange={(e) => setWebcamPermission(e.target.checked)}
                      className="w-5 h-5"
                    />
                    Allow Webcam
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={micPermission}
                      onChange={(e) => setMicPermission(e.target.checked)}
                      className="w-5 h-5"
                    />
                    Allow Microphone
                  </label>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    onClick={confirmPermissions}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={cancelPermissions}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-400">{status}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-6xl relative">
          <div className="absolute top-4 left-4 flex items-center gap-1 z-10">
            <h1 className="w-12 h-12 flex items-center justify-center border-2 border-blue-500 rounded-full transform rotate-[21deg] text-2xl font-bold ms-[-20px] bg-[red] pe-[0] me-[0]">
              W
            </h1>
            <span className="text-2xl ps-[0] font-bold text-white ms-[0]">
              AI
            </span>
          </div>

          {showDashboard ? (
            <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl shadow-lg p-8 text-white mt-20 max-h-[85vh] sm:h-[550px] overflow-y-auto mb-[100px] px-2 sm:px-6">
              <h2 className="text-3xl font-bold mb-6 text-center">
                WAB AI Interview Performance Dashboard
              </h2>
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={downloadChatAsPDF}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-full hover:from-green-700 hover:to-green-900 transition transform hover:scale-105"
                >
                  Download as PDF
                </button>
                <button
                  onClick={() => setShowDashboard(false)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105"
                >
                  Start New Interview
                </button>
              </div>
              <div className="mb-6">
                <p className="text-lg">
                  Name: <span className="font-bold">{userName}</span>
                </p>
                <p className="text-lg">
                  Email: <span className="font-bold">{userEmail}</span>
                </p>
                <p className="text-lg">
                  Mobile: <span className="font-bold">+91{userMobile}</span>
                </p>
                <p className="text-lg">
                  Score:{" "}
                  <span className="font-bold">
                    {score}/{questions.length}
                  </span>
                </p>
                <p className="text-sm">
                  Date: {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto rounded-lg p-4 bg-gray-950/50 flex flex-col gap-4">
                {conversation.map((entry, index) => (
                  <div
                    key={index}
                    className={`chat ${
                      entry.speaker === "AI" ? "chat-start" : "chat-end"
                    }`}
                  >
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <img
                          alt={`${entry.speaker} avatar`}
                          src={
                            entry.speaker === "AI"
                              ? "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                              : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                          }
                        />
                      </div>
                    </div>
                    <div className="chat-header">
                      {entry.speaker === "AI" ? "Assistant" : "You"}
                      <time className="text-xs opacity-50 ml-2">
                        {getCurrentTime()}
                      </time>
                    </div>
                    <div
                      className={`chat-bubble ${
                        entry.speaker === "AI" ? "bg-blue-600" : "bg-purple-600"
                      } text-white`}
                    >
                      {entry.text ||
                        (entry.countdown > 0 ? entry.countdown : "Start")}
                    </div>
                  </div>
                ))}
                {correctAnswers.map((answer, index) => (
                  <div key={`correct-${index}`} className="chat chat-start">
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <img
                          alt="Assistant avatar"
                          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        />
                      </div>
                    </div>
                    <div className="chat-header">
                      Correct Answer
                      <time className="text-xs opacity-50 ml-2">
                        {getCurrentTime()}
                      </time>
                    </div>
                    <div className="chat-bubble bg-green-600 text-white">
                      Q{index + 1}: {questions[index]}
                      <br />
                      Correct Answer: {answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 overflow-y-auto pb-[180px]">
              <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl shadow-xl border-2 border-blue-800/70 flex flex-col items-center p-4">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Your Video
                </h2>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-72 rounded-lg object-cover shadow-inner"
                />
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl shadow-lg p-6 flex flex-col items-center border border-blue-800/50">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  WAB AI Assistant
                </h2>
                <div className="relative w-48 h-48">
                  <svg
                    viewBox="0 0 100 100"
                    className={`transition-all duration-300 ${
                      isListening ? "animate-amoeba" : ""
                    } ${isSpeaking ? "animate-speak" : ""}`}
                  >
                    <path
                      d="M50 10 C70 10, 90 30, 90 50 C90 70, 70 90, 50 90 C30 90, 10 70, 10 50 C10 30, 30 10, 50 10 Z"
                      fill="url(#amoebaGradient)"
                      className={isListening ? "pulsate" : ""}
                    />
                    <text
                      x="50"
                      y="60"
                      textAnchor="middle"
                      fill="white"
                      fontSize="24"
                      fontWeight="bold"
                      fontFamily="Arial, sans-serif"
                    >
                      W
                    </text>
                    <defs>
                      <linearGradient
                        id="amoebaGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" style={{ stopColor: "#3b82f6" }} />
                        <stop offset="100%" style={{ stopColor: "#9333ea" }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  {listening && (
                    <span className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 text-white text-sm font-semibold bg-gray-800 px-3 py-1 rounded-full shadow-md">
                      Listening...
                    </span>
                  )}
                </div>
                {countdown !== null ? (
                  <div className="mt-6 text-2xl font-bold text-white">
                    {countdown}
                  </div>
                ) : (
                  <div className="mt-6 flex justify-center gap-4">
                    <button
                      onClick={() => setShowStopModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full hover:from-gray-700 Hover:to-gray-900 transition transform hover:scale-105"
                    >
                      Stop Interview
                    </button>
                    {isSpeaking && (
                      <button
                        onClick={stopSpeaking}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white rounded-full hover:from-yellow-700 hover:to-yellow-900 transition transform hover:scale-105"
                      >
                        Stop Speaking
                      </button>
                    )}
                  </div>
                )}
                <p className="mt-4 text-sm text-gray-400">{status}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl shadow-lg p-6 flex flex-col border border-blue-800/50">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {selectedLanguage} Interview
                </h2>
                <div
                  ref={chatBoxRef}
                  className="h-80 overflow-y-auto rounded-lg p-4 bg-gray-950/50 flex flex-col gap-4"
                >
                  {conversation.map((entry, index) => (
                    <div
                      key={index}
                      className={`chat ${
                        entry.speaker === "AI" ? "chat-start" : "chat-end"
                      }`}
                    >
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          <img
                            alt={`${entry.speaker} avatar`}
                            src={
                              entry.speaker === "AI"
                                ? "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                            }
                          />
                        </div>
                      </div>
                      <div className="chat-header">
                        {entry.speaker === "AI" ? "Assistant" : "You"}
                        <time className="text-xs opacity-50 ml-2">
                          {getCurrentTime()}
                        </time>
                      </div>
                      {entry.speaker === "AI" ? (
                        <div className="chat-bubble bg-blue-600 text-white">
                          {entry.text}
                        </div>
                      ) : entry.text ? (
                        <div className="chat-bubble bg-purple-600 text-white">
                          {entry.text}
                        </div>
                      ) : (
                        <div className="chat-bubble bg-gray-700 text-white flex items-center justify-center">
                          {entry.countdown > 0 ? (
                            <span>{entry.countdown}</span>
                          ) : (
                            <button
                              onClick={startListening}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105"
                            >
                              Start
                            </button>
                          )}
                        </div>
                      )}
                      <div className="chat-footer opacity-50">
                        {entry.speaker === "AI"
                          ? "Delivered"
                          : entry.text
                          ? "Seen at " + getCurrentTime()
                          : "Waiting..."}
                      </div>
                    </div>
                  ))}
                  {listening && transcript && (
                    <div className="chat chat-end">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          <img
                            alt="User avatar"
                            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                          />
                        </div>
                      </div>
                      <div className="chat-header">
                        You
                        <time className="text-xs opacity-50 ml-2">
                          {getCurrentTime()}
                        </time>
                      </div>
                      <div className="chat-bubble bg-purple-600 text-white">
                        {transcript}
                      </div>
                      <div className="chat-footer opacity-50">Typing...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showStopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-xl font-bold mb-4">
              Are you sure you want to stop the interview?
            </h2>
            <div className="flex justify-end gap-4">
              <button
                onClick={stopInterview}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setShowStopModal(false)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes amoeba {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15) rotate(5deg);
          }
        }
        .animate-amoeba {
          animation: amoeba 1s infinite ease-in-out;
        }
        .pulsate {
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.7;
          }
        }
        @keyframes speak {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-speak {
          animation: speak 0.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Interview;
