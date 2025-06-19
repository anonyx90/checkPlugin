import { framer } from "framer-plugin";
import { CheckResult } from "../types";

function normalizePath(path: string) {
  return (
    "/" +
    path
      .toLowerCase()
      .replace(/^\//, "")
      .replace(/\/$/, "")
      .split("?")[0]
      .split("#")[0]
  );
}

function findAllStrings(obj: any, found: Set<string>) {
  if (typeof obj === "string") {
    found.add(normalizePath(obj));
  } else if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      findAllStrings(obj[key], found);
    }
  }
}

export const unusedPagesCheck = {
  id: "unused-pages",
  title: "Unused Pages Check",
  category: "Links",
  run: async (): Promise<CheckResult> => {
    const pages = await framer.getNodesWithType("WebPageNode");
    const textNodes = await framer.getNodesWithType("TextNode");
    const allNodes = [
      ...(await framer.getNodesWithType("FrameNode") || []),
      ...(await framer.getNodesWithType("TextNode") || []),
      ...(await framer.getNodesWithType("ComponentInstanceNode") || []),
      ...(await framer.getNodesWithType("SVGNode") || []),
    ];

    const issues: string[] = [];

    const linkedText = (
      await Promise.all(textNodes.map((node) => node.getText()))
    )
      .join(" ")
      .toLowerCase();

    const allLinks = new Set<string>();
    for (const node of allNodes) {
      findAllStrings(node, allLinks);
    }

    for (const page of pages) {
      const path = (page as any).path?.toLowerCase?.();
      if (!path) continue;
      const normPath = normalizePath(path);
      const isLinked =
        linkedText.includes(normPath.replace(/^\//, "")) ||
        Array.from(allLinks).some((l) => l === normPath || l === normPath.replace(/^\//, ""));
      if (!isLinked) {
        issues.push(`⚠️ Page with path "${normPath}" is not referenced in any text or link.`);
      }
    }

    return {
      id: "unused-pages",
      title: "Unused Pages Check",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
