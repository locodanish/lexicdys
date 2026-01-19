import React, { useState, useEffect } from "react";
import axios from "axios";
import "../theme.css";

function Admin() {
  const [stats, setStats] = useState({ users: [], words: [], sentences: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [usersRes, wordsRes, sentencesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users"),
        axios.get("http://localhost:5000/api/admin/content/words"),
        axios.get("http://localhost:5000/api/admin/content/sentences")
      ]);

      setStats({
        users: usersRes.data,
        words: wordsRes.data,
        sentences: sentencesRes.data
      });
    } catch (err) {
      console.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="card-modern" style={{ textAlign: "center", padding: "2rem" }}>
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of system users and content</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
        
        {/* === LEFT COLUMN: USERS LIST === */}
        <div className="card-modern">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="card-header-modern" style={{ margin: 0 }}>Registered Users ({stats.users.length})</h2>
            <button onClick={fetchDashboardData} className="btn-secondary-modern" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>Refresh</button>
          </div>
          
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #f0f0f0", color: "#888", fontSize: "0.9rem" }}>
                  <th style={{ padding: "8px" }}>Name</th>
                  <th style={{ padding: "8px" }}>Email</th>
                  <th style={{ padding: "8px" }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.map(u => (
                  <tr key={u._id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={{ padding: "10px 8px", fontWeight: "500" }}>{u.fullName}</td>
                    <td style={{ padding: "10px 8px", fontSize: "0.9rem", color: "#666" }}>{u.email}</td>
                    <td style={{ padding: "10px 8px" }}>
                      {u.isAdmin ? (
                        <span style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>Admin</span>
                      ) : (
                        <span style={{ backgroundColor: "#f5f5f5", color: "#666", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem" }}>User</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* === RIGHT COLUMN: CONTENT LISTS === */}
        <div className="card-modern">
          <h2 className="card-header-modern">Content Overview</h2>
          
          {/* Words Summary */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.8rem", color: "#444" }}>
              📚 Flashcards ({stats.words.length})
            </h3>
            <div style={{ 
              maxHeight: "150px", 
              overflowY: "auto", 
              border: "1px solid #eee", 
              borderRadius: "8px", 
              padding: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "6px"
            }}>
              {stats.words.length === 0 && <span style={{ color: "#999", fontSize: "0.9rem" }}>No words added yet.</span>}
              {stats.words.map(w => (
                <span key={w._id} style={{ 
                  background: "#f0f2ff", 
                  color: "#6B7FF9", 
                  padding: "4px 10px", 
                  borderRadius: "15px", 
                  fontSize: "0.85rem", 
                  fontWeight: "500"
                }}>
                  {w.text}
                </span>
              ))}
            </div>
          </div>

          {/* Sentences Summary */}
          <div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.8rem", color: "#444" }}>
              📖 Sentences ({stats.sentences.length})
            </h3>
            <div style={{ 
              maxHeight: "200px", 
              overflowY: "auto", 
              border: "1px solid #eee", 
              borderRadius: "8px", 
              padding: "0" 
            }}>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {stats.sentences.length === 0 && <li style={{ padding: "10px", color: "#999", fontSize: "0.9rem" }}>No sentences added yet.</li>}
                {stats.sentences.map((s, idx) => (
                  <li key={s._id} style={{ 
                    padding: "10px", 
                    borderBottom: idx < stats.sentences.length - 1 ? "1px solid #f5f5f5" : "none",
                    fontSize: "0.9rem", 
                    color: "#555" 
                  }}>
                    {s.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Admin;