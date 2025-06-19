import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const cmsMissingPreviewImagesCheck = {
  id: "cms-missing-preview-images",
  title: "CMS Collections Missing Preview Images",
  category: "CMS",
  run: async (): Promise<CheckResult> => {
    const collections = await framer.getCollections();
    const issues: string[] = [];

    for (const collection of collections) {
      const fields = await collection.getFields();
      const hasImageField = fields.some(
        (f) =>
          f.type === "image" ||
          ["image", "photo", "thumbnail", "cover"].includes(f.name.toLowerCase())
      );
      if (!hasImageField) {
        issues.push(
          `⚠️ Collection "${collection.name}" does not have an image field for previews.`
        );
      }
    }

    if (issues.length > 0) {
      issues.push(
        "\nSuggestion: If your CMS content is purely text or doesn't need a visual preview, you can safely ignore this warning. " +
          "If your collection is meant to be shown visually (e.g., blog cards, product lists), having an image field is a best practice for a better user experience."
      );
    }

    return {
      id: "cms-missing-preview-images",
      title: "CMS Collections Missing Preview Images",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
