import { framer } from "framer-plugin";
import { Check } from "../types";

export const accessibilityTagCheck: Check = {
  id: "accessibility-tags",
  title: "Accessibility Tags",
  category: "Accessibility",

  run: async () => {
    const frameNodes = await framer.getNodesWithType("FrameNode");
    const textNodes = await framer.getNodesWithType("TextNode");

    const missingSection: Set<string> = new Set();
    const missingFooter: Set<string> = new Set();
    const missingNav: Set<string> = new Set();
    const missingHeading: Set<string> = new Set();

    for (const node of frameNodes) {
      const tag = (node as any).tagName?.toLowerCase() || "div";
      const name = (node as any).name || "";
      const nameLower = name.toLowerCase();
      if (nameLower.includes("ignore")) continue;

      if (nameLower.includes("section") && tag === "div") {
        missingSection.add(name);
      }
      if (nameLower.includes("footer") && tag === "div") {
        missingFooter.add(name);
      }
      if (nameLower.includes("nav") && tag === "div") {
        missingNav.add(name);
      }
    }

    for (const node of textNodes) {
      const tag = (node as any).tagName?.toLowerCase() || "span";
      const name = (node as any).name || "";
      const nameLower = name.toLowerCase();
      if (nameLower.includes("ignore")) continue;

      // Only warn if it looks like a heading but is not h1-h6
      if (
        (nameLower.includes("heading") || /^h[1-6]/.test(nameLower)) &&
        !["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)
      ) {
        missingHeading.add(name);
      }
    }

    function formatNames(names: Set<string>) {
      const arr = Array.from(names);
      if (arr.length <= 10) return arr.map(n => `- ${n}`).join(" ");
      return arr.slice(0, 10).map(n => `- ${n}`).join(" ") + ` ...and ${arr.length - 10} more`;
    }

    const details: string[] = [];
    if (missingSection.size > 0) {
      details.push(
        `❌ ${missingSection.size} layer(s) appear to be sections but are using the default <div> tag: ${formatNames(missingSection)}`
      );
    }
    if (missingFooter.size > 0) {
      details.push(
        `❌ ${missingFooter.size} layer(s) appear to be footers but are using the default <div> tag: ${formatNames(missingFooter)}`
      );
    }
    if (missingNav.size > 0) {
      details.push(
        `❌ ${missingNav.size} layer(s) appear to be nav sections but are using the default <div> tag: ${formatNames(missingNav)}`
      );
    }
    if (missingHeading.size > 0) {
      details.push(
        `❌ ${missingHeading.size} text layer(s) look like headings but are using the default <span> tag: ${formatNames(missingHeading)}`
      );
    }

    return {
      id: "accessibility-tags",
      title: "Accessibility Tags",
      status: details.length > 0 ? "warning" : "pass",
      details,
    };
  },
};