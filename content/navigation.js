// content/navigation.js
(function() {
  const t = window.taming;

  t.navigation = function(overlay, moduleButtons) {
    // ------------------------------------------------------------
    // Bestehende Pfeile (links/rechts)
    // ------------------------------------------------------------
    function createArrow(direction) {
      let btn;
      try {
        btn = t.createIconButton(direction, 22, 30, 14);
      } catch (e) {
        btn = t.createButton(direction === 'left' ? '◀' : '▶');
        btn.style.width = '22px';
        btn.style.height = '30px';
        btn.style.fontSize = '16px';
        btn.style.lineHeight = '30px';
        btn.style.padding = '0';
      }
      return btn;
    }

    const leftArrow = createArrow('left');
    leftArrow.classList.add('nav-arrow', 'left-arrow');
    leftArrow.style.position = 'absolute';
    leftArrow.style.top = '50%';
    leftArrow.style.transform = 'translateY(-50%)';
    leftArrow.style.left = '-11px';
    leftArrow.style.zIndex = '20';
    leftArrow.style.margin = '0';

    const rightArrow = createArrow('right');
    rightArrow.classList.add('nav-arrow', 'right-arrow');
    rightArrow.style.position = 'absolute';
    rightArrow.style.top = '50%';
    rightArrow.style.transform = 'translateY(-50%)';
    rightArrow.style.right = '-11px';
    rightArrow.style.zIndex = '20';
    rightArrow.style.margin = '0';

    overlay.appendChild(leftArrow);
    overlay.appendChild(rightArrow);

    t.buttons.push(leftArrow);
    t.buttons.push(rightArrow);
    t.attachKeybind(leftArrow);
    t.attachKeybind(rightArrow);

    // ------------------------------------------------------------
    // NEU: Pfeil nach unten und Einstellungspanel
    // ------------------------------------------------------------
    let downBtn;
    try {
      downBtn = t.createIconButton('down', 40, 20, 16);
    } catch (e) {
      downBtn = t.createButton('▼');
      downBtn.style.width = '40px';
      downBtn.style.height = '20px';
      downBtn.style.fontSize = '12px';
      downBtn.style.lineHeight = '20px';
      downBtn.style.padding = '0';
    }
    downBtn.style.position = 'absolute';
    downBtn.style.bottom = '-20px';
    downBtn.style.left = '49%';
    downBtn.style.transform = 'translateX(-50%)';
    downBtn.style.borderRadius = '0 0 6px 6px';
    downBtn.style.zIndex = '30';
    downBtn.title = 'Einstellungen öffnen';
    overlay.appendChild(downBtn);

    // Einstellungspanel – eigener Style (nicht von globalen Styles betroffen)1
    const settingsPanel = document.createElement('div');
    settingsPanel.style.position = 'absolute';
    settingsPanel.style.top = 'calc(100% + 10px)'; // größerer Abstand (10px)
    settingsPanel.style.left = '0';
    settingsPanel.style.width = '88%'; // gleiche Breite wie Hauptmenü
    settingsPanel.style.background = '#1e1e1e';
    settingsPanel.style.border = '1px solid #444';
    settingsPanel.style.borderRadius = '14px'; // ALLE Ecken abgerundet
    settingsPanel.style.color = '#e0e0e0';
    settingsPanel.style.fontFamily = 'Inter, system-ui, sans-serif';
    settingsPanel.style.fontSize = '13px';
    settingsPanel.style.padding = '12px';
    settingsPanel.style.zIndex = '25';
    settingsPanel.style.display = 'none';
    settingsPanel.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    overlay.appendChild(settingsPanel);

    // Grid-Layout für zwei Spalten
    settingsPanel.style.display = 'grid';
    settingsPanel.style.gridTemplateColumns = '1fr 1fr';
    settingsPanel.style.gap = '12px';

    // ------------------------------------------------------------
    // Einstellungen (jeweils in eigenen Containern für das Grid)
    // ------------------------------------------------------------
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 15, g: 15, b: 20 };
    }

    // 1. Hauptmenü anzeigen (linke Spalte)
    const showDiv = document.createElement('div');
    showDiv.style.gridColumn = '1 / 2';
    showDiv.style.margin = '4px 0';
    const showCheck = document.createElement('input');
    showCheck.type = 'checkbox';
    showCheck.id = 'settings-show-overlay';
    showCheck.checked = true;
    const showLabel = document.createElement('label');
    showLabel.htmlFor = 'settings-show-overlay';
    showLabel.textContent = ' Hauptmenü anzeigen';
    showDiv.appendChild(showCheck);
    showDiv.appendChild(showLabel);
    settingsPanel.appendChild(showDiv);

    // 2. Schriftart-Auswahl (rechte Spalte)
    const fontDiv = document.createElement('div');
    fontDiv.style.gridColumn = '2 / 3';
    fontDiv.style.margin = '4px 0';
    fontDiv.innerHTML = '<span style="display:block; margin-bottom:2px;">Schriftart:</span>';
    const fontSelect = document.createElement('select');
    fontSelect.style.width = '100%';
    fontSelect.style.background = '#333';
    fontSelect.style.color = '#fff';
    fontSelect.style.border = '1px solid #555';
    fontSelect.style.padding = '2px';
    const optStandard = document.createElement('option'); optStandard.value = 'standard'; optStandard.textContent = 'Standard';
    const opt1 = document.createElement('option'); opt1.value = 'font1'; opt1.textContent = 'Schriftart 1';
    const opt2 = document.createElement('option'); opt2.value = 'font2'; opt2.textContent = 'Schriftart 2';
    fontSelect.appendChild(optStandard);
    fontSelect.appendChild(opt1);
    fontSelect.appendChild(opt2);
    fontDiv.appendChild(fontSelect);
    settingsPanel.appendChild(fontDiv);

    // 3. Hintergrundfarbe (links)
    const bgDiv = document.createElement('div');
    bgDiv.style.gridColumn = '1 / 2';
    bgDiv.style.margin = '4px 0';
    bgDiv.innerHTML = '<span style="display:block; margin-bottom:2px;">Hintergrund:</span>';
    const bgColor = document.createElement('input');
    bgColor.type = 'color';
    bgColor.value = '#0f0f14';
    bgColor.style.width = '100%';
    bgColor.style.height = '30px';
    bgDiv.appendChild(bgColor);
    settingsPanel.appendChild(bgDiv);

    // 4. Transparenz (rechts) – mit stopPropagation
    const opacityDiv = document.createElement('div');
    opacityDiv.style.gridColumn = '2 / 3';
    opacityDiv.style.margin = '4px 0';
    opacityDiv.innerHTML = '<span style="display:block; margin-bottom:2px;">Transparenz: <span id="opacity-value">0.65</span></span>';
    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = 0;
    opacitySlider.max = 1;
    opacitySlider.step = 0.05;
    opacitySlider.value = 0.65;
    opacitySlider.style.width = '100%';
    opacitySlider.addEventListener('mousedown', (e) => e.stopPropagation());
    opacityDiv.appendChild(opacitySlider);
    settingsPanel.appendChild(opacityDiv);

    // 5. Schriftfarbe (links)
    const textDiv = document.createElement('div');
    textDiv.style.gridColumn = '1 / 2';
    textDiv.style.margin = '4px 0';
    textDiv.innerHTML = '<span style="display:block; margin-bottom:2px;">Schriftfarbe:</span>';
    const textColor = document.createElement('input');
    textColor.type = 'color';
    textColor.value = '#e6e6e6';
    textColor.style.width = '100%';
    textColor.style.height = '30px';
    textDiv.appendChild(textColor);
    settingsPanel.appendChild(textDiv);

    // 6. Rahmenfarbe (rechts)
    const borderDiv = document.createElement('div');
    borderDiv.style.gridColumn = '2 / 3';
    borderDiv.style.margin = '4px 0';
    borderDiv.innerHTML = '<span style="display:block; margin-bottom:2px;">Rahmenfarbe:</span>';
    const borderColor = document.createElement('input');
    borderColor.type = 'color';
    borderColor.value = '#ffffff14';
    borderColor.style.width = '100%';
    borderColor.style.height = '30px';
    borderDiv.appendChild(borderColor);
    settingsPanel.appendChild(borderDiv);

    // 7. Rundung (links)
    const radiusDiv = document.createElement('div');
    radiusDiv.style.gridColumn = '1 / 2';
    radiusDiv.style.margin = '4px 0';
    radiusDiv.innerHTML = '<span style="display:block; margin-bottom:2px;">Rundung: <span id="radius-value">14</span>px</span>';
    const radiusSlider = document.createElement('input');
    radiusSlider.type = 'range';
    radiusSlider.min = 0;
    radiusSlider.max = 30;
    radiusSlider.step = 1;
    radiusSlider.value = 14;
    radiusSlider.style.width = '100%';
    radiusSlider.addEventListener('mousedown', (e) => e.stopPropagation());
    radiusDiv.appendChild(radiusSlider);
    settingsPanel.appendChild(radiusDiv);

    // 8. Schattenintensität (rechts)
    const shadowDiv = document.createElement('div');
    shadowDiv.style.gridColumn = '2 / 3';
    shadowDiv.style.margin = '4px 0';
    shadowDiv.innerHTML = '<span style="display:block; margin-bottom:2px;">Schatten: <span id="shadow-value">10</span></span>';
    const shadowSlider = document.createElement('input');
    shadowSlider.type = 'range';
    shadowSlider.min = 0;
    shadowSlider.max = 30;
    shadowSlider.step = 1;
    shadowSlider.value = 10;
    shadowSlider.style.width = '100%';
    shadowSlider.addEventListener('mousedown', (e) => e.stopPropagation());
    shadowDiv.appendChild(shadowSlider);
    settingsPanel.appendChild(shadowDiv);

    // 9. Schließen-Button (über beide Spalten)
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Schließen';
    closeBtn.style.gridColumn = '1 / 3';
    closeBtn.style.margin = '8px 0 0 0';
    closeBtn.style.padding = '6px';
    closeBtn.style.background = '#a44';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '4px';
    closeBtn.style.cursor = 'pointer';
    settingsPanel.appendChild(closeBtn);

    // ------------------------------------------------------------
    // Event-Listener
    // ------------------------------------------------------------
    downBtn.addEventListener('click', () => {
      const isVisible = settingsPanel.style.display !== 'none';
      settingsPanel.style.display = isVisible ? 'none' : 'grid';
    });

    closeBtn.addEventListener('click', () => {
      settingsPanel.style.display = 'none';
    });

    // Funktion zum dynamischen Laden einer Schriftart
    function loadCustomFont(fontName, fontFile) {
      return new Promise((resolve, reject) => {
        const style = document.createElement('style');
        style.textContent = `
          @font-face {
            font-family: '${fontName}';
            src: url('${chrome.runtime.getURL('fonts/' + fontFile)}') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `;
        document.head.appendChild(style);
        // Prüfen, ob Schrift geladen wurde (Font Loading API)
        document.fonts.load('1em "' + fontName + '"').then(() => {
          resolve(fontName);
        }).catch(() => {
          // Fallback: trotzdem verwenden
          resolve(fontName);
        });
      });
    }

    // Schriftartwechsel
    fontSelect.addEventListener('change', async (e) => {
      const val = e.target.value;
      if (val === 'standard') {
        t.windowStyles.fontFamily = 'Inter, system-ui, sans-serif';
      } else if (val === 'font1') {
        await loadCustomFont('CustomFont1', 'font.ttf');
        t.windowStyles.fontFamily = 'CustomFont1, Inter, system-ui, sans-serif';
      } else if (val === 'font2') {
        await loadCustomFont('CustomFont2', 'font2.ttf');
        t.windowStyles.fontFamily = 'CustomFont2, Inter, system-ui, sans-serif';
      }
      t.applyWindowStyles();
    });

    // Funktion zum Aktualisieren der globalen Styles
    function updateGlobalStyles() {
      const bgRgb = hexToRgb(bgColor.value);
      const opacity = parseFloat(opacitySlider.value);
      t.windowStyles.background = `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${opacity})`;

      const textRgb = hexToRgb(textColor.value);
      t.windowStyles.textColor = `rgb(${textRgb.r}, ${textRgb.g}, ${textRgb.b})`;

      const borderRgb = hexToRgb(borderColor.value);
      t.windowStyles.borderColor = `rgb(${borderRgb.r}, ${borderRgb.g}, ${borderRgb.b})`;

      t.windowStyles.borderRadius = radiusSlider.value + 'px';

      const shadowIntensity = shadowSlider.value;
      t.windowStyles.boxShadow = `0 ${shadowIntensity}px ${shadowIntensity * 2}px rgba(0,0,0,0.35)`;

      t.applyWindowStyles();
    }

    // Event-Listener für Steuerelemente
    bgColor.addEventListener('input', updateGlobalStyles);
    opacitySlider.addEventListener('input', () => {
      document.getElementById('opacity-value').textContent = opacitySlider.value;
      updateGlobalStyles();
    });
    textColor.addEventListener('input', updateGlobalStyles);
    borderColor.addEventListener('input', updateGlobalStyles);
    radiusSlider.addEventListener('input', () => {
      document.getElementById('radius-value').textContent = radiusSlider.value;
      updateGlobalStyles();
    });
    shadowSlider.addEventListener('input', () => {
      document.getElementById('shadow-value').textContent = shadowSlider.value;
      updateGlobalStyles();
    });

    // Initiale Werte setzen
    document.getElementById('opacity-value').textContent = opacitySlider.value;
    document.getElementById('radius-value').textContent = radiusSlider.value;
    document.getElementById('shadow-value').textContent = shadowSlider.value;

    // Hauptmenü anzeigen/verstecken
    showCheck.addEventListener('change', (e) => {
      overlay.style.display = e.target.checked ? 'block' : 'none';
      if (!e.target.checked) {
        settingsPanel.style.display = 'none';
      }
    });

    // ------------------------------------------------------------
    // Bestehende Navigationslogik (Seitenwechsel)
    // ------------------------------------------------------------
    let currentPage = 0;
    const modulesPerPage = 3;
    let animating = false;

    function updateNavigation() {
      const totalPages = Math.ceil(moduleButtons.length / modulesPerPage);
      leftArrow.style.display = currentPage > 0 ? 'block' : 'none';
      rightArrow.style.display = currentPage < totalPages - 1 ? 'block' : 'none';

      moduleButtons.forEach((btn, index) => {
        const start = currentPage * modulesPerPage;
        const end = start + modulesPerPage;
        if (btn) btn.style.display = (index >= start && index < end) ? 'block' : 'none';
      });
    }

    function changePage(direction) {
      if (animating) return;
      animating = true;

      const wrapper = overlay.querySelector('div:first-child');
      if (wrapper) wrapper.classList.add('fade');
      setTimeout(() => {
        currentPage += direction;
        updateNavigation();
        if (wrapper) wrapper.classList.remove('fade');
        animating = false;
      }, 200);
    }

    leftArrow.onclick = () => changePage(-1);
    rightArrow.onclick = () => changePage(1);

    updateNavigation();
  };
})();