import React from "react";

function Admin() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Admin Panel</h2>
      <p style={{ marginTop: 8 }}>
        This is the admin landing page. Use the navigation links{" "}
        <strong>Manage Users</strong> and <strong>Manage Content</strong> to
        perform administrative actions.
      </p>
      <ul style={{ marginTop: 12 }}>
        <li>Manage Users — create, update, and delete user accounts.</li>
        <li>Manage Content — add flashcard words and reading sentences.</li>
      </ul>
    </div>
  );
}

export default Admin;
