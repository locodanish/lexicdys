import React, { useState, useEffect } from "react";
import "./App.css";
import NavBar from "./Components/NavBar";
import Home from "./Components/Pages/Home";
import Reading from "./Components/Pages/Reading";
import Admin from "./Components/Pages/Admin";
import AdminUsers from "./Components/Pages/AdminUsers";
import AdminMaterials from "./Components/Pages/AdminMaterials";
import Card from "./Components/Card";
import About from "./Components/Pages/About";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [page, setPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check Firebase auth state on mount and persist login across refreshes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
        // If user is admin, show admin page; otherwise show home
        (async () => {
          try {
            const adminDoc = await getDoc(doc(db, "admins", user.uid));
            const isAdminLocal = adminDoc.exists();
            setIsAdmin(isAdminLocal);
            setPage(isAdminLocal ? "admin" : "home");
          } catch (err) {
            console.error("Failed to check admin status", err);
            setIsAdmin(false);
            setPage("home");
          }
        })();
      } else {
        setIsLoggedIn(false);
        setPage("login");
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  let content;
  if (!isLoggedIn) {
    content = <Card setPage={setPage} setIsLoggedIn={setIsLoggedIn} />;
  } else if (page === "home") {
    content = <Home />;
  } else if (page === "reading") {
    content = <Reading />;
  } else if (page === "admin") {
    content = <Admin />;
  } else if (page === "admin-users") {
    content = <AdminUsers />;
  } else if (page === "admin-materials") {
    content = <AdminMaterials />;
  } else if (page === "about") {
    content = <About />;
  } else {
    content = (
      <div style={{ padding: "2rem" }}>
        <h2>404 - Page Not Found</h2>
      </div>
    );
  }

  return (
    <div>
      {isLoggedIn && <NavBar setPage={setPage} isAdmin={isAdmin} />}
      {content}
    </div>
  );
}

export default App;
