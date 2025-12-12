/**
 * Validates that a string is a valid hex color code (3 or 6 hex digits)
 */
export function isValidHexColor(color: string | undefined): boolean {
  if (!color || typeof color !== "string") {
    return false;
  }
  return /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(color);
}

/**
 * Escapes HTML/JavaScript special characters in a string
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escapes JavaScript string special characters
 */
export function escapeJs(unsafe: string): string {
  return unsafe
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}
