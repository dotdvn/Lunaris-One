window.Apps = {
  browser: {
    init(container) {
      let tabs = [
        { id: 1, url: 'https://dotdvn.me', title: 'Home' }
      ];
      let activeTabId = 1;
      let tabCounter = 1;
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; background: #1c1c1e;">
          <!-- Tabs Bar -->
          <div id="tabs-container" style="display: flex; background: #0a0a0c; padding: 8px 8px 0; gap: 4px; overflow-x: auto; scrollbar-width: none;"></div>
          
          <!-- Navigation Bar -->
          <div style="padding: 10px 16px; background: #1c1c1e; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #2c2c2e;">
            <div style="display: flex; gap: 8px; color: #a1a1a6; font-size: 20px;">
              <i class="ph ph-caret-left" style="cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#a1a1a6'"></i>
              <i class="ph ph-caret-right" style="cursor: pointer; opacity: 0.5;"></i>
              <i class="ph ph-arrows-clockwise" id="btn-reload" style="cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#a1a1a6'"></i>
            </div>
            
            <div style="flex: 1; display: flex; align-items: center; background: #2c2c2e; border-radius: 6px; padding: 0 12px; height: 32px; border: 1px solid #3c3c3e;">
              <i class="ph-fill ph-lock-key" style="font-size: 14px; color: #a1a1a6; margin-right: 8px;"></i>
              <input type="text" id="browser-url" style="flex: 1; background: transparent; border: none; color: #fff; outline: none; font-size: 13px; font-family: 'Inter', sans-serif;">
              <i class="ph ph-star" style="font-size: 16px; color: #a1a1a6; cursor: pointer;"></i>
            </div>
          </div>
          
          <!-- Web Content -->
          <div id="frames-container" style="flex: 1; background: #fff; position: relative; overflow: hidden;"></div>
        </div>
      `;

      const tabsContainer = container.querySelector('#tabs-container');
      const framesContainer = container.querySelector('#frames-container');
      const urlInput = container.querySelector('#browser-url');

      const renderTabs = () => {
        tabsContainer.innerHTML = tabs.map(t => `
          <div class="browser-tab" data-id="${t.id}" style="background: ${t.id === activeTabId ? '#1c1c1e' : 'transparent'}; padding: 8px 16px; border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px; width: 200px; font-size: 12px; color: ${t.id === activeTabId ? '#fff' : '#8a8a9a'}; cursor: pointer; border-right: ${t.id === activeTabId ? 'none' : '1px solid #1c1c1e'};">
            <i class="ph-fill ph-globe-hemisphere-west" style="color: ${t.id === activeTabId ? '#64b5f6' : '#8a8a9a'};"></i>
            <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.title}</span>
            ${tabs.length > 1 ? `<i class="ph ph-x tab-close" data-id="${t.id}" style="cursor: pointer; opacity: 0.7;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'"></i>` : ''}
          </div>
        `).join('') + `
          <div id="btn-new-tab" style="padding: 8px; cursor: pointer; color: #fff; opacity: 0.7; align-self: flex-end; margin-bottom: 4px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
            <i class="ph ph-plus"></i>
          </div>
        `;

        tabsContainer.querySelectorAll('.browser-tab').forEach(el => {
          el.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) return;
            activeTabId = parseInt(el.getAttribute('data-id'));
            updateView();
          });
        });

        tabsContainer.querySelectorAll('.tab-close').forEach(el => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(el.getAttribute('data-id'));
            tabs = tabs.filter(t => t.id !== id);

            const frame = framesContainer.querySelector(`iframe[data-id="${id}"]`);
            if (frame) frame.remove();

            if (activeTabId === id && tabs.length > 0) {
              activeTabId = tabs[tabs.length - 1].id;
            }
            updateView();
          });
        });

        tabsContainer.querySelector('#btn-new-tab').addEventListener('click', () => {
          tabCounter++;
          const newId = tabCounter;
          tabs.push({ id: newId, url: 'https://duckduckgo.com', title: 'New Tab' });
          activeTabId = newId;
          updateView();
        });
      };

      const updateView = () => {
        renderTabs();

        const activeTab = tabs.find(t => t.id === activeTabId);
        if (activeTab) {
          urlInput.value = activeTab.url;
        }

        tabs.forEach(t => {
          let iframe = framesContainer.querySelector(`iframe[data-id="${t.id}"]`);
          if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.setAttribute('data-id', t.id);
            iframe.src = t.url;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.backgroundColor = '#fff';
            framesContainer.appendChild(iframe);
          }
          iframe.style.display = t.id === activeTabId ? 'block' : 'none';
        });
      };

      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          let url = urlInput.value.trim();
          if (!url.includes('.') && !url.startsWith('http')) {
            url = 'https://' + encodeURIComponent(url) + '&ia=web';
          } else if (!url.startsWith('http')) {
            url = 'https://' + url;
          }

          const t = tabs.find(t => t.id === activeTabId);
          if (t) {
            t.url = url;
            try {
              t.title = new URL(url).hostname.replace('www.', '');
            } catch (err) {
              t.title = url;
            }
          }

          const iframe = framesContainer.querySelector(`iframe[data-id="${activeTabId}"]`);
          if (iframe) {
            iframe.src = url;
          }

          urlInput.value = url;
          renderTabs();
        }
      });

      container.querySelector('#btn-reload').addEventListener('click', () => {
        const iframe = framesContainer.querySelector(`iframe[data-id="${activeTabId}"]`);
        if (iframe) {
          iframe.src = iframe.src;
        }
      });

      updateView();
    }
  },

  files: {
    init(container) {
      if (window.FilesApp) {
        window.FilesApp.init(container);
      }
    }
  },

  notes: {
    init(container) {
      const savedNote = localStorage.getItem('lunaris_note') || '';
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%;">
          <div style="padding: 8px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 8px;">
            <button class="btn-primary" style="padding: 4px 12px; font-size: 13px;" id="btn-save-note">Save</button>
            <button class="win-btn" title="Bold"><i class="ph ph-text-b"></i></button>
            <button class="win-btn" title="Italic"><i class="ph ph-text-italic"></i></button>
          </div>
          <textarea id="note-area" style="flex: 1; background: transparent; border: none; padding: 16px; color: white; resize: none; outline: none; font-family: var(--font-main); font-size: 15px; line-height: 1.5;">${savedNote}</textarea>
        </div>
      `;

      const area = container.querySelector('#note-area');
      container.querySelector('#btn-save-note').addEventListener('click', () => {
        localStorage.setItem('lunaris_note', area.value);
        State.addNotification('Note Saved', 'Your note has been saved to local storage.', 'ph-check-circle');
      });
    }
  },

  terminal: {
    init(container) {
      container.innerHTML = `
        <div style="background: rgba(10, 10, 15, 0.95); height: 100%; padding: 16px; font-family: monospace; color: #a5d6a7; overflow-y: auto;" id="term-container">
          <div id="term-output">
            Lunaris One Terminal [Version 1.0.0]<br>
            (c) Lunar Systems. All rights reserved.<br><br>
            Type 'help' for a list of available commands.<br><br>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="color: #64b5f6;">user@lunaris</span><span style="color: #fff;">:</span><span style="color: #9ccc65;">~</span><span style="color: #fff;">$ </span>
            <input type="text" id="term-input" style="flex: 1; background: transparent; border: none; color: #fff; outline: none; font-family: monospace; font-size: 14px; margin-left: 8px;" autofocus>
          </div>
        </div>
      `;

      const input = container.querySelector('#term-input');
      const output = container.querySelector('#term-output');
      const termCont = container.querySelector('#term-container');

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = input.value.trim();
          output.innerHTML += `<div style="margin-top: 4px;"><span style="color: #64b5f6;">user@lunaris</span><span style="color: #fff;">:</span><span style="color: #9ccc65;">~</span><span style="color: #fff;">$ </span>${cmd}</div>`;
          input.value = '';

          let res = '';
          const args = cmd.split(' ');

          switch (args[0].toLowerCase()) {
            case 'help': res = 'Available commands: help, clear, date, time, echo, ls, pwd, whoami, version, launch'; break;
            case 'clear': output.innerHTML = ''; break;
            case 'date': res = new Date().toLocaleDateString(); break;
            case 'time': res = new Date().toLocaleTimeString(); break;
            case 'echo': res = args.slice(1).join(' '); break;
            case 'ls': res = 'Documents Downloads Pictures Music Projects readme.txt'; break;
            case 'pwd': res = '/home/user'; break;
            case 'whoami': res = State.data.username.toLowerCase().replace(' ', '_'); break;
            case 'version': res = 'Lunaris One v1.0.0 (Lunar Core)'; break;
            case 'launch':
              if (args[1]) {
                const app = APPS.find(a => a.id === args[1].toLowerCase());
                if (app) {
                  window.WM.createWindow(app);
                  res = `Launching ${app.name}...`;
                } else {
                  res = `App not found: ${args[1]}`;
                }
              } else {
                res = 'Usage: launch <appid>';
              }
              break;
            case '': break;
            default: res = `Command not found: ${args[0]}`;
          }

          if (res) {
            output.innerHTML += `<div style="color: #fff;">${res}</div>`;
          }
          termCont.scrollTop = termCont.scrollHeight;
        }
      });
    }
  },

  settings: {
    init(container) {
      container.innerHTML = `
        <div style="display: flex; height: 100%;">
          <div style="width: 200px; background: rgba(0,0,0,0.2); padding: 16px; border-right: 1px solid rgba(255,255,255,0.05);">
            <h3 style="margin-bottom: 16px; font-size: 18px; font-weight: 500;">Settings</h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px;" id="settings-nav">
              <li class="active" style="cursor: pointer; color: var(--accent-silver);" data-tab="appearance"><i class="ph ph-palette"></i> Appearance</li>
              <li style="cursor: pointer; opacity: 0.8;" data-tab="about"><i class="ph ph-info"></i> About</li>
            </ul>
          </div>
          <div style="flex: 1; padding: 24px; overflow-y: auto;">
            <div id="tab-appearance">
              <h2 style="margin-bottom: 24px; font-weight: 400;">Appearance</h2>
              
              <div style="margin-bottom: 32px;">
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-weight: 400;">Theme</h4>
                <div style="display: flex; gap: 16px;">
                  <button id="btn-theme-dark" class="btn-primary ${!State.data.moonMode ? 'active' : ''}" style="background: ${!State.data.moonMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'};">Dark Mode</button>
                  <button id="btn-theme-moon" class="btn-primary ${State.data.moonMode ? 'active' : ''}" style="background: ${State.data.moonMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'};">Moon Mode</button>
                </div>
              </div>
              
              <div>
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-weight: 400;">Wallpaper</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                  ${WALLPAPERS.map((wp, i) => `
                    <div class="wp-selector ${State.data.wallpaperIndex === i ? 'selected' : ''}" data-idx="${i}" style="height: 100px; border-radius: 8px; background: url('${wp}') center/cover; cursor: pointer; border: ${State.data.wallpaperIndex === i ? '2px solid var(--accent-silver)' : '2px solid transparent'};"></div>
                  `).join('')}
                </div>
              </div>
            </div>
            
            <div id="tab-about" style="display: none;">
              <div style="text-align: center; margin-top: 40px;">
                <img src="assets/logo.png" style="width: 80px; margin-bottom: 16px;">
                <h2 style="font-weight: 300; font-size: 28px; margin-bottom: 8px;">Lunaris One</h2>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">Version 1.0.0 (Build 2045)</p>
                <p style="font-size: 14px; max-width: 300px; margin: 0 auto; line-height: 1.6;">A modern, browser-based operating system designed for focus and productivity. Built entirely with HTML, CSS, and JavaScript.</p>
              </div>
            </div>
          </div>
        </div>
      `;
      container.querySelector('#btn-theme-dark').addEventListener('click', (e) => {
        State.update('moonMode', false);
        e.target.style.background = 'rgba(255,255,255,0.2)';
        container.querySelector('#btn-theme-moon').style.background = 'rgba(255,255,255,0.05)';
      });
      container.querySelector('#btn-theme-moon').addEventListener('click', (e) => {
        State.update('moonMode', true);
        e.target.style.background = 'rgba(255,255,255,0.2)';
        container.querySelector('#btn-theme-dark').style.background = 'rgba(255,255,255,0.05)';
      });
      container.querySelectorAll('.wp-selector').forEach(el => {
        el.addEventListener('click', (e) => {
          container.querySelectorAll('.wp-selector').forEach(w => w.style.border = '2px solid transparent');
          el.style.border = '2px solid var(--accent-silver)';
          State.update('wallpaperIndex', parseInt(el.getAttribute('data-idx')));
        });
      });
      container.querySelectorAll('#settings-nav li').forEach(li => {
        li.addEventListener('click', () => {
          container.querySelectorAll('#settings-nav li').forEach(l => {
            l.style.opacity = '0.8';
            l.style.color = '';
          });
          li.style.opacity = '1';
          li.style.color = 'var(--accent-silver)';

          ['appearance', 'about'].forEach(t => {
            container.querySelector(`#tab-${t}`).style.display = 'none';
          });
          container.querySelector(`#tab-${li.getAttribute('data-tab')}`).style.display = 'block';
        });
      });
    }
  },

  calculator: {
    init(container) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; background: rgba(0,0,0,0.4); padding: 16px;">
          <div id="calc-display" style="background: rgba(0,0,0,0.5); border-radius: 12px; padding: 24px; text-align: right; font-size: 32px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.05); min-height: 80px; display: flex; flex-direction: column; justify-content: flex-end;">
            <div id="calc-history" style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;"></div>
            <div id="calc-current">0</div>
          </div>
          <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            ${['C', '+/-', '%', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map(btn => {
        let style = "background: rgba(255,255,255,0.1); border-radius: 8px; border: none; color: white; font-size: 18px; cursor: pointer; transition: 0.1s;";
        if (['/', '*', '-', '+', '='].includes(btn)) style += " background: var(--accent-violet);";
        if (btn === '0') style += " grid-column: span 2;";
        return `<button class="calc-btn" style="${style}" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">${btn}</button>`;
      }).join('')}
          </div>
        </div>
      `;

      let current = '0';
      let prev = '';
      let op = null;
      const dCurrent = container.querySelector('#calc-current');
      const dHistory = container.querySelector('#calc-history');

      container.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const v = btn.textContent;
          if (v >= '0' && v <= '9' || v === '.') {
            if (current === '0' && v !== '.') current = v;
            else current += v;
          } else if (v === 'C') {
            current = '0'; prev = ''; op = null;
          } else if (['+', '-', '*', '/'].includes(v)) {
            prev = current; current = '0'; op = v;
          } else if (v === '=') {
            if (op && prev) {
              const res = eval(`${parseFloat(prev)} ${op} ${parseFloat(current)}`);
              dHistory.textContent = `${prev} ${op} ${current} =`;
              current = res.toString();
              prev = ''; op = null;
            }
          }
          dCurrent.textContent = current;
          if (op && !prev) dHistory.textContent = `${current} ${op}`;
        });
      });
    }
  },

  music: {
    init(container) {
      container.innerHTML = `
        <style>
          .sp-track { transition: background 0.2s; }
          .sp-track:hover { background: rgba(255,255,255,0.05); }
          .sp-track.active { color: #a855f7; background: rgba(168, 85, 247, 0.05); }
          .sp-track.active .sp-title { color: #a855f7; }
          .lunaris-scrollbar::-webkit-scrollbar { width: 8px; }
          .lunaris-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .lunaris-scrollbar::-webkit-scrollbar-thumb { background: #2a2a35; border-radius: 4px; }
          .lunaris-scrollbar::-webkit-scrollbar-thumb:hover { background: #3a3a45; }
        </style>
        <div style="display: flex; flex-direction: column; height: 100%; background: #0a0b10; color: white; font-family: 'Inter', sans-serif;">
          <div style="display: flex; flex: 1; overflow: hidden;">
            <!-- Sidebar -->
            <div style="width: 240px; background: #050508; display: flex; flex-direction: column; padding: 24px 12px; gap: 24px; flex-shrink: 0; border-right: 1px solid #1a1a24;">
              <div style="padding: 0 12px; font-weight: 700; font-size: 18px; display: flex; align-items: center; gap: 12px; letter-spacing: -0.5px;">
                <img src="assets/icon_music.png" style="width: 24px; height: 24px; object-fit: contain;"> Lunaris Music
              </div>
              <div style="display: flex; flex-direction: column; gap: 16px; font-weight: 500; color: #8a8a9a;">
                <div style="padding: 0 12px; display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                  <i class="ph ph-magnifying-glass" style="font-size: 20px;"></i>
                  <input type="text" id="sp-search-input" placeholder="Search tracks..." style="width: 100%; background: #1a1a24; border: 1px solid #2a2a35; color: white; padding: 8px 12px; border-radius: 8px; outline: none; font-family: 'Inter', sans-serif; font-size: 12px; transition: border 0.2s;" onfocus="this.style.borderColor='#a855f7'" onblur="this.style.borderColor='#2a2a35'">
                </div>
                <div id="sp-btn-home" style="padding: 8px 12px; cursor: pointer; color: white; display: flex; align-items: center; gap: 12px; transition: all 0.2s; border-radius: 6px;"><i class="ph-fill ph-house" style="font-size: 22px;"></i> Discover</div>
                <div id="sp-btn-fav" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.2s; border-radius: 6px;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#8a8a9a'"><i class="ph-fill ph-heart" style="font-size: 22px;"></i> Favorites</div>
              </div>
            </div>
            
            <!-- Main Content -->
            <div class="lunaris-scrollbar" style="flex: 1; display: flex; flex-direction: column; background: radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.15) 0%, #0a0b10 50%); overflow-y: auto;">
              <!-- Header -->
              <div style="padding: 40px 32px 24px; display: flex; align-items: flex-end; gap: 32px; margin-bottom: 8px;">
                <div id="sp-banner-img" style="width: 200px; height: 200px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); border-radius: 8px; background: url('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2000') center/cover;"></div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <span id="sp-view-type" style="font-size: 12px; font-weight: 700; color: #a855f7; letter-spacing: 1px;">PLAYLIST</span>
                  <h1 id="sp-view-title" style="font-size: clamp(32px, 4vw, 56px); font-weight: 800; margin: 0; letter-spacing: -1.5px; line-height: 1.1;">Space Ambient Mix</h1>
                  <span id="sp-view-meta" style="color: rgba(255,255,255,0.6); font-size: 14px; margin-top: 8px;">Top picks for you</span>
                </div>
              </div>
              
              <!-- Controls -->
              <div style="padding: 0 32px 24px; display: flex; align-items: center; gap: 24px;">
                <button id="sp-main-play" style="width: 56px; height: 56px; border-radius: 50%; background: #a855f7; border: none; color: white; font-size: 24px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(168,85,247,0.3);" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 16px rgba(168,85,247,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(168,85,247,0.3)'">
                  <i id="sp-main-play-icon" class="ph-fill ph-play"></i>
                </button>
              </div>
              
              <!-- Tracklist -->
              <div style="padding: 0 32px 32px;">
                <div style="display: grid; grid-template-columns: 40px 1fr 1fr 60px; padding: 8px 16px; color: #8a8a9a; font-size: 12px; letter-spacing: 1px; border-bottom: 1px solid #1a1a24; margin-bottom: 16px; font-weight: 600;">
                  <span>#</span>
                  <span>TITLE</span>
                  <span>ALBUM</span>
                  <span style="text-align: right;"><i class="ph ph-clock"></i></span>
                </div>
                <div id="sp-tracklist" style="display: flex; flex-direction: column; gap: 4px;">
                  <!-- Track rows generated by JS -->
                </div>
              </div>
            </div>
          </div>
          
          <!-- Bottom Player -->
          <div style="height: 90px; background: rgba(5, 5, 8, 0.95); backdrop-filter: blur(10px); border-top: 1px solid #1a1a24; display: flex; align-items: center; padding: 0 24px; justify-content: space-between;">
            <!-- Left: Now Playing Info -->
            <div style="display: flex; align-items: center; gap: 16px; width: 30%;">
              <div id="sp-np-cover" style="width: 56px; height: 56px; background: #1a1a24; background-size: cover; background-position: center; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></div>
              <div style="display: flex; flex-direction: column; justify-content: center; overflow: hidden;">
                <span id="sp-np-title" style="font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">No song playing</span>
                <span id="sp-np-artist" style="font-size: 12px; color: #8a8a9a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">-</span>
              </div>
              <i id="sp-np-fav" class="ph ph-heart" style="font-size: 18px; color: #8a8a9a; margin-left: 8px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"></i>
            </div>
            
            <!-- Center: Controls -->
            <div style="display: flex; flex-direction: column; align-items: center; width: 40%; max-width: 600px;">
              <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 8px;">
                <i id="sp-btn-shuffle" class="ph ph-shuffle" style="color: #8a8a9a; font-size: 16px; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="if(this.dataset.active !== 'true') this.style.color='#8a8a9a'"></i>
                <i id="sp-btn-prev" class="ph-fill ph-skip-back" style="color: #d0d0d0; font-size: 20px; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d0d0d0'"></i>
                <button id="sp-btn-play" style="width: 36px; height: 36px; border-radius: 50%; background: white; border: none; color: black; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: transform 0.1s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                  <i id="sp-play-icon" class="ph-fill ph-play" style="font-size: 18px;"></i>
                </button>
                <i id="sp-btn-next" class="ph-fill ph-skip-forward" style="color: #d0d0d0; font-size: 20px; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d0d0d0'"></i>
                <i id="sp-btn-repeat" class="ph ph-repeat" style="color: #8a8a9a; font-size: 16px; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="if(this.dataset.active !== 'true') this.style.color='#8a8a9a'"></i>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
                <span id="sp-time-curr" style="font-size: 11px; color: #8a8a9a; min-width: 35px; text-align: right; font-variant-numeric: tabular-nums;">0:00</span>
                <input type="range" id="sp-progress" min="0" max="100" value="0" style="flex: 1; height: 4px; border-radius: 2px; appearance: none; background: #2a2a35; outline: none; cursor: pointer;">
                <span id="sp-time-dur" style="font-size: 11px; color: #8a8a9a; min-width: 35px; font-variant-numeric: tabular-nums;">0:00</span>
              </div>
            </div>
            
            <!-- Right: Volume -->
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; width: 30%;">
              <i id="sp-btn-mute" class="ph-fill ph-speaker-high" style="color: #8a8a9a; font-size: 18px; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#8a8a9a'"></i>
              <input type="range" id="sp-volume" min="0" max="100" value="100" style="width: 100px; height: 4px; border-radius: 2px; appearance: none; background: #2a2a35; outline: none; cursor: pointer;">
            </div>
          </div>
        </div>
      `;

      const engine = window.LunarAudio;
      if (!engine) {
        container.innerHTML = '<div style="padding: 24px; color: white;">Audio Engine not loaded.</div>';
        return;
      }

      const tracklist = container.querySelector('#sp-tracklist');
      const searchInput = container.querySelector('#sp-search-input');
      const viewTitle = container.querySelector('#sp-view-title');
      const viewType = container.querySelector('#sp-view-type');
      const viewMeta = container.querySelector('#sp-view-meta');
      const bannerImg = container.querySelector('#sp-banner-img');
      const btnHome = container.querySelector('#sp-btn-home');
      const btnFav = container.querySelector('#sp-btn-fav');

      const btnPlayIcon = container.querySelector('#sp-play-icon');
      const btnMainPlayIcon = container.querySelector('#sp-main-play-icon');
      const progress = container.querySelector('#sp-progress');
      const volume = container.querySelector('#sp-volume');

      let displayedTracks = [];
      let isSearching = false;
      const fallbackTracks = [
        { id: '1', title: 'Space Ambient', artist: 'Lunar Studio', album: 'Space Ambient Mix', artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200', streamUrl: 'https://actions.google.com/sounds/v1/science_fiction/space_ambient.ogg', duration: 105 },
        { id: '2', title: 'Engine Room', artist: 'Lunar Studio', album: 'Space Ambient Mix', artwork: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=200', streamUrl: 'https://actions.google.com/sounds/v1/science_fiction/spaceship_engine.ogg', duration: 72 }
      ];

      const renderTracklist = () => {
        if (displayedTracks.length > 0 && displayedTracks[0].artwork) {
          bannerImg.style.backgroundImage = `url('${displayedTracks[0].artwork}')`;
        } else {
          bannerImg.style.backgroundImage = `url('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2000')`;
        }

        tracklist.innerHTML = displayedTracks.map((t, i) => {
          const isCurrent = engine.state.queue[engine.state.currentIndex]?.id === t.id;
          const formatTime = (secs) => {
            if (!secs) return '0:00';
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
          };

          return `
            <div class="sp-track ${isCurrent ? 'active' : ''}" data-idx="${i}" style="display: grid; grid-template-columns: 40px 1fr 1fr 60px; padding: 12px 16px; border-radius: 6px; cursor: pointer; align-items: center;">
              <span style="color: ${isCurrent ? '#a855f7' : '#8a8a9a'}; font-size: 14px;">${isCurrent && engine.state.isPlaying ? '<i class="ph-fill ph-chart-bar"></i>' : (i + 1)}</span>
              <div style="display: flex; align-items: center; gap: 16px;">
                <img src="${t.artwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200'}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                <div style="display: flex; flex-direction: column; overflow: hidden; padding-right: 12px;">
                  <span class="sp-title" style="font-size: 14px; font-weight: 600; color: ${isCurrent ? '#a855f7' : 'white'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.title}</span>
                  <span style="font-size: 12px; color: #8a8a9a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.artist}</span>
                </div>
              </div>
              <span style="font-size: 14px; color: #8a8a9a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 12px;">${t.album}</span>
              <span style="font-size: 14px; color: #8a8a9a; text-align: right; font-variant-numeric: tabular-nums;">${formatTime(t.duration)}</span>
            </div>
          `;
        }).join('');

        container.querySelectorAll('.sp-track').forEach(el => {
          el.addEventListener('click', () => {
            const idx = parseInt(el.getAttribute('data-idx'));
            const track = displayedTracks[idx];
            if (isSearching) {
              engine.playNow(track);
            } else {
              engine.clearQueue();
              displayedTracks.forEach(t => engine.addToQueue(t));
              engine.playTrack(idx);
            }
          });
        });
      };

      const updateNP = (track) => {
        if (!track) return;
        container.querySelector('#sp-np-cover').style.backgroundImage = `url('${track.artwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200'}')`;
        container.querySelector('#sp-np-title').textContent = track.title;
        container.querySelector('#sp-np-artist').textContent = track.artist;
        const favIcon = container.querySelector('#sp-np-fav');
        if (engine.isFavorite(track.id)) {
          favIcon.classList.replace('ph-heart', 'ph-fill');
          favIcon.style.color = '#a855f7';
        } else {
          favIcon.classList.replace('ph-fill', 'ph-heart');
          favIcon.style.color = '#8a8a9a';
        }
      };

      const updatePlayState = () => {
        if (engine.state.isPlaying) {
          btnPlayIcon.classList.replace('ph-play', 'ph-pause');
          btnMainPlayIcon.classList.replace('ph-play', 'ph-pause');
        } else {
          btnPlayIcon.classList.replace('ph-pause', 'ph-play');
          btnMainPlayIcon.classList.replace('ph-pause', 'ph-play');
        }
        renderTracklist();
      };

      engine.on('play', (track) => { updateNP(track); updatePlayState(); });
      engine.on('pause', () => { updatePlayState(); });
      engine.on('trackchange', (track) => { updateNP(track); renderTracklist(); });
      engine.on('volumechange', (data) => {
        volume.value = data.volume * 100;
        const icon = container.querySelector('#sp-btn-mute');
        if (data.muted) icon.classList.replace('ph-speaker-high', 'ph-speaker-x');
        else icon.classList.replace('ph-speaker-x', 'ph-speaker-high');
      });
      engine.on('progress', (data) => {
        container.querySelector('#sp-time-curr').textContent = data.formattedCurrent;
        container.querySelector('#sp-time-dur').textContent = data.formattedDuration;
        progress.value = data.percent;
      });

      container.querySelector('#sp-btn-play').addEventListener('click', () => engine.togglePlayback());
      container.querySelector('#sp-main-play').addEventListener('click', () => {
        if (engine.state.queue.length === 0) {
          displayedTracks.forEach(t => engine.addToQueue(t));
          engine.playTrack(0);
        } else {
          engine.togglePlayback();
        }
      });

      container.querySelector('#sp-btn-prev').addEventListener('click', () => engine.previousTrack());
      container.querySelector('#sp-btn-next').addEventListener('click', () => engine.nextTrack());

      container.querySelector('#sp-btn-shuffle').addEventListener('click', (e) => {
        engine.toggleShuffle();
        e.target.dataset.active = engine.state.shuffleMode ? 'true' : 'false';
        e.target.style.color = engine.state.shuffleMode ? '#a855f7' : '#8a8a9a';
      });

      container.querySelector('#sp-btn-repeat').addEventListener('click', (e) => {
        const modes = ['off', 'all', 'one'];
        const currentIdx = modes.indexOf(engine.state.repeatMode);
        const nextMode = modes[(currentIdx + 1) % modes.length];
        engine.setRepeatMode(nextMode);
        e.target.dataset.active = nextMode !== 'off' ? 'true' : 'false';
        e.target.style.color = nextMode !== 'off' ? '#a855f7' : '#8a8a9a';
        if (nextMode === 'one') {
          e.target.classList.replace('ph-repeat', 'ph-repeat-once');
        } else {
          e.target.classList.replace('ph-repeat-once', 'ph-repeat');
        }
      });

      container.querySelector('#sp-btn-mute').addEventListener('click', () => engine.toggleMute());
      volume.addEventListener('input', () => engine.setVolume(volume.value / 100));
      progress.addEventListener('input', () => engine.seek(progress.value));

      container.querySelector('#sp-np-fav').addEventListener('click', () => {
        const t = engine.getCurrentTrack();
        if (t) {
          engine.toggleFavorite(t);
          updateNP(t);
        }
      });

      const updateActiveTab = (activeBtn) => {
        [btnHome, btnFav].forEach(b => {
          b.style.color = '#8a8a9a';
          b.style.background = 'transparent';
        });
        if (activeBtn) {
          activeBtn.style.color = 'white';
          activeBtn.style.background = 'rgba(255,255,255,0.05)';
        }
      };

      searchInput.addEventListener('input', (e) => {
        const q = e.target.value;
        updateActiveTab(null);
        if (q.trim() === '') {
          btnHome.click();
          return;
        }
        engine.searchSongs(q, (err, results) => {
          if (!err) {
            isSearching = true;
            displayedTracks = results;
            viewTitle.textContent = `Search: "${q}"`;
            viewType.textContent = 'SEARCH RESULTS';
            viewMeta.textContent = `${results.length} songs found`;
            renderTracklist();
          }
        });
      });

      btnHome.addEventListener('click', () => {
        searchInput.value = '';
        isSearching = false;
        displayedTracks = fallbackTracks;
        viewTitle.textContent = 'Discover';
        viewType.textContent = 'TRENDING NOW';
        viewMeta.textContent = 'Curated space ambient tracks';
        updateActiveTab(btnHome);
        renderTracklist();
      });

      btnFav.addEventListener('click', () => {
        searchInput.value = '';
        isSearching = false;
        displayedTracks = engine.state.favorites;
        viewTitle.textContent = 'Favorites';
        viewType.textContent = 'YOUR LIBRARY';
        viewMeta.textContent = `${displayedTracks.length} saved songs`;
        updateActiveTab(btnFav);
        renderTracklist();
      });

      btnHome.click();
      if (engine.state.queue.length > 0) {
        updateNP(engine.getCurrentTrack());
        updatePlayState();
        const shuffleBtn = container.querySelector('#sp-btn-shuffle');
        shuffleBtn.dataset.active = engine.state.shuffleMode ? 'true' : 'false';
        shuffleBtn.style.color = engine.state.shuffleMode ? '#a855f7' : '#8a8a9a';
        const repeatBtn = container.querySelector('#sp-btn-repeat');
        repeatBtn.dataset.active = engine.state.repeatMode !== 'off' ? 'true' : 'false';
        repeatBtn.style.color = engine.state.repeatMode !== 'off' ? '#a855f7' : '#8a8a9a';
        if (engine.state.repeatMode === 'one') repeatBtn.classList.replace('ph-repeat', 'ph-repeat-once');
        volume.value = engine.state.volume * 100;
      }
    }
  },

  gallery: {
    init(container) {
      container.innerHTML = `
        <div style="padding: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px; overflow-y: auto; height: 100%;">
          ${WALLPAPERS.map(wp => `
            <div style="aspect-ratio: 1; border-radius: 12px; background: url('${wp}') center/cover; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></div>
          `).join('')}
        </div>
      `;
    }
  },

  clock: {
    init(container) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; align-items: center; justify-content: center;">
          <div id="app-clock-time" style="font-size: 64px; font-weight: 300; margin-bottom: 8px;"></div>
          <div id="app-clock-date" style="font-size: 18px; color: var(--text-secondary); margin-bottom: 32px;"></div>
          <div style="display: flex; gap: 16px;">
            <button class="btn-primary" style="background: rgba(255,255,255,0.2);">Alarm</button>
            <button class="btn-primary" style="background: rgba(255,255,255,0.1);">Stopwatch</button>
            <button class="btn-primary" style="background: rgba(255,255,255,0.1);">Timer</button>
          </div>
        </div>
      `;

      const updateAppClock = () => {
        const timeEl = container.querySelector('#app-clock-time');
        const dateEl = container.querySelector('#app-clock-date');
        if (timeEl && dateEl) {
          const now = new Date();
          timeEl.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
          dateEl.textContent = Utils.formatDate(now);
        }
      };
      updateAppClock();
      const interval = setInterval(updateAppClock, 1000);
    }
  }
};
