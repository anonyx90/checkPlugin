import { framer } from "framer-plugin";

export const imageMobileResolutionCheck = {
  id: "image-mobile-resolution-check",
  title: "Mobile Image Resolution Set to Auto (Lossless)",
  category: "Assets",
  run: async () => {
    const frames = await framer.getNodesWithType("FrameNode");
    const issues: string[] = [];

    for (const frame of frames) {
      const name = (frame.name || "").toLowerCase();
      const width = (frame as any).width ?? 0;
      const isMobile =
        name.includes("mobile") ||
        name.includes("phone") ||
        width <= 480;

      if (!isMobile) continue;

      const bg = (frame as any).backgroundImage;
      if (bg && typeof bg === "object") {
        const res = bg.resolution;
        if (
          res !== "auto" &&
          res !== "Auto(Lossless)"
        ) {
          issues.push(
            `🖼️ Mobile frame "${frame.name || frame.id}" image resolution is "${res ?? "not set"}" — should be set to "Auto(Lossless)".`
          );
        }
      }
    }

    const status: "warning" | "pass" = issues.length > 0 ? "warning" : "pass";

    return {
      id: "image-mobile-resolution-check",
      title: "Mobile Image Resolution Set to Auto (Lossless)",
      status,
      details: issues,
    };
  },
};