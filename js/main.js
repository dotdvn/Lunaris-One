document.addEventListener('DOMContentLoaded', () => {
  State.init();
  const bootScreen = document.getElementById('boot-screen');
  const bootProgressBar = document.getElementById('boot-progress-bar');
  const bootStatusText = document.getElementById('boot-status-text');
  
  const lockScreen = document.getElementById('lock-screen');
  const lockTime = document.getElementById('lock-time');
  const lockDate = document.getElementById('lock-date');
  const btnLogin = document.getElementById('btn-login');
  
  const desktop = document.getElementById('desktop');
  const runBootSequence = () => {
    Utils.playSound('boot');
    
    let progress = 0;
    const stages = [
      { p: 10, msg: 'Loading kernel...' },
      { p: 40, msg: 'Mounting filesystem...' },
      { p: 70, msg: 'Starting desktop services...' },
      { p: 90, msg: 'Preparing user session...' },
      { p: 100, msg: 'Welcome.' }
    ];
    
    let currentStage = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 5;
      if (progress > 100) progress = 100;
      
      bootProgressBar.style.width = `${progress}%`;
      
      if (currentStage < stages.length && progress >= stages[currentStage].p) {
        bootStatusText.textContent = stages[currentStage].msg;
        currentStage++;
      }
      
      if (progress === 100) {
        clearInterval(interval);
        setTimeout(() => showLockScreen(), 800);
      }
    }, 150);
  };
  
  const showLockScreen = () => {
    bootScreen.style.opacity = '0';
    lockScreen.classList.remove('hidden');
    
    setTimeout(() => {
      bootScreen.classList.add('hidden');
    }, 1000);
    
    updateLockTime();
    setInterval(updateLockTime, 1000);
  };
  
  const updateLockTime = () => {
    const now = new Date();
    lockTime.textContent = Utils.formatTime(now);
    lockDate.textContent = Utils.formatDate(now);
  };
  
  const login = () => {
    Utils.playSound('click');
    lockScreen.classList.add('fade-up');
    
    setTimeout(() => {
      lockScreen.classList.add('hidden');
      desktop.classList.remove('hidden');
      Desktop.init();
      Taskbar.init();
      setTimeout(() => {
        State.addNotification('System Ready', 'Welcome to Lunaris XP. All systems nominal.', 'ph-rocket-launch');
      }, 1000);
      
    }, 800);
  };
  
  btnLogin.addEventListener('click', login);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Meta' && !desktop.classList.contains('hidden')) {
      Desktop.toggleLauncher();
    }
    if (e.key === 'Escape') {
      Desktop.closeAllPanels();
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'e') { e.preventDefault(); window.WM.createWindow(APPS.find(a=>a.id==='files')); }
      if (e.key === 'n') { e.preventDefault(); window.WM.createWindow(APPS.find(a=>a.id==='notes')); }
      if (e.key === 'b') { e.preventDefault(); window.WM.createWindow(APPS.find(a=>a.id==='browser')); }
      if (e.key === 't') { e.preventDefault(); window.WM.createWindow(APPS.find(a=>a.id==='terminal')); }
    }
  });
  bootScreen.classList.add('hidden');
  showLockScreen();
});
