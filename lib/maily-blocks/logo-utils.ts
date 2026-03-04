export const DEFAULT_TEMPLATE_LOGO_URL =
  "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/logo.png";
const DEFAULT_TEMPLATE_BACKGROUND_COLOR = "#ffffff";
const DEFAULT_TEMPLATE_BUTTON_COLOR = "#1547E6";
const DEFAULT_TEMPLATE_BORDER_COLORS = new Set([
  "#d4d4d4",
  "#e2e2e2",
  "#eaeaea",
  "#d1d5db",
  "transparent",
  "",
]);
const DEFAULT_TEMPLATE_LINK_COLORS = new Set([
  "#2563eb",
  "#1d4ed8",
  "#1547e6",
  "",
]);

type OrganizationBranding = {
  logo?: string | null;
  image?: string | null;
  backgroundColor?: string | null;
  buttonColor?: string | null;
} | null;

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeHexColorWithHash(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(withoutHash)) {
    return null;
  }
  const expanded =
    withoutHash.length === 3
      ? withoutHash
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : withoutHash;
  return `#${expanded.toLowerCase()}`;
}

function toRgb(hexColor: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColorWithHash(hexColor);
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

function toHex(value: { r: number; g: number; b: number }): string {
  const clamp = (num: number) => Math.max(0, Math.min(255, Math.round(num)));
  const asHex = (num: number) => clamp(num).toString(16).padStart(2, "0");
  return `#${asHex(value.r)}${asHex(value.g)}${asHex(value.b)}`;
}

function mixHexColors(
  sourceHex: string,
  targetHex: string,
  targetWeight: number,
): string {
  const source = toRgb(sourceHex);
  const target = toRgb(targetHex);
  if (!source || !target) return sourceHex;

  const weight = Math.max(0, Math.min(1, targetWeight));
  return toHex({
    r: source.r * (1 - weight) + target.r * weight,
    g: source.g * (1 - weight) + target.g * weight,
    b: source.b * (1 - weight) + target.b * weight,
  });
}

function shouldReplaceColor(value: unknown, defaultColor: string): boolean {
  const normalized = normalizeHexColorWithHash(value);
  if (!normalized) return true;
  return normalized === normalizeHexColorWithHash(defaultColor);
}

function shouldReplaceBorderColor(value: unknown): boolean {
  if (typeof value !== "string") return true;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  const normalizedHex = normalizeHexColorWithHash(normalized);
  if (!normalizedHex) {
    return DEFAULT_TEMPLATE_BORDER_COLORS.has(normalized);
  }
  return DEFAULT_TEMPLATE_BORDER_COLORS.has(normalizedHex);
}

function shouldReplaceLinkColor(value: unknown): boolean {
  if (typeof value !== "string") return true;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  const normalizedHex = normalizeHexColorWithHash(normalized);
  if (!normalizedHex) {
    return DEFAULT_TEMPLATE_LINK_COLORS.has(normalized);
  }
  return DEFAULT_TEMPLATE_LINK_COLORS.has(normalizedHex);
}

function isNumericButtonRadius(value: unknown): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed === "smooth" || trimmed === "round") return false;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) && parsed > 0;
  }
  return false;
}

export function getPreferredOrganizationLogoSrc(
  organization?: OrganizationBranding,
): string | null {
  const ignoredDefaultAssets = new Set([
    "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/V9V9woJ-p15PivASjXuq5gIW6xpgCb6Pes69i3.png",
    "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/xWeI0TM-GpziuotvjNV9MZnAaazSEJdQvKvsHP.png",
  ]);
  const logo = normalizeString(organization?.logo);
  if (logo && !ignoredDefaultAssets.has(logo)) return logo;

  const image = normalizeString(organization?.image);
  if (image && !ignoredDefaultAssets.has(image)) return image;

  return null;
}

export function getPreferredOrganizationBackgroundColor(
  organization?: OrganizationBranding,
): string | null {
  return normalizeHexColorWithHash(organization?.backgroundColor);
}

export function getPreferredOrganizationButtonColor(
  organization?: OrganizationBranding,
): string | null {
  return normalizeHexColorWithHash(organization?.buttonColor);
}

export function getPreferredOrganizationBorderColor(
  organization?: OrganizationBranding,
): string | null {
  const buttonColor = getPreferredOrganizationButtonColor(organization);
  if (!buttonColor) return null;

  const backgroundColor =
    getPreferredOrganizationBackgroundColor(organization) ??
    DEFAULT_TEMPLATE_BACKGROUND_COLOR;

  // Keep borders visible but softer than the primary button color.
  return mixHexColors(buttonColor, backgroundColor, 0.62);
}

export function applyOrganizationBrandingToEmailContent<T>(
  content: T,
  organization?: OrganizationBranding,
): T {
  const preferredLogoSrc =
    getPreferredOrganizationLogoSrc(organization) ?? DEFAULT_TEMPLATE_LOGO_URL;
  const preferredBackgroundColor =
    getPreferredOrganizationBackgroundColor(organization);
  const preferredButtonColor =
    getPreferredOrganizationButtonColor(organization);
  const preferredBorderColor =
    getPreferredOrganizationBorderColor(organization);

  const replaceLogoNodes = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      let changed = false;
      const nextArray = value.map((entry) => {
        const nextEntry = replaceLogoNodes(entry);
        if (nextEntry !== entry) changed = true;
        return nextEntry;
      });
      return changed ? nextArray : value;
    }

    if (!isRecord(value)) return value;

    let result: Record<string, unknown> = value;

    if (preferredButtonColor && Array.isArray(value.marks)) {
      let marksChanged = false;
      let hasLinkMark = false;
      let hasTextStyleMark = false;

      const nextMarks = value.marks.map((mark) => {
        if (!isRecord(mark)) return mark;
        if (mark.type === "link") {
          hasLinkMark = true;
        }
        if (mark.type !== "textStyle") {
          return mark;
        }

        hasTextStyleMark = true;
        const markAttrs = isRecord(mark.attrs) ? mark.attrs : {};
        const shouldReplace = shouldReplaceLinkColor(markAttrs.color);
        if (!shouldReplace) {
          return mark;
        }

        marksChanged = true;
        return {
          ...mark,
          attrs: {
            ...markAttrs,
            color: preferredButtonColor,
          },
        };
      });

      if (hasLinkMark && !hasTextStyleMark) {
        marksChanged = true;
        nextMarks.push({
          type: "textStyle",
          attrs: {
            color: preferredButtonColor,
          },
        });
      }

      if (marksChanged) {
        result = {
          ...result,
          marks: nextMarks,
        };
      }
    }

    const type = value.type;
    const attrs = value.attrs;
    const attrsRecord = isRecord(attrs) ? attrs : {};
    let nextAttrs: Record<string, unknown> = attrsRecord;
    let attrsChanged = false;

    if (type === "logo") {
      const src = normalizeString(attrsRecord.src);
      const shouldReplaceSrc = !src || src === DEFAULT_TEMPLATE_LOGO_URL;

      if (shouldReplaceSrc && preferredLogoSrc && src !== preferredLogoSrc) {
        nextAttrs = {
          ...nextAttrs,
          src: preferredLogoSrc,
        };
        attrsChanged = true;
      }
    }

    if (
      preferredBackgroundColor &&
      "backgroundColor" in attrsRecord &&
      shouldReplaceColor(
        attrsRecord.backgroundColor,
        DEFAULT_TEMPLATE_BACKGROUND_COLOR,
      )
    ) {
      nextAttrs = {
        ...nextAttrs,
        backgroundColor: preferredBackgroundColor,
      };
      attrsChanged = true;
    }

    if (
      preferredBorderColor &&
      "borderColor" in attrsRecord &&
      shouldReplaceBorderColor(attrsRecord.borderColor)
    ) {
      nextAttrs = {
        ...nextAttrs,
        borderColor: preferredBorderColor,
      };
      attrsChanged = true;
    }

    if (
      preferredButtonColor &&
      "buttonColor" in attrsRecord &&
      shouldReplaceColor(attrsRecord.buttonColor, DEFAULT_TEMPLATE_BUTTON_COLOR)
    ) {
      nextAttrs = {
        ...nextAttrs,
        buttonColor: preferredButtonColor,
      };
      attrsChanged = true;
    }

    // Backward compatibility: renderer only rounds buttons for "smooth"/"round".
    // Older content may store numeric borderRadius (e.g. 8), which renders square.
    if (type === "button" && isNumericButtonRadius(attrsRecord.borderRadius)) {
      nextAttrs = {
        ...nextAttrs,
        borderRadius: "smooth",
      };
      attrsChanged = true;
    }

    if (attrsChanged) {
      result = {
        ...result,
        attrs: nextAttrs,
      };
    }

    let hasChildChanges = false;
    const nextEntries = Object.entries(result).map(([key, entryValue]) => {
      const nextValue = replaceLogoNodes(entryValue);
      if (nextValue !== entryValue) hasChildChanges = true;
      return [key, nextValue] as const;
    });

    if (!hasChildChanges) return result;
    return Object.fromEntries(nextEntries);
  };

  return replaceLogoNodes(content) as T;
}

export function applyOrganizationLogoToEmailContent<T>(
  content: T,
  organization?: OrganizationBranding,
): T {
  return applyOrganizationBrandingToEmailContent(content, organization);
}
