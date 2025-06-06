import { framer } from "framer-plugin";
import { CheckResult } from "../types";

export const breakpointsCheck = {
  id: "breakpoints-check",
  title: "Breakpoints Usage Check",
  category: "Typography",
  run: async (): Promise<CheckResult> => {
    const textStyles = await framer.getTextStyles();
    const issues: string[] = [];

    for (const style of textStyles) {
      const breakpoints = (style as any).breakpoints;
      if (breakpoints && breakpoints.length > 3) {
        issues.push(
          `⚠️ Text style "${style.name}" uses ${breakpoints.length} breakpoints (recommended max: 3).`
        );
      }
    }

    return {
      id: "breakpoints-check",
      title: "Breakpoints Usage Check",
      status: issues.length > 0 ? "warning" : "pass",
      details: issues,
    };
  },
};
