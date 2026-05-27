/**
 * UK Postcode validation regex (Official UK Gov API format)
 */
export const UK_POSTCODE_REGEX = /^(GIR ?0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]([0-9]?[ABEHMNPRV-Y])?)|[0-9][A-HJKPS-UW]) ?[0-9][ABD-HJLNP-UW-Z]{2})$/i;

/**
 * Validates whether a given string is a valid UK postcode.
 */
export function validateUKPostcode(postcode: string): boolean {
  if (!postcode) return false;
  const clean = postcode.trim();
  return UK_POSTCODE_REGEX.test(clean);
}

/**
 * Automatically formats a UK postcode to standard UPPERCASE with a single space.
 * Example: "sw1a1aa" -> "SW1A 1AA", "  ec1a  2bp " -> "EC1A 2BP"
 */
export function formatUKPostcode(postcode: string): string {
  if (!postcode) return "";
  
  // Convert to uppercase and strip non-alphanumeric/spaces
  let clean = postcode.toUpperCase().replace(/[^A-Z0-9]/g, "");
  
  // Inward code is always the last 3 characters
  if (clean.length > 3) {
    const outward = clean.slice(0, -3);
    const inward = clean.slice(-3);
    return `${outward} ${inward}`;
  }
  
  return clean;
}

/**
 * Validates that the selected/entered country belongs to the United Kingdom.
 */
export function isUKCountry(country: string): boolean {
  if (!country) return false;
  const clean = country.trim().toUpperCase();
  const validUKNames = [
    "UNITED KINGDOM",
    "UK",
    "U.K.",
    "GB",
    "GREAT BRITAIN",
    "ENGLAND",
    "SCOTLAND",
    "WALES",
    "NORTHERN IRELAND"
  ];
  return validUKNames.includes(clean);
}
