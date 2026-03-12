import worldCountries from "world-countries";

type CountryRecord = {
  cca2: string;
  name: {
    common: string;
    official: string;
  };
};

const typedWorldCountries = worldCountries as CountryRecord[];

export type CountryOption = {
  code: string;
  label: string;
};

export type StateOption = {
  code: string;
  label: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = typedWorldCountries
  .map((country) => ({
    code: country.cca2,
    label: country.name.common,
  }))
  .sort((left, right) => left.label.localeCompare(right.label));

export const COUNTRY_NAME_TO_CODE = new Map(COUNTRY_OPTIONS.map((option) => [option.label, option.code]));
export const COUNTRY_CODE_TO_NAME = new Map(COUNTRY_OPTIONS.map((option) => [option.code, option.label]));

export const US_STATE_OPTIONS: StateOption[] = [
  { code: "AL", label: "Alabama" },
  { code: "AK", label: "Alaska" },
  { code: "AZ", label: "Arizona" },
  { code: "AR", label: "Arkansas" },
  { code: "CA", label: "California" },
  { code: "CO", label: "Colorado" },
  { code: "CT", label: "Connecticut" },
  { code: "DE", label: "Delaware" },
  { code: "FL", label: "Florida" },
  { code: "GA", label: "Georgia" },
  { code: "HI", label: "Hawaii" },
  { code: "ID", label: "Idaho" },
  { code: "IL", label: "Illinois" },
  { code: "IN", label: "Indiana" },
  { code: "IA", label: "Iowa" },
  { code: "KS", label: "Kansas" },
  { code: "KY", label: "Kentucky" },
  { code: "LA", label: "Louisiana" },
  { code: "ME", label: "Maine" },
  { code: "MD", label: "Maryland" },
  { code: "MA", label: "Massachusetts" },
  { code: "MI", label: "Michigan" },
  { code: "MN", label: "Minnesota" },
  { code: "MS", label: "Mississippi" },
  { code: "MO", label: "Missouri" },
  { code: "MT", label: "Montana" },
  { code: "NE", label: "Nebraska" },
  { code: "NV", label: "Nevada" },
  { code: "NH", label: "New Hampshire" },
  { code: "NJ", label: "New Jersey" },
  { code: "NM", label: "New Mexico" },
  { code: "NY", label: "New York" },
  { code: "NC", label: "North Carolina" },
  { code: "ND", label: "North Dakota" },
  { code: "OH", label: "Ohio" },
  { code: "OK", label: "Oklahoma" },
  { code: "OR", label: "Oregon" },
  { code: "PA", label: "Pennsylvania" },
  { code: "RI", label: "Rhode Island" },
  { code: "SC", label: "South Carolina" },
  { code: "SD", label: "South Dakota" },
  { code: "TN", label: "Tennessee" },
  { code: "TX", label: "Texas" },
  { code: "UT", label: "Utah" },
  { code: "VT", label: "Vermont" },
  { code: "VA", label: "Virginia" },
  { code: "WA", label: "Washington" },
  { code: "WV", label: "West Virginia" },
  { code: "WI", label: "Wisconsin" },
  { code: "WY", label: "Wyoming" },
  { code: "DC", label: "District of Columbia" },
];

export function getRegionLabel(country: string) {
  switch (country) {
    case "United States":
      return "State";
    case "Canada":
      return "Province / territory";
    case "Australia":
      return "State / territory";
    case "United Kingdom":
      return "County / nation";
    case "Ireland":
      return "County";
    default:
      return "Province / region";
  }
}

export function getRegionPlaceholder(country: string) {
  switch (country) {
    case "United States":
      return "Choose a state";
    case "Canada":
      return "Province or territory";
    case "Australia":
      return "State or territory";
    case "United Kingdom":
      return "County or nation";
    case "Ireland":
      return "County";
    default:
      return "Province, region, or state";
  }
}
