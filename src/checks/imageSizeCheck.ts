import { framer, FrameNode as FramerFrameNode } from "framer-plugin";

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
        const frames = (await framer.getNodesWithType("FrameNode")) as FramerFrameNode[];
        const issues: string[] = [];
        const MAX_SIZE_KB = 500;
        const MAX_DIMENSION = 2000;
        const processedUrls = new Set<string>();
        const metadataCache = new Map<string, ImageMetadata | null>();

        const getImageMetadata = (url: string): Promise<ImageMetadata | null> => {
            if (metadataCache.has(url)) {
                return Promise.resolve(metadataCache.get(url)!);
            }

            return new Promise(async (resolve) => {
                try {
                    const img = new Image();
                    img.src = url;

                    await new Promise((imgResolve) => {
                        img.onload = () => imgResolve(null);
                        img.onerror = () => imgResolve(null);
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
                    } catch { 
                    }

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

        await Promise.all(
            frames.map(async (frame) => {
                const bg = frame.backgroundImage as { url?: string } | undefined;
                const url = bg?.url;

                if (url && typeof url === "string" && !processedUrls.has(url)) {
                    processedUrls.add(url);

                    const metadata = await getImageMetadata(url);

                    if (!metadata) {
                        issues.push(`⚠️ Could not analyze image in "${frame.name || frame.id}"`);
                        return;
                    }

                    const frameWidth =
                        typeof frame.width === "number" && frame.width > 0 ? frame.width : undefined;
                    const frameHeight =
                        typeof frame.height === "number" && frame.height > 0 ? frame.height : undefined;

                    const frameSizeText =
                        frameWidth && frameHeight
                            ? `${frameWidth}×${frameHeight}px`
                            : "unknown size";

                    if (metadata.sizeKB > MAX_SIZE_KB) {
                        issues.push(
                            `📏 Image in "${frame.name || frame.id}" is ${metadata.sizeKB.toFixed(
                                1
                            )}KB (max ${MAX_SIZE_KB}KB). Consider compression.`
                        );
                    }

                    const isMassivelyOversized =
                        frameWidth !== undefined &&
                        frameHeight !== undefined &&
                        (metadata.width > frameWidth * 3 || metadata.height > frameHeight * 3);
                    const isOversized =
                        metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION;

                    if (isMassivelyOversized) {
                        issues.push(
                            `🖼️ Extremely oversized image in "${frame.name || frame.id}": ` +
                                `${metadata.width}×${metadata.height}px (frame: ${frameSizeText}). Consider resizing.`
                        );
                    } else if (isOversized) {
                        issues.push(
                            `🖼️ Oversized image in "${frame.name || frame.id}": ` +
                                `${metadata.width}×${metadata.height}px (frame: ${frameSizeText}). Max recommended: ${MAX_DIMENSION}px.`
                        );
                    }
                }
            })
        );

        return {
            id: "image-size-check",
            title: "Image Quality Check",
            status: issues.length > 0 ? "warning" : "pass",
            details:
                issues.length > 0
                    ? issues
                    : [`✅ All images are properly sized (≤${MAX_SIZE_KB}KB and reasonable dimensions)`],
        };
    },
};
