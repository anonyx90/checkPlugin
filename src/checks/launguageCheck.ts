import { framer } from "framer-plugin";
import { Check } from "../types";

export const languageDefinedCheck: Check = {
  id: "language-defined",
  title: "Define Default Language in Project Settings",
  category: "Project",
  run: async () => {
    const defaultLocale = await framer.getDefaultLocale();
    const locales = await framer.getLocales?.();

    let status: "pass" | "warning" = "pass";
    const details: string[] = [];

    if (!locales || locales.length === 0) {
      status = "warning";
      details.push(
        "No locales are defined. Please add at least one locale in Project Settings > Localizations."
      );
    } else {
      details.push(
        `Locales: ${locales.map((l) => `${l.name} (${l.code})`).join(", ")}`
      );
    }


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