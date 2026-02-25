import prisma from "@/lib/prisma";

export const DEFAULT_ORG_BACKGROUND_COLOR = "#ffffff";
export const DEFAULT_ORG_BUTTON_COLOR = "#1547E6";

type BrandingColumnsResult = {
  hasBackgroundColor: boolean;
  hasButtonColor: boolean;
};

type BrandingRow = {
  backgroundColor: string | null;
  buttonColor: string | null;
};

function normalizeHexOrDefault(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

export async function getOrganizationBrandColors(
  organizationId: string,
): Promise<{
  backgroundColor: string;
  buttonColor: string;
}> {
  try {
    const columns = await prisma.$queryRaw<BrandingColumnsResult[]>`
      SELECT
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'Organization'
            AND column_name = 'backgroundColor'
        ) AS "hasBackgroundColor",
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'Organization'
            AND column_name = 'buttonColor'
        ) AS "hasButtonColor"
    `;

    const hasColumns =
      columns[0]?.hasBackgroundColor && columns[0]?.hasButtonColor;

    if (!hasColumns) {
      return {
        backgroundColor: DEFAULT_ORG_BACKGROUND_COLOR,
        buttonColor: DEFAULT_ORG_BUTTON_COLOR,
      };
    }

    const rows = await prisma.$queryRaw<BrandingRow[]>`
      SELECT "backgroundColor", "buttonColor"
      FROM "Organization"
      WHERE "id" = ${organizationId}
      LIMIT 1
    `;

    const row = rows[0];
    return {
      backgroundColor: normalizeHexOrDefault(
        row?.backgroundColor,
        DEFAULT_ORG_BACKGROUND_COLOR,
      ),
      buttonColor: normalizeHexOrDefault(
        row?.buttonColor,
        DEFAULT_ORG_BUTTON_COLOR,
      ),
    };
  } catch {
    return {
      backgroundColor: DEFAULT_ORG_BACKGROUND_COLOR,
      buttonColor: DEFAULT_ORG_BUTTON_COLOR,
    };
  }
}
