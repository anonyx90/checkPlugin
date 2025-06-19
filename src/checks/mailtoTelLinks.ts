import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const mailtoTelLinksCheck = {
  id: "mailto-tel-links",
  title: "Use mailto:/tel: for Contact Links",
  category: "Links",
  run: async (): Promise<CheckResult> => {
    const nodes = await framer.getNodesWithType("TextNode");

    const issuesSet = new Set<string>();

    for (const node of nodes) {
      const text = await node.getText();
      if (!text) continue;

      const lowerText = text.toLowerCase().trim();
      const link: string | undefined =
        (node as any).link || (node as any).href || undefined;
      const linkLower = link ? link.toLowerCase().trim() : "";

      let failed = false;

      if (/@/.test(lowerText)) {
        if (!linkLower.startsWith("mailto:")) {
          issuesSet.add(`❌ Email not using mailto: — "${text}"`);
          failed = true;
        }
      }

      const phonePattern = /^\+?[\d\s\-\(\)]{7,}$/;
      if (phonePattern.test(lowerText)) {
        if (!linkLower.startsWith("tel:")) {
          issuesSet.add(`❌ Phone not using tel: — "${text}"`);
          failed = true;
        }
      }

      if (failed) {
        console.log("Failed mailto/tel check:", {
          nodeId: node.id,
          nodeName: node.name,
          text: text,
          lowerText: lowerText,
          link: link,
          nodeProps: node,
        });
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
