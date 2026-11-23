#!/usr/bin/env python3
"""
tools/modules/aamchor_handler.py
Dedicated high-precision extractor for aamchor.com
Extracts:
  - Clean Video Title
  - Direct Video CDN Link (https://cdn.aamchor.com/videos/....mp4)
  - Direct Photo / Artwork CDN Link (https://cdn.aamchor.com/thumbnails/....jpg)
  - Full Video Description
"""

import re
import html
from urllib.parse import urlparse, urljoin
from .fetcher import fetch_html

def clean_text(text: str) -> str:
    """Unescapes HTML entities and normalizes whitespace."""
    if not text:
        return ""
    text = html.unescape(text)
    return re.sub(r'\s+', ' ', text).strip()

def extract_aamchor_single_video(url: str, html_text: str = None) -> dict:
    """
    Extracts high-fidelity Title, Video CDN, Photo CDN, and Description
    from any single video page on aamchor.com.
    """
    if not html_text:
        html_text = fetch_html(url)

    if not html_text:
        return None

    parsed = urlparse(url)
    slug = parsed.path.rstrip('/').split('/')[-1]

    # 1. Clean Video Title
    title = ""
    # Try H1 tag (primary on Aamchor)
    h1_m = re.search(r'<h1[^>]*>(.*?)</h1>', html_text, re.I | re.DOTALL)
    if h1_m:
        title = re.sub(r'<[^>]+>', '', h1_m.group(1)).strip()

    # Fallback to <title>
    if not title:
        t_m = re.search(r'<title[^>]*>(.*?)</title>', html_text, re.I | re.DOTALL)
        if t_m:
            title = re.sub(r'\s+', ' ', t_m.group(1)).strip()

    # Clean site suffix
    title = clean_text(title)
    title = re.sub(r'\s*[-|•–—]\s*(?:Aamchor|Watch Online|Full HD).*$', '', title, flags=re.I).strip()

    if not title:
        title = slug.replace('-', ' ').title()

    # 2. Extract Direct Video CDN Link (.mp4)
    video_cdn = ""
    v_matches = re.findall(r'https?://cdn\.aamchor\.com/videos/[^"\'\s<>\\]+\.mp4', html_text, re.I)
    for v in v_matches:
        clean_v = v.rstrip('\\').replace('\\/', '/')
        if slug in clean_v:
            video_cdn = clean_v
            break
        elif not video_cdn:
            video_cdn = clean_v

    # 3. Extract Direct Photo / Artwork CDN Link (.jpg)
    photo_cdn = ""
    img_matches = re.findall(r'https?://cdn\.aamchor\.com/thumbnails/[^"\'\s<>\\]+\.jpg', html_text, re.I)
    for img in img_matches:
        clean_img = img.rstrip('\\').replace('\\/', '/')
        if slug in clean_img:
            photo_cdn = clean_img
            break

    # Mutual derivation fallback (guarantees matching Video CDN & Photo CDN)
    if not photo_cdn and video_cdn:
        photo_cdn = video_cdn.replace('/videos/', '/thumbnails/').replace('.mp4', '.jpg')
    if not video_cdn and photo_cdn:
        video_cdn = photo_cdn.replace('/thumbnails/', '/videos/').replace('.jpg', '.mp4')

    # 4. Description Extraction
    description = ""
    desc_m = re.search(r'<meta[^>]+name=[\'"]description[\'"][^>]+content=[\'"]([^\'"]+)[\'"]', html_text, re.I)
    if desc_m:
        description = desc_m.group(1).strip()
    else:
        og_desc = re.search(r'property=[\'"]og:description[\'"][^>]+content=[\'"]([^\'"]+)[\'"]', html_text, re.I)
        if og_desc:
            description = og_desc.group(1).strip()

    description = clean_text(description)
    if not description or len(description) < 15:
        description = f"Curated stream: {title}. High-definition direct CDN delivery with zero compression degradation."

    return {
        'title': title,
        'video_url': video_cdn,
        'artwork_url': photo_cdn,
        'description': description,
        'author': 'Aamchor Curated',
        'source_url': url
    }

def discover_aamchor_gallery_items(url: str, html_text: str = None) -> list:
    """
    Extracts all video cards from an aamchor.com gallery or category page.
    """
    if not html_text:
        html_text = fetch_html(url)

    if not html_text:
        return []

    items = []
    seen = set()

    # Pattern for Next.js video card payload on Aamchor
    # Matches href="/videos/..." with thumbnail and title
    card_pattern = re.findall(
        r'href[\"\']:[\"\'](/videos/[^\"\']+)[\"\'].*?'
        r'src[\"\']:[\"\'](https://cdn\.aamchor\.com/thumbnails/[^\"\']+\.jpg)[\"\'].*?'
        r'alt[\"\']:[\"\']([^\"\']+)[\"\']',
        html_text,
        re.I
    )

    for href, thumb_src, alt_title in card_pattern:
        page_url = urljoin('https://aamchor.com', href)
        if page_url in seen:
            continue
        seen.add(page_url)

        clean_thumb = thumb_src.rstrip('\\').replace('\\/', '/')
        clean_video = clean_thumb.replace('/thumbnails/', '/videos/').replace('.jpg', '.mp4')
        clean_title = clean_text(alt_title)

        items.append({
            'title': clean_title,
            'video_url': clean_video,
            'artwork_url': clean_thumb,
            'description': f"Curated stream: {clean_title}. High-definition direct CDN delivery with zero compression degradation.",
            'author': 'Aamchor Curated',
            'source_url': page_url
        })

    return items
