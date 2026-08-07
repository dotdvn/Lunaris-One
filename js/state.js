const State = {
  data: {
    moonMode: false,
    wallpaperIndex: 0,
    volume: 50,
    brightness: 80,
    notifications: [],
    username: 'Lunar Explorer'
  },
  
  async init() {
    const saved = localStorage.getItem('lunaris_state');
    if (saved) {
      this.data = { ...this.data, ...JSON.parse(saved) };
    } else {
      this.save();
    }
    this.applySettings();
  },
  
  save() {
    localStorage.setItem('lunaris_state', JSON.stringify(this.data));
  },
  
  update(key, value) {
    this.data[key] = value;
    this.save();
    this.applySettings();
  },
  
  applySettings() {
    if (this.data.moonMode) {
      document.body.classList.add('moon-mode');
    } else {
      document.body.classList.remove('moon-mode');
    }
    const wallpapers = document.querySelectorAll('.wallpaper-bg');
    const wallpaperSrc = WALLPAPERS[this.data.wallpaperIndex] || WALLPAPERS[0];
    wallpapers.forEach(bg => {
      bg.style.backgroundImage = `url('${wallpaperSrc}')`;
    });
    const moonToggle = document.getElementById('toggle-moon-mode');
    if (moonToggle) {
      if (this.data.moonMode) moonToggle.classList.add('active');
      else moonToggle.classList.remove('active');
    }
  },
  
  addNotification(title, message, icon = 'ph-info') {
    const notif = { id: Date.now(), title, message, icon, time: new Date() };
    this.data.notifications.unshift(notif);
    this.save();
    if (window.Desktop && window.Desktop.renderNotifications) {
      window.Desktop.renderNotifications();
    }
  },
  
  clearNotifications() {
    this.data.notifications = [];
    this.save();
    if (window.Desktop && window.Desktop.renderNotifications) {
      window.Desktop.renderNotifications();
    }
  }
};
