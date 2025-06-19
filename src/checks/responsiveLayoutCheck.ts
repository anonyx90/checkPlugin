import { framer } from "framer-plugin";
import { CheckResult } from "../types";

const PAGESPEED_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const API_KEY = "AIzaSyCS1tJ-J93koSg8982oBdOVY1euPDW-d8k";

type Audit = {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode?: string;
  details?: {
    items?: any[];
  };
};



async function getLighthouseAudits(url: string): Promise<Record<string, Audit | undefined>> {
  const apiUrl = `${PAGESPEED_API}?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo&key=${API_KEY}`;
  
  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      throw new Error(`Failed to fetch PageSpeed audits: ${resp.status} ${resp.statusText}`);
    }

    const data = await resp.json();
    const audits = data.lighthouseResult?.audits ?? {};

    console.log("Lighthouse audits:", audits);

    return {
      viewport: audits["viewport"],
      "tap-targets": audits["tap-targets"],
      "font-size": audits["font-size"],
      "uses-responsive-images": audits["uses-responsive-images"],
      "modern-image-formats": audits["modern-image-formats"],
      "uses-optimized-images": audits["uses-optimized-images"],
      "layout-shift-elements": audits["layout-shift-elements"],
      "cumulative-layout-shift": audits["cumulative-layout-shift"],
      "interactive": audits["interactive"],
      "speed-index": audits["speed-index"],
      "color-contrast": audits["color-contrast"],
      "image-alt": audits["image-alt"],
      "aria-allowed-attr": audits["aria-allowed-attr"],
      "aria-hidden-body": audits["aria-hidden-body"],
      "document-title": audits["document-title"],
      "html-has-lang": audits["html-has-lang"],
      "accesskeys": audits["accesskeys"],
    };
  } catch (error) {
    console.error("Error fetching Lighthouse audits:", error);
    return {
      viewport: undefined,
      "tap-targets": undefined,
      "font-size": undefined,
      "uses-responsive-images": undefined,
      "modern-image-formats": undefined,
      "uses-optimized-images": undefined,
      "layout-shift-elements": undefined,
      "cumulative-layout-shift": undefined,
      "interactive": undefined,
      "speed-index": undefined,
      "color-contrast": undefined,
      "image-alt": undefined,
      "aria-allowed-attr": undefined,
      "aria-hidden-body": undefined,
      "document-title": undefined,
      "html-has-lang": undefined,
      "accesskeys": undefined,
    };
  }
}

function formatAudit(audit: Audit | undefined, label: string): string {
  if (!audit) return `⚠️ ${label}: Audit data not available`;
  if (audit.scoreDisplayMode === "notApplicable") return `ℹ️ ${label}: Not applicable`;
  if (audit.scoreDisplayMode === "error") return `❌ ${label}: Failed to run`;

  const score = audit.score;
  let status = "⚠️ Needs improvement";
  if (score === 1) status = "✅ Passed";
  else if (typeof score === "number") status = `⚠️ Needs improvement (${Math.round(score * 100)}%)`;

  return `${status} — ${label}: ${audit.title}`;
}

export const responsiveLayoutCheck = {
  id: "responsive-layout",
  title: "Responsive Layout & Accessibility Check",
  category: "Layout",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const problematicNames: string[] = [];

    const skipNames = ["logo", "icon", "avatar", "badge", "dot", "circle"];

    for (const frame of frames) {
      const name = frame.name || frame.id;
      const nameLower = name.toLowerCase();

      if (skipNames.some((skip) => nameLower.includes(skip))) continue;

      const fixedWidth = (frame as any).fixedWidth;
      const fixedHeight = (frame as any).fixedHeight;
      const pins = (frame as any).pins;

      const hasIssues =
        fixedWidth ||
        fixedHeight ||
        !(pins?.left && pins?.right) ||
        !(pins?.top && pins?.bottom);

      if (hasIssues) {
        problematicNames.push(name);
      }
    }

    const details: string[] = [];

    if (problematicNames.length > 0) {
      const count = problematicNames.length;
      const sample = problematicNames.slice(0, 5).join(", ");
      details.push(`⚠️ ${count} layers have layout issues like fixed size or missing pins.`);
      details.push(`⚠️ Examples: ${sample}${count > 5 ? ", ..." : ""}`);
    }

    try {
      const publishInfo = await framer.getPublishInfo();
      const url = publishInfo.staging?.url;

      if (url) {
        const audits = await getLighthouseAudits(url);

        details.push("");
        details.push("📱 **Mobile Viewport Accessibility (Lighthouse):**");
        details.push(formatAudit(audits.viewport, "Viewport"));
        details.push(formatAudit(audits["tap-targets"], "Tap Targets"));
        details.push(formatAudit(audits["font-size"], "Text Size"));

        details.push("");
        details.push("🖼 **Responsive Images & Media:**");
        details.push(formatAudit(audits["uses-responsive-images"], "Responsive Images"));
        details.push(formatAudit(audits["modern-image-formats"], "Modern Image Formats"));
        details.push(formatAudit(audits["uses-optimized-images"], "Properly Sized Images"));

        details.push("");
        details.push("📐 **Layout Stability & Performance:**");
        details.push(formatAudit(audits["layout-shift-elements"], "Layout Shift Elements"));
        details.push(formatAudit(audits["cumulative-layout-shift"], "Cumulative Layout Shift"));
        details.push(formatAudit(audits["interactive"], "Time to Interactive"));
        details.push(formatAudit(audits["speed-index"], "Speed Index"));

        details.push("");
        details.push("♿ **Accessibility Checks:**");
        details.push(formatAudit(audits["color-contrast"], "Color Contrast"));
        details.push(formatAudit(audits["image-alt"], "Image Alt Text"));
        details.push(formatAudit(audits["aria-allowed-attr"], "ARIA Allowed Attributes"));
        details.push(formatAudit(audits["aria-hidden-body"], "ARIA Hidden Body"));
        details.push(formatAudit(audits["document-title"], "Document Title"));
        details.push(formatAudit(audits["html-has-lang"], "HTML Language Attribute"));
        details.push(formatAudit(audits["accesskeys"], "Access Keys"));
      } else {
        details.push("ℹ️ Publish site to staging to check mobile responsiveness and accessibility.");
      }
    } catch (err) {
      details.push("⚠️ Could not fetch PageSpeed mobile audit (API error).");
      console.error("Error fetching PageSpeed audits:", err);
    }

    return {
      id: "responsive-layout",
      title: "Responsive Layout & Accessibility Check",
      status: details.some((d) => d.includes("⚠️")) ? "warning" : "pass",
      details,
    };
  },
};

export type { CheckResult } from "../types";
