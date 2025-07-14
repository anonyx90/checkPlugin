import { framer } from "framer-plugin";
import { CheckResult } from "../types";


const skipNames = [
  "logo", "icon", "avatar", "badge", "dot", "circle", "divider", "arrow", "chevron", "line", "background"
];

export const responsiveLayoutCheck = {
  id: "responsive-layout",
  title: "Responsive Layout",
  category: "Layout",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const problematicNames: string[] = [];

    for (const frame of frames) {
      const name = frame.name || frame.id;
      const nameLower = name.toLowerCase();

      
      if (skipNames.some((skip) => nameLower.includes(skip))) continue;

      
      const parent = (frame as any).parent;
      if (parent && parent.type === "FrameNode") continue;

      const fixedWidth = (frame as any).fixedWidth;
      const fixedHeight = (frame as any).fixedHeight;
      const pins = (frame as any).pins;
      const widthIssue = fixedWidth && !(pins?.left && pins?.right);
      const heightIssue = fixedHeight && !(pins?.top && pins?.bottom);

      if (widthIssue || heightIssue) {
        problematicNames.push(name);
      }
    }

    const details: string[] = [];

    if (problematicNames.length > 0) {
      const count = problematicNames.length;
      const sample = problematicNames.slice(0, 5).join(", ");
      details.push(
        `Some top-level frames may not be fully responsive (fixed size or not stretched): ${sample}${count > 5 ? ", ..." : ""}`
      );
    }

    return {
      id: "responsive-layout",
      title: "Responsive Layout",
      status: details.length > 0 ? "warning" : "pass",
      details: details.length
        ? details
        : ["No major layout issues detected in top-level frames."],
    };
  },
};

export type { CheckResult } from "../types";