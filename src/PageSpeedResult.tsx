import { useEffect, useState } from "react";
import { framer } from "framer-plugin";
import { useQuery } from "@tanstack/react-query";
import { lighthouseapi, Scores, getLighthouseAudits } from "./lib/googleApi";

const scoreLabels = [
  {
    key: "performance",
    label: "Performance",
    color: "#22c55e",
    bgColor: "#22c55e15",
  },
  {
    key: "accessibility",
    label: "Accessibility",
    color: "#f59e0b",
    bgColor: "#f59e0b15",
  },
  {
    key: "bestPractices",
    label: "Best Practices",
    color: "#3b82f6",
    bgColor: "#3b82f615",
  },
  { key: "seo", label: "SEO", color: "#10b981", bgColor: "#10b98115" },
];

const auditGroups = {
  accessibility: [
    "color-contrast",
    "image-alt",
    "document-title",
    "html-has-lang",
    "aria-allowed-attr",
    "aria-hidden-body",
    "accesskeys",
  ],
  responsive: [
    "viewport",
    "font-size",
    "uses-responsive-images",
    "modern-image-formats",
    "uses-optimized-images",
    "content-width",
    "tap-targets",
    "image-aspect-ratio",
    "uses-rel-preload",
    "layout-shift-elements",
  ],
  performance: [
    "first-contentful-paint",
    "largest-contentful-paint",
    "largest-contentful-paint-element",
    "speed-index",
    "total-blocking-time",
    "cumulative-layout-shift",
    "efficient-animated-content",
  ],
  bestPractices: [
    "uses-http2",
    "no-vulnerable-libraries",
    "uses-long-cache-ttl",
    "errors-in-console",
    "image-size-responsive",
  ],
  seo: [
    "meta-description",
    "hreflang",
    "canonical",
    "robots-txt",
    "font-display",
    "structured-data",
  ],
};

function Spinner() {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        border: "2px solid #374151",
        borderTop: "2px solidrgb(101, 238, 108)",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        display: "inline-block",
      }}
    />
  );
}

function ScoreCard({
  label,
  value,
  color,
  description,
  isLoading,
}: {
  label: string;
  value: React.ReactNode;
  color: string;
  bgColor: string;
  description?: string;
  isLoading?: boolean;
}) {
  const scoreValue = typeof value === "number" ? value : null;
  const getScoreColor = (score: number | null) => {
    if (score === null) return color;
    if (score >= 80) return "#22c55e";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const actualColor = scoreValue !== null ? getScoreColor(scoreValue) : color;

  return (
    <div
      title={description}
      style={{
        border: `1px solid ${actualColor}30`,
        borderRadius: 12,
        padding: "12px 16px",
        minWidth: 120,
        textAlign: "center",
        boxShadow: `0 4px 12px ${actualColor}20, inset 0 1px 0 rgba(255,255,255,0.1)`,
        cursor: description ? "help" : "default",
        transition: "all 0.3s ease",
        position: "relative" as const,
        overflow: "hidden" as const,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 20px ${actualColor}30, inset 0 1px 0 rgba(255,255,255,0.1)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 4px 12px ${actualColor}20, inset 0 1px 0 rgba(255,255,255,0.1)`;
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${actualColor}, ${actualColor}aa)`,
        }}
      />

      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "#9ca3af",
          marginBottom: 6,
          textTransform: "uppercase" as const,
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: actualColor,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 28,
        }}
      >
        {isLoading ? <Spinner /> : value}
      </div>
    </div>
  );
}

function AuditChip({
  label,
  value,
  status,
  description,
}: {
  label: string;
  value: string;
  status: "pass" | "warning" | "fail" | "na" | "loading";
  description?: string;
}) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pass":
        return { color: "#22c55e", bg: "#22c55e20", icon: "✓" };
      case "warning":
        return { color: "#f59e0b", bg: "#f59e0b20", icon: "⚠" };
      case "fail":
        return { color: "#ef4444", bg: "#ef444420", icon: "✗" };
      case "na":
        return { color: "#6b7280", bg: "#6b728020", icon: "–" };
      default:
        return { color: "#9ca3af", bg: "#9ca3af20", icon: "..." };
    }
  };

  const styles = getStatusStyles(status);

  return (
    <div
      title={description}
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: styles.bg,
        border: `1px solid ${styles.color}30`,
        borderRadius: 8,
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 500,
        color: styles.color,
        margin: "2px 4px 4px 0",
        backdropFilter: "blur(10px)",
        transition: "all 0.2s ease",
        cursor: description ? "help" : "default",
      }}
    >
      <span style={{ marginRight: 6, fontSize: 10 }}>{styles.icon}</span>
      <span style={{ color: "#e5e7eb", marginRight: 6 }}>{label}:</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function AuditGroupSection({
  title,
  audits,
  getAuditStatusWithDesc,
}: {
  title: string;
  audits: string[];
  getAuditStatusWithDesc: (id: string) => {
    value: string;
    status: "pass" | "warning" | "fail" | "na" | "loading";
    description?: string;
  };
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h5
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#94a3b8",
          margin: "0 0 8px 0",
          textTransform: "uppercase" as const,
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </h5>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {audits.map((id) => {
          const { value, status, description } = getAuditStatusWithDesc(id);
          return (
            <div key={id} style={{ marginRight: 12, marginBottom: 8 }}>
              <AuditChip
                label={id
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                value={value}
                status={status}
                description={description}
              />
              {description && (
                <div
                  style={{
                    color: "#a3a3a3",
                    fontSize: 11,
                    marginTop: 2,
                    maxWidth: 220,
                  }}
                >
                  {description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeviceScoreSection({
  device,
  icon,
  animatedScores,
  realScores,
  loading,
}: {
  device: string;
  icon: string;
  animatedScores: Record<string, number>;
  realScores: Scores | null;
  loading: boolean;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 16,
          gap: 8,
        }}
      >
        <div style={{ fontSize: 24 }}>{icon}</div>
        <h4
          style={{
            fontSize: 16,
            fontWeight: 600,
            margin: 0,
            color: "#e2e8f0",
          }}
        >
          {device} Performance
        </h4>
        {loading && <Spinner />}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 16,
        }}
      >
        {scoreLabels.map(({ key, label, color, bgColor }) => (
          <ScoreCard
            key={key}
            label={label}
            value={displayScore(
              animatedScores,
              realScores ?? null,
              key,
              loading
            )}
            color={color}
            bgColor={bgColor}
            isLoading={loading}
          />
        ))}
      </div>
    </div>
  );
}

function cleanDescription(desc?: string) {
  if (!desc) return undefined;
  const idx = desc.indexOf("[");
  if (idx !== -1) return desc.slice(0, idx).trim();
  return desc.trim();
}

function displayScore(
  animatedScores: Record<string, number>,
  realScores: Scores | null,
  key: string,
  loading: boolean
) {
  if (loading) return null;
  if (realScores && animatedScores[key] !== undefined) {
    return animatedScores[key];
  }
  return "—";
}

export function PageSpeedResult() {
  const [stagingUrl, setStagingUrl] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audits, setAudits] = useState<Record<string, any>>({});

  useEffect(() => {
    let cancelled = false;
    async function fetchUrl() {
      setError(null);
      setStagingUrl(null);
      setReportUrl(null);
      try {
        const publishInfo = await framer.getPublishInfo();
        const url = publishInfo.staging?.url;
        if (!url) {
          setError(
            "No published site found. Please publish your site to run a full scan report automatically."
          );
          return;
        }
        if (!cancelled) {
          setStagingUrl(url);
          setReportUrl(
            `https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`
          );
        }
      } catch {
        setError("Failed to get published site info.");
      }
    }
    fetchUrl();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!stagingUrl) return;
    (async () => {
      try {
        const { audits } = await getLighthouseAudits(stagingUrl);
        setAudits(audits);

        const textNodes = await framer.getNodesWithType("TextNode");
        const fontSizes: Record<number, number> = {};
        for (const node of textNodes) {
          const fontSize = (node as any).fontSize;
          if (fontSize) {
            const rounded = Math.round(fontSize);
            fontSizes[rounded] = (fontSizes[rounded] || 0) + 1;
          }
        }
      } catch (err) {
        console.warn("Audit extra checks failed:", err);
      }
    })();
  }, [stagingUrl]);

  const {
    data: mobileScores,
    isLoading: loadingMobile,
    error: errorMobile,
  } = useQuery({
    queryKey: ["pagespeed", stagingUrl, "mobile"],
    queryFn: () => lighthouseapi(stagingUrl!, "mobile"),
    enabled: !!stagingUrl,
    retry: 1,
  });

  const {
    data: desktopScores,
    isLoading: loadingDesktop,
    error: errorDesktop,
  } = useQuery({
    queryKey: ["pagespeed", stagingUrl, "desktop"],
    queryFn: () => lighthouseapi(stagingUrl!, "desktop"),
    enabled: !!stagingUrl,
    retry: 1,
  });

  const [animatedMobileScores, setAnimatedMobileScores] = useState<
    Record<string, number>
  >({});
  const [animatedDesktopScores, setAnimatedDesktopScores] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (mobileScores) animateScores(mobileScores, setAnimatedMobileScores);
  }, [mobileScores]);

  useEffect(() => {
    if (desktopScores) animateScores(desktopScores, setAnimatedDesktopScores);
  }, [desktopScores]);

  function animateScores(
    targetScores: Scores,
    setAnimatedScores: React.Dispatch<
      React.SetStateAction<Record<string, number>>
    >
  ) {
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
          if (currentScores[key] > targetValues[key])
            currentScores[key] = targetValues[key];
          done = false;
        }
      });
      setAnimatedScores({ ...currentScores });
      if (done) clearInterval(interval);
    }, 15);
  }

  function getAuditStatusWithDesc(id: string): {
    value: string;
    status: "pass" | "warning" | "fail" | "na" | "loading";
    description?: string;
  } {
    const audit = audits[id];
    if (!audit) return { value: "—", status: "na", description: undefined };
 if (audit.scoreDisplayMode === "notApplicable")
  return {
    value: "Pass",
    status: "pass",
    description: cleanDescription(audit.description)
      ? `${cleanDescription(audit.description)} (Not Applicable)`
      : "Not Applicable",
  };
    if (audit.scoreDisplayMode === "error")
      return {
        value: "Error",
        status: "fail",
        description: cleanDescription(audit.description),
      };
    if (audit.score === 1) {
      return {
        value: "Pass",
        status: "pass",
        description: cleanDescription(audit.description)
          ? `${cleanDescription(audit.description)} (Score: 100)`
          : "Score: 100",
      };
    }
    return {
      value: `${Math.round((audit.score || 0) * 100)}%`,
      status: "warning",
      description: cleanDescription(audit.description)
        ? `${cleanDescription(audit.description)} (Score: ${Math.round(
            (audit.score || 0) * 100
          )})`
        : `Score: ${Math.round((audit.score || 0) * 100)}`,
    };
  }

  const responsiveAllPassed = auditGroups.responsive.every(
    (id) => getAuditStatusWithDesc(id).status === "pass"
  );

  const detailedLoading =
    loadingMobile || loadingDesktop || !Object.keys(audits).length;

  const loading = loadingMobile || loadingDesktop;
  const anyError = error || errorMobile || errorDesktop;

  return (
    <section
      style={{
        fontSize: 14,
        color: "#fff",
        width: "100%",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          border: "1px solid #334155",
          borderRadius: 16,
          padding: 24,
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid #334155",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                fontSize: 18,
              }}
            >
              ⚡
            </div>
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: 2,
                }}
              >
                Page Quality Report
              </h3>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                Performance • Accessibility • Best Practices • SEO
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                background: loading
                  ? "#64748b"
                  : anyError
                  ? "#ef4444"
                  : "#22c55e",
                color: "#fff",
                textTransform: "uppercase" as const,
                letterSpacing: "0.5px",
                boxShadow: loading
                  ? "0 2px 8px #64748b40"
                  : anyError
                  ? "0 2px 8px #ef444440"
                  : "0 2px 8px #22c55e40",
              }}
            >
              {loading ? "Analyzing..." : anyError ? "Error" : "Complete"}
            </div>

            {reportUrl && !anyError && (
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#fff",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  padding: "8px 16px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 12,
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 12px #3b82f630",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px #3b82f640";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px #3b82f630";
                }}
              >
                View Full Report →
              </a>
            )}
          </div>
        </div>

        <div
          style={{
            background: "#33415530",
            color: "#34D399",
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 500,
            fontSize: 13,
            marginBottom: 18,
            display: "inline-block",
          }}
        >
          <span role="img" aria-label="info" style={{ marginRight: 6 }}>
            ℹ️
          </span>
          Please make sure your site is <b>published</b> and up to date. This
          section analyzes the latest published version.
        </div>

        {anyError ? (
          <div
            style={{
              background: "#ef444420",
              border: "1px solid #ef444440",
              borderRadius: 12,
              padding: 20,
              textAlign: "center" as const,
              color: "#fca5a5",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
              {typeof anyError === "string"
                ? anyError
                : "Failed to fetch PageSpeed results. Please try again."}
            </p>
          </div>
        ) : (
          <>
            <DeviceScoreSection
              device="Mobile"
              icon="📱"
              animatedScores={animatedMobileScores}
              realScores={mobileScores ?? null}
              loading={loadingMobile}
            />
            <DeviceScoreSection
              device="Desktop"
              icon="🖥️"
              animatedScores={animatedDesktopScores}
              realScores={desktopScores ?? null}
              loading={loadingDesktop}
            />
            <div
              style={{
                background: "linear-gradient(135deg, #1e293b20, #0f172a20)",
                borderRadius: 12,
                padding: 20,
                border: "1px solid #334155",
                minHeight: 180,
              }}
            >
              <h4
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  margin: "0 0 20px 0",
                  color: "#60a5fa",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                🔍 Detailed Analysis
              </h4>
              {detailedLoading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    color: "#9ca3b8",
                    minHeight: 60,
                  }}
                >
                  <Spinner />
                  <span>Analyzing detailed audits...</span>
                </div>
              ) : (
                <>
                  {responsiveAllPassed && (
                    <div
                      style={{
                        background: "#22c55e20",
                        color: "#22c55e",
                        borderRadius: 8,
                        padding: "10px 16px",
                        fontWeight: 600,
                        marginBottom: 18,
                        display: "inline-block",
                      }}
                    >
                      🎉 All responsive checks passed!
                    </div>
                  )}

                  {Object.entries(auditGroups).map(([group, audits]) => (
                    <AuditGroupSection
                      key={group}
                      title={group
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                      audits={audits}
                      getAuditStatusWithDesc={getAuditStatusWithDesc}
                    />
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}