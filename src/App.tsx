import { framer } from "framer-plugin";
import { useState } from "react";
import "./App.css";
import { CheckResult, checks } from "./check";

framer.showUI({
  position: "top right",
  width: 360,
  height: 400,
  minWidth: 360,
  minHeight: 400,
  resizable: true,
});

export function App() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);

  const runAllChecks = async () => {
    setRunning(true);
    setResults([]); 

    try {
      const all: CheckResult[] = [];

      for (const check of checks) {
        const result = await check.run();
        all.push(result);
      }

      
      await new Promise((resolve) => setTimeout(resolve, 2500));

      setResults(all);
    } catch (error) {
      console.error("Plugin check error:", error);
      setResults([
        {
          id: "error",
          title: "Plugin Error",
          status: "fail",
          details: [String(error)],
        },
      ]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <main
      style={{
        padding: 16,
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#fafafa",
        color: "#111",
        fontSize: 13,
        minHeight: "100%",
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
          🧪 Template Audit Dashboard
        </h2>
        <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
          Run checks to validate your Framer template before submission.
        </p>
      </header>

      {running ? (
    
<div className="container">
	<div className="loader"></div>
	<div className="loader"></div>
	<div className="loader"></div>
</div>

      ) : (
        <>
          <button
            className="framer-button-primary"
            onClick={runAllChecks}
            disabled={running}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 14,
              borderRadius: 6,
              fontWeight: 500,
              marginBottom: 20,
              backgroundColor: "#007aff",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            🚀 Run All Checks
          </button>

          {results.length > 0 && (
            <div style={{ display: "grid", gap: 12 }}>
              {results.map((result) => {
                const bgColor =
                  result.status === "pass"
                    ? "#e8f5e9"
                    : result.status === "fail"
                    ? "#ffebee"
                    : "#fff3e0";

                const color =
                  result.status === "pass"
                    ? "#2e7d32"
                    : result.status === "fail"
                    ? "#c62828"
                    : "#e65100";

                const emoji =
                  result.status === "pass"
                    ? "✅"
                    : result.status === "fail"
                    ? "❌"
                    : "⚠️";

                return (
                  <div
                    key={result.id}
                    style={{
                      backgroundColor: bgColor,
                      border: `1px solid ${color}`,
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color,
                        fontSize: 14,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{emoji} {result.title}</span>
                      <span
                        style={{
                          fontSize: 11,
                          backgroundColor: color,
                          color: "#fff",
                          padding: "2px 6px",
                          borderRadius: 4,
                          textTransform: "uppercase",
                        }}
                      >
                        {result.status}
                      </span>
                    </div>

                    {Array.isArray(result.details) && result.details.length > 0 && (
                      <ul
                        style={{
                          fontSize: 12,
                          color: "#444",
                          paddingLeft: 18,
                          marginTop: 8,
                          marginBottom: 0,
                        }}
                      >
                        {result.details.map((d, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
