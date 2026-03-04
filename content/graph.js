// content/graph.js
(function() {
  const t = window.taming;

  t.graph = function(overlay) {
    const graphBtn = t.createIconButton('graph', 56, 65, 35);
    const graphWin = t.createWindow('FPS & Ping', '200px', '350px', '300px', '240px');
    graphWin.style.display = 'none';


    const graphUI = document.createElement('canvas');
    graphUI.width = 280;
    graphUI.height = 100;
    graphUI.style.width = '100%';
    graphUI.style.height = '100px';
    graphUI.style.borderRadius = '10px';
    graphUI.style.background = 'transparent';
    graphWin.appendChild(graphUI);

    const textContainer = document.createElement('div');
    textContainer.style.display = 'flex';
    textContainer.style.justifyContent = 'space-between';
    textContainer.style.alignItems = 'center';
    textContainer.style.marginTop = '4px';
    textContainer.style.fontSize = '12px';
    textContainer.style.color = 'var(--qt-text, #eaf1ff)';
    graphWin.appendChild(textContainer);

    const leftDiv = document.createElement('div');
    leftDiv.style.display = 'flex';
    leftDiv.style.flexDirection = 'column';
    leftDiv.style.gap = '2px';
    textContainer.appendChild(leftDiv);

    const rightDiv = document.createElement('div');
    rightDiv.style.display = 'flex';
    rightDiv.style.flexDirection = 'column';
    rightDiv.style.alignItems = 'flex-end';
    rightDiv.style.gap = '4px';
    textContainer.appendChild(rightDiv);

  
    const fpsSpan = document.createElement('span');
    fpsSpan.innerHTML = 'FPS: <span id="fps-value">0</span>';
    const pingSpan = document.createElement('span');
    pingSpan.innerHTML = 'Ping: <span id="ping-value">0</span> ms';
    const frameTimeSpan = document.createElement('span');
    frameTimeSpan.innerHTML = 'Frametime: <span id="frametime-value">0</span> ms';
    leftDiv.appendChild(fpsSpan);
    leftDiv.appendChild(pingSpan);
    leftDiv.appendChild(frameTimeSpan);

    const avgDiv = document.createElement('div');
    avgDiv.style.marginTop = '2px';
    avgDiv.style.fontSize = '11px';
    avgDiv.style.color = 'var(--qt-text, #eaf1ff)';
    avgDiv.style.opacity = '0.65';
    avgDiv.innerHTML = 'Avg <span id="avg-fps">0</span> FPS | Avg <span id="avg-ping">0</span> ms | Avg <span id="avg-frametime">0</span> ms';
    leftDiv.appendChild(avgDiv);

    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.style.padding = '4px 8px';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.fontSize = '11px';
    resetBtn.title = 'Daten zurücksetzen';
    rightDiv.appendChild(resetBtn);

    
    const speedDiv = document.createElement('div');
    speedDiv.style.display = 'flex';
    speedDiv.style.alignItems = 'center';
    speedDiv.style.gap = '4px';
    speedDiv.style.fontSize = '11px';
    speedDiv.style.color = 'var(--qt-text, #eaf1ff)';
    speedDiv.style.opacity = '0.7';
    rightDiv.appendChild(speedDiv);

    const speedLabel = document.createElement('span');
    speedLabel.textContent = 'Speed';
    speedDiv.appendChild(speedLabel);
    const speedSelect = document.createElement('select');
    speedSelect.style.padding = '2px';
    speedSelect.style.fontSize = '11px';
    speedDiv.appendChild(speedSelect);

    const speeds = [
      { value: 0.5, label: '0.5x (langsam)' },
      { value: 1, label: '1x (normal)' },
      { value: 2, label: '2x (schnell)' },
      { value: 4, label: '4x (Zeitraffer)' }
    ];
    speeds.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.value;
      opt.textContent = s.label;
      speedSelect.appendChild(opt);
    });
    speedSelect.value = 1; // Standard

    const graphCtx = graphUI.getContext('2d');
    const pingData = [], fpsData = [], frameTimeData = [];
    const maxPoints = 120; // genug für 2 Minuten bei normaler Geschwindigkeit
    let fpsValue = 0, pingValue = 0, frameTimeValue = 0;
    let visible = false;
    let pingInterval = null;
    let dataInterval = null;
    let lastFrameTime = performance.now();

    
    let lastFpsUpdate = performance.now(), frames = 0;
    function fpsLoop(now) {
      frames++;
      
      frameTimeValue = Math.round(now - lastFrameTime);
      lastFrameTime = now;

      if (now >= lastFpsUpdate + 1000) {
        fpsValue = frames;
        frames = 0;
        lastFpsUpdate = now;
      }
      requestAnimationFrame(fpsLoop);
    }
    requestAnimationFrame(fpsLoop);

    
    async function measurePing() {
      if (!visible) return;
      try {
        const start = performance.now();
        await fetch('https://taming.io/', { method: 'HEAD', cache: 'no-store' });
        pingValue = Math.round(performance.now() - start);
      } catch (e) {
        pingValue = 0;
      }
    }

    function collectData() {
      if (!visible) return;
      const speed = parseFloat(speedSelect.value);
      frameTimeData.push(frameTimeValue);
      pingData.push(pingValue);
      fpsData.push(fpsValue);
      if (frameTimeData.length > maxPoints) frameTimeData.shift();
      if (pingData.length > maxPoints) pingData.shift();
      if (fpsData.length > maxPoints) fpsData.shift();

      if (visible) updateGraph();
    }

    function startDataCollection() {
      if (dataInterval) clearInterval(dataInterval);
      
      dataInterval = setInterval(collectData, 1000);
      startPing();
    }

    function startPing() {
      if (pingInterval) clearInterval(pingInterval);
      pingInterval = setInterval(measurePing, 2000);
    }

    function stopAll() {
      if (dataInterval) clearInterval(dataInterval);
      if (pingInterval) clearInterval(pingInterval);
      dataInterval = null;
      pingInterval = null;
    }

    function resetData() {
      pingData.length = 0;
      fpsData.length = 0;
      frameTimeData.length = 0;
      updateGraph();
    }
    resetBtn.onclick = resetData;

    function updateGraph() {
      if (!visible) return;

      const speed = parseFloat(speedSelect.value); 
      

      const avgFps = (fpsData.reduce((a, b) => a + b, 0) / fpsData.length).toFixed(1);
      const avgPing = (pingData.reduce((a, b) => a + b, 0) / pingData.length).toFixed(0);
      const avgFrameTime = (frameTimeData.reduce((a, b) => a + b, 0) / frameTimeData.length).toFixed(1);

      document.getElementById('fps-value').textContent = fpsValue;
      document.getElementById('ping-value').textContent = pingValue;
      document.getElementById('frametime-value').textContent = frameTimeValue;
      document.getElementById('avg-fps').textContent = avgFps;
      document.getElementById('avg-ping').textContent = avgPing;
      document.getElementById('avg-frametime').textContent = avgFrameTime;

      graphCtx.clearRect(0, 0, graphUI.width, graphUI.height);

      const styles = getComputedStyle(graphWin);
      const accent = (styles.getPropertyValue('--qt-accent') || '#b78bff').trim();
      const accentSoftRaw = (styles.getPropertyValue('--qt-accent-soft') || 'rgba(120, 255, 190, 0.25)').trim();
      const textColor = (styles.getPropertyValue('--qt-text') || '#eaf1ff').trim();
      const pingColor = accentSoftRaw || accent;
      const frameColor = textColor;

      
      graphCtx.strokeStyle = 'rgba(255,255,255,0.08)';
      graphCtx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const y = i * (graphUI.height / 4);
        graphCtx.beginPath();
        graphCtx.moveTo(0, y);
        graphCtx.lineTo(graphUI.width, y);
        graphCtx.stroke();
      }

      
      graphCtx.strokeStyle = frameColor;
      graphCtx.beginPath();
      frameTimeData.forEach((ft, i) => {
        const x = i * (graphUI.width / maxPoints);
        const y = graphUI.height - (ft / 100 * graphUI.height); 
        if (i === 0) graphCtx.moveTo(x, y);
        else graphCtx.lineTo(x, y);
      });
      graphCtx.stroke();

      
      graphCtx.strokeStyle = pingColor;
      graphCtx.beginPath();
      pingData.forEach((p, i) => {
        const x = i * (graphUI.width / maxPoints);
        const y = graphUI.height - (p / 200 * graphUI.height); 
        if (i === 0) graphCtx.moveTo(x, y);
        else graphCtx.lineTo(x, y);
      });
      graphCtx.stroke();

      
      graphCtx.strokeStyle = accent;
      graphCtx.beginPath();
      fpsData.forEach((f, i) => {
        const x = i * (graphUI.width / maxPoints);
        const y = graphUI.height - (f / 120 * graphUI.height); 
        if (i === 0) graphCtx.moveTo(x, y);
        else graphCtx.lineTo(x, y);
      });
      graphCtx.stroke();
    }

    graphBtn.onclick = () => {
      const isVisible = graphWin.style.display !== 'none';
      if (isVisible) {
        graphWin.style.display = 'none';
        visible = false;
        stopAll();
      } else {
        graphWin.style.display = 'block';
        visible = true;
        startDataCollection();
        updateGraph();
      }
    };

    return graphBtn;
  };
})();
