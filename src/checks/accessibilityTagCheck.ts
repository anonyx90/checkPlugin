import { framer } from "framer-plugin";
import { Check } from "../types";

export const accessibilityTagCheck: Check = {
  id: "accessibility-tags",
  title: "Accessibility Tags",
  category: "Accessibility",

  run: async () => {
    const frameNodes = await framer.getNodesWithType("FrameNode");
    const textNodes = await framer.getNodesWithType("TextNode");
    const componentNodes = await framer.getNodesWithType(
      "ComponentInstanceNode"
    );
    const svgNodes = await framer.getNodesWithType("SVGNode");
    const nodes = [...frameNodes, ...textNodes, ...componentNodes, ...svgNodes];

    const seenMessages = new Set<string>();
    const issues: string[] = [];

    for (const node of nodes) {
      const tag = (node as any).tagName?.toLowerCase() || "";
      const name = (node as any).name || "";
      const altText = (node as any).alt;

      const nameLower = name.toLowerCase();

      const isLikelyButton = nameLower.includes("button");
      const isLikelyHeading =
        nameLower.includes("heading") || /^h[1-6]/.test(nameLower);
      const isLikelyNav = nameLower.includes("nav");
      const isLikelyFooter = nameLower.includes("footer");
      const isLikelySection = nameLower.includes("section");
      const isLikelyImage = nameLower.includes("image") || tag === "img";

      const addIssue = (message: string) => {
        if (!seenMessages.has(message)) {
          seenMessages.add(message);
          issues.push(message);
        }
      };

      if (isLikelyButton && tag !== "button") {
        addIssue(
          `❌ "${name}" looks like a button but is missing tag="button".`
        );
      }

      if (
        isLikelyHeading &&
        !["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)
      ) {
        addIssue(
          `❌ "${name}" looks like a heading but is missing correct tag (e.g., h1–h6).`
        );
      }

      if (isLikelyNav && tag !== "nav") {
        addIssue(
          `❌ "${name}" appears to be a nav section but is missing tag="nav".`
        );
      }

      if (isLikelyFooter && tag !== "footer") {
        addIssue(
          `❌ "${name}" appears to be a footer section but is missing tag="footer".`
        );
      }

      if (isLikelySection && tag !== "section") {
        addIssue(
          `❌ "${name}" appears to be a section but is missing tag="section".`
        );
      }

      if (isLikelyImage) {
        if (tag !== "img") {
          addIssue(
            `❌ "${name}" appears to be an image but is missing tag="img".`
          );
        }
        if (!altText || altText.trim() === "") {
          addIssue(`❌ "${name}" is an image but is missing alt text.`);
        }
      }
    }

    return {
      id: "accessibility-tags",
      title: "Accessibility Tags",
      status: issues.length > 0 ? "fail" : "pass",
      details: issues,
    };
  },
};
