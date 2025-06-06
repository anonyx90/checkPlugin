import { framer } from "framer-plugin";
import { CheckResult } from "../types";


export const unnamedLayersCheck = {
  id: "unnamed-layers",
  title: "All Design Layers Are Named",
  category: "UI",
  run: async (): Promise<CheckResult> => {
    const all = [
      ...(await framer.getNodesWithType("FrameNode")),
      ...(await framer.getNodesWithType("TextNode")),
      ...(await framer.getNodesWithType("ComponentInstanceNode")),
      ...(await framer.getNodesWithType("SVGNode")),
    ];
    const issues = all
      .filter((n) => !n.name || n.name.trim() === "")
      .map((n) => `❌ ${n.__class} is unnamed. Please name all layers.`);

    return {
      id: "unnamed-layers",
      title: "All Design Layers Are Named",
      status: issues.length > 0 ? "fail" : "pass",
      details: issues,
    };
  },
};
