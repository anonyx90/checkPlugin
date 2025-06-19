import { framer } from "framer-plugin";
import { CheckResult } from "../types"; 

export const genericComponentNamesCheck = {
  id: "generic-component-names",
  title: "No Generic Component Names",
  category: "Links",
  run: async (): Promise<CheckResult> => {
    const components = [
      ...(await framer.getNodesWithType("ComponentInstanceNode")),
      ...(await framer.getNodesWithType("ComponentNode")),
    ];
    const issues = components
      .filter((n) =>
        n.name?.trim().toLowerCase().match(/^component\d+$|^widget\d+$/)
      )
      .map(
        (n) =>
          `❌ Generic component name found: "${n.name}". Use a descriptive name.`
      );

    return {
      id: "generic-component-names",
      title: "No Generic Component Names",
      status: issues.length > 0 ? "fail" : "pass",
      details: issues,
    };
  },
};
