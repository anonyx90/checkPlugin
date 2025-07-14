import { CanvasNode, framer } from "framer-plugin";
import type { CheckResult,  } from "../types";

const phoneRegex = /^\+?[\d\s\-()]{7,}$/;

function isEmail(text: string): boolean {
  return /@/.test(text);
}

function isPhone(text: string): boolean {
  return phoneRegex.test(text);
}

async function checkTextNode(node: CanvasNode, issuesSet: Set<string>) {
  const text = await (node as any).getText?.();
  if (!text) return;

  const lowerText = text.toLowerCase().trim();
  const link: string | undefined =
    (node as any).link || (node as any).href || undefined;
  const linkLower = link ? link.toLowerCase().trim() : "";

  let failed = false;

  if (isEmail(lowerText) && !linkLower.startsWith("mailto:")) {
    issuesSet.add(`❌ Email not using mailto: — "${text}"`);
    failed = true;
  }

  if (isPhone(lowerText) && !linkLower.startsWith("tel:")) {
    issuesSet.add(`❌ Phone not using tel: — "${text}"`);
    failed = true;
  }

  if (failed) {
    console.log("Failed mailto/tel check:", {
      nodeId: node.id,

      text,
      link,
    });
  }
}

export const mailtoTelLinksCheck = {
  id: "mailto-tel-links",
  title: "Use mailto:/tel: for Contact Links",
  category: "Links",
  run: async (): Promise<CheckResult> => {
    const issuesSet = new Set<string>();

    // Check visible text nodes directly
    const textNodes = await framer.getNodesWithType("TextNode");
    for (const node of textNodes) {
      await checkTextNode(node, issuesSet);
    }

    // Also check inside component instances
    const componentInstances = await framer.getNodesWithType("ComponentInstanceNode");
    for (const instance of componentInstances) {
      const children = await instance.getChildren();
      for (const child of children) {
        if ((child as any).getText) {
          await checkTextNode(child, issuesSet);
        }
      }
    }

    return {
      id: "mailto-tel-links",
      title: "Use mailto:/tel: for Contact Links",
      status: issuesSet.size > 0 ? "fail" : "pass",
      details: Array.from(issuesSet),
    };
  },
};
