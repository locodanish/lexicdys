import React from "react";
import "./theme.css";

function NavBar({ setPage, isAdmin, onLogout, currentUser }) {
  return (
    <div className="navbar-modern" style={{ position: "sticky", top: 0, zIndex: 1000 }}>
      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: "0 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span 
          className="navbar-brand-modern" 
          onClick={() => setPage(isAdmin ? "admin" : "home")}
          style={{ cursor: "pointer" }}
        >
          Lexicdys {isAdmin && <span style={{ fontSize: "0.8rem", opacity: 0.7, marginLeft: "5px" }}>(Admin)</span>}
        </span>
        
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          
          {!isAdmin && (
            <>
              <button className="nav-link-modern" onClick={() => setPage("home")}>
                Flashcard
              </button>
              <button className="nav-link-modern" onClick={() => setPage("reading")}>
                Reading
              </button>
            </>
          )}

          {/* Profile Section - Clickable to go to Profile Page */}
          <div 
            onClick={() => setPage("profile")}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              marginRight: "10px",
              paddingLeft: "15px",
              borderLeft: "1px solid #eee",
              cursor: "pointer" 
            }}
          >
            <div style={{ 
              width: "32px", 
              height: "32px", 
              borderRadius: "50%", 
              backgroundColor: "var(--color-primary)", 
              color: "white", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontWeight: "bold",
              fontSize: "0.9rem"
            }}>
              {/* Shows First Initial */}
              {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <span style={{ fontWeight: "600", fontSize: "0.9rem", color: "#333" }}>
              {/* Shows Full Name */}
              {currentUser?.fullName || "User"}
            </span>
          </div>

          <button
            className="nav-link-modern"
            onClick={onLogout}
            style={{ color: "var(--color-error)", fontSize: "0.9rem" }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default NavBar;