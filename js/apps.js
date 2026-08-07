window.Apps = {
  browser: {
    init(container) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; background: #ece9d8;">
          <div style="padding: 4px; display: flex; gap: 4px; border-bottom: 1px solid #aca899;">
            <input type="text" id="browser-url" value="https://dotdvn.me" style="flex: 1; padding: 4px; border: 1px solid #7f9db9;">
            <button id="btn-go" class="btn-primary" style="padding: 4px 12px;">Go</button>
          </div>
          <iframe id="browser-frame" src="https://dotdvn.me" style="flex: 1; border: none; background: white;"></iframe>
        </div>
      `;
      const input = container.querySelector('#browser-url');
      const frame = container.querySelector('#browser-frame');
      const go = () => {
        let url = input.value.trim();
        if (!url.startsWith('http')) url = 'https://' + url;
        frame.src = url;
      };
      container.querySelector('#btn-go').addEventListener('click', go);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') go();
      });
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
            Lunaris XP Terminal [Version 1.0.0]<br>
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
            case 'version': res = 'Lunaris XP v1.0.0 (Lunar Core)'; break;
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
      const renderWallpapers = () => {
        return WALLPAPERS.map((wp, i) => {
          let name = `Wallpaper ${i + 1}`;
          if (i === 0) name = 'XP Hill';
          if (i === 1) name = 'Deep Space';
          if (i === 2) name = 'Neon Horizon';
          return `<button class="wp-btn" data-idx="${i}" style="padding: 4px 12px; font-family: Tahoma; cursor: pointer; ${State.data.wallpaperIndex === i ? 'border: 2px inset #fff; font-weight: bold;' : ''}">${name}</button>`;
        }).join('');
      };

      const render = () => {
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; height: 100%; background: #ece9d8; font-family: Tahoma, sans-serif; color: #000; padding: 16px; overflow-y: auto;">
            <div style="font-weight: bold; font-size: 18px; border-bottom: 2px solid #aca899; padding-bottom: 8px; margin-bottom: 16px; display: flex; align-items: center;">
              <i class="ph ph-faders" style="margin-right: 8px; color: #316ac5;"></i> Control Panel
            </div>

            <div style="background: #fff; border: 2px inset #fff; padding: 16px; margin-bottom: 16px;">
              <div style="font-weight: bold; margin-bottom: 12px; color: #316ac5;">Display Settings</div>
              <label style="font-size: 12px; display: block; margin-bottom: 8px;">Select Desktop Wallpaper:</label>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;" id="wallpaper-buttons">
                ${renderWallpapers()}
              </div>
              <button id="btn-fetch-apod" style="padding: 4px 12px; font-family: Tahoma; cursor: pointer;">Download Daily NASA APOD</button>
            </div>

            <div style="background: #fff; border: 2px inset #fff; padding: 16px;">
              <div style="font-weight: bold; margin-bottom: 12px; color: #316ac5;">System Sounds</div>
              <label style="display: flex; align-items: center; font-size: 12px; cursor: pointer;">
                <input type="checkbox" id="mute-sounds" style="margin-right: 8px;" ${State.data.muted ? 'checked' : ''}>
                Mute all system UI sounds
              </label>
            </div>
          </div>
        `;

        const wpBtns = container.querySelectorAll('.wp-btn');
        wpBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            State.update('wallpaperIndex', idx);
            render();
          });
        });

        const fetchApodBtn = container.querySelector('#btn-fetch-apod');
        fetchApodBtn.addEventListener('click', async (e) => {
          const btn = e.target;
          btn.innerText = 'Downloading...';
          btn.disabled = true;
          try {
            const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=jmxUlCjGfzPgT0gJSenV0CozrFfdZOWKc9G59SUn');
            const data = await res.json();
            if (data.url) {
              WALLPAPERS.push(data.hdurl || data.url);
              const newIdx = WALLPAPERS.length - 1;
              State.update('wallpaperIndex', newIdx);
              render();
            } else {
              btn.innerText = 'Failed to load APOD';
              btn.disabled = false;
            }
          } catch (err) {
            console.error(err);
            btn.innerText = 'Error downloading';
            btn.disabled = false;
          }
        });

        const muteCheckbox = container.querySelector('#mute-sounds');
        if (muteCheckbox) {
          muteCheckbox.addEventListener('change', (e) => {
            State.update('muted', e.target.checked);
          });
        }
      };

      render();
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
  }, calendar: {
    init(container) {
      container.innerHTML = `
        <div style="padding: 16px; display: flex; flex-direction: column; height: 100%; background: #ece9d8; color: #000; font-family: Tahoma, sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: #0058e6; color: white; padding: 4px 8px; border-radius: 4px;">
            <button id="cal-prev" style="cursor: pointer; padding: 2px 8px;">&lt;</button>
            <div id="cal-month-year" style="font-weight: bold; font-size: 14px;"></div>
            <button id="cal-next" style="cursor: pointer; padding: 2px 8px;">&gt;</button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-weight: bold; margin-bottom: 8px;">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          <div id="cal-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; flex: 1;"></div>
        </div>
      `;
      let currDate = new Date();
      const monthYear = container.querySelector('#cal-month-year');
      const days = container.querySelector('#cal-days');

      const render = () => {
        const year = currDate.getFullYear();
        const month = currDate.getMonth();
        monthYear.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();

        let html = '';
        for (let x = 1; x <= firstDayIndex; x++) html += `<div></div>`;
        for (let i = 1; i <= lastDay; i++) {
          let isToday = (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear());
          html += `<div style="padding: 4px; ${isToday ? 'background: #316ac5; color: white; border-radius: 4px;' : 'cursor: pointer;'}" onmouseover="this.style.background='${isToday ? '#316ac5' : '#fff'}'" onmouseout="this.style.background='${isToday ? '#316ac5' : 'transparent'}'">${i}</div>`;
        }
        days.innerHTML = html;
      };

      container.querySelector('#cal-prev').addEventListener('click', () => { currDate.setMonth(currDate.getMonth() - 1); render(); });
      container.querySelector('#cal-next').addEventListener('click', () => { currDate.setMonth(currDate.getMonth() + 1); render(); });
      render();
    }
  },

  weather: {
    init(container) {
      container.innerHTML = `
        <div style="padding: 24px; display: flex; flex-direction: column; height: 100%; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; font-family: 'Inter', sans-serif;">
          <div style="display: flex; gap: 8px; margin-bottom: 24px;">
            <input type="text" id="weather-city" placeholder="Enter city..." value="Thiruvalla" style="flex: 1; padding: 8px 12px; border: none; border-radius: 8px; background: rgba(255,255,255,0.2); color: white; outline: none;">
            <button id="btn-weather-search" style="padding: 8px 16px; border: none; border-radius: 8px; background: rgba(255,255,255,0.3); color: white; cursor: pointer; font-weight: 600;">Search</button>
          </div>
          <div id="weather-content" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
            <div id="w-city" style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Loading...</div>
            <div id="w-temp" style="font-size: 64px; font-weight: 700; margin-bottom: 8px;">--°C</div>
            <div id="w-desc" style="font-size: 18px; opacity: 0.9;">Please wait</div>
          </div>
        </div>
      `;

      const cityInput = container.querySelector('#weather-city');
      const wCity = container.querySelector('#w-city');
      const wTemp = container.querySelector('#w-temp');
      const wDesc = container.querySelector('#w-desc');

      const fetchWeather = async (city) => {
        wCity.textContent = 'Searching...';
        wTemp.textContent = '--°C';
        wDesc.textContent = '';
        try {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
          const geoData = await geoRes.json();
          if (!geoData.results || geoData.results.length === 0) {
            wCity.textContent = 'City not found';
            return;
          }
          const { latitude, longitude, name, country } = geoData.results[0];

          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          const current = weatherData.current_weather;

          wCity.textContent = `${name}, ${country}`;
          wTemp.textContent = `${Math.round(current.temperature)}°C`;
          wDesc.textContent = `Wind: ${current.windspeed} km/h`;
        } catch (err) {
          wCity.textContent = 'Network Error';
        }
      };

      container.querySelector('#btn-weather-search').addEventListener('click', () => {
        if (cityInput.value.trim()) fetchWeather(cityInput.value.trim());
      });
      cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && cityInput.value.trim()) fetchWeather(cityInput.value.trim());
      });

      fetchWeather('tiruvalla');
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
  },

  iss: {
    init(container) {
      container.innerHTML = `
        <div style="padding: 24px; display: flex; flex-direction: column; height: 100%; background: #ece9d8; color: #000; font-family: Tahoma, sans-serif;">
          <h3 style="margin-bottom: 16px; border-bottom: 2px solid #aca899; padding-bottom: 8px;">ISS Radar Tracker</h3>
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div id="iss-radar" style="width: 200px; height: 200px; border-radius: 50%; border: 3px inset #fff; background: #002200; position: relative; margin-bottom: 24px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 100%; height: 2px; background: rgba(0,255,0,0.3); animation: scan 2s linear infinite;"></div>
              <i class="ph ph-crosshair" style="font-size: 64px; opacity: 0.5;"></i>
              <div id="iss-dot" style="position: absolute; width: 8px; height: 8px; background: #00ff00; border-radius: 50%; box-shadow: 0 0 8px #00ff00;"></div>
            </div>
            <div style="font-size: 18px; margin-bottom: 8px;">Latitude: <span id="iss-lat">--</span></div>
            <div style="font-size: 18px;">Longitude: <span id="iss-lng">--</span></div>
          </div>
          <style>@keyframes scan { 0% { transform: translateY(-100px); } 100% { transform: translateY(100px); } }</style>
        </div>
      `;

      const updateISS = async () => {
        try {
          const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
          const data = await res.json();
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);

          if (container.querySelector('#iss-lat')) {
            container.querySelector('#iss-lat').textContent = lat.toFixed(4);
            container.querySelector('#iss-lng').textContent = lng.toFixed(4);

            const dot = container.querySelector('#iss-dot');
            const x = ((lng + 180) / 360) * 180 - 90;
            const y = ((lat + 90) / 180) * 180 - 90;
            dot.style.transform = `translate(${x}px, ${-y}px)`;
          }
        } catch (e) { }
      };

      updateISS();
      const interval = setInterval(updateISS, 5000);
      container.setAttribute('data-interval', interval);
    }
  },

  mars: {
    init(container) {
      container.innerHTML = `
        <div style="padding: 24px; display: flex; flex-direction: column; height: 100%; background: #ece9d8; color: #000; font-family: Tahoma, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #aca899; padding-bottom: 16px; margin-bottom: 24px;">
            <div style="font-size: 24px; font-weight: bold;"><i class="ph ph-planet"></i> Mars Weather</div>
            <div style="font-size: 14px; color: #666;">Jezero Crater</div>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 80px; font-weight: bold; margin-bottom: 8px;" id="mars-temp">...</div>
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 32px;">Sol <span id="mars-sol">...</span></div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; max-width: 300px;">
              <div style="background: #fff; padding: 16px; border: 2px inset #fff; text-align: center;">
                <i class="ph ph-wind" style="font-size: 24px; margin-bottom: 8px; color: #316ac5;"></i>
                <div style="font-size: 12px; color: #666;">Wind Speed</div>
                <div style="font-size: 18px; font-weight: bold;" id="mars-wind">-- m/s</div>
              </div>
              <div style="background: #fff; padding: 16px; border: 2px inset #fff; text-align: center;">
                <i class="ph ph-gauge" style="font-size: 24px; margin-bottom: 8px; color: #316ac5;"></i>
                <div style="font-size: 12px; color: #666;">Pressure</div>
                <div style="font-size: 18px; font-weight: bold;" id="mars-pressure">-- Pa</div>
              </div>
            </div>
          </div>
        </div>
      `;

      setTimeout(() => {
        if (container.querySelector('#mars-temp')) {
          const temp = -60 + Math.floor(Math.random() * 20);
          const sol = 1000 + Math.floor(Date.now() / 86400000) % 1000;
          const wind = 5 + Math.floor(Math.random() * 10);
          const pressure = 700 + Math.floor(Math.random() * 50);

          container.querySelector('#mars-temp').textContent = `${temp}°C`;
          container.querySelector('#mars-sol').textContent = sol;
          container.querySelector('#mars-wind').textContent = `${wind} m/s`;
          container.querySelector('#mars-pressure').textContent = `${pressure} Pa`;
        }
      }, 800);
    }
  },

  neo: {
    init(container) {
      container.innerHTML = `
        <div style="padding: 24px; display: flex; flex-direction: column; height: 100%; background: #ece9d8; color: #000; font-family: Tahoma, sans-serif;">
          <div style="display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #aca899; padding-bottom: 16px; margin-bottom: 16px;">
            <i class="ph ph-radar" style="font-size: 32px; color: #d32f2f;"></i>
            <div>
              <div style="font-size: 20px; font-weight: bold;">Asteroid Radar</div>
              <div style="font-size: 12px; color: #666;">Live Earth Approach Data</div>
            </div>
          </div>
          <div id="neo-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
            <div style="text-align: center; color: #888; margin-top: 40px;">Scanning space sector...</div>
          </div>
        </div>
      `;

      const fetchNEO = async () => {
        try {
          const dateStr = new Date().toISOString().split('T')[0];
          const res = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${dateStr}&end_date=${dateStr}&api_key=jmxUlCjGfzPgT0gJSenV0CozrFfdZOWKc9G59SUn`);
          const data = await res.json();
          const asteroids = data.near_earth_objects[dateStr] || [];

          let html = '';
          asteroids.slice(0, 15).forEach(a => {
            const isDanger = a.is_potentially_hazardous_asteroid;
            const speed = parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2);
            const dist = parseFloat(a.close_approach_data[0].miss_distance.lunar).toFixed(1);
            const size = parseFloat(a.estimated_diameter.meters.estimated_diameter_max).toFixed(0);

            html += `
              <div style="background: #fff; border: 2px inset #fff; padding: 12px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${isDanger ? '#d32f2f' : '#388e3c'}; margin-bottom: 4px;">
                <div>
                  <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${a.name}</div>
                  <div style="font-size: 12px; color: #666;">${size}m wide | ${speed} km/s</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 14px; font-weight: bold;">${dist} LD</div>
                  <div style="font-size: 10px; color: #666;">Miss Dist.</div>
                </div>
              </div>
            `;
          });

          if (container.querySelector('#neo-list')) {
            container.querySelector('#neo-list').innerHTML = html || '<div style="text-align: center; color: #888; margin-top: 40px;">No near earth objects today.</div>';
          }
        } catch (e) {
          if (container.querySelector('#neo-list')) {
            container.querySelector('#neo-list').innerHTML = '<div style="text-align: center; color: #f44336; margin-top: 40px;">NASA Uplink Failed</div>';
          }
        }
      };

      fetchNEO();
    }
  },

  epic: {
    init(container) {
      container.innerHTML = `
        <div style="display: flex; height: 100%; background: #ece9d8; color: #000; font-family: Tahoma, sans-serif;">
          <div style="width: 220px; border-right: 2px solid #aca899; padding: 12px; display: flex; flex-direction: column; overflow-y: auto; background: #ece9d8;">
            <div style="font-weight: bold; border-bottom: 2px solid #aca899; margin-bottom: 12px; padding-bottom: 4px;">Picture Details</div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Date:</strong> <br><span id="epic-detail-date">--</span></div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Image ID:</strong> <br><span id="epic-detail-id">--</span></div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Center Lat:</strong> <br><span id="epic-detail-lat">--</span></div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Center Lon:</strong> <br><span id="epic-detail-lon">--</span></div>
            <div style="font-size: 12px; margin-bottom: 8px; flex: 1;"><strong>Caption:</strong> <br><span id="epic-detail-caption">--</span></div>
          </div>
          
          <div style="flex: 1; display: flex; flex-direction: column;">
            <div style="padding: 8px; background: #ece9d8; border-bottom: 2px solid #aca899; font-weight: bold; display: flex; align-items: center;">
              <i class="ph ph-globe" style="margin-right: 8px; color: #316ac5;"></i> Earth Live View (EPIC)
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative; background: #fff; border: 3px inset #fff; margin: 8px;" id="epic-image-container">
              <div id="epic-loading" style="position: absolute; text-align: center; color: #666; font-size: 14px;">
                <div style="margin-bottom: 8px;">Establishing satellite link...</div>
              </div>
              <img id="epic-image" style="width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: opacity 1s;" />
            </div>
          </div>

          <div style="width: 220px; border-left: 2px solid #fff; padding: 12px; display: flex; flex-direction: column; overflow-y: auto; background: #ece9d8;">
            <div style="font-weight: bold; border-bottom: 2px solid #aca899; margin-bottom: 12px; padding-bottom: 4px;">Satellite Details</div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Name:</strong> DSCOVR</div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Orbit:</strong> L1 Point</div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Distance:</strong> ~1,000,000 miles</div>
            <div style="font-size: 12px; margin-bottom: 8px;"><strong>Instrument:</strong> EPIC</div>
            <div style="font-weight: bold; margin-top: 16px; margin-bottom: 8px; font-size: 12px;">Live J2000 Position (km):</div>
            <div style="font-size: 12px; margin-bottom: 4px;"><strong>X:</strong> <span id="epic-sat-x">--</span></div>
            <div style="font-size: 12px; margin-bottom: 4px;"><strong>Y:</strong> <span id="epic-sat-y">--</span></div>
            <div style="font-size: 12px; margin-bottom: 4px;"><strong>Z:</strong> <span id="epic-sat-z">--</span></div>
          </div>
        </div>
      `;

      const fetchEPIC = async () => {
        try {
          const res = await fetch('https://api.nasa.gov/EPIC/api/natural?api_key=jmxUlCjGfzPgT0gJSenV0CozrFfdZOWKc9G59SUn');
          if (!res.ok) throw new Error('API failed');
          const data = await res.json();
          if (data && data.length > 0) {
            const item = data[0];
            const dateParts = item.date.split(' ')[0].split('-');
            const year = dateParts[0];
            const month = dateParts[1];
            const day = dateParts[2];
            const imageUrl = `https://api.nasa.gov/EPIC/archive/natural/${year}/${month}/${day}/png/${item.image}.png?api_key=jmxUlCjGfzPgT0gJSenV0CozrFfdZOWKc9G59SUn`;

            if (container.querySelector('#epic-detail-date')) {
              container.querySelector('#epic-detail-date').textContent = item.date;
              container.querySelector('#epic-detail-id').textContent = item.identifier;
              container.querySelector('#epic-detail-caption').textContent = item.caption;
              container.querySelector('#epic-detail-lat').textContent = parseFloat(item.centroid_coordinates.lat).toFixed(2);
              container.querySelector('#epic-detail-lon').textContent = parseFloat(item.centroid_coordinates.lon).toFixed(2);

              if (item.dscovr_j2000_position) {
                container.querySelector('#epic-sat-x').textContent = parseFloat(item.dscovr_j2000_position.x).toFixed(0);
                container.querySelector('#epic-sat-y').textContent = parseFloat(item.dscovr_j2000_position.y).toFixed(0);
                container.querySelector('#epic-sat-z').textContent = parseFloat(item.dscovr_j2000_position.z).toFixed(0);
              }

              const img = container.querySelector('#epic-image');
              img.src = imageUrl;
              img.onload = () => {
                img.style.opacity = '1';
                container.querySelector('#epic-loading').style.display = 'none';
              };
            }
          }
        } catch (e) {
          if (container.querySelector('#epic-loading')) {
            container.querySelector('#epic-loading').innerHTML = '<div style="color: #d32f2f; margin-bottom: 8px;">Satellite uplink failed (Rate Limit).</div><div>Loading archived feed...</div>';

            setTimeout(() => {
              if (container.querySelector('#epic-detail-date')) {
                container.querySelector('#epic-detail-date').textContent = "2023-10-14 00:36:33 (Archive)";
                container.querySelector('#epic-detail-id').textContent = "20231014003633";
                container.querySelector('#epic-detail-caption').textContent = "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft";

                const img = container.querySelector('#epic-image');
                img.src = 'https://epic.gsfc.nasa.gov/archive/natural/2023/10/14/png/epic_1b_20231014003633.png';
                img.onload = () => {
                  img.style.opacity = '1';
                  const loading = container.querySelector('#epic-loading');
                  if (loading) loading.style.display = 'none';
                };
              }
            }, 1500);
          }
        }
      };

      fetchEPIC();
    }
  },

  astro: {
    init(container) {
      container.innerHTML = `
        <div style="padding: 24px; display: flex; flex-direction: column; height: 100%; background: #ece9d8; color: #000; font-family: Tahoma, sans-serif;">
          <div style="text-align: center; margin-bottom: 24px;">
            <i class="ph ph-user-focus" style="font-size: 48px; color: #316ac5; margin-bottom: 8px;"></i>
            <div style="font-size: 24px; font-weight: bold;">Astronauts in Space</div>
            <div style="font-size: 14px; color: #666; margin-top: 4px;">Live tracking of humans currently in orbit</div>
          </div>
          <div style="text-align: center; margin-bottom: 24px; background: #fff; padding: 16px; border: 2px inset #fff;">
            <div style="font-size: 48px; font-weight: bold;" id="astro-count">--</div>
            <div style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Total Humans</div>
          </div>
          <div id="astro-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
            <div style="text-align: center; color: #666;">Establishing comms link...</div>
          </div>
        </div>
      `;

      const fetchAstros = async () => {
        try {
          const res = await fetch('https://api.allorigins.win/raw?url=http://api.open-notify.org/astros.json');
          const data = await res.json();

          if (container.querySelector('#astro-count')) {
            container.querySelector('#astro-count').textContent = data.number;

            let html = '';
            data.people.forEach(person => {
              html += `
                <div style="background: #fff; border: 2px inset #fff; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-weight: bold;">${person.name}</div>
                  <div style="font-size: 12px; background: #ece9d8; border: 1px solid #aca899; padding: 4px 8px; display: inline-block;">${person.craft}</div>
                </div>
              `;
            });
            container.querySelector('#astro-list').innerHTML = html;
          }
        } catch (e) {
          if (container.querySelector('#astro-list')) {
            container.querySelector('#astro-list').innerHTML = '<div style="text-align: center; color: #f44336;">Comms Link Failed</div>';
          }
        }
      };

      fetchAstros();
    }
  },

  news: {
    init(container) {
      container.innerHTML = `
        <div style="padding: 16px; display: flex; flex-direction: column; height: 100%; background: #ece9d8; color: #000; font-family: Tahoma, sans-serif;">
          <div style="font-weight: bold; border-bottom: 2px solid #aca899; margin-bottom: 12px; padding-bottom: 8px; font-size: 16px;">
            <i class="ph ph-newspaper" style="color: #316ac5; margin-right: 8px;"></i>Spaceflight News Aggregator
          </div>
          <div id="news-list" style="flex: 1; overflow-y: auto; background: #fff; border: 2px inset #fff; padding: 8px;">
            <div style="text-align: center; color: #666; margin-top: 20px;">Fetching latest space news...</div>
          </div>
        </div>
      `;

      const fetchNews = async () => {
        try {
          const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles?limit=15');
          const data = await res.json();
          let html = '';
          data.results.forEach(article => {
            const date = new Date(article.published_at).toLocaleDateString();
            html += `
              <div style="margin-bottom: 16px; border-bottom: 1px dotted #aca899; padding-bottom: 12px;">
                <div style="font-weight: bold; color: #316ac5; font-size: 14px; margin-bottom: 4px;">
                  <a href="${article.url}" target="_blank" style="color: #316ac5; text-decoration: none;">${article.title}</a>
                </div>
                <div style="font-size: 10px; color: #666; margin-bottom: 8px;">
                  <strong>${article.news_site}</strong> | ${date}
                </div>
                <div style="font-size: 12px; line-height: 1.4;">
                  ${article.summary}
                </div>
              </div>
            `;
          });
          const list = container.querySelector('#news-list');
          if (list) list.innerHTML = html;
        } catch (e) {
          const list = container.querySelector('#news-list');
          if (list) list.innerHTML = '<div style="color: #d32f2f; text-align: center; margin-top: 20px;">Failed to load news feed.</div>';
        }
      };

      fetchNews();
    }
  },


};
