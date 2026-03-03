// content/markers.js
(function() {
  const t = window.taming;

  t.markers = function(overlay) {
    // ------------------------------------------------------------
    // 1. Button mit Fallback
    // ------------------------------------------------------------
    let markerBtn;
    try {
      markerBtn = t.createIconButton('marker', 56, 65, 35);
    } catch (e) {
      markerBtn = t.createButton('📍');
      markerBtn.style.width = '56px';
      markerBtn.style.height = '65px';
      markerBtn.style.fontSize = '24px';
      markerBtn.style.lineHeight = '65px';
      markerBtn.style.padding = '0';
    }

    const markerWin = t.createWindow('Screen-Marker', '400px', '250px', '300px', '300px');
    markerWin.style.display = 'none';

    markerBtn.onclick = () => {
      markerWin.style.display = markerWin.style.display === 'none' ? 'block' : 'none';
    };

    // ------------------------------------------------------------
    // 2. UI-Elemente
    // ------------------------------------------------------------
    const container = document.createElement('div');
    container.style.padding = '4px';
    markerWin.appendChild(container);

    const statusDiv = document.createElement('div');
    statusDiv.style.margin = '4px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Marker: 0';
    container.appendChild(statusDiv);

    const instructions = document.createElement('div');
    instructions.style.margin = '4px';
    instructions.style.fontSize = '12px';
    instructions.style.color = '#aaa';
    instructions.innerHTML = 'Taste zum Setzen: <span id="marker-key">F</span>';
    container.appendChild(instructions);

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.placeholder = 'Taste drücken...';
    keyInput.readOnly = true;
    keyInput.style.width = '100%';
    keyInput.style.margin = '4px 0';
    keyInput.style.background = '#333';
    keyInput.style.color = '#fff';
    keyInput.style.border = '1px solid #555';
    keyInput.style.padding = '4px';
    container.appendChild(keyInput);

    // Aktuelle Taste
    let markerKey = 'KeyF';
    keyInput.value = 'F';

    keyInput.addEventListener('click', () => {
      keyInput.value = 'Drücke Taste...';
      const handler = (e) => {
        e.preventDefault();
        markerKey = e.code;
        keyInput.value = e.code.replace('Key', '').replace('Digit', '');
        document.removeEventListener('keydown', handler);
      };
      document.addEventListener('keydown', handler);
    });

    // Lösch-Button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Alle Marker löschen';
    clearBtn.style.width = '100%';
    clearBtn.style.margin = '4px 0';
    clearBtn.style.padding = '4px';
    clearBtn.style.background = '#a44';
    clearBtn.style.color = '#fff';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '4px';
    clearBtn.style.cursor = 'pointer';
    container.appendChild(clearBtn);

    // Liste der Marker (einfach)
    const listDiv = document.createElement('div');
    listDiv.style.maxHeight = '120px';
    listDiv.style.overflowY = 'auto';
    listDiv.style.fontSize = '12px';
    listDiv.style.marginTop = '4px';
    listDiv.style.background = 'rgba(0,0,0,0.3)';
    listDiv.style.padding = '2px';
    container.appendChild(listDiv);

    // ------------------------------------------------------------
    // 3. Marker-Daten und Overlay
    // ------------------------------------------------------------
    let markers = []; // { x, y, label, color }

    // Canvas für die Anzeige
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10000000';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Marker setzen (an aktueller Mausposition)
    function addMarker() {
      const x = t.lastMouseX;
      const y = t.lastMouseY;
      if (x === 0 && y === 0) return;
      const label = `#${markers.length + 1}`;
      markers.push({
        x, y,
        label: label,
        color: '#ffaa00'
      });
      updateList();
    }

    // Marker löschen (per Klick auf Liste)
    function removeMarker(index) {
      markers.splice(index, 1);
      updateList();
    }

    // Liste aktualisieren
    function updateList() {
      statusDiv.innerHTML = `Marker: ${markers.length}`;
      listDiv.innerHTML = markers.map((m, i) => {
        return `<div style="display:flex; justify-content:space-between; align-items:center; padding:2px; border-bottom:1px solid #333;">
          <span>${m.label}: (${Math.round(m.x)}, ${Math.round(m.y)})</span>
          <button style="background:#a44; border:none; color:#fff; border-radius:4px; cursor:pointer; padding:2px 6px;" data-index="${i}">✕</button>
        </div>`;
      }).join('');
      // Event-Listener für Lösch-Buttons
      listDiv.querySelectorAll('button[data-index]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          removeMarker(index);
        });
      });
    }

    // Key-Listener für Marker setzen
    function onKeyDown(e) {
      if (e.code === markerKey) {
        addMarker();
      }
    }

    // Aktivierung/Deaktivierung
    let active = false;
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Aktivieren';
    toggleBtn.style.width = '100%';
    toggleBtn.style.margin = '4px 0';
    toggleBtn.style.padding = '4px';
    toggleBtn.style.background = '#4a6';
    toggleBtn.style.color = '#fff';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '4px';
    toggleBtn.style.cursor = 'pointer';
    container.appendChild(toggleBtn);

    toggleBtn.onclick = () => {
      active = !active;
      if (active) {
        document.addEventListener('keydown', onKeyDown);
        toggleBtn.textContent = 'Deaktivieren';
        toggleBtn.style.background = '#a44';
      } else {
        document.removeEventListener('keydown', onKeyDown);
        toggleBtn.textContent = 'Aktivieren';
        toggleBtn.style.background = '#4a6';
      }
    };

    clearBtn.onclick = () => {
      markers = [];
      updateList();
    };

    // ------------------------------------------------------------
    // 4. Zeichen-Funktion
    // ------------------------------------------------------------
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      markers.forEach(m => {
        // Kreis zeichnen
        ctx.beginPath();
        ctx.arc(m.x, m.y, 10, 0, 2 * Math.PI);
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = m.color + '33'; // 20% Opazität
        ctx.fill();

        // Label
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.label, m.x, m.y - 15);

        // Entfernung zur Maus (optional)
        const dx = t.lastMouseX - m.x;
        const dy = t.lastMouseY - m.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#ccc';
        ctx.fillText(Math.round(dist) + 'px', m.x + 15, m.y - 5);
      });
      requestAnimationFrame(draw);
    }
    draw();

    // ------------------------------------------------------------
    // 5. Aufräumen
    // ------------------------------------------------------------
    window.addEventListener('beforeunload', () => {
      document.removeEventListener('keydown', onKeyDown);
      canvas.remove();
    });

    return markerBtn;
  };
})();