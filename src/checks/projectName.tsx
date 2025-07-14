import { framer } from "framer-plugin";
import { Check } from "../types";

const FRAMER_CATEGORIES = [
  "Business", "Landing Page", "Ecommerce", "Technology", "SaaS", "Real Estate", "Health", "Services", "Food", "Documentation",
  "Community", "Education", "Membership", "Conference", "Environmental", "Non-profit", "Social", "Wedding", "Religious",
  "Creative", "Portfolio", "Blog", "Fashion", "Entertainment", "Graphic Design", "Art & Design", "Brand Guidelines", "Interior Design",
  "Style", "Minimal", "Modern", "Professional", "Animated", "Light", "Dark", "Colorful", "Large Type", "Typographic", "Grid",
  "Black & White", "Gradient", "Monochromatic", "Illustrative", "Pastel", "3D"
];

export const projectNameCheck: Check = {
  id: "project-name-checklist",
  title: "Project Name Validation",
  category: "Project",
  run: async () => {
    const info = await framer.getProjectInfo();
    const details: (string | JSX.Element)[] = [];
    const trimmedName = (info.name ?? "").trim();
    const encodedName = encodeURIComponent(trimmedName);
    const marketplaceSearchURL = `https://www.framer.com/marketplace/search/?q=${encodedName}&type=template`;

    const matchesCategory = FRAMER_CATEGORIES.some(
      cat => cat.toLowerCase() === trimmedName.toLowerCase()
    );

    const marketplaceLink = (
      <a href={marketplaceSearchURL} target="_blank" rel="noopener noreferrer">
        Search the Framer Marketplace to see if the project name
        matches an existing Framer category
      </a>
    );

    if (matchesCategory) {
      details.push(
        `⚠️ The project name "${info.name}" matches an existing Framer category. Please consider a more unique and descriptive name.`
      );
      details.push(marketplaceLink);
      return {
        id: "project-name-checklist",
        title: "Project Name Validation",
        status: "warning",
        details,
      };
    }

    details.push(`Project name is set to ${info.name} and does not match reserved names or category names.`);
    details.push(marketplaceLink);

    return {
      id: "project-name-checklist",
      title: "Project Name Validation",
      status: "pass",
      details,
    };
  },
};
