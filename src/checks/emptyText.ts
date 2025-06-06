import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const emptyTextCheck = {
  id: "empty-text",
  title: "Text Layers Are Not Empty",
  category: "UI",
  run: async (): Promise<CheckResult> => {
    const nodes = await framer.getNodesWithType("TextNode");
    const issues: string[] = [];

    for (const node of nodes) {
      const text = await node.getText();
      if (!text || text.trim() === "") {
        issues.push("❌ Empty Text Layer — remove or fill with meaningful content.");
      }
    }

    return {
      id: "empty-text",
      title: "Text Layers Are Not Empty",
      status: issues.length > 0 ? "fail" : "pass",
      details: issues,
    };
  },
};
