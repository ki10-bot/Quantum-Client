// content/autoclicker.js
(function() {
  const t = window.taming;

  t.autoClicker = function(overlay) {
    // ------------------------------------------------------------
    // 1. Button mit Fallback
    // ------------------------------------------------------------
    let clickerBtn;
    try {
      clickerBtn = t.createIconButton('clicker', 56, 65, 35);
    } catch (e) {
      clickerBtn = t.createButton('🖱️');
      clickerBtn.style.width = '56px';
      clickerBtn.style.height = '65px';
      clickerBtn.style.fontSize = '24px';
      clickerBtn.style.lineHeight = '65px';
      clickerBtn.style.padding = '0';
    }

    const clickerWin = t.createWindow('Autoclicker', '400px', '250px', '350px', '420px');
    clickerWin.style.display = 'none';

    clickerBtn.onclick = () => {
      clickerWin.style.display = clickerWin.style.display === 'none' ? 'block' : 'none';
    };

    // ------------------------------------------------------------
    // 2. UI-Elemente
    // ------------------------------------------------------------
    const container = document.createElement('div');
    container.style.padding = '4px';
    clickerWin.appendChild(container);

    // Status
    const statusDiv = document.createElement('div');
    statusDiv.style.margin = '4px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = '⏸️ Gestoppt';
    container.appendChild(statusDiv);

    // Fehler-/Warnmeldung
    const errorDiv = document.createElement('div');
    errorDiv.style.margin = '4px';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.color = '#faa';
    container.appendChild(errorDiv);

    // Start/Stopp-Button
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Starten';
    toggleBtn.style.width = '100%';
    toggleBtn.style.margin = '4px 0';
    toggleBtn.style.padding = '8px';
    toggleBtn.style.background = '#4a6';
    toggleBtn.style.color = '#fff';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '4px';
    toggleBtn.style.cursor = 'pointer';
    container.appendChild(toggleBtn);

    // Klicks pro Sekunde
    const cpsDiv = document.createElement('div');
    cpsDiv.style.margin = '8px 4px';
    cpsDiv.innerHTML = '<span style="font-size:12px;">Klicks pro Sekunde: <span id="clicker-cps-value">10</span></span>';
    const cpsSlider = document.createElement('input');
    cpsSlider.type = 'range';
    cpsSlider.min = 1;
    cpsSlider.max = 50;
    cpsSlider.value = 10;
    cpsSlider.style.width = '100%';
    cpsDiv.appendChild(cpsSlider);
    container.appendChild(cpsDiv);

    // Maustaste-Auswahl
    const buttonDiv = document.createElement('div');
    buttonDiv.style.margin = '8px 4px';
    buttonDiv.style.fontSize = '12px';
    buttonDiv.innerHTML = '<span>Maustaste: </span>';
    const buttonSelect = document.createElement('select');
    buttonSelect.style.background = '#333';
    buttonSelect.style.color = '#fff';
    buttonSelect.style.border = '1px solid #555';
    buttonSelect.style.marginLeft = '4px';
    const leftOpt = document.createElement('option'); leftOpt.value = 'left'; leftOpt.textContent = 'Links';
    const rightOpt = document.createElement('option'); rightOpt.value = 'right'; rightOpt.textContent = 'Rechts';
    const middleOpt = document.createElement('option'); middleOpt.value = 'middle'; middleOpt.textContent = 'Mitte';
    buttonSelect.appendChild(leftOpt);
    buttonSelect.appendChild(rightOpt);
    buttonSelect.appendChild(middleOpt);
    buttonDiv.appendChild(buttonSelect);
    container.appendChild(buttonDiv);

    // ------------------------------------------------------------
    // Hold-Modus mit Tastatur- und Mausauslöser
    // ------------------------------------------------------------
    const modeDiv = document.createElement('div');
    modeDiv.style.margin = '8px 4px';
    const modeCheck = document.createElement('input');
    modeCheck.type = 'checkbox';
    modeCheck.id = 'clicker-hold';
    const modeLabel = document.createElement('label');
    modeLabel.htmlFor = 'clicker-hold';
    modeLabel.textContent = ' Nur klicken wenn folgende Taste gedrückt ist:';
    modeDiv.appendChild(modeCheck);
    modeDiv.appendChild(modeLabel);
    container.appendChild(modeDiv);

    const keyDiv = document.createElement('div');
    keyDiv.style.margin = '4px 4px 4px 24px';
    keyDiv.style.display = 'none';
    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.placeholder = 'Taste/Maustaste drücken...';
    keyInput.readOnly = true;
    keyInput.style.width = '100%';
    keyInput.style.background = '#333';
    keyInput.style.color = '#fff';
    keyInput.style.border = '1px solid #555';
    keyInput.style.padding = '4px';
    keyDiv.appendChild(keyInput);
    container.appendChild(keyDiv);

    let holdTrigger = null; // { type: 'key', code: 'KeyW' } oder { type: 'mouse', button: 'left' }

    function formatTrigger(trigger) {
      if (!trigger) return '';
      if (trigger.type === 'key') return trigger.code;
      if (trigger.type === 'mouse') {
        if (trigger.button === 'left') return 'Maus Links';
        if (trigger.button === 'right') return 'Maus Rechts';
        if (trigger.button === 'middle') return 'Maus Mitte';
      }
      return '';
    }

    keyInput.addEventListener('click', () => {
      keyInput.value = 'Drücke eine Taste oder Maustaste...';
      const keyHandler = (e) => {
        e.preventDefault();
        holdTrigger = { type: 'key', code: e.code };
        keyInput.value = formatTrigger(holdTrigger);
        document.removeEventListener('keydown', keyHandler);
        document.removeEventListener('mousedown', mouseHandler);
      };
      const mouseHandler = (e) => {
        e.preventDefault();
        let button = 'left';
        if (e.button === 0) button = 'left';
        else if (e.button === 1) button = 'middle';
        else if (e.button === 2) button = 'right';
        holdTrigger = { type: 'mouse', button: button };
        keyInput.value = formatTrigger(holdTrigger);
        document.removeEventListener('keydown', keyHandler);
        document.removeEventListener('mousedown', mouseHandler);
      };
      document.addEventListener('keydown', keyHandler);
      document.addEventListener('mousedown', mouseHandler);
    });

    modeCheck.addEventListener('change', (e) => {
      keyDiv.style.display = e.target.checked ? 'block' : 'none';
      if (!e.target.checked) holdTrigger = null;
    });

    // ------------------------------------------------------------
    // Zufällige Verzögerung
    // ------------------------------------------------------------
    const randomDiv = document.createElement('div');
    randomDiv.style.margin = '8px 4px';
    const randomCheck = document.createElement('input');
    randomCheck.type = 'checkbox';
    randomCheck.id = 'clicker-random';
    const randomLabel = document.createElement('label');
    randomLabel.htmlFor = 'clicker-random';
    randomLabel.textContent = ' Zufällige Verzögerung (±%)';
    randomDiv.appendChild(randomCheck);
    randomDiv.appendChild(randomLabel);
    container.appendChild(randomDiv);

    const randomSliderDiv = document.createElement('div');
    randomSliderDiv.style.margin = '4px 4px 4px 24px';
    randomSliderDiv.style.display = 'none';
    randomSliderDiv.innerHTML = '<span style="font-size:12px;">Variation: <span id="clicker-random-value">10</span>%</span>';
    const randomSlider = document.createElement('input');
    randomSlider.type = 'range';
    randomSlider.min = 0;
    randomSlider.max = 50;
    randomSlider.value = 10;
    randomSlider.style.width = '100%';
    randomSliderDiv.appendChild(randomSlider);
    container.appendChild(randomSliderDiv);

    randomCheck.addEventListener('change', (e) => {
      randomSliderDiv.style.display = e.target.checked ? 'block' : 'none';
    });

    // Klick-Zähler
    const countDiv = document.createElement('div');
    countDiv.style.margin = '8px 4px';
    countDiv.style.fontSize = '14px';
    countDiv.innerHTML = 'Klicks: <span id="clicker-count">0</span>';
    container.appendChild(countDiv);

    // Reset-Zähler-Button
    const resetCountBtn = document.createElement('button');
    resetCountBtn.textContent = 'Zähler zurücksetzen';
    resetCountBtn.style.width = '100%';
    resetCountBtn.style.margin = '4px 0';
    resetCountBtn.style.padding = '4px';
    resetCountBtn.style.background = '#a44';
    resetCountBtn.style.color = '#fff';
    resetCountBtn.style.border = 'none';
    resetCountBtn.style.borderRadius = '4px';
    resetCountBtn.style.cursor = 'pointer';
    resetCountBtn.onclick = () => {
      clickCount = 0;
      updateCount();
    };
    container.appendChild(resetCountBtn);

    // ------------------------------------------------------------
    // 3. Zustand und Variablen
    // ------------------------------------------------------------
    let active = false;
    let intervalId = null;
    let clickCount = 0;
    let triggerActive = false; // true wenn Hold-Trigger gedrückt

    function updateCount() {
      const span = document.getElementById('clicker-count');
      if (span) span.textContent = clickCount;
    }

    // Klick-Funktion
    function performClick() {
      if (!active) return;
      if (modeCheck.checked && holdTrigger && !triggerActive) return;

      const x = t.lastMouseX;
      const y = t.lastMouseY;
      if (x === 0 && y === 0) {
        errorDiv.textContent = '⚠️ Keine Mausposition – bewege die Maus.';
        return;
      } else {
        errorDiv.textContent = '';
      }

      const button = buttonSelect.value;
      chrome.runtime.sendMessage({
        action: 'click',
        x: x,
        y: y,
        button: button
      }, (response) => {
        if (response && response.success) {
          clickCount++;
          updateCount();
        } else {
          console.error('Autoclicker: Klick fehlgeschlagen', response?.error);
          errorDiv.textContent = '❌ Klick fehlgeschlagen – Debugger?';
        }
      });
    }

    // Intervall-Logik
    function startInterval() {
      if (intervalId) clearTimeout(intervalId);
      const baseDelay = 1000 / cpsSlider.value;
      const useRandom = randomCheck.checked;
      const variation = randomSlider.value / 100;

      const loop = () => {
        if (!active) return;
        let delay = baseDelay;
        if (useRandom) {
          const factor = 1 + (Math.random() * 2 - 1) * variation;
          delay = baseDelay * factor;
          delay = Math.max(10, Math.min(2000, delay));
        }
        intervalId = setTimeout(() => {
          performClick();
          if (active) loop();
        }, delay);
      };
      loop();
    }

    function stopInterval() {
      if (intervalId) {
        clearTimeout(intervalId);
        intervalId = null;
      }
    }

    // Hold-Listener (Tastatur & Maus)
    function onTriggerDown(e) {
      if (!modeCheck.checked || !holdTrigger) return;
      if (holdTrigger.type === 'key' && e.type === 'keydown' && e.code === holdTrigger.code) {
        triggerActive = true;
      } else if (holdTrigger.type === 'mouse' && e.type === 'mousedown') {
        let btn = 'left';
        if (e.button === 0) btn = 'left';
        else if (e.button === 1) btn = 'middle';
        else if (e.button === 2) btn = 'right';
        if (btn === holdTrigger.button) {
          triggerActive = true;
        }
      }
    }

    function onTriggerUp(e) {
      if (!modeCheck.checked || !holdTrigger) return;
      if (holdTrigger.type === 'key' && e.type === 'keyup' && e.code === holdTrigger.code) {
        triggerActive = false;
      } else if (holdTrigger.type === 'mouse' && e.type === 'mouseup') {
        let btn = 'left';
        if (e.button === 0) btn = 'left';
        else if (e.button === 1) btn = 'middle';
        else if (e.button === 2) btn = 'right';
        if (btn === holdTrigger.button) {
          triggerActive = false;
        }
      }
    }

    function addHoldListeners() {
      document.addEventListener('keydown', onTriggerDown);
      document.addEventListener('keyup', onTriggerUp);
      document.addEventListener('mousedown', onTriggerDown);
      document.addEventListener('mouseup', onTriggerUp);
    }

    function removeHoldListeners() {
      document.removeEventListener('keydown', onTriggerDown);
      document.removeEventListener('keyup', onTriggerUp);
      document.removeEventListener('mousedown', onTriggerDown);
      document.removeEventListener('mouseup', onTriggerUp);
    }

    // ------------------------------------------------------------
    // 4. Start/Stopp-Logik
    // ------------------------------------------------------------
    toggleBtn.onclick = () => {
      // Prüfung vor Start
      if (!active && modeCheck.checked && !holdTrigger) {
        errorDiv.textContent = '⚠️ Bitte zuerst eine Taste oder Maustaste festlegen.';
        return;
      }

      active = !active;
      if (active) {
        toggleBtn.textContent = 'Stoppen';
        toggleBtn.style.background = '#a44';
        statusDiv.innerHTML = '▶️ Aktiv';
        errorDiv.textContent = '';
        if (modeCheck.checked && holdTrigger) {
          addHoldListeners();
        }
        startInterval();
      } else {
        toggleBtn.textContent = 'Starten';
        toggleBtn.style.background = '#4a6';
        statusDiv.innerHTML = '⏸️ Gestoppt';
        stopInterval();
        removeHoldListeners();
        triggerActive = false;
      }
    };

    // Slider-Werte anzeigen
    const cpsSpan = document.getElementById('clicker-cps-value') || document.createElement('span');
    cpsSpan.textContent = cpsSlider.value;
    cpsSlider.addEventListener('input', () => {
      cpsSpan.textContent = cpsSlider.value;
    });

    const randomSpan = document.getElementById('clicker-random-value') || document.createElement('span');
    randomSpan.textContent = randomSlider.value;
    randomSlider.addEventListener('input', () => {
      randomSpan.textContent = randomSlider.value;
    });

    updateCount();

    // ------------------------------------------------------------
    // 5. Aufräumen
    // ------------------------------------------------------------
    window.addEventListener('beforeunload', () => {
      if (active) {
        stopInterval();
        removeHoldListeners();
      }
    });

    return clickerBtn;
  };
})();