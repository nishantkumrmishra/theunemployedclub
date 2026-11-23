#!/usr/bin/env python3
"""
tools/modules/fetcher.py
Handles resilient HTTP fetching with TLS fingerprint bypass (curl.exe) and urllib fallback.
"""

import subprocess
import urllib.request
from urllib.parse import urlparse

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

DIRECT_MEDIA_EXTS = ('.mp4', '.m3u8', '.webm', '.mov', '.m4v', '.ts', '.mpd')

def is_direct_media_link(url: str) -> bool:
    """Checks if the URL is already a direct playable video stream."""
    clean = url.split('?')[0].lower()
    return any(clean.endswith(ext) for ext in DIRECT_MEDIA_EXTS)

def fetch_html(url: str, timeout: int = 15) -> str:
    """
    Fetches raw HTML from a URL.
    Uses system curl as primary fetcher to bypass TLS fingerprinting & bot blocks,
    falling back to urllib.request if curl fails.
    """
    p = urlparse(url)
    if 'aamchor.com' in p.netloc and (p.path == '' or p.path == '/'):
        url = 'https://aamchor.com/videos'

    # 1. Try system curl.exe
    try:
        res = subprocess.run(
            ['curl.exe', '-s', '-L', '-A', HEADERS['User-Agent'], url],
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='ignore',
            timeout=timeout
        )
        if res.returncode == 0 and res.stdout and len(res.stdout) > 50:
            return res.stdout
    except Exception:
        pass

    # 2. Fallback to urllib.request
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception:
        return ""
