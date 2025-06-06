import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const cmsMissingPreviewImagesCheck = {
  id: "cms-missing-preview-images",
  title: "CMS Missing Preview Images",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    const issues: string[] = [];

    for (const collection of collections) {
      const fields = await collection.getFields();
      const hasImage = fields.some((f) => f.type.toLowerCase() === "image");
      if (!hasImage) {
        issues.push(
          `⚠️ Collection "${collection.name}" is missing an image field. Adding images can improve previews.`
        );
      }
    }

    return {
      id: "cms-missing-preview-images",
      title: "CMS Missing Preview Images",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
