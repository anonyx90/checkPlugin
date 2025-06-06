import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const imageAltTextCheck = {
  id: "image-alt-text",
  title: "All Images Have Alt Text",
    category: "Accessibility",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const issues: string[] = [];

    for (const frame of frames) {
      const bg = frame.backgroundImage;
      if (bg && "altText" in bg) {
        if (!bg.altText || bg.altText.trim() === "") {
          issues.push(`❌ Image in "${frame.name || frame.id}" is missing alt text.`);
        }
      }
    }

    return {
      id: "image-alt-text",
      title: "All Images Have Alt Text",
      status: issues.length > 0 ? "fail" : "pass",
      details: issues,
    };
  },
};
