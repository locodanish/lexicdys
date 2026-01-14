import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  getAuth,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import "../theme.css";

function AdminUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [adminUIDs, setAdminUIDs] = useState(new Set());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplay, setNewDisplay] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);

  // Fetch all users and admin status from Firestore
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      // Fetch admin UIDs
      const adminSnapshot = await getDocs(collection(db, "admins"));
      const adminIds = new Set(adminSnapshot.docs.map((doc) => doc.id));
      setAdminUIDs(adminIds);

      // Get all users from Firebase Auth
      const currentAuth = getAuth();
      
      // Note: Cannot directly list all users from client SDK
      // Instead, we'll fetch from a custom endpoint or use stored user list
      // For now, display message about using Firebase Console
      setMessage("ℹ️ Use Firebase Console → Authentication to view all users. Admins are listed below.");
      
      setAllUsers([]);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!newEmail.trim()) return setMessage("Please enter an email.");
    if (!newPassword.trim()) return setMessage("Please enter a password.");

    setLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmail.trim(),
        newPassword.trim()
      );
      const uid = userCredential.user.uid;

      // If admin, add to admins collection
      if (newIsAdmin) {
        await setDoc(doc(db, "admins", uid), {
          email: newEmail.trim(),
          displayName: newDisplay.trim() || "Admin User",
          createdAt: new Date().toISOString(),
        });
      }

      setMessage(`✅ User created: ${newEmail}`);
      setNewEmail("");
      setNewPassword("");
      setNewDisplay("");
      setNewIsAdmin(false);
      setTimeout(() => setMessage(""), 3000);

      if (newIsAdmin) {
        fetchAllUsers();
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setMessage("❌ Email already in use.");
      } else if (err.code === "auth/weak-password") {
        setMessage("❌ Password is too weak (min 6 characters).");
      } else {
        setMessage("❌ Failed to create user.");
      }
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async (uid, email, displayName) => {
    try {
      await setDoc(doc(db, "admins", uid), {
        email,
        displayName: displayName || "Admin User",
        createdAt: new Date().toISOString(),
      });
      setMessage("✅ User promoted to admin.");
      setTimeout(() => setMessage(""), 2000);
      fetchAllUsers();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to make admin.");
    }
  };

  const removeAdmin = async (uid) => {
    if (!window.confirm("Remove this user from admins?")) return;
    try {
      await deleteDoc(doc(db, "admins", uid));
      setMessage("✅ User removed from admins.");
      setTimeout(() => setMessage(""), 2000);
      fetchAllUsers();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to remove admin.");
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Manage Admins</h1>
        <p>Create users and manage admin access</p>
      </div>

      {message && (
        <div
          className={
            message.includes("✅")
              ? "alert-success-modern"
              : "alert-error-modern"
          }
          style={{ marginBottom: "1.5rem" }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Create User Form */}
        <div className="card-modern">
          <h2 className="card-header-modern">Create User</h2>
          <form onSubmit={createUser}>
            <div className="form-group-modern">
              <label className="form-label-modern">Email</label>
              <input
                type="email"
                className="form-input-modern"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Password</label>
              <input
                type="password"
                className="form-input-modern"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">
                Display Name (Optional)
              </label>
              <input
                type="text"
                className="form-input-modern"
                value={newDisplay}
                onChange={(e) => setNewDisplay(e.target.value)}
                placeholder="User's name"
              />
            </div>

            <div className="form-group-modern">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={newIsAdmin}
                  onChange={(e) => setNewIsAdmin(e.target.checked)}
                  style={{ marginRight: "0.5rem", cursor: "pointer" }}
                />
                <span
                  style={{
                    fontWeight: "500",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Make Admin
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary-modern"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>

        {/* Users List - Admins First */}
        <div className="card-modern">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 className="card-header-modern" style={{ marginBottom: 0 }}>
              Admins ({adminUIDs.size})
            </h2>
            <button
              onClick={fetchAllUsers}
              className="btn-secondary-modern"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <div
                className="spinner-modern"
                style={{ display: "inline-block", marginBottom: "1rem" }}
              />
              <p>Loading admins...</p>
            </div>
          ) : adminUIDs.size === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--color-text-secondary)",
              }}
            >
              No admins yet.
            </div>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {Array.from(adminUIDs).map((uid, idx) => {
                // Fetch admin data from allUsers or show minimal info
                const adminData = allUsers.find((u) => u.uid === uid);
                return (
                  <div
                    key={uid}
                    style={{
                      padding: "1rem",
                      borderBottom:
                        idx < adminUIDs.size - 1
                          ? "1px solid var(--color-border)"
                          : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "1rem",
                      backgroundColor: "rgba(107, 127, 249, 0.08)",
                      borderLeft: "4px solid var(--color-primary)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "var(--color-primary)",
                          marginBottom: "0.25rem",
                          wordBreak: "break-word",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        👑 Admin
                        {adminData?.displayName && (
                          <span style={{ color: "var(--color-text-primary)" }}>
                            ({adminData.displayName})
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--color-text-secondary)",
                          wordBreak: "break-all",
                        }}
                      >
                        {adminData?.email || "Email not available"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--color-text-light)",
                          marginTop: "0.25rem",
                        }}
                      >
                        ID: {uid.substring(0, 8)}...
                      </div>
                    </div>
                    <button
                      onClick={() => removeAdmin(uid)}
                      className="btn-danger-modern"
                      style={{
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Remove Admin
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="alert-info-modern">
        <strong>ℹ️ How to Manage Users:</strong>
        <ul style={{ margin: "0.5rem 0", paddingLeft: "1.25rem" }}>
          <li>
            <strong>Create Users:</strong> Use the form above to create new
            users. Check "Make Admin" to give them admin access.
          </li>
          <li>
            <strong>Admins Highlighted:</strong> Admin users are displayed at the top with 👑 icon and blue highlight.
          </li>
          <li>
            <strong>Remove Admin Access:</strong> Click "Remove Admin" to revoke admin privileges (user account remains).
          </li>
          <li>
            <strong>View All Users:</strong> Check Firebase Console →
            Authentication to see all registered users.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AdminUsers;
