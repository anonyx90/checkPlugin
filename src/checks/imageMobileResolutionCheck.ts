import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const imageMobileResolutionCheck = {
  id: "image-mobile-resolution-check",
  title: "Phone Image Resolution Set to Auto (Lossless)",
  category: "Assets",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const wrongRes: Map<string, Set<string>> = new Map();

    for (const frame of frames) {
      const name = frame.name || frame.id;

      // ✅ Only check mobile/phone-named frames
      const isMobile = name.toLowerCase().includes("phone") || name.toLowerCase().includes("mobile");
      if (!isMobile) continue;

      const bg = (frame as any).backgroundImage;
      if (bg && typeof bg === "object") {
        const res = String(bg.resolution ?? "not set").toLowerCase();
        if (res !== "auto" && res !== "auto(lossless)") {
          if (!wrongRes.has(res)) wrongRes.set(res, new Set());
          wrongRes.get(res)!.add(name);
        }
      }
    }

    const details: string[] = [];
    wrongRes.forEach((names, res) => {
      details.push(
        `🖼️ ${names.size} phone frame(s) have resolution "${res}" — should be "Auto(Lossless)"`
      );
      details.push(
        Array.from(names).map(n => `- "${n}"`).join("\n")
      );
    });

    if (details.length > 0) {
      details.push("\nTip: For phone breakpoints, set image resolution to 'Auto(Lossless)' to ensure crisp quality.");
    }

    return {
      id: "image-mobile-resolution-check",
      title: "Phone Image Resolution Set to Auto (Lossless)",
      status: details.length > 0 ? "warning" : "pass",
      details,
    };
  },
};
