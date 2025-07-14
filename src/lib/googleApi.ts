export type Scores = {
  performance: string;
  accessibility: string;
  bestPractices: string;
  seo: string;
};

const PAGESPEED_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const API_KEY = "AIzaSyBdpa3Yf3bn9fuLKXJrFLxzhTg-FodUpfQ"; 



function safeAudit(audits: Record<string, any>, key: string) {
  return audits[key] || { score: null, title: key, description: "", scoreDisplayMode: "notApplicable" };
}


export async function lighthouseapi(url: string, strategy: "mobile" | "desktop"): Promise<Scores> {
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


export async function getLighthouseAudits(url: string): Promise<{
  audits: Record<string, any>,
  meta: {
    url?: string;
    fetchTime?: string;
    userAgent?: string;
    timing?: { total?: number };
    config?: { locale?: string; formFactor?: string; throttlingMethod?: string };
    categories?: Record<string, { score: number; title: string }>;
    environment?: any;
    runWarnings?: string[];
  };
}> {
  const apiUrl = `${PAGESPEED_API}?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo&key=${API_KEY}`;
  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      throw new Error(`Failed to fetch PageSpeed audits: ${resp.status} ${resp.statusText}`);
    }
    const data = await resp.json();
    const audits = data.lighthouseResult?.audits ?? {};
    const meta = {
      url: data.lighthouseResult?.finalUrl,
      fetchTime: data.lighthouseResult?.fetchTime,
      userAgent: data.lighthouseResult?.userAgent || data.lighthouseResult?.environment?.hostUserAgent,
      timing: data.lighthouseResult?.timing,
      config: data.lighthouseResult?.configSettings,
      categories: data.lighthouseResult?.categories,
      environment: data.lighthouseResult?.environment,
      runWarnings: data.lighthouseResult?.runWarnings,
    };

    return {
      audits: {
     
        viewport: safeAudit(audits, "viewport"),
        "font-size": safeAudit(audits, "font-size"),
        "uses-responsive-images": safeAudit(audits, "uses-responsive-images"),
        "modern-image-formats": safeAudit(audits, "modern-image-formats"),
        "uses-optimized-images": safeAudit(audits, "uses-optimized-images"),
        "content-width": safeAudit(audits, "content-width"),
        "tap-targets": safeAudit(audits, "tap-targets"),
        "image-aspect-ratio": safeAudit(audits, "image-aspect-ratio"),
        "uses-rel-preload": safeAudit(audits, "uses-rel-preload"),
        "layout-shift-elements": safeAudit(audits, "layout-shift-elements"),

        // --- Performance ---
        "first-contentful-paint": safeAudit(audits, "first-contentful-paint"),
        "largest-contentful-paint": safeAudit(audits, "largest-contentful-paint"),
        "largest-contentful-paint-element": safeAudit(audits, "largest-contentful-paint-element"),
        "speed-index": safeAudit(audits, "speed-index"),
        "total-blocking-time": safeAudit(audits, "total-blocking-time"),
        "cumulative-layout-shift": safeAudit(audits, "cumulative-layout-shift"),
        interactive: safeAudit(audits, "interactive"),
        "server-response-time": safeAudit(audits, "server-response-time"),
        "efficient-animated-content": safeAudit(audits, "efficient-animated-content"),
        "uses-text-compression": safeAudit(audits, "uses-text-compression"),
        "uses-webp-images": safeAudit(audits, "uses-webp-images"),

        // --- Accessibility ---
        "color-contrast": safeAudit(audits, "color-contrast"),
        "image-alt": safeAudit(audits, "image-alt"),
        "document-title": safeAudit(audits, "document-title"),
        "html-has-lang": safeAudit(audits, "html-has-lang"),
        "aria-allowed-attr": safeAudit(audits, "aria-allowed-attr"),
        "aria-hidden-body": safeAudit(audits, "aria-hidden-body"),
        accesskeys: safeAudit(audits, "accesskeys"),
        "heading-order": safeAudit(audits, "heading-order"),
        "link-name": safeAudit(audits, "link-name"),
        "label": safeAudit(audits, "label"),
        "tabindex": safeAudit(audits, "tabindex"),

        // --- Best Practices ---
        "uses-http2": safeAudit(audits, "uses-http2"),
        "no-vulnerable-libraries": safeAudit(audits, "no-vulnerable-libraries"),
        "uses-long-cache-ttl": safeAudit(audits, "uses-long-cache-ttl"),
        "errors-in-console": safeAudit(audits, "errors-in-console"),
        "image-size-responsive": safeAudit(audits, "image-size-responsive"),

        // --- SEO ---
        "meta-description": safeAudit(audits, "meta-description"),
        "hreflang": safeAudit(audits, "hreflang"),
        canonical: safeAudit(audits, "canonical"),
        "robots-txt": safeAudit(audits, "robots-txt"),
        "font-display": safeAudit(audits, "font-display"),
        "structured-data": safeAudit(audits, "structured-data"),

      
      },
      meta,
    };
  } catch (error) {
    console.error("Error fetching Lighthouse audits:", error);
    return { audits: {}, meta: {} };
  }
}
