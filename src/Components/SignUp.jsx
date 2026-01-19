import React, { useState } from "react";
import axios from "axios";

// --- 1. The Modal Component ---
const AlertModal = ({ type, message, onClose }) => {
  if (!message) return null;

  const isSuccess = type === "success";
  
  const overlayStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: "white", padding: "2rem", borderRadius: "12px",
    width: "90%", maxWidth: "400px", textAlign: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  };

  const buttonStyle = {
    marginTop: "1.5rem", padding: "10px 20px",
    backgroundColor: isSuccess ? "#4CAF50" : "#F44336",
    color: "white", border: "none", borderRadius: "6px",
    cursor: "pointer", fontWeight: "bold", fontSize: "1rem"
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ color: isSuccess ? "#4CAF50" : "#F44336", margin: "0 0 10px 0" }}>
          {isSuccess ? "Success!" : "Error"}
        </h3>
        <p style={{ fontSize: "1.1rem", color: "#333" }}>{message}</p>
        <button onClick={onClose} style={buttonStyle}>
          {isSuccess ? "Go to Login" : "Try Again"}
        </button>
      </div>
    </div>
  );
};

// --- 2. The Main SignUp Component ---
const SignUp = ({ setPage }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false); // <--- New Loading State

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Client-Side Validation
    if (formData.password.length < 6) {
      setAlert({ type: "error", message: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true); // Disable button
    try {
      const res = await axios.post("http://localhost:5000/api/signup", formData);
      setAlert({ type: "success", message: res.data.message });
      // Clear form on success
      setFormData({ fullName: "", email: "", phone: "", password: "" });
    } catch (err) {
      setAlert({ 
        type: "error", 
        message: err.response?.data?.message || "Something went wrong" 
      });
      // Clear password on error so they can try again
      setFormData(prev => ({ ...prev, password: "" }));
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  const handleCloseModal = () => {
    if (alert.type === "success") {
      setPage("login");
    }
    setAlert({ type: "", message: "" });
  };

  return (
    <div style={styles.container}>
      <AlertModal 
        type={alert.type} 
        message={alert.message} 
        onClose={handleCloseModal} 
      />

      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          placeholder="Full Name"
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email Address"
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          placeholder="Phone Number"
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Password"
          onChange={handleChange}
          required
          style={styles.input}
        />
        
        {/* Disable button while loading to prevent double-clicks */}
        <button 
          type="submit" 
          style={{...styles.button, opacity: loading ? 0.7 : 1}}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
      
      <button 
        onClick={() => setPage('login')} 
        style={styles.linkButton}
      >
        Already have an account? Login
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    textAlign: "center",
    padding: "20px",
    background: "white", 
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { 
    padding: "12px", 
    fontSize: "16px", 
    borderRadius: "8px", 
    border: "1px solid #ccc",
    outline: "none" 
  },
  button: {
    padding: "12px",
    backgroundColor: "#6B7FF9",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "background 0.2s"
  },
  linkButton: {
    marginTop: "15px",
    background: "none",
    border: "none",
    color: "#6B7FF9",
    cursor: "pointer",
    textDecoration: "underline"
  }
};

export default SignUp;