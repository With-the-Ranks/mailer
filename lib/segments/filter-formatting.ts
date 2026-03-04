const FILTER_LABELS: Record<string, string> = {
  tags: "Tags",
  defaultAddressCompany: "Organization",
  defaultAddressCountryCode: "Country",
  defaultAddressProvinceCode: "Precinct",
  defaultAddressCity: "City",
  defaultAddressZip: "Zip Code",
  defaultAddressPhone: "Phone",
  defaultAddressAddress1: "Address",
  defaultAddressAddress2: "Address 2",
};

export function formatSegmentFilterLabel(key: string) {
  if (FILTER_LABELS[key]) return FILTER_LABELS[key];
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function summarizeSegmentFilterValue(value: unknown) {
  if (Array.isArray(value)) {
    if (value.length === 0) return "";
    const values = value.map((v) => String(v));
    const preview = values.slice(0, 2).join(", ");
    return values.length > 2 ? `${preview} +${values.length - 2}` : preview;
  }
  if (value == null) return "";
  return String(value).trim();
}
