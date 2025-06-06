import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const cmsMissingFieldBindingsCheck = {
  id: "cms-missing-field-bindings",
  title: "CMS Fields Missing in Templates",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    const issues: string[] = [];
    const templates = await framer.getNodesWithType("ComponentNode");

    for (const collection of collections) {
      const fields = await collection.getFields();
      for (const collectionField of fields) {
        let usedInTemplate = false;

        for (const template of templates) {
          // cast to any to safely call getBindings, which may not be typed
          const bindings = (template as any).getBindings?.() || [];
          if (
            bindings.some((b: any) => b.fieldName === collectionField.name)
          ) {
            usedInTemplate = true;
            break;
          }
        }

        if (!usedInTemplate) {
          issues.push(
            `⚠️ Field "${collectionField.name}" in collection "${collection.name}" is not used in any component/template.`
          );
        }
      }
    }

    return {
      id: "cms-missing-field-bindings",
      title: "CMS Fields Missing in Templates",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
