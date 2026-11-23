# The Unemployed Club — Video Streaming Platform

A lightweight, zero-build editorial video streaming platform designed for GitHub Pages hosting, zero-maintenance deployment, and direct CDN streaming.

---

## 1. Modular Video Extractor Tool (`tools/`)

All Python extraction scripts are organized into the [`tools/`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/tools) directory with dedicated support for **aamchor.com**, direct CDNs, YouTube, and Vimeo:

### Supported Inputs & Extraction:
* **aamchor.com URLs**: Automatically bypasses Cloudflare/Next.js protection, matches the video slug, and extracts:
  * **Video Title**: Clean video title without site suffixes.
  * **Video CDN URL**: Direct playable stream link (`https://cdn.aamchor.com/videos/....mp4`).
  * **Photo CDN URL**: Matching cover poster image link (`https://cdn.aamchor.com/thumbnails/....jpg`).
  * **Description**: Authentic description text.
* **Direct MP4 / M3U8 Stream Links**: Cloudflare R2, AWS S3, Google Cloud, BunnyCDN, etc.
* **YouTube, Vimeo, & 1,800+ Streaming Sites** via built-in `yt-dlp` integration.

### How to Run:
* **Option A (Double-Click Batch File — Easiest)**:
  Open [`tools/`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/tools) and open the [`tools/`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/tools) folder and double-click [`extractorextractor.bat`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/tools/extractortools/extractor.bat). Paste any video URL to instantly see and save the block.
* **Option B (Command Line Interactive Loop)**:
  ```bash
  python tools/main.py
  ```
* **Option C (Single Link Extraction)**:
  ```bash
  python tools/main.py "https://aamchor.com/videos/tamil-aunty-hard-fucking-leaked-mms"
  ```
* **Option D (Batch Process Links from File)**:
  ```bash
  python tools/main.py --file links.txt
  ```

### Modular Directory Structure:
```text
webvideo/
├── tools/
│   ├── extractorextractor.bat                            # Double-click launcher toto run extractorrun extractor
│   ├── main.py                    # Main runner (interactive, CLI, & batch)
│   ├── extracted/                 # Extracted data store
│   │   ├── blocks/                # Individual JSON blocks per video (block_*.json)
│   │   ├── extracted_videos.txt   # Clean text blocks ready to paste into Admin Studio
│   │   └── extracted_catalog.json # Consolidated JSON catalog of extracted items
│   └── modules/                   # Modular extraction engines
│       ├── aamchor_handler.py     # Dedicated aamchor.com parser (slug matching, video/photo CDN)
│       ├── fetcher.py             # TLS bypass (curl.exe) & HTTP fetcher
│       ├── metadata_parser.py     # Title, description, and author parser
│       ├── stream_extractor.py    # Direct MP4/M3U8 CDN stream extractor
│       ├── artwork_extractor.py   # Photo/artwork CDN link extractor
│       └── block_storage.py       # Modular block persistence
```

---

## 2. Administrator Studio Access

To prevent public visitors from seeing the admin tools:
1. Go to **Sign In** ([`login.html`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/login.html)).
2. Enter:
   - **Username**: `admin`
   - **Password**: `admin@123`
3. You will be automatically authenticated and redirected to **Admin Studio** ([`admin.html`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/admin.html)).

---

## 3. Adding Videos & Pushing to GitHub (Zero-Knowledge)

1. Open [`admin.html`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/admin.html).
2. Paste the **Title**, **Description**, **Video CDN URL**, and **Artwork CDN URL** (from the extractor tool output or [`tools/extracted/extracted_videos.txt`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/tools/extracted/extracted_videos.txt)).
3. Select where you want the video placed:
   - **Top 2 Rows** (Featured Grid)
   - **Middle Row** (Curated Break)
   - **Shorts Shelf** (9:16 Vertical Stage)
   - **Bottom Feed** (Endless Scroll)
4. Click **"Add Video to Stream"**.
5. When ready to publish live to all visitors, click **"Download Catalog File"** in the sidebar or top banner.
6. Replace [`js/catalog-feed.js`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/js/catalog-feed.js) in your repository and push to GitHub. Done!

---

## 4. Website Architecture

- **Custom Elements**: Navigation is defined once in [`js/components.js`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/js/components.js) using native `<site-header>` and `<site-sidebar>`.
- **CSS Layout**: [`css/style.css`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/css/style.css) handles editorial aesthetic rules (0px border-radius, Manrope Thin 300, Lucide SVGs, `#2ebaae` teal accent).
- **Video Player**: [`player.html`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/player.html) and [`js/player.js`](file:///C:/Users/lenovoo/Downloads/Compressed/webvideo/js/player.js) support direct CDN video streaming, custom volume slider, device-adaptive resolution selection, spacebar/K shortcuts, and floating Picture-in-Picture miniplayer.
