import { framer } from "framer-plugin";
import { Check } from "../types";

// Helper to normalize names for comparison
function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Optionally, add aliases for common style names
const styleAliases: Record<string, string[]> = {
  "heading1": ["h1"],
  "heading2": ["h2"],
  "heading3": ["h3"],
  "heading4": ["h4"],
  "heading5": ["h5"],
  "heading6": ["h6"],
};

export const unusedStylesCheck: Check = {
  id: "unused-styles",
  title: "Unused Text/Color Styles",
  category: "Assets",
  run: async () => {
    const textNodes = await framer.getNodesWithType?.("TextNode") || [];
    const frameNodes = await framer.getNodesWithType?.("FrameNode") || [];
    const allNodes = [...textNodes, ...frameNodes];

    const textStyles = await framer.getTextStyles?.() || [];
    const colorStyles = await framer.getColorStyles?.() || [];

    // Collect all text content and node names for fuzzy matching
    const allText = new Set<string>();
    for (const node of allNodes) {
      if ((node as any).name) allText.add(normalize((node as any).name));
      if ((node as any).getText) {
        const text = await (node as any).getText();
        if (text) allText.add(normalize(text));
      }
    }

    // Fuzzy match: consider a style used if its normalized name or alias appears in any node name or text
    const unusedTextStyles = textStyles.filter((style: any) => {
      const normStyle = normalize(style.name);
      const aliases = styleAliases[normStyle] || [];
      const allPossible = [normStyle, ...aliases];
      return !Array.from(allText).some(t =>
        allPossible.some(alias => t.includes(alias))
      );
    });

    const unusedColorStyles = colorStyles.filter((style: any) => {
      const normStyle = normalize(style.name);
      return !Array.from(allText).some(t => t.includes(normStyle));
    });

    const details: string[] = [];
    if (unusedTextStyles.length > 0)
      details.push(`Unused Text Styles (by fuzzy/alias match): ${unusedTextStyles.map((s: any) => s.name).join(", ")}`);
    if (unusedColorStyles.length > 0)
      details.push(`Unused Color Styles (by fuzzy match): ${unusedColorStyles.map((s: any) => s.name).join(", ")}`);

    if (details.length === 0) details.push("All styles appear to be used (by fuzzy/alias match).");

    return {
      id: "unused-styles",
      title: "Unused Text/Color Styles",
      status: details.length > 1 ? "warning" : "pass",
      details,
    };
  },
};