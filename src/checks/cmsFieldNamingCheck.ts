import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const cmsFieldNamingCheck = {
  id: "cms-field-naming",
  title: "CMS Field Naming Convention",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    const issues: string[] = [];
    const badNamePattern = /^(field|text|item|data|input)\d*$/i;

    for (const collection of collections) {
      try {
        const fields = (await collection.getFields?.()) || [];
        for (const field of fields) {
          if (badNamePattern.test(field.name)) {
            issues.push(
              `⚠️ Generic field name "${field.name}" in collection "${collection.name}". Use descriptive names.`
            );
          } else if (field.name === field.name.toUpperCase()) {
            issues.push(
              `⚠️ All-caps name "${field.name}" in collection "${collection.name}". Use camelCase or normal casing.`
            );
          }
        }
      } catch (error) {
        console.warn(
          `Couldn't check fields for collection ${collection.name}`,
          error
        );
      }
    }

    return {
      id: "cms-field-naming",
      title: "CMS Field Naming Convention",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
