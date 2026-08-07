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
    const spaceFacts = [
      "One million Earths could fit inside the Sun!",
      "You wouldn't be able to walk on Jupiter, Saturn, Uranus or Neptune because they have no solid surface!",
      "If you could fly a plane to Pluto, the trip would take more than 800 years!",
      "Space is completely silent. There is no atmosphere in space, which means that sound has no medium or way to travel.",
      "The hottest planet in our solar system is Venus, not Mercury!",
      "A full NASA space suit costs around $12,000,000.",
      "The mass of the sun takes up 99.86% of the solar system.",
      "One day on Venus is longer than one year on Earth.",
      "There is a planet made of diamonds twice the size of Earth called '55 Cancri e'.",
      "The footprints on the Moon will be there for 100 million years."
    ];

    this.pet = document.createElement('div');
    this.pet.id = 'desktop-pet';
    this.pet.style.position = 'absolute';
    this.pet.style.zIndex = '50';
    this.pet.style.cursor = 'pointer';
    
    this.pet.innerHTML = `
      <div id="bennu-popup" style="display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #ffffe1; border: 1px solid #000; padding: 4px 8px; width: 160px; font-size: 11px; font-family: Tahoma; color: #000; box-shadow: 2px 2px 3px rgba(0,0,0,0.2); z-index: 51; pointer-events: none; margin-bottom: 20px;"></div>
      <img src="assets/icon_neo.png" style="width: 48px; height: 48px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5)); transition: transform 0.2s;">
    `;
    this.desktop.appendChild(this.pet);

    let isEnlarged = false;
    let popupTimeout;

    this.pet.addEventListener('click', (e) => {
      e.stopPropagation();
      isEnlarged = true;
      const popup = this.pet.querySelector('#bennu-popup');
      
      popup.innerHTML = `<strong>Bennu's Fact:</strong><br>${spaceFacts[Math.floor(Math.random() * spaceFacts.length)]}`;
      popup.style.display = 'block';

      clearTimeout(popupTimeout);
      popupTimeout = setTimeout(() => {
        isEnlarged = false;
        popup.style.display = 'none';
      }, 5000);
    });

    let x = Math.random() * (window.innerWidth - 100);
    let y = Math.random() * (window.innerHeight - 100);
    let vx = (Math.random() > 0.5 ? 1 : -1) * 1.5;
    let vy = (Math.random() > 0.5 ? 1 : -1) * 1.5;
    let rotation = 0;

    const animate = () => {
      if (!isEnlarged) {
        x += vx;
        y += vy;
        rotation += 0.5;

        if (x <= 0 || x >= window.innerWidth - 48) vx *= -1;
        if (y <= 0 || y >= window.innerHeight - 48 - 40) vy *= -1;
      } else {
        rotation += 0.1; // Slow spin when enlarged
      }

      this.pet.style.left = `${x}px`;
      this.pet.style.top = `${y}px`;
      
      const currentScale = isEnlarged ? 2 : 1;
      this.pet.querySelector('img').style.transform = `scale(${currentScale}) rotate(${rotation}deg)`;

      requestAnimationFrame(animate);
    };
    animate();
  }
};
