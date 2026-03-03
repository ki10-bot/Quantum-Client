// content/mousestats.js
(function() {
  const t = window.taming;

  t.mouseStats = function(overlay) {
    // ------------------------------------------------------------
    // 1. Button mit Fallback
    // ------------------------------------------------------------
    let statsBtn;
    try {
      statsBtn = t.createIconButton('stats', 56, 65, 35);
    } catch (e) {
      statsBtn = t.createButton('📊');
      statsBtn.style.width = '56px';
      statsBtn.style.height = '65px';
      statsBtn.style.fontSize = '24px';
      statsBtn.style.lineHeight = '65px';
      statsBtn.style.padding = '0';
    }

    const statsWin = t.createWindow('Maus-Statistiken', '400px', '250px', '400px', '300px');
    statsWin.style.display = 'none';

    statsBtn.onclick = () => {
      statsWin.style.display = statsWin.style.display === 'none' ? 'block' : 'none';
    };

    // ------------------------------------------------------------
    // 2. UI-Elemente
    // ------------------------------------------------------------
    // Canvas für die Graphen
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 120;
    canvas.style.width = '100%';
    canvas.style.height = '120px';
    canvas.style.borderRadius = '8px';
    canvas.style.background = 'rgba(0,0,0,0.3)';
    statsWin.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Statistik-Text
    const statsDiv = document.createElement('div');
    statsDiv.style.padding = '8px';
    statsDiv.style.fontSize = '14px';
    statsDiv.style.display = 'flex';
    statsDiv.style.justifyContent = 'space-around';
    statsWin.appendChild(statsDiv);

    const avgCpsSpan = document.createElement('span');
    avgCpsSpan.textContent = '⌀ CPS: 0.00';
    statsDiv.appendChild(avgCpsSpan);

    const currentCpsSpan = document.createElement('span');
    currentCpsSpan.textContent = 'CPS: 0.00';
    statsDiv.appendChild(currentCpsSpan);

    const speedSpan = document.createElement('span');
    speedSpan.textContent = 'Geschw: 0 px/s';
    statsDiv.appendChild(speedSpan);

    // Steuerung
    const controlDiv = document.createElement('div');
    controlDiv.style.display = 'flex';
    controlDiv.style.gap = '4px';
    controlDiv.style.padding = '4px';
    statsWin.appendChild(controlDiv);

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Starten';
    toggleBtn.style.flex = '1';
    toggleBtn.style.background = '#4a6';
    toggleBtn.style.color = '#fff';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '4px';
    toggleBtn.style.padding = '4px';
    toggleBtn.style.cursor = 'pointer';
    controlDiv.appendChild(toggleBtn);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Zurücksetzen';
    resetBtn.style.flex = '1';
    resetBtn.style.background = '#a44';
    resetBtn.style.color = '#fff';
    resetBtn.style.border = 'none';
    resetBtn.style.borderRadius = '4px';
    resetBtn.style.padding = '4px';
    resetBtn.style.cursor = 'pointer';
    controlDiv.appendChild(resetBtn);

    // ------------------------------------------------------------
    // 3. Daten und Zustand
    // ------------------------------------------------------------
    let active = false;
    let cpsData = [];            // letzte 60 CPS-Werte
    let speedData = [];           // letzte 60 Geschwindigkeitswerte
    let clickCount = 0;
    let lastClickTime = performance.now();
    let lastMousePos = { x: 0, y: 0 };
    let lastMouseTime = performance.now();
    let totalClicks = 0;
    let totalSeconds = 0;

    // Listener
    function onMouseDown(e) {
      clickCount++;
      totalClicks++;
      const now = performance.now();
      const dt = now - lastClickTime;
      if (dt < 2000) totalSeconds += dt / 1000; // nur wenn sinnvoll
      lastClickTime = now;
    }

    function onMouseMove(e) {
      const now = performance.now();
      const dt = now - lastMouseTime;
      if (dt < 10) return; // zu schnell – ignorieren
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const speed = dist / dt * 1000; // Pixel pro Sekunde
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

    // CPS-Zähler (jede Sekunde)
    let interval = null;
    function startInterval() {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        if (!active) return;
        // CPS der letzten Sekunde
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

    // Reset
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

    // ------------------------------------------------------------
    // 4. Zeichen-Funktion
    // ------------------------------------------------------------
    function draw() {
      if (!active) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // CPS-Graph (grün)
      ctx.strokeStyle = '#a7ffc4';
      ctx.beginPath();
      for (let i = 0; i < cpsData.length; i++) {
        const x = i * (canvas.width / 60);
        const y = canvas.height - (cpsData[i] / 20 * canvas.height); // max 20 CPS
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Speed-Graph (orange)
      ctx.strokeStyle = '#ff9f40';
      ctx.beginPath();
      for (let i = 0; i < speedData.length; i++) {
        const x = i * (canvas.width / 60);
        const y = canvas.height - (speedData[i] / 2000 * canvas.height); // max 2000 px/s
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Aktuelle Werte anzeigen
      const currentCps = cpsData.length ? cpsData[cpsData.length-1] : 0;
      const avgCps = totalSeconds > 0 ? (totalClicks / totalSeconds).toFixed(2) : '0.00';
      const currentSpeed = speedData.length ? Math.round(speedData[speedData.length-1]) : 0;

      currentCpsSpan.textContent = `CPS: ${currentCps.toFixed(2)}`;
      avgCpsSpan.textContent = `⌀ CPS: ${avgCps}`;
      speedSpan.textContent = `Geschw: ${currentSpeed} px/s`;

      requestAnimationFrame(draw);
    }
    draw();

    // ------------------------------------------------------------
    // 5. Steuerung
    // ------------------------------------------------------------
    toggleBtn.onclick = () => {
      active = !active;
      if (active) {
        toggleBtn.textContent = 'Stoppen';
        toggleBtn.style.background = '#a44';
        addListeners();
        startInterval();
        // Initialwerte
        lastMousePos.x = 0;
        lastMousePos.y = 0;
        lastMouseTime = performance.now();
      } else {
        toggleBtn.textContent = 'Starten';
        toggleBtn.style.background = '#4a6';
        removeListeners();
        stopInterval();
      }
    };

    resetBtn.onclick = () => {
      resetData();
    };

    // ------------------------------------------------------------
    // 6. Aufräumen
    // ------------------------------------------------------------
    window.addEventListener('beforeunload', () => {
      removeListeners();
      stopInterval();
    });

    return statsBtn;
  };
})();