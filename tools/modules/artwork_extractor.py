#!/usr/bin/env python3
"""
tools/modules/artwork_extractor.py
Extracts Photo / Artwork CDN Link (Cover Poster / OpenGraph Image / Thumbnail).
"""

import re
from urllib.parse import urljoin

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

def extract_artwork(html_text: str, page_url: str) -> str:
    """Extracts photo/artwork CDN URL from page HTML."""
    artwork_url = ""

    if HAS_BS4 and html_text:
        try:
            soup = BeautifulSoup(html_text, 'html.parser')

            # 1. OpenGraph & Twitter Image
            for prop in ['og:image', 'og:image:secure_url', 'twitter:image', 'thumbnail']:
                tag = soup.find('meta', property=prop) or soup.find('meta', attrs={'name': prop})
                if tag and tag.get('content'):
                    artwork_url = tag['content'].strip()
                    break

            # 2. HTML5 Video Poster
            if not artwork_url:
                v_tag = soup.find('video')
                if v_tag and v_tag.get('poster'):
                    artwork_url = v_tag['poster'].strip()

            # 3. Rel Image Src
            if not artwork_url:
                link_img = soup.find('link', rel=lambda r: r and 'image_src' in r)
                if link_img and link_img.get('href'):
                    artwork_url = link_img['href'].strip()
        except Exception:
            pass

    # Regex fallback
    if not artwork_url and html_text:
        m = re.search(r'<meta[^>]+(?:property|name)=[\'"](?:og:image|twitter:image)[\'"][^>]+content=[\'"]([^\'"]+)[\'"]', html_text, re.I)
        if not m:
            m = re.search(r'<meta[^>]+content=[\'"]([^\'"]+)[\'"][^>]+(?:property|name)=[\'"](?:og:image|twitter:image)[\'"]', html_text, re.I)
        if not m:
            m = re.search(r'<video[^>]+poster=[\'"]([^\'"]+)[\'"]', html_text, re.I)
        if m:
            artwork_url = m.group(1).strip()

    if artwork_url:
        artwork_url = urljoin(page_url, artwork_url)

    return artwork_url
