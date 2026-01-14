import React from "react";
import "./theme.css";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function NavBar({ setPage, isAdmin }) {
  return (
    <div className="navbar-modern">
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className="navbar-brand-modern" onClick={() => setPage("home")}>
          Lexicdys
        </span>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {!isAdmin && (
            <>
              <button
                className="nav-link-modern"
                onClick={() => setPage("home")}
              >
                Flashcard
              </button>
              <button
                className="nav-link-modern"
                onClick={() => setPage("reading")}
              >
                Reading
              </button>
            </>
          )}
          {isAdmin && (
            <>
              <button
                className="nav-link-modern"
                onClick={() => setPage("admin-users")}
              >
                Manage Users
              </button>
              <button
                className="nav-link-modern"
                onClick={() => setPage("admin-materials")}
              >
                Manage Content
              </button>
            </>
          )}
          <button
            className="nav-link-modern"
            onClick={async () => {
              try {
                await signOut(auth);
                setPage("login");
              } catch (err) {
                console.error("Sign out error:", err);
              }
            }}
            style={{ color: "var(--color-error)" }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
