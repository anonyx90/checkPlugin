import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

// Framer default/common names to ignore in grouping
const FRAMER_DEFAULTS = [
  "desktop", "tablet", "phone", "mobile", "container", "frame", "image", "text", "icon", "overlay"
];

function isMostlyDefaults(names: string[]) {
  // If more than half the names are Framer defaults, consider it a default group
  const lowerNames = names.map(n => (n || "").toLowerCase());
  const defaultCount = lowerNames.filter(n => FRAMER_DEFAULTS.includes(n)).length;
  return defaultCount / names.length > 0.5;
}

export const reusableContentCheck = {
  id: "reusable-content",
  title: "Repetitive Elements Should Be Components",
  category: "Accessibility",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const structureMap = new Map<string, { count: number; frames: string[] }>();

    for (const frame of frames) {
      const children = await framer.getChildren(frame.id);

      const signature = children
        .map((child) => {
          const type = "type" in child ? child.type : "unknown";
          const name = "name" in child ? child.name : "unnamed";
          return `${type}:${name}`;
        })
        .join("|");

      if (!structureMap.has(signature)) {
        structureMap.set(signature, { count: 1, frames: [frame.name || frame.id] });
      } else {
        const entry = structureMap.get(signature)!;
        entry.count += 1;
        entry.frames.push(frame.name || frame.id);
      }
    }

    // Only show repeating structures (3 or more) and not mostly Framer defaults
    const repeating = [...structureMap.entries()].filter(
      ([, v]) => v.count >= 3 && !isMostlyDefaults(v.frames)
    );

    const details: string[] = [];
    if (repeating.length > 0) {
      details.push("⚠️ This project contains multiple similar frames. Consider converting them into reusable components.");
      repeating.forEach(([, { count, frames }]) => {
        details.push(
          `- ${count} frames with similar structure: [${frames.slice(0, 5).join(", ")}${frames.length > 5 ? ", ..." : ""}]`
        );
      });
    }

    return {
      id: "reusable-content",
      title: "Repetitive Elements Should Be Components",
      status: repeating.length > 0 ? "warning" : "pass",
      details,
    };
  },
};