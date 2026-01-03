"""
Request queue and rate limit handler for Gemini API calls.
Implements exponential backoff and queue management for production deployment.
"""
import time
import random
import logging
from typing import Callable, Any, Optional
from collections import deque
from datetime import datetime, timedelta
import threading

import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("QueueHandler")


class RateLimitHandler:
    """Handles rate limiting and exponential backoff for API calls."""
    
    @staticmethod
    def call_with_retry(api_func: Callable, *args, max_retries: int = 5, **kwargs) -> Any:
        """
        Wrapper for Gemini API calls to handle rate limits (429 errors)
        using exponential backoff.
        
        Args:
            api_func: The function making the actual API request.
            max_retries: Maximum number of retry attempts.
            *args, **kwargs: Arguments passed to the api_func.
        
        Returns:
            Result from the API call.
        
        Raises:
            Exception: If max retries exceeded or non-retryable error occurs.
        """
        base_delay = 1  # Start with 1 second delay
        
        for attempt in range(max_retries):
            try:
                return api_func(*args, **kwargs)
            
            except Exception as e:
                error_msg = str(e)
                
                # Check for Rate Limit (429) or Service Unavailable (503)
                is_rate_limit = any(
                    marker in error_msg 
                    for marker in ["429", "503", "rate limit", "resource exhausted", "quota"]
                )
                
                if is_rate_limit:
                    # Exponential backoff: 1s, 2s, 4s, 8s, 16s + jitter
                    wait_time = (base_delay * (2 ** attempt)) + random.uniform(0, 1)
                    
                    logger.warning(
                        f"Rate limit hit (Attempt {attempt + 1}/{max_retries}). "
                        f"Retrying in {wait_time:.2f}s... Error: {error_msg[:100]}"
                    )
                    
                    if attempt < max_retries - 1:
                        time.sleep(wait_time)
                    else:
                        logger.error("Max retries exceeded for Gemini API call.")
                        raise Exception(
                            "Max retries exceeded: The API is currently overloaded. "
                            "Please try again in a few minutes."
                        )
                else:
                    # If it's a different error (like 400 Bad Request), don't retry
                    logger.error(f"Non-retryable error encountered: {error_msg}")
                    raise e
        
        raise Exception("Unexpected exit from retry loop")


class RequestQueue:
    """Manages a queue of animation generation requests to prevent API overload."""
    
    def __init__(self, max_concurrent: int = 3, rate_limit_per_minute: int = 10):
        self.queue = deque()
        self.max_concurrent = max_concurrent
        self.rate_limit_per_minute = rate_limit_per_minute
        self.active_requests = 0
        self.request_timestamps = deque()
        self.lock = threading.Lock()
    
    def get_queue_size(self) -> int:
        """Get current queue size."""
        with self.lock:
            return len(self.queue)
    
    def get_queue_status(self) -> dict:
        """Get detailed queue status for UI feedback."""
        with self.lock:
            queue_size = len(self.queue)
            
            if queue_size == 0:
                message = "Starting your animation..."
                wait_estimate = 0
            elif queue_size <= 3:
                message = f"There are {queue_size} people ahead of you. Hang tight!"
                wait_estimate = queue_size * 15  # Estimate 15 seconds per request
            else:
                message = f"High demand! {queue_size} requests in queue. This may take a few minutes."
                wait_estimate = queue_size * 15
            
            return {
                'queue_size': queue_size,
                'active_requests': self.active_requests,
                'message': message,
                'estimated_wait_seconds': wait_estimate
            }
    
    def _clean_old_timestamps(self):
        """Remove timestamps older than 1 minute."""
        cutoff = datetime.now() - timedelta(minutes=1)
        while self.request_timestamps and self.request_timestamps[0] < cutoff:
            self.request_timestamps.popleft()
    
    def _can_process_request(self) -> bool:
        """Check if we can process a new request based on rate limits."""
        self._clean_old_timestamps()
        
        # Check concurrent limit
        if self.active_requests >= self.max_concurrent:
            return False
        
        # Check rate limit per minute
        if len(self.request_timestamps) >= self.rate_limit_per_minute:
            return False
        
        return True
    
    def add_request(self, request_id: str, callback: Callable) -> int:
        """
        Add a request to the queue.
        
        Args:
            request_id: Unique identifier for the request.
            callback: Function to call when request is processed.
        
        Returns:
            Position in queue (0-indexed).
        """
        with self.lock:
            self.queue.append({
                'id': request_id,
                'callback': callback,
                'added_at': datetime.now()
            })
            position = len(self.queue) - 1
            logger.info(f"Request {request_id} added to queue at position {position}")
            return position
    
    def process_next(self) -> Optional[dict]:
        """
        Process the next request in queue if rate limits allow.
        
        Returns:
            Request dict if processed, None if queue empty or rate limited.
        """
        with self.lock:
            if not self.queue:
                return None
            
            if not self._can_process_request():
                logger.info("Rate limit reached, waiting before processing next request")
                return None
            
            request = self.queue.popleft()
            self.active_requests += 1
            self.request_timestamps.append(datetime.now())
            
            logger.info(f"Processing request {request['id']}")
            return request
    
    def mark_complete(self, request_id: str):
        """Mark a request as complete, freeing up a slot."""
        with self.lock:
            self.active_requests = max(0, self.active_requests - 1)
            logger.info(f"Request {request_id} completed. Active: {self.active_requests}")


class UserRateLimiter:
    """Track and limit requests per user (by IP or session)."""
    
    def __init__(self, max_requests_per_hour: int = config.USER_RATE_LIMIT_PER_HOUR):
        self.max_requests_per_hour = max_requests_per_hour
        self.user_requests = {}  # {user_id: [timestamp1, timestamp2, ...]}
        self.lock = threading.Lock()
    
    def _clean_old_requests(self, user_id: str):
        """Remove requests older than 1 hour for a user."""
        if user_id not in self.user_requests:
            return
        
        cutoff = datetime.now() - timedelta(hours=1)
        self.user_requests[user_id] = [
            ts for ts in self.user_requests[user_id] 
            if ts > cutoff
        ]
    
    def can_make_request(self, user_id: str) -> tuple[bool, Optional[str]]:
        """
        Check if user can make a request.
        
        Returns:
            (allowed, error_message)
        """
        with self.lock:
            self._clean_old_requests(user_id)
            
            if user_id not in self.user_requests:
                self.user_requests[user_id] = []
            
            request_count = len(self.user_requests[user_id])
            
            if request_count >= self.max_requests_per_hour:
                oldest_request = min(self.user_requests[user_id])
                time_until_reset = (oldest_request + timedelta(hours=1)) - datetime.now()
                minutes_left = int(time_until_reset.total_seconds() / 60)
                
                error_msg = (
                    f"Rate limit exceeded. You've made {request_count} requests in the last hour. "
                    f"Please try again in {minutes_left} minutes."
                )
                return False, error_msg
            
            return True, None
    
    def record_request(self, user_id: str):
        """Record a request for a user."""
        with self.lock:
            if user_id not in self.user_requests:
                self.user_requests[user_id] = []
            self.user_requests[user_id].append(datetime.now())
            logger.info(f"User {user_id} request recorded. Total: {len(self.user_requests[user_id])}")
    
    def get_user_stats(self, user_id: str) -> dict:
        """Get request statistics for a user."""
        with self.lock:
            self._clean_old_requests(user_id)
            
            if user_id not in self.user_requests:
                return {
                    'requests_used': 0,
                    'requests_remaining': self.max_requests_per_hour,
                    'reset_in_minutes': 0
                }
            
            requests_used = len(self.user_requests[user_id])
            requests_remaining = max(0, self.max_requests_per_hour - requests_used)
            
            if self.user_requests[user_id]:
                oldest_request = min(self.user_requests[user_id])
                time_until_reset = (oldest_request + timedelta(hours=1)) - datetime.now()
                reset_minutes = max(0, int(time_until_reset.total_seconds() / 60))
            else:
                reset_minutes = 0
            
            return {
                'requests_used': requests_used,
                'requests_remaining': requests_remaining,
                'reset_in_minutes': reset_minutes
            }


# Global instances
request_queue = RequestQueue(max_concurrent=3, rate_limit_per_minute=10)
user_rate_limiter = UserRateLimiter(max_requests_per_hour=config.USER_RATE_LIMIT_PER_HOUR)
