import moment from "moment-timezone";

/** All valid IANA timezone names from moment-timezone. */
const TZ_NAMES = new Set(moment.tz.names());

/**
 * Returns true if the given string is a valid IANA timezone name.
 * Use this for server-side validation (e.g. updateOrganization).
 */
export function isValidTimezone(tz: string): boolean {
  return TZ_NAMES.has(tz.trim());
}

/**
 * Options for timezone select inputs: value is IANA name, label is human-readable.
 * Sorted by region then name so the dashboard dropdown is easy to scan.
 */
export function getTimezoneOptions(): { value: string; label: string }[] {
  const names = moment.tz.names();
  return names
    .map((value) => ({
      value,
      label: value.replace(/_/g, " "),
    }))
    .sort((a, b) => {
      const [regionA, cityA] = a.value.split("/");
      const [regionB, cityB] = b.value.split("/");
      if (regionA !== regionB) return regionA.localeCompare(regionB);
      return (cityA ?? "").localeCompare(cityB ?? "");
    });
}
