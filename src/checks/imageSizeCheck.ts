import { framer } from "framer-plugin";

export const imageSizeCheck = {
  id: "image-size-check",
  title: "Image Size ≤ 100KB Check",
  category: "Assets",
  run: async () => {
    const frames = await framer.getNodesWithType("FrameNode");
    const issues: string[] = [];

    for (const frame of frames) {
      const bg = (frame as any).backgroundImage;
      const url = bg?.url;
      if (url && typeof url === "string") {
        try {
          
          
          const headResp = await fetch(url, { method: "HEAD" });
          let size = headResp.headers.get("content-length");

          
          if (!size || size === "0") {
            
            const imgResp = await fetch(url);
            const blob = await imgResp.blob();
            size = blob.size.toString();
          }

          const sizeNum = parseInt(size, 10);

          if (sizeNum > 100 * 1024) {
            issues.push(
              `⚠️ Image in "${frame.name || frame.id}" exceeds 100KB (${(sizeNum / 1024).toFixed(1)} KB). Optimize before upload.`
            );
          }
        } catch (e) {
          issues.push(`⚠️ Could not check image size for "${frame.name || frame.id}".`);
        }
      } else {
      }
    }

    const status: "warning" | "pass" = issues.length > 0 ? "warning" : "pass";

    return {
      id: "image-size-check",
      title: "Image Size ≤ 100KB Check",
      status,
      details: issues,
    };
  },
};