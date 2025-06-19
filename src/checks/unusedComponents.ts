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
      const compName = comp.name ?? "Unnamed Component";
      usageMap.set(compName, { name: compName, count: 0 });
    }

    for (const inst of instances) {
      const componentName = inst.componentName ?? "Unnamed Component";
      if (usageMap.has(componentName)) {
        usageMap.get(componentName)!.count += 1;
      }
    }

    const issues = [...usageMap.values()]
      .filter(({ count }) => count === 0)
      .map(
        ({ name }) =>
          ` "${name}" is unused (0 instances). Consider removing it.`
      );

    return {
      id: "unused-components",
      title: "Avoid Unused Components",
      status: issues.length > 0 ? "fail" : "pass",
      details: issues,
    };
  },
};
