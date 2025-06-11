import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const reusableContentByNameCheck = {
  id: "reusable-content-by-name",
  title: "Frames With Duplicate Names",
  category: "Accessibility",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const nameMap = new Map<string, number>();
    const defaultNames = new Set([
      "Stack",
      "Frame",
      "Group",
      "Text",
      "Image",
      "Button",
    ]);

    for (const frame of frames) {
      const name =
        "name" in frame && typeof frame.name === "string"
          ? frame.name.trim()
          : "(unnamed)";

      if (defaultNames.has(name)) continue;

      nameMap.set(name, (nameMap.get(name) || 0) + 1);
    }

    const duplicates = [...nameMap.entries()].filter(([_, count]) => count > 1);
    const duplicateCount = duplicates.length;

    const details = [];
    if (duplicateCount > 0) {
      details.push(`${duplicateCount} duplicate frame name(s) found:`);
      for (const [name, count] of duplicates) {
        details.push(`- "${name}" used ${count} times`);
      }
    }

    return {
      id: "reusable-content-by-name",
      title: "Frames With Duplicate Names",
      status: duplicateCount > 0 ? "warning" : "pass",
      details,
    };
  },
};
