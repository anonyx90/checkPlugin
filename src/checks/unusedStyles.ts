import { framer } from "framer-plugin";
import { Check } from "../types";

export const unusedStylesCheck: Check = {
  id: "unused-styles",
  title: "Unused Text/Color Styles",
  category: "Assets",
  run: async () => {
    const textNodes = await framer.getNodesWithType?.("TextNode") || [];
    const frameNodes = await framer.getNodesWithType?.("FrameNode") || [];
    const componentNodes = await framer.getNodesWithType?.("ComponentNode") || [];
    const componentInstanceNodes = await framer.getNodesWithType?.("ComponentInstanceNode") || [];

    
    const allNodes = [
      ...textNodes,
      ...frameNodes,
      ...componentNodes,
      ...componentInstanceNodes,
    ];

    const textStyles = await framer.getTextStyles?.() || [];
    const colorStyles = await framer.getColorStyles?.() || [];

    
    const usedTextStyleIds = new Set<string>();
    for (const node of allNodes) {
      if ((node as any).textStyleId) usedTextStyleIds.add((node as any).textStyleId);
      if ((node as any).inlineTextStyle?.id) usedTextStyleIds.add((node as any).inlineTextStyle.id);
    }
    const unusedTextStyles = textStyles.filter((style: any) => !usedTextStyleIds.has(style.id));

    
    const usedColorStyleIds = new Set<string>();
    for (const node of allNodes) {
      if ((node as any).colorStyleId) usedColorStyleIds.add((node as any).colorStyleId);
      if ((node as any).fillStyleId) usedColorStyleIds.add((node as any).fillStyleId);
      if ((node as any).backgroundStyleId) usedColorStyleIds.add((node as any).backgroundStyleId);
    }
    const unusedColorStyles = colorStyles.filter((style: any) => !usedColorStyleIds.has(style.id));

    const details: string[] = [];
    if (unusedTextStyles.length > 0)
      details.push(`Unused Text Styles: ${unusedTextStyles.map((s: any) => s.name).join(", ")}`);
    if (unusedColorStyles.length > 0)
      details.push(`Unused Color Styles: ${unusedColorStyles.map((s: any) => s.name).join(", ")}`);

    if (details.length === 0) {
      details.push("All styles appear to be used (by direct assignment, including inside components).");
    } else {
      details.push(
        "Note: Only direct assignments are detected. Styles used via tokens, overrides, or advanced features may not be detected. Use Framer's Find for full accuracy."
      );
    }

    return {
      id: "unused-styles",
      title: "Unused Text/Color Styles",
      status: details.length > 1 ? "warning" : "pass",
      details,
    };
  },
};