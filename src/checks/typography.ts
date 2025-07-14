import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const typographyHierarchyCheck = {
  id: "typography-hierarchy-check",
  title: " Hierarchy Order Check",
  category: "Accessibility",
  run: async (): Promise<CheckResult> => {
    const textNodes = await framer.getNodesWithType("TextNode");

    const headings = textNodes.map((node: any) => {
      const tag =
        (
          node.tag ||
          node.tagName ||
          node.htmlTag ||
          node.inlineTextStyle?.tag ||
          node.inlineTextStyle?.tagName ||
          node.inlineTextStyle?.htmlTag ||
          ""
        ).toLowerCase();

      return {
        tag,
        name: node.name || node.text || "",
        text: node.text || "",
        fontSize: node.style?.fontSize || 0,
        fontWeight: node.style?.fontWeight || "normal",
        fontFamily: node.style?.fontFamily || "",
        letterSpacing: node.style?.letterSpacing || 0,
      };
    });

    const headingTags = headings.filter((n) => /^h[1-6]$/.test(n.tag));
    const details: string[] = [];

    let lastLevel: number | null = null;

    headingTags.forEach((h) => {
      const level = parseInt(h.tag[1]);

      if (lastLevel !== null && level > lastLevel + 3) {
        details.push(
          `⚠️ "${h.name}" uses <${h.tag}> after <h${lastLevel}> — skipped 4 or more heading levels.`
        );
      }

      if (h.text.trim().length > 100) {
        details.push(
          `⚠️ <${h.tag}> "${h.text.slice(0, 50)}...." is too long to be a heading.`
        );
      }

      lastLevel = level;
    });

    
    const visualHeadings = headings.filter(
      (n) =>
        !/^h[1-6]$/.test(n.tag) &&
        n.text &&
        n.fontSize >= 20 &&
        (n.fontWeight === "bold" || parseInt(n.fontWeight) >= 600)
    );

    visualHeadings.forEach((n) => {
      details.push(
        `⚠️ "${n.name}" looks like a heading (fontSize: ${n.fontSize}, fontWeight: ${n.fontWeight}) but has no heading tag.`
      );
    });

    
    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1];
      const curr = headings[i];
      const sameSize = prev.fontSize === curr.fontSize && prev.fontSize > 0;
      const oneIsHeading =
        /^h[1-6]$/.test(prev.tag) !== /^h[1-6]$/.test(curr.tag);

      if (sameSize && oneIsHeading) {
        details.push(
          `⚠️ "${curr.name}" and "${prev.name}" have the same font size (${curr.fontSize}px), but only one is a heading. Consider using consistent semantic tags.`
        );
      }
    }

    
    const fontFamilies = new Set<string>();
    headings.forEach((n) => {
      if (n.fontFamily) fontFamilies.add(n.fontFamily);
    });
    if (fontFamilies.size > 2) {
      details.push(
        `⚠️ More than 2 font families detected (${[...fontFamilies].join(", ")}). Consider using a consistent font family for better design coherence.`
      );
    }

    
    headings.forEach((n) => {
      const letterSpacing = n.letterSpacing ?? 0;
      if (letterSpacing < -0.5) {
        details.push(
          `⚠️ "${n.name}" has very tight letter spacing (${letterSpacing}px).`
        );
      } else if (letterSpacing > 2) {
        details.push(
          `⚠️ "${n.name}" has very loose letter spacing (${letterSpacing}px).`
        );
      }
    });

    
    const fontWeightByLevel: Record<string, Set<string | number>> = {};
    headingTags.forEach((h) => {
      if (!fontWeightByLevel[h.tag]) {
        fontWeightByLevel[h.tag] = new Set();
      }
      fontWeightByLevel[h.tag].add(h.fontWeight);
    });

    for (const level in fontWeightByLevel) {
      if (fontWeightByLevel[level].size > 1) {
        details.push(
          `⚠️ Inconsistent font weights detected for <${level}> headings: ${[...fontWeightByLevel[level]].join(
            ", "
          )}. Consider standardizing font weight for consistent appearance.`
        );
      }
    }

   
    const visualHeadingGroups: Record<string, number> = {};
    visualHeadings.forEach((vh) => {
      const key = `${vh.fontSize}-${vh.fontWeight}`;
      visualHeadingGroups[key] = (visualHeadingGroups[key] || 0) + 1;
    });

    for (const key in visualHeadingGroups) {
      if (visualHeadingGroups[key] > 1) {
        details.push(
          `⚠️ Multiple (${visualHeadingGroups[key]}) visually styled headings (fontSize-fontWeight: ${key}) without proper heading tags detected. Use semantic heading tags instead of repeated styled text.`
        );
      }
    }

    
    if (headingTags.length > 50) {
      details.push(
        `⚠️ High number of heading tags detected.Use semantic heading tags for better clarity and navigation.`
      );
    }

    if (details.length === 0) {
      details.push("✓ Heading hierarchy is semantically correct.");
    }

    const groupedDetails: string[] = [];
    const seen = new Set<string>();

    details.forEach((msg) => {
      if (msg.startsWith("⚠️")) {
        const key = msg.replace(/^⚠️ /, "");
        if (!seen.has(key)) {
          groupedDetails.push(`⚠️ ${key}`);
          seen.add(key);
        }
      } else {
        groupedDetails.push(msg);
      }
    });

    if (groupedDetails.some((d) => d.startsWith("⚠️"))) {
      groupedDetails.push(
        "💡 Suggestion: Use heading tags in a logical, consistent order. Avoid large skips and ensure visually styled text has proper semantic tags."
      );
    }

    return {
      id: "typography-hierarchy",
      title: "Heading Hierarchy Order",
      status: groupedDetails.some((d) => d.startsWith("⚠️"))
        ? "warning"
        : "pass",
      details: groupedDetails,
    };
  },
};
