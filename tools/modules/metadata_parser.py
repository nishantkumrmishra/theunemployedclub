#!/usr/bin/env python3
"""
tools/modules/metadata_parser.py
Parses Title, Description, Author/Channel, and Duration from HTML using BeautifulSoup and regex fallbacks.
"""

import re
import html
from urllib.parse import urlparse

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

def clean_text(text: str) -> str:
    """Unescapes HTML entities and normalizes whitespace."""
    if not text:
        return ""
    text = html.unescape(text)
    return re.sub(r'\s+', ' ', text).strip()

def clean_title(title: str) -> str:
    """Strips common site branding suffixes from video titles."""
    title = clean_text(title)
    # Remove common site name suffixes
    title = re.sub(r'\s*[-|•–—]\s*(?:YouTube|Vimeo|Dailymotion|Aamchor|Video|Watch Online).*$', '', title, flags=re.IGNORECASE)
    return title.strip()

def parse_metadata(html_text: str, url: str) -> dict:
    """Extracts title, description, and author from page HTML."""
    title = ""
    description = ""
    author = "The Unemployed Club"

    if HAS_BS4 and html_text:
        try:
            soup = BeautifulSoup(html_text, 'html.parser')

            # 1. Title Extraction
            og_title = soup.find('meta', property='og:title') or soup.find('meta', attrs={'name': 'og:title'})
            tw_title = soup.find('meta', attrs={'name': 'twitter:title'})
            tag_title = soup.find('title')
            h1_tag = soup.find('h1')

            if og_title and og_title.get('content'):
                title = og_title['content']
            elif tw_title and tw_title.get('content'):
                title = tw_title['content']
            elif tag_title and tag_title.string:
                title = tag_title.string
            elif h1_tag:
                title = h1_tag.get_text()

            # 2. Description Extraction
            og_desc = soup.find('meta', property='og:description') or soup.find('meta', attrs={'name': 'og:description'})
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            tw_desc = soup.find('meta', attrs={'name': 'twitter:description'})

            if og_desc and og_desc.get('content'):
                description = og_desc['content']
            elif meta_desc and meta_desc.get('content'):
                description = meta_desc['content']
            elif tw_desc and tw_desc.get('content'):
                description = tw_desc['content']

            # 3. Author / Channel
            author_meta = soup.find('meta', attrs={'name': 'author'}) or soup.find('meta', property='og:site_name')
            if author_meta and author_meta.get('content'):
                author = author_meta['content'].strip()
        except Exception:
            pass

    # Regex Fallback if BeautifulSoup was unavailable or tags were empty
    if not title and html_text:
        m = re.search(r'<meta[^>]+property=[\'"]og:title[\'"][^>]+content=[\'"]([^\'"]+)[\'"]', html_text, re.I)
        if not m:
            m = re.search(r'<meta[^>]+content=[\'"]([^\'"]+)[\'"][^>]+property=[\'"]og:title[\'"]', html_text, re.I)
        if not m:
            m = re.search(r'<title[^>]*>([^<]+)</title>', html_text, re.I)
        if m:
            title = m.group(1)

    if not description and html_text:
        m = re.search(r'<meta[^>]+(?:name|property)=[\'"](?:description|og:description)[\'"][^>]+content=[\'"]([^\'"]+)[\'"]', html_text, re.I)
        if not m:
            m = re.search(r'<meta[^>]+content=[\'"]([^\'"]+)[\'"][^>]+(?:name|property)=[\'"](?:description|og:description)[\'"]', html_text, re.I)
        if m:
            description = m.group(1)

    # Fallback to URL path slug if title could not be parsed
    if not title:
        parsed = urlparse(url)
        slug = parsed.path.rstrip('/').split('/')[-1]
        slug = re.sub(r'[-_]', ' ', slug).title()
        title = slug if slug else "Curated Video Stream"

    title = clean_title(title)
    description = clean_text(description)
    if not description:
        description = "Curated stream matching the classic editorial aesthetic. Zero compression degradation • High fidelity audio pacing."

    return {
        'title': title,
        'description': description,
        'author': author
    }
