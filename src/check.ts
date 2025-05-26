    import { framer } from "framer-plugin"


    export type CheckResult = {
        id: string
        title: string
        status: "pass" | "fail" | "warning"
        details?: string[]
    }


    export type Check = {
        id: string
        title: string
        run: () => Promise<CheckResult>
    }



    const collections = await framer.getCollections()
    console.log("Collections: ", collections)


    const normalizeText = (text: string) =>
        text.toLowerCase().replace(/\s+/g, " ").trim()

    // Common placeholder phrases to flag
    const placeholderPhrases = [
        "lorem ipsum", "lorem", "ipsum", "dolor sit amet",
        "consectetur adipiscing elit", "sed do eiusmod",
        "tempor incididunt", "ut labore et dolore", "magna aliqua",
        "placeholder", "sample text", "type here", "your text",
        "enter text", "dummy text", "text here", "replace this",
        "add text", "edit me"
    ]

    export const checks: Check[] = [
        //  Check for placeholder text in text layers
        {
            id: "placeholder-text",
            title: "No Placeholder Text",
            run: async () => {
                const nodes = await framer.getNodesWithType("TextNode")
                const issues: string[] = []
                for (const node of nodes) {
                    const text = await node.getText()
                    if (!text) continue
                    const norm = normalizeText(text)
                    if (placeholderPhrases.some(p => norm.includes(p))) {
                        issues.push(`❌ Placeholder detected: “${text.slice(0, 40)}${text.length > 40 ? "…" : ""}”`)
                    }
                }
                return {
                    id: "placeholder-text",
                    title: "No Placeholder Text",
                    status: issues.length > 0 ? "fail" : "pass",
                    details: issues
                }
            }
        },

        //  Ensure all layers are named
        {
            id: "unnamed-layers",
            title: "All Design Layers Are Named",
            run: async () => {
                const all = [
                    ...(await framer.getNodesWithType("FrameNode")),
                    ...(await framer.getNodesWithType("TextNode")),
                    ...(await framer.getNodesWithType("ComponentInstanceNode")),
                    ...(await framer.getNodesWithType("SVGNode"))
                ]
                const issues = all
                    .filter(n => !n.name || n.name.trim() === "")
                    .map(n => `❌ ${n.__class} is unnamed. Please name all layers.`)
                return {
                    id: "unnamed-layers",
                    title: "All Design Layers Are Named",
                    status: issues.length > 0 ? "fail" : "pass",
                    details: issues
                }
            }
        },

        //  Check for empty text layers
        {
            id: "empty-text",
            title: "Text Layers Are Not Empty",
            run: async () => {
                const nodes = await framer.getNodesWithType("TextNode")
                const issues: string[] = []
                for (const node of nodes) {
                    const text = await node.getText()
                    if (!text || text.trim() === "") {
                        issues.push(`❌ Empty Text Layer — remove or fill with meaningful content.`)
                    }
                }
                return {
                    id: "empty-text",
                    title: "Text Layers Are Not Empty",
                    status: issues.length > 0 ? "fail" : "pass",
                    details: issues
                }
            }
        },

        //  Detect generic component names like "Component1"
        {
            id: "generic-component-names",
            title: "No Generic Component Names",
            run: async () => {
                const components = [
                    ...(await framer.getNodesWithType("ComponentInstanceNode")),
                    ...(await framer.getNodesWithType("ComponentNode"))
                ]
                const issues = components
                    .filter(n => n.name?.trim().toLowerCase().match(/^component\d+$|^widget\d+$/))
                    .map(n => `❌ Generic component name found: "${n.name}". Use a descriptive name.`)
                return {
                    id: "generic-component-names",
                    title: "No Generic Component Names",
                    status: issues.length > 0 ? "fail" : "pass",
                    details: issues
                }
            }
        },
//         {
//   id: "cms-unused-collections",
//   title: "CMS Usage Check",
//   run: async () => {
//     const collections = await framer.getCollections()
//     const issues: string[] = []

//     if (!collections || collections.length === 0) {
//       issues.push("❌ No CMS collections found in the project.")
//     }

//     for (const collection of collections) {
//       const items = await collection.getItems?.()
//       if (!items || items.length === 0) {
//         issues.push(`⚠️ Collection "${collection.name}" is empty.`)
//       }
//     }

//     return {
//       id: "cms-unused-collections",
//       title: "CMS Usage Check",
//       status: issues.length > 0 ? "warning" : "pass",
//       details: issues
//     }
//   }
// }
// ,{
//   id: "cms-field-naming",
//   title: "CMS Field Naming Clarity",
//   run: async () => {
//     const collections = await framer.getCollections();
//     const issues: string[] = [];
//     // Add more generic or unclear names as needed
//     const genericNames = ["field", "data", "item", "value", "name", "text"];

//     for (const collection of collections) {
//       const fields = await collection.getFields();
//       for (const field of fields) {
//         const name = field.name;
//         if (name.length < 3) {
//           issues.push(`⚠️ Field "${name}" in collection "${collection.name}" is very short. Use descriptive names.`);
//         }
//         if (/^[a-zA-Z]{1,2}$/.test(name)) {
//           issues.push(`⚠️ Field "${name}" in collection "${collection.name}" is too short or unclear.`);
//         }
//         if (/^\d+$/.test(name)) {
//           issues.push(`⚠️ Field "${name}" in collection "${collection.name}" is only numbers. Use descriptive names.`);
//         }
//         if (genericNames.includes(name.toLowerCase())) {
//           issues.push(`⚠️ Field "${name}" in collection "${collection.name}" is too generic. Use more specific names.`);
//         }
//         if (/[^a-zA-Z0-9_]/.test(name)) {
//           issues.push(`⚠️ Field "${name}" in collection "${collection.name}" contains special characters. Use only letters, numbers, or underscores.`);
//         }
//       }
//     }

//     return {
//       id: "cms-field-naming",
//       title: "CMS Field Naming Clarity",
//       status: issues.length > 0 ? "warning" : "pass",
//       details: issues,
//     };
//   },
// }

//         // ⚠️ Flag similar frames that might be reusable components
//         {
//             id: "reusable-content",
//             title: "Repetitive Elements Should Be Components",
//             run: async () => {
//                 const frames = await framer.getNodesWithType("FrameNode")
//                 const seen = new Map<string, number>()
//                 for (const frame of frames) {
//                     const children = await framer.getChildren(frame.id)
//                     const key = `children-${children.length}`
//                     seen.set(key, (seen.get(key) || 0) + 1)
//                 }
//                 const isRepeating = [...seen.values()].some(count => count > 5)
//                 return {
//                     id: "reusable-content",
//                     title: "Repetitive Elements Should Be Components",
//                     status: isRepeating ? "warning" : "pass",
//                     details: isRepeating
//                         ? ["⚠️ This project contains many similar frames. Consider converting them into components."]
//                         : []
//                 }
//             }
//         },
//     //  Check for frames with duplicate names
//         {
//         id: "reusable-content-by-name",
//         title: "Frames With Duplicate Names",
//         run: async () => {
//             const frames = await framer.getNodesWithType("FrameNode");
//             const nameMap = new Map<string, number>();
//             for (const frame of frames) {
//                 const name = frame.name?.trim() || "(unnamed)";
//                 nameMap.set(name, (nameMap.get(name) || 0) + 1);
//             }
//             const issues = [...nameMap.entries()]
//                 .filter(([_, count]) => count > 1)
//                 .map(([name, count]) => `⚠️ The name "${name}" is used by ${count} frames. Consider using components.`);
//             return {
//                 id: "reusable-content-by-name",
//                 title: "Frames With Duplicate Names",
//                 status: issues.length > 0 ? "warning" : "pass",
//                 details: issues
//             };
//         }
//     },

//         //  Ensure all images have alt text
//         {
//             id: "image-alt-text",
//             title: "All Images Have Alt Text",
//             run: async () => {
//                 const frames = await framer.getNodesWithType("FrameNode");
//                 const issues: string[] = [];
//                 for (const frame of frames) {
//                     const bg = frame.backgroundImage;
//                     if (bg && "altText" in bg) {
//                         if (!bg.altText || bg.altText.trim() === "") {
//                             issues.push(`❌ Image in "${frame.name || frame.id}" is missing alt text.`);
//                         }
//                     }
//                 }
//                 return {
//                     id: "image-alt-text",
//                     title: "All Images Have Alt Text",
//                     status: issues.length > 0 ? "fail" : "pass",
//                     details: issues
//                 }
//             }
//         },

//         //  Ensure image and graphic layers are locked
//         {
//             id: "locked-images",
//             title: "Images and Graphics Are Locked",
//             run: async () => {
//                 const images = await framer.getNodesWithType("FrameNode")
//                 const issues = images
//                     .filter(img => img.backgroundImage && !img.locked)
//                     .map(img => `🔓 Image "${img.name || img.id}" is not locked.`)
//                 return {
//                     id: "locked-images",
//                     title: "Images and Graphics Are Locked",
//                     status: issues.length > 0 ? "fail" : "pass",
//                     details: issues,
//                 }
//             }
//         },

//         //  Check for mailto: and tel: formatting
//         {
//             id: "mailto-tel-links",
//             title: "Use mailto:/tel: for Contact Links",
//             run: async () => {
//                 const nodes = await framer.getNodesWithType("TextNode")
//                 const issues: string[] = []
//                 for (const node of nodes) {
//                     const text = await node.getText()
//                     if (!text) continue
//                     if (/@/.test(text) && !text.toLowerCase().startsWith("mailto:")) {
//                         issues.push(`❌ Email not using mailto: — "${text}"`)
//                     }
//                     if (/^\+?[0-9\s-]+$/.test(text) && !text.toLowerCase().startsWith("tel:")) {
//                         issues.push(`❌ Phone not using tel: — "${text}"`)
//                     }
//                 }
//                 return {
//                     id: "mailto-tel-links",
//                     title: "Use mailto:/tel: for Contact Links",
//                     status: issues.length > 0 ? "fail" : "pass",
//                     details: issues
//                 }
//             }
//         },

//         // ⚠️ Warn if components are only used once
//         {
//             id: "unused-components",
//             title: "Avoid Unused Components",
//             run: async () => {
//                 const instances = await framer.getNodesWithType("ComponentInstanceNode")
//                 const usageMap = new Map<string, number>()
//                 for (const inst of instances) {
//                     const name = inst.name ?? "Unnamed Component"
//                     usageMap.set(name, (usageMap.get(name) || 0) + 1)
//                 }
//                 const issues = [...usageMap.entries()]
//                     .filter(([_, count]) => count === 1)
//                     .map(([name]) => `⚠️ "${name}" used only once. Consider flattening or removing.`)
//                 return {
//                     id: "unused-components",
//                     title: "Avoid Unused Components",
//                     status: issues.length > 0 ? "warning" : "pass",
//                     details: issues
//                 }
//             }
//         },

//         // ⚠️ Check if image resolution is set to "auto"
//     {
//   id: "auto-image-resolution",
//   title: "Image Resolution Set to Auto",
//   run: async () => {
//     const frames = await framer.getNodesWithType("FrameNode");
//     const issues: string[] = [];

//     for (const frame of frames) {
//       const bg = frame.backgroundImage as any;

//       if (bg && typeof bg === "object" && "resolution" in bg) {
//         if (bg.resolution !== "auto") {
//           issues.push(`🖼️ "${frame.name || frame.id}" resolution is "${bg.resolution}" — should be set to "auto".`);
//         }
//       }
//     }

//     return {
//       id: "auto-image-resolution",
//       title: "Image Resolution Set to Auto",
//       status: issues.length > 0 ? "warning" : "pass",
//       details: issues
//     };
//   }
// }
//         ,

//         //  Ensure a custom 404 page is present
//         {
//             id: "custom-404-page",
//             title: "Custom 404 Page Exists",
//             run: async () => {
//                 const pages = await framer.getNodesWithType("WebPageNode");
//                 const issues: string[] = [];
//                 const has404 = pages.some(page => {
//                     const path = (page as any).path?.toLowerCase?.() ?? "";
//                     return path === "/404" || path.includes("404");
//                 });
//                 if (!has404) {
//                     issues.push("❌ No custom 404 page found. Create a page with path '/404'.");
//                 }
//                 return {
//                     id: "custom-404-page",
//                     title: "Custom 404 Page Exists",
//                     status: issues.length > 0 ? "fail" : "pass",
//                     details: issues
//                 };
//             }
//         },

//         //  Check for responsive layout
//     {
//     id: "responsive-layout",
//     title: "Responsive Layout Check",
//     run: async () => {
//         const frames = await framer.getNodesWithType("FrameNode");
//         const problematicNames: string[] = [];

//         const skipNames = ["logo", "icon", "avatar", "badge", "dot", "circle"];

//         for (const frame of frames) {
//         const name = frame.name || frame.id;
//         const nameLower = name.toLowerCase();

//         if (skipNames.some(skip => nameLower.includes(skip))) continue;

//         const fixedWidth = (frame as any).fixedWidth;
//         const fixedHeight = (frame as any).fixedHeight;
//         const pins = (frame as any).pins;

//         const hasIssues =
//             fixedWidth || fixedHeight ||
//             !(pins?.left && pins?.right) ||
//             !(pins?.top && pins?.bottom);

//         if (hasIssues) {
//             problematicNames.push(name);
//         }
//         }

//         const details: string[] = [];

//         if (problematicNames.length > 0) {
//         const count = problematicNames.length;
//         const sample = problematicNames.slice(0, 5).join(", ");
//         details.push(`⚠️ ${count} layers have layout issues like fixed size or missing pins.`);
//         details.push(`⚠️ Examples: ${sample}${count > 5 ? ", ..." : ""}`);
//         }

//         return {
//         id: "responsive-layout",
//         title: "Responsive Layout Check",
//         status: problematicNames.length > 0 ? "warning" : "pass",
//         details,
//         };
//     },
//     }
//     ,

//     //  Check for excessive breakpoints in text styles
//     {
//     id: "breakpoints-check",
//     title: "Breakpoints Usage Check",
//     run: async () => {
//         const textStyles = await framer.getTextStyles();
//         const issues: string[] = [];

//         for (const style of textStyles) {
//         if ((style as any).breakpoints?.length > 3) {
//             issues.push(`⚠️ Text style "${style.name}" uses more than 3 breakpoints.`);
//         }
//         }

//         return {
//         id: "breakpoints-check",
//         title: "Breakpoints Usage Check",
//         status: issues.length > 0 ? "warning" : "pass",
//         details: issues
//         };
//     }
//     }
//     ,
//     //  Check for unused pages
//     {
//     id: "unused-pages",
//     title: "Unused Pages Check",
//     run: async () => {
//         const pages = await framer.getNodesWithType("WebPageNode");
//         const textNodes = await framer.getNodesWithType("TextNode");
//         const issues: string[] = [];

//         const linkedText = (await Promise.all(textNodes.map(n => n.getText()))).join(" ").toLowerCase();

//         for (const page of pages) {
//         const path = (page as any).path?.toLowerCase?.();
//         if (path && !linkedText.includes(path)) {
//             issues.push(`⚠️ Page with path "${path}" is not referenced in any text.`);
//         }
//         }

//         return {
//         id: "unused-pages",
//         title: "Unused Pages Check",
//         status: issues.length > 0 ? "warning" : "pass",
//         details: issues
//         };
//     }
//     },
//     //  Check for missing stack layouts
//     {
//   id: "missing-stacks",
//   title: "Missing Stack Layouts",
//   run: async () => {
//     const frames = await framer.getNodesWithType("FrameNode");
//     const likelyStacks = frames.filter(f => f.name?.toLowerCase().includes("stack"));
//     const details: string[] = [];

//     if (likelyStacks.length === 0) {
//       details.push("⚠️ No Stack layout (heuristically) found. Use stacks for layout consistency.");
//     }
//     const nonStackFrames = frames
//       .filter(f => !f.name?.toLowerCase().includes("stack"))
//       .slice(0, 5)
//       .map(f => `• "${f.name || f.id}"`);

//     if (likelyStacks.length === 0 && nonStackFrames.length > 0) {
//       details.push("Examples of frames that might benefit from stacks:");
//       details.push(...nonStackFrames);
//     }

//     return {
//       id: "missing-stacks",
//       title: "Missing Stack Layouts",
//       status: likelyStacks.length > 0 ? "pass" : "warning",
//       details,
//     };
//   }
// },
]
