import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const autoImageResolution = {
  id: "auto-image-resolution",
  title: "Image Resolution Set to Auto",
  category: "Assets",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");

    // Group issues by type and resolution value, using URL as key if available
    const missingRes: Record<string, { names: string[]; url?: string }> = {};
    const wrongRes: Record<string, Record<string, { names: string[]; url?: string }>> = {};

    for (const frame of frames) {
      const bg = (frame as any).backgroundImage;
      const name = frame.name || frame.id;
      const url = bg?.url || bg?.thumbnailUrl;
      if (bg && typeof bg === "object") {
        if (!("resolution" in bg)) {
          const key = url || name;
          if (!missingRes[key]) missingRes[key] = { names: [], url };
          missingRes[key].names.push(name);
        } else if (bg.resolution !== "auto") {
          const res = String(bg.resolution);
          const key = url || name;
          if (!wrongRes[res]) wrongRes[res] = {};
          if (!wrongRes[res][key]) wrongRes[res][key] = { names: [], url };
          wrongRes[res][key].names.push(name);
        }
      }
    }

    const details: string[] = [];

    const missingKeys = Object.keys(missingRes);
    if (missingKeys.length > 0) {
      details.push(`🖼️ ${missingKeys.length} unique image(s) have no resolution property set:`);
      missingKeys.forEach(key => {
        const { names, url } = missingRes[key];
        const namePreview = names.slice(0, 3).join(", ") + (names.length > 3 ? ", ..." : "");
        if (url) {
          details.push(`- [${namePreview}](${url})`);
        } else {
          details.push(`- ${namePreview}`);
        }
      });
    }

    Object.entries(wrongRes).forEach(([res, group]) => {
      const groupKeys = Object.keys(group);
      details.push(`🖼️ ${groupKeys.length} unique image(s) have resolution "${res}" — should be set to "auto":`);
      groupKeys.forEach(key => {
        const { names, url } = group[key];
        const namePreview = names.slice(0, 3).join(", ") + (names.length > 3 ? ", ..." : "");
        if (url) {
          details.push(`- [${namePreview}](${url})`);
        } else {
          details.push(`- ${namePreview}`);
        }
      });
    });

    if (details.length > 0) {
      details.push("\nTip: Setting image resolution to 'auto' ensures best quality and performance.");
    }

    return {
      id: "auto-image-resolution",
      title: "Image Resolution Set to Auto",
      status: details.length > 0 ? "warning" : "pass",
      details,
    };
  },
};