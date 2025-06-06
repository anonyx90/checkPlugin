import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const responsiveLayoutCheck = {
  id: "responsive-layout",
  title: "Responsive Layout Check",
  category: "Layout",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const problematicNames: string[] = [];

    const skipNames = ["logo", "icon", "avatar", "badge", "dot", "circle"];

    for (const frame of frames) {
      const name = frame.name || frame.id;
      const nameLower = name.toLowerCase();

      if (skipNames.some((skip) => nameLower.includes(skip))) continue;

      const fixedWidth = (frame as any).fixedWidth;
      const fixedHeight = (frame as any).fixedHeight;
      const pins = (frame as any).pins;

      const hasIssues =
        fixedWidth ||
        fixedHeight ||
        !(pins?.left && pins?.right) ||
        !(pins?.top && pins?.bottom);

      if (hasIssues) {
        problematicNames.push(name);
      }
    }

    const details: string[] = [];

    if (problematicNames.length > 0) {
      const count = problematicNames.length;
      const sample = problematicNames.slice(0, 5).join(", ");
      details.push(
        `⚠️ ${count} layers have layout issues like fixed size or missing pins.`
      );
      details.push(`⚠️ Examples: ${sample}${count > 5 ? ", ..." : ""}`);
    }

    return {
      id: "responsive-layout",
      title: "Responsive Layout Check",
      status: problematicNames.length > 0 ? "warning" : "pass",
      details,
    };
  },
};
