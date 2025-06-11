import { framer } from "framer-plugin";
import type { CheckResult } from "../types";
import type { FrameNode } from "framer-plugin";

export const missingStacksCheck = {
  id: "missing-stacks",
  title: "Missing Stack Layouts",
  category: "Layout",
  run: async (): Promise<CheckResult> => {
    const frames = (await framer.getNodesWithType("FrameNode")) as FrameNode[];

    const ignoreNames = ["desktop", "stack", "page", "wrapper", "container", "layout", "frame", "phone", "tablet", "mobile"];

    const nonStackFrames = frames.filter((frame) => {
      const layoutMode = (frame as any).layoutMode;
      const name = (frame.name || "").toLowerCase();

      const isIgnored = ignoreNames.some((n) => name === n);
      return !isIgnored && layoutMode !== "horizontal" && layoutMode !== "vertical";
    });

    const details: string[] = [];

    if (nonStackFrames.length > 0) {
      details.push("⚠️ Some frames are missing Stack layouts. Use `layoutMode` for layout consistency.");
      const sampleFrames = nonStackFrames.slice(0, 5).map((f) => `• "${f.name || f.id}"`);
      details.push("Examples of frames without layout mode:");
      details.push(...sampleFrames);
    }

    return {
      id: "missing-stacks",
      title: "Missing Stack Layouts",
      status: nonStackFrames.length > 0 ? "warning" : "pass",
      details,
    };
  },
};
