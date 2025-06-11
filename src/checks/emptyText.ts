import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const emptyTextCheck = {
  id: "empty-text",
  title: "Text Layers Are Not Empty or Too Short",
  category: "UI",

  run: async (): Promise<CheckResult> => {
    const nodes = await framer.getNodesWithType("TextNode");
    const issues: string[] = [];

    for (const node of nodes) {
      const text = await node.getText();
      const trimmed = text?.trim() ?? "";

      if (trimmed === "") {
        issues.push(`❌ Empty text in layer "${node.name || node.id}" — fill with meaningful content.`);
      } else if (trimmed.length <= 2) {
        issues.push(`⚠️ Very short text (“${trimmed}”) in layer "${node.name || node.id}" — consider expanding.`);
      }
    }

    return {
      id: "empty-text",
      title: "Text Layers Are Not Empty or Too Short",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
