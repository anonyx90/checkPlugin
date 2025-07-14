import { framer } from "framer-plugin";
import { CheckResult } from "../types";


function extractCollectionNamesFromObject(obj: any): string[] {
  let found: string[] = [];
  if (!obj || typeof obj !== "object") return found;

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const val = obj[key];

    if (typeof val === "string" && key.toLowerCase().includes("collectionname")) {
      found.push(val.toLowerCase().trim());
    } else if (typeof val === "object") {
      found = found.concat(extractCollectionNamesFromObject(val));
    }
  }
  return found;
}

const dynamicCollectionsWhitelist = new Set([
  
  "dynamiccollection",
  "apicollection",
]);

async function getAllBindingsFromNodes(nodes: any[]): Promise<string[]> {
  const allNames = new Set<string>();

  for (const node of nodes) {
    let bindings: any[] = [];
    if (typeof node.getBindings === "function") {
      const maybe = node.getBindings();
      bindings = maybe instanceof Promise ? await maybe : maybe;
    } else if (node.bindings) {
      bindings = node.bindings;
    }
    bindings.forEach((b: any) => {
      const names = extractCollectionNamesFromObject(b);
      names.forEach(n => allNames.add(n));
    });
  }

  return Array.from(allNames);
}

function normalizeName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  return name.toLowerCase().trim().replace(/^\/+|\/+$/g, ""); 
}

export const cmsUnlinkedCollectionsCheck = {
  id: "cms-unlinked-collections",
  title: "Unlinked CMS Collections",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    const templates = await framer.getNodesWithType("ComponentNode");
    const componentInstances = await framer.getNodesWithType("ComponentInstanceNode");
    const webPages = await framer.getNodesWithType("WebPageNode");
    const allRelevantNodes = [...templates, ...componentInstances, ...webPages];

    
    const linkedCollectionNames = new Set(await getAllBindingsFromNodes(allRelevantNodes));

    
    const pageNames = new Set<string>();
    webPages.forEach(page => {
      const pageName = (page as any).name;
      const pagePath = (page as any).path;

      const normalizedName = normalizeName(pageName);
      if (normalizedName) pageNames.add(normalizedName);

      const normalizedPath = normalizeName(pagePath);
      if (normalizedPath) pageNames.add(normalizedPath);
    });

    const issues: string[] = [];
    for (const collection of collections) {
      const collName = normalizeName(collection.name);
      if (!collName) continue;

      if (dynamicCollectionsWhitelist.has(collName)) continue;

      const isLinked = linkedCollectionNames.has(collName);
      const hasMatchingPage = pageNames.has(collName);

      const items = await collection.getItems?.();

      if (!isLinked && !hasMatchingPage) {
        if (!items || items.length === 0) {
          issues.push(`⚠️ Collection "${collection.name}" is empty and not linked.`);
        } else {
          issues.push(
            `⚠️ Collection "${collection.name}" has items but is not linked to any component/template/instance/page (no matching page name or path found).`
          );
        }
      }
    }

    if (issues.length > 0) {
      issues.push(
        "⚠️ Note: This check may produce false positives for collections used dynamically, in code components, or advanced bindings. Framer's plugin API cannot detect all CMS references. Please verify manually before deleting."
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
