import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

const ROOT_NAMES = ["desktop", "tablet", "mobile"];

export const missingStacksCheck = {
  id: "missing-stacks",
  title: "Missing Stack Organization",
  category: "Layout",
  run: async (): Promise<CheckResult> => {
    const allFrames = (await framer.getNodesWithType("FrameNode")) as any[];
    console.log(`[MissingStacks] Total FrameNodes fetched: ${allFrames.length}`);

    const rootFrames = allFrames.filter(
      (f) => ROOT_NAMES.includes((f.name || "").trim().toLowerCase())
    );
    console.log(`[MissingStacks] Root frames found (${ROOT_NAMES.join(", ")}): ${rootFrames.length}`);

    const flagged: string[] = [];

    async function traverse(node: any, depth = 0) {
      const indent = "  ".repeat(depth);
      const children = await node.getChildren();
      console.log(`${indent}[MissingStacks] Traversing "${node.name}" (${node.id}), children count: ${children.length}, layoutMode: '${node.layoutMode}'`);

      for (const child of children) {
        const grandChildren = await child.getChildren();
        const lm = child.layoutMode;
        console.log(
          `${indent}  [MissingStacks] Checking child "${child.name}" (${child.id}), grandchildren count: ${grandChildren.length}, layoutMode: '${lm}' (type: ${typeof lm})`
        );

        if (
          child.type === "FrameNode" &&
          grandChildren.length >= 2 &&
          (lm === undefined || lm === null || (lm !== "horizontal" && lm !== "vertical"))
        ) {
          console.log(`${indent}  [MissingStacks] FLAGGED "${child.name || child.id}" with layoutMode '${lm}'`);
          flagged.push(child.name || child.id);
        }

        await traverse(child, depth + 2);
      }
    }

    for (const root of rootFrames) {
      await traverse(root);
    }

    const details: string[] = [];

    if (flagged.length > 0) {
      details.push(
        `⚠️ ${flagged.length} layer${flagged.length > 1 ? "s" : ""} inside desktop/tablet/mobile have 2+ children but no horizontal or vertical layoutMode.`
      );
      details.push("Examples:");
      details.push(...flagged.slice(0, 5).map((n) => `• "${n}"`));
    }

    if (flagged.length === 0) {
      console.log("[MissingStacks] No layers flagged");
    } else {
      console.log(`[MissingStacks] Total flagged layers: ${flagged.length}`);
    }

    return {
      id: "missing-stacks",
      title: "Missing Stack Organization",
      status: flagged.length > 0 ? "warning" : "pass",
      details,
    };
  },
};
