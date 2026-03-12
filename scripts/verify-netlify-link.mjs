#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const EXPECTED_SITE_ID = "f79cfff3-186b-4b83-aa09-dd7e7d08913d";
const EXPECTED_SITE_NAME = "paytocommit-full-website-app";
const EXPECTED_PROJECT_URL = "https://paytocommit.com";
const EXPECTED_REMOTE = "https://github.com/rumizenzz/paytocommit-full-platform.git";

function fail(message) {
  console.error(`Netlify link check failed: ${message}`);
  process.exit(1);
}

function normalizeRemote(url) {
  return url.trim().replace(/\.git$/, "");
}

const repoRoot = process.cwd();
const statePath = path.join(repoRoot, ".netlify", "state.json");

if (!existsSync(statePath)) {
  fail(`missing .netlify/state.json. Re-link this repo to ${EXPECTED_SITE_NAME} (${EXPECTED_SITE_ID}).`);
}

let state;

try {
  state = JSON.parse(readFileSync(statePath, "utf8"));
} catch (error) {
  fail(`could not read .netlify/state.json: ${error instanceof Error ? error.message : String(error)}`);
}

if (state.siteId !== EXPECTED_SITE_ID) {
  fail(
    `linked to site ${state.siteId ?? "unknown"} instead of ${EXPECTED_SITE_NAME} (${EXPECTED_SITE_ID}).`,
  );
}

let remoteUrl = "";

try {
  remoteUrl = execFileSync("git", ["remote", "get-url", "origin"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
} catch (error) {
  fail(`could not read git remote origin: ${error instanceof Error ? error.message : String(error)}`);
}

if (normalizeRemote(remoteUrl) !== normalizeRemote(EXPECTED_REMOTE)) {
  fail(`git remote origin is ${remoteUrl.trim()} instead of ${EXPECTED_REMOTE}.`);
}

console.log(
  `Netlify link verified: ${EXPECTED_SITE_NAME} (${EXPECTED_SITE_ID}) -> ${EXPECTED_PROJECT_URL}`,
);
