import React from "react";

const GlobalModal = ({ show, type, title, message, onClose, onConfirm, isLoading }) => {
  if (!show) return null;

  const isConfirm = type === "confirm";
  const isError = type === "error";
  const isSuccess = type === "success";

  // Dynamic Colors
  let headerColor = "#333";
  let btnColor = "#6B7FF9"; // Default Blue

  if (isSuccess) {
    headerColor = "#4CAF50"; // Green
    btnColor = "#4CAF50";
  } else if (isError) {
    headerColor = "#F44336"; // Red
    btnColor = "#F44336";
  } else if (isConfirm) {
    headerColor = "#FF9800"; // Orange
    btnColor = "#D32F2F";    // Red for the "Yes, Delete" button
  }

  // Styles
  const overlayStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 2000,
  };

  const modalStyle = {
    backgroundColor: "white", padding: "2rem", borderRadius: "12px",
    width: "90%", maxWidth: "400px", textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    animation: "fadeIn 0.2s ease-out"
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ color: headerColor, marginTop: 0, marginBottom: "10px" }}>
          {title}
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "2rem", lineHeight: "1.5" }}>
          {message}
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {/* Cancel / Close Button */}
          {(isConfirm || isError || isSuccess) && (
            <button 
              onClick={onClose} 
              style={{
                padding: "10px 20px", borderRadius: "8px", border: "1px solid #ccc",
                backgroundColor: "white", color: "#333", cursor: "pointer", fontSize: "1rem"
              }}
              disabled={isLoading}
            >
              {isConfirm ? "Cancel" : "Close"}
            </button>
          )}

          {/* Confirm Action Button */}
          {isConfirm && (
            <button 
              onClick={onConfirm}
              style={{
                padding: "10px 20px", borderRadius: "8px", border: "none",
                backgroundColor: btnColor, color: "white", cursor: "pointer", 
                fontWeight: "bold", fontSize: "1rem"
              }}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Yes, Confirm"}
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default GlobalModal;