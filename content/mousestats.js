
(function() {
  const t = window.taming;

  t.mouseStats = function(overlay) {
    
    
    
    let statsBtn;
    try {
      statsBtn = t.createIconButton('stats', 56, 65, 35);
    } catch (e) {
      statsBtn = t.createButton('Stats');
      statsBtn.style.width = '56px';
      statsBtn.style.height = '65px';
      statsBtn.style.fontSize = '11px';
      statsBtn.style.lineHeight = '16px';
      statsBtn.style.padding = '0';
      statsBtn.style.display = 'flex';
      statsBtn.style.alignItems = 'center';
      statsBtn.style.justifyContent = 'center';
    }

    const statsWin = t.createWindow('Maus-Statistiken', '400px', '250px', '400px', '300px');
    statsWin.style.display = 'none';

    statsBtn.onclick = () => {
      statsWin.style.display = statsWin.style.display === 'none' ? 'block' : 'none';
    };

    
    
    
    
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 120;
    canvas.style.width = '100%';
    canvas.style.height = '120px';
    canvas.style.borderRadius = '8px';
    canvas.style.background = 'rgba(10, 12, 18, 0.4)';
    statsWin.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    
    const statsDiv = document.createElement('div');
    statsDiv.style.padding = '8px';
    statsDiv.style.fontSize = '14px';
    statsDiv.style.display = 'flex';
    statsDiv.style.justifyContent = 'space-around';
    statsWin.appendChild(statsDiv);

    const avgCpsSpan = document.createElement('span');
    avgCpsSpan.textContent = 'Avg CPS: 0.00';
    statsDiv.appendChild(avgCpsSpan);

    const currentCpsSpan = document.createElement('span');
    currentCpsSpan.textContent = 'CPS: 0.00';
    statsDiv.appendChild(currentCpsSpan);

    const speedSpan = document.createElement('span');
    speedSpan.textContent = 'Geschw: 0 px/s';
    statsDiv.appendChild(speedSpan);

    
    const controlDiv = document.createElement('div');
    controlDiv.style.display = 'flex';
    controlDiv.style.gap = '4px';
    controlDiv.style.padding = '4px';
    statsWin.appendChild(controlDiv);

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Starten';
    toggleBtn.style.flex = '1';
    toggleBtn.style.background = 'rgba(255,255,255,0.12)';
    toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
    toggleBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    toggleBtn.style.borderRadius = '8px';
    toggleBtn.style.padding = '4px';
    toggleBtn.style.cursor = 'pointer';
    controlDiv.appendChild(toggleBtn);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Zurücksetzen';
    resetBtn.style.flex = '1';
    resetBtn.style.background = 'rgba(255,255,255,0.08)';
    resetBtn.style.color = 'var(--qt-text, #eaf1ff)';
    resetBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    resetBtn.style.borderRadius = '8px';
    resetBtn.style.padding = '4px';
    resetBtn.style.cursor = 'pointer';
    controlDiv.appendChild(resetBtn);

    
    
    
    let active = false;
    let cpsData = [];            
    let speedData = [];           
    let clickCount = 0;
    let lastClickTime = performance.now();
    let lastMousePos = { x: 0, y: 0 };
    let lastMouseTime = performance.now();
    let totalClicks = 0;
    let totalSeconds = 0;

    
    function onMouseDown(e) {
      clickCount++;
      totalClicks++;
      const now = performance.now();
      const dt = now - lastClickTime;
      if (dt < 2000) totalSeconds += dt / 1000; 
      lastClickTime = now;
    }

    function onMouseMove(e) {
      const now = performance.now();
      const dt = now - lastMouseTime;
      if (dt < 10) return; 
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const speed = dist / dt * 1000; 
      speedData.push(speed);
      if (speedData.length > 60) speedData.shift();

      lastMousePos.x = e.clientX;
      lastMousePos.y = e.clientY;
      lastMouseTime = now;
    }

    function addListeners() {
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
    }
    function removeListeners() {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
    }

    
    let interval = null;
    function startInterval() {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        if (!active) return;
        
        const cps = clickCount;
        cpsData.push(cps);
        if (cpsData.length > 60) cpsData.shift();
        clickCount = 0;
      }, 1000);
    }
    function stopInterval() {
      if (interval) clearInterval(interval);
      interval = null;
    }

    
    function resetData() {
      cpsData = [];
      speedData = [];
      clickCount = 0;
      totalClicks = 0;
      totalSeconds = 0;
      lastClickTime = performance.now();
      lastMouseTime = performance.now();
      lastMousePos = { x: 0, y: 0 };
    }

    
    
    
    function draw() {
      if (!active) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const styles = getComputedStyle(statsWin);
      const accent = (styles.getPropertyValue('--qt-accent') || '#b78bff').trim();
      const secondary = (styles.getPropertyValue('--qt-accent-soft') || 'rgba(120, 255, 190, 0.25)').trim();

      
      ctx.strokeStyle = accent;
      ctx.beginPath();
      for (let i = 0; i < cpsData.length; i++) {
        const x = i * (canvas.width / 60);
        const y = canvas.height - (cpsData[i] / 20 * canvas.height); 
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      
      ctx.strokeStyle = secondary || accent;
      ctx.beginPath();
      for (let i = 0; i < speedData.length; i++) {
        const x = i * (canvas.width / 60);
        const y = canvas.height - (speedData[i] / 2000 * canvas.height); 
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      
      const currentCps = cpsData.length ? cpsData[cpsData.length-1] : 0;
      const avgCps = totalSeconds > 0 ? (totalClicks / totalSeconds).toFixed(2) : '0.00';
      const currentSpeed = speedData.length ? Math.round(speedData[speedData.length-1]) : 0;

      currentCpsSpan.textContent = `CPS: ${currentCps.toFixed(2)}`;
      avgCpsSpan.textContent = `Avg CPS: ${avgCps}`;
      speedSpan.textContent = `Geschw: ${currentSpeed} px/s`;

      requestAnimationFrame(draw);
    }
    draw();

    
    
    
    toggleBtn.onclick = () => {
      active = !active;
      if (active) {
        toggleBtn.textContent = 'Stoppen';
        toggleBtn.style.background = 'var(--qt-accent, #b78bff)';
        toggleBtn.style.color = '#111';
        addListeners();
        startInterval();
        
        lastMousePos.x = 0;
        lastMousePos.y = 0;
        lastMouseTime = performance.now();
      } else {
        toggleBtn.textContent = 'Starten';
        toggleBtn.style.background = 'rgba(255,255,255,0.12)';
        toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
        removeListeners();
        stopInterval();
      }
    };

    resetBtn.onclick = () => {
      resetData();
    };

    
    
    
    window.addEventListener('beforeunload', () => {
      removeListeners();
      stopInterval();
    });

    return statsBtn;
  };
})();
