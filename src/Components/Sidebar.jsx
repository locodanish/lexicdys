import React from "react";

function Sidebar({ setPage, page }) {
  const menuItems = [
    { name: "Dashboard", value: "admin", icon: "📊" },
    { name: "Manage Users", value: "admin-users", icon: "👥" },
    { name: "Manage Content", value: "admin-materials", icon: "📚" },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = page === item.value;
          return (
            <div
              key={item.value}
              onClick={() => setPage(item.value)}
              style={{
                ...styles.menuItem,
                backgroundColor: isActive ? "#EEF2FF" : "transparent",
                color: isActive ? "#6B7FF9" : "#555",
                fontWeight: isActive ? "600" : "500",
                borderRight: isActive ? "3px solid #6B7FF9" : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
              {item.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    backgroundColor: "white",
    borderRight: "1px solid #eaeaea",
    height: "calc(100vh - 70px)", // Full height minus NavBar
    position: "sticky",
    top: "70px", // Starts below NavBar
    display: "flex",
    flexDirection: "column",
    paddingTop: "1rem",
  },
  menuContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  menuItem: {
    padding: "15px 25px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "1rem",
    transition: "all 0.2s",
  },
};

export default Sidebar;