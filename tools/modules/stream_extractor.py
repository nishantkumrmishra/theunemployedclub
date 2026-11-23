#!/usr/bin/env python3
"""
tools/modules/stream_extractor.py
Extracts direct CDN stream links (.mp4, .m3u8, direct video tags, embed fallbacks, and yt-dlp).
"""

import re
from urllib.parse import urljoin, unquote

try:
    import yt_dlp
    HAS_YTDLP = True
except ImportError:
    HAS_YTDLP = False

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

def derive_stream_from_thumbnail(thumb_url: str) -> str:
    """Derives CDN stream URL from standard thumbnail path patterns if available."""
    if not thumb_url:
        return ""
    if '/thumbnails/' in thumb_url:
        return re.sub(r'/thumbnails/', '/videos/', thumb_url).replace('.jpg', '.mp4').replace('.png', '.mp4')
    return ""

def extract_with_ytdlp(url: str) -> dict:
    """Extracts stream & metadata using yt-dlp if installed and URL is supported."""
    if not HAS_YTDLP:
        return None

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'extract_flat': False,
        'format': 'best[ext=mp4]/best'
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if not info:
                return None

            video_url = info.get('url', '')
            artwork = info.get('thumbnail', '')
            title = info.get('title', '')
            desc = info.get('description', '')

            return {
                'video_url': video_url,
                'artwork_url': artwork,
                'title': title,
                'description': desc
            }
    except Exception:
        return None

def extract_stream(html_text: str, page_url: str, artwork_url: str = "") -> str:
    """
    Extracts direct Video CDN stream link from page HTML or yt-dlp.
    Searches:
      1. Thumbnail path pattern derivation (/thumbnails/ -> /videos/...)
      2. HTML5 <video> and <source> tags
      3. OpenGraph / Twitter meta tags (og:video, og:video:secure_url, twitter:player:stream)
      4. JavaScript embedded configuration variables (file:, source:, src:, hls:, playlist:)
      5. yt-dlp stream extraction
      6. Embed iframe fallback
    """
    video_url = ""

    # 1. Pattern derivation from artwork thumbnail
    derived = derive_stream_from_thumbnail(artwork_url)
    if derived:
        return derived

    # 2. BeautifulSoup parsing
    if HAS_BS4 and html_text:
        try:
            soup = BeautifulSoup(html_text, 'html.parser')

            # <video src="...">
            v_tag = soup.find('video')
            if v_tag and v_tag.get('src'):
                video_url = v_tag['src'].strip()

            # <source src="...">
            if not video_url:
                sources = soup.find_all('source')
                for s in sources:
                    src = s.get('src', '')
                    if any(src.lower().endswith(ext) for ext in ['.mp4', '.m3u8', '.webm']):
                        video_url = src.strip()
                        break

            # Meta tags
            if not video_url:
                for prop in ['og:video', 'og:video:url', 'og:video:secure_url', 'twitter:player:stream']:
                    tag = soup.find('meta', property=prop) or soup.find('meta', attrs={'name': prop})
                    if tag and tag.get('content'):
                        val = tag['content'].strip()
                        if any(ext in val.lower() for ext in ['.mp4', '.m3u8']):
                            video_url = val
                            break

            # <iframe> embed fallback
            if not video_url:
                iframe = soup.find('iframe', src=re.compile(r'embed|player', re.I))
                if iframe and iframe.get('src'):
                    video_url = iframe['src'].strip()
        except Exception:
            pass

    # 3. Regex Fallback
    if not video_url and html_text:
        # Check for direct mp4 / m3u8 in javascript or attributes
        mp4_match = re.search(r'["\'](https?://[^"\']+\.(?:mp4|m3u8)[^"\']*)["\']', html_text, re.I)
        if mp4_match:
            video_url = mp4_match.group(1).strip()

        if not video_url:
            src_match = re.search(r'<source[^>]+src=[\'"]([^\'"]+)[\'"]', html_text, re.I)
            if src_match:
                video_url = src_match.group(1).strip()

        if not video_url:
            v_match = re.search(r'<video[^>]+src=[\'"]([^\'"]+)[\'"]', html_text, re.I)
            if v_match:
                video_url = v_match.group(1).strip()

        if not video_url:
            embed_match = re.search(r'<iframe[^>]+src=[\'"]([^\'"]*(?:embed|player)[^\'"]*)[\'"]', html_text, re.I)
            if embed_match:
                video_url = embed_match.group(1).strip()

    # 4. yt-dlp fallback
    if not video_url and HAS_YTDLP:
        yt_res = extract_with_ytdlp(page_url)
        if yt_res and yt_res.get('video_url'):
            video_url = yt_res['video_url']

    if video_url:
        video_url = urljoin(page_url, video_url)

    return video_url
