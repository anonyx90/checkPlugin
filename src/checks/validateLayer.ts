import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

const RESERVED_WORDS = ["text", "frame", "rectangle", "group", "component"];

export const layerNamingCheck = {
  id: "naming-conventions",
  title: "Layer Naming Conventions",
  category: "Accessibility",
  run: async (): Promise<CheckResult> => {
    const allNodes = [
      ...(await framer.getNodesWithType("FrameNode") || []),
      ...(await framer.getNodesWithType("TextNode") || []),
      ...(await framer.getNodesWithType("ComponentNode") || []),
      ...(await framer.getNodesWithType("SVGNode") || []),
    ];

    // Use a Set to group by unique reserved word
    const reservedWordSet = new Set<string>();
    const reservedWordExamples: string[] = [];

    for (const node of allNodes) {
      const name = (node as any).name || "";
      const nameTrimmed = name.trim();

      // Reserved word check (case-insensitive, exact match)
      const lower = nameTrimmed.toLowerCase();
      if (RESERVED_WORDS.includes(lower)) {
        reservedWordSet.add(lower);
        if (!reservedWordExamples.includes(name)) {
          reservedWordExamples.push(name);
        }
      }
    }

    const details: string[] = [];
    if (reservedWordSet.size > 0) {
      details.push(
        `⚠️ ${reservedWordSet.size} reserved word${reservedWordSet.size > 1 ? "s" : ""} used as layer name${reservedWordSet.size > 1 ? "s" : ""}`
      );
      details.push(`Examples: "${reservedWordExamples.join('", "')}"`);
    }

    if (details.length > 0) {
  
      details.push("### Naming Guidelines");
      details.push("- Use 3-50 characters");
      details.push(`- Avoid reserved words: ${RESERVED_WORDS.join(", ")}`);
      details.push("- Start with letters, not numbers");
      details.push("- Use only letters, numbers, hyphens, underscores");
    }

    return {
      id: "naming-conventions",
      title: "Layer Naming Conventions",
      status: details.length > 0 ? "warning" : "pass",
      details,
    };
  },
};