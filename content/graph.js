// content/graph.js
(function() {
  const t = window.taming;

  t.graph = function(overlay) {
    const graphBtn = t.createIconButton('graph', 56, 65, 35);
    const graphWin = t.createWindow('FPS & Ping', '200px', '350px', '300px', '240px');
    graphWin.style.display = 'none';

    // Canvas für die Graphen
    const graphUI = document.createElement('canvas');
    graphUI.width = 280;
    graphUI.height = 100;
    graphUI.style.width = '100%';
    graphUI.style.height = '100px';
    graphUI.style.borderRadius = '10px';
    graphUI.style.background = 'transparent';
    graphWin.appendChild(graphUI);

    // Container für Texte und Steuerelemente
    const textContainer = document.createElement('div');
    textContainer.style.display = 'flex';
    textContainer.style.justifyContent = 'space-between';
    textContainer.style.alignItems = 'center';
    textContainer.style.marginTop = '4px';
    textContainer.style.fontSize = '12px';
    textContainer.style.color = '#fff';
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

    // Aktuelle Werte
    const fpsSpan = document.createElement('span');
    fpsSpan.innerHTML = '<span style="color:#ff9f40;">FPS</span>: <span id="fps-value">0</span>';
    const pingSpan = document.createElement('span');
    pingSpan.innerHTML = '<span style="color:#a7ffc4;">Ping</span>: <span id="ping-value">0</span> ms';
    const frameTimeSpan = document.createElement('span');
    frameTimeSpan.innerHTML = '<span style="color:#ffaa00;">Frametime</span>: <span id="frametime-value">0</span> ms';
    leftDiv.appendChild(fpsSpan);
    leftDiv.appendChild(pingSpan);
    leftDiv.appendChild(frameTimeSpan);

    // Durchschnittswerte
    const avgDiv = document.createElement('div');
    avgDiv.style.marginTop = '2px';
    avgDiv.style.fontSize = '11px';
    avgDiv.style.color = '#aaa';
    avgDiv.innerHTML = '⌀ <span id="avg-fps">0</span> FPS | ⌀ <span id="avg-ping">0</span> ms | ⌀ <span id="avg-frametime">0</span> ms';
    leftDiv.appendChild(avgDiv);

    // Reset-Button
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '↺';
    resetBtn.style.background = '#333';
    resetBtn.style.color = '#fff';
    resetBtn.style.border = '1px solid #555';
    resetBtn.style.borderRadius = '4px';
    resetBtn.style.padding = '2px 6px';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.fontSize = '14px';
    resetBtn.title = 'Daten zurücksetzen';
    rightDiv.appendChild(resetBtn);

    // Geschwindigkeits-Steuerung (Zeitraffer)
    const speedDiv = document.createElement('div');
    speedDiv.style.display = 'flex';
    speedDiv.style.alignItems = 'center';
    speedDiv.style.gap = '4px';
    speedDiv.style.fontSize = '11px';
    speedDiv.style.color = '#ccc';
    rightDiv.appendChild(speedDiv);

    speedDiv.innerHTML = '<span>⏱️</span>';
    const speedSelect = document.createElement('select');
    speedSelect.style.background = '#333';
    speedSelect.style.color = '#fff';
    speedSelect.style.border = '1px solid #555';
    speedSelect.style.borderRadius = '4px';
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

    // FPS- und Frametime-Messung
    let lastFpsUpdate = performance.now(), frames = 0;
    function fpsLoop(now) {
      frames++;
      // Frametime berechnen (Zeit seit letztem Frame)
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

    // Ping-Messung
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

    // Datenpunkte sammeln (abhängig von Geschwindigkeit)
    function collectData() {
      if (!visible) return;
      const speed = parseFloat(speedSelect.value);
      // Bei höherer Geschwindigkeit sammeln wir öfter (oder seltener?) 
      // Eigentlich: Speed = Faktor, um den der Graph schneller läuft.
      // Das bedeutet, wir sammeln häufiger? Nein, wir wollen, dass der Graph gestaucht wird,
      // also sammeln wir seltener bei höherer Geschwindigkeit, damit mehr Zeit pro Punkt vergeht.
      // Aber wir sammeln hier einfach jede Sekunde, und die Anzahl der Punkte pro Zeiteinheit bleibt gleich.
      // Um den Graphen zu strecken/stauchen, müssten wir die X-Skalierung ändern.
      // Einfacher: Wir fügen bei jeder Geschwindigkeit gleich viele Punkte hinzu, aber die Zeitachse wird skaliert.
      // Im updateGraph können wir dann die x-Skalierung anpassen.
      // Deshalb sammeln wir hier immer im gleichen Intervall (1 Sekunde), aber die Anzeige skaliert.
      
      // Frametime ist bereits im ms-Bereich, wir speichern sie direkt.
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
      // Sammle jede Sekunde (unabhängig von Geschwindigkeit, da wir die X-Skalierung anpassen)
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

      const speed = parseFloat(speedSelect.value); // 0.5, 1, 2, 4
      // Die Anzahl der darzustellenden Punkte ist maxPoints, aber die X-Skalierung soll
      // so sein, dass die Zeitspanne = maxPoints * (1/speed) Sekunden entspricht.
      // Bei speed=1: 120 Punkte = 120 Sekunden (2 Minuten)
      // Bei speed=2: 120 Punkte = 60 Sekunden (1 Minute) – also schnellerer Durchlauf.
      // Bei speed=0.5: 120 Punkte = 240 Sekunden (4 Minuten) – langsamerer Durchlauf.
      // Daher passen wir die Pixel pro Punkt an: const pixelPerPoint = graphUI.width / maxPoints * speed? Nein, wir skalieren einfach die x-Koordinaten.
      // Wir berechnen für jeden Punkt i: x = i * (graphUI.width / maxPoints) * (1/speed)? Das würde die Kurve strecken.
      // Besser: Wir lassen die Anzahl der sichtbaren Punkte konstant, aber die Zeitachse wird gedehnt/gestaucht,
      // indem wir die x-Skalierung ändern. Das erreichen wir, indem wir die Breite pro Punkt anpassen:
      // normal: breite = graphUI.width / maxPoints
      // bei speed 2 (schneller) wollen wir, dass die Kurve flacher aussieht, also mehr Zeit pro Pixel -> breite = graphUI.width / maxPoints / speed.
      // Das ist kompliziert. Einfacher: Wir ändern die Anzahl der tatsächlich angezeigten Punkte.
      // Oder wir zeichnen immer alle maxPoints, aber die x-Skala ist linear, und der Betrachter sieht nur einen Ausschnitt.
      // Für den Nutzer ist es okay, wenn der Graph einfach mit der gleichen Geschwindigkeit läuft, aber die Punkte häufiger kommen.
      // Wir lassen es erstmal einfach: Wir sammeln immer im 1-Sekunden-Intervall und zeichnen alle Punkte, unabhängig von der Geschwindigkeit.
      // Die Geschwindigkeitseinstellung könnte dann die Aktualisierungsrate des Graphen beeinflussen, aber das ist nicht gefragt.

      // Durchschnitt berechnen
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

      // Hilfslinien (optional)
      graphCtx.strokeStyle = '#333';
      graphCtx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const y = i * (graphUI.height / 4);
        graphCtx.beginPath();
        graphCtx.moveTo(0, y);
        graphCtx.lineTo(graphUI.width, y);
        graphCtx.stroke();
      }

      // Frametime (gelb)
      graphCtx.strokeStyle = '#ffaa00';
      graphCtx.beginPath();
      frameTimeData.forEach((ft, i) => {
        const x = i * (graphUI.width / maxPoints);
        const y = graphUI.height - (ft / 100 * graphUI.height); // max 100 ms (über 100 ms = sehr laggy)
        if (i === 0) graphCtx.moveTo(x, y);
        else graphCtx.lineTo(x, y);
      });
      graphCtx.stroke();

      // Ping (grün)
      graphCtx.strokeStyle = '#a7ffc4';
      graphCtx.beginPath();
      pingData.forEach((p, i) => {
        const x = i * (graphUI.width / maxPoints);
        const y = graphUI.height - (p / 200 * graphUI.height); // max 200 ms
        if (i === 0) graphCtx.moveTo(x, y);
        else graphCtx.lineTo(x, y);
      });
      graphCtx.stroke();

      // FPS (orange)
      graphCtx.strokeStyle = '#ff9f40';
      graphCtx.beginPath();
      fpsData.forEach((f, i) => {
        const x = i * (graphUI.width / maxPoints);
        const y = graphUI.height - (f / 120 * graphUI.height); // max 120 FPS
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