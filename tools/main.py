#!/usr/bin/env python3
"""
tools/main.py
The Unemployed Club - Modular Video Link & Stream Extractor
========================================================================
Takes any video link and extracts:
  [1] Video Title
  [2] Video CDN Stream Link (MP4 / M3U8 / Embed)
  [3] Photo / Artwork CDN Link (Cover Poster / OpenGraph Image)
  [4] Description

Modular chunk architecture:
  - modules/fetcher.py          -> TLS fingerprint bypass & HTTP request
  - modules/aamchor_handler.py  -> Dedicated high-precision extractor for aamchor.com
  - modules/metadata_parser.py  -> Title & description extraction
  - modules/stream_extractor.py -> Video stream extraction
  - modules/artwork_extractor.py-> Photo / artwork extraction
  - modules/block_storage.py    -> Persists modular data blocks to extracted/blocks/

Usage:
  extractor.bat                              # 1-Click launcher
  python tools/main.py                       # Interactive loop: paste link, get block
  python tools/main.py <URL>                 # Extract single link
  python tools/main.py <URL> --json          # Output clean JSON
  python tools/main.py --file <links.txt>    # Batch process list of URLs
  python tools/main.py --list                # List previously extracted blocks
"""

import sys
import os
import json
import argparse
from urllib.parse import urlparse

# Ensure tools directory is in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from modules.fetcher import fetch_html, is_direct_media_link
from modules.aamchor_handler import extract_aamchor_single_video, discover_aamchor_gallery_items
from modules.metadata_parser import parse_metadata
from modules.stream_extractor import extract_stream, extract_with_ytdlp
from modules.artwork_extractor import extract_artwork
from modules.block_storage import save_extracted_block, load_all_blocks, TXT_FILE, BLOCKS_DIR

def extract_video_link(url: str, verbose: bool = True) -> dict:
    """Extracts all required fields from a single URL and persists data block."""
    url = url.strip()
    if not url:
        return None

    if not url.startswith('http://') and not url.startswith('https://'):
        url = 'https://' + url

    if verbose:
        print(f"\n[*] Fetching stream metadata: {url}")

    # Case A: URL is already a direct video stream (.mp4, .m3u8)
    if is_direct_media_link(url):
        filename = os.path.basename(urlparse(url).path)
        title = filename.replace('_', ' ').replace('-', ' ').rsplit('.', 1)[0].title()
        record = {
            'title': title,
            'video_url': url,
            'artwork_url': 'images/pic01.jpg',
            'description': 'Direct CDN video stream. Zero compression degradation • High fidelity audio pacing.',
            'author': 'The Unemployed Club',
            'source_url': url
        }
        block_path = save_extracted_block(record)
        if verbose:
            print(f"[+] Saved modular block: {os.path.basename(block_path)}")
        return record

    # Case B: aamchor.com dedicated extraction
    if 'aamchor.com' in url.lower():
        parsed = urlparse(url)
        path = parsed.path.rstrip('/')
        is_gallery = path in ['', '/videos', '/video'] or '/filter/' in path

        if is_gallery:
            gallery_items = discover_aamchor_gallery_items(url)
            if gallery_items:
                if verbose:
                    print(f"[+] Discovered {len(gallery_items)} videos on Aamchor gallery. Saving modular blocks...")
                for item in gallery_items:
                    save_extracted_block(item)
                return gallery_items[0]

        rec = extract_aamchor_single_video(url)
        if rec and rec.get('video_url'):
            block_path = save_extracted_block(rec)
            if verbose:
                print(f"[+] Saved modular block: {os.path.basename(block_path)}")
            return rec

    # Case C: Standard webpage / streaming portal
    html_text = fetch_html(url)
    meta = parse_metadata(html_text, url)
    artwork = extract_artwork(html_text, url)
    stream = extract_stream(html_text, url, artwork)

    # Fallback if stream was empty: check yt-dlp directly
    if not stream:
        yt_res = extract_with_ytdlp(url)
        if yt_res:
            stream = yt_res.get('video_url', '')
            if not artwork and yt_res.get('artwork_url'):
                artwork = yt_res.get('artwork_url')
            if yt_res.get('title'):
                meta['title'] = yt_res.get('title')
            if yt_res.get('description'):
                meta['description'] = yt_res.get('description')

    if not artwork:
        artwork = 'images/pic01.jpg'
    if not stream:
        stream = url  # Fallback to source URL if direct stream couldn't be extracted

    record = {
        'title': meta['title'],
        'video_url': stream,
        'artwork_url': artwork,
        'description': meta['description'],
        'author': meta['author'],
        'source_url': url
    }

    block_path = save_extracted_block(record)
    if verbose:
        print(f"[+] Saved modular block: {os.path.basename(block_path)}")

    return record

def print_record_banner(record: dict):
    """Prints extracted record in clean copy-paste format for Admin Studio."""
    print("\n" + "=" * 70)
    print("SUCCESSFULLY EXTRACTED VIDEO DATA BLOCK")
    print("=" * 70)
    print(f"Video Title:         {record.get('title')}")
    print(f"Video CDN URL:       {record.get('video_url')}")
    print(f"Photo / Artwork CDN: {record.get('artwork_url')}")
    print(f"Description:         {record.get('description')}")
    print(f"Author / Channel:    {record.get('author')}")
    print("-" * 70)
    print("Ready to paste directly into Admin Studio (admin.html)!")
    print(f"Saved into: tools/extracted/extracted_videos.txt")
    print("=" * 70 + "\n")

def interactive_loop():
    """Runs continuous interactive loop: paste link, get metadata."""
    print("=" * 70)
    print("The Unemployed Club - Modular Video Link & Stream Extractor")
    print("=" * 70)
    print("Supports aamchor.com, Direct CDNs (.mp4/.m3u8), YouTube, Vimeo, and more.")
    print("Paste any video link to extract Title, Video CDN, Artwork, & Description.")
    print("Data blocks are saved modularly into tools/extracted/blocks/\n")

    while True:
        try:
            line = input("Enter video URL (or 'q' to quit): ").strip()
            if not line:
                continue
            if line.lower() in ['q', 'quit', 'exit']:
                print("\nExiting extractor. Have a great day!")
                break

            record = extract_video_link(line, verbose=True)
            if record:
                print_record_banner(record)
            else:
                print("[!] Could not extract data from the provided URL.")
        except KeyboardInterrupt:
            print("\n\nExtraction session paused.")
            break
        except Exception as e:
            print(f"[!] Error extracting link: {e}")

def main():
    parser = argparse.ArgumentParser(description="The Unemployed Club - Modular Stream Extractor")
    parser.add_argument("url", nargs="?", help="Single video URL to extract")
    parser.add_argument("--json", action="store_true", help="Print extracted data as raw JSON")
    parser.add_argument("--file", "-f", help="Path to text file containing URLs to batch extract")
    parser.add_argument("--list", action="store_true", help="List all previously saved video blocks")

    args = parser.parse_args()

    if args.list:
        blocks = load_all_blocks()
        print(f"\n--- Saved Video Blocks ({len(blocks)}) ---")
        for i, b in enumerate(blocks, 1):
            print(f"{i}. {b.get('title')} [{b.get('id', 'N/A')}]")
            print(f"   Video: {b.get('video_url')}")
            print(f"   Photo: {b.get('artwork_url')}\n")
        return

    if args.file:
        if not os.path.exists(args.file):
            print(f"[!] File not found: {args.file}")
            sys.exit(1)
        with open(args.file, 'r', encoding='utf-8') as f:
            urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        print(f"[*] Processing {len(urls)} URLs from {args.file}...")
        for u in urls:
            rec = extract_video_link(u, verbose=True)
            if rec and not args.json:
                print_record_banner(rec)
        print(f"\n[+] Batch extraction complete. Check tools/extracted/extracted_videos.txt")
        return

    if args.url:
        rec = extract_video_link(args.url, verbose=not args.json)
        if args.json:
            print(json.dumps(rec, indent=2, ensure_ascii=False))
        else:
            print_record_banner(rec)
        return

    # If no CLI arguments provided, launch interactive paste loop
    interactive_loop()

if __name__ == "__main__":
    main()
