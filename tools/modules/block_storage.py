#!/usr/bin/env python3
"""
tools/modules/block_storage.py
Organizes and persists extracted video blocks into modular JSON blocks and human-readable text blocks.
"""

import os
import re
import json
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTRACTED_DIR = os.path.join(BASE_DIR, 'extracted')
BLOCKS_DIR = os.path.join(EXTRACTED_DIR, 'blocks')
TXT_FILE = os.path.join(EXTRACTED_DIR, 'extracted_videos.txt')
CATALOG_FILE = os.path.join(EXTRACTED_DIR, 'extracted_catalog.json')

def ensure_storage_dirs():
    """Ensures storage directories exist."""
    os.makedirs(BLOCKS_DIR, exist_ok=True)

def slugify(text: str) -> str:
    """Generates filesystem-safe slug from title."""
    text = re.sub(r'[^\w\s-]', '', text.lower())
    return re.sub(r'[-\s]+', '_', text).strip('_')[:40]

def save_extracted_block(record: dict) -> str:
    """
    Saves an extracted video record into:
      1. Individual JSON chunk in extracted/blocks/
      2. Appends formatted text block into extracted/extracted_videos.txt
      3. Updates extracted/extracted_catalog.json
    Returns the path to the saved JSON block file.
    """
    ensure_storage_dirs()

    # Assign unique block identifier & timestamp
    ts = int(time.time())
    title = record.get('title', 'Video Stream')
    slug = slugify(title) or 'stream'
    block_id = f"block_{ts}_{slug}"
    record['id'] = block_id
    record['extracted_at'] = time.strftime('%Y-%m-%d %H:%M:%S')

    # 1. Save individual JSON block chunk
    block_filename = f"{block_id}.json"
    block_path = os.path.join(BLOCKS_DIR, block_filename)
    with open(block_path, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2, ensure_ascii=False)

    # 2. Append formatted text block to extracted_videos.txt
    text_block = (
        f"======================================================================\n"
        f"Title:       {record.get('title', 'N/A')}\n"
        f"Video CDN:   {record.get('video_url', 'N/A')}\n"
        f"Photo CDN:   {record.get('artwork_url', 'N/A')}\n"
        f"Description: {record.get('description', 'N/A')}\n"
        f"Author:      {record.get('author', 'The Unemployed Club')}\n"
        f"Block File:  blocks/{block_filename}\n"
        f"Original:    {record.get('source_url', 'N/A')}\n"
        f"======================================================================\n\n"
    )

    with open(TXT_FILE, 'a', encoding='utf-8') as f:
        f.write(text_block)

    # 3. Update consolidated catalog JSON
    all_blocks = []
    if os.path.exists(CATALOG_FILE):
        try:
            with open(CATALOG_FILE, 'r', encoding='utf-8') as f:
                all_blocks = json.load(f)
                if not isinstance(all_blocks, list):
                    all_blocks = []
        except Exception:
            all_blocks = []

    # Avoid duplicate source URLs in catalog array
    all_blocks = [b for b in all_blocks if b.get('source_url') != record.get('source_url')]
    all_blocks.append(record)

    with open(CATALOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_blocks, f, indent=2, ensure_ascii=False)

    return block_path

def load_all_blocks() -> list:
    """Loads all extracted JSON blocks."""
    if os.path.exists(CATALOG_FILE):
        try:
            with open(CATALOG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return []
