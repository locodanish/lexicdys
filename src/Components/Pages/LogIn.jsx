import React, { useState } from "react";
import axios from "axios"; // Import axios for backend calls
import "../theme.css";

// Added new props: setCurrentUser, setIsAdmin
function LogIn({ setPage, setIsLoggedIn, setCurrentUser, setIsAdmin }) {
  // Renamed 'username' to 'email' to match backend expectations
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage("");
    setLoading(true);

    try {
      // 1. Send credentials to your MongoDB Backend
      const res = await axios.post("http://localhost:5000/api/login", {
        email: email,
        password: password,
      });

      // 2. Success Handling
      setLoginMessage("✅ Login successful!");
      
      const userData = res.data.user;

      // 3. Save to Local Storage (replaces Firebase persistence)
      localStorage.setItem("user", JSON.stringify(userData));

      // 4. Update App State
      setIsLoggedIn(true);
      setCurrentUser(userData);
      
      // Check admin status safely
      if (userData.isAdmin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      // 5. Redirect after a short delay
      setTimeout(() => {
        setPage(userData.isAdmin ? "admin" : "home");
      }, 1000);

    } catch (error) {
      // 6. Error Handling
      const message = error.response?.data?.message || "Invalid email or password";
      setLoginMessage(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="form-group-modern">
        <label className="form-label-modern">Email</label>
        <input
          type="email"
          className="form-input-modern"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group-modern">
        <label className="form-label-modern">Password</label>
        <input
          type="password"
          className="form-input-modern"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <button
        type="submit"
        className="btn-primary-modern"
        style={{ width: "100%" }}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {/* Sign Up Link */}
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setPage("signup")}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-primary, #6B7FF9)",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "0.9rem"
          }}
        >
          Don't have an account? Sign Up
        </button>
      </div>

      {loginMessage && (
        <div
          style={{
            marginTop: "1rem",
            textAlign: "center",
            fontSize: "0.95rem",
          }}
          className={
            loginMessage.includes("✅")
              ? "alert-success-modern"
              : "alert-error-modern"
          }
        >
          {loginMessage}
        </div>
      )}
    </form>
  );
}

export default LogIn;