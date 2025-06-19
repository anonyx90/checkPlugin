import { framer, FrameNode } from "framer-plugin";

interface ImageCheckResult {
    id: string;
    title: string;
    status: "warning" | "pass";
    details: string[];
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
        const frameNodes = (await framer.getNodesWithType("FrameNode")) as FrameNode[];

        const MAX_SIZE_KB = 700;
        const MAX_DIMENSION = 4000;
        const WASTE_RATIO_THRESHOLD = 3;
        const MIN_FRAME_SIZE = 50;

        const metadataCache = new Map<string, ImageMetadata | null>();

        // Group by url for unique images
        const groupedIssues: Record<
            string,
            {
                names: string[];
                url: string;
                frameSizes: string[];
                imgSize: string;
                flags: string[];
            }
        > = {};

        const getImageMetadata = (url: string): Promise<ImageMetadata | null> => {
            if (metadataCache.has(url)) return Promise.resolve(metadataCache.get(url)!);

            return new Promise(async (resolve) => {
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
                    resolve(meta);
                } catch (e) {
                    console.error("Failed to get image metadata for", url, e);
                    metadataCache.set(url, null);
                    resolve(null);
                }
            });
        };

        const checkImage = async (
            node: { name?: string | null; id: string; width: number; height: number },
            url: string
        ) => {
            if (!url || typeof url !== "string" || !url.startsWith("http")) return;

            const metadata = await getImageMetadata(url);
            if (!metadata) return;

            const frameWidth = node.width;
            const frameHeight = node.height;

            if (frameWidth < MIN_FRAME_SIZE && frameHeight < MIN_FRAME_SIZE) return;

            const frameSizeText = `${frameWidth}×${frameHeight}px`;
            const name = node.name ?? node.id;

            const oversizeFlags: string[] = [];

            if (metadata.sizeKB > MAX_SIZE_KB) {
                oversizeFlags.push(`🧱 Size: ${metadata.sizeKB.toFixed(1)}KB > ${MAX_SIZE_KB}KB`);
            }

            if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
                oversizeFlags.push(`📐 Dimensions: ${metadata.width}×${metadata.height}px > ${MAX_DIMENSION}px`);
            }

            const wasteWidthRatio = metadata.width / frameWidth;
            const wasteHeightRatio = metadata.height / frameHeight;

            if (wasteWidthRatio > WASTE_RATIO_THRESHOLD || wasteHeightRatio > WASTE_RATIO_THRESHOLD) {
                oversizeFlags.push(
                    `🔍 Oversized by ~${wasteWidthRatio.toFixed(1)}× width, ${wasteHeightRatio.toFixed(1)}× height`
                );
            }

            if (oversizeFlags.length > 0) {
                if (!groupedIssues[url]) {
                    groupedIssues[url] = {
                        names: [],
                        url,
                        frameSizes: [],
                        imgSize: `${metadata.width}×${metadata.height}px`,
                        flags: [],
                    };
                }
                groupedIssues[url].names.push(name);
                groupedIssues[url].frameSizes.push(frameSizeText);
                groupedIssues[url].flags.push(...oversizeFlags);
            }
        };

        // Only check backgroundImage in FrameNode
        for (const node of frameNodes) {
            const url = (node.backgroundImage as { url?: string })?.url;

            // Convert width/height to number or 0
            const width = typeof node.width === "number" ? node.width : parseFloat(node.width as string) || 0;
            const height = typeof node.height === "number" ? node.height : parseFloat(node.height as string) || 0;

            if (url) await checkImage({ name: node.name ?? undefined, id: node.id, width, height }, url);
        }

        const details: string[] = [];
        const groupedKeys = Object.keys(groupedIssues);

        if (groupedKeys.length > 0) {
            details.push(
                `⚠️ Found ${groupedKeys.length} unique image${groupedKeys.length > 1 ? "s" : ""} with potential quality issues:`
            );
            groupedKeys.forEach((url) => {
                const { names, frameSizes, imgSize, flags } = groupedIssues[url];
                // Deduplicate names, frameSizes, and flags
                const uniqueNames = Array.from(new Set(names));
                const uniqueFrameSizes = Array.from(new Set(frameSizes));
                const uniqueFlags = Array.from(new Set(flags));
                const namePreview = uniqueNames.slice(0, 3).join(", ") + (uniqueNames.length > 3 ? ", ..." : "");
                const framePreview = uniqueFrameSizes.slice(0, 3).join(", ") + (uniqueFrameSizes.length > 3 ? ", ..." : "");
                details.push(
                    `- **${namePreview}** ([link](${url}))\n  - Frame(s): ${framePreview}\n  - Image: ${imgSize}\n  - ${uniqueFlags.join("\n  - ")}`
                );
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
                          `✅ All images are optimized (≤${MAX_SIZE_KB}KB, within ${MAX_DIMENSION}px, and appropriately sized).`,
                      ],
        };
    },
};