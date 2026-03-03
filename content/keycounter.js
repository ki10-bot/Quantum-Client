// content/keycounter.js
(function() {
  const t = window.taming;

  t.keyCounter = function(overlay) {
    // ------------------------------------------------------------
    // 1. Button mit Fallback
    // ------------------------------------------------------------
    let keyBtn;
    try {
      keyBtn = t.createIconButton('keys', 56, 65, 35);
    } catch (e) {
      keyBtn = t.createButton('⌨️');
      keyBtn.style.width = '56px';
      keyBtn.style.height = '65px';
      keyBtn.style.fontSize = '24px';
      keyBtn.style.lineHeight = '65px';
      keyBtn.style.padding = '0';
    }

    const keyWin = t.createWindow('Tastatur-Statistik', '400px', '250px', '350px', '350px');
    keyWin.style.display = 'none';

    keyBtn.onclick = () => {
      if (keyWin.style.display === 'none') {
        keyWin.show();
      } else {
        keyWin.hide();
      }
    };

    // ------------------------------------------------------------
    // 2. UI-Elemente
    // ------------------------------------------------------------
    // Canvas für das Tortendiagramm
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '8px';
    canvas.style.background = 'rgba(0,0,0,0.3)';
    keyWin.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Liste der Top-5 (Text)
    const listDiv = document.createElement('div');
    listDiv.style.padding = '8px';
    listDiv.style.fontSize = '12px';
    listDiv.style.display = 'flex';
    listDiv.style.flexDirection = 'column';
    listDiv.style.gap = '2px';
    keyWin.appendChild(listDiv);

    // Steuerung
    const controlDiv = document.createElement('div');
    controlDiv.style.display = 'flex';
    controlDiv.style.gap = '4px';
    controlDiv.style.padding = '4px';
    keyWin.appendChild(controlDiv);

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
    resetBtn.textContent = 'Reset';
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
    let keyCounts = {}; // { "KeyW": 42, ... }

    // Listener
    function onKeyDown(e) {
      // Nur Tasten, die wir sinnvoll anzeigen können (keine Modifier allein)
      // Wir speichern den Code, z.B. "KeyW", "Space", "Digit1"
      const code = e.code;
      if (code.startsWith('Shift') || code.startsWith('Control') || code.startsWith('Alt') || code.startsWith('Meta')) {
        // Modifier-Tasten ignorieren? Oder doch zählen? Lassen wir erstmal zählen.
      }
      keyCounts[code] = (keyCounts[code] || 0) + 1;
    }

    function addListeners() {
      document.addEventListener('keydown', onKeyDown);
    }
    function removeListeners() {
      document.removeEventListener('keydown', onKeyDown);
    }

    // Reset
    function resetData() {
      keyCounts = {};
    }

    // ------------------------------------------------------------
    // 4. Zeichen-Funktion (Pie-Chart)
    // ------------------------------------------------------------
    function draw() {
      if (!active) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sortierte Top-5
      const entries = Object.entries(keyCounts);
      if (entries.length === 0) {
        ctx.fillStyle = '#888';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Keine Daten', canvas.width/2, canvas.height/2);
        listDiv.innerHTML = '';
        requestAnimationFrame(draw);
        return;
      }

      entries.sort((a, b) => b[1] - a[1]);
      const top5 = entries.slice(0, 5);
      const total = entries.reduce((sum, [, count]) => sum + count, 0);
      const otherCount = entries.slice(5).reduce((sum, [, count]) => sum + count, 0);
      if (otherCount > 0) top5.push(['Andere', otherCount]);

      // Farben (fest)
      const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'];

      // Tortendiagramm zeichnen
      let startAngle = 0;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;

      top5.forEach(([key, count], index) => {
        const sliceAngle = (count / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        // Umrandung
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Beschriftung (Prozent) in der Mitte des Sektors
        const midAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(midAngle) * radius * 0.7;
        const labelY = centerY + Math.sin(midAngle) * radius * 0.7;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(((count / total) * 100).toFixed(0) + '%', labelX, labelY);

        startAngle += sliceAngle;
      });

      // Liste der Top-5 mit Namen und Anzahl
      listDiv.innerHTML = top5.map(([key, count], i) => {
        const percent = ((count / total) * 100).toFixed(1);
        let displayName = key;
        // Vereinfachte Anzeige: "KeyW" -> "W", "Space" -> "Space", etc.
        if (key.startsWith('Key')) displayName = key.slice(3);
        else if (key.startsWith('Digit')) displayName = key.slice(5);
        else if (key === 'Space') displayName = '␣';
        else if (key === 'Enter') displayName = '↵';
        else if (key === 'ShiftLeft' || key === 'ShiftRight') displayName = '⇧';
        else if (key === 'ControlLeft' || key === 'ControlRight') displayName = 'Ctrl';
        else if (key === 'AltLeft' || key === 'AltRight') displayName = 'Alt';
        return `<div style="display:flex; justify-content:space-between;">
          <span>${displayName}</span>
          <span>${count} (${percent}%)</span>
        </div>`;
      }).join('');

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
      } else {
        toggleBtn.textContent = 'Starten';
        toggleBtn.style.background = '#4a6';
        removeListeners();
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
    });

    return keyBtn;
  };
})();