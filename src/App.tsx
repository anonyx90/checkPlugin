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

const collections = await framer.getCollections();
const collection = await framer.getActiveCollection();
await framer.getCollections();

console.log(collections, collection);


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

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResults(all);
    } catch (error) {
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
    <main className="dashboard">
      <header>
        <h2>🧪 Template Audit Scanner</h2>
        <p>Run checks to validate your Framer template before submission.</p>
      </header>

      {running ? (
        <div className="loader-group">
          <div className="loader" />
          <div className="loader" />
          <div className="loader" />
        </div>
      ) : (
        <>
          <button className="run-button" onClick={runAllChecks} disabled={running}>
            🚀 Run All Checks
          </button>

          {results.length > 0 && (
   <div className="results-list fade-in">

              {results.map((result) => {
                const emoji =
                  result.status === "pass" ? "✅" :
                  result.status === "fail" ? "❌" : "⚠️";

                return (
                  <div key={result.id} className={`result-box ${result.status}`}>
                    <div className="result-header">
                      <span>{emoji} {result.title}</span>
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
            </div>
          )}
        </>
      )}
    </main>
  );
}
