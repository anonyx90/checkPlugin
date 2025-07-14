import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const lockedImagesCheck = {
  id: "locked-images",
  title: "Locked Images Check",
  category: "Assets",
  run: async (): Promise<CheckResult> => {
    const frameNodes = (await framer.getNodesWithType("FrameNode")) || [];
    // const svgNodes = (await framer.getNodesWithType("SVGNode")) || [];

    const grouped: Record<string, { url?: string; type: string; names: string[] }> = {};

    for (const frame of frameNodes) {
      const bg = frame.backgroundImage;
      if (bg && !frame.locked) {
        const url = bg.url || bg.thumbnailUrl || "";
        const key = `url:${url}|type:Frame background`;
        if (!grouped[key]) {
          grouped[key] = { url, type: "Frame background", names: [] };
        }
        grouped[key].names.push(frame.name || frame.id);
      }
    }

    const details: (string | JSX.Element)[] = [];
    const uniqueTotal = Object.keys(grouped).length;
    if (uniqueTotal > 0) {
      details.push(`🔓 ${uniqueTotal} unlocked images/SVGs found (grouped):`);
      Object.values(grouped).forEach(({ url, type, names }) => {
        const namePreview = names.slice(0, 3).join(", ") + (names.length > 3 ? ", ..." : "");
        if (url) {
          details.push(
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
             
            >
              {url}
            </a>
          );
          // Optionally, add the type info after the link:
          details.push(` (${type})`);
        } else {
          details.push(`- ${namePreview} (${type})`);
        }
      });
    }

    return {
      id: "locked-images",
      title: "Locked Images Check",
      status: details.length > 0 ? "warning" : "pass",
      details,
    };
  },
};
