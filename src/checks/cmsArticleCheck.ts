import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const cmsArticleCheck = {
  id: "cms-duplicate-contents",
  title: "Duplicate CMS Content Across Collections",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    const issues: string[] = [];
    
    const contentMap = new Map<string, Array<{ collection: string; label: string }>>();

    for (const collection of collections) {
      const items = await collection.getItems();
      const fields = await collection.getFields();

      for (const item of items) {
        
        const allContent = fields
          .map(f => {
            const val = (item as any)[f.name];
            return typeof val === "string" ? val.trim() : "";
          })
          .filter(Boolean)
          .join("||"); 

        if (!allContent) continue;
        const label =
          (item as any).title ||
          (item as any).name ||
          (item as any).id ||
          "Unknown";
        if (!contentMap.has(allContent)) contentMap.set(allContent, []);
        contentMap.get(allContent)!.push({ collection: collection.name, label });
      }
    }

    
    for (const [_, entries] of contentMap.entries()) {
      if (entries.length > 1) {
        const grouped = entries.map(e => `"${e.label}" in ${e.collection}`);
        issues.push(
          `⚠️ Duplicate CMS item content found: ${grouped.join(", ")}`
        );
      }
    }

    return {
      id: "cms-duplicate-contents",
      title: "Duplicate CMS Content Across Collections",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};