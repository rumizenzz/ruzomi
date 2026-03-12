#!/usr/bin/env python3
from __future__ import annotations

import argparse
import pathlib
import re
import sys

ROOTS = [
    "src/app",
    "src/components",
    "src/lib/mock-data.ts",
]

FAIL_PATTERNS = [
    r"Global Commitment Console",
    r"operating lane",
    r"core surfaces",
    r"review lanes",
    r"operational spine",
    r"operational memory",
    r"starting structure",
    r"backstage",
]

REVIEW_PATTERNS = [
    r"\breliability\b",
    r"\bworkflow\b",
    r"\boperational\b",
    r"\bplatform\b",
    r"\bservice\b",
    r"\bcontrols\b",
]

TEXT_EXTENSIONS = {".ts", ".tsx", ".md", ".txt", ".py"}


def iter_files(repo_root: pathlib.Path):
    for root in ROOTS:
      path = repo_root / root
      if path.is_file():
          yield path
          continue
      if not path.exists():
          continue
      for file_path in path.rglob("*"):
          if file_path.is_file() and file_path.suffix in TEXT_EXTENSIONS:
              if any(part.startswith(".") and part not in {".", ".."} for part in file_path.parts):
                  continue
              yield file_path


def scan_file(file_path: pathlib.Path):
    text = file_path.read_text(encoding="utf-8", errors="ignore")
    fails = [pattern for pattern in FAIL_PATTERNS if re.search(pattern, text, flags=re.IGNORECASE)]
    reviews = [pattern for pattern in REVIEW_PATTERNS if re.search(pattern, text, flags=re.IGNORECASE)]
    if fails:
        return "fail", fails
    if reviews:
        return "review", reviews
    return "clean", []


def main() -> int:
    parser = argparse.ArgumentParser(description="Scan user-facing strings for fourth-wall and internal-language leaks.")
    parser.add_argument("repo_root", nargs="?", default=".", help="Path to the repository root")
    args = parser.parse_args()

    repo_root = pathlib.Path(args.repo_root).resolve()
    verdicts = {"fail": [], "review": [], "clean": []}

    for file_path in iter_files(repo_root):
        verdict, matches = scan_file(file_path)
        verdicts[verdict].append((file_path.relative_to(repo_root), matches))

    for verdict in ("fail", "review", "clean"):
        for file_path, matches in sorted(verdicts[verdict], key=lambda item: str(item[0])):
            suffix = f" :: {', '.join(matches)}" if matches else ""
            print(f"{verdict:>6}  {file_path}{suffix}")

    print()
    print(
        "Summary:",
        f"{len(verdicts['fail'])} fail,",
        f"{len(verdicts['review'])} review,",
        f"{len(verdicts['clean'])} clean",
    )

    return 1 if verdicts["fail"] else 0


if __name__ == "__main__":
    sys.exit(main())
