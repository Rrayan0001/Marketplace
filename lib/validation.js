const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const VALIDATION_LIMITS = {
  vendorDescription: { min: 30, max: 600 },
  jobDescription: { min: 40, max: 1200 },
  quoteDetails: { min: 20, max: 500 },
};

export function normalizeDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function normalizeIndianPhone(value = "") {
  return normalizeDigits(value).slice(0, 10);
}

export function isValidIndianPhone(value = "") {
  return INDIAN_PHONE_REGEX.test(String(value));
}

export function normalizeGst(value = "") {
  return String(value).toUpperCase().replace(/\s+/g, "").trim();
}

export function isValidGst(value = "") {
  return GST_REGEX.test(normalizeGst(value));
}

export function isValidDescriptionLength(value = "", { min, max }) {
  const length = String(value).trim().length;
  return length >= min && length <= max;
}

export function getDescriptionLength(value = "") {
  return String(value).trim().length;
}
