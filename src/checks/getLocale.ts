import { framer } from "framer-plugin";
import { Check } from "../types";

export const projectInfoChecklist: Check = {
  id: "project-info-checklist",
  title: "Project Info Checklist",
  category: "Project",
  run: async () => {
    const info = await framer.getProjectInfo();
    const locales = await framer.getLocales();
    const defaultLocale = await framer.getDefaultLocale();
    const publishInfo = await framer.getPublishInfo();

    console.log("Project Info:", info);
    console.log("Publish Info:", publishInfo);

    let previewImage = (info as any).previewImage || (info as any).previewUrl || "None";

    const description = (info as any).description ?? "None";
    const slug = (info as any).slug ?? "None";
    const type = (info as any).type ?? "None";
    const version = (info as any).version ?? "None";
    const tags = (info as any).tags ? (info as any).tags.join(", ") : "None";
    const createdAt = (info as any).createdAt ? new Date((info as any).createdAt).toLocaleString() : "Unknown";
    const updatedAt = (info as any).updatedAt ? new Date((info as any).updatedAt).toLocaleString() : "Unknown";
    const publicStatus = (info as any).public !== undefined ? ((info as any).public ? "Yes" : "No") : "Unknown";
    const collaborators = (info as any).collaborators
      ? (info as any).collaborators.map((c: any) => c.name || c.email || "Unknown").join(", ")
      : "None";
    const owner = (info as any).owner?.name || (info as any).owner?.email || "Unknown";
    const theme = (info as any).theme ?? "None";
    const previewUrl = (info as any).previewUrl ?? "None";

    const details: string[] = [
      `Project Name: ${info.name}`,
      `Project ID: ${info.id}`,
      `Description: ${description}`,
      `Slug: ${slug}`,
      `Type: ${type}`,
      `Version: ${version}`,
      `Tags: ${tags}`,
      `Created At: ${createdAt}`,
      `Updated At: ${updatedAt}`,
      `Owner: ${owner}`,
      `Collaborators: ${collaborators}`,
      `Theme: ${theme}`,
      `Public: ${publicStatus}`,
      `Production URL: ${publishInfo.production?.url ?? "Not published"}`,
      `Staging URL: ${publishInfo.staging?.url ?? "Not published"}`,
      `Locales: ${locales.length > 0
        ? locales.map(l => `${l.name} (${l.code})`).join(", ")
        : "None"}`,
      `Default Locale: ${defaultLocale ? `${defaultLocale.name} (${defaultLocale.code})` : "None"}`,
      `Preview Image: ${previewImage !== "None" ? previewImage : "No preview image found"}`,
      `Preview URL: ${previewUrl}`,
    ];

    return {
      id: "project-info-checklist",
      title: "Project Info Checklist",
      status: "pass",
      details,
    };
  },
};