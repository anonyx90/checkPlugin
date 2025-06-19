import { framer } from "framer-plugin";
import { Check } from "../types";

async function isURLReachable(url: string): Promise<boolean> {
  try {
    const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let res = await fetch(proxyUrl, { method: "HEAD", signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) return true;

    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 5000);

    res = await fetch(proxyUrl, { method: "GET", signal: controller2.signal });
    clearTimeout(timeout2);

    return res.ok;
  } catch (err) {
    console.warn(`Fetch error for ${url}:`, err);
    return false;
  }
}

export const linkValidationCheck: Check = {
  id: "https-link-check",
  title: "Detect & Validate https Links",
  category: "Links",
  run: async () => {
    const nodes = await framer.getNodesWithType("TextNode");

    const linkMap = new Map<string, Set<string>>();

    for (const node of nodes) {
      const text = await node.getText();
      if (!text) continue;

      const words = text.split(/\s+/);
      for (const word of words) {
        if (word.toLowerCase().startsWith("https")) {
          if (!linkMap.has(word)) linkMap.set(word, new Set());
          linkMap.get(word)!.add(node.name || node.id);
        }
      }
    }

    if (linkMap.size === 0) {
      return {
        id: "https-link-check",
        title: "Detect & Validate https Links",
        status: "pass",
        details: ["✅ No https links found in text nodes."],
      };
    }

    const brokenLinks: string[] = [];
    const reachableLinks: string[] = [];

    for (const [link, nodeNames] of linkMap.entries()) {
      const reachable = await isURLReachable(link);
      const nodesList = [...nodeNames].map(n => `"${n}"`).join(", ");

      if (!reachable) {
        brokenLinks.push(`❌ ${nodesList} → ${link}`);
      } else {
        reachableLinks.push(`✔️ ${nodesList} → ${link}`);
      }
    }

    const details = [
      `🔗 Total unique https links found: ${linkMap.size}`,
      "",
      "Links found:",
      ...reachableLinks,
    ];

    if (brokenLinks.length > 0) {
      details.push("");
      details.push(`⚠️ Found ${brokenLinks.length} broken/unreachable link(s):`);
      details.push(...brokenLinks);
      return {
        id: "https-link-check",
        title: "Detect & Validate https Links",
        status: "warning",
        details,
      };
    }

    return {
      id: "https-link-check",
      title: "Detect & Validate https Links",
      status: "pass",
      details,
    };
  },
};
