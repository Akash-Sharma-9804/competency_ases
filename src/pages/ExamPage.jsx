import React, { useState, useEffect, useRef } from "react";
import {
  SkipForward,
  Send,
  Mic,
  MicOff,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { testAPI } from "../utils/api";
import toast from "react-hot-toast";
import {
  createWebSocketConnection,
  createAudioStreamer,
} from "../utils/websocket";
import { getBaseUrl } from '../utils/api';


export default function ExamPage() {

  
 

  // State for questions and loading
  const [questions, setQuestions] = useState([]);

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Voice test states
  const [voiceTestActive, setVoiceTestActive] = useState(false);
  const [showReRecordOptions, setShowReRecordOptions] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);

  // Enhanced AI-driven states
  const [existingAnswer, setExistingAnswer] = useState(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [ttsConfirmationText, setTtsConfirmationText] = useState("");
  const [isVoiceConfirmation, setIsVoiceConfirmation] = useState(false);
  const [autoStartSTT, setAutoStartSTT] = useState(false);
  const [preservedAnswerTranscript, setPreservedAnswerTranscript] =
    useState(""); // Store original answer during confirmation
  const [isConfirmingExistingAnswer, setIsConfirmingExistingAnswer] =
    useState(false); // Track if confirming existing vs new answer
  const [aiMode, setAiMode] = useState(false); // Track AI conversation mode
  const [aiMessage, setAiMessage] = useState(""); // Current AI message
  const [conversationHistory, setConversationHistory] = useState([]); // Conversation history

  // Refs for WebSocket and media
  const socketRef = useRef(null);
  // REPLACE WITH
  const audioStreamerRef = useRef(null);
  const canSendAudioRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const voiceTestActiveRef = useRef(false); // Track voice test state reliably
  const isVoiceConfirmationRef = useRef(false); // Track voice confirmation state reliably
  const isPlayingTTSRef = useRef(false); // guard to avoid double TTS playback

  toast.info = (message) =>
    toast(message, {
      icon: "ℹ️",
      style: {
        borderRadius: "8px",
        background: "#1e90ff",
        color: "#fff",
      },
    });

  // Fetch test data and questions on component mount
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);

        // Get testId from localStorage
        const testId = localStorage.getItem("testId");
        const userId = localStorage.getItem("userId");

        console.log("Debug - localStorage testId:", testId);
        console.log("Debug - localStorage userId:", userId);

        if (!testId) {
          throw new Error("No test ID found. Please start a test first.");
        }

        // Fetch test data using the same approach as ManageTests.jsx
        const data = await testAPI.getStartedTestData(testId);

        console.log("Fetched test data:", data);
        console.log("Questions from API:", data.questions);

        setTestData(data);

        // Use the same approach as ManageTests.jsx
        const questions = data.questions || [];
        console.log(
          "Processing questions:",
          questions,
          "Length:",
          questions.length
        );

        // Transform questions to the format expected by the component
        // Extract the actual question text from the question objects
        const formattedQuestions = questions.map((questionObj, index) => ({
          id: index + 1,
          question:
            questionObj.text ||
            questionObj.question ||
            "No question text available",
        }));

        setQuestions(formattedQuestions);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch test data:", err);
        console.error("Error details:", {
          message: err.message,
          testId: localStorage.getItem("testId"),
          userId: localStorage.getItem("userId"),
        });

        // If test not found, provide fallback questions for development
        if (
          err.message.includes("Test not found") ||
          err.message.includes("404")
        ) {
          console.warn(
            "Test not found, using fallback questions for development"
          );
          const fallbackQuestions = [
            "Tell us about your background and experience relevant to this role.",
            "Describe a challenging situation you've faced and how you overcame it.",
            "What are your strengths and how do they apply to this position?",
            "Where do you see yourself in the next 3-5 years?",
            "Why are you interested in working with our company?",
          ];

          const formattedQuestions = fallbackQuestions.map(
            (questionText, index) => ({
              id: index + 1,
              question: questionText,
            })
          );

          setQuestions(formattedQuestions);
          setTestData({ title: "Demo Test - Test Not Found" });
          setError(null);
          toast.error("Original test not found. Using demo questions.");
        } else {
          setError(err.message);
          toast.error(err.message || "Failed to load test questions");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, []);

  // Auto-start voice test and pre-generate audio when questions are loaded
  useEffect(() => {
    if (questions.length > 0) {
      console.log("🚀 [AUTO] Questions loaded, auto-starting voice test...");

      // Auto-start voice test and play first question
      // Auto-start voice test only (backend will trigger first question)
      setTimeout(() => {
        startVoiceTest();
      }, 1000);

      // Pre-generate all question audio in background
      setTimeout(() => {
        preGenerateAllAudio();
      }, 2000);
    }
  }, [questions.length]);

  // Pre-generate audio for all questions in background
  const preGenerateAllAudio = async () => {
    const testId = localStorage.getItem("testId");
    if (!testId || questions.length === 0) return;

    console.log(
      `🔄 [CACHE] Pre-generating audio for ${questions.length} questions...`
    );

    // Fix URL construction - remove /api if it's already in VITE_API_BASE_URL
   const baseUrl = getBaseUrl(); // universal base URL from api.js


    // Generate all audio files in parallel (max 5 concurrent requests)
    const batchSize = 5;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, questions.length); j++) {
        const questionNumber = j + 1;
        batch.push(
          fetch(
            `${baseUrl}/tests/${testId}/question-audio/${questionNumber}`,
            {
              method: "HEAD",
            }
          )
            .then(() => {
              console.log(`✅ [CACHE] Pre-cached question ${questionNumber}`);
            })
            .catch((err) => {
              console.log(
                `⚠️ [CACHE] Failed to pre-cache question ${questionNumber}:`,
                err.message
              );
            })
        );
      }

      // Wait for current batch to complete before starting next
      await Promise.all(batch);
      console.log(
        `📦 [CACHE] Completed batch ${
          Math.floor(i / batchSize) + 1
        }/${Math.ceil(questions.length / batchSize)}`
      );
    }

    console.log("✅ [CACHE] All audio pre-generation completed");
  };

  // Initialize voice test WebSocket connection
  useEffect(() => {
    const initializeVoiceTest = () => {
      // Use new WebSocket utility with enhanced error handling
      console.log("🔌 [SOCKET] Initializing enhanced WebSocket connection...");

      socketRef.current = createWebSocketConnection({
        onConnect: () => {
          console.log("✅ [SOCKET] Enhanced WebSocket connected");
          // Initialize audio streamer when connected
          if (!audioStreamerRef.current) {
            audioStreamerRef.current = createAudioStreamer(socketRef.current);
          }
        },
        onError: (error) => {
          console.error("❌ [SOCKET] Enhanced WebSocket error:", error);
          toast.error("Failed to connect to voice test server");
        },
        onDisconnect: (reason) => {
          console.log("🔴 [SOCKET] Enhanced WebSocket disconnected:", reason);
          // Clean up audio streamer
          if (audioStreamerRef.current) {
            audioStreamerRef.current.stopAudioStream();
          }
        },
      });

      // Enhanced question loading event with robust AI mode
      socketRef.current.on("question-loaded", (data) => {
        console.log("🤖 [AI-ROBUST] Question loaded:", data);

        // Reset ALL states completely for new question
        setVoiceTestActive(true);
        voiceTestActiveRef.current = true;
        setCurrentIndex(data.questionIndex);
        setTranscript("");
        setFullTranscript("");
        setPreservedAnswerTranscript("");
        setShowReRecordOptions(false);
        setIsVoiceConfirmation(false);
        isVoiceConfirmationRef.current = false;
        setTtsConfirmationText("");
        setPreservedAnswerTranscript("");
        setIsConfirmingExistingAnswer(false);

        // Set up AI mode for natural conversation
        setAiMode(data.aiMode || false);
        setConversationHistory([]);
        setAiMessage("");

        // Handle existing answer with prominent display
        if (data.existingAnswer) {
          console.log(
            "📝 [AI-EXISTING] Found previous answer:",
            data.existingAnswer
          );
          setExistingAnswer(data.existingAnswer);
          setFullTranscript(data.existingAnswer.transcript || "");
          setAnsweredQuestions(
            (prev) => new Set([...prev, data.questionIndex])
          );

          // Highlight answer on UI
          toast.success(
            `📝 You already answered Question ${data.questionIndex + 1}`
          );

          console.log(
            "🤖 [AI-EXISTING] Preparing AI conversation for existing answer"
          );
        } else {
          console.log("🤖 [AI-NEW] New question - normal flow");
          setExistingAnswer(null);
          setFullTranscript("");
        }

      

        if (data.questionIndex === 0) {
          toast.success("Voice test started!");
        } else {
          toast.success(`Moving to Question ${data.questionIndex + 1}`);
        }
      });

      socketRef.current.on("awaiting-reanswer-choice", () => {
        console.log("🤔 [REANSWER] Backend asks: reanswer or next?");
        setShowReRecordOptions(true);
        setIsVoiceConfirmation(true);
        setTtsConfirmationText(
          "You already answered this question. Say 'reanswer' to try again, or 'next' to continue."
        );
      });

      socketRef.current.on("stt-ready", () => {
        console.log("🎤 STT ready → starting recording immediately");
        // Start recording immediately when backend signals ready
        toggleRecording();
      });

      socketRef.current.on("live-transcription", ({ text, isFinal }) => {
        console.log("📝 [FRONTEND-STT] Transcript:", text, "| Final:", isFinal);
if (!isFinal) {
            // interim update only
            setTranscript(text);
          }
        if (aiMode) {
           

          return;
        }

        // fallback (non-AI)
        if (!isFinal) {
          setTranscript(text);
        } else {
          setTranscript("");
          setFullTranscript((prev) =>
            prev && prev.endsWith(text)
              ? prev
              : `${prev ? prev + " " : ""}${text}`
          );
        }
      });

      // 🤖 AI conversation + confirmation handling
      socketRef.current.on("ai-conversation", (data) => {
        console.log(
          "🤖 [AI-CONVO] Message:",
          data.message,
          "| Intent:",
          data.intent
        );

        // Play TTS audio (backend-sent) or fallback to speechSynthesis.
        const playAndThen = async () => {
          if (!data || !data.message) return;
          setIsPlayingTTS(true);
          isPlayingTTSRef.current = true;
          try {
            if (data.audio) {
              // container used on backend is wav — play as wav
              const audio = new Audio("data:audio/wav;base64," + data.audio);
              await audio
                .play()
                .catch((e) => console.warn("Audio play error:", e));
              // wait for end (best-effort)
              await new Promise((res) => {
                audio.onended = res;
                audio.onerror = res;
                // fallback timeout in case onended doesn't fire
                setTimeout(res, 3500);
              });
            } else if ("speechSynthesis" in window) {
              speechSynthesis.cancel();
              await new Promise((resolve) => {
                const utter = new SpeechSynthesisUtterance(data.message);
                utter.rate = 0.95;
                utter.onend = resolve;
                speechSynthesis.speak(utter);
              });
            } else {
              console.log("🔇 [AI-TTS] No TTS available");
            }
          } catch (err) {
            console.error("🔊 [AI-TTS] Playback failed:", err);
          } finally {
            setIsPlayingTTS(false);
            isPlayingTTSRef.current = false;
          }

          // After TTS finishes, if this is a COMPLETE confirmation ask, start listening for user's reply
          if (data.intent === "COMPLETE" || data.intent === "confirm-submit") {
            setIsVoiceConfirmation(true);
            isVoiceConfirmationRef.current = true;
            setTtsConfirmationText(
              data.message ||
                "I heard your answer. Do you want to submit it or reanswer?"
            );
            // auto start STT so user can reply verbally
            try {
              toggleRecording();
            } catch (e) {
              console.warn("⚠️ Auto-start recording failed:", e);
            }
          }

          // Handle directive intents from backend
          if (data.intent === "submit") {
            console.log("✅ [AI] Submitting answer automatically");
            socketRef.current?.emit("submit-answer");
          }
          if (data.intent === "reanswer") {
            console.log("🔄 [AI] Server requested reanswer");
            socketRef.current?.emit("reanswer");
          }
        };

        playAndThen();
      });

      // Play server-pushed TTS (base64 wav)
      socketRef.current.on("tts", (data) => {
        try {
          if (!data || !data.audio) return;
          // If we're already playing TTS from ai-conversation, ignore duplicate tts events
          if (isPlayingTTSRef.current) {
            console.log(
              "🔕 [TTS] Ignoring 'tts' event because TTS already playing"
            );
            return;
          }
          isPlayingTTSRef.current = true;
          setIsPlayingTTS(true);
          const audio = new Audio("data:audio/wav;base64," + data.audio);
          audio.onended = () => {
            isPlayingTTSRef.current = false;
            setIsPlayingTTS(false);
            console.log(
              "🏁 [FRONTEND] TTS finished → telling backend to start STT"
            );
            socketRef.current?.emit("start-stt", {
              questionIndex: currentIndex,
            });
          };

          audio.onerror = () => {
            isPlayingTTSRef.current = false;
            setIsPlayingTTS(false);
            console.warn("TTS play error");
          };
          audio.play().catch((e) => {
            console.warn("TTS play error:", e);
            isPlayingTTSRef.current = false;
            setIsPlayingTTS(false);
          });
        } catch (e) {
          console.error("🔊 [TTS] Play failed:", e);
          isPlayingTTSRef.current = false;
          setIsPlayingTTS(false);
        }
      });

      socketRef.current.on("recording-started", () => {
        console.log("🟢 [STT] Recording started event received");
        setIsRecording(true);
        canSendAudioRef.current = true; // ✅ now we can send audio

        // Handle recording started based on mode
        console.log(
          `🟢 [STT] Recording started - AI Mode: ${aiMode}, Voice Confirmation: ${isVoiceConfirmationRef.current}`
        );

        if (aiMode) {
          console.log(
            "🤖 [AI-RECORDING] AI conversation mode - preserving all transcripts"
          );
          // In AI mode, preserve everything and just clear interim
          setTranscript("");
          // Keep fullTranscript and preservedAnswerTranscript intact
        } else if (!isVoiceConfirmationRef.current) {
          setFullTranscript(""); // Clear previous transcript
          setPreservedAnswerTranscript(""); // Clear preserved transcript
          setTranscript(""); // Clear interim transcript
          console.log("🟢 [STT] Cleared transcripts for new recording");
        } else {
          console.log(
            "🔊 [CONFIRM] Preserving answer transcript during voice confirmation recording"
          );
          console.log(
            `🔊 [CONFIRM] Current preserved transcript: "${preservedAnswerTranscript}"`
          );
          // Keep the preserved transcript intact, only clear interim
          setTranscript("");
          // Ensure fullTranscript shows the preserved answer
          if (preservedAnswerTranscript) {
            setFullTranscript(preservedAnswerTranscript);
          }
        }

        toast.success("Recording started");
      });

      socketRef.current.on("recording-stopped", (data) => {
        console.log("🔴 [STT] Recording stopped event received");
        setIsRecording(false);
        canSendAudioRef.current = false; // 🚫 stop sending audio
        toast.success("Recording stopped");
      });

      socketRef.current.on("deepgram-disconnected", (data) => {
        console.log(
          "🔴 [STT] Deepgram disconnected:",
          data?.message || "Connection lost"
        );
        // Immediately stop all recording activities
        setIsRecording(false);
        canSendAudioRef.current = false;

        // Clean up audio context if exists
        if (processorRef.current) {
          processorRef.current.disconnect();
          processorRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        // Stop any media streams
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Show appropriate error message
        toast.error(
          data?.message || "Voice connection lost. Please try recording again."
        );

        // Reset relevant states
        setTranscript("");
        setFullTranscript("");
        setPreservedAnswerTranscript("");
      });

      // Simple TTS-driven confirmation flow
      socketRef.current.on("play-tts-confirmation", (data) => {
        console.log("🤖 [SIMPLE] Playing simple confirmation prompt:", data);

        // Simple confirmation states
        setIsVoiceConfirmation(true);
        isVoiceConfirmationRef.current = true;
        setTtsConfirmationText(data.text);

        if (data.simple) {
          console.log("🤖 [SIMPLE] Using simple AI-driven confirmation");
        }

        // Preserve transcript
        const answerToPreserve = data.transcription || fullTranscript;
        if (answerToPreserve && answerToPreserve.trim()) {
          setPreservedAnswerTranscript(answerToPreserve);
          setFullTranscript(answerToPreserve);
          setIsConfirmingExistingAnswer(data.isExistingAnswer || false);
          console.log(
            `🤖 [SIMPLE] Preserving ${
              data.isExistingAnswer ? "existing" : "new"
            } answer:`,
            answerToPreserve.substring(0, 50) + "..."
          );
        }

        setTranscript("");

        // Play TTS confirmation
        playTTSConfirmation(data.text, data.options);
      });

      // Enhanced reanswer ready with auto-STT
      socketRef.current.on("reanswer-ready", (data) => {
        console.log("🔄 [REANSWER] Ready to reanswer:", data);
        setShowReRecordOptions(false);
        setIsVoiceConfirmation(false);
        isVoiceConfirmationRef.current = false; // Clear ref for reliable state tracking
        setTranscript("");
        setFullTranscript("");
        setPreservedAnswerTranscript("");
        setExistingAnswer(null); // clear old answer display

        setIsConfirmingExistingAnswer(false); // Clear existing answer confirmation flag
        setExistingAnswer(null);

        // Ensure voice test remains active for reanswer
        setVoiceTestActive(true);
        voiceTestActiveRef.current = true;
        console.log("🎤 [REANSWER] Voice test active maintained for reanswer");

        if (data.autoStartSTT) {
          console.log("🎤 [AUTO] Auto-starting STT for reanswer...");
          // Use a longer delay and check voice test state
          setTimeout(() => {
            console.log("🎤 [AUTO] About to call toggleRecording for reanswer");
            console.log(
              `🎤 [AUTO] Voice test state - State: ${voiceTestActive}, Ref: ${voiceTestActiveRef.current}`
            );
            // Double-check voice test is active before starting
            if (voiceTestActiveRef.current) {
              console.log(
                "🎤 [AUTO] Voice test confirmed active via ref, starting recording"
              );
              toggleRecording();
            } else {
              console.log(
                "⚠️ [AUTO] Voice test not active via ref, manually activating and retrying"
              );
              setVoiceTestActive(true);
              voiceTestActiveRef.current = true;
              setTimeout(() => toggleRecording(), 500);
            }
          }, 1500); // Increased delay to ensure state updates
        }

        toast.info("Ready to record again");
      });

      // Fallback to manual confirmation (if voice confirmation fails)
      socketRef.current.on("answer-confirmation-needed", (data) => {
        console.log("🤔 [CONFIRM] Manual confirmation needed:", data);
        setShowReRecordOptions(true);
        setIsVoiceConfirmation(false);
        isVoiceConfirmationRef.current = false; // Clear ref
        setIsConfirmingExistingAnswer(false); // Clear existing answer confirmation flag
        setFullTranscript(data.transcription || "");
        setTranscript("");
        toast.info("Do you want to submit this answer or try again?");
      });

      socketRef.current.on("test-completed", (data) => {
        setIsTestCompleted(true);
        setVoiceTestActive(false);
        voiceTestActiveRef.current = false;
        isVoiceConfirmationRef.current = false; // Clear ref
        toast.success("Test completed successfully!");
        console.log("✅ Test completed with answers:", data.answers);
      });

      // Simple AI Conversation handler
      socketRef.current.on("ai-conversation", (data) => {
        console.log("🤖 [AI-SIMPLE] Received AI message:", data);

        if (data.isAIMode) {
          setAiMode(true);
          setAiMessage(data.message);

          // Show transcript if provided
          if (data.transcript) {
            setFullTranscript(data.transcript);
            setPreservedAnswerTranscript(data.transcript);
            console.log("🤖 [AI-SIMPLE] Showing answer transcript");
          }

          // Play AI message via TTS with better timing
          if ("speechSynthesis" in window && data.message) {
            // Stop any ongoing speech
            speechSynthesis.cancel();

            setTimeout(() => {
              const utterance = new SpeechSynthesisUtterance(data.message);
              utterance.rate = 0.8; // Slower for clarity
              utterance.pitch = 1.0;
              utterance.volume = 0.8;

              utterance.onend = () => {
                console.log(
                  "🤖 [AI-SIMPLE] AI finished speaking, ready for user"
                );
                setIsPlayingTTS(false);
              };

              utterance.onstart = () => {
                setIsPlayingTTS(true);
                console.log("🤖 [AI-SIMPLE] AI speaking");
              };

              speechSynthesis.speak(utterance);
            }, 200); // Small delay
          }
        }
      });

      // Handle TTS stop event
      socketRef.current.on("stop-tts", () => {
        console.log("🔇 [TTS] Received stop TTS event");
        // Stop any ongoing TTS
        if ("speechSynthesis" in window) {
          speechSynthesis.cancel();
        }
        setIsPlayingTTS(false);
        setIsVoiceConfirmation(false);
        isVoiceConfirmationRef.current = false;
        setIsConfirmingExistingAnswer(false); // Clear existing answer confirmation flag
      });

      socketRef.current.on("error", (data) => {
        toast.error(data.message || "Voice test error");
        console.error("❌ Voice test error:", data);
      });
    };

    if (questions.length > 0) {
      initializeVoiceTest();
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stopAudioStream();
      }
    };
  }, [questions.length]);

  // Start voice test
  const startVoiceTest = () => {
    const testId = localStorage.getItem("testId");
    const token = localStorage.getItem("token");

    console.log("🚀 [VOICE] Starting voice test with:", {
      testId,
      hasToken: !!token,
    });

    if (!testId || !token) {
      console.error("❌ [VOICE] Missing credentials:", {
        testId,
        hasToken: !!token,
      });
      toast.error("Missing test ID or authentication token");
      return;
    }

    console.log("📡 [VOICE] Emitting start-voice-test event...");
    socketRef.current?.emit("start-test", {
      testId,
      userId: localStorage.getItem("userId"),
    });
  };

  // Play TTS confirmation audio
  // Replace playTTSConfirmation with this new implementation
  const playTTSConfirmation = async (text, options) => {
    try {
      console.log("🔊 [TTS-CONFIRM] Playing confirmation audio:", text);
      setIsPlayingTTS(true);

      return new Promise((resolve) => {
        socketRef.current?.emit("tts", { text }, () => {
          console.log("🔊 [TTS-CONFIRM] Confirmation audio ended");
          setIsPlayingTTS(false);
          toast.info(
            'Voice confirmation: Say "next" to continue or "retry" to try again'
          );
          resolve();
        });
      });
    } catch (error) {
      console.error("❌ [TTS-CONFIRM] Error playing confirmation:", error);
      setIsPlayingTTS(false);
      setShowReRecordOptions(true);
    }
  };

  // Play question audio using TTS with auto-STT support
  const playQuestionAudio = async (
    questionNumber = currentIndex + 1,
    autoStartSTTAfter = false
  ) => {
    // Prevent multiple simultaneous TTS plays
    if (isPlayingTTSRef.current) {
      console.log("🔇 [AUDIO] TTS already playing, ignoring request");
      return;
    }

    try {
      const testId = localStorage.getItem("testId");
      const token = localStorage.getItem("token");

      console.log("🔊 [AUDIO] Playing question audio:", {
        testId,
        questionNumber,
      });

      if (!testId) {
        console.error("❌ [AUDIO] No testId found in localStorage");
        toast.error("Test ID not found");
        return;
      }

      // Set playing state
      setIsPlayingTTS(true);
      isPlayingTTSRef.current = true;

      // Fix URL construction - remove /api if it's already in VITE_API_BASE_URL
    const baseUrl = getBaseUrl(); // gets base URL from api.js / env
const audioUrl = `${baseUrl}/api/tests/${testId}/question-audio/${questionNumber}`;

      console.log("🔗 [AUDIO] Audio URL:", audioUrl);

      // Test if URL is reachable first
      const response = await fetch(audioUrl, {
        method: "HEAD",
      });

      console.log("📡 [AUDIO] Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const audio = new Audio(audioUrl);

      audio.oncanplaythrough = () => {
        console.log("✅ [AUDIO] Audio can play through");
      };

      audio.onloadeddata = () => {
        console.log("📦 [AUDIO] Audio data loaded");
      };

      audio.onerror = (e) => {
        console.error("❌ [AUDIO] Audio load error:", e);
        console.error("❌ [AUDIO] Audio error details:", {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState,
        });
        toast.error("Failed to load question audio");
      };

      audio.onended = () => {
        console.log("🏁 [AUDIO] Question TTS finished");
        setIsPlayingTTS(false);
        isPlayingTTSRef.current = false;

        // ✅ Tell backend to begin listening
        socketRef.current?.emit("start-stt", { questionIndex: currentIndex });
      };

      audio.onerror = (e) => {
        console.error("❌ [AUDIO] Audio error occurred:", e);
        setIsPlayingTTS(false);
        isPlayingTTSRef.current = false;
      };

      // Wait for audio to load
      await new Promise((resolve, reject) => {
        audio.addEventListener("canplaythrough", resolve, { once: true });
        audio.addEventListener("error", reject, { once: true });
        audio.load();
      });

      await audio.play();
      console.log("▶️ [AUDIO] Audio playback started");
      console.log("🔊 [AUDIO] Question is being read aloud");
    } catch (error) {
      console.error("❌ [AUDIO] Error playing question audio:", error);

      // Show more specific error message
      const errorMessage =
        error?.message || error?.toString() || "Unknown error";
      if (errorMessage.includes("403")) {
        toast.error("Authentication failed - please login again");
      } else if (errorMessage.includes("401")) {
        toast.error("Authentication required - please login again");
      } else if (errorMessage.includes("404")) {
        toast.error("Audio not found - test may not exist");
      } else if (errorMessage.includes("500")) {
        toast.error("Server error generating audio");
      } else {
        toast.error("Failed to play question audio: " + errorMessage);
       }
       
       // Ensure playing state is reset on error
       setIsPlayingTTS(false);
       isPlayingTTSRef.current = false;
     }
   };

  const handleSelectQuestion = (index) => {
    console.log(`📍 [NAV] Navigating to question ${index + 1}`);

    // Clear current states
    setIsRecording(false);
    setSidebarOpen(false);
    setShowReRecordOptions(false);
    setIsVoiceConfirmation(false);
    setTtsConfirmationText("");

    // Use backend navigation for enhanced loading
    if (voiceTestActive) {
      socketRef.current?.emit("navigate-to-question", { questionIndex: index });
    } else {
      // Fallback for non-voice mode
      setCurrentIndex(index);
      setTranscript("");
      setFullTranscript("");
      setExistingAnswer(null);
    }
  };

  const handleSkip = () => {
    if (currentIndex < questions.length - 1) {
      handleSelectQuestion(currentIndex + 1);
    }
  };

  const handleSubmit = () => {
    if (voiceTestActive) {
      // Use WebSocket for voice test submission — include built transcript
      const payload = {
        transcript: (
          preservedAnswerTranscript ||
          fullTranscript ||
          transcript ||
          ""
        ).trim(),
        questionIndex: currentIndex,
      };
      console.log("✅ [SUBMIT] Submitting answer via WebSocket", payload);
      socketRef.current?.emit("submit-answer", payload);
      setShowReRecordOptions(false); // Hide options immediately
      toast.success("Answer submitted! Processing...");
    } else {
      // Fallback for non-voice mode
      if (
        (fullTranscript && fullTranscript.trim()) ||
        (transcript && transcript.trim())
      ) {
        setAnsweredQuestions((prev) => new Set([...prev, currentIndex]));
        console.log(`Submitted Answer: ${transcript || fullTranscript}`);
      }
      handleSkip();
    }
  };

  const handleReRecord = () => {
    console.log("🔄 [REANSWER] Requesting reanswer via WebSocket");
    socketRef.current?.emit("reanswer");
    setShowReRecordOptions(false); // Hide options immediately
    toast.info("Preparing to record again...");
  };

  const toggleRecording = async () => {
    console.log(
      `🎤 [STT] Toggle recording - Voice Active: ${voiceTestActive} (ref: ${voiceTestActiveRef.current}), Is Recording: ${isRecording}`
    );
    console.log(
      `🎤 [STT] Current states - voiceTestActive: ${voiceTestActive}, isVoiceConfirmation: ${isVoiceConfirmation}, isWaitingForConfirmation: ${showReRecordOptions}`
    );

    // Simplified state checking - allow recording if voice test is active OR in AI conversation mode
    const isVoiceActive = voiceTestActiveRef.current || aiMode;

    if (!isVoiceActive) {
      console.log(
        "⚠️ [STT] Voice test not active and not in AI mode, ignoring recording request"
      );
      toast.error("Voice test is not active yet");
      return;
    }

    // If trying to start recording but already disconnected, notify backend
    if (!isRecording && socketRef.current?.isListening === false) {
      console.log("🔄 [STT] Attempting to reconnect recording session");
      socketRef.current.emit("start-recording", { sampleRate: 48000 });
      return;
    }

    // AI Mode handling - continuous conversation
    if (aiMode) {
      console.log(
        "🤖 [AI-MODE] AI conversation mode - continuous recording enabled"
      );
      if (isRecording) {
        console.log("🤖 [AI-MODE] AI is listening - don't interrupt");
        toast.info("🤖 AI is listening to your conversation...");
        return;
      }
    }

    if (isRecording) {
      // Stop recording
      console.log("⏹️ [STT] Stopping recording...");
      socketRef.current?.emit("stop-recording");
      streamRef.current?.getTracks().forEach((t) => t.stop());

      // Clean up AudioContext
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      console.log("🛑 [STT] AudioContext stopped");
    } else {
      // Start recording
      console.log("🎤 [STT] Starting recording...");
      try {
        console.log("🎙️ [STT] Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: { ideal: 48000 }, // let browser keep native rate
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        console.log("✅ [STT] Microphone access granted");
        streamRef.current = stream;

        // Use AudioContext for linear16 PCM audio (matches backend)
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(1024, 1, 1);

        source.connect(processor);
        // Keep the processor node alive without audio output:
        const silent = audioContext.createGain();
        silent.gain.value = 0.0;
        processor.connect(silent);
        silent.connect(audioContext.destination);

        processor.onaudioprocess = (event) => {
          if (socketRef.current?.connected) {
            const inputData = event.inputBuffer.getChannelData(0);

            // Downsample 48k → 16k (simple decimation 3:1)
            const resampledLength = Math.ceil(inputData.length / 3);
            const resampledData = new Float32Array(resampledLength);
            for (
              let i = 0, j = 0;
              i < inputData.length && j < resampledLength;
              i += 3, j++
            ) {
              resampledData[j] = inputData[i];
            }

            // Float32 → Int16 PCM
            const int16Array = new Int16Array(resampledData.length);
            for (let i = 0; i < resampledData.length; i++) {
              int16Array[i] = Math.max(
                -32768,
                Math.min(32767, resampledData[i] * 32768)
              );
            }

            // Send to backend with metadata (ArrayBuffer goes over socket.io fine)
            if (canSendAudioRef.current && socketRef.current?.connected) {
              // send only if backend Deepgram session is active
              socketRef.current.emit("audio-data", int16Array.buffer);
            }
          }
        };

        // Store references for cleanup
        audioContextRef.current = audioContext;
        processorRef.current = processor;

        console.log("🟢 [STT] AudioContext started");
        console.log(
          "🚀 [STT] PCM audio capture started, sending start-recording event"
        );
        console.log("📏 [STT] Using sampleRate:", audioContext.sampleRate);
        socketRef.current?.emit("start-recording", {
          sampleRate: audioContext.sampleRate,
        });

        // Wait for backend to confirm before marking recording true
        socketRef.current.once("recording-started", () => {
          console.log("✅ [STT] Backend confirmed recording started");
          setIsRecording(true);
        });
      } catch (error) {
        console.error("❌ [STT] Error accessing microphone:", error);
        toast.error("Please allow microphone access to record your answer");
      }
    }
  };

  const progressPercentage =
    questions.length > 0
      ? Math.round(((currentIndex + 1) / questions.length) * 100)
      : 0;
  const answeredCount = answeredQuestions.size;

  const getQuestionStatus = (index) => {
    if (index === currentIndex) return "current";
    if (answeredQuestions.has(index)) return "answered";
    return "default";
  };

  const getQuestionStyles = (status) => {
    const baseStyles =
      "relative w-10 h-10 md:w-12 md:h-12 text-xs md:text-sm font-bold flex items-center justify-center transition-all duration-300 cursor-pointer rounded-2xl";

    switch (status) {
      case "current":
        return `${baseStyles} bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl transform scale-110 ring-4 ring-purple-200/50`;
      case "answered":
        return `${baseStyles} bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-lg`;
      default:
        return `${baseStyles} bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200/50 hover:border-indigo-300 hover:shadow-lg hover:bg-white hover:scale-105 hover:text-indigo-600`;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Loading Test Questions...
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare your exam
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    const clearLocalStorageAndRedirect = () => {
      localStorage.removeItem("testId");
      localStorage.removeItem("userId");
      window.location.href = "/";
    };

    return (
      <div className="h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Failed to Load Test
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
            <p>Debug Info:</p>
            <p>Test ID: {localStorage.getItem("testId") || "Not found"}</p>
            <p>User ID: {localStorage.getItem("userId") || "Not found"}</p>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Reload Page
            </button>
            <button
              onClick={clearLocalStorageAndRedirect}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Clear & Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show test completion screen
  if (isTestCompleted) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-xl">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-4">
            Test Completed!
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Congratulations! You have successfully completed all{" "}
            {questions.length} questions.
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-6">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {questions.length}
                </div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {answeredQuestions.size}
                </div>
                <div className="text-sm text-gray-600">Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">100%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mb-8">
            Your responses have been automatically saved and uploaded. You can
            now close this window.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-colors shadow-lg">
              Return to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
              Review Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no questions
  if (questions.length === 0) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600">
            This test doesn't have any questions yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Header with Progress Bar */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200/50 px-4 sm:px-6 lg:px-8 py-3 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">E</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {testData?.title || "Online Examination"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 hidden sm:block">
              {answeredCount}/{questions.length} Complete
            </span>
            <span className="text-sm font-bold text-blue-600 sm:hidden">
              {progressPercentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Progress Legend */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-slate-600">Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-slate-600">Skipped</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-xs text-slate-600">Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
            <span className="text-xs text-slate-600">Not Done</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Questions Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } fixed lg:relative top-0 left-0 w-80 bg-white/95 backdrop-blur-lg border-r border-slate-200/50 flex flex-col transition-all duration-300 ease-out z-50 lg:z-auto shadow-xl lg:shadow-none h-full`}>
          <div className="p-4 border-b border-slate-200/50 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Questions</h2>
              <p className="text-xs text-slate-500">
                {answeredCount} of {questions.length} answered
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto min-h-0">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(index)}
                    className={`
                    relative h-10 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105
                    ${
                      status === "current"
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg ring-2 ring-blue-200"
                        : status === "answered"
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg"
                        : status === "skipped"
                        ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md hover:shadow-lg"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700"
                    }
                  `}>
                    {q.id}
                    {status === "answered" && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
                    )}
                    {status === "skipped" && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full border border-white" />
                    )}
                    {status === "current" && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 p-4 overflow-y-auto min-h-0">
            <div className="h-full flex flex-col gap-4">
              {/* Question Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 shadow-xl p-4 sm:p-6 relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full -translate-y-12 translate-x-12"></div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
                        {questions[currentIndex].id}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">
                          Question {questions[currentIndex].id}
                        </h2>
                        <p className="text-sm text-slate-500">
                          Read and provide your answer
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => playQuestionAudio(currentIndex + 1)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors group">
                      <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-lg p-4 border border-slate-200/50">
                    <p className="text-base leading-relaxed text-slate-700 font-medium">
                      {questions[currentIndex].question}
                    </p>
                  </div>
                </div>
              </div>

              {/* Answer Section */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 shadow-xl p-4 sm:p-6 relative overflow-hidden flex-1 min-h-0">
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full -translate-y-10 -translate-x-10"></div>

                <div className="relative h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
                    <h3 className="text-lg font-bold text-slate-800">
                      Your Response
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-full">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            voiceTestActive ? "bg-green-500" : "bg-yellow-500"
                          } animate-pulse`}
                        />
                        <span className="text-xs font-medium text-slate-600">
                          {voiceTestActive ? "Ready" : "Loading"}
                        </span>
                      </div>
                      {/* <button
                        onClick={() => playQuestionAudio(currentIndex + 1)}
                        className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium hover:bg-blue-700 transition-colors">
                        🔊
                      </button> */}
                      <button
                        onClick={toggleRecording}
                        disabled={!voiceTestActive}
                        className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all transform hover:scale-105
                        ${
                          isRecording
                            ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
                        }
                        ${
                          !voiceTestActive
                            ? "opacity-50 cursor-not-allowed transform-none"
                            : ""
                        }
                      `}>
                        {isRecording ? (
                          <>
                            <MicOff className="w-3 h-3" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Mic className="w-3 h-3" />
                            Record
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Answer Display Area */}
                  <div className="flex-1 min-h-0 relative">
                    <div
                      className={`
                      h-full rounded-lg border-2 transition-all duration-300 relative overflow-hidden
                      ${
                        isRecording
                          ? "border-red-300 bg-gradient-to-br from-red-50 to-pink-50"
                          : isVoiceConfirmation
                          ? "border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50"
                          : "border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30"
                      }
                    `}>
                      {/* Recording Indicator */}
                      {isRecording && (
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 150}ms` }}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            REC
                          </span>
                        </div>
                      )}

                      <div className="p-4 h-full overflow-hidden">
                        {/* Voice Confirmation Mode */}
                        {isVoiceConfirmation ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                              <Volume2 className="w-6 h-6 text-white animate-pulse" />
                            </div>
                            <h4 className="text-base font-bold text-blue-900 mb-2">
                              Voice Confirmation
                            </h4>
                            <p className="text-sm text-blue-700 mb-3 max-w-sm">
                              Say{" "}
                              <span className="font-semibold">"submit"</span> to
                              save or{" "}
                              <span className="font-semibold">"again"</span> to
                              retry
                            </p>
                            {fullTranscript && (
                              <div className="w-full max-w-md p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200 shadow-sm">
                                <p className="text-xs font-medium text-blue-600 mb-1">
                                  Current Answer:
                                </p>
                                <p className="text-sm text-slate-800 font-medium leading-relaxed line-clamp-3">
                                  {fullTranscript}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : /* Transcript Display */
                        fullTranscript || transcript ? (
                          <div className="h-full flex flex-col">
                            {/* Status Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-3 flex-shrink-0">
                              {existingAnswer && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                  ✓ Answered
                                </span>
                              )}
                              {fullTranscript && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                  📝 Transcribed
                                </span>
                              )}
                            </div>

                            {/* Main Transcript Container */}
                            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-slate-200/50 shadow-sm overflow-y-auto min-h-0">
                              <div className="space-y-3">
                                {fullTranscript && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                      Final Answer
                                    </p>
                                    <p
                                      className={`text-sm leading-relaxed font-medium ${
                                        existingAnswer
                                          ? "text-emerald-800"
                                          : "text-slate-800"
                                      }`}>
                                      {fullTranscript}
                                    </p>
                                  </div>
                                )}
                                {transcript && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">
                                      Live
                                    </p>
                                    <p className="text-sm leading-relaxed text-blue-700 italic">
                                      {transcript}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* AI Mode Display */}
                            {aiMode && (
                              <div className="mt-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-3 border border-violet-200 flex-shrink-0">
                                {aiMessage && (
                                  <div className="bg-white/90 rounded-lg p-2 mb-2 border border-violet-100 shadow-sm">
                                    <p className="text-xs text-slate-800 leading-relaxed">
                                      {aiMessage}
                                    </p>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                                  <span className="text-xs font-medium text-violet-700">
                                    {isPlayingTTS
                                      ? "AI speaking..."
                                      : "AI listening..."}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Voice Confirmation Helper */}
                            {isVoiceConfirmation && !aiMode && (
                              <div className="mt-3 bg-blue-50/70 rounded-lg p-3 border border-blue-200 flex-shrink-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                  <span className="text-xs font-semibold text-blue-800">
                                    AI Active
                                  </span>
                                </div>
                                <p className="text-xs text-blue-700">
                                  {isConfirmingExistingAnswer
                                    ? 'Say "next" to continue or "record" again'
                                    : 'Say "submit" to save or "again" to retry'}
                                </p>
                              </div>
                            )}

                            {/* Answer Status */}
                            {existingAnswer && (
                              <div className="mt-2 flex items-center gap-3 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex-shrink-0">
                                <span>Status: {existingAnswer.status}</span>
                                <span>
                                  Attempt: {existingAnswer.attempt_number}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Empty State */
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <div
                              className={`
                            w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg transition-all duration-300
                            ${
                              isRecording
                                ? "bg-gradient-to-br from-red-500 to-pink-500 scale-110"
                                : isPlayingTTS
                                ? "bg-gradient-to-br from-blue-500 to-indigo-500 scale-105"
                                : "bg-gradient-to-br from-slate-400 to-slate-500"
                            }
                          `}>
                              {isPlayingTTS ? (
                                <Volume2 className="w-8 h-8 text-white animate-pulse" />
                              ) : (
                                <Mic className="w-8 h-8 text-white" />
                              )}
                            </div>
                            <h4 className="text-base font-bold text-slate-800 mb-2">
                              {isPlayingTTS
                                ? "Playing Audio"
                                : isRecording
                                ? "Recording..."
                                : voiceTestActive
                                ? "Ready to Record"
                                : "Initializing..."}
                            </h4>
                            <p className="text-sm text-slate-600 max-w-sm">
                              {isPlayingTTS
                                ? "Listen and prepare your answer"
                                : isRecording
                                ? "Speak clearly and completely"
                                : voiceTestActive
                                ? "Click 'Record' when ready"
                                : "Setting up voice system"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Manual Confirmation Options */}
                    {showReRecordOptions && !isVoiceConfirmation && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-b-lg border-t border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <h4 className="text-sm font-bold text-blue-900">
                            Confirm Action
                          </h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSubmit}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all">
                            ✓ Submit
                          </button>
                          <button
                            onClick={handleReRecord}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-red-600 transition-all">
                            🔄 Retry
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Bottom Action Bar */}
          <div className="bg-white/90 backdrop-blur-lg border-t border-slate-200/50 p-3 shadow-lg flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleSkip}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-all">
                <SkipForward className="w-4 h-4" />
                Skip
              </button>

              <div className="flex items-center gap-2">
                {currentIndex > 0 && (
                  <button
                    onClick={() => handleSelectQuestion(currentIndex - 1)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                )}
                <span className="text-xs text-slate-500 px-2">
                  {currentIndex + 1}/{questions.length}
                </span>
                {currentIndex < questions.length - 1 && (
                  <button
                    onClick={() => handleSelectQuestion(currentIndex + 1)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  (!fullTranscript.trim() && !transcript.trim()) ||
                  showReRecordOptions
                }
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-lg text-sm font-semibold transition-all disabled:cursor-not-allowed shadow-lg">
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
