import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import "../theme.css";

function LogIn({ setPage, setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, username, password);
      setLoginMessage("✅ Login successful!");
      setUsername("");
      setPassword("");
      setTimeout(() => {
        setPage("home");
      }, 1000);
    } catch (error) {
      setLoginMessage("❌ Invalid email or password");
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
