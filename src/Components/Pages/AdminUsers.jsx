import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../theme.css";

function AdminUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);

  // Track which user we are editing
  const [editingUserId, setEditingUserId] = useState(null);

  // 1. Fetch Users wrapped in useCallback
  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users");
      setAllUsers(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]); // fetchAllUsers is now a stable dependency

  // 2. Handle Form Submit (Create OR Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!newEmail.trim() || !newFullName.trim()) {
      return setMessage("Please fill in required fields.");
    }

    if (!editingUserId && !newPassword.trim()) {
      return setMessage("Password is required for new users.");
    }

    setLoading(true);
    try {
      const userData = {
        fullName: newFullName,
        email: newEmail,
        phone: newPhone || "0000000000",
        password: newPassword 
      };

      if (editingUserId) {
        await axios.put(`http://localhost:5000/api/admin/users/${editingUserId}`, userData);
        setMessage("✅ User updated successfully!");
      } else {
        const res = await axios.post("http://localhost:5000/api/signup", userData);
        
        if (newIsAdmin && res.data.user && res.data.user._id) {
           try {
             await axios.put(`http://localhost:5000/api/admin/users/${res.data.user._id}/admin`);
             setMessage("✅ User created and promoted to Admin!");
           } catch (ignored) {}
        } else {
          setMessage("✅ User created successfully.");
        }
      }

      resetForm();
      fetchAllUsers();

    } catch (err) {
      console.error(err);
      setMessage("❌ " + (err.response?.data?.message || "Operation failed"));
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      setMessage("✅ User deleted.");
      fetchAllUsers();
    } catch (err) {
      setMessage("❌ Delete failed.");
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user._id);
    setNewFullName(user.fullName);
    setNewEmail(user.email);
    setNewPhone(user.phone);
    setNewPassword(""); 
    setNewIsAdmin(false); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingUserId(null);
    setNewFullName("");
    setNewEmail("");
    setNewPhone("");
    setNewPassword("");
    setNewIsAdmin(false);
  };

  const toggleAdminStatus = async (user) => {
    const action = user.isAdmin ? "Remove" : "Make";
    if (!window.confirm(`${action} admin rights for ${user.fullName}?`)) return;

    try {
      await axios.put(`http://localhost:5000/api/admin/users/${user._id}/admin`);
      setMessage(`✅ User updated.`);
      fetchAllUsers();
    } catch (err) {
      setMessage("❌ Update failed.");
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Manage Users</h1>
      </div>

      {message && (
        <div className={message.includes("✅") ? "alert-success-modern" : "alert-error-modern"} style={{ marginBottom: "1.5rem" }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
        <div className="card-modern" style={{ borderColor: editingUserId ? "var(--color-primary)" : "var(--color-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="card-header-modern" style={{ marginBottom: 0 }}>
              {editingUserId ? "Edit User" : "Create User"}
            </h2>
            {editingUserId && (
              <button onClick={resetForm} style={{ fontSize: "0.85rem", background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer", textDecoration: "underline" }}>
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group-modern">
              <label className="form-label-modern">Full Name</label>
              <input className="form-input-modern" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="form-group-modern">
              <label className="form-label-modern">Email</label>
              <input type="email" className="form-input-modern" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" required />
            </div>
            <div className="form-group-modern">
              <label className="form-label-modern">Phone</label>
              <input type="tel" className="form-input-modern" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="0123456789" />
            </div>
            <div className="form-group-modern">
              <label className="form-label-modern">
                {editingUserId ? "New Password (Leave blank to keep current)" : "Password"}
              </label>
              <input type="password" className="form-input-modern" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={editingUserId ? "••••••" : "Min 6 characters"} required={!editingUserId} />
            </div>

            {!editingUserId && (
              <div className="form-group-modern">
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input type="checkbox" checked={newIsAdmin} onChange={(e) => setNewIsAdmin(e.target.checked)} style={{ marginRight: "0.5rem" }} />
                  <span style={{ fontWeight: "500" }}>Make Admin Immediately</span>
                </label>
              </div>
            )}

            <button type="submit" className="btn-primary-modern" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Processing..." : (editingUserId ? "Update User" : "Create User")}
            </button>
          </form>
        </div>

        <div className="card-modern">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="card-header-modern" style={{ marginBottom: 0 }}>All Users ({allUsers.length})</h2>
            <button onClick={fetchAllUsers} className="btn-secondary-modern" style={{ padding: "0.5rem 1rem" }}>🔄 Refresh</button>
          </div>

          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {allUsers.map((user) => (
              <div key={user._id} style={{
                padding: "1.2rem",
                borderBottom: "1px solid var(--color-border)",
                backgroundColor: user.isAdmin ? "rgba(107, 127, 249, 0.05)" : "transparent"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "1.1rem", color: user.isAdmin ? "var(--color-primary)" : "inherit" }}>
                        {user.isAdmin && "👑 "} {user.fullName}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>{user.email}</div>
                      <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>{user.phone}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                    <button onClick={() => startEditing(user)} className="btn-secondary-modern" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", flex: 1 }}>Edit</button>
                    <button onClick={() => toggleAdminStatus(user)} className={user.isAdmin ? "btn-danger-modern" : "btn-primary-modern"} style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", flex: 1 }}>{user.isAdmin ? "Remove Admin" : "Make Admin"}</button>
                    <button onClick={() => deleteUser(user._id)} className="btn-danger-modern" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", flex: 1 }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;