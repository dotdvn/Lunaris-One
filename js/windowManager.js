class WindowManager {
  constructor() {
    this.windows = {};
    this.zIndexCounter = 100;
    this.container = document.getElementById('windows-container');
    this.isDragging = false;
    this.dragWindow = null;
    this.dragOffset = { x: 0, y: 0 };
    
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }
  
  createWindow(app) {
    if (this.windows[app.id]) {
      this.focusWindow(app.id);
      if (this.windows[app.id].element.classList.contains('minimized')) {
        this.restoreWindow(app.id);
      }
      return;
    }
    
    Utils.playSound('open');
    
    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = `win-${app.id}`;
    const width = app.width || 800;
    const height = app.height || 550;
    const left = (window.innerWidth - width) / 2 + (Math.random() * 40 - 20);
    const top = (window.innerHeight - height - 60) / 2 + (Math.random() * 40 - 20);
    
    win.style.width = `${width}px`;
    win.style.height = `${height}px`;
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
    win.innerHTML = `
      <div class="window-titlebar" id="titlebar-${app.id}">
        <div class="window-title">
          ${app.isImage ? `<img src="${app.icon}" style="width: 16px; height: 16px; object-fit: contain;">` : `<i class="ph ${app.icon}" style="color: ${app.color}"></i>`}
          <span>${app.name}</span>
        </div>
        <div class="window-controls">
          <button class="win-btn minimize" data-id="${app.id}"><i class="ph ph-minus"></i></button>
          <button class="win-btn maximize" data-id="${app.id}"><i class="ph ph-square"></i></button>
          <button class="win-btn close" data-id="${app.id}"><i class="ph ph-x"></i></button>
        </div>
      </div>
      <div class="window-content" id="content-${app.id}">

      </div>
    `;
    
    this.container.appendChild(win);
    this.windows[app.id] = {
      id: app.id,
      element: win,
      isMaximized: false,
      prevRect: null
    };
    win.addEventListener('mousedown', () => this.focusWindow(app.id));
    
    const titlebar = win.querySelector(`#titlebar-${app.id}`);
    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.win-btn')) return;
      this.isDragging = true;
      this.dragWindow = this.windows[app.id];
      const rect = win.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      this.focusWindow(app.id);
      win.classList.add('dragging');
    });
    titlebar.addEventListener('dblclick', () => this.toggleMaximize(app.id));
    win.querySelector('.minimize').addEventListener('click', () => this.minimizeWindow(app.id));
    win.querySelector('.maximize').addEventListener('click', () => this.toggleMaximize(app.id));
    win.querySelector('.close').addEventListener('click', () => this.closeWindow(app.id));
    
    this.focusWindow(app.id);
    if (window.Apps && window.Apps[app.id]) {
      window.Apps[app.id].init(win.querySelector('.window-content'));
    }
    if (window.Taskbar) {
      window.Taskbar.addWindow(app);
    }
    State.addNotification('App Opened', `${app.name} is now running.`);
  }
  
  focusWindow(id) {
    if (!this.windows[id]) return;
    this.zIndexCounter++;
    this.windows[id].element.style.zIndex = this.zIndexCounter;
    
    if (window.Taskbar) {
      window.Taskbar.setActive(id);
    }
  }
  
  closeWindow(id) {
    if (!this.windows[id]) return;
    Utils.playSound('close');
    this.windows[id].element.style.transform = 'scale(0.9)';
    this.windows[id].element.style.opacity = '0';
    
    setTimeout(() => {
      if (this.windows[id] && this.windows[id].element.parentNode) {
        this.windows[id].element.remove();
        delete this.windows[id];
        if (window.Taskbar) window.Taskbar.removeWindow(id);
      }
    }, 200);
  }
  
  minimizeWindow(id) {
    if (!this.windows[id]) return;
    const win = this.windows[id].element;
    win.classList.add('minimized');
    if (window.Taskbar) window.Taskbar.removeActive(id);
  }
  
  restoreWindow(id) {
    if (!this.windows[id]) return;
    const win = this.windows[id].element;
    win.classList.remove('minimized');
    this.focusWindow(id);
  }
  
  toggleMaximize(id) {
    if (!this.windows[id]) return;
    const win = this.windows[id];
    const el = win.element;
    
    if (win.isMaximized) {
      el.classList.remove('maximized');
      if (win.prevRect) {
        el.style.width = win.prevRect.width;
        el.style.height = win.prevRect.height;
        el.style.left = win.prevRect.left;
        el.style.top = win.prevRect.top;
      }
      win.isMaximized = false;
    } else {
      win.prevRect = {
        width: el.style.width,
        height: el.style.height,
        left: el.style.left,
        top: el.style.top
      };
      el.classList.add('maximized');
      win.isMaximized = true;
    }
  }
  
  onMouseMove(e) {
    if (!this.isDragging || !this.dragWindow) return;
    
    const el = this.dragWindow.element;
    
    if (this.dragWindow.physicsFrame) {
      cancelAnimationFrame(this.dragWindow.physicsFrame);
    }
    
    if (this.dragWindow.isMaximized) {
      this.toggleMaximize(this.dragWindow.id);
      this.dragOffset.x = parseInt(el.style.width) / 2;
    }
    
    this.dragVelocity = {
      x: e.movementX,
      y: e.movementY
    };
    
    let newX = e.clientX - this.dragOffset.x;
    let newY = e.clientY - this.dragOffset.y;
    if (newY < 0) newY = 0;
    
    el.style.left = `${newX}px`;
    el.style.top = `${newY}px`;
  }
  
  onMouseUp(e) {
    if (this.isDragging && this.dragWindow) {
      const win = this.dragWindow;
      win.element.classList.remove('dragging');
      if (e.clientY <= 0 && !win.isMaximized) {
        this.toggleMaximize(win.id);
      } else if (this.dragVelocity && (Math.abs(this.dragVelocity.x) > 2 || Math.abs(this.dragVelocity.y) > 2)) {
        this.applyZeroGravity(win, this.dragVelocity.x, this.dragVelocity.y);
      }
      
      this.isDragging = false;
      this.dragWindow = null;
      this.dragVelocity = {x: 0, y: 0};
    }
  }
  
  applyZeroGravity(win, vx, vy) {
    const el = win.element;
    let x = parseFloat(el.style.left) || 0;
    let y = parseFloat(el.style.top) || 0;
    let velocityX = vx * 0.9; 
    let velocityY = vy * 0.9;
    const friction = 0.985; 
    
    const step = () => {
      if (this.isDragging && this.dragWindow && this.dragWindow.id === win.id) return; 
      
      x += velocityX;
      y += velocityY;
      
      const rect = el.getBoundingClientRect();
      const taskbarHeight = 48;
      
      if (x < 0) { x = 0; velocityX *= -0.8; }
      if (x + rect.width > window.innerWidth) { x = window.innerWidth - rect.width; velocityX *= -0.8; }
      if (y < 0) { y = 0; velocityY *= -0.8; }
      if (y + rect.height > window.innerHeight - taskbarHeight) { 
        y = window.innerHeight - taskbarHeight - rect.height; 
        velocityY *= -0.8; 
      }
      
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      
      velocityX *= friction;
      velocityY *= friction;
      
      if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
        win.physicsFrame = requestAnimationFrame(step);
      }
    };
    win.physicsFrame = requestAnimationFrame(step);
  }
}

window.WM = new WindowManager();
