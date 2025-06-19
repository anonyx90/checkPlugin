import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

// Add more generic/common names to skip
const defaultNames = new Set([
  "Stack",
  "Frame",
  "Group",
  "Text",
  "Image",
  "Button",
  "Container",
  "Wrapper",
  "Content",
  "Overlay",
  "Ellipse",
  "Rectangle",
  "Icon",
  "Title",
  "Subtitle",
  "Section",
  "Row",
  "Column",
  "Card",
  "Box",
  "Line",
  "Shape",
  "Divider",
  "Background",
  "Main",
  "Header",
  "Footer",
  "Body",
  "Label",
  "Input",
  "Form",
  "List",
  "Item",
  "Avatar",
  "Logo",
  "CTA",
  "Menu",
  "Nav",
  "Navigation",
  "Image Wrapper",
  "Text Wrapper",
  "Content Wrapper",
  "Service Wrapper",
  "Blog Card Wrapper",
  "Slider",
  "Banner",
  "Hero Section",
  "Hero section",
  "Tablet",
  "Phone",
  "Desktop",
  "image",
  "text"
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
    const duplicateCount = duplicates.length;

    duplicates.sort((a, b) => b[1] - a[1]);

    const details = [];
    if (duplicateCount > 0) {
      // details.push(`${duplicateCount} duplicate frame name(s) found:`);
      const top = duplicates.slice(0, 5);
      for (const [name, count] of top) {
        details.push(`- "${name}" used ${count} times`);
      }
      if (duplicateCount > 5) {
        details.push(`...and ${duplicateCount - 5} more`);
      }
      details.push(
        "\nSuggestion: Give each frame a unique, descriptive name. " +
        "If you have many similar frames, consider converting them into reusable components for better maintainability and clarity."
      );
    }

    return {
      id: "reusable-content-by-name",
      title: "Frames With Duplicate Names",
      status: duplicateCount > 0 ? "warning" : "pass",
      details,
    };
  },
};