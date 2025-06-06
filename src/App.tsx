import { framer } from "framer-plugin";
import { useState } from "react";
import "./App.css";
import { CheckResult } from "./types";
import { checks } from "./checks/allChecks";
import { PageSpeedResult } from "./PageSpeedResult";

framer.showUI({
  position: "top right",
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
  const [groupedResults, setGroupedResults] = useState<Record<string, CheckResult[]>>({});
  const [running, setRunning] = useState(false);

  const handleRunChecks = async () => {
    setRunning(true);
    setGroupedResults({});

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

  return (
<main className="dashboard">
  <div className="top-row">
    <header>
      <h2>🧪 ~ FrameAudit</h2>
      <p>Run checks to validate your Framer template before submission.</p>
    </header>
    
  </div>

  <PageSpeedResult />
  <button className="" onClick={handleRunChecks} disabled={running}>
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

                return (
                  <div key={result.id} className={`result-box ${result.status}`}>
                    <div className="result-header">
                      <span>
                        {emoji} {result.title}
                      </span>
                      <span className="result-status">{result.status}</span>
                    </div>
                    {Array.isArray(result.details) && result.details.length > 0 && (
                      <ul className="result-details">
                        {result.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      )}
    </>
  )}
</main>

  );
}
