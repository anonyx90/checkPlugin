import { framer } from "framer-plugin";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckResult } from "./types";
import { checks } from "./checks/allChecks";
import { PageSpeedResult } from "./PageSpeedResult";
import "./App.css";
import { TopBar } from "./components/topBar";

framer.showUI({
  position: "center",
  width: 580,
  height: 500,
  minWidth: 560,
  minHeight: 500,
  resizable: true,
});

type Check = {
  id: string;
  title: string;
  run: () => Promise<CheckResult>;
  category?: string;
};

function groupChecksByCategory(checks: Array<Check>) {
  const grouped: Record<string, Array<Check>> = {};
  for (const check of checks) {
    const category = check.category ?? "Uncategorized";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(check);
  }
  return grouped;
}

function getStatusBadge(status: string | undefined) {
  if (status === "fail") return "Fix it";
  if (status === "warning") return "Warning";
  if (status === "pass") return "Passed";
  return status || "";
}

function sortChecksByStatus(
  checks: Array<Check>,
  checkResults: Record<string, CheckResult>
) {
  const statusOrder = { fail: 0, warning: 1, pass: 2 };
  return [...checks].sort((a, b) => {
    const aStatus = checkResults[a.id]?.status ?? "";
    const bStatus = checkResults[b.id]?.status ?? "";
    const aOrder = statusOrder[aStatus as keyof typeof statusOrder] ?? 3;
    const bOrder = statusOrder[bStatus as keyof typeof statusOrder] ?? 3;
    return aOrder - bOrder;
  });
}

function calculateScore(results: Record<string, CheckResult>) {
  const all = Object.values(results);
  if (all.length === 0) return 0;

  let totalScore = 0;
  const totalChecks = all.length;

  for (const result of all) {
    if (result.status === "pass") {
      totalScore += 1;
    } else if (result.status === "warning") {
      totalScore += 0.5;
    }
    // fail gets 0
  }

  return Math.round((totalScore / totalChecks) * 100);
}

// Updated: details can contain strings or JSX Elements
function groupDetailsByCategory(
  details: Array<string | JSX.Element>
): Record<string, Array<string | JSX.Element>> {
  const groups: Record<string, Array<string | JSX.Element>> = {};
  let current = "General";
  details.forEach((line) => {
    if (typeof line === "string") {
      const match = line.match(/^([^\w\s]{1,2})\s?\*\*(.+?)\*\*/);
      if (match) {
        current = match[2].trim();
        groups[current] = [];
      } else {
        if (!groups[current]) groups[current] = [];
        groups[current].push(line);
      }
    } else {
      if (!groups[current]) groups[current] = [];
      groups[current].push(line);
    }
  });
  return groups;
}

export function App() {
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>(
    {}
  );
  const [runVersion, setRunVersion] = useState(0);
  const [checkResults, setCheckResults] = useState<Record<string, CheckResult>>({});
  const score = calculateScore(checkResults);

  const handleRunChecks = () => {
    setRunVersion((v) => v + 1);
    setExpandedResults({});
    setCheckResults({});
  };

  const toggleExpand = (id: string) => {
    setExpandedResults((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const groupedChecks = groupChecksByCategory(checks);

  return (
    <>
      <main className="dashboard">
        <TopBar score={score} onRerun={handleRunChecks} />
        <div className="">
          <div className="top-row">
            <header>
              <h2> </h2>
              <p></p>
            </header>
          </div>

          <PageSpeedResult />

          <div className="results-list fade-in">
            {Object.entries(groupedChecks).map(([category, group]) => {
              const allLoaded = group.every((check) => checkResults[check.id]);

              const checksToShow = allLoaded
                ? sortChecksByStatus(group, checkResults)
                : group;

              return (
                <div key={category} style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: "16px 0 8px 0", fontSize: 17 }}>{category}</h3>
                  {checksToShow.map((check) => (
                    <CheckResultBox
                      key={check.id}
                      check={check}
                      expanded={expandedResults[check.id] ?? false}
                      toggleExpand={toggleExpand}
                      runVersion={runVersion}
                      onResult={(result) =>
                        setCheckResults((r) => ({ ...r, [check.id]: result }))
                      }
                    />
                  ))}
                </div>
              );
            })}
          </div>

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
        </div>
      </main>
    </>
  );
}

function CheckResultBox({
  check,
  expanded,
  toggleExpand,
  runVersion,
  onResult,
}: {
  check: { id: string; title: string; run: () => Promise<CheckResult> };
  expanded: boolean;
  toggleExpand: (id: string) => void;
  runVersion: number;
  onResult: (result: CheckResult) => void;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["check", check.id, runVersion],
    queryFn: check.run,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) onResult(data);
  }, [data]);

  const emoji =
    data?.status === "pass"
      ? "✅"
      : data?.status === "fail"
      ? "❌"
      : "⚠️";

  // Updated typing here as well
  let groupedDetails: Record<string, Array<string | JSX.Element>> = {};
  if (data?.details) {
    groupedDetails = groupDetailsByCategory(data.details);
  }

  let detailsToShow: [string, Array<string | JSX.Element>][] = [];
  if (data?.details) {
    if (expanded) {
      detailsToShow = Object.entries(groupedDetails);
    } else {
      let count = 0;
      detailsToShow = [];
      for (const [cat, lines] of Object.entries(groupedDetails)) {
        if (count >= 5) break;
        const linesToShow = lines.slice(0, Math.max(0, 5 - count));
        if (linesToShow.length > 0) {
          detailsToShow.push([cat, linesToShow]);
          count += linesToShow.length;
        }
      }
    }
  }

  return (
    <div className={`result-box ${data?.status || ""}`}>
      <div className="result-header">
        <span>
          {emoji} {check.title}
        </span>
        <span className="result-status">
          {isLoading
            ? "Loading..."
            : error
            ? "Error"
            : getStatusBadge(data?.status)}
        </span>
      </div>
      <div className="result-details">
        {isLoading && <div>Loading...</div>}
        {error && <div>Error: {String(error)}</div>}
        {detailsToShow.map(([cat, lines], i) => (
          <div key={cat + i} style={{ marginBottom: 8 }}>
            {cat !== "General" && (
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{cat}</div>
            )}
            <ul>
              {lines.map((d, j) => (
                <li key={j}>{d}</li> 
              ))}
            </ul>
          </div>
        ))}
        {data?.details && data.details.length > 5 && (
          <button className="show-more" onClick={() => toggleExpand(check.id)}>
            {expanded ? "Show Less" : "Show More"}
          </button>
        )}
      </div>
    </div>
  );
}
