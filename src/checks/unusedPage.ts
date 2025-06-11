import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const unusedPagesCheck = {
  id: "unused-pages",
  title: "Unused Pages Check",
  category: "Pages",
  run: async (): Promise<CheckResult> => {
    const pages = await framer.getNodesWithType("WebPageNode");
    
    const textNodes = await framer.getNodesWithType("TextNode");
    const issues: string[] = [];

    const linkedText = (
      await Promise.all(textNodes.map((node) => node.getText()))
    )
      .join(" ")
      .toLowerCase();

    for (const page of pages) {
      const path = (page as any).path?.toLowerCase?.();
      if (path && !linkedText.includes(path)) {
        issues.push(`⚠️ Page with path "${path}" is not referenced in any text.`);
      }
    }
    console.log(pages)

    return {
      id: "unused-pages",
      title: "Unused Pages Check",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
