import { framer } from "framer-plugin";
import { Check } from "../types";

export const languageDefinedCheck: Check = {
  id: "language-defined",
  title: "Define Default Language in Project Settings",
  category: "Accessibility",
  run: async () => {
    const defaultLocale = await framer.getDefaultLocale();
  
    let status: "pass" | "warning" = "pass";
    const details: string[] = [];

   


    if (!defaultLocale) {
      status = "warning";
      details.push(
        "No default language is set. Please set a default language in Project Settings > Localizations."
      );
    } else {
      details.push(
        `Default language: ${defaultLocale.name} (${defaultLocale.code})`
      );
    }

    return {
      id: "language-defined",
      title: "Define Default Language in Project Settings",
      status,
      details,
    };
  },
};