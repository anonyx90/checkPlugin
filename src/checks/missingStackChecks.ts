import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const missingStacksCheck = {
  id: "missing-stacks",
  title: "Missing Stack Layouts",
  category: "Layout",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const likelyStacks = frames.filter((f) =>
      f.name?.toLowerCase().includes("stack")
    );
    const details: string[] = [];

    if (likelyStacks.length === 0) {
      details.push(
        "⚠️ No Stack layout (heuristically) found. Use stacks for layout consistency."
      );
    }
    const nonStackFrames = frames
      .filter((f) => !f.name?.toLowerCase().includes("stack"))
      .slice(0, 5)
      .map((f) => `• "${f.name || f.id}"`);

    if (likelyStacks.length === 0 && nonStackFrames.length > 0) {
      details.push("Examples of frames that might benefit from stacks:");
      details.push(...nonStackFrames);
    }

    return {
      id: "missing-stacks",
      title: "Missing Stack Layouts",
      status: likelyStacks.length > 0 ? "pass" : "warning",
      details,
    };
  },
};
