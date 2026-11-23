"""
The Unemployed Club - Modular Extraction Engine
"""

from .fetcher import fetch_html, is_direct_media_link, HEADERS
from .metadata_parser import parse_metadata
from .stream_extractor import extract_stream
from .artwork_extractor import extract_artwork
from .block_storage import save_extracted_block, load_all_blocks
from .aamchor_handler import extract_aamchor_single_video, discover_aamchor_gallery_items

__all__ = [
    'fetch_html',
    'is_direct_media_link',
    'HEADERS',
    'parse_metadata',
    'extract_stream',
    'extract_artwork',
    'save_extracted_block',
    'load_all_blocks',
    'extract_aamchor_single_video',
    'discover_aamchor_gallery_items',
]
