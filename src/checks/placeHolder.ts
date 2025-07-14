import { framer } from "framer-plugin";
import { Check } from "../types";

const placeholderPhrases = [
  "lorem ipsum", "placeholder", "sample text", "your text", "dummy text",
  "enter text", "replace this", "edit me", "text here",
];

const normalizeText = (text: string) =>
  text.toLowerCase().replace(/\s+/g, " ").trim();

export const placeholderTextCheck: Check = {
  id: "placeholder-text",
  title: "No Placeholder Text",
  category: "Links",
  run: async () => {
    const nodes = await framer.getNodesWithType("TextNode");
    const seen = new Set<string>();
    const issues: string[] = [];

    for (const node of nodes) {
      const text = await node.getText();
      if (!text) continue;
      const norm = normalizeText(text);
      if (placeholderPhrases.some((p) => norm.includes(p))) {
        // Use normalized text as the key to group duplicates
        if (!seen.has(norm)) {
          seen.add(norm);
          issues.push(`❌ Placeholder detected: “${text.slice(0, 40)}${text.length > 40 ? "…" : ""}”`);
        }
      }
    }

    return {
      id: "placeholder-text",
      title: "No Placeholder Text",
      status: issues.length > 0 ? "fail" : "pass",
      details: issues,
    };
  },
};