import { framer } from "framer-plugin";
import { CheckResult } from "../types";

const GENERIC_PATTERNS = [
  /^component\s*\d*$/i,
  /^widget\s*\d*$/i,
  /^frame\s*\d*$/i,
  /^container\s*\d*$/i,
  /^group\s*\d*$/i,
  /^box\s*\d*$/i,
  /^image\s*\d*$/i,
  /^text\s*\d*$/i,
  /^icon\s*\d*$/i,
];

function isGenericName(name: string | null | undefined): boolean {
  if (!name) return false;
  const normalized = name.replace(/\s+/g, " ").trim().toLowerCase();
  return GENERIC_PATTERNS.some((pattern) => pattern.test(normalized));
}

export const genericComponentNamesCheck = {
  id: "generic-component-names",
  title: "No Generic Component Names",
  category: "Links",
  run: async (): Promise<CheckResult> => {
    const components = await framer.getNodesWithType("ComponentNode");

  console.log('components', components);
  
    const genericNames = new Set<string>();

    for (const n of components) {
      if (isGenericName(n.name)) {
        const key = n.name?.replace(/\s+/g, " ").trim() || "(unnamed)";
        genericNames.add(key);
      }
    }

    const issues: string[] = Array.from(genericNames);

    if (issues.length === 0) {
      issues.push("✅ All components have descriptive names.");
    }

    return {
      id: "generic-component-names",
      title: "No Generic Component Names",
      status: issues.length > 0 && issues[0].startsWith("✅") ? "pass" : "fail",
      details: issues,
    };
  }
};