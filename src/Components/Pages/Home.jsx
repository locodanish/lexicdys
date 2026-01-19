import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import "../theme.css";

function Home({ currentUser }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [accuracy, setAccuracy] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const processingRef = useRef(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // 1. Similarity Algorithm
  const calculateSimilarity = (a, b) => {
    if (!a || !b) return 0;
    const clean = (text) => text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
    const cleanA = clean(a);
    const cleanB = clean(b);
    
    if (cleanA === cleanB) return 100;

    const lenA = cleanA.length;
    const lenB = cleanB.length;
    const dp = Array.from({ length: lenA + 1 }, () => Array(lenB + 1).fill(0));

    for (let i = 0; i <= lenA; i++) dp[i][0] = i;
    for (let j = 0; j <= lenB; j++) dp[0][j] = j;

    for (let i = 1; i <= lenA; i++) {
      for (let j = 1; j <= lenB; j++) {
        const cost = cleanA[i - 1] === cleanB[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    const distance = dp[lenA][lenB];
    const maxLength = Math.max(lenA, lenB);
    return Math.round(((maxLength - distance) / maxLength) * 100);
  };

  // 2. Fetch Words
  const fetchWords = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/content/words");
      if (res.data.length > 0) {
        setWords(res.data);
      } else {
        setWords([]);
        setError("No flashcard words found.");
      }
    } catch (err) {
      console.error(err);
      setWords([]);
      setError("Failed to load words.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fetchWords]);

  // 3. Save Progress
  const saveProgress = async (score) => {
    if (!currentUser || !words[currentIdx]) return;
    try {
      await axios.post("http://localhost:5000/api/progress", {
        userId: currentUser._id,
        contentId: words[currentIdx]._id,
        contentType: 'word',
        accuracy: score
      });
    } catch(err) {
      console.error("Could not save progress", err);
    }
  };

  // 4. Handle Next Word
  const handleNext = useCallback(() => {
    processingRef.current = false;
    if (currentIdx < words.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setTranscript("");
      setFeedback("");
      setAccuracy(0);
      setListening(false);
    } else {
      setIsCompleted(true);
      setListening(false);
    }
  }, [currentIdx, words.length]);

  // 5. Speech Recognition Logic
  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("⚠️ Browser not supported. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = true; 
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      setError("");
      setTranscript("");
      setAccuracy(0);
      setFeedback("");
    };

    recognition.onresult = (event) => {
      if (processingRef.current) return;

      let spoken = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        spoken += event.results[i][0].transcript;
      }
      setTranscript(spoken);

      const target = words[currentIdx]?.text || "";
      const currentScore = calculateSimilarity(spoken, target);
      setAccuracy(currentScore);

      if (currentScore === 100) {
        processingRef.current = true;
        setFeedback("✅ Perfect Match!");
        recognition.stop(); 
        saveProgress(100);
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(handleNext, 1500);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      if (event.error === "network") setError("📡 Network Error. Check internet.");
      else if (event.error === "not-allowed") setError("🚫 Microphone blocked.");
      else setError("Speech Error: " + event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try { recognition.start(); } catch(e) {}
  };

  const handleStop = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setTranscript("");
    setFeedback("");
    setAccuracy(0);
    setIsCompleted(false);
    processingRef.current = false;
  };

  const handleToggleListening = () => {
    if (listening) {
      handleStop();
    } else {
      handleListen();
    }
  };

  return (
    <div className="page-content">
      {/* 🗑️ REMOVED: Welcome Banner Section */}
      
      <div className="page-header">
        <h1>Practice Flashcards</h1>
        <p>Speak aloud the word shown below</p>
      </div>

      {error && <div className="alert-error-modern">{error}</div>}

      {isCompleted ? (
        <div className="card-modern" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
          <h2 style={{ color: "var(--color-success)", marginBottom: "0.5rem" }}>All Words Complete!</h2>
          <button onClick={handleRestart} className="btn-primary-modern">Restart Practice</button>
        </div>
      ) : (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="card-modern" style={{
            textAlign: "center", padding: "3rem 2rem", marginBottom: "2rem",
            background: "linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent-light) 100%)",
            border: "2px solid var(--color-border)",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
              Word {Math.min(currentIdx + 1, words.length)} of {words.length}
            </div>
            <div style={{
              fontSize: "3.5rem", fontWeight: "700", color: "var(--color-text-primary)",
              letterSpacing: "2px", fontFamily: "monospace"
            }}>
              {loading ? "Loading..." : (words[currentIdx]?.text || "No Words")}
            </div>
            {listening && <div className="listening-bar-pulse" />}
          </div>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <button 
              onClick={handleToggleListening} 
              className={listening ? "btn-danger-modern" : "btn-primary-modern"} 
              style={{ flex: 1 }} 
              disabled={loading || processingRef.current}
            >
              {listening ? "🛑 Stop" : "🎤 Tap to Speak"}
            </button>
            <button onClick={handleNext} className="btn-secondary-modern" style={{ flex: 1 }} disabled={loading || processingRef.current}>
              Skip Word
            </button>
          </div>

          <div className="card-modern">
            <p>You said: <strong>{transcript || "..."}</strong></p>
            
            <div style={{ marginTop: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.9rem" }}>
                <span>Accuracy</span>
                <span>{accuracy}%</span>
              </div>
              <div style={{ height: "10px", background: "#eee", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ 
                  width: `${accuracy}%`, 
                  height: "100%", 
                  background: accuracy === 100 ? "#4CAF50" : accuracy > 50 ? "#FFC107" : "#F44336", 
                  transition: "width 0.3s ease" 
                }} />
              </div>
            </div>

            {feedback && (
              <div style={{
                marginTop: "1rem",
                textAlign: "center", fontSize: "1.2rem", fontWeight: "600", padding: "0.8rem", borderRadius: "8px",
                backgroundColor: feedback.includes("✅") ? "#ECFDF5" : "#FEF2F2",
                color: feedback.includes("✅") ? "#059669" : "#DC2626"
              }}>
                {feedback}
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes pulseBar { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>
    </div>
  );
}

export default Home;