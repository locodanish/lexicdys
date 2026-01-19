import React, { useState, useEffect } from "react";
import "./App.css";

// Components
import NavBar from "./Components/NavBar";
import Sidebar from "./Components/Sidebar";
import Home from "./Components/Pages/Home";
import Reading from "./Components/Pages/Reading";
import Admin from "./Components/Pages/Admin";
import AdminUsers from "./Components/Pages/AdminUsers";
import AdminMaterials from "./Components/Pages/AdminMaterials";
import Card from "./Components/Card";
import SignUp from "./Components/SignUp";
import Profile from "./Components/Pages/Profile"; // 👈 Import this
import About from "./Components/Pages/About";

function App() {
  const [page, setPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Persistence Logic ---
  useEffect(() => {
    if (isLoggedIn && page !== "login" && page !== "signup") {
      localStorage.setItem("lastPage", page);
    }
  }, [page, isLoggedIn]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedPage = localStorage.getItem("lastPage");

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setCurrentUser(user);

      if (user.isAdmin) {
        setIsAdmin(true);
        setPage(savedPage || "admin");
      } else {
        setIsAdmin(false);
        setPage(savedPage || "home");
      }
    } else {
      setIsLoggedIn(false);
      setPage("login");
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("lastPage");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setPage("login");
  };

  if (loading) return <div>Loading...</div>;

  // --- Page Selection Logic ---
  let content;
  if (!isLoggedIn) {
    if (page === "signup") content = <SignUp setPage={setPage} />;
    else
      content = (
        <Card
          setPage={setPage}
          setIsLoggedIn={setIsLoggedIn}
          setCurrentUser={setCurrentUser}
          setIsAdmin={setIsAdmin}
        />
      );
  } else if (page === "home") {
    content = <Home currentUser={currentUser} />;
  } else if (page === "reading") {
    // ✅ FIX 1: Pass currentUser to Reading so it can save progress
    content = <Reading currentUser={currentUser} />;
  } else if (page === "admin") {
    content = <Admin />;
  } else if (page === "admin-users") {
    content = <AdminUsers />;
  } else if (page === "admin-materials") {
    content = <AdminMaterials />;
  } else if (page === "about") {
    content = <About />;
  } else if (page === "profile") {
    // 👈 ADD THIS BLOCK
    content = (
      <Profile currentUser={currentUser} setCurrentUser={setCurrentUser} />
    );
  } else {
    content = <Home currentUser={currentUser} />;
  }

  // --- RETURN STATEMENT (The Layout) ---
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {isLoggedIn && (
        <NavBar
          setPage={setPage}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          currentUser={currentUser} // ✅ FIX 2: Pass currentUser to NavBar
        />
      )}

      <div style={{ display: "flex", maxWidth: "100%" }}>
        {/* SIDEBAR: Only show if Admin and Logged In */}
        {isLoggedIn && isAdmin && <Sidebar setPage={setPage} page={page} />}

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, paddingBottom: "2rem" }}>{content}</div>
      </div>
    </div>
  );
}

export default App;
