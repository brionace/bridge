import { STYLE_OPTIONS } from "../components/StyleToolbox";

// Helper to convert CSS string to style object
export function cssStringToObject(cssString) {
  if (!cssString || typeof cssString !== "string") return {};
  return cssString.split(";").reduce((acc, rule) => {
    const [prop, value] = rule.split(":").map((s) => s && s.trim());
    if (prop && value) {
      // Convert kebab-case to camelCase
      const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      acc[camelProp] = value;
    }
    return acc;
  }, {});
}

// Utility to extract applied style objects from style string
export function extractAppliedStyleObjects(styleStr) {
  if (!styleStr) return [];
  return STYLE_OPTIONS.filter((opt) => styleStr.includes(opt.css));
}
