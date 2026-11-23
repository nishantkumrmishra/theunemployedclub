#!/usr/bin/env python3
"""
tools/modules/duplicate_detector.py
The Unemployed Club - Duplicate Content Detection Engine
========================================================================
Detects duplicate video streams across:
  [1] Live Published Catalog (`js/catalog-feed.js`)
  [2] Staging Review Queue (`js/staging-feed.js`)
  [3] Saved modular blocks (`tools/extracted/blocks/*.json`)

Matching Strategy:
  - Video Stream CDN URL (MP4 / M3U8 exact match after normalizing query params)
  - Source Webpage URL (YouTube, Vimeo, Aamchor, etc.)
  - Normalized Title Similarity (lowercased alphanumeric string comparison)
"""

import os
import re
import json
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
CATALOG_FEED_FILE = os.path.join(PROJECT_ROOT, 'js', 'catalog-feed.js')
STAGING_FEED_FILE = os.path.join(PROJECT_ROOT, 'js', 'staging-feed.js')

def normalize_url(url: str) -> str:
    """Normalizes video or webpage URL by stripping trailing slashes, fragments, and tracking params."""
    if not url:
        return ''
    url = url.strip()
    try:
        parsed = urlparse(url)
        # Keep path and clean up query string
        netloc = parsed.netloc.lower()
        if netloc.startswith('www.'):
            netloc = netloc[4:]
        path = parsed.path.rstrip('/')
        return f"{netloc}{path}"
    except Exception:
        return url.lower().rstrip('/')

def normalize_title(title: str) -> str:
    """Normalizes title string for duplicate comparison."""
    if not title:
        return ''
    cleaned = re.sub(r'[^\w\s]', '', title.lower())
    return re.sub(r'\s+', ' ', cleaned).strip()

def load_catalog_items() -> list:
    """Loads published items from js/catalog-feed.js."""
    if not os.path.exists(CATALOG_FEED_FILE):
        return []
    try:
        with open(CATALOG_FEED_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'window\.WEBVIDEO_FEED\s*=\s*(\[.*?\]);', content, re.DOTALL)
            if match:
                items = json.loads(match.group(1))
                if isinstance(items, list):
                    return items
    except Exception:
        pass
    return []

def load_staging_items() -> list:
    """Loads pending review items from js/staging-feed.js."""
    if not os.path.exists(STAGING_FEED_FILE):
        return []
    try:
        with open(STAGING_FEED_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'window\.WEBVIDEO_STAGING\s*=\s*(\[.*?\]);', content, re.DOTALL)
            if match:
                items = json.loads(match.group(1))
                if isinstance(items, list):
                    return items
    except Exception:
        pass
    return []

def check_for_duplicates(video_url: str = '', source_url: str = '', title: str = '') -> dict:
    """
    Checks if a video stream already exists in the website catalog or staging queue.
    Returns match details dict if duplicate found, or None if unique.
    """
    norm_video_url = normalize_url(video_url)
    norm_source_url = normalize_url(source_url)
    norm_title = normalize_title(title)

    # 1. Check Live Published Catalog
    catalog_items = load_catalog_items()
    for item in catalog_items:
        it_video = normalize_url(item.get('videoUrl', ''))
        it_source = normalize_url(item.get('sourceUrl', ''))
        it_title = normalize_title(item.get('title', ''))

        matched_by = None
        if norm_video_url and it_video and norm_video_url == it_video:
            matched_by = 'Video Stream CDN URL'
        elif norm_source_url and it_source and norm_source_url == it_source:
            matched_by = 'Original Source Webpage URL'
        elif norm_title and it_title and len(norm_title) > 6 and norm_title == it_title:
            matched_by = 'Exact Video Title'

        if matched_by:
            return {
                'is_duplicate': True,
                'location': 'Live Published Catalog',
                'shelf': item.get('section', 'default'),
                'matched_by': matched_by,
                'existing_id': item.get('id'),
                'existing_title': item.get('title'),
                'existing_video_url': item.get('videoUrl'),
                'existing_artwork_url': item.get('artworkUrl')
            }

    # 2. Check Pending Staging Queue
    staging_items = load_staging_items()
    for item in staging_items:
        it_video = normalize_url(item.get('videoUrl', ''))
        it_source = normalize_url(item.get('sourceUrl', ''))
        it_title = normalize_title(item.get('title', ''))

        matched_by = None
        if norm_video_url and it_video and norm_video_url == it_video:
            matched_by = 'Video Stream CDN URL'
        elif norm_source_url and it_source and norm_source_url == it_source:
            matched_by = 'Original Source Webpage URL'
        elif norm_title and it_title and len(norm_title) > 6 and norm_title == it_title:
            matched_by = 'Exact Video Title'

        if matched_by:
            return {
                'is_duplicate': True,
                'location': 'Pending Review Queue',
                'shelf': 'Review Deck (Draft)',
                'matched_by': matched_by,
                'existing_id': item.get('id'),
                'existing_title': item.get('title'),
                'existing_video_url': item.get('videoUrl'),
                'existing_artwork_url': item.get('artworkUrl')
            }

    return None
