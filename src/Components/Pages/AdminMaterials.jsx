import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import "../theme.css";

function AdminMaterials() {
  const [word, setWord] = useState("");
  const [sentence, setSentence] = useState("");
  const [message, setMessage] = useState("");

  // Words state
  const [words, setWords] = useState([]);
  const [loadingWords, setLoadingWords] = useState(false);

  // Sentences state
  const [sentences, setSentences] = useState([]);
  const [loadingSentences, setLoadingSentences] = useState(false);

  // Fetch all words on mount
  useEffect(() => {
    fetchWords();
    fetchSentences();
  }, []);

  const fetchWords = async () => {
    setLoadingWords(true);
    try {
      const snapshot = await getDocs(collection(db, "flashcard_words"));
      const wordsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
      }));
      setWords(wordsList);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load words.");
    } finally {
      setLoadingWords(false);
    }
  };

  const fetchSentences = async () => {
    setLoadingSentences(true);
    try {
      const snapshot = await getDocs(collection(db, "reading_sentences"));
      const sentencesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
      }));
      setSentences(sentencesList);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load sentences.");
    } finally {
      setLoadingSentences(false);
    }
  };

  const addWord = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!word.trim()) return setMessage("Please enter a word.");
    try {
      await addDoc(collection(db, "flashcard_words"), { text: word.trim() });
      setMessage("✅ Word added successfully.");
      setWord("");
      setTimeout(() => setMessage(""), 3000);
      fetchWords();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add word.");
    }
  };

  const addSentence = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!sentence.trim()) return setMessage("Please enter a sentence.");
    try {
      await addDoc(collection(db, "reading_sentences"), {
        text: sentence.trim(),
      });
      setMessage("✅ Sentence added successfully.");
      setSentence("");
      setTimeout(() => setMessage(""), 3000);
      fetchSentences();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add sentence.");
    }
  };

  const deleteWord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this word?")) return;
    try {
      await deleteDoc(doc(db, "flashcard_words", id));
      setMessage("✅ Word deleted.");
      setTimeout(() => setMessage(""), 2000);
      fetchWords();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to delete word.");
    }
  };

  const deleteSentence = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sentence?"))
      return;
    try {
      await deleteDoc(doc(db, "reading_sentences", id));
      setMessage("✅ Sentence deleted.");
      setTimeout(() => setMessage(""), 2000);
      fetchSentences();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to delete sentence.");
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Manage Content</h1>
        <p>Add, view, and delete flashcard words and reading sentences</p>
      </div>

      {message && (
        <div
          className={
            message.includes("✅")
              ? "alert-success-modern"
              : "alert-error-modern"
          }
          style={{ marginBottom: "1.5rem" }}
        >
          {message}
        </div>
      )}

      {/* Add Forms Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem",
        }}
      >
        {/* Add Word Form */}
        <div className="card-modern">
          <h2 className="card-header-modern">Add Flashcard Word</h2>
          <form onSubmit={addWord}>
            <div className="form-group-modern">
              <label className="form-label-modern">Word</label>
              <input
                type="text"
                className="form-input-modern"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Enter a single word"
              />
            </div>
            <button
              type="submit"
              className="btn-primary-modern"
              style={{ width: "100%" }}
            >
              + Add Word
            </button>
          </form>
        </div>

        {/* Add Sentence Form */}
        <div className="card-modern">
          <h2 className="card-header-modern">Add Reading Sentence</h2>
          <form onSubmit={addSentence}>
            <div className="form-group-modern">
              <label className="form-label-modern">Sentence</label>
              <textarea
                className="form-input-modern"
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder="Enter a sentence or paragraph"
                rows={5}
                style={{ resize: "vertical" }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary-modern"
              style={{ width: "100%" }}
            >
              + Add Sentence
            </button>
          </form>
        </div>
      </div>

      {/* Materials Lists Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Flashcard Words List */}
        <div className="card-modern">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 className="card-header-modern" style={{ marginBottom: 0 }}>
              Flashcard Words ({words.length})
            </h2>
            <button
              onClick={fetchWords}
              className="btn-secondary-modern"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              🔄 Refresh
            </button>
          </div>

          {loadingWords ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <div
                className="spinner-modern"
                style={{ display: "inline-block", marginBottom: "1rem" }}
              />
              <p>Loading words...</p>
            </div>
          ) : words.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--color-text-secondary)",
              }}
            >
              No words added yet.
            </div>
          ) : (
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              {words.map((w, idx) => (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    borderBottom:
                      idx < words.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1, wordBreak: "break-word" }}>
                    <span
                      style={{
                        fontWeight: "500",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {w.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteWord(w.id)}
                    className="btn-danger-modern"
                    style={{
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reading Sentences List */}
        <div className="card-modern">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 className="card-header-modern" style={{ marginBottom: 0 }}>
              Reading Sentences ({sentences.length})
            </h2>
            <button
              onClick={fetchSentences}
              className="btn-secondary-modern"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              🔄 Refresh
            </button>
          </div>

          {loadingSentences ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <div
                className="spinner-modern"
                style={{ display: "inline-block", marginBottom: "1rem" }}
              />
              <p>Loading sentences...</p>
            </div>
          ) : sentences.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--color-text-secondary)",
              }}
            >
              No sentences added yet.
            </div>
          ) : (
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              {sentences.map((s, idx) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "0.75rem",
                    borderBottom:
                      idx < sentences.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      wordBreak: "break-word",
                      lineHeight: "1.4",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {s.text.length > 100
                        ? `${s.text.substring(0, 100)}...`
                        : s.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteSentence(s.id)}
                    className="btn-danger-modern"
                    style={{
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMaterials;
