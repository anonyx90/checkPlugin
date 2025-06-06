import { framer } from "framer-plugin";

export type CheckResult = {
  id: string;
  title: string;
  status: "pass" | "fail" | "warning";
  details?: string[];
};

export type Check = {
  id: string;
  title: string;
  run: () => Promise<CheckResult>;
  categgory?: string; 
};

const collections = await framer.getCollections();
console.log("This is Collections: ", collections);

export const checks: Check[] = [

  {
    id: "list-all-image-info",
    title: "List All Image Properties",
    run: async () => {
      const issues: string[] = [];
      const frames = await framer.getNodesWithType("FrameNode");
      for (const frame of frames) {
        const bg = frame.backgroundImage as any;
        if (bg && typeof bg === "object") {
          const name = frame.name || frame.id;
          const resolution = bg.resolution || "unknown";
          const src = bg.src || "no src";
          const opacity = frame.opacity ?? "unknown";
          const locked = frame.locked ? "locked" : "unlocked";
          const width = frame.width ?? "unknown";
          const height = frame.height ?? "unknown";
          const visible = frame.visible ? "visible" : "hidden";
          const rotation = frame.rotation ?? 0;
          let posX: string | number = "unknown";
          let posY: string | number = "unknown";
          if (typeof frame.position === "object" && frame.position !== null) {
            posX = (frame.position as any).x ?? "unknown";
            posY = (frame.position as any).y ?? "unknown";
          }

          issues.push(
            `Frame "${name}":\n` +
              `  - Image Src: ${src}\n` +
              `  - Resolution: ${resolution}\n` +
              `  - Opacity: ${opacity}\n` +
              `  - Locked: ${locked}\n` +
              `  - Width: ${width}px\n` +
              `  - Height: ${height}px\n` +
              `  - Visible: ${visible}\n` +
              `  - Rotation: ${rotation}°\n` +
              `  - Position: (${posX}, ${posY})`
            
          );
        }
      }

      const svgs = await framer.getNodesWithType("SVGNode");
      for (const svg of svgs) {
        const name = svg.name || svg.id;
        const svgData = svg.svg || "no SVG data";
        const opacity = svg.opacity ?? "unknown";
        const locked = svg.locked ? "locked" : "unlocked";
        issues.push(
          `SVG "${name}":\n` +
            `  - SVG data length: ${svgData.length} characters\n` +
            `  - Opacity: ${opacity}\n` +
            `  - Locked: ${locked}`
        );
      }

      return {
        id: "list-all-image-info",
        title: "List All Image Properties",
        status: "pass",
        details: issues.length > 0 ? issues : ["No images found."],
      };
    },
  },
  
  {
    id: "cms-field-type-validation",
    title: "CMS Field Type Validation",
    run: async () => {
      const collections = await framer.getCollections();
      const issues: string[] = [];

      const typeExpectations: Record<string, string[]> = {
        email: ["string", "email"],
        price: ["number", "currency"],
        image: ["image", "file"], 
        date: ["date", "datetime"],
      };

      for (const collection of collections) {
        const fields = await collection.getFields();

        for (const field of fields) {
          const name = field.name?.toLowerCase?.() || "";
          const type = field.type?.toLowerCase?.() || "unknown";

          for (const keyword in typeExpectations) {
            if (name.includes(keyword)) {
              const expectedTypes = typeExpectations[keyword];
              if (!expectedTypes.includes(type)) {
                issues.push(
                  `⚠️ Field "${field.name}" in collection "${
                    collection.name
                  }" looks like a "${keyword}" field but its type is "${
                    field.type
                  }". Expected: ${expectedTypes.join(", ")}.`
                );
              }
            }
          }
        }
      }

      return {
        id: "cms-field-type-validation",
        title: "CMS Field Type Validation",
        status: issues.length > 0 ? "warning" : "pass",
        details: issues,
      };
    },
  },
  
  {
    id: "cms-unlinked-collections",
    title: "Unlinked CMS Collections",
    run: async () => {
      const collections = await framer.getCollections();
      const issues: string[] = [];
      const templates = await framer.getNodesWithType("ComponentNode");
      const linkedCollectionNames = new Set<string>();

      for (const template of templates) {
        const bindings = (template as any).getBindings?.() || [];
        bindings.forEach((b: any) =>
          linkedCollectionNames.add(b.collectionName)
        );
      }

      for (const collection of collections) {
        if (!linkedCollectionNames.has(collection.name)) {
          issues.push(
            `⚠️ Collection "${collection.name}" is not linked to any component/template.`
          );
        }
      }

      return {
        id: "cms-unlinked-collections",
        title: "Unlinked CMS Collections",
        status: issues.length > 0 ? "warning" : "pass",
        details: issues,
      };
    },
  },

  {
    id: "cms-missing-preview-images",
    title: "CMS Missing Preview Images",
    run: async () => {
      const collections = await framer.getCollections();
      const issues: string[] = [];

      for (const collection of collections) {
        const fields = await collection.getFields();
        const hasImage = fields.some((f) => f.type.toLowerCase() === "image");
        if (!hasImage) {
          issues.push(
            "One or more collections are missing an image field. Adding images can improve previews."
          );
          break;
        }
      }
      return {
        id: "cms-missing-preview-images",
        title: "CMS Missing Preview Images",
        status: issues.length > 0 ? "warning" : "pass",
        details: issues,
      };
    },
  },
];
