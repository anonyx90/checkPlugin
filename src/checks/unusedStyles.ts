import { framer } from "framer-plugin";
import { Check } from "../types";

export const unusedStylesCheck: Check = {
  id: "unused-styles",
  title: "Unused Text/Color Styles",
  category: "UI",
  run: async () => {
    // Get all text and frame nodes (add more types if needed)
    const textNodes = await framer.getNodesWithType?.("TextNode") || [];
    const frameNodes = await framer.getNodesWithType?.("FrameNode") || [];
    const allNodes = [...textNodes, ...frameNodes];

    const textStyles = await framer.getTextStyles?.() || [];
    const colorStyles = await framer.getColorStyles?.() || [];

    // Collect all used style IDs
    const usedTextStyleIds = new Set<string>();
    const usedColorStyleIds = new Set<string>();

    for (const node of allNodes) {
      if (
        "textStyleId" in node &&
        typeof node.textStyleId === "string" &&
        node.textStyleId
      ) {
        usedTextStyleIds.add(node.textStyleId);
      }
      if (
        "colorStyleId" in node &&
        typeof node.colorStyleId === "string" &&
        node.colorStyleId
      ) {
        usedColorStyleIds.add(node.colorStyleId);
      }
    }

    const unusedTextStyles = textStyles.filter((style: any) => !usedTextStyleIds.has(style.id));
    const unusedColorStyles = colorStyles.filter((style: any) => !usedColorStyleIds.has(style.id));

    const details: string[] = [];
    if (unusedTextStyles.length > 0)
      details.push(`Unused Text Styles: ${unusedTextStyles.map((s: any) => s.name).join(", ")}`);
    if (unusedColorStyles.length > 0)
      details.push(`Unused Color Styles: ${unusedColorStyles.map((s: any) => s.name).join(", ")}`);

    return {
      id: "unused-styles",
      title: "Unused Text/Color Styles",
      status: details.length > 0 ? "warning" : "pass",
      details: details.length > 0 ? details : ["All styles are used."],
    };
  },
};