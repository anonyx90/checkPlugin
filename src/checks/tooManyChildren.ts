import { framer } from "framer-plugin";
import { Check } from "../types";

export const tooManyChildrenCheck: Check = {
  id: "too-many-children",
  title: "Too Many Children in Frame/Page",
  category: "Structure",
  run: async () => {
    const frames = await framer.getNodesWithType("FrameNode");
    const offenders: string[] = [];

    for (const frame of frames) {
      const children = await framer.getChildren(frame.id);
      if (children.length > 100) {
        offenders.push(`${frame.name || frame.id} (${children.length} children)`);
      }
    }

    return {
      id: "too-many-children",
      title: "Too Many Children in Frame/Page",
      status: offenders.length > 0 ? "warning" : "pass",
      details: offenders.length > 0
        ? [`Frames/pages with more than 100 children:`, ...offenders]
        : ["No frames or pages have more than 100 children."],
    };
  },
};