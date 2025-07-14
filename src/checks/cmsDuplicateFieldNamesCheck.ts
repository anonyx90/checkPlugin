import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const cmsDuplicateFieldNamesCheck = {
  id: "cms-duplicate-field-names",
  title: "Duplicate CMS Field Names Across Collections",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    const issues: string[] = [];
    const fieldNameMap = new Map<string, string[]>();

    for (const collection of collections) {
      const fields = await collection.getFields?.() ?? [];
      const items = await collection.getItems?.() ?? [];
      console.log(
        `Collection "${collection.name ?? "Unnamed"}" has ${fields.length} fields and ${items.length} items.`
      );

      for (const field of fields) {
        const arr = fieldNameMap.get(field.name) || [];
        if (!arr.includes(collection.name)) {
          arr.push(collection.name);
          fieldNameMap.set(field.name, arr);
        }
      }
    }

    for (const [fieldName, colls] of fieldNameMap.entries()) {
      if (colls.length > 1) {
        issues.push(
          `⚠️ Field name "${fieldName}" is used in multiple collections: ${colls.join(
            ", "
          )}. Consider renaming for clarity.`
        );
      }
    }

    return {
      id: "cms-duplicate-field-names",
      title: "Duplicate CMS Field Names Across Collections",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
