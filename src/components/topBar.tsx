export function TopBar({
  score = 0,
  onRerun,
}: {
  score: number;
  onRerun: () => void;
}) {
  const handleClick = () => {
    onRerun();
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1e1e1e",
        borderBottom: "1px solid #49e07b98",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
        height: "52px",
        padding: "0px",
        margin: "0px" ,
        boxSizing: "border-box",
 
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "1.05rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "14px",
       
          letterSpacing: "0.01em",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            fontSize: "1.5rem",
            marginRight: "8px",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.10))",
          }}
          aria-label="Score Icon"
        >
          {score >= 90 ? "🌟" : score >= 80 ? "🎉" : score >= 70 ? "🎊" : score >= 50 ? "⚠️" : "❌"}
        </span>
        <span>
          <span
            style={{
              opacity: 0.7,
              marginRight: "8px",
              fontSize: "1rem",
            }}
          >
          Score:
          </span>
          <strong
            style={{
              fontWeight: 700,
              color:
                score >= 80
                  ? "#22c55e"
                  : score >= 70
                  ? "#eab308"
                  : "#ef4444",
              fontSize: "1.22rem",
              textShadow: "0 1px 2px rgba(0,0,0,0.08)",
              letterSpacing: "0.02em",
            }}
          >
            {score}%
          </strong>
        </span>
      </div>

      <button
        onClick={handleClick}
        style={{
          flexShrink: 0,
          width: "fit-content",
          minWidth: "140px",
          padding: "8px 16px",
          height: "36px",
          gap: "6px",
        }}
      >
        <span>🚀</span>
        <span>Run Checks</span>
      </button>
    </div>
  );
}
