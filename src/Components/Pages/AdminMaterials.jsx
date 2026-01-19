import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../theme.css";

function AdminMaterials() {
  const [words, setWords] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [message, setMessage] = useState("");

  // --- FORM STATES ---
  const [wordInput, setWordInput] = useState("");
  const [sentenceInput, setSentenceInput] = useState("");

  // --- EDITING STATES ---
  const [editingWordId, setEditingWordId] = useState(null);
  const [editingSentenceId, setEditingSentenceId] = useState(null);

  // Wrap fetchContent in useCallback to prevent re-creation on every render
  const fetchContent = useCallback(async () => {
    try {
      const wRes = await axios.get("http://localhost:5000/api/admin/content/words");
      const sRes = await axios.get("http://localhost:5000/api/admin/content/sentences");
      setWords(wRes.data);
      setSentences(sRes.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load content.");
    }
  }, []); // Empty array means this function is only created once

  useEffect(() => {
    fetchContent();
  }, [fetchContent]); // Now fetchContent is a stable dependency

  const handleWordSubmit = async (e) => {
    e.preventDefault();
    if (!wordInput.trim()) return;

    try {
      if (editingWordId) {
        await axios.put(`http://localhost:5000/api/admin/content/words/${editingWordId}`, { text: wordInput.trim() });
        setMessage("✅ Word updated.");
      } else {
        await axios.post("http://localhost:5000/api/admin/content", { text: wordInput.trim(), type: "words" });
        setMessage("✅ Word added.");
      }
      setWordInput("");
      setEditingWordId(null);
      fetchContent();
    } catch (err) {
      setMessage("❌ Operation failed.");
    }
  };

  const handleSentenceSubmit = async (e) => {
    e.preventDefault();
    if (!sentenceInput.trim()) return;

    try {
      if (editingSentenceId) {
        await axios.put(`http://localhost:5000/api/admin/content/sentences/${editingSentenceId}`, { text: sentenceInput.trim() });
        setMessage("✅ Sentence updated.");
      } else {
        await axios.post("http://localhost:5000/api/admin/content", { text: sentenceInput.trim(), type: "sentences" });
        setMessage("✅ Sentence added.");
      }
      setSentenceInput("");
      setEditingSentenceId(null);
      fetchContent();
    } catch (err) {
      setMessage("❌ Operation failed.");
    }
  };

  const deleteItem = async (id, type) => {
    const itemType = type === "words" ? "word" : "sentence";
    if (!window.confirm(`Delete this ${itemType}?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/content/${type}/${id}`);
      setMessage(`✅ ${itemType} deleted.`);
      fetchContent();
    } catch (err) {
      setMessage("❌ Delete failed.");
    }
  };

  const startEditing = (item, type) => {
    if (type === 'words') {
      setEditingWordId(item._id);
      setWordInput(item.text);
    } else {
      setEditingSentenceId(item._id);
      setSentenceInput(item.text);
    }
  };

  const cancelEdit = (type) => {
    if (type === 'words') {
      setEditingWordId(null);
      setWordInput("");
    } else {
      setEditingSentenceId(null);
      setSentenceInput("");
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Manage Content</h1>
        <p>Add, view, and delete flashcard words and reading sentences</p>
      </div>

      {message && (
        <div className={message.includes("✅") ? "alert-success-modern" : "alert-error-modern"} style={{ marginBottom: "1.5rem" }}>
          {message}
        </div>
      )}

      {/* Row 1: Forms */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem", marginBottom: "2rem", alignItems: "stretch" }}>
        {/* Add Word */}
        <div className="card-modern" style={{ display: "flex", flexDirection: "column", borderColor: editingWordId ? "var(--color-primary)" : "var(--color-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="card-header-modern">{editingWordId ? "Edit Word" : "Add Word"}</h2>
            {editingWordId && <button onClick={() => cancelEdit('words')} style={{background:"none", border:"none", cursor:"pointer", textDecoration:"underline"}}>Cancel</button>}
          </div>
          <form onSubmit={handleWordSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div className="form-group-modern">
              <input type="text" className="form-input-modern" value={wordInput} onChange={(e) => setWordInput(e.target.value)} placeholder="Enter a single word" />
            </div>
            <button type="submit" className="btn-primary-modern" style={{ width: "100%", marginTop: "auto" }}>
              {editingWordId ? "Update Word" : "+ Add Word"}
            </button>
          </form>
        </div>

        {/* Add Sentence */}
        <div className="card-modern" style={{ display: "flex", flexDirection: "column", borderColor: editingSentenceId ? "var(--color-primary)" : "var(--color-border)" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="card-header-modern">{editingSentenceId ? "Edit Sentence" : "Add Sentence"}</h2>
            {editingSentenceId && <button onClick={() => cancelEdit('sentences')} style={{background:"none", border:"none", cursor:"pointer", textDecoration:"underline"}}>Cancel</button>}
          </div>
          <form onSubmit={handleSentenceSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div className="form-group-modern">
              <textarea className="form-input-modern" value={sentenceInput} onChange={(e) => setSentenceInput(e.target.value)} placeholder="Enter a sentence" rows={3} style={{ resize: "vertical" }} />
            </div>
            <button type="submit" className="btn-primary-modern" style={{ width: "100%", marginTop: "auto" }}>
              {editingSentenceId ? "Update Sentence" : "+ Add Sentence"}
            </button>
          </form>
        </div>
      </div>

      {/* Row 2: Lists */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
        {/* Word List */}
        <div className="card-modern">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Flashcard List ({words.length})</h3>
            <button onClick={fetchContent} className="btn-secondary-modern" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Refresh</button>
          </div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {words.map((w) => (
              <div key={w._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderBottom: "1px solid #eee" }}>
                <span style={{ fontWeight: "500" }}>{w.text}</span>
                <div style={{ display: "flex", gap: "5px" }}>
                  <button onClick={() => startEditing(w, 'words')} className="btn-secondary-modern" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Edit</button>
                  <button onClick={() => deleteItem(w._id, 'words')} className="btn-danger-modern" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentence List */}
        <div className="card-modern">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Reading List ({sentences.length})</h3>
            <button onClick={fetchContent} className="btn-secondary-modern" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Refresh</button>
          </div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {sentences.map((s) => (
              <div key={s._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderBottom: "1px solid #eee" }}>
                <span style={{ fontSize: "0.9rem", maxWidth: "70%" }}>{s.text}</span>
                <div style={{ display: "flex", gap: "5px" }}>
                  <button onClick={() => startEditing(s, 'sentences')} className="btn-secondary-modern" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Edit</button>
                  <button onClick={() => deleteItem(s._id, 'sentences')} className="btn-danger-modern" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMaterials;