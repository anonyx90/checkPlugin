import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

export const mailtoTelLinksCheck = {
  id: "mailto-tel-links",
  title: "Use mailto:/tel: for Contact Links",
  category: "Links",
  run: async (): Promise<CheckResult> => {
    const nodes = await framer.getNodesWithType("TextNode");
    const issues: string[] = [];

    for (const node of nodes) {
      const text = await node.getText();
      if (!text) continue;

      if (/@/.test(text) && !text.toLowerCase().startsWith("mailto:")) {
        issues.push(`❌ Email not using mailto: — "${text}"`);
      }
      if (/^\+?[0-9\s-]+$/.test(text) && !text.toLowerCase().startsWith("tel:")) {
        issues.push(`❌ Phone not using tel: — "${text}"`);
      }
    }

    return {
      id: "mailto-tel-links",
      title: "Use mailto:/tel: for Contact Links",
      status: issues.length > 0 ? "fail" : "pass",
      details: issues,
    };
  },
};
