import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const emptyTextCheck = {
  id: "empty-text",
  title: "Text Layers Should Not Be Empty",
  category: "Accessibility",

  run: async (): Promise<CheckResult> => {
    const nodes = await framer.getNodesWithType("TextNode");

    let emptyCount = 0;

    for (const node of nodes) {
      const text = await node.getText();
      const trimmed = text?.replace(/[\s\u200B-\u200D\uFEFF]/g, "") ?? "";

      if (trimmed === "") {
        emptyCount++;
      }
    }

    const details: string[] = [];

    if (emptyCount > 0) {
      const message = `⚠️ Found ${emptyCount} empty text layer${emptyCount > 1 ? "s" : ""}.`;
      console.log(`⚠️ Text Layers Should Not Be Empty\nWarning\n${message}`);
      details.push(message);
    }

    return {
      id: "empty-text",
      title: "Text Layers Should Not Be Empty",
      status: emptyCount > 0 ? "warning" : "pass",
      details: details.length > 0
        ? details
        : ["✅ All text layers have meaningful content."],
    };
  },
};
