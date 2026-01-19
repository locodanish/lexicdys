import React, { useState, useEffect } from "react";
import axios from "axios";
import "../theme.css";

function Profile({ currentUser, setCurrentUser }) {
  const [stats, setStats] = useState({
    wordsPracticed: 0,
    sentencesRead: 0,
    averageAccuracy: 0,
    history: []
  });
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
    password: ""
  });
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch User Progress Stats
  useEffect(() => {
    const fetchProgress = async () => {
      if (!currentUser) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/progress/${currentUser._id}`);
        const data = res.data;

        // Calculate Stats
        const words = data.filter(p => p.contentType === 'word');
        const sentences = data.filter(p => p.contentType === 'sentence');
        const totalAccuracy = data.reduce((acc, curr) => acc + curr.accuracy, 0);
        const avg = data.length > 0 ? Math.round(totalAccuracy / data.length) : 0;

        setStats({
          wordsPracticed: words.length,
          sentencesRead: sentences.length,
          averageAccuracy: avg,
          history: data.slice(0, 5) // Last 5 activities
        });
      } catch (err) {
        console.error("Error fetching progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [currentUser]);

  // 2. Handle Profile Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        // Only send password if user typed a new one
        ...(formData.password && { password: formData.password })
      };

      // Assuming you have a generic user update route. 
      // If not, use the admin one or create a specific profile route.
      const res = await axios.put(`http://localhost:5000/api/admin/users/${currentUser._id}`, updateData);
      
      setMessage("✅ Profile updated successfully!");
      
      // Update local state and localStorage
      const updatedUser = { ...currentUser, ...res.data.user };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setFormData(prev => ({ ...prev, password: "" })); // Clear password field
      
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update profile.");
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Track your progress and manage your settings</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
        
        {/* LEFT COLUMN: STATS */}
        <div className="card-modern">
          <h2 className="card-header-modern">Your Progress 📈</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ background: "#EEF2FF", padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--color-primary)" }}>{stats.wordsPracticed}</div>
              <div style={{ fontSize: "0.9rem", color: "gray" }}>Words Practiced</div>
            </div>
            <div style={{ background: "#ECFDF5", padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#059669" }}>{stats.sentencesRead}</div>
              <div style={{ fontSize: "0.9rem", color: "gray" }}>Sentences Read</div>
            </div>
            <div style={{ gridColumn: "span 2", background: "#FEFCE8", padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#D97706" }}>{stats.averageAccuracy}%</div>
              <div style={{ fontSize: "0.9rem", color: "gray" }}>Average Accuracy</div>
            </div>
          </div>

          <h3>Recent Activity</h3>
          {stats.history.length === 0 ? (
            <p style={{ color: "gray" }}>No activity yet. Go practice!</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {stats.history.map((item, idx) => (
                <li key={idx} style={{ padding: "0.8rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
                  <span>{item.contentType === 'word' ? 'Flashcard' : 'Reading'}</span>
                  <span style={{ fontWeight: "bold", color: item.accuracy >= 80 ? "green" : "orange" }}>
                    {item.accuracy}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT COLUMN: SETTINGS */}
        <div className="card-modern">
          <h2 className="card-header-modern">Account Settings ⚙️</h2>
          
          {message && <div style={{ 
            padding: "1rem", marginBottom: "1rem", borderRadius: "8px",
            background: message.includes("✅") ? "#ECFDF5" : "#FEF2F2",
            color: message.includes("✅") ? "#059669" : "#DC2626"
          }}>{message}</div>}

          <form onSubmit={handleUpdate}>
            <div className="form-group-modern">
              <label className="form-label-modern">Full Name</label>
              <input 
                type="text" 
                className="form-input-modern"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Email Address</label>
              <input 
                type="email" 
                className="form-input-modern"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">New Password (Optional)</label>
              <input 
                type="password" 
                className="form-input-modern"
                placeholder="Leave blank to keep current"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button type="submit" className="btn-primary-modern" style={{ width: "100%" }}>
              Save Changes
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Profile;