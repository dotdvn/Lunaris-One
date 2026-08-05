
class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(data));
    }
  }
}
class MusicAPI {
  constructor() {
    this.baseUrl = 'https://itunes.apple.com';
  }

  
  async searchSongs(query) {
    try {
      const res = await fetch(`${this.baseUrl}/search?term=${encodeURIComponent(query)}&entity=song&limit=25`);
      const data = await res.json();
      if (data.results) {
        return data.results.map(this._formatTrack);
      }
      return [];
    } catch (error) {
      console.error('API Error (searchSongs):', error);
      throw error;
    }
  }

  
  async getSongStream(songId) {
    try {
      const res = await fetch(`${this.baseUrl}/lookup?id=${songId}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return this._formatTrack(data.results[0]);
      }
      return null;
    } catch (error) {
      console.error('API Error (getSongStream):', error);
      throw error;
    }
  }

  
  _formatTrack(track) {
    return {
      id: track.trackId.toString(),
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName || 'Unknown Album',
      artwork: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '500x500bb') : '',
      duration: Math.floor((track.trackTimeMillis || 0) / 1000),
      streamUrl: track.previewUrl
    };
  }
}
class AudioEngine extends EventEmitter {
  constructor() {
    super();
    this.api = new MusicAPI();
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.state = {
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      repeatMode: 'off',
      shuffleMode: false,
      volume: 1,
      favorites: [],
      history: []
    };
    this.originalQueue = [];
    this._searchTimeout = null;

    this._bindAudioEvents();
    this.loadSession();
  }
  
  
  searchSongs(query, callback) {
    if (this._searchTimeout) clearTimeout(this._searchTimeout);
    
    if (!query || query.trim() === '') {
      callback(null, []);
      return;
    }
    
    this._searchTimeout = setTimeout(async () => {
      try {
        const results = await this.api.searchSongs(query);
        callback(null, results);
      } catch (error) {
        callback(error, []);
      }
    }, 500);
  }

  async playTrack(index) {
    if (index < 0 || index >= this.state.queue.length) return;
    
    this.state.currentIndex = index;
    let track = this.state.queue[this.state.currentIndex];
    if (!track.streamUrl) {
      try {
        const fetchedTrack = await this.api.getSongStream(track.id);
        if (fetchedTrack && fetchedTrack.streamUrl) {
          track.streamUrl = fetchedTrack.streamUrl;
          this.state.queue[this.state.currentIndex] = track;
        } else {
          throw new Error('Stream URL not found');
        }
      } catch (error) {
        console.error('Failed to load stream URL for', track.title);
        this.emit('error', { message: 'Failed to load track stream.' });
        return;
      }
    }

    this.audio.src = track.streamUrl;
    try {
      await this.audio.play();
      this.state.isPlaying = true;
      this.addToHistory(track);
      
      this.emit('trackchange', track);
      this.emit('play', track);
      this.saveSession();
      this.emit('notification', this.getNowPlayingNotification());
    } catch (error) {
      console.error('Playback failed', error);
      this.state.isPlaying = false;
    }
  }

  playNow(track) {
    if (this.state.currentIndex === -1) {
      this.state.queue = [track];
      this.originalQueue = [track];
      this.state.currentIndex = 0;
    } else {
      this.state.queue.splice(this.state.currentIndex + 1, 0, track);
      this.originalQueue.push(track);
      this.state.currentIndex++;
    }
    this.emit('queuechange', this.state.queue);
    this.playTrack(this.state.currentIndex);
  }

  togglePlayback() {
    if (this.state.queue.length === 0) return;
    
    if (this.state.isPlaying) {
      this.audio.pause();
      this.state.isPlaying = false;
      this.emit('pause', this.getCurrentTrack());
      this.emit('notification', { title: 'Playback Paused', message: this.getCurrentTrack().title, icon: 'ph-pause' });
    } else {
      if (this.audio.src) {
        this.audio.play();
        this.state.isPlaying = true;
        this.emit('play', this.getCurrentTrack());
        this.emit('notification', { title: 'Playback Resumed', message: this.getCurrentTrack().title, icon: 'ph-play' });
      } else {
        this.playTrack(this.state.currentIndex !== -1 ? this.state.currentIndex : 0);
      }
    }
    this.saveSession();
  }

  nextTrack() {
    if (this.state.queue.length === 0) return;
    if (this.state.currentIndex < this.state.queue.length - 1) {
      this.playTrack(this.state.currentIndex + 1);
    } else if (this.state.repeatMode === 'all') {
      this.playTrack(0);
    } else {
      this.stopPlayback();
    }
  }

  previousTrack() {
    if (this.state.queue.length === 0) return;
    if (this.audio.currentTime > 3) {
      this.seek(0);
      return;
    }

    if (this.state.currentIndex > 0) {
      this.playTrack(this.state.currentIndex - 1);
    } else if (this.state.repeatMode === 'all') {
      this.playTrack(this.state.queue.length - 1);
    }
  }

  stopPlayback() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.state.isPlaying = false;
    this.emit('pause', null);
  }

  getCurrentTrack() {
    if (this.state.currentIndex >= 0 && this.state.currentIndex < this.state.queue.length) {
      return this.state.queue[this.state.currentIndex];
    }
    return null;
  }

  addToQueue(track) {
    this.state.queue.push(track);
    if (!this.state.shuffleMode) {
      this.originalQueue.push(track);
    }
    this.emit('queuechange', this.state.queue);
    this.saveSession();
    
    if (this.state.queue.length === 1 && !this.state.isPlaying) {
      this.playTrack(0);
    }
  }

  removeFromQueue(index) {
    if (index < 0 || index >= this.state.queue.length) return;
    const removed = this.state.queue.splice(index, 1)[0];
    const origIndex = this.originalQueue.findIndex(t => t.id === removed.id);
    if (origIndex > -1) this.originalQueue.splice(origIndex, 1);
    
    if (index < this.state.currentIndex) {
      this.state.currentIndex--;
    } else if (index === this.state.currentIndex) {
      this.stopPlayback();
      if (this.state.queue.length > 0) {
        this.playTrack(this.state.currentIndex < this.state.queue.length ? this.state.currentIndex : 0);
      }
    }
    
    this.emit('queuechange', this.state.queue);
    this.saveSession();
  }

  clearQueue() {
    this.stopPlayback();
    this.state.queue = [];
    this.originalQueue = [];
    this.state.currentIndex = -1;
    this.emit('queuechange', this.state.queue);
    this.saveSession();
  }

  reorderQueue(from, to) {
    const track = this.state.queue.splice(from, 1)[0];
    this.state.queue.splice(to, 0, track);
    if (this.state.currentIndex === from) {
      this.state.currentIndex = to;
    } else if (from < this.state.currentIndex && to >= this.state.currentIndex) {
      this.state.currentIndex--;
    } else if (from > this.state.currentIndex && to <= this.state.currentIndex) {
      this.state.currentIndex++;
    }
    
    this.emit('queuechange', this.state.queue);
    this.saveSession();
  }

  _bindAudioEvents() {
    this.audio.addEventListener('timeupdate', () => {
      const current = this.audio.currentTime;
      const duration = this.audio.duration || 1;
      const percent = (current / duration) * 100;
      
      this.emit('progress', {
        current,
        duration,
        percent,
        formattedCurrent: this.formatTime(current),
        formattedDuration: this.formatTime(duration)
      });
      if (Math.floor(current) % 5 === 0) this.saveSession();
    });

    this.audio.addEventListener('ended', () => {
      this._handleTrackEnded();
    });
  }

  seek(percent) {
    if (this.audio.duration) {
      const time = (percent / 100) * this.audio.duration;
      this.audio.currentTime = time;
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  setRepeatMode(mode) {
    if (['off', 'one', 'all'].includes(mode)) {
      this.state.repeatMode = mode;
      this.saveSession();
    }
  }

  toggleShuffle() {
    this.state.shuffleMode = !this.state.shuffleMode;
    
    if (this.state.shuffleMode) {
      const currentTrack = this.state.queue[this.state.currentIndex];
      this.originalQueue = [...this.state.queue];
      for (let i = this.state.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.state.queue[i], this.state.queue[j]] = [this.state.queue[j], this.state.queue[i]];
      }
      if (currentTrack) {
        const newIdx = this.state.queue.findIndex(t => t.id === currentTrack.id);
        if (newIdx > -1) {
          const temp = this.state.queue[this.state.currentIndex];
          this.state.queue[this.state.currentIndex] = currentTrack;
          this.state.queue[newIdx] = temp;
        }
      }
    } else {
      const currentTrack = this.state.queue[this.state.currentIndex];
      this.state.queue = [...this.originalQueue];
      if (currentTrack) {
        this.state.currentIndex = this.state.queue.findIndex(t => t.id === currentTrack.id);
      }
    }
    
    this.emit('queuechange', this.state.queue);
    this.saveSession();
  }

  _handleTrackEnded() {
    if (this.state.repeatMode === 'one') {
      this.audio.currentTime = 0;
      this.audio.play();
    } else {
      this.nextTrack();
    }
  }

  setVolume(value) {
    let vol = parseFloat(value);
    if (vol < 0) vol = 0;
    if (vol > 1) vol = 1;
    
    this.audio.volume = vol;
    this.state.volume = vol;
    this.state.muted = (vol === 0);
    this.emit('volumechange', { volume: vol, muted: this.state.muted });
    this.saveSession();
  }

  toggleMute() {
    if (this.state.muted) {
      this.audio.volume = this.state.volume > 0 ? this.state.volume : 0.5;
      this.state.muted = false;
    } else {
      this.audio.volume = 0;
      this.state.muted = true;
    }
    this.emit('volumechange', { volume: this.state.volume, muted: this.state.muted });
    this.saveSession();
  }

  toggleFavorite(track) {
    const idx = this.state.favorites.findIndex(t => t.id === track.id);
    if (idx > -1) {
      this.state.favorites.splice(idx, 1);
    } else {
      this.state.favorites.push(track);
    }
    this.emit('favoritechange', this.state.favorites);
    this.saveSession();
  }

  isFavorite(trackId) {
    return this.state.favorites.some(t => t.id === trackId);
  }

  addToHistory(track) {
    this.state.history = this.state.history.filter(t => t.id !== track.id);
    this.state.history.unshift(track);
    if (this.state.history.length > 50) {
      this.state.history.pop();
    }
    this.saveSession();
  }

  saveSession() {
    const dataToSave = {
      queue: this.state.queue,
      originalQueue: this.originalQueue,
      currentIndex: this.state.currentIndex,
      repeatMode: this.state.repeatMode,
      shuffleMode: this.state.shuffleMode,
      volume: this.state.volume,
      favorites: this.state.favorites,
      history: this.state.history,
      currentTime: this.audio.currentTime
    };
    localStorage.setItem('lunaris_audio_session', JSON.stringify(dataToSave));
  }

  loadSession() {
    const saved = localStorage.getItem('lunaris_audio_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state.queue = parsed.queue || [];
        this.originalQueue = parsed.originalQueue || [...this.state.queue];
        this.state.currentIndex = parsed.currentIndex !== undefined ? parsed.currentIndex : -1;
        this.state.repeatMode = parsed.repeatMode || 'off';
        this.state.shuffleMode = parsed.shuffleMode || false;
        this.state.favorites = parsed.favorites || [];
        this.state.history = parsed.history || [];
        if (parsed.volume !== undefined) {
          this.setVolume(parsed.volume);
        }
        if (this.state.currentIndex > -1 && this.state.queue[this.state.currentIndex]) {
          const track = this.state.queue[this.state.currentIndex];
          if (track.streamUrl) {
            this.audio.src = track.streamUrl;
            if (parsed.currentTime) {
              this.audio.currentTime = parsed.currentTime;
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse audio session', e);
      }
    }
  }

  getNowPlayingNotification() {
    const track = this.getCurrentTrack();
    if (!track) return null;
    return {
      title: 'Now Playing',
      message: `${track.title} - ${track.artist}`,
      icon: 'ph-music-notes'
    };
  }
}
window.LunarAudio = new AudioEngine();
