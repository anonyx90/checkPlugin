import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const unusedComponentsCheck = {
  id: "unused-components",
  title: "Avoid Unused Components",
  category: "Components",
  run: async (): Promise<CheckResult> => {
    const instances = await framer.getNodesWithType("ComponentInstanceNode");
    const usageMap = new Map<string, number>();

    for (const inst of instances) {
      const name = inst.name ?? "Unnamed Component";
      usageMap.set(name, (usageMap.get(name) || 0) + 1);
    }

    const issues = [...usageMap.entries()]
      .filter(([_, count]) => count === 1)
      .map(
        ([name]) =>
          `⚠️ "${name}" used only once. Consider flattening or removing.`
      );

    return {
      id: "unused-components",
      title: "Avoid Unused Components",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
