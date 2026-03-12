"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";

import { BrandLockup, BrandMark } from "@/components/brand-mark";
import { useSharedWalletState } from "@/components/live-data-hooks";
import { buildAuthHref } from "@/lib/auth-flow";
import { getIdentityValidationError } from "@/lib/identity-validation";
import {
  COUNTRY_NAME_TO_CODE,
  COUNTRY_OPTIONS,
  US_STATE_OPTIONS,
  getRegionLabel,
  getRegionPlaceholder,
} from "@/lib/location-options";
import type { IdentityProfile } from "@/lib/types";

type VerifyView = "ask" | "details" | "pending" | "verified" | "failed_retry";
const footerLinks = [
  { href: "/docs", label: "Docs AI" },
  { href: "/legal", label: "Legal" },
] as const;
const fundingUnlocks = ["Apple Pay", "Google Pay", "Debit Card", "ACH / Wire"] as const;

type AddressSuggestion = {
  label: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

function getViewFromIdentity(identity: IdentityProfile | null, requestedStep: string | null): VerifyView {
  if (identity?.status === "verified") {
    return "verified";
  }

  if (identity?.status === "failed") {
    return "failed_retry";
  }

  if (requestedStep === "pending" || identity?.status === "pending") {
    return "pending";
  }

  if (requestedStep === "details") {
    return "details";
  }

  return "ask";
}

export function IdentityVerifyScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const walletState = useSharedWalletState();
  const viewer = walletState.viewer;
  const viewerId = viewer?.id ?? null;
  const requestedStep = searchParams.get("step");
  const [identity, setIdentity] = useState<IdentityProfile | null>(null);
  const [view, setView] = useState<VerifyView>(() => getViewFromIdentity(null, requestedStep));
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressLookupPending, setAddressLookupPending] = useState(false);
  const [addressLookupOpen, setAddressLookupOpen] = useState(false);
  const [addressActiveIndex, setAddressActiveIndex] = useState(0);
  const [acceptedAddressQuery, setAcceptedAddressQuery] = useState<string | null>(null);
  const [countryQuery, setCountryQuery] = useState("");
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [countryActiveIndex, setCountryActiveIndex] = useState(0);
  const [regionQuery, setRegionQuery] = useState("");
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [regionActiveIndex, setRegionActiveIndex] = useState(0);

  const authCtas = useMemo(
    () => ({
      login: buildAuthHref("login", "/app/verify"),
      signup: buildAuthHref("signup", "/app/verify"),
    }),
    [],
  );
  const progressSteps = useMemo(() => {
    const verifyState =
      view === "verified"
        ? "complete"
        : view === "pending"
          ? "pending"
          : view === "failed_retry"
            ? "retry"
            : "active";

    return [
      { label: "Account", state: "complete" },
      { label: "Verify", state: verifyState },
      { label: "Fund", state: view === "verified" ? "active" : "upcoming" },
    ] as const;
  }, [view]);
  const guestProgressSteps = [
    { label: "Account", state: "active" },
    { label: "Verify", state: "upcoming" },
    { label: "Fund", state: "upcoming" },
  ] as const;
  const regionLabel = useMemo(() => getRegionLabel(country), [country]);
  const regionPlaceholder = useMemo(() => getRegionPlaceholder(country), [country]);
  const isUnitedStates = country === "United States";
  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query || query === country.trim().toLowerCase()) {
      return COUNTRY_OPTIONS;
    }

    return COUNTRY_OPTIONS.filter((option) => option.label.toLowerCase().includes(query)).slice(0, 18);
  }, [country, countryQuery]);
  const filteredStates = useMemo(() => {
    const query = regionQuery.trim().toLowerCase();
    if (!query || query === region.trim().toLowerCase()) {
      return US_STATE_OPTIONS;
    }

    return US_STATE_OPTIONS.filter((option) => option.label.toLowerCase().includes(query));
  }, [region, regionQuery]);

  useEffect(() => {
    if (!viewerId) {
      return;
    }

    let cancelled = false;

    async function loadIdentity() {
      const response = await fetch("/api/profile/identity", { cache: "no-store" });
      const json = (await response.json()) as { error?: string; identity?: IdentityProfile };

      if (!response.ok || cancelled) {
        if (!cancelled) {
          setNotice(json.error ?? "Unable to load identity right now.");
        }
        return;
      }

      if (!json.identity) {
        return;
      }

      const nextIdentity = json.identity;
      setIdentity(nextIdentity);
      setFullName(nextIdentity.fullName);
      setBirthDate(nextIdentity.birthDate);
      setAddressLine1(nextIdentity.addressLine1);
      setCity(nextIdentity.city);
      setRegion(nextIdentity.region);
      setPostalCode(nextIdentity.postalCode);
      setCountry(nextIdentity.country || "United States");
      setView((current) => {
        const next = getViewFromIdentity(nextIdentity, requestedStep);
        if (current === "details" && next === "ask") {
          return "details";
        }
        return next;
      });
    }

    void loadIdentity();

    return () => {
      cancelled = true;
    };
  }, [requestedStep, viewerId]);

  useEffect(() => {
    if (view !== "pending" || !viewerId) {
      return;
    }

    const interval = window.setInterval(async () => {
      const response = await fetch("/api/profile/identity", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const json = (await response.json()) as { identity?: IdentityProfile };
      if (!json.identity) {
        return;
      }

      setIdentity(json.identity);
      setView(getViewFromIdentity(json.identity, requestedStep));
    }, 4500);

    return () => window.clearInterval(interval);
  }, [requestedStep, view, viewerId]);

  useEffect(() => {
    if (view !== "details") {
      setAddressSuggestions([]);
      setAddressLookupOpen(false);
      setAddressLookupPending(false);
      return;
    }

    const query = addressLine1.trim();
    if (query.length < 4) {
      setAddressSuggestions([]);
      setAddressLookupOpen(false);
      setAddressLookupPending(false);
      return;
    }

    const normalizedQuery = query.toLowerCase();
    if (acceptedAddressQuery && normalizedQuery === acceptedAddressQuery) {
      setAddressSuggestions([]);
      setAddressLookupOpen(false);
      setAddressLookupPending(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setAddressLookupPending(true);

      try {
        const response = await fetch(
          `/api/location/autocomplete?q=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}&region=${encodeURIComponent(region)}&city=${encodeURIComponent(city)}&postalCode=${encodeURIComponent(postalCode)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const json = (await response.json()) as { suggestions?: AddressSuggestion[] };
        if (!response.ok) {
          setAddressSuggestions([]);
          setAddressLookupOpen(false);
          return;
        }

        setAddressSuggestions(json.suggestions ?? []);
        setAddressActiveIndex(0);
        setAddressLookupOpen((json.suggestions?.length ?? 0) > 0);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setAddressSuggestions([]);
          setAddressLookupOpen(false);
        }
      } finally {
        setAddressLookupPending(false);
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [acceptedAddressQuery, addressLine1, city, country, postalCode, region, view]);

  useEffect(() => {
    if (!isUnitedStates) {
      return;
    }

    if (!region) {
      return;
    }

    const matchesState = US_STATE_OPTIONS.some((option) => option.label === region);
    if (!matchesState) {
      setRegion("");
    }
  }, [isUnitedStates, region]);

  async function saveIdentityDetails() {
    const validationError = getIdentityValidationError({
      fullName,
      birthDate,
      addressLine1,
      city,
      region,
      postalCode,
      country,
    });

    if (validationError) {
      setNotice(validationError);
      return null;
    }

    setPending(true);
    setNotice(null);

    const response = await fetch("/api/profile/identity", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        birthDate,
        addressLine1,
        city,
        region,
        postalCode,
        country,
      }),
    });

    const json = (await response.json()) as { error?: string; identity?: IdentityProfile };
    setPending(false);

    if (!response.ok || !json.identity) {
      setNotice(json.error ?? "Unable to save identity details.");
      return null;
    }

    setIdentity(json.identity);
    return json.identity;
  }

  async function beginVerification() {
    const saved = await saveIdentityDetails();
    if (!saved) {
      return;
    }

    setPending(true);

    const response = await fetch("/api/identity/session", {
      method: "POST",
    });
    const json = (await response.json()) as { error?: string; url?: string };

    if (!response.ok || !json.url) {
      setPending(false);
      setNotice(json.error ?? "Unable to begin verification.");
      return;
    }

    window.location.assign(json.url);
  }

  function selectCountry(nextCountry: string) {
    setCountry(nextCountry);
    setCountryQuery(nextCountry);
    setCountryMenuOpen(false);
    setCountryActiveIndex(0);
    setAddressSuggestions([]);
    setAddressLookupOpen(false);

    if (nextCountry !== "United States" && isUnitedStates) {
      setRegion("");
      setRegionQuery("");
    }
  }

  function selectRegion(nextRegion: string) {
    setRegion(nextRegion);
    setRegionQuery(nextRegion);
    setRegionMenuOpen(false);
    setRegionActiveIndex(0);
  }

  function applyAddressSuggestion(suggestion: AddressSuggestion) {
    setAddressLine1(suggestion.addressLine1 || addressLine1);
    setCity(suggestion.city || city);
    setPostalCode(suggestion.postalCode || postalCode);

    if (suggestion.country && COUNTRY_NAME_TO_CODE.has(suggestion.country)) {
      setCountry(suggestion.country);
    }

    if (suggestion.country === "United States") {
      const matchedState = US_STATE_OPTIONS.find(
        (option) =>
          option.label.toLowerCase() === suggestion.region.toLowerCase() ||
          option.code.toLowerCase() === suggestion.region.toLowerCase(),
      );
      const nextRegion = matchedState?.label ?? suggestion.region;
      setRegion(nextRegion);
      setRegionQuery(nextRegion);
    } else {
      const nextRegion = suggestion.region || region;
      setRegion(nextRegion);
      setRegionQuery(nextRegion);
    }

    setAcceptedAddressQuery((suggestion.addressLine1 || addressLine1).trim().toLowerCase());
    setAddressLookupOpen(false);
    setAddressSuggestions([]);
    setAddressActiveIndex(0);
  }

  function handleAddressKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!addressLookupOpen || addressSuggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setAddressActiveIndex((current) => Math.min(current + 1, addressSuggestions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setAddressActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      applyAddressSuggestion(addressSuggestions[addressActiveIndex] ?? addressSuggestions[0]);
      return;
    }

    if (event.key === "Escape") {
      setAddressLookupOpen(false);
    }
  }

  function handleCountryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!countryMenuOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setCountryMenuOpen(true);
      }
      return;
    }

    if (!filteredCountries.length) {
      if (event.key === "Escape") {
        setCountryMenuOpen(false);
        setCountryQuery(country);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCountryActiveIndex((current) => Math.min(current + 1, filteredCountries.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCountryActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      selectCountry(filteredCountries[countryActiveIndex]?.label ?? filteredCountries[0].label);
      return;
    }

    if (event.key === "Escape") {
      setCountryMenuOpen(false);
      setCountryQuery(country);
    }
  }

  function handleRegionKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!regionMenuOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setRegionMenuOpen(true);
      }
      return;
    }

    if (!filteredStates.length) {
      if (event.key === "Escape") {
        setRegionMenuOpen(false);
        setRegionQuery(region);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setRegionActiveIndex((current) => Math.min(current + 1, filteredStates.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setRegionActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      selectRegion(filteredStates[regionActiveIndex]?.label ?? filteredStates[0].label);
      return;
    }

    if (event.key === "Escape") {
      setRegionMenuOpen(false);
      setRegionQuery(region);
    }
  }

  if (!viewer) {
    return (
      <section className="auth-screen funding-screen funding-screen-verify">
        <div className="auth-screen-grid funding-screen-grid">
          <div className="auth-brand-hero">
            <Link aria-label="PayToCommit home" className="auth-brand-link" href="/">
              <BrandLockup />
            </Link>
          </div>

          <div className="funding-panel">
            <div className="auth-panel-glow" aria-hidden="true" />
            <div className="funding-panel-core funding-panel-core-center">
              <div className="auth-progress-strip funding-progress-strip" aria-label="Funding flow progress">
                {guestProgressSteps.map((step) => (
                  <span
                    key={step.label}
                    className={`auth-progress-chip ${step.state === "active" ? "is-active" : ""}`}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
              <span className="funding-screen-heading">Verify identity</span>
              <h1 className="funding-title funding-title-prompt">Secure funding starts after sign in</h1>
              <p className="detail-text funding-copy funding-copy-compact">
                Log in or create your account to continue into identity verification and wallet funding.
              </p>
              <div className="button-row funding-button-row funding-button-row-narrow">
                <Link className="action-primary auth-submit-stage" href={authCtas.login}>
                  Log In
                </Link>
                <Link className="action-secondary funding-secondary-button" href={authCtas.signup}>
                  Sign Up
                </Link>
              </div>
            </div>
          </div>

          <div className="funding-bottom-mark" aria-hidden="true">
            <BrandMark />
          </div>

          <div className="funding-footer">
            <div className="auth-footer-links">
              {footerLinks.map((link) => (
                <Link key={link.href} className="auth-footer-link" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const detailsForm = (
    <div className="section-stack funding-form-stack">
      <div className="section-stack section-stack-tight">
        <span className="funding-state-chip">Identity details</span>
        <h1 className="funding-title funding-title-form">Enter the legal details tied to your government ID.</h1>
        <p className="detail-text funding-copy">
          Finish this step, then continue into Stripe Identity for the document and selfie check when required.
        </p>
      </div>

      <div className="funding-identity-note">
        <span className="mono-label">Secure funding</span>
        <p>Funding unlocks after legal details, government ID capture, and the final identity result are all complete.</p>
      </div>

      <div className="auth-form">
        <label className="field-stack">
          <span className="field-label">Full legal name</span>
          <input
            className="auth-input auth-input-stage funding-text-input"
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Full legal name"
            type="text"
            value={fullName}
          />
        </label>

        <div className="funding-form-grid">
          <label className="field-stack">
            <span className="field-label">Date of birth</span>
            <span className="funding-field-shell funding-field-shell-date">
              <span className="funding-field-icon" aria-hidden="true">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20">
                  <rect height="13" rx="3" stroke="currentColor" strokeWidth="1.4" width="15" x="2.5" y="4.5" />
                  <path d="M6 2.75v3.5M14 2.75v3.5M2.75 7.5h14.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
                </svg>
              </span>
              <span className="funding-field-body">
                <span className="funding-field-caption">Use the date on your government ID</span>
                <input
                  className="auth-input auth-input-stage funding-text-input funding-date-input"
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setBirthDate(event.target.value)}
                  type="date"
                  value={birthDate}
                />
              </span>
            </span>
          </label>

          <label className="field-stack">
            <span className="field-label">Country</span>
            <span className="funding-field-shell funding-field-shell-country">
              <span className="funding-field-icon" aria-hidden="true">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20">
                  <circle cx="10" cy="10" r="6.6" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3.8 10h12.4M10 3.8c2.2 2.15 3.3 4.22 3.3 6.2S12.2 14.05 10 16.2c-2.2-2.15-3.3-4.22-3.3-6.2S7.8 5.95 10 3.8Z" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
              <span className="funding-field-body funding-field-body-address">
                <span className="funding-field-caption">Search and select your country</span>
                <input
                  aria-controls="identity-country-options"
                  aria-expanded={countryMenuOpen}
                  autoComplete="off"
                  className="auth-input auth-input-stage funding-text-input"
                  onBlur={() =>
                    window.setTimeout(() => {
                      setCountryMenuOpen(false);
                      setCountryQuery(country);
                    }, 140)
                  }
                  onChange={(event) => {
                    setCountryQuery(event.target.value);
                    setCountryMenuOpen(true);
                    setCountryActiveIndex(0);
                  }}
                  onFocus={() => {
                    setCountryMenuOpen(true);
                    setCountryQuery(country);
                    setCountryActiveIndex(
                      Math.max(
                        COUNTRY_OPTIONS.findIndex((option) => option.label === country),
                        0,
                      ),
                    );
                  }}
                  onKeyDown={handleCountryKeyDown}
                  placeholder="Search countries"
                  role="combobox"
                  value={countryMenuOpen ? countryQuery : country}
                />
                {countryMenuOpen ? (
                  <span
                    className="funding-address-autocomplete funding-country-autocomplete"
                    id="identity-country-options"
                    role="listbox"
                  >
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((option, index) => (
                        <button
                          key={option.code}
                          className={`button-reset funding-address-option ${
                            index === countryActiveIndex ? "is-active" : ""
                          }`}
                          onClick={() => selectCountry(option.label)}
                          type="button"
                        >
                          <span className="funding-address-option-label">{option.label}</span>
                          <span className="funding-address-option-meta">{option.code}</span>
                        </button>
                      ))
                    ) : (
                      <span className="funding-address-status">No countries matched that search yet.</span>
                    )}
                  </span>
                ) : null}
              </span>
            </span>
          </label>
        </div>

        <label className="field-stack">
          <span className="field-label">Address line 1</span>
          <span className="funding-field-shell funding-field-shell-address">
            <span className="funding-field-icon" aria-hidden="true">
              <svg fill="none" height="20" viewBox="0 0 20 20" width="20">
                <path
                  d="M10 17.25s5-4.4 5-8.85A5 5 0 0 0 5 8.4c0 4.45 5 8.85 5 8.85Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <circle cx="10" cy="8.25" r="1.85" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            <span className="funding-field-body funding-field-body-address">
              <span className="funding-field-caption">Start typing to auto-fill your address</span>
              <input
                className="auth-input auth-input-stage funding-text-input"
                onBlur={() => window.setTimeout(() => setAddressLookupOpen(false), 140)}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setAddressLine1(nextValue);
                  if (acceptedAddressQuery && nextValue.trim().toLowerCase() !== acceptedAddressQuery) {
                    setAcceptedAddressQuery(null);
                  }
                  setAddressLookupOpen(true);
                  setAddressActiveIndex(0);
                }}
                onFocus={() => {
                  if (addressSuggestions.length > 0) {
                    setAddressLookupOpen(true);
                  }
                }}
                onKeyDown={handleAddressKeyDown}
                placeholder="Street address"
                type="text"
                value={addressLine1}
              />
              {addressLookupOpen ? (
                <span className="funding-address-autocomplete" role="listbox">
                  {addressLookupPending ? (
                    <span className="funding-address-status">Looking up matching addresses...</span>
                  ) : addressSuggestions.length > 0 ? (
                    addressSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.label}
                        className={`button-reset funding-address-option ${
                          index === addressActiveIndex ? "is-active" : ""
                        }`}
                        onClick={() => applyAddressSuggestion(suggestion)}
                        type="button"
                      >
                        <span className="funding-address-option-label">{suggestion.addressLine1}</span>
                        <span className="funding-address-option-meta">
                          {[suggestion.city, suggestion.region, suggestion.postalCode, suggestion.country]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </button>
                    ))
                  ) : (
                    <span className="funding-address-status">Keep typing to see address suggestions.</span>
                  )}
                </span>
              ) : null}
            </span>
          </span>
        </label>

        <div className="funding-form-grid funding-form-grid-three">
          <label className="field-stack">
            <span className="field-label">City</span>
            <input
              className="auth-input auth-input-stage funding-text-input"
              onChange={(event) => setCity(event.target.value)}
              placeholder="City"
              type="text"
              value={city}
            />
          </label>

          <label className="field-stack">
            <span className="field-label">{regionLabel}</span>
            {isUnitedStates ? (
              <span className="funding-field-shell funding-field-shell-country">
                <span className="funding-field-icon" aria-hidden="true">
                  <svg fill="none" height="20" viewBox="0 0 20 20" width="20">
                    <path d="M4 6.25h12M4 10h12M4 13.75h12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
                  </svg>
                </span>
                <span className="funding-field-body funding-field-body-address">
                  <span className="funding-field-caption">Search and select a state</span>
                  <input
                    aria-controls="identity-region-options"
                    aria-expanded={regionMenuOpen}
                    autoComplete="off"
                    className="auth-input auth-input-stage funding-text-input"
                    onBlur={() =>
                      window.setTimeout(() => {
                      setRegionMenuOpen(false);
                      setRegionQuery(region);
                    }, 140)
                  }
                  onChange={(event) => {
                      setRegionQuery(event.target.value);
                      setRegionMenuOpen(true);
                      setRegionActiveIndex(0);
                    }}
                  onFocus={() => {
                    setRegionMenuOpen(true);
                    setRegionQuery(region);
                    setRegionActiveIndex(
                      Math.max(
                        US_STATE_OPTIONS.findIndex((option) => option.label === region),
                        0,
                      ),
                    );
                  }}
                    onKeyDown={handleRegionKeyDown}
                    placeholder="Search states"
                    role="combobox"
                    value={regionMenuOpen ? regionQuery : region}
                  />
                  {regionMenuOpen ? (
                    <span
                      className="funding-address-autocomplete funding-country-autocomplete"
                      id="identity-region-options"
                      role="listbox"
                    >
                      {filteredStates.length > 0 ? (
                        filteredStates.map((option, index) => (
                          <button
                            key={option.code}
                            className={`button-reset funding-address-option ${
                              index === regionActiveIndex ? "is-active" : ""
                            }`}
                            onClick={() => selectRegion(option.label)}
                            type="button"
                          >
                            <span className="funding-address-option-label">{option.label}</span>
                            <span className="funding-address-option-meta">{option.code}</span>
                          </button>
                        ))
                      ) : (
                        <span className="funding-address-status">No states matched that search yet.</span>
                      )}
                    </span>
                  ) : null}
                </span>
              </span>
            ) : (
              <input
                className="auth-input auth-input-stage funding-text-input"
                onChange={(event) => setRegion(event.target.value)}
                placeholder={regionPlaceholder}
                type="text"
                value={region}
              />
            )}
          </label>

          <label className="field-stack">
            <span className="field-label">Postal code</span>
            <input
              className="auth-input auth-input-stage funding-text-input"
              onChange={(event) => setPostalCode(event.target.value)}
              placeholder="ZIP / postal code"
              type="text"
              value={postalCode}
            />
          </label>
        </div>
      </div>

      <div className="funding-button-column">
        <button className="action-primary auth-submit-stage" disabled={pending} onClick={() => void beginVerification()} type="button">
          {pending ? "Opening verification..." : "Continue to ID check"}
        </button>
        <button className="action-secondary funding-secondary-button" onClick={() => setView("ask")} type="button">
          Back
        </button>
      </div>
    </div>
  );

  return (
    <section className="auth-screen funding-screen funding-screen-verify">
      <div className="auth-screen-grid funding-screen-grid">
        <div className="auth-brand-hero">
          <Link aria-label="PayToCommit home" className="auth-brand-link" href="/">
            <BrandLockup />
          </Link>
        </div>

        <div className="funding-panel">
          <div className="auth-panel-glow" aria-hidden="true" />
          <div className="funding-panel-core">
            <div className="auth-progress-strip funding-progress-strip" aria-label="Funding flow progress">
              {progressSteps.map((step) => (
                <span
                  key={step.label}
                  className={`auth-progress-chip ${
                    step.state === "active" ? "is-active" : step.state === "complete" ? "is-complete" : ""
                  } ${step.state === "pending" ? "is-pending" : ""} ${step.state === "retry" ? "is-retry" : ""}`}
                >
                  {step.label}
                </span>
              ))}
            </div>

            {view === "ask" ? (
              <div className="section-stack section-stack-tight funding-prompt-block">
                <span className="funding-state-chip">Galactus asks:</span>
                <h1 className="funding-title funding-title-prompt">Is now a good time to verify your identity and unlock secure funding?</h1>
                <p className="funding-copy">
                  Verify once to unlock Apple Pay, Google Pay, debit card, and ACH / wire funding.
                </p>
                <div className="funding-unlock-strip" aria-label="Funding methods">
                  {fundingUnlocks.map((item) => (
                    <span key={item} className="funding-unlock-chip">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="funding-button-column">
                  <button className="action-primary auth-submit-stage" onClick={() => setView("details")} type="button">
                    Yes, let&apos;s begin
                  </button>
                  <Link className="action-secondary funding-secondary-button" href="/app">
                    No, later
                  </Link>
                </div>
              </div>
            ) : null}

            {view === "details" ? detailsForm : null}

            {view === "pending" ? (
              <div className="section-stack section-stack-tight funding-prompt-block">
                <span className="funding-state-chip">Verification in progress</span>
                <h1 className="funding-title funding-title-prompt">Your identity check is still in progress.</h1>
                <p className="funding-copy">
                  Keep this page open or return in a moment. Funding unlocks as soon as Stripe finishes the identity check.
                </p>
                <div className="funding-button-column">
                  <button className="action-primary auth-submit-stage" onClick={() => router.refresh()} type="button">
                    Check again
                  </button>
                  <Link className="action-secondary funding-secondary-button" href="/app">
                    Back to board
                  </Link>
                </div>
              </div>
            ) : null}

            {view === "verified" ? (
              <div className="section-stack section-stack-tight funding-prompt-block">
                <span className="funding-state-chip funding-state-chip-success">Verified</span>
                <h1 className="funding-title funding-title-prompt">Identity complete. Secure funding is unlocked.</h1>
                <p className="funding-copy">
                  Your legal identity is now locked to this account. Continue to choose how cash moves into your wallet.
                </p>
                <div className="funding-unlock-strip" aria-label="Funding methods">
                  {fundingUnlocks.map((item) => (
                    <span key={item} className="funding-unlock-chip is-available">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="funding-button-column">
                  <Link className="action-primary auth-submit-stage" href="/app/wallet/fund">
                    Continue to funding
                  </Link>
                </div>
              </div>
            ) : null}

            {view === "failed_retry" ? (
              <div className="section-stack section-stack-tight funding-prompt-block">
                <span className="funding-state-chip funding-state-chip-failed">Verification retry required</span>
                <h1 className="funding-title funding-title-prompt">We need one more identity check before funding unlocks.</h1>
                <p className="funding-copy">
                  {identity?.failedReason || "Review your details, then retry verification."}
                </p>
                <div className="funding-button-column">
                  <button className="action-primary auth-submit-stage" onClick={() => setView("details")} type="button">
                    Retry verification
                  </button>
                  <Link className="action-secondary funding-secondary-button" href="/app">
                    No, later
                  </Link>
                </div>
              </div>
            ) : null}

            {notice ? <div className="form-notice auth-notice">{notice}</div> : null}
          </div>
        </div>

        <div className="funding-bottom-mark" aria-hidden="true">
          <BrandMark />
        </div>

        <div className="funding-footer">
          <div className="auth-footer-links">
            {footerLinks.map((link) => (
              <Link key={link.href} className="auth-footer-link" href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
