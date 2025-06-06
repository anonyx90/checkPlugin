import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const reusableContentCheck = {
  id: "reusable-content",
  title: "Repetitive Elements Should Be Components",
   category: "Accessibility",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const structureMap = new Map<string, number>();

    for (const frame of frames) {
      const children = await framer.getChildren(frame.id);

      const signature = children
        .map((child) => {
          const type = "type" in child ? child.type : "unknown";
          const name = "name" in child ? child.name : "unnamed";
          return `${type}:${name}`;
        })
        .join("|");

      structureMap.set(signature, (structureMap.get(signature) || 0) + 1);
    }

    const isRepeating = [...structureMap.values()].some((count) => count >= 3);

    return {
      id: "reusable-content",
      title: "Repetitive Elements Should Be Components",
      status: isRepeating ? "warning" : "pass",
      details: isRepeating
        ? [
            "⚠️ This project contains multiple similar frames. Consider converting them into reusable components.",
          ]
        : [],
    };
  },
};
