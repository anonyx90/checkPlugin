import { framer } from "framer-plugin";
import { useState } from "react";
import { CheckResult } from "./types";
import { checks } from "./checks/allChecks";
import { PageSpeedResult } from "./PageSpeedResult";
import "./App.css";

framer.showUI({
  position: "center",
  width: 560,
  height: 500,
  minWidth: 560,
  minHeight: 500,
  resizable: true,
});

async function runAllChecks(): Promise<Record<string, CheckResult[]>> {
  const results = await Promise.all(checks.map((check) => check.run()));
  const grouped: Record<string, CheckResult[]> = {};

  for (let i = 0; i < checks.length; i++) {
    const category = checks[i].category ?? "Uncategorized";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(results[i]);
  }
  return grouped;
}

export function App() {
  const [groupedResults, setGroupedResults] = useState<
    Record<string, CheckResult[]>
  >({});
  const [running, setRunning] = useState(false);
  const [expandedResults, setExpandedResults] = useState<
    Record<string, boolean>
  >({});

  const handleRunChecks = async () => {
    setRunning(true);
    setGroupedResults({});
    setExpandedResults({});
    try {
      const [grouped] = await Promise.all([
        runAllChecks(),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
      setGroupedResults(grouped);
    } catch (error) {
      setGroupedResults({
        Error: [
          {
            id: "error",
            title: "Plugin Error",
            status: "fail",
            details: [String(error)],
          },
        ],
      });
    } finally {
      setRunning(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedResults((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <main className="dashboard">
      <div className="top-row">
        <header>
          <h2> FrameAudit  ~ 🧪 ~ </h2>
          <p>Run checks to validate your Framer template before submission.</p>
        </header>
      </div>

      <PageSpeedResult />
      <button
        className="special-button"
        onClick={handleRunChecks}
        disabled={running}
      >
        <span>🚀 Run All Checks</span>
      </button>

      {running ? (
        <div className="loader">
          <span></span>
        </div>
      ) : (
        <>
          {Object.keys(groupedResults).length > 0 && (
            <div className="results-list fade-in">
              {Object.entries(groupedResults).map(([category, results]) => (
                <section key={category} className="category-group">
                  <h3>{category}</h3>
                  {results.map((result) => {
                    const emoji =
                      result.status === "pass"
                        ? "✅"
                        : result.status === "fail"
                        ? "❌"
                        : "⚠️";

                    const isExpanded = expandedResults[result.id] ?? false;
                    const detailsToShow = result.details
                      ? isExpanded
                        ? result.details
                        : result.details.slice(0, 5)
                      : [];

                    return (
                      <div
                        key={result.id}
                        className={`result-box ${result.status}`}
                      >
                        <div className="result-header">
                          <span>
                            {emoji} {result.title}
                          </span>
                          <span className="result-status">{result.status}</span>
                        </div>

                        {Array.isArray(result.details) &&
                          result.details.length > 0 && (
                            <ul className="result-details">
                              {detailsToShow.map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                              {result.details.length > 5 && (
                                <button
                                  className="show-more"
                                  onClick={() => toggleExpand(result.id)}
                                >
                                  {isExpanded ? "Show Less" : "Show More"}
                                </button>
                              )}
                            </ul>
                          )}
                      </div>
                    );
                  })}
                </section>
              ))}
            </div>
          )}
              <button
        className="go-to-top"
        style={{ fontSize: "1.5rem" }}
        onClick={() => {
          const container = document.querySelector(".dashboard");
          if (container) {
            container.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      >
      &#x1F51D;
      </button>
        </>
      )}
  
    </main>
  );
}
