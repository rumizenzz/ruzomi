type IdentityDraft = {
  fullName: string;
  birthDate: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

function calculateAge(birthDate: string) {
  const now = new Date();
  const date = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  let age = now.getFullYear() - date.getFullYear();
  const beforeBirthday =
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());

  if (beforeBirthday) {
    age -= 1;
  }

  return age;
}

export function getIdentityValidationError(draft: IdentityDraft) {
  if (!draft.fullName.trim()) {
    return "Enter your full legal name to continue.";
  }

  if (!draft.birthDate.trim()) {
    return "Choose your date of birth to continue.";
  }

  const age = calculateAge(draft.birthDate.trim());
  if (age === null) {
    return "Enter a valid date of birth to continue.";
  }

  if (age < 18) {
    return "You must be at least 18 years old to verify identity for live funding.";
  }

  if (!draft.country.trim()) {
    return "Choose your country to continue.";
  }

  if (!draft.addressLine1.trim()) {
    return "Enter your street address to continue.";
  }

  if (!draft.city.trim()) {
    return "Enter your city to continue.";
  }

  if (!draft.region.trim()) {
    return "Choose your state, province, or region to continue.";
  }

  if (!draft.postalCode.trim()) {
    return "Enter your ZIP or postal code to continue.";
  }

  return null;
}
