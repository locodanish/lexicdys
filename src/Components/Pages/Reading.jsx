import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "../theme.css";

function Reading({ currentUser }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [accuracy, setAccuracy] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sentences, setSentences] = useState([]);
  
  // ✅ FIX: Use Ref for immediate locking (State is too slow for speech events)
  const processingRef = useRef(false);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // 1. Similarity Algorithm (Levenshtein Distance)
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

  const fetchSentences = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/content/sentences");
      if (res.data.length > 0) setSentences(res.data);
      else setSentences([]);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchSentences();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [fetchSentences]);

  const handleNext = useCallback(() => {
    // ✅ Release the lock when moving to next
    processingRef.current = false;
    
    if (currentIdx < sentences.length - 1) {
      setCurrentIdx((idx) => idx + 1);
      setTranscript("");
      setFeedback("");
      setAccuracy(0);
      setListening(false);
    } else {
      setIsCompleted(true);
      setListening(false);
    }
  }, [currentIdx, sentences.length]);

  const saveProgress = async (score) => {
    if (!currentUser) return;
    try {
      await axios.post("http://localhost:5000/api/progress", {
        userId: currentUser._id,
        contentId: sentences[currentIdx]._id,
        contentType: 'sentence',
        accuracy: score
      });
    } catch(err) { console.error("Could not save progress"); }
  };

  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Use Chrome.");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; 
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      setFeedback("");
      setTranscript("");
      setAccuracy(0);
    };

    recognition.onresult = (event) => {
      // ✅ FIX: Check immediate Ref lock instead of State
      if (processingRef.current) return;

      let spoken = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        spoken += event.results[i][0].transcript;
      }
      setTranscript(spoken);

      const target = sentences[currentIdx]?.text || "";
      const currentScore = calculateSimilarity(spoken, target);
      setAccuracy(currentScore);

      if (currentScore === 100) {
        // ✅ FIX: Set immediate Ref lock
        processingRef.current = true;
        
        setFeedback("✅ Perfect!");
        recognition.stop();
        saveProgress(100);
        
        // Clear any existing timeout to be safe
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(handleNext, 1500);
      }
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleToggleListening = () => {
    if (listening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setListening(false);
    } else {
      handleListen();
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Reading Practice</h1>
        <p>Read the sentence aloud clearly</p>
      </div>

      {isCompleted ? (
        <div className="card-modern" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem" }}>🎉</div>
          <h2>Reading Session Complete!</h2>
          <button onClick={() => window.location.reload()} className="btn-primary-modern" style={{ marginTop: "1rem" }}>Start Over</button>
        </div>
      ) : (
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          
          <div className="card-modern" style={{
            textAlign: "center", padding: "3rem 2rem", marginBottom: "2rem",
            borderLeft: "5px solid var(--color-primary)",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{ fontSize: "0.9rem", color: "gray", marginBottom: "1rem" }}>
              {/* ✅ Added Math.min to prevent "4 of 2" display bug */}
              Sentence {Math.min(currentIdx + 1, sentences.length)} of {sentences.length}
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "600", color: "#333", lineHeight: "1.4" }}>
              {sentences[currentIdx]?.text || "Loading..."}
            </div>
            {listening && <div className="listening-bar-pulse" />}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
            <button 
                onClick={handleToggleListening} 
                className={listening ? "btn-danger-modern" : "btn-primary-modern"} 
                style={{ minWidth: "150px" }}
                disabled={processingRef.current} // Disable button while transitioning
            >
              {listening ? "🛑 Stop" : "🎤 Start Reading"}
            </button>
            <button onClick={handleNext} className="btn-secondary-modern" disabled={processingRef.current}>
              Skip
            </button>
          </div>

          <div className="card-modern">
            <p>Live Transcript: <strong>{transcript || "..."}</strong></p>
            
            {/* Accuracy Bar */}
            <div style={{ marginTop: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.9rem" }}>
                <span>Accuracy</span>
                <span>{accuracy}%</span>
              </div>
              <div style={{ height: "10px", background: "#eee", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ 
                  width: `${accuracy}%`, 
                  height: "100%", 
                  background: accuracy === 100 ? "#4CAF50" : accuracy > 80 ? "#2196F3" : "#FF9800", 
                  transition: "width 0.3s ease" 
                }} />
              </div>
            </div>

            {feedback && <div style={{ marginTop: "10px", fontWeight: "bold", color: "green" }}>{feedback}</div>}
          </div>

        </div>
      )}
      <style>{`@keyframes pulseBar { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>
    </div>
  );
}

export default Reading;