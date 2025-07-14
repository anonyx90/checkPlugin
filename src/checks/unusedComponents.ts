import { framer } from "framer-plugin";
import type { CheckResult } from "../types";
export const unusedComponentsCheck = {
  id: "unused-components",
  title: "Avoid Unused Components",
  category: "Accessibility",
  run: async (): Promise<CheckResult> => {

    const components = await framer.getNodesWithType("ComponentNode");
    const instances = await framer.getNodesWithType("ComponentInstanceNode");
    const usageMap = new Map<string, { name: string; count: number }>();

    
    for (const comp of components) {
      usageMap.set(comp.name ?? "Unnamed Component", { name: comp.name ?? "Unnamed Component", count: 0 });
    }

    
    for (const inst of instances) {
      const compName = inst.componentName ?? "";
      if (usageMap.has(compName)) {
        usageMap.get(compName)!.count += 1;
      }
    }

    
    const issues = [...usageMap.values()]
      .filter(({ count }) => count === 0)
      .map(
        ({ name }) =>
          `⚠️ "${name}" is unused (0 instances). Consider removing it.`
      );

    return {
      id: "unused-components",
      title: "Avoid Unused Components",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};