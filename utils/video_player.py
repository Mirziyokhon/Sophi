"""
Custom video player component with advanced controls
"""
import streamlit as st
import base64
import os
from pathlib import Path


def render_custom_video_player(video_path: str, subtitle_path: str = None, key: str = "video_player"):
    """
    Render a custom video player with timeline, play controls, and subtitle panel
    
    Args:
        video_path: Path to video file
        subtitle_path: Path to SRT subtitle file (optional)
        key: Unique key for the component
    """
    
    # Read video file
    try:
        with open(video_path, "rb") as f:
            video_bytes = f.read()
        video_base64 = base64.b64encode(video_bytes).decode()
    except Exception as e:
        st.error(f"Error loading video: {str(e)}")
        return
    
    # Read subtitle file if provided
    subtitle_content = ""
    if subtitle_path and os.path.exists(subtitle_path):
        try:
            with open(subtitle_path, "r", encoding="utf-8") as f:
                subtitle_content = f.read()
        except Exception as e:
            print(f"Warning: Could not load subtitles: {str(e)}")
    
    # Generate unique IDs for this player instance
    player_id = f"custom-player-{key}"
    subtitle_id = f"subtitle-panel-{key}"
    
    # Custom HTML/CSS/JS for the video player
    custom_player_html = f"""
    <style>
        .custom-video-container-{key} {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }}
        
        .video-wrapper-{key} {{
            position: relative;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 15px;
        }}
        
        .video-element-{key} {{
            width: 100%;
            height: auto;
            display: block;
        }}
        
        .controls-panel-{key} {{
            background: rgba(0,0,0,0.8);
            border-radius: 10px;
            padding: 15px;
            backdrop-filter: blur(10px);
        }}
        
        .timeline-container-{key} {{
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }}
        
        .time-display-{key} {{
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            min-width: 120px;
        }}
        
        .timeline-{key} {{
            flex: 1;
            height: 6px;
            background: rgba(255,255,255,0.3);
            border-radius: 3px;
            position: relative;
            cursor: pointer;
            transition: height 0.2s;
        }}
        
        .timeline-{key}:hover {{
            height: 8px;
        }}
        
        .timeline-progress-{key} {{
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 3px;
            width: 0%;
            transition: width 0.1s;
        }}
        
        .timeline-buffer-{key} {{
            height: 100%;
            background: rgba(255,255,255,0.5);
            border-radius: 3px;
            width: 0%;
            position: absolute;
            top: 0;
            left: 0;
        }}
        
        .playback-controls-{key} {{
            display: flex;
            align-items: center;
            gap: 15px;
            justify-content: center;
        }}
        
        .control-btn-{key} {{
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 5px;
        }}
        
        .control-btn-{key}:hover {{
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }}
        
        .control-btn-{key}:active {{
            transform: translateY(0);
        }}
        
        .speed-control-{key} {{
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            cursor: pointer;
        }}
        
        .subtitle-panel-{key} {{
            background: rgba(0,0,0,0.9);
            border-radius: 10px;
            padding: 20px;
            margin-top: 15px;
            min-height: 100px;
            max-height: 200px;
            overflow-y: auto;
            border: 2px solid rgba(102, 126, 234, 0.3);
        }}
        
        .subtitle-text-{key} {{
            color: #fff;
            font-size: 18px;
            line-height: 1.6;
            text-align: center;
            font-family: 'Arial', sans-serif;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }}
        
        .export-controls-{key} {{
            display: flex;
            gap: 10px;
            margin-top: 15px;
            flex-wrap: wrap;
        }}
        
        .export-btn-{key} {{
            background: linear-gradient(135deg, #28a745, #20c997);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
            font-size: 14px;
        }}
        
        .export-btn-{key}:hover {{
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
        }}
        
        .volume-control-{key} {{
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        
        .volume-slider-{key} {{
            width: 100px;
            height: 4px;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            outline: none;
            cursor: pointer;
        }}
    </style>
    
    <div class="custom-video-container-{key}">
        <div class="video-wrapper-{key}">
            <video id="{player_id}" class="video-element-{key}" controls="false">
                <source src="data:video/mp4;base64,{video_base64}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
        
        <div class="controls-panel-{key}">
            <div class="timeline-container-{key}">
                <span class="time-display-{key}" id="time-current-{key}">00:00</span>
                <div class="timeline-{key}" id="timeline-{key}">
                    <div class="timeline-buffer-{key}" id="timeline-buffer-{key}"></div>
                    <div class="timeline-progress-{key}" id="timeline-progress-{key}"></div>
                </div>
                <span class="time-display-{key}" id="time-duration-{key}">00:00</span>
            </div>
            
            <div class="playback-controls-{key}">
                <button class="control-btn-{key}" id="play-pause-btn-{key}">
                    <span id="play-icon-{key}">▶️</span> Play
                </button>
                
                <button class="control-btn-{key}" id="rewind-btn-{key}">
                    ⏪ -10s
                </button>
                
                <button class="control-btn-{key}" id="forward-btn-{key}">
                    ⏩ +10s
                </button>
                
                <div class="volume-control-{key}">
                    <span style="color: white;">🔊</span>
                    <input type="range" class="volume-slider-{key}" id="volume-slider-{key}" 
                           min="0" max="1" step="0.1" value="1">
                </div>
                
                <select class="speed-control-{key}" id="speed-control-{key}">
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1" selected>1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                </select>
            </div>
        </div>
        
        <div class="subtitle-panel-{key}" id="{subtitle_id}">
            <div class="subtitle-text-{key}" id="subtitle-text-{key}">
                📝 Subtitles will appear here...
            </div>
        </div>
        
        <div class="export-controls-{key}">
            <button class="export-btn-{key}" onclick="downloadVideo('{key}')">
                📥 Download MP4
            </button>
            <button class="export-btn-{key}" onclick="extractAudio('{key}')">
                🎵 Extract Audio
            </button>
            <button class="export-btn-{key}" onclick="createGif('{key}')">
                🖼️ Create GIF
            </button>
            <button class="export-btn-{key}" onclick="downloadSubtitles('{key}')">
                📄 Download Subtitles
            </button>
        </div>
    </div>
    
    <script>
        // Video player controller
        (function() {{
            const video = document.getElementById('{player_id}');
            const timeline = document.getElementById('timeline-{key}');
            const progress = document.getElementById('timeline-progress-{key}');
            const buffer = document.getElementById('timeline-buffer-{key}');
            const playPauseBtn = document.getElementById('play-pause-btn-{key}');
            const playIcon = document.getElementById('play-icon-{key}');
            const currentTimeEl = document.getElementById('time-current-{key}');
            const durationEl = document.getElementById('time-duration-{key}');
            const rewindBtn = document.getElementById('rewind-btn-{key}');
            const forwardBtn = document.getElementById('forward-btn-{key}');
            const volumeSlider = document.getElementById('volume-slider-{key}');
            const speedControl = document.getElementById('speed-control-{key}');
            const subtitleText = document.getElementById('subtitle-text-{key}');
            
            // Subtitle data
            const subtitles = {f"'{subtitle_content}'" if subtitle_content else 'null'};
            let currentSubtitleIndex = 0;
            let subtitleEntries = [];
            
            // Parse subtitles if available
            if (subtitles) {{
                subtitleEntries = parseSRT(subtitles);
            }}
            
            function parseSRT(srtText) {{
                const entries = [];
                const blocks = srtText.trim().split('\\n\\n');
                
                for (const block of blocks) {{
                    const lines = block.trim().split('\\n');
                    if (lines.length >= 3) {{
                        const index = parseInt(lines[0]);
                        const timeMatch = lines[1].match(/(\\d{{2}}):(\\d{{2}}):(\\d{{2}}),(\\d{{3}}) --> (\\d{{2}}):(\\d{{2}}):(\\d{{2}}),(\\d{{3}})/);
                        
                        if (timeMatch) {{
                            const startTime = parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
                            const endTime = parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
                            const text = lines.slice(2).join(' ').trim();
                            
                            entries.push({{ start: startTime, end: endTime, text: text }});
                        }}
                    }}
                }}
                return entries;
            }}
            
            function parseTime(hours, minutes, seconds, milliseconds) {{
                return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
            }}
            
            function formatTime(seconds) {{
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${{mins.toString().padStart(2, '0')}}:${{secs.toString().padStart(2, '0')}}`;
            }}
            
            function updateSubtitles() {{
                if (!subtitleEntries.length) return;
                
                const currentTime = video.currentTime;
                let foundSubtitle = "";
                
                for (const entry of subtitleEntries) {{
                    if (currentTime >= entry.start && currentTime <= entry.end) {{
                        foundSubtitle = entry.text;
                        break;
                    }}
                }}
                
                subtitleText.textContent = foundSubtitle || "📝 Subtitles will appear here...";
            }}
            
            // Play/Pause functionality
            playPauseBtn.addEventListener('click', () => {{
                if (video.paused) {{
                    video.play();
                    playIcon.textContent = '⏸️';
                    playPauseBtn.innerHTML = '<span id="play-icon-{key}">⏸️</span> Pause';
                }} else {{
                    video.pause();
                    playIcon.textContent = '▶️';
                    playPauseBtn.innerHTML = '<span id="play-icon-{key}">▶️</span> Play';
                }}
            }});
            
            // Timeline interaction
            timeline.addEventListener('click', (e) => {{
                const rect = timeline.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                video.currentTime = percent * video.duration;
            }});
            
            // Skip buttons
            rewindBtn.addEventListener('click', () => {{
                video.currentTime = Math.max(0, video.currentTime - 10);
            }});
            
            forwardBtn.addEventListener('click', () => {{
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
            }});
            
            // Volume control
            volumeSlider.addEventListener('input', (e) => {{
                video.volume = parseFloat(e.target.value);
            }});
            
            // Speed control
            speedControl.addEventListener('change', (e) => {{
                video.playbackRate = parseFloat(e.target.value);
            }});
            
            // Update progress
            video.addEventListener('timeupdate', () => {{
                const percent = (video.currentTime / video.duration) * 100;
                progress.style.width = percent + '%';
                currentTimeEl.textContent = formatTime(video.currentTime);
                updateSubtitles();
            }});
            
            video.addEventListener('loadedmetadata', () => {{
                durationEl.textContent = formatTime(video.duration);
            }});
            
            video.addEventListener('progress', () => {{
                if (video.buffered.length > 0) {{
                    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                    const percent = (bufferedEnd / video.duration) * 100;
                    buffer.style.width = percent + '%';
                }}
            }});
            
            // Export functions
            window.downloadVideo = function(playerKey) {{
                const a = document.createElement('a');
                a.href = 'data:video/mp4;base64,{video_base64}';
                a.download = 'rusaldo_video.mp4';
                a.click();
            }};
            
            window.downloadSubtitles = function(playerKey) {{
                const subtitleData = `{subtitle_content or ''}`;
                const blob = new Blob([subtitleData], {{ type: 'text/plain' }});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'subtitles.srt';
                a.click();
                URL.revokeObjectURL(url);
            }};
            
            window.extractAudio = function(playerKey) {{
                // Placeholder for audio extraction
                alert('Audio extraction feature coming soon! 🎵');
            }};
            
            window.createGif = function(playerKey) {{
                // Placeholder for GIF creation
                alert('GIF creation feature coming soon! 🖼️');
            }};
        }})();
    </script>
    """
    
    # Render the custom player
    st.components.v1.html(custom_player_html, height=700)
