#!/usr/bin/env python3
"""
Fetch a list of URLs from sources.txt, extract the visible text,
and save each page’s content into ethics-pages/<safe‑title>.txt.
"""

from pathlib import Path
import re
import sys
import time

import requests
from bs4 import BeautifulSoup

# ---------- Configuration ----------
URLS_FILE   = Path("sources.txt")
OUT_DIR     = Path("ethics-pages")
TIMEOUT     = 10        # seconds per request
RETRY_SLEEP = 2         # seconds between retries
# -------------------------------------

def sanitize_filename(title: str) -> str:
    """
    Convert a page title into a filesystem‑friendly filename.
    Non‑alphanumerics → underscore, leading/trailing whitespace stripped.
    Truncates to `max_len` characters.
    """
    # Keep alphanumerics, spaces, and a few punctuation marks
    clean = re.sub(r"[^A-Za-z0-9\s-]", "", title)
    clean = re.sub(r"\s+", "_", clean).strip("_")
    # Avoid an empty filename
    return clean[:250] or "untitled"

def fetch_page(url: str) -> str | None:
    """
    Download a page, returning its HTML text or None on failure.
    """
    try:
        resp = requests.get(url, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.text
    except Exception as exc:
        print(f"Failed to fetch {url}: {exc}", file=sys.stderr)
        return None

def extract_text(html: str) -> str:
    """
    Convert HTML to plain text using BeautifulSoup + lxml,
    collapse multiple blank lines, and return the result.
    """
    soup = BeautifulSoup(html, "lxml")
    text = soup.get_text()
    # Collapse two or more consecutive newlines into a single blank line
    return re.sub(r"\n{2,}", "\n\n", text).strip()

def main():
    # Ensure output directory exists
    OUT_DIR.mkdir(exist_ok=True)

    if not URLS_FILE.exists():
        print(f"URL list file not found: {URLS_FILE}", file=sys.stderr)
        sys.exit(1)

    # Read all URLs (skip blank lines & comments)
    urls = [line.strip() for line in URLS_FILE.read_text().splitlines()
            if line.strip() and not line.lstrip().startswith("#")]

    for url in urls:
        print(f"Processing: {url}")

        html = fetch_page(url)
        if html is None:
            print(f"  → Skipping due to fetch failure.", file=sys.stderr)
            continue

        # Grab the page title for the filename
        soup = BeautifulSoup(html, "lxml")
        title_tag = soup.find("title")
        title = title_tag.get_text() if title_tag else url

        safe_name = sanitize_filename(title) + ".txt"
        out_path = OUT_DIR / safe_name

        # Extract visible text and write to file
        text = extract_text(html)
        out_path.write_text(text, encoding="utf-8")

        print(f"  → Saved to {out_path}")

if __name__ == "__main__":
    main()
