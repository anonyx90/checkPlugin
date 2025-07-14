import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const cmsArticleCheck = {
  id: "cms-duplicate-contents",
  title: "⚠️ Duplicate CMS Content Across Collections",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    const issues: string[] = [];
    const allFiles = await framer.unstable_getCodeFiles();
console.log(`Project has ${allFiles.length} code files`);

    const contentMap = new Map<string, Array<{ collection: string; label: string }>>();

    for (const collection of collections) {
      const collectionName = collection.name ?? "Unnamed Collection";
      const items = await collection.getItems?.() ?? [];

      for (const item of items) {
        const fieldData = item.fieldData ?? {};

        for (const fieldId in fieldData) {
          const field = fieldData[fieldId];
          const rawValue = field?.value;

          if (typeof rawValue === "string" && rawValue.trim() !== "") {
            const normalized = rawValue.trim().toLowerCase();

            if (!contentMap.has(normalized)) {
              contentMap.set(normalized, []);
            }

            const label = item.slug || item.id;

            contentMap.get(normalized)!.push({
              collection: collectionName,
              label,
            });
          }
        }
      }
    }

    for (const [_, entries] of contentMap.entries()) {
      if (entries.length > 1) {
        const duplicates = entries.map(e => `Item "${e.label}" in ${e.collection}`);
        issues.push(`❌ Duplicate content found: ${duplicates.join(", ")}`);
      }
    }

    return {
      id: "cms-duplicate-contents",
      title: "⚠️ Duplicate CMS Content Across Collections",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
