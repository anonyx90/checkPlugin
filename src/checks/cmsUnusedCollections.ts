import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const cmsUnusedCollectionsCheck = {
  id: "cms-unused-collections",
  title: "CMS Usage Check",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    console.log("Checking CMS collections:", collections);
    const allCollections = await framer.getActiveCollection();
    console.log("All active collections:", allCollections);

    const issues: string[] = [];

    if (!collections || collections.length === 0) {
      issues.push("❌ No CMS collections found in the project.");
    }

    for (const collection of collections) {
      const items = await collection.getItems?.();
      const fields = await collection.getFields?.();
      console.log(`Fields for collection "${collection.name}":`, fields);

      if (!items || items.length === 0) {
        issues.push(`⚠️ "${collection.name}" is empty.`);
      }
    }

    return {
      id: "cms-unused-collections",
      title: "CMS Usage Check",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };    
  },
};