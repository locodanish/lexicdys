import React, { useState, useRef, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../theme.css";

function Flashcard() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const handleListen = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let spoken = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          spoken += event.results[i][0].transcript.trim();
        }
      }
      setTranscript(spoken);
      const currentWord = words[currentIdx] || "";
      const isCorrect =
        spoken.replace(/\s+/g, "").toLowerCase() === currentWord.toLowerCase();

      if (isCorrect) {
        setFeedback("✅ Correct!");
      } else {
        setFeedback("❌ Try again!");
      }

      setTimeout(() => {
        if (currentIdx < (words.length ? words.length - 1 : 0)) {
          setCurrentIdx((idx) => idx + 1);
          setTranscript("");
          setFeedback("");
          setListening(false);
        } else {
          setIsCompleted(true);
          setListening(false);
        }
      }, 1500);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognitionRef.current = recognition;
    setTranscript("");
    setFeedback("");
    recognition.start();
    setListening(true);
  };

  const handleNext = () => {
    if (currentIdx < (words.length ? words.length - 1 : 0)) {
      setCurrentIdx((idx) => idx + 1);
      setTranscript("");
      setFeedback("");
      setListening(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setTranscript("");
    setFeedback("");
    setIsCompleted(false);
    setListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
  };

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const snapshot = await getDocs(collection(db, "flashcard_words"));
        const fetched = snapshot.docs.map((d) => d.data().text).filter(Boolean);
        if (fetched.length > 0) {
          setWords(fetched);
        } else {
          setWords([]);
          setError("No flashcard words found in database.");
        }
      } catch (err) {
        console.error(err);
        setWords([]);
        setError("Failed to load flashcard words from database.");
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, []);

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setListening(false);
  };

  const handleToggleListening = () => {
    if (loading || words.length === 0) return;
    if (listening) {
      handleStopListening();
    } else {
      handleListen();
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Practice Flashcards</h1>
        <p>Speak aloud the word shown on the card</p>
      </div>

      {error && <div className="alert-error-modern">{error}</div>}

      {isCompleted ? (
        <div
          className="card-modern"
          style={{ textAlign: "center", padding: "3rem 1.5rem" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
          <h2 style={{ color: "var(--color-success)", marginBottom: "0.5rem" }}>
            All Words Complete!
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "2rem",
            }}
          >
            Great job! You've practiced all the words.
          </p>
          <button onClick={handleRestart} className="btn-primary-modern">
            Restart Practice
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Flashcard Display */}
          <div
            className="card-modern"
            style={{
              textAlign: "center",
              padding: "3rem 2rem",
              marginBottom: "2rem",
              background:
                "linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent-light) 100%)",
              border: "2px solid var(--color-border)",
            }}
          >
            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
                marginBottom: "1rem",
              }}
            >
              Word {currentIdx + 1} of {loading ? "..." : words.length}
            </div>
            <div
              style={{
                fontSize: "3.5rem",
                fontWeight: "700",
                color: "var(--color-text-primary)",
                letterSpacing: "2px",
                fontFamily: "monospace",
              }}
            >
              {loading
                ? "Loading..."
                : words[currentIdx] || "(No words available)"}
            </div>
          </div>

          {/* Progress Bar */}
          {!loading && words.length > 0 && (
            <div
              style={{
                marginBottom: "2rem",
                backgroundColor: "var(--color-border-light)",
                height: "6px",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  backgroundColor: "var(--color-primary)",
                  height: "100%",
                  width: `${((currentIdx + 1) / words.length) * 100}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          )}

          {/* Controls */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleToggleListening}
              className={listening ? "btn-danger-modern" : "btn-primary-modern"}
              style={{ flex: 1, minWidth: "140px" }}
              disabled={loading || words.length === 0}
            >
              {listening ? "🛑 Stop" : "🎤 Listen"}
            </button>
            <button
              onClick={handleNext}
              className="btn-secondary-modern"
              style={{ flex: 1, minWidth: "140px" }}
              disabled={loading || listening || currentIdx >= words.length - 1}
            >
              Skip Word
            </button>
          </div>

          {/* Speech Results */}
          <div className="card-modern" style={{ marginBottom: "1rem" }}>
            <div
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Your speech:
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                color: "var(--color-text-primary)",
                fontWeight: "500",
                minHeight: "1.5rem",
              }}
            >
              {transcript || "—"}
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              style={{
                textAlign: "center",
                fontSize: "1.5rem",
                fontWeight: "600",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                background: feedback.includes("✅") ? "#ECFDF5" : "#FEF2F2",
                color: feedback.includes("✅")
                  ? "var(--color-success)"
                  : "var(--color-error)",
                marginBottom: "1rem",
              }}
            >
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Flashcard;
