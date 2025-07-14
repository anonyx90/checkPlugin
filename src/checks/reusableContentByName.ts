import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

// Add more generic/common names to skip
const defaultNames = new Set([
  "Stack", "Frame", "Group", "Text", "Image", "Button", "Container",
  "Wrapper", "Content", "Overlay", "Ellipse", "Rectangle", "Icon",
  "Title", "Subtitle", "Section", "Row", "Column", "Card", "Box",
  "Line", "Shape", "Divider", "Background", "Main", "Header", "Footer",
  "Body", "Label", "Input", "Form", "List", "Item", "Avatar", "Logo",
  "CTA", "Menu", "Nav", "Navigation", "Image Wrapper", "Text Wrapper",
  "Content Wrapper", "Service Wrapper", "Blog Card Wrapper", "Slider",
  "Banner", "Hero Section", "Hero section", "Tablet", "Phone",
  "Desktop", "image", "text"
]);

export const reusableContentByNameCheck = {
  id: "reusable-content-by-name",
  title: "Frames With Duplicate Names",
  category: "Accessibility",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const nameMap = new Map<string, number>();

    for (const frame of frames) {
      const name =
        "name" in frame && typeof frame.name === "string"
          ? frame.name.trim()
          : "(unnamed)";

      if (defaultNames.has(name)) continue;

      nameMap.set(name, (nameMap.get(name) || 0) + 1);
    }

    const duplicates = [...nameMap.entries()].filter(([_, count]) => count > 1);

    const details = [];
    if (duplicates.length > 0) {
      details.push("Some components are repeated. Consider converting similar frames into reusable components for better maintainability and clarity.");
      const exampleNames = duplicates.slice(0, 3).map(([name]) => `- ${name}`);
      details.push(...exampleNames);
    }

    return {
      id: "reusable-content-by-name",
      title: "Frames With Duplicate Names",
      status: duplicates.length > 0 ? "warning" : "pass",
      details: details.length ? details : ["No duplicate frame names found."],
    };
  },
};
