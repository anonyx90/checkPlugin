import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const cmsUnusedCollectionsCheck = {
  id: "cms-unused-collections",
  title: "CMS Usage Check",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    const issues: string[] = [];

    if (!collections || collections.length === 0) {
      issues.push("❌ No CMS collections found in the project.");
    }

    for (const collection of collections) {
      const items = await collection.getItems?.();

      if (!items || items.length === 0) {
        issues.push(`⚠️ "${collection.name}" is empty.`);
      }
    }

    if (issues.length === 0) {
      issues.push("✅ All CMS collections have items.");
    } else {
      issues.push(
        "Note: This check only detects empty collections. Collections used dynamically in code or via CMS queries may be reported as unused. Please verify usage before removing."
      );
    }

    return {
      id: "cms-unused-collections",
      title: "CMS Usage Check",
      status: issues.some(i => i.startsWith("❌") || i.startsWith("⚠️")) ? "warning" : "pass",
      details: issues,
    };
  },
};