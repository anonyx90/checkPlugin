import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const autoImageResolution = {
  id: "auto-image-resolution",
  title: "Image Resolution Set to Auto",
  category: "Assets",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const issues: string[] = [];

    for (const frame of frames) {
      const bg = (frame as any).backgroundImage;
      if (bg && typeof bg === "object") {
        if (!("resolution" in bg)) {
          issues.push(
            `🖼️ "${frame.name || frame.id}" has no resolution property set.`
          );
        } else if (bg.resolution !== "auto") {
          issues.push(
            `🖼️ "${frame.name || frame.id}" resolution is "${bg.resolution}" — should be set to "auto".`
          );
        }
      }
    }

    return {
      id: "auto-image-resolution",
      title: "Image Resolution Set to Auto",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues.length > 0
        ? [
            ...issues,
            "Tip: Setting image resolution to 'auto' ensures best quality and performance."
          ]
        : [],
    };
  },
};