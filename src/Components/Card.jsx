import "./theme.css";
import LogIn from "./Pages/LogIn";

function Card({ setPage, setIsLoggedIn }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      <div className="card-modern" style={{ maxWidth: "420px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: "0 0 0.5rem 0",
            }}
          >
            Lexicdys
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              margin: "0",
              fontSize: "0.95rem",
            }}
          >
            Learn to read with confidence
          </p>
        </div>
        <LogIn setPage={setPage} setIsLoggedIn={setIsLoggedIn} />
      </div>
    </div>
  );
}

export default Card;
