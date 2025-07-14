import { framer } from "framer-plugin";
import type { CheckResult } from "../types";

const NAMED_COLORS: Record<string, [number, number, number, number]> = {
  white: [255, 255, 255, 1],
  black: [0, 0, 0, 1],
  red: [255, 0, 0, 1],
  blue: [0, 0, 255, 1],
  gray: [128, 128, 128, 1],
};

function parseColor(str: string): [number, number, number, number] | null {
  if (!str) return null;
  const named = NAMED_COLORS[str.toLowerCase()];
  if (named) return named;

  const rgbMatch = str.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]),
      parseInt(rgbMatch[2]),
      parseInt(rgbMatch[3]),
      rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1,
    ];
  }

  let c = str.replace("#", "");
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  if (c.length !== 6) return null;
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
    1,
  ];
}

function blendColors(fg: [number, number, number, number], bg: [number, number, number, number]): [number, number, number] {
  const alpha = fg[3];
  return [
    Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + bg[2] * (1 - alpha)),
  ];
}

function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(rgb1: number[], rgb2: number[]): number {
  const lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function isSameColor(rgb1: number[], rgb2: number[]): boolean {
  return rgb1[0] === rgb2[0] && rgb1[1] === rgb2[1] && rgb1[2] === rgb2[2];
}

function getBgColor(node: any): string {
  if (node.parent?.inlineTextStyle?.background && node.parent.inlineTextStyle.background !== "transparent") {
    return node.parent.inlineTextStyle.background;
  }
  if (node.parent?.background && node.parent.background !== "transparent") {
    return node.parent.background;
  }
  if (node.page?.background && node.page.background !== "transparent") {
    return node.page.background;
  }
  return "#ffffff";
}

export const colorContrastCheck = {
  id: "color-contrast",
  title: "Color Contrast",
  category: "Accessibility",

  run: async (): Promise<CheckResult> => {
    const textNodes = await framer.getNodesWithType("TextNode");
    const details: string[] = [];
    let failCount = 0;
    let checkedCount = 0;
    let skipped = 0;

    const warningMap = new Map<string, { count: number; sample: string }>();

    for (const node of textNodes) {
      const text = typeof node.name === "string" ? node.name.trim() : "";
      if (!text) continue;

      const colorRaw = node.inlineTextStyle?.color;
      const bgRaw = getBgColor(node);

      if (!colorRaw || typeof colorRaw !== "string" || colorRaw === "transparent" || !bgRaw) {
        skipped++;
        continue;
      }

      const rgbaText = parseColor(colorRaw);
      const rgbaBg = parseColor(bgRaw);

      if (!rgbaText || !rgbaBg) {
        skipped++;
        continue;
      }

      let alpha = rgbaText[3];
      if (typeof node.opacity === "number") {
        alpha *= node.opacity;
      }

      const effectiveTextColor =
        alpha < 1 ? blendColors([rgbaText[0], rgbaText[1], rgbaText[2], alpha], rgbaBg) : [rgbaText[0], rgbaText[1], rgbaText[2]];

      if (isSameColor(effectiveTextColor, [rgbaBg[0], rgbaBg[1], rgbaBg[2]])) {
        failCount++;
        const key = `Text and background are the same color (${colorRaw})`;
        if (!warningMap.has(key)) {
          warningMap.set(key, { count: 1, sample: text.slice(0, 40) });
        } else {
          warningMap.get(key)!.count += 1;
        }
        continue;
      }

      checkedCount++;
      const ratio = contrast(effectiveTextColor, [rgbaBg[0], rgbaBg[1], rgbaBg[2]]);
      if (ratio < 4.5) {
        failCount++;
        const key = `Contrast ratio is ${ratio.toFixed(2)}`;
        if (!warningMap.has(key)) {
          warningMap.set(key, { count: 1, sample: text.slice(0, 40) });
        } else {
          warningMap.get(key)!.count += 1;
        }
      }
    }

    if (failCount > 0) {
      const examples: string[] = [];
      for (const [msg, { sample }] of warningMap.entries()) {
        examples.push(`- "${sample}" → ${msg}`);
      }
      details.push(
        "Some text in your design has low contrast or identical foreground/background colors, which may affect readability:"
      );
      details.push(...examples);
      if (skipped > 0) {
        details.push("", `ℹ️ Skipped some nodes due to missing or invalid color/background please check the page quality report at top for full score.`);
      }
    } else if (checkedCount === 0) {
      details.push("⚠️ No eligible text nodes with both color and background found.");
    } else {
      details.push("✓ All visible text passes WCAG 2.1 AA color contrast standards.");
      if (skipped > 0) {
        details.push(`ℹ️ Skipped some nodes due to missing or invalid color/background please check the page quality report at top for full score.`);
      }
    }

    return {
      id: "color-contrast",
      title: "Color Contrast",
      status: failCount > 0 ? "warning" : "pass",
      details,
    };
  },
};
