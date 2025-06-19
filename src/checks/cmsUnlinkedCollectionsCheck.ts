import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const cmsUnlinkedCollectionsCheck = {
  id: "cms-unlinked-collections",
  title: "Unlinked CMS Collections",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections(); // ✅ correct API to fetch all CMS collections :contentReference[oaicite:1]{index=1}

    const templates = await framer.getNodesWithType("ComponentNode");
    const componentInstances = await framer.getNodesWithType("ComponentInstanceNode");
    const allRelevantNodes = [...templates, ...componentInstances];

    const linkedCollectionNames = new Set<string>();

    for (const node of allRelevantNodes) {
      let bindings: any[] = [];
      if (typeof (node as any).getBindings === "function") {
        const maybe = (node as any).getBindings();
        bindings = maybe instanceof Promise ? await maybe : maybe;
      } else if ((node as any).bindings) {
        bindings = (node as any).bindings;
      }
      bindings.forEach((b: any) => {
        if (b.collectionName) linkedCollectionNames.add(b.collectionName);
      });
    }

    const issues: string[] = [];
    for (const collection of collections) {
      if (!linkedCollectionNames.has(collection.name)) {
        issues.push(`⚠️ Collection "${collection.name}" is not linked to any component/template/instance.`);
      }
    }

    if (issues.length > 0) {
      issues.push(
        "⚠️ This check may show false positives for code components or dynamic CMS usage. Framer's plugin API cannot detect all CMS bindings."
      );
    }

    return {
      id: "cms-unlinked-collections",
      title: "Unlinked CMS Collections",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
