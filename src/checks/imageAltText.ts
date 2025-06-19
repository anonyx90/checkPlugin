import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const imageAltTextCheck = {
  id: "image-alt-text",
  title: "All Images Have Alt Text",
  category: "Assets",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    
    const missingAltMap = new Map<string, { name: string; url?: string }>();

    for (const frame of frames) {
      const bg = frame.backgroundImage;
      if (bg && "altText" in bg) {
        if (!bg.altText || bg.altText.trim() === "") {
          const name = frame.name || frame.id;
          const url = bg.url || bg.thumbnailUrl || "";
          const key = url || name; 
          if (!missingAltMap.has(key)) {
            missingAltMap.set(key, { name, url });
          }
          // Optional: keep your debug log if needed
        }
      }
    }

    const details: string[] = [];
    const uniqueTotal = missingAltMap.size;
    if (uniqueTotal > 0) {
      details.push(
        `❌ ${uniqueTotal} image${uniqueTotal > 1 ? "s" : ""} missing alt text:`
      );
      missingAltMap.forEach(({ name, url }) => {
        if (url) {
          details.push(`- [${name}](${url})`);
        } else {
          details.push(`- "${name}"`);
        }
      });
    }

    return {
      id: "image-alt-text",
      title: "All Images Have Alt Text",
      status: details.length > 0 ? "fail" : "pass",
      details,
    };
  },
};