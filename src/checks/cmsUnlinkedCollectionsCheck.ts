import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const cmsUnlinkedCollectionsCheck = {
  id: "cms-unlinked-collections",
  title: "Unlinked CMS Collections",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    const issues: string[] = [];
    const templates = await framer.getNodesWithType("ComponentNode");
    const linkedCollectionNames = new Set<string>();

    for (const template of templates) {
      const bindings = (template as any).getBindings?.() || [];
      bindings.forEach((b: any) => linkedCollectionNames.add(b.collectionName));
    }

    for (const collection of collections) {
      if (!linkedCollectionNames.has(collection.name)) {
        issues.push(`⚠️ Collection "${collection.name}" is not linked to any component/template.`);
      }
    }

    return {
      id: "cms-unlinked-collections",
      title: "Unlinked CMS Collections",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
