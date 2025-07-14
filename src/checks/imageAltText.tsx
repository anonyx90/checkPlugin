import { framer } from "framer-plugin";
import type { CheckResult } from "../types";
import React from "react";

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
        }
      }
    }

    const details: (string | React.ReactElement)[] = [];
    const uniqueTotal = missingAltMap.size;
    
    if (uniqueTotal > 0) {
      details.push(
        React.createElement("strong", null, 
          `❌ ${uniqueTotal} image${uniqueTotal > 1 ? "s" : ""} missing alt text:`
        )
      );
      
      missingAltMap.forEach(({ name, url }, key) => {
        if (url) {
          details.push(
            React.createElement("div", { key },
              "• ",
              React.createElement("a", { 
                href: url, 
                target: "_blank", 
                rel: "noopener noreferrer" 
              }, url) // Display URL instead of name
            )
          );
        } else {
          details.push(
            React.createElement("div", { key }, `• ${name} (no URL available)`)
          );
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