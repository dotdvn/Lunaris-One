window.Desktop = {
  init() {
    this.desktop = document.getElementById('desktop');
    this.iconsContainer = document.getElementById('desktop-icons');
    this.contextMenu = document.getElementById('context-menu');
    this.launcher = document.getElementById('launcher');
    this.quickSettings = document.getElementById('quick-settings-panel');
    this.notificationsPanel = document.getElementById('notifications-panel');
    
    this.renderIcons();
    this.bindEvents();
    this.renderLauncher();
    this.initPet();
  },
  
  renderIcons() {
    this.iconsContainer.innerHTML = '';
    let rightOffset = 24;
    APPS.forEach(app => {
      const el = document.createElement('div');
      el.className = 'desktop-icon';
      el.innerHTML = `
        <div class="icon-img">
          ${app.isImage ? `<img src="${app.icon}" style="width: 64px; height: 64px; object-fit: contain;">` : `<i class="ph ${app.icon}" style="color: ${app.color}"></i>`}
        </div>
        <div class="icon-text">${app.name}</div>
      `;
      
      if (['iss', 'mars', 'neo', 'epic', 'astro', 'news'].includes(app.id)) {
        el.style.position = 'absolute';
        el.style.right = '24px';
        el.style.top = `${rightOffset}px`;
        rightOffset += 140;
      }

      el.addEventListener('dblclick', () => {
        el.classList.remove('selected');
        window.WM.createWindow(app);
      });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearSelection();
        el.classList.add('selected');
      });
      this.iconsContainer.appendChild(el);
    });
  },
  
  renderLauncher(query = '') {
    const grid = document.getElementById('launcher-grid');
    grid.innerHTML = '';
    const filteredApps = APPS.filter(app => app.name.toLowerCase().includes(query.toLowerCase()));
    
    if (filteredApps.length === 0) {
      grid.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center; padding: 20px;">No apps found</div>';
      return;
    }
    
    filteredApps.forEach(app => {
      const el = document.createElement('div');
      el.className = 'desktop-icon';
      el.innerHTML = `
        <div class="icon-img" style="width: 40px; height: 40px; font-size: 32px;">
          ${app.isImage ? `<img src="${app.icon}" style="width: 36px; height: 36px; object-fit: contain;">` : `<i class="ph ${app.icon}" style="color: ${app.color}"></i>`}
        </div>
        <div class="icon-text">${app.name}</div>
      `;
      el.addEventListener('click', () => {
        window.WM.createWindow(app);
        this.closeAllPanels();
      });
      grid.appendChild(el);
    });
  },
  
  renderNotifications() {
    const list = document.getElementById('notifications-list');
    list.innerHTML = '';
    if (State.data.notifications.length === 0) {
      list.innerHTML = '<div style="color: var(--text-secondary); text-align: center; padding: 20px;">No new notifications</div>';
      return;
    }
    
    State.data.notifications.forEach(n => {
      const el = document.createElement('div');
      el.className = 'notification-item';
      el.innerHTML = `
        <div class="notif-icon"><i class="ph ${n.icon}"></i></div>
        <div class="notif-content">
          <h4>${n.title}</h4>
          <p>${n.message}</p>
        </div>
      `;
      list.appendChild(el);
    });
  },
  
  bindEvents() {
    this.desktop.addEventListener('click', (e) => {
      this.clearSelection();
      this.closeContextMenu();
      this.closeAllPanels();
    });
    this.desktop.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.closeAllPanels();
      
      const x = e.clientX;
      const y = e.clientY;
      
      this.contextMenu.style.left = `${x}px`;
      this.contextMenu.style.top = `${y}px`;
      this.contextMenu.classList.add('show');
    });
    
    document.getElementById('ctx-personalize').addEventListener('click', () => {
      window.WM.createWindow(APPS.find(a => a.id === 'settings'));
    });
    document.getElementById('btn-clear-notifications').addEventListener('click', () => {
      State.clearNotifications();
    });
    document.getElementById('toggle-moon-mode').addEventListener('click', () => {
      State.update('moonMode', !State.data.moonMode);
    });
    const searchInput = document.querySelector('.launcher-search input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderLauncher(e.target.value);
      });
    }
  },
  
  clearSelection() {
    document.querySelectorAll('.desktop-icon.selected').forEach(el => el.classList.remove('selected'));
  },
  
  closeContextMenu() {
    this.contextMenu.classList.remove('show');
  },
  
  closeAllPanels() {
    this.launcher.classList.remove('show');
    this.quickSettings.classList.remove('show');
    this.notificationsPanel.classList.remove('show');
    document.getElementById('btn-launcher').classList.remove('active');
  },
  
  toggleLauncher() {
    const isShowing = this.launcher.classList.contains('show');
    this.closeAllPanels();
    if (!isShowing) {
      this.launcher.classList.add('show');
      document.getElementById('btn-launcher').classList.add('active');
      const searchInput = document.querySelector('.launcher-search input');
      if (searchInput) {
        searchInput.value = '';
        this.renderLauncher();
        setTimeout(() => searchInput.focus(), 100);
      }
    }
  },
  
  toggleQuickSettings() {
    const isShowing = this.quickSettings.classList.contains('show');
    this.closeAllPanels();
    if (!isShowing) this.quickSettings.classList.add('show');
  },
  
  toggleNotifications() {
    const isShowing = this.notificationsPanel.classList.contains('show');
    this.closeAllPanels();
    if (!isShowing) {
      this.renderNotifications();
      this.notificationsPanel.classList.add('show');
    }
  },
  
  initPet() {
    this.pet = document.createElement('div');
    this.pet.id = 'desktop-pet';
    this.pet.innerHTML = `<img src="assets/icon_neo.png" style="width: 48px; height: 48px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5));">`;
    this.pet.style.position = 'absolute';
    this.pet.style.zIndex = '50';
    this.pet.style.pointerEvents = 'none';
    this.desktop.appendChild(this.pet);

    let x = Math.random() * (window.innerWidth - 100);
    let y = Math.random() * (window.innerHeight - 100);
    let vx = (Math.random() > 0.5 ? 1 : -1) * 1.5;
    let vy = (Math.random() > 0.5 ? 1 : -1) * 1.5;
    let rotation = 0;

    const animate = () => {
      x += vx;
      y += vy;
      rotation += 0.5;

      if (x <= 0 || x >= window.innerWidth - 48) vx *= -1;
      if (y <= 0 || y >= window.innerHeight - 48 - 40) vy *= -1;

      this.pet.style.left = `${x}px`;
      this.pet.style.top = `${y}px`;
      this.pet.style.transform = `rotate(${rotation}deg)`;

      requestAnimationFrame(animate);
    };
    animate();
  }
};
