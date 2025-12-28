"""
Smart cache system for animation generation to reduce API costs and latency.
Stores generated animations indexed by content hash for instant retrieval.
"""
import json
import hashlib
from pathlib import Path
from typing import Optional, Dict
from datetime import datetime
import config


class AnimationCache:
    """Manages caching of generated animation JSON to avoid redundant API calls."""
    
    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = Path(cache_dir or config.TEMP_DIR) / "animation_cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.index_file = self.cache_dir / "cache_index.json"
        self.index = self._load_index()
    
    def _load_index(self) -> Dict:
        """Load the cache index from disk."""
        if self.index_file.exists():
            try:
                with open(self.index_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ Failed to load cache index: {e}")
                return {}
        return {}
    
    def _save_index(self):
        """Save the cache index to disk."""
        try:
            with open(self.index_file, 'w', encoding='utf-8') as f:
                json.dump(self.index, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"⚠️ Failed to save cache index: {e}")
    
    def _generate_key(self, content: str, duration: int, interest: str) -> str:
        """Generate a unique cache key from content parameters."""
        # Create a deterministic hash from the input parameters
        content_normalized = content.strip().lower()[:500]  # Use first 500 chars
        key_string = f"{content_normalized}|{duration}|{interest.lower()}"
        return hashlib.sha256(key_string.encode()).hexdigest()[:16]
    
    def get(self, content: str, duration: int, interest: str) -> Optional[Dict]:
        """Retrieve cached animation data if it exists."""
        cache_key = self._generate_key(content, duration, interest)
        
        if cache_key in self.index:
            cache_entry = self.index[cache_key]
            cache_file = self.cache_dir / f"{cache_key}.json"
            
            if cache_file.exists():
                try:
                    with open(cache_file, 'r', encoding='utf-8') as f:
                        cached_data = json.load(f)
                    
                    # Update access stats
                    self.index[cache_key]['hits'] = cache_entry.get('hits', 0) + 1
                    self.index[cache_key]['last_accessed'] = datetime.now().isoformat()
                    self._save_index()
                    
                    print(f"✅ Cache HIT: {cache_key} (hits: {self.index[cache_key]['hits']})")
                    return cached_data
                    
                except Exception as e:
                    print(f"⚠️ Failed to read cache file {cache_key}: {e}")
                    return None
        
        print(f"❌ Cache MISS: {cache_key}")
        return None
    
    def set(self, content: str, duration: int, interest: str, animation_data: Dict):
        """Store animation data in cache."""
        cache_key = self._generate_key(content, duration, interest)
        cache_file = self.cache_dir / f"{cache_key}.json"
        
        try:
            # Save the animation data
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(animation_data, f, indent=2, ensure_ascii=False)
            
            # Update index
            self.index[cache_key] = {
                'created': datetime.now().isoformat(),
                'last_accessed': datetime.now().isoformat(),
                'hits': 0,
                'content_preview': content[:100],
                'duration': duration,
                'interest': interest
            }
            self._save_index()
            
            print(f"💾 Cached animation: {cache_key}")
            
        except Exception as e:
            print(f"⚠️ Failed to cache animation {cache_key}: {e}")
    
    def get_stats(self) -> Dict:
        """Get cache statistics."""
        total_entries = len(self.index)
        total_hits = sum(entry.get('hits', 0) for entry in self.index.values())
        
        # Calculate cache size
        total_size = sum(
            (self.cache_dir / f"{key}.json").stat().st_size 
            for key in self.index.keys() 
            if (self.cache_dir / f"{key}.json").exists()
        )
        
        return {
            'total_entries': total_entries,
            'total_hits': total_hits,
            'cache_size_mb': total_size / (1024 * 1024),
            'hit_rate': total_hits / max(total_entries, 1)
        }
    
    def clear_old_entries(self, days: int = 7):
        """Remove cache entries older than specified days."""
        from datetime import timedelta
        
        cutoff_date = datetime.now() - timedelta(days=days)
        removed_count = 0
        
        for cache_key, entry in list(self.index.items()):
            created_date = datetime.fromisoformat(entry['created'])
            if created_date < cutoff_date:
                cache_file = self.cache_dir / f"{cache_key}.json"
                if cache_file.exists():
                    cache_file.unlink()
                del self.index[cache_key]
                removed_count += 1
        
        if removed_count > 0:
            self._save_index()
            print(f"🗑️ Removed {removed_count} old cache entries")
        
        return removed_count
