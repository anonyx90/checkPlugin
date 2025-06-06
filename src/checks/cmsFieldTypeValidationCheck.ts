import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const cmsFieldTypeValidationCheck = {
  id: "cms-field-type-validation",
  title: "CMS Field Type Validation",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    const issues: string[] = [];

    const typeExpectations: Record<string, string[]> = {
      email: ["string", "email"],
      price: ["number", "currency"],
      image: ["image", "file"],
      date: ["date", "datetime"],
    };

    for (const collection of collections) {
      const fields = await collection.getFields();

      for (const field of fields) {
        const name = field.name?.toLowerCase?.() || "";
        const type = field.type?.toLowerCase?.() || "unknown";

        for (const keyword in typeExpectations) {
          if (name.includes(keyword)) {
            const expectedTypes = typeExpectations[keyword];
            if (!expectedTypes.includes(type)) {
              issues.push(
                `⚠️ Field "${field.name}" in collection "${collection.name}" looks like a "${keyword}" field but its type is "${field.type}". Expected: ${expectedTypes.join(", ")}.`
              );
            }
          }
        }
      }
    }

    return {
      id: "cms-field-type-validation",
      title: "CMS Field Type Validation",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
