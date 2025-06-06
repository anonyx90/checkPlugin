import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const custom404Check = {
  id: "custom-404-page",
  title: "Custom 404 Page Exists",
  category: "Pages",
  run: async (): Promise<CheckResult> => {
    const pages = await framer.getNodesWithType("WebPageNode");
    const issues: string[] = [];

    const has404 = pages.some((page: any) => {
      const path = page.path?.toLowerCase?.() || "";
      return path === "/404" || path.includes("404");
    });

    if (!has404) {
      issues.push("❌ No custom 404 page found. Create a page with path '/404'.");
    }

    return {
      id: "custom-404-page",
      title: "Custom 404 Page Exists",
      status: issues.length > 0 ? "fail" : "pass",
      details: issues,
    };
  },
};
