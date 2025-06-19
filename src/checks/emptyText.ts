import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const emptyTextCheck = {
  id: "empty-text",
  title: "Text Layers Are Not Empty or Too Short",
  category: "Accessibility",

  run: async (): Promise<CheckResult> => {
    const nodes = await framer.getNodesWithType("TextNode");

    
    const emptyLayers = new Set<string>();
    const shortTextMap = new Map<string, Set<string>>(); 

    for (const node of nodes) {
      const text = await node.getText();
      const trimmed = text?.trim() ?? "";
      const name = node.name || node.id;

      if (trimmed === "") {
        emptyLayers.add(name);
      } else if (trimmed.length <= 2) {
        if (!shortTextMap.has(trimmed)) shortTextMap.set(trimmed, new Set());
        shortTextMap.get(trimmed)!.add(name);
      }
    }

    const details: string[] = [];

    if (emptyLayers.size > 0) {
      details.push(
        `❌ Empty text in ${emptyLayers.size} layer(s):\n- ${Array.from(emptyLayers).join(" - ")}`
      );
    }

    
    shortTextMap.forEach((names, shortText) => {
      details.push(
        `⚠️ Very short text (“${shortText}”) in ${names.size} layer(s):\n- ${Array.from(names).join(" - ")}`
      );
    });

    return {
      id: "empty-text",
      title: "Text Layers Are Not Empty or Too Short",
      status: details.length > 0 ? "warning" : "pass",
      details,
    };
  },
};
