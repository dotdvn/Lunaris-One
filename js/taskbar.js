window.Taskbar = {
  init() {
    this.timeEl = document.getElementById('taskbar-time');
    this.appsContainer = document.getElementById('taskbar-apps');
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    document.getElementById('btn-quick-settings').addEventListener('click', (e) => {
      e.stopPropagation();
      window.Desktop.toggleQuickSettings();
    });
    document.getElementById('btn-notifications').addEventListener('click', (e) => {
      e.stopPropagation();
      window.Desktop.toggleNotifications();
    });
    document.getElementById('btn-launcher').addEventListener('click', (e) => {
      e.stopPropagation();
      window.Desktop.toggleLauncher();
    });
  },
  
  updateTime() {
    if (this.timeEl) {
      this.timeEl.textContent = Utils.formatTime(new Date());
    }
  },
  
  addWindow(app) {
    if (document.getElementById(`tb-${app.id}`)) return;
    
    const btn = document.createElement('button');
    btn.className = 'taskbar-btn open active';
    btn.id = `tb-${app.id}`;
    btn.innerHTML = app.isImage ? `<img src="${app.icon}" style="width: 24px; height: 24px; object-fit: contain;">` : `<i class="ph ${app.icon}" style="color: ${app.color}; font-size: 24px;"></i>`;
    
    btn.addEventListener('click', () => {
      const win = window.WM.windows[app.id];
      if (win) {
        if (win.element.classList.contains('minimized')) {
          window.WM.restoreWindow(app.id);
        } else if (win.element.style.zIndex == window.WM.zIndexCounter) {
          window.WM.minimizeWindow(app.id);
        } else {
          window.WM.focusWindow(app.id);
        }
      }
    });
    
    this.appsContainer.appendChild(btn);
  },
  
  removeWindow(id) {
    const btn = document.getElementById(`tb-${id}`);
    if (btn) btn.remove();
  },
  
  setActive(id) {
    const btns = this.appsContainer.querySelectorAll('.taskbar-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`tb-${id}`);
    if (btn) btn.classList.add('active');
  },
  
  removeActive(id) {
    const btn = document.getElementById(`tb-${id}`);
    if (btn) btn.classList.remove('active');
  }
};
