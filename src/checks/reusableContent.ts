import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

const FRAMER_DEFAULTS = [
  "desktop", "tablet", "phone", "mobile", "container", "frame", "image", "text", "icon", "overlay"
];

function isBreakpointName(name: string) {
  const n = name.toLowerCase();
  return (
    n.includes("desktop") ||
    n.includes("tablet") ||
    n.includes("phone") ||
    n.includes("mobile") ||
    n.includes("breakpoint")
  );
}

function isMostlyBreakpoints(names: string[]) {
  const count = names.filter(n => isBreakpointName(n)).length;
  return count / names.length > 0.5;
}

function isMostlyDefaults(names: string[]) {
  const lowerNames = names.map(n => (n || "").toLowerCase());
  const defaultCount = lowerNames.filter(n => FRAMER_DEFAULTS.includes(n)).length;
  return defaultCount / names.length > 0.5;
}

export const reusableContentCheck = {
  id: "reusable-content",
  title: "Repetitive Elements Should Be Components",
  category: "Accessibility",
  run: async (): Promise<CheckResult> => {
    const frames = await framer.getNodesWithType("FrameNode");
    const structureMap = new Map<string, { count: number; frames: string[] }>();

    for (const frame of frames) {
      const children = await framer.getChildren(frame.id);

      const signature = children
        .filter(child => typeof (child as any).name === "string" && !isBreakpointName((child as any).name))
        .map((child) => {
          const type = "type" in child ? (child as any).type : "unknown";
          const name = "name" in child ? (child as any).name : "unnamed";
          return `${type}:${name}`;
        })
        .join("|");

      const frameName = (frame as any).name || frame.id;

      if (!structureMap.has(signature)) {
        structureMap.set(signature, { count: 1, frames: [frameName] });
      } else {
        const entry = structureMap.get(signature)!;
        entry.count += 1;
        entry.frames.push(frameName);
      }
    }

    const repeating = [...structureMap.entries()].filter(
      ([, v]) =>
        v.count >= 3 &&
        !isMostlyDefaults(v.frames) &&
        !isMostlyBreakpoints(v.frames)
    );

    const details: string[] = [];
    const MAX_GROUPS = 5;
    const MAX_NAMES = 3;

    if (repeating.length > 0) {
      details.push("⚠️ This project contains multiple similar frames. Consider converting them into reusable components.");
      const seenGroups = new Set<string>();
      let shownGroups = 0;
      for (const [, { frames }] of repeating) {
        if (shownGroups >= MAX_GROUPS) break;
        const uniqueNames = Array.from(new Set(frames));
        if (uniqueNames.length < 3) continue;

        const groupSignature = uniqueNames.slice().sort().join("|");
        if (seenGroups.has(groupSignature)) continue;
        seenGroups.add(groupSignature);

        details.push(
          `- ${uniqueNames.length} frames with similar structure: [${uniqueNames.slice(0, MAX_NAMES).join(", ")}${uniqueNames.length > MAX_NAMES ? ", ..." : ""}]`
        );
        shownGroups++;
      }
      if (repeating.length > MAX_GROUPS) {
        details.push(`...and more groups.`);
      }
    }

    return {
      id: "reusable-content",
      title: "Repetitive Elements Should Be Components",
      status: details.length > 1 ? "warning" : "pass",
      details,
    };
  },
};