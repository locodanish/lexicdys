import React, { useState, useRef, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../theme.css";

function Reading() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [paragraphs, setParagraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetchParagraphs = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "reading_sentences")
        );
        const fetchedParagraphs = querySnapshot.docs.map(
          (doc) => doc.data().text
        );
        if (fetchedParagraphs.length > 0) {
          setParagraphs(fetchedParagraphs);
          setError("");
        } else {
          setError("No sentences found in database.");
          setParagraphs([]);
        }
      } catch (err) {
        setError("Failed to load sentences from database.");
        console.error(err);
        setParagraphs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParagraphs();
  }, []);

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
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      setTranscript(finalTranscript + interimTranscript);
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

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setListening(false);
    checkAccuracy();
  };

  const handleToggleListening = () => {
    if (listening) {
      handleStopListening();
    } else {
      handleListen();
    }
  };

  const checkAccuracy = () => {
    if (paragraphs.length === 0) return;
    const paragraph = paragraphs[currentIdx];
    const spokenWords = transcript.toLowerCase().trim().split(/\s+/);
    const paragraphWords = paragraph.toLowerCase().split(/\s+/);

    let matchCount = 0;
    for (let word of spokenWords) {
      if (paragraphWords.some((w) => w.includes(word) || word.includes(w))) {
        matchCount++;
      }
    }

    const accuracy =
      spokenWords.length > 0
        ? Math.round((matchCount / paragraphWords.length) * 100)
        : 0;
    setFeedback(`Accuracy: ${accuracy}%`);
  };

  const handleNext = () => {
    if (currentIdx < paragraphs.length - 1) {
      setCurrentIdx((idx) => idx + 1);
      setTranscript("");
      setFeedback("");
      setListening(false);
    } else {
      setIsCompleted(true);
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

  if (loading) {
    return (
      <div className="page-content" style={{ textAlign: "center" }}>
        <div
          className="spinner-modern"
          style={{ display: "inline-block", margin: "2rem 0" }}
        />
        <p>Loading reading material...</p>
      </div>
    );
  }

  if (error && paragraphs.length === 0) {
    return (
      <div className="page-content">
        <div className="alert-error-modern">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Reading Practice</h1>
        <p>Read the paragraph aloud and we'll measure your accuracy</p>
      </div>

      {isCompleted ? (
        <div
          className="card-modern"
          style={{ textAlign: "center", padding: "3rem 1.5rem" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
          <h2 style={{ color: "var(--color-success)", marginBottom: "0.5rem" }}>
            All Paragraphs Complete!
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "2rem",
            }}
          >
            Excellent reading practice! Keep improving your skills.
          </p>
          <button onClick={handleRestart} className="btn-primary-modern">
            Restart Practice
          </button>
        </div>
      ) : paragraphs.length === 0 ? (
        <div
          className="card-modern"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <p style={{ color: "var(--color-text-secondary)" }}>
            No reading material available.
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Paragraph Display */}
          <div
            className="card-modern"
            style={{
              background:
                "linear-gradient(135deg, var(--color-bg-secondary) 0%, white 100%)",
              marginBottom: "2rem",
              padding: "2rem",
              lineHeight: "1.8",
              fontSize: "1.05rem",
              color: "var(--color-text-primary)",
              minHeight: "150px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {paragraphs[currentIdx]}
          </div>

          {/* Progress */}
          <div
            style={{
              marginBottom: "2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Paragraph {currentIdx + 1} of {paragraphs.length}
            </div>
            <div
              style={{
                flex: 1,
                marginLeft: "1rem",
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
                  width: `${((currentIdx + 1) / paragraphs.length) * 100}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

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
            >
              {listening ? "🛑 Stop" : "🎤 Read"}
            </button>
            <button
              onClick={handleNext}
              className="btn-secondary-modern"
              style={{ flex: 1, minWidth: "140px" }}
              disabled={listening || currentIdx >= paragraphs.length - 1}
            >
              Skip Paragraph
            </button>
          </div>

          {/* Your Speech */}
          <div className="card-modern" style={{ marginBottom: "1rem" }}>
            <div
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Your reading:
            </div>
            <div
              style={{
                padding: "1rem",
                backgroundColor: "var(--color-bg-secondary)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                minHeight: "60px",
                maxHeight: "120px",
                overflowY: "auto",
              }}
            >
              {transcript || "—"}
            </div>
          </div>

          {/* Accuracy Feedback */}
          {feedback && (
            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                background: "var(--color-accent-light)",
                border: "1px solid var(--color-accent)",
                color: "var(--color-text-primary)",
                fontSize: "1rem",
                fontWeight: "600",
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

export default Reading;
