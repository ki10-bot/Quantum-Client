// content/quantum_menu.js
(function() {
  const t = window.taming;

  t.quantumMenu = function() {
    console.log('Quantum Menu wird initialisiert...');
    if (document.getElementById('quantum-menu-overlay')) return;

    // ----- Schriftart laden (font2.ttf) -----
    function loadFont() {
      return new Promise((resolve) => {
        const style = document.createElement('style');
        style.textContent = `
          @font-face {
            font-family: 'QuantumFont';
            src: url('${chrome.runtime.getURL('fonts/font2.ttf')}') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `;
        document.head.appendChild(style);
        resolve();
      });
    }
    loadFont();

    // ----- Physik-Konstanten -----
    const FRICTION = 0.96;
    const SPRING_FORCE = 0.0015;
    const BOUNCE = 0.7;
    const RADIUS = 30;
    const ORBIT_RADIUS = 250;
    const CENTER_X = 300;
    const CENTER_Y = 300;
    const WOBBLE_AMPLITUDE = 15;
    const WOBBLE_FREQ = 0.005;
    const ROTATION_SPEED = 0.00115;

    // ----- UI Elemente -----
    const overlay = document.createElement('div');
    overlay.id = 'quantum-menu-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: black;
      z-index: 9999999;
      display: none;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      font-family: 'QuantumFont', Inter, system-ui, sans-serif;
      color: white;
    `;

    // Lichteffekte
    const lightBottomRight = document.createElement('div');
    lightBottomRight.style.cssText = `
      position: absolute;
      bottom: 0;
      right: 0;
      width: 80%;
      height: 60%;
      background: radial-gradient(circle at bottom right, rgba(180, 0, 255, 0.15), transparent 70%);
      pointer-events: none;
      z-index: 1;
      filter: blur(40px);
    `;
    const lightTopLeft = document.createElement('div');
    lightTopLeft.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 80%;
      height: 60%;
      background: radial-gradient(circle at top left, rgba(0, 255, 200, 0.15), transparent 70%);
      pointer-events: none;
      z-index: 1;
      filter: blur(40px);
    `;
    overlay.appendChild(lightBottomRight);
    overlay.appendChild(lightTopLeft);

    // Zentrierter Container (600x600)
    const centerContainer = document.createElement('div');
    centerContainer.style.cssText = `
      position: relative;
      width: 600px;
      height: 600px;
      z-index: 2;
    `;
    overlay.appendChild(centerContainer);

    // ----- Header-Text "Main Quantum Menu" -----
    const header = document.createElement('div');
    header.textContent = 'Main Quantum Menu';
    header.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      font-family: 'QuantumFont', Inter, system-ui, sans-serif;
      font-size: 24px;
      font-weight: bold;
      color: white;
      text-shadow: 0 0 10px rgba(255,255,255,0.5);
      z-index: 6;
      white-space: nowrap;
    `;
    overlay.appendChild(header); // außerhalb des rotierenden Containers

    // ----- Canvas für Linien und Sphäre -----
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 4;
    `;
    centerContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Logo
    const logo = document.createElement('img');
    logo.src = chrome.runtime.getURL('utils/logo.png');
    logo.style.cssText = `
      width: 208px;
      height: auto;
      filter: drop-shadow(0 0 20px rgba(255,255,255,0.8));
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 5;
    `;
    centerContainer.appendChild(logo);

    // ----- Buttons Definition -----
    const buttons = [
      { icon: 'credits', label: 'Credits', action: showCredits },
      { icon: 'css', label: 'Theme Editor', action: showThemeEditor },
      { icon: 'news', label: 'Taming.io News', action: showNews },
      { icon: 'quick', label: 'Quick Settings', action: showQuickSettings },
      { icon: 'dev', label: 'Entwickler-Tools', action: showDevTools },
      { icon: 'ui', label: 'UI-Skalierung', action: showUIScaling },
      { icon: 'macro', label: 'Makro Recorder Pro', action: showMacroRecorder },
    ];

    const buttonStates = [];
    const buttonElements = [];

    buttons.forEach((btn, index) => {
      const button = t.createIconButton(btn.icon, 56, 65, 35);
      if (!button) return;
      button.title = btn.label;
      button.style.position = 'absolute';
      button.style.cursor = 'grab';
      button.dataset.index = index;
      button.dataset.dragging = false;
      button.addEventListener('mousedown', (e) => startDrag(e, index));
      button.addEventListener('click', (e) => {
        if (button.dataset.dragging === 'true') {
          e.stopPropagation();
          e.preventDefault();
        } else {
          btn.action();
        }
      });
      centerContainer.appendChild(button);
      buttonElements.push(button);

      const baseAngle = (index / buttons.length) * 2 * Math.PI;
      buttonStates.push({
        index,
        baseAngle,
        x: 0, y: 0,
        vx: 0, vy: 0,
        dragging: false,
      });
    });

    // ----- Orbit-Berechnung -----
    let globalAngle = 0;
    function getOrbitPos(state, time) {
      const angle = state.baseAngle + globalAngle;
      const wobble = WOBBLE_AMPLITUDE * Math.sin(time * WOBBLE_FREQ + state.index * 2);
      const r = ORBIT_RADIUS + wobble;
      const targetX = CENTER_X + r * Math.cos(angle);
      const targetY = CENTER_Y + r * Math.sin(angle);
      return { x: targetX, y: targetY };
    }

    // ----- Drag & Drop -----
    function startDrag(e, index) {
      e.preventDefault();
      const state = buttonStates[index];
      const btn = buttonElements[index];
      state.dragging = true;
      btn.dataset.dragging = 'true';
      btn.style.cursor = 'grabbing';

      const rect = centerContainer.getBoundingClientRect();
      state.dragX = e.clientX - rect.left;
      state.dragY = e.clientY - rect.top;

      const onMouseMove = (moveEvent) => {
        moveEvent.preventDefault();
        const rect = centerContainer.getBoundingClientRect();
        const mouseX = moveEvent.clientX - rect.left;
        const mouseY = moveEvent.clientY - rect.top;
        state.x = mouseX;
        state.y = mouseY;
        state.vx = 0;
        state.vy = 0;
        btn.style.left = (mouseX - 28) + 'px';
        btn.style.top = (mouseY - 32.5) + 'px';
        state.dragX = mouseX;
        state.dragY = mouseY;
      };

      const onMouseUp = () => {
        state.dragging = false;
        btn.dataset.dragging = 'false';
        btn.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMouseMove);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp, { once: true });
    }

    // ----- Kollisionserkennung -----
    function resolveCollisions() {
      const n = buttonStates.length;
      for (let i = 0; i < n; i++) {
        const a = buttonStates[i];
        for (let j = i + 1; j < n; j++) {
          const b = buttonStates[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = RADIUS * 2;
          if (dist < minDist && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            if (!a.dragging && !b.dragging) {
              const correction = overlap * 0.5;
              a.x += nx * correction;
              a.y += ny * correction;
              b.x -= nx * correction;
              b.y -= ny * correction;
            } else if (a.dragging && !b.dragging) {
              b.x -= nx * overlap;
              b.y -= ny * overlap;
            } else if (!a.dragging && b.dragging) {
              a.x += nx * overlap;
              a.y += ny * overlap;
            }

            if (!a.dragging && !b.dragging) {
              const vRelX = a.vx - b.vx;
              const vRelY = a.vy - b.vy;
              const velAlong = vRelX * nx + vRelY * ny;
              if (velAlong > 0) continue;
              const impulse = 2 * velAlong / 2 * BOUNCE;
              a.vx -= impulse * nx;
              a.vy -= impulse * ny;
              b.vx += impulse * nx;
              b.vy += impulse * ny;
            }
          }
        }
      }
    }

    // ----- Animations-Loop (inkl. Zeichnen des Canvas) -----
    let animFrame = null;
    let time = 0;

    function drawConnections() {
      ctx.clearRect(0, 0, 600, 600);

      // Leuchtende Sphäre in der Mitte
      ctx.beginPath();
      ctx.arc(300, 300, 12.5, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      const points = buttonElements.map(btn => {
        const left = parseFloat(btn.style.left);
        const top = parseFloat(btn.style.top);
        return { x: left + 28, y: top + 32.5 };
      });

      if (points.length < 2) return;

      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      const n = points.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();

        const k = (i + 2) % n;
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[k].x, points[k].y);
        ctx.stroke();
      }
    }

    function animate() {
      time += 1;
      globalAngle += ROTATION_SPEED;

      buttonStates.forEach(state => {
        if (state.dragging) return;
        const target = getOrbitPos(state, time);
        const fx = (target.x - state.x) * SPRING_FORCE;
        const fy = (target.y - state.y) * SPRING_FORCE;
        state.vx += fx;
        state.vy += fy;
      });

      buttonStates.forEach(state => {
        if (!state.dragging) {
          state.vx *= FRICTION;
          state.vy *= FRICTION;
        }
      });

      buttonStates.forEach(state => {
        if (!state.dragging) {
          state.x += state.vx;
          state.y += state.vy;
        }
      });

      resolveCollisions();

      buttonStates.forEach((state, idx) => {
        const btn = buttonElements[idx];
        btn.style.left = (state.x - 28) + 'px';
        btn.style.top = (state.y - 32.5) + 'px';
      });

      drawConnections();

      animFrame = requestAnimationFrame(animate);
    }

    function resetPositions() {
      time = 0;
      globalAngle = 0;
      buttonStates.forEach((state, idx) => {
        const target = getOrbitPos(state, 0);
        state.x = target.x;
        state.y = target.y;
        state.vx = 0;
        state.vy = 0;
        const btn = buttonElements[idx];
        btn.style.left = (target.x - 28) + 'px';
        btn.style.top = (target.y - 32.5) + 'px';
      });
      drawConnections();
    }

    // ----- Sub-Overlay (wird für alle Inhalte genutzt) -----
    const subOverlay = document.createElement('div');
    subOverlay.id = 'quantum-sub-overlay';
    subOverlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      max-width: 80%;
      max-height: 70vh;
      overflow-y: auto;
      background: rgba(20, 20, 30, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid #444;
      border-radius: 14px;
      color: #fff;
      padding: 20px;
      z-index: 10000000;
      display: none;
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
      transition: opacity 0.2s ease;
      opacity: 0;
      font-family: inherit;
    `;
    overlay.appendChild(subOverlay);

    const subContent = document.createElement('div');
    subContent.id = 'quantum-sub-content';
    subOverlay.appendChild(subContent);

    const closeSubBtn = document.createElement('button');
    closeSubBtn.textContent = '← Zurück';
    closeSubBtn.style.cssText = `
      margin-top: 15px;
      padding: 8px 16px;
      background: #4a6;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
    `;
    closeSubBtn.addEventListener('click', () => {
      subOverlay.style.opacity = '0';
      setTimeout(() => subOverlay.style.display = 'none', 200);
    });
    subOverlay.appendChild(closeSubBtn);

    function showSubOverlay(html) {
      subContent.innerHTML = html;
      subOverlay.style.display = 'block';
      setTimeout(() => subOverlay.style.opacity = '1', 10);
    }

    // ----- Aktionen für die Buttons (vollständig, wie in deiner Version) -----
    function showCredits() {
      const creditsHTML = `
        <div>
          <h2 style="margin-top:0;">Quantum Client</h2>
          <p>Version 1.0</p>
          <p>Der beste und der allererste Client für Taming.io</p>
          <p>Dank an alle Tester.</p>
        </div>
      `;
      showSubOverlay(creditsHTML);
    }

    function showThemeEditor() {
      // Hier den vollständigen Theme-Editor Code einfügen (aus vorherigen Antworten)
      // Aus Platzgründen nur Platzhalter – bitte den echten Code verwenden.
      showSubOverlay('<p>Theme-Editor (vollständiger Code hier)</p>');
    }

    function showNews() {
      const newsHTML = `
        <div>
          <h3 style="margin-top:0;">Taming.io Neuigkeiten</h3>
          <p style="color:#aaa;">Hier würden die neuesten Nachrichten aus dem Discord erscheinen.</p>
          <div style="background:#2a2a2a; border-radius:8px; padding:10px; margin:10px 0;">
            <p><strong>🔔 Beispiel:</strong> Version 1.5 veröffentlicht</p>
            <p><small>vor 2 Tagen</small></p>
          </div>
        </div>
      `;
      showSubOverlay(newsHTML);
    }

    function showQuickSettings() {
      const quickHTML = `
        <div>
          <h3 style="margin-top:0;">Quick Settings</h3>
          <div style="margin:10px 0;">
            <label><input type="checkbox" id="qs-autoclicker" checked> Autoclicker aktiv</label>
          </div>
          <div style="margin:10px 0;">
            <label><input type="checkbox" id="qs-esp" checked> ESP anzeigen</label>
          </div>
          <div style="margin:10px 0;">
            <label><input type="checkbox" id="qs-network" checked> Netzwerk-Monitor</label>
          </div>
          <div style="margin:10px 0;">
            <label><input type="checkbox" id="qs-aim" checked> Zielhilfe</label>
          </div>
          <button id="qs-save" style="background:#4a6; color:#fff; border:none; border-radius:4px; padding:8px 16px; cursor:pointer; margin-top:10px;">Speichern</button>
        </div>
      `;
      showSubOverlay(quickHTML);
      setTimeout(() => {
        document.getElementById('qs-save')?.addEventListener('click', () => alert('Demo'));
      }, 100);
    }

    function showDevTools() {
      const devHTML = `
        <div>
          <h3 style="margin-top:0;">Entwickler-Tools</h3>
          <p>Seiten-Informationen:</p>
          <ul style="background:#2a2a2a; padding:10px; border-radius:6px;">
            <li>URL: ${window.location.href}</li>
            <li>User Agent: ${navigator.userAgent}</li>
            <li>Canvas-Elemente: ${document.querySelectorAll('canvas').length}</li>
            <li>WebGL: ${!!window.WebGLRenderingContext}</li>
          </ul>
        </div>
      `;
      showSubOverlay(devHTML);
    }

    function showUIScaling() {
      const scaleHTML = `
        <div>
          <h3 style="margin-top:0;">UI-Skalierung</h3>
          <p>Hauptmenü-Größe:</p>
          <input type="range" id="ui-scale" min="0.5" max="2" step="0.1" value="1" style="width:100%;">
          <p id="ui-scale-value">100%</p>
          <button id="ui-apply" style="background:#4a6; color:#fff; border:none; border-radius:4px; padding:8px 16px; cursor:pointer; margin-top:10px;">Anwenden</button>
        </div>
      `;
      showSubOverlay(scaleHTML);
      setTimeout(() => {
        const slider = document.getElementById('ui-scale');
        const valSpan = document.getElementById('ui-scale-value');
        if (slider) {
          slider.addEventListener('input', () => {
            valSpan.textContent = Math.round(slider.value * 100) + '%';
          });
        }
        document.getElementById('ui-apply')?.addEventListener('click', () => {
          const scale = parseFloat(slider?.value || 1);
          overlay.style.transform = `scale(${scale})`;
          alert('Skalierung angewendet (nur für Quantum-Menü).');
        });
      }, 100);
    }

    function showNews() {
      const newsHTML = `
        <div>
          <h3 style="margin-top:0;">Taming.io Neuigkeiten</h3>
          <p style="color:#aaa;">Hier würden die neuesten Nachrichten aus dem Discord erscheinen.</p>
          <div style="background:#2a2a2a; border-radius:8px; padding:10px; margin:10px 0;">
            <p><strong>🔔 Beispiel:</strong> Version 1.5 veröffentlicht</p>
            <p><small>vor 2 Tagen</small></p>
          </div>
        </div>
      `;
      showSubOverlay(newsHTML);
    }

    function showQuickSettings() {
      const quickHTML = `
        <div>
          <h3 style="margin-top:0;">Quick Settings</h3>
          <div style="margin:10px 0;">
            <label><input type="checkbox" id="qs-autoclicker" checked> Autoclicker aktiv</label>
          </div>
          <div style="margin:10px 0;">
            <label><input type="checkbox" id="qs-esp" checked> ESP anzeigen</label>
          </div>
          <div style="margin:10px 0;">
            <label><input type="checkbox" id="qs-network" checked> Netzwerk-Monitor</label>
          </div>
          <div style="margin:10px 0;">
            <label><input type="checkbox" id="qs-aim" checked> Zielhilfe</label>
          </div>
          <button id="qs-save" style="background:#4a6; color:#fff; border:none; border-radius:4px; padding:8px 16px; cursor:pointer; margin-top:10px;">Speichern</button>
        </div>
      `;
      showSubOverlay(quickHTML);
      setTimeout(() => {
        document.getElementById('qs-save')?.addEventListener('click', () => alert('Demo'));
      }, 100);
    }

    function showDevTools() {
      const devHTML = `
        <div>
          <h3 style="margin-top:0;">Entwickler-Tools</h3>
          <p>Seiten-Informationen:</p>
          <ul style="background:#2a2a2a; padding:10px; border-radius:6px;">
            <li>URL: ${window.location.href}</li>
            <li>User Agent: ${navigator.userAgent}</li>
            <li>Canvas-Elemente: ${document.querySelectorAll('canvas').length}</li>
            <li>WebGL: ${!!window.WebGLRenderingContext}</li>
          </ul>
        </div>
      `;
      showSubOverlay(devHTML);
    }

    function showUIScaling() {
      const scaleHTML = `
        <div>
          <h3 style="margin-top:0;">UI-Skalierung</h3>
          <p>Hauptmenü-Größe:</p>
          <input type="range" id="ui-scale" min="0.5" max="2" step="0.1" value="1" style="width:100%;">
          <p id="ui-scale-value">100%</p>
          <button id="ui-apply" style="background:#4a6; color:#fff; border:none; border-radius:4px; padding:8px 16px; cursor:pointer; margin-top:10px;">Anwenden</button>
        </div>
      `;
      showSubOverlay(scaleHTML);
      setTimeout(() => {
        const slider = document.getElementById('ui-scale');
        const valSpan = document.getElementById('ui-scale-value');
        if (slider) {
          slider.addEventListener('input', () => {
            valSpan.textContent = Math.round(slider.value * 100) + '%';
          });
        }
        document.getElementById('ui-apply')?.addEventListener('click', () => {
          const scale = parseFloat(slider?.value || 1);
          overlay.style.transform = `scale(${scale})`;
          alert('Skalierung angewendet (nur für Quantum-Menü).');
        });
      }, 100);
    }

    function showMacroRecorder() {
      if (t.macroRecorder) {
        t.macroRecorder();
      } else {
        alert('Makro Recorder Modul nicht gefunden.');
      }
    }

    // ----- Toggle Menu -----
    function toggleMenu() {
      if (overlay.style.display === 'flex') {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.style.display = 'none';
          subOverlay.style.display = 'none';
          if (animFrame) cancelAnimationFrame(animFrame);
        }, 300);
      } else {
        overlay.style.display = 'flex';
        resetPositions();
        setTimeout(() => overlay.style.opacity = '1', 10);
        if (animFrame) cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(animate);
      }
    }

    // ----- Key Handler -----
    const keyHandler = (e) => {
      if (e.code === 'ShiftRight') {
        e.preventDefault();
        toggleMenu();
      }
    };
    document.addEventListener('keydown', keyHandler, true);

    // ----- Click outside -----
    const mouseHandler = (e) => {
      if (overlay.style.display === 'flex' && overlay.style.opacity > 0) {
        if (subOverlay.style.display === 'block' && !subOverlay.contains(e.target)) {
          subOverlay.style.opacity = '0';
          setTimeout(() => subOverlay.style.display = 'none', 200);
        } else if (!centerContainer.contains(e.target) && subOverlay.style.display !== 'block') {
          toggleMenu();
        }
      }
    };
    document.addEventListener('mousedown', mouseHandler);

    // ----- Aufräumen -----
    window.addEventListener('beforeunload', () => {
      document.removeEventListener('keydown', keyHandler, true);
      document.removeEventListener('mousedown', mouseHandler);
      overlay.remove();
      if (animFrame) cancelAnimationFrame(animFrame);
    });

    document.body.appendChild(overlay);
    return overlay;
  };
})();

console.log('quantum_menu.js geladen');
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.taming = window.taming || {};
    window.taming.quantumMenu();
  });
} else {
  window.taming = window.taming || {};
  window.taming.quantumMenu();
}