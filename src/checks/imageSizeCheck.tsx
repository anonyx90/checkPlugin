import { framer, FrameNode } from "framer-plugin";

interface ImageCheckResult {
  id: string;
  title: string;
  status: "warning" | "pass";
  details: (string | JSX.Element)[];
}

interface ImageMetadata {
  width: number;
  height: number;
  sizeKB: number;
}

export const imageSizeCheck = {
  id: "image-size-check",
  title: "Image Quality Check (Size + Dimensions)",
  category: "Assets",

  run: async (): Promise<ImageCheckResult> => {
    const frameNodes = (await framer.getNodesWithType(
      "FrameNode"
    )) as FrameNode[];

    const MAX_SIZE_KB = 500;
    const MAX_DIMENSION = 1920;
    const MIN_FRAME_SIZE = 50;

    const metadataCache = new Map<string, ImageMetadata | null>();

    const groupedIssues: Record<
      string,
      {
        names: Set<string>;
        url: string;
        frameSizes: Set<string>;
        imgSize: string;
        flags: Set<string>;
      }
    > = {};

    const getImageMetadata = async (
      url: string
    ): Promise<ImageMetadata | null> => {
      if (metadataCache.has(url)) return metadataCache.get(url)!;

      try {
        const img = new Image();
        img.src = url;

        await new Promise((r) => {
          img.onload = () => r(null);
          img.onerror = () => r(null);
        });

        let sizeBytes = 0;
        try {
          const headResp = await fetch(url, { method: "HEAD" });
          const sizeHeader = headResp.headers.get("content-length");
          if (sizeHeader && sizeHeader !== "0") {
            sizeBytes = parseInt(sizeHeader, 10);
          } else {
            const imgResp = await fetch(url);
            const blob = await imgResp.blob();
            sizeBytes = blob.size;
          }
        } catch {}

        const meta: ImageMetadata = {
          width: img.width || 0,
          height: img.height || 0,
          sizeKB: sizeBytes / 1024,
        };

        metadataCache.set(url, meta);
        return meta;
      } catch (e) {
        console.error("Failed to get image metadata for", url, e);
        metadataCache.set(url, null);
        return null;
      }
    };

    const checkImage = async (
      node: { name?: string | null; id: string; width: number; height: number },
      url: string
    ) => {
      if (!url || typeof url !== "string" || !url.startsWith("http")) return;

      const metadata = await getImageMetadata(url);
      if (!metadata) return;

      if (url.endsWith(".svg") && metadata.sizeKB < MAX_SIZE_KB * 2) return;

      const frameWidth = node.width;
      const frameHeight = node.height;

      if (frameWidth < MIN_FRAME_SIZE && frameHeight < MIN_FRAME_SIZE) return;

      const frameSizeText = `${frameWidth}×${frameHeight}px`;
      const name = node.name ?? node.id;

      const oversizeFlags: string[] = [];

      if (metadata.sizeKB > MAX_SIZE_KB) {
        oversizeFlags.push(
          `🧱 Size: ${metadata.sizeKB.toFixed(1)}KB > ${MAX_SIZE_KB}KB`
        );
      }

      if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
        oversizeFlags.push(
          `📐 Dimensions: ${metadata.width}×${metadata.height}px > ${MAX_DIMENSION}px`
        );
      }

      if (oversizeFlags.length > 0) {
        if (!groupedIssues[url]) {
          groupedIssues[url] = {
            names: new Set(),
            url,
            frameSizes: new Set(),
            imgSize: `${metadata.width}×${metadata.height}px`,
            flags: new Set(),
          };
        }
        groupedIssues[url].names.add(name);
        groupedIssues[url].frameSizes.add(frameSizeText);
        oversizeFlags.forEach((flag) => groupedIssues[url].flags.add(flag));
      }
    };

    for (const node of frameNodes) {
      const url = (node.backgroundImage as { url?: string })?.url;

      const width =
        typeof node.width === "number"
          ? node.width
          : parseFloat(node.width as string) || 0;
      const height =
        typeof node.height === "number"
          ? node.height
          : parseFloat(node.height as string) || 0;

      if (url)
        await checkImage(
          { name: node.name ?? undefined, id: node.id, width, height },
          url
        );
    }

    const details: (string | JSX.Element)[] = [];
    const groupedKeys = Object.keys(groupedIssues);

    if (groupedKeys.length > 0) {
      details.push(
        `⚠️ Found ${groupedKeys.length} unique image${
          groupedKeys.length > 1 ? "s" : ""
        } with potential quality issues:`
      );
      groupedKeys.forEach((url) => {
        const { imgSize } = groupedIssues[url];
        details.push(
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {url}
          </a>
        );
        details.push(`- Resolution: ${imgSize}`);
      });
    }

    return {
      id: "image-size-check",
      title: "Image Quality Check",
      status: details.length > 0 ? "warning" : "pass",
      details:
        details.length > 0
          ? details
          : [
              `✅ All images are ≤${MAX_SIZE_KB}KB and ≤${MAX_DIMENSION}px in width/height.`,
            ],
    };
  },
};
