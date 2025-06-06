import { useEffect, useState } from "react";
import { framer } from "framer-plugin";

const PAGESPEED_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const API_KEY = "AIzaSyCS1tJ-J93koSg8982oBdOVY1euPDW-d8k";

type Scores = {
  performance: string;
  accessibility: string;
  bestPractices: string;
  seo: string;
};

async function getPageSpeedScores(url: string, strategy: "mobile" | "desktop"): Promise<Scores> {
  const apiUrl = `${PAGESPEED_API}?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo&key=${API_KEY}`;
  const resp = await fetch(apiUrl);
  if (!resp.ok) throw new Error(`Failed to fetch PageSpeed for ${strategy}`);
  const data = await resp.json();
  const categories = data.lighthouseResult?.categories ?? {};
  return {
    performance: Math.round((categories.performance?.score ?? 0) * 100).toString(),
    accessibility: Math.round((categories.accessibility?.score ?? 0) * 100).toString(),
    bestPractices: Math.round((categories["best-practices"]?.score ?? 0) * 100).toString(),
    seo: Math.round((categories.seo?.score ?? 0) * 100).toString(),
  };
}

const scoreLabels = [
  { key: "performance", label: "performance", color: "#4caf50" },
  { key: "accessibility", label: "accessibility", color: "#ffeb3b" },
  { key: "bestPractices", label: "bestPractices", color: "#2196f3" },
  { key: "seo", label: "seo", color: "#00e676" },
];

function Spinner() {
  return (
    <span style={{
      width: 10,
      height: 10,
      border: "2px solid #999",
      borderTop: "2px solid transparent",
      borderRadius: "50%",
      animation: "spin 1.6s linear infinite",
      display: "inline-block",
      marginLeft: 4,
    }} />
  );
}

function ScoreMiniRow({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      fontSize: 12,
      marginRight: 10,
      marginBottom: 4,
      background: "#23272e",
      borderRadius: 6,
      padding: "2px 7px",
      fontWeight: 600,
      color: color,
      minWidth: 38,
      justifyContent: "center"
    }}>
      {label}: <span style={{ marginLeft: 4, display: "inline-flex", alignItems: "center", width: "24px" }}>{value}</span>
    </span>
  );
}

export function PageSpeedResult() {
  const [mobileScores, setMobileScores] = useState<Scores | null>(null);
  const [desktopScores, setDesktopScores] = useState<Scores | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  // Animated score states
  const [animatedMobileScores, setAnimatedMobileScores] = useState<Record<string, number>>({});
  const [animatedDesktopScores, setAnimatedDesktopScores] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    async function fetchScores() {
      setLoading(true);
      setMobileScores(null);
      setDesktopScores(null);
      setAnimatedMobileScores({});
      setAnimatedDesktopScores({});
      setReportUrl(null);

      const publishInfo = await framer.getPublishInfo();
      const stagingUrl = publishInfo.staging?.url;
      if (!stagingUrl) {
        setLoading(false);
        return;
      }

      setReportUrl(`https://pagespeed.web.dev/report?url=${encodeURIComponent(stagingUrl)}`);

      const [mobile, desktop] = await Promise.all([
        getPageSpeedScores(stagingUrl, "mobile"),
        getPageSpeedScores(stagingUrl, "desktop"),
      ]);

      if (cancelled) return;

      setMobileScores(mobile);
      setDesktopScores(desktop);

      setLoading(false);

      animateScores(mobile, setAnimatedMobileScores);
      animateScores(desktop, setAnimatedDesktopScores);
    }

    function animateScores(targetScores: Scores, setAnimatedScores: React.Dispatch<React.SetStateAction<Record<string, number>>>) {
      const keys = Object.keys(targetScores);
      const targetValues = keys.reduce((acc, key) => {
        acc[key] = parseInt(targetScores[key as keyof Scores], 10) || 0;
        return acc;
      }, {} as Record<string, number>);

      let currentScores = keys.reduce((acc, key) => {
        acc[key] = 1;
        return acc;
      }, {} as Record<string, number>);

      setAnimatedScores(currentScores);

      const interval = setInterval(() => {
        let done = true;

        keys.forEach((key) => {
          if (currentScores[key] < targetValues[key]) {
            currentScores[key] += 1;
            if (currentScores[key] > targetValues[key]) currentScores[key] = targetValues[key];
            done = false;
          }
        });

        setAnimatedScores({ ...currentScores });

        if (done) clearInterval(interval);
      }, 15);
    }

    fetchScores();

    return () => {
      cancelled = true;
    };
  }, []);

  function displayScore(animatedScores: Record<string, number>, realScores: Scores | null, key: string) {
    if (loading) return <Spinner />;
    if (realScores && animatedScores[key] !== undefined) {
      return animatedScores[key];
    }
    return "—";
  }

  return (
    <section style={{ fontSize: 12, color: "#fff", width: "100%" }}>
      <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

      <div
        style={{
          border: "1px solid #23272e",
          borderRadius: 6,
          padding: 10,
          background: "#181c20",
          boxShadow: "0 1px 4px #0002",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div className="button" style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, marginRight: 8 }}>⚡ PageSpeed</span>
            <span
              style={{
                padding: "1px 7px",
                borderRadius: 7,
                fontSize: 10,
                fontWeight: 500,
                background: loading ? "#757575" : "#4caf50",
                color: "#fff",
                minWidth: 32,
                textAlign: "center",
              }}
            >
              {loading ? "Loading" : "Pass"}
            </span>
          </div>
          {reportUrl && (
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#fff",
                background: "#1976d2",
                padding: "4px 10px",
                borderRadius: 4,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: 0.3,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1565c0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1976d2")}
            >
              Full Report →
            </a>
          )}
        </div>

        <div style={{ marginBottom: 6 }}>
          <span style={{ color: "#bdbdbd", fontWeight: 500, fontSize: 11 }}>Mobile</span>
          <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap" }}>
            {scoreLabels.map(({ key, label, color }) => (
              <ScoreMiniRow
                key={key}
                label={label}
                value={displayScore(animatedMobileScores, mobileScores, key)}
                color={color}
              />
            ))}
          </div>
        </div>

        <div>
          <span style={{ color: "#bdbdbd", fontWeight: 500, fontSize: 11 }}>Desktop</span>
          <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap" }}>
            {scoreLabels.map(({ key, label, color }) => (
              <ScoreMiniRow
                key={key}
                label={label}
                value={displayScore(animatedDesktopScores, desktopScores, key)}
                color={color}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}