import { framer } from "framer-plugin";
import { Check } from "../types";

const placeholderPhrases = [
  "lorem ipsum", "placeholder", "sample text", "your text", "dummy text",
  "enter text", "replace this", "edit me", "text here",
];

  const pages = await framer.getNodesWithType("WebPageNode");
  console.group("📱 WebPageNode info");
  for (const page of pages) {
    console.log("Page:", {
      id: page.id,

    });
  }
  console.groupEnd();

  const frames = await framer.getNodesWithType("FrameNode");
  console.group("🧱 FrameNode Sizes");
  frames.slice(0, 10).forEach((node) => {
    console.log(`"${node.name}"`, {
      width: node.width,
      height: node.height,

    });
  });
  console.groupEnd();

const normalizeText = (text: string) =>
  text.toLowerCase().replace(/\s+/g, " ").trim();

export const placeholderTextCheck: Check = {
  id: "placeholder-text",
  title: "No Placeholder Text",
  category: "Links",
  run: async () => {
    const nodes = await framer.getNodesWithType("TextNode");
     const textNodes = await framer.getNodesWithType("TextNode");
    console.log('textNodes',textNodes)
    const frameNodes = await framer.getNodesWithType("FrameNode");
    console.log('frameNodes',frameNodes);
    const svgNodes = await framer.getNodesWithType("SVGNode");
    console.log('svgNodes',svgNodes);
    const componentInstanceNodes = await framer.getNodesWithType("ComponentInstanceNode");
    console.log('componentInstanceNodes',componentInstanceNodes);
    const webPageNodes = await framer.getNodesWithType("WebPageNode");
    console.log('webPageNodes',webPageNodes);
    const componentNodes = await framer.getNodesWithType("ComponentNode");
    console.log('componentNodes',componentNodes);
    const issues: string[] = [];
    for (const node of nodes) {
      const text = await node.getText();
      if (!text) continue;
      const norm = normalizeText(text);
      if (placeholderPhrases.some((p) => norm.includes(p))) {
        issues.push(`❌ Placeholder detected: “${text.slice(0, 40)}${text.length > 40 ? "…" : ""}”`);
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
