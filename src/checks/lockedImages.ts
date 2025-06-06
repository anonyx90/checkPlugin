import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const lockedImagesCheck = {
  id: "locked-images",
  title: "Images and Graphics Are Locked",
  category: "Assets",
  run: async (): Promise<CheckResult> => {
    const images = await framer.getNodesWithType("FrameNode");
    const issues = images
      .filter((img) => img.backgroundImage && !img.locked)
      .map((img) => `🔓 Image "${img.name || img.id}" is not locked.`);

    return {
      id: "locked-images",
      title: "Images and Graphics Are Locked",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
