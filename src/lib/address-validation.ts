/**
 * International Address Validation Module
 * Provides utilities to validate shipping addresses worldwide with support for:
 * - United States (ZIP codes + states)
 * - Canada (Postal codes + provinces)
 * - United Kingdom (Postcodes + regions)
 * - Australia (Postcodes + states)
 */

// US State abbreviations and their postal codes ranges
const US_STATE_ZIP_RANGES: Record<string, { abbr: string; zipRanges: Array<{ min: number; max: number }> }> = {
  "Alabama": { abbr: "AL", zipRanges: [{ min: 35000, max: 36999 }] },
  "Alaska": { abbr: "AK", zipRanges: [{ min: 99500, max: 99999 }] },
  "Arizona": { abbr: "AZ", zipRanges: [{ min: 85000, max: 86999 }] },
  "Arkansas": { abbr: "AR", zipRanges: [{ min: 71600, max: 72999 }] },
  "California": { abbr: "CA", zipRanges: [{ min: 90000, max: 96199 }] },
  "Colorado": { abbr: "CO", zipRanges: [{ min: 80000, max: 81999 }] },
  "Connecticut": { abbr: "CT", zipRanges: [{ min: 6000, max: 6999 }] },
  "Delaware": { abbr: "DE", zipRanges: [{ min: 19700, max: 19999 }] },
  "Florida": { abbr: "FL", zipRanges: [{ min: 32000, max: 34999 }] },
  "Georgia": { abbr: "GA", zipRanges: [{ min: 30000, max: 31999 }] },
  "Hawaii": { abbr: "HI", zipRanges: [{ min: 96700, max: 96999 }] },
  "Idaho": { abbr: "ID", zipRanges: [{ min: 83200, max: 83999 }] },
  "Illinois": { abbr: "IL", zipRanges: [{ min: 60000, max: 62999 }] },
  "Indiana": { abbr: "IN", zipRanges: [{ min: 46000, max: 47999 }] },
  "Iowa": { abbr: "IA", zipRanges: [{ min: 50000, max: 52999 }] },
  "Kansas": { abbr: "KS", zipRanges: [{ min: 66000, max: 67999 }] },
  "Kentucky": { abbr: "KY", zipRanges: [{ min: 40000, max: 42999 }] },
  "Louisiana": { abbr: "LA", zipRanges: [{ min: 70100, max: 71499 }] },
  "Maine": { abbr: "ME", zipRanges: [{ min: 3900, max: 4992 }] },
  "Maryland": { abbr: "MD", zipRanges: [{ min: 20600, max: 21999 }] },
  "Massachusetts": { abbr: "MA", zipRanges: [{ min: 1000, max: 2799 }] },
  "Michigan": { abbr: "MI", zipRanges: [{ min: 48000, max: 49999 }] },
  "Minnesota": { abbr: "MN", zipRanges: [{ min: 55000, max: 56999 }] },
  "Mississippi": { abbr: "MS", zipRanges: [{ min: 38600, max: 39999 }] },
  "Missouri": { abbr: "MO", zipRanges: [{ min: 63000, max: 65999 }] },
  "Montana": { abbr: "MT", zipRanges: [{ min: 59000, max: 59999 }] },
  "Nebraska": { abbr: "NE", zipRanges: [{ min: 68000, max: 69999 }] },
  "Nevada": { abbr: "NV", zipRanges: [{ min: 88900, max: 89999 }] },
  "New Hampshire": { abbr: "NH", zipRanges: [{ min: 3000, max: 3899 }] },
  "New Jersey": { abbr: "NJ", zipRanges: [{ min: 7000, max: 8999 }] },
  "New Mexico": { abbr: "NM", zipRanges: [{ min: 87000, max: 88999 }] },
  "New York": { abbr: "NY", zipRanges: [{ min: 10000, max: 14999 }] },
  "North Carolina": { abbr: "NC", zipRanges: [{ min: 27000, max: 28999 }] },
  "North Dakota": { abbr: "ND", zipRanges: [{ min: 58000, max: 58999 }] },
  "Ohio": { abbr: "OH", zipRanges: [{ min: 43000, max: 45999 }] },
  "Oklahoma": { abbr: "OK", zipRanges: [{ min: 73000, max: 74999 }] },
  "Oregon": { abbr: "OR", zipRanges: [{ min: 97000, max: 97999 }] },
  "Pennsylvania": { abbr: "PA", zipRanges: [{ min: 15000, max: 19999 }] },
  "Rhode Island": { abbr: "RI", zipRanges: [{ min: 2800, max: 2999 }] },
  "South Carolina": { abbr: "SC", zipRanges: [{ min: 29000, max: 29999 }] },
  "South Dakota": { abbr: "SD", zipRanges: [{ min: 57000, max: 57999 }] },
  "Tennessee": { abbr: "TN", zipRanges: [{ min: 37000, max: 38999 }] },
  "Texas": { abbr: "TX", zipRanges: [{ min: 75000, max: 79999 }, { min: 87000, max: 88000 }] },
  "Utah": { abbr: "UT", zipRanges: [{ min: 84000, max: 84999 }] },
  "Vermont": { abbr: "VT", zipRanges: [{ min: 5000, max: 5999 }] },
  "Virginia": { abbr: "VA", zipRanges: [{ min: 20100, max: 24699 }] },
  "Washington": { abbr: "WA", zipRanges: [{ min: 98000, max: 99499 }] },
  "West Virginia": { abbr: "WV", zipRanges: [{ min: 24700, max: 26999 }] },
  "Wisconsin": { abbr: "WI", zipRanges: [{ min: 53000, max: 54999 }] },
  "Wyoming": { abbr: "WY", zipRanges: [{ min: 82000, max: 82999 }] },
};

// Canada provinces and postal code prefixes
const CANADA_PROVINCE_POSTAL_CODES: Record<string, { abbr: string; prefixes: string[] }> = {
  "Alberta": { abbr: "AB", prefixes: ["T"] },
  "British Columbia": { abbr: "BC", prefixes: ["V"] },
  "Manitoba": { abbr: "MB", prefixes: ["R"] },
  "New Brunswick": { abbr: "NB", prefixes: ["E"] },
  "Newfoundland and Labrador": { abbr: "NL", prefixes: ["A"] },
  "Northwest Territories": { abbr: "NT", prefixes: ["X"] },
  "Nova Scotia": { abbr: "NS", prefixes: ["B"] },
  "Nunavut": { abbr: "NU", prefixes: ["X"] },
  "Ontario": { abbr: "ON", prefixes: ["K", "L", "M", "N", "P"] },
  "Prince Edward Island": { abbr: "PE", prefixes: ["C"] },
  "Quebec": { abbr: "QC", prefixes: ["G", "H", "J"] },
  "Saskatchewan": { abbr: "SK", prefixes: ["S"] },
  "Yukon": { abbr: "YT", prefixes: ["Y"] },
};

// UK regions and postcode areas
const UK_REGION_POSTCODES: Record<string, { prefixes: string[] }> = {
  "England": { prefixes: ["B", "BR", "CB", "CM", "CO", "CR", "CT", "CV", "CW", "DA", "DE", "DH", "DL", "DN", "DR", "DT", "DY", "E", "EC", "EN", "EX", "FK", "FY", "G", "GL", "GU", "HA", "HD", "HG", "HP", "HR", "HS", "HU", "HX", "IG", "IP", "IV", "KA", "KT", "L", "LA", "LE", "LL", "LN", "LS", "LU", "M", "ME", "MK", "ML", "N", "NE", "NG", "NN", "NP", "NR", "NW", "OL", "OX", "PA", "PE", "PH", "PL", "PR", "RG", "RH", "RM", "S", "SA", "SE", "SG", "SK", "SL", "SM", "SN", "SO", "SP", "SR", "SS", "ST", "SW", "SY", "TA", "TD", "TF", "TN", "TR", "TS", "TW", "TY", "UB", "W", "WA", "WC", "WD", "WF", "WN", "WR", "WS", "WV", "YO", "ZE"] },
  "Scotland": { prefixes: ["EH", "FK", "G", "HS", "IV", "KA", "KY", "ML", "PA", "PH", "TD", "ZE"] },
  "Wales": { prefixes: ["CF", "LL", "NP", "SA", "SY"] },
  "Northern Ireland": { prefixes: ["BT"] },
};

// Australia states and postcode ranges
const AUSTRALIA_STATE_POSTCODES: Record<string, { abbr: string; ranges: Array<{ min: number; max: number }> }> = {
  "Australian Capital Territory": { abbr: "ACT", ranges: [{ min: 2600, max: 2699 }] },
  "New South Wales": { abbr: "NSW", ranges: [{ min: 1000, max: 2799 }] },
  "Northern Territory": { abbr: "NT", ranges: [{ min: 800, max: 899 }] },
  "Queensland": { abbr: "QLD", ranges: [{ min: 4000, max: 4999 }] },
  "South Australia": { abbr: "SA", ranges: [{ min: 5000, max: 5999 }] },
  "Tasmania": { abbr: "TAS", ranges: [{ min: 7000, max: 7999 }] },
  "Victoria": { abbr: "VIC", ranges: [{ min: 3000, max: 3999 }] },
  "Western Australia": { abbr: "WA", ranges: [{ min: 6000, max: 6999 }] },
};

export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ==================== US VALIDATION ====================

/**
 * Validates format of a ZIP code
 */
export function isValidZipCode(zipCode: string): boolean {
  // Basic US ZIP code format: 5 digits or 5+4 format
  return /^\d{5}(?:-\d{4})?$/.test(zipCode.trim());
}

/**
 * Checks if ZIP code matches the state
 */
export function isZipCodeInState(zipCode: string, state: string): boolean {
  const stateData = US_STATE_ZIP_RANGES[state];
  if (!stateData) {
    return true; // State not found in database, can't validate
  }

  const zipNum = parseInt(zipCode.split("-")[0], 10); // Get first 5 digits

  return stateData.zipRanges.some(
    (range) => zipNum >= range.min && zipNum <= range.max
  );
}

/**
 * Validates city name format
 */
export function isValidCityName(city: string): boolean {
  // City should have at least 2 characters, allow letters, spaces, hyphens, and apostrophes
  return /^[a-zA-Z\s\-']{2,}$/.test(city.trim());
}

/**
 * Validates phone number format (basic US)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Accept various US phone formats
  return /^[+]?[0-9\s\-()]{10,15}$/.test(phone.trim());
}

/**
 * Validates address line format
 */
export function isValidAddress(address: string): boolean {
  // Address should have at least 5 characters
  return address.trim().length >= 5;
}

// ==================== CANADA VALIDATION ====================

/**
 * Validates Canadian postal code format (A1A 1A1)
 */
export function isValidCanadianPostalCode(postalCode: string): boolean {
  // Canadian postal code format: A1A 1A1 or A1A1A1
  return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(postalCode.trim());
}

/**
 * Checks if postal code matches province
 */
export function isPostalCodeInProvince(postalCode: string, province: string): boolean {
  const provinceData = CANADA_PROVINCE_POSTAL_CODES[province];
  if (!provinceData) return true; // Province not found, can't validate

  const prefix = postalCode.trim().toUpperCase().charAt(0);
  return provinceData.prefixes.includes(prefix);
}

// ==================== UK VALIDATION ====================

/**
 * Validates UK postcode format (simplified)
 */
export function isValidUKPostcode(postcode: string): boolean {
  // Simplified UK postcode validation (full regex is very complex)
  // Postcodes can be: A9 9AA, A9A 9AA, A99 9AA, AA9 9AA, AA9A 9AA, AA99 9AA
  const trimmed = postcode.trim().toUpperCase();
  return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/.test(trimmed);
}

/**
 * Checks if postcode matches UK region
 */
export function isPostcodeInRegion(postcode: string, region: string): boolean {
  const regionData = UK_REGION_POSTCODES[region];
  if (!regionData) return true; // Region not found, can't validate

  const prefix = postcode.trim().toUpperCase().substring(0, 2);
  return regionData.prefixes.some((p) => prefix.startsWith(p));
}

// ==================== AUSTRALIA VALIDATION ====================

/**
 * Validates Australian postcode format
 */
export function isValidAustralianPostcode(postcode: string): boolean {
  // Australian postcodes are 4 digits
  return /^\d{4}$/.test(postcode.trim());
}

/**
 * Checks if postcode matches state
 */
export function isPostcodeInState(postcode: string, state: string): boolean {
  const stateData = AUSTRALIA_STATE_POSTCODES[state];
  if (!stateData) return true; // State not found, can't validate

  const postNum = parseInt(postcode.trim(), 10);
  return stateData.ranges.some((range) => postNum >= range.min && postNum <= range.max);
}

/**
 * Comprehensive address validation
 */
export function validateAddress(
  firstName: string,
  lastName: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  phone: string,
  country: string = "United States"
): AddressValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field checks
  if (!firstName || !firstName.trim()) {
    errors.push("First name is required");
  }
  if (!lastName || !lastName.trim()) {
    errors.push("Last name is required");
  }
  if (!address || !address.trim()) {
    errors.push("Address is required");
  }
  if (!city || !city.trim()) {
    errors.push("City is required");
  }
  if (!state || !state.trim()) {
    errors.push("State is required");
  }
  if (!zipCode || !zipCode.trim()) {
    errors.push("ZIP code is required");
  }
  if (!phone || !phone.trim()) {
    errors.push("Phone number is required");
  }

  // Format validations (only if fields are not empty)
  if (address.trim() && !isValidAddress(address)) {
    errors.push("Address must be at least 5 characters long");
  }

  if (city.trim() && !isValidCityName(city)) {
    errors.push("City name contains invalid characters");
  }

  if (phone.trim() && !isValidPhoneNumber(phone)) {
    errors.push("Phone number format is invalid");
  }

  // Country-specific postal code and state/province validation
  if (country === "United States") {
    if (zipCode.trim() && !isValidZipCode(zipCode)) {
      errors.push("ZIP code must be in format 12345 or 12345-6789");
    }

    // ZIP code to state alignment check
    if (zipCode.trim() && state) {
      if (isValidZipCode(zipCode) && !isZipCodeInState(zipCode, state)) {
        errors.push(
          `ZIP code ${zipCode} does not match the selected state ${state}. Please verify.`
        );
      }
    }
  } else if (country === "Canada") {
    if (zipCode.trim() && !isValidCanadianPostalCode(zipCode)) {
      errors.push("Postal code must be in format A1A 1A1");
    }

    // Postal code to province alignment check
    if (zipCode.trim() && state) {
      if (
        isValidCanadianPostalCode(zipCode) &&
        !isPostalCodeInProvince(zipCode, state)
      ) {
        errors.push(
          `Postal code ${zipCode} does not match the selected province ${state}. Please verify.`
        );
      }
    }
  } else if (country === "United Kingdom") {
    if (zipCode.trim() && !isValidUKPostcode(zipCode)) {
      errors.push("Postcode must be in valid UK format (e.g., SW1A 2AA)");
    }

    // Postcode to region alignment check
    if (zipCode.trim() && state) {
      if (isValidUKPostcode(zipCode) && !isPostcodeInRegion(zipCode, state)) {
        errors.push(
          `Postcode ${zipCode} does not match the selected region ${state}. Please verify.`
        );
      }
    }
  } else if (country === "Australia") {
    if (zipCode.trim() && !isValidAustralianPostcode(zipCode)) {
      errors.push("Postcode must be 4 digits");
    }

    // Postcode to state alignment check
    if (zipCode.trim() && state) {
      if (
        isValidAustralianPostcode(zipCode) &&
        !isPostcodeInState(zipCode, state)
      ) {
        errors.push(
          `Postcode ${zipCode} does not match the selected state ${state}. Please verify.`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates individual address field with country support
 */
export function validateAddressField(
  fieldName: string,
  value: string,
  state?: string,
  country: string = "United States"
): { isValid: boolean; error?: string } {
  // Handle postal code field (name differs by country)
  const isPostalCodeField = ["zipCode", "postalCode", "postcode"].includes(
    fieldName
  );

  if (isPostalCodeField) {
    if (!value.trim()) {
      const label =
        country === "United States"
          ? "ZIP code"
          : country === "Canada"
            ? "Postal code"
            : "Postcode";
      return { isValid: false, error: `${label} is required` };
    }

    if (country === "United States") {
      if (!isValidZipCode(value)) {
        return {
          isValid: false,
          error: "ZIP code must be in format 12345 or 12345-6789",
        };
      }
      if (state && !isZipCodeInState(value, state)) {
        return {
          isValid: false,
          error: `ZIP code ${value} does not match the selected state ${state}`,
        };
      }
    } else if (country === "Canada") {
      if (!isValidCanadianPostalCode(value)) {
        return {
          isValid: false,
          error: "Postal code must be in format A1A 1A1",
        };
      }
      if (state && !isPostalCodeInProvince(value, state)) {
        return {
          isValid: false,
          error: `Postal code ${value} does not match the selected province ${state}`,
        };
      }
    } else if (country === "United Kingdom") {
      if (!isValidUKPostcode(value)) {
        return {
          isValid: false,
          error: "Postcode must be in valid UK format (e.g., SW1A 2AA)",
        };
      }
      if (state && !isPostcodeInRegion(value, state)) {
        return {
          isValid: false,
          error: `Postcode ${value} does not match the selected region ${state}`,
        };
      }
    } else if (country === "Australia") {
      if (!isValidAustralianPostcode(value)) {
        return {
          isValid: false,
          error: "Postcode must be 4 digits",
        };
      }
      if (state && !isPostcodeInState(value, state)) {
        return {
          isValid: false,
          error: `Postcode ${value} does not match the selected state ${state}`,
        };
      }
    }
    return { isValid: true };
  }

  switch (fieldName) {
    case "city":
      if (!value.trim()) {
        return { isValid: false, error: "City is required" };
      }
      if (!isValidCityName(value)) {
        return {
          isValid: false,
          error: "City name contains invalid characters",
        };
      }
      return { isValid: true };

    case "phone":
      if (!value.trim()) {
        return { isValid: false, error: "Phone number is required" };
      }
      if (!isValidPhoneNumber(value)) {
        return { isValid: false, error: "Invalid phone number format" };
      }
      return { isValid: true };

    case "address":
      if (!value.trim()) {
        return { isValid: false, error: "Address is required" };
      }
      if (!isValidAddress(value)) {
        return {
          isValid: false,
          error: "Address must be at least 5 characters long",
        };
      }
      return { isValid: true };

    default:
      return { isValid: true };
  }
}
