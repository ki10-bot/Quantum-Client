// content/navigation.js
(function() {
  const t = window.taming;

  t.navigation = function(overlay, moduleButtons) {
    if (!overlay) return;
    if (t.ensureBaseStyles) t.ensureBaseStyles();

    const setI18n = (el, text, attr = 'textContent') => {
      if (!el) return;
      if (typeof t.setI18nText === 'function') {
        t.setI18nText(el, text, attr);
      } else if (!attr || attr === 'textContent') {
        el.textContent = text;
      } else {
        el[attr] = text;
      }
    };

    const modulesWrapper = overlay.querySelector('.qt-modules') || overlay.firstElementChild;
    if (modulesWrapper) {
      modulesWrapper.classList.add('qt-modules');
      modulesWrapper.style.overflow = 'hidden';
      modulesWrapper.style.position = 'relative';
      modulesWrapper.style.display = 'flex';
      modulesWrapper.style.flexWrap = 'nowrap';
      modulesWrapper.style.alignItems = 'center';
      modulesWrapper.style.justifyContent = 'center';
      modulesWrapper.addEventListener('mouseenter', () => pulseModules());
    }

    

    
    
    
    let currentPage = 0;
    let modulesPerPage = t.modulesPerPage || 3;
    let animating = false;

    function updateNavigation() {
      const totalPages = Math.ceil(moduleButtons.length / modulesPerPage);
      if (currentPage < 0) currentPage = 0;
      if (currentPage > totalPages - 1) currentPage = Math.max(0, totalPages - 1);
      leftArrow.style.display = currentPage > 0 ? 'block' : 'none';
      rightArrow.style.display = currentPage < totalPages - 1 ? 'block' : 'none';

      const start = currentPage * modulesPerPage;
      const end = start + modulesPerPage;
      moduleButtons.forEach((btn, index) => {
        if (!btn) return;
        btn.style.display = index >= start && index < end ? '' : 'none';
      });

      if (modulesWrapper) {
        modulesWrapper.style.width = 'auto';
        modulesWrapper.style.marginLeft = 'auto';
        modulesWrapper.style.marginRight = 'auto';
      }
    }

    function changePage(direction) {
      if (animating) return;
      animating = true;
      currentPage += direction;
      updateNavigation();
      pulseModules();
      requestAnimationFrame(() => {
        animating = false;
      });
    }

    function createNavButton(iconName, fallbackText, width, height, iconSize) {
      let btn;
      try {
        btn = t.createIconButton(iconName, width, height, iconSize);
      } catch (e) {
        btn = t.createButton(fallbackText);
        btn.style.width = width + 'px';
        btn.style.height = height + 'px';
        btn.style.fontSize = Math.max(12, Math.floor(height * 0.55)) + 'px';
        btn.style.lineHeight = height + 'px';
        btn.style.padding = '0';
      }
      btn.classList.add('qt-no-drag');
      btn.dataset.role = 'nav';
      btn.addEventListener('mousedown', (e) => e.stopPropagation());
      return btn;
    }

    const leftArrow = createNavButton('left', '◀', 22, 30, 14);
    leftArrow.type = 'button';
    leftArrow.classList.add('nav-arrow', 'left-arrow');
    leftArrow.style.position = 'absolute';
    leftArrow.style.top = '50%';
    leftArrow.style.transform = 'translateY(-50%)';
    leftArrow.style.left = '-11px';
    leftArrow.style.zIndex = '20';
    leftArrow.style.margin = '0';

    const rightArrow = createNavButton('right', '▶', 22, 30, 14);
    rightArrow.type = 'button';
    rightArrow.classList.add('nav-arrow', 'right-arrow');
    rightArrow.style.position = 'absolute';
    rightArrow.style.top = '50%';
    rightArrow.style.transform = 'translateY(-50%)';
    rightArrow.style.right = '-11px';
    rightArrow.style.zIndex = '20';
    rightArrow.style.margin = '0';

    const downBtn = createNavButton('down', '▼', 44, 22, 14);
    downBtn.type = 'button';
    downBtn.classList.add('nav-down');
    downBtn.style.position = 'absolute';
    downBtn.style.bottom = '-20px';
    downBtn.style.left = '50%';
    downBtn.style.transform = 'translateX(-50%)';
    downBtn.style.borderRadius = '0 0 10px 10px';
    downBtn.style.zIndex = '30';
    setI18n(downBtn, 'Einstellungen (Shift+Klick = Control Center)', 'title');

    const styleNavBtn = (btn) => {
      btn.style.borderColor = 'var(--qt-border, rgba(255,255,255,0.12))';
      btn.style.backgroundColor = 'rgba(26, 28, 36, 0.9)';
      btn.style.color = 'var(--qt-text, #eaf1ff)';
    };
    styleNavBtn(leftArrow);
    styleNavBtn(rightArrow);
    styleNavBtn(downBtn);

    overlay.appendChild(leftArrow);
    overlay.appendChild(rightArrow);
    overlay.appendChild(downBtn);

    t.buttons.push(leftArrow, rightArrow, downBtn);
    t.attachKeybind(leftArrow);
    t.attachKeybind(rightArrow);

    let panelReady = false;
    let togglePanel = () => {};
    let lastNavAction = 0;
    let lastPulse = 0;
    const guard = (fn) => (e) => {
      const now = performance.now();
      if (now - lastNavAction < 180) return;
      lastNavAction = now;
      fn(e);
    };

    function handleDownBtn(e) {
      if (e && e.shiftKey && typeof t.toggleQuantumMenu === 'function') {
        t.toggleQuantumMenu(true);
        return;
      }
      if (!panelReady) {
        if (typeof t.toggleQuantumMenu === 'function') t.toggleQuantumMenu(true);
        return;
      }
      togglePanel();
    }

    const bindNavClick = (btn, dir) => {
      btn.addEventListener('click', guard((e) => {
        if (e && e.button !== undefined && e.button !== 0) return;
        changePage(dir);
      }));
      btn.addEventListener('mouseenter', () => pulseModules());
    };

    bindNavClick(leftArrow, -1);
    bindNavClick(rightArrow, 1);
    downBtn.addEventListener('click', guard(handleDownBtn));
    downBtn.addEventListener('mouseenter', () => pulseModules());

    
    overlay.addEventListener('click', guard((e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      if (target.closest('.nav-arrow.left-arrow')) {
        changePage(-1);
      } else if (target.closest('.nav-arrow.right-arrow')) {
        changePage(1);
      } else if (target.closest('.nav-down')) {
        handleDownBtn(e);
      }
    }), true);

    function pulseModules() {
      if (!modulesWrapper) return;
      const now = performance.now();
      if (now - lastPulse < 140) return;
      lastPulse = now;
      modulesWrapper.classList.add('qt-fade');
      requestAnimationFrame(() => {
        modulesWrapper.classList.remove('qt-fade');
        setTimeout(() => {
          modulesWrapper.classList.remove('qt-fade');
        }, 220);
      });
    }

    
    
    
    const settingsPanel = document.createElement('div');
    settingsPanel.className = 'qt-panel qt-no-drag qt-fade-in';
    settingsPanel.style.position = 'absolute';
    settingsPanel.style.top = 'calc(100% + 12px)';
    settingsPanel.style.left = '50%';
    settingsPanel.style.transform = 'translateX(-50%)';
    settingsPanel.style.width = '360px';
    settingsPanel.style.maxWidth = '90vw';
    settingsPanel.style.padding = '12px';
    settingsPanel.style.zIndex = '25';
    settingsPanel.style.display = 'none';
    settingsPanel.style.pointerEvents = 'auto';
    settingsPanel.style.color = t.windowStyles.textColor;
    settingsPanel.style.fontFamily = t.windowStyles.fontFamily;
    settingsPanel.addEventListener('mousedown', (e) => e.stopPropagation());
    settingsPanel.addEventListener('click', (e) => e.stopPropagation());
    overlay.appendChild(settingsPanel);
    panelReady = true;

    const panelHeader = document.createElement('div');
    panelHeader.style.display = 'flex';
    panelHeader.style.alignItems = 'center';
    panelHeader.style.justifyContent = 'space-between';
    panelHeader.style.marginBottom = '8px';
    const panelLeft = document.createElement('div');
    panelLeft.style.display = 'flex';
    panelLeft.style.alignItems = 'center';
    panelLeft.style.gap = '8px';
    const panelLogo = document.createElement('img');
    try {
      panelLogo.src = chrome.runtime.getURL('utils/logo.png');
    } catch (e) {
      panelLogo.src = '';
    }
    panelLogo.alt = 'Quantum Logo';
    panelLogo.style.width = '18px';
    panelLogo.style.height = '18px';
    panelLogo.style.filter = 'drop-shadow(0 0 8px rgba(180,120,255,0.35))';
    const panelTitle = document.createElement('div');
    setI18n(panelTitle, 'Quick Settings');
    panelTitle.style.fontWeight = '600';
    panelTitle.style.letterSpacing = '0.2px';
    panelLeft.appendChild(panelLogo);
    panelLeft.appendChild(panelTitle);
    const panelActions = document.createElement('div');
    panelActions.style.display = 'flex';
    panelActions.style.gap = '6px';

    const openCCBtn = t.createButton('Control Center');
    openCCBtn.style.fontSize = '12px';
    openCCBtn.style.padding = '4px 8px';
    openCCBtn.addEventListener('click', () => {
      if (typeof t.toggleQuantumMenu === 'function') t.toggleQuantumMenu(true);
      togglePanel(false);
    });

    panelActions.appendChild(openCCBtn);
    panelHeader.appendChild(panelLeft);
    panelHeader.appendChild(panelActions);
    settingsPanel.appendChild(panelHeader);

    const panelGrid = document.createElement('div');
    panelGrid.style.display = 'grid';
    panelGrid.style.gridTemplateColumns = '1fr 1fr';
    panelGrid.style.gap = '10px';
    settingsPanel.appendChild(panelGrid);

    const sectionBoxes = [];

    function createSection(title, span) {
      const box = document.createElement('div');
      box.className = 'qt-panel qt-no-drag';
      box.style.padding = '10px';
      box.style.display = 'flex';
      box.style.flexDirection = 'column';
      box.style.gap = '6px';
      if (span === 2) box.style.gridColumn = '1 / 3';
      const heading = document.createElement('div');
      setI18n(heading, title);
      heading.style.fontWeight = '600';
      heading.style.fontSize = '12px';
      heading.style.textTransform = 'uppercase';
      heading.style.letterSpacing = '0.6px';
      heading.style.opacity = '0.8';
      box.appendChild(heading);
      panelGrid.appendChild(box);
      sectionBoxes.push(box);
      return box;
    }

    function createRow(labelText, control) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'space-between';
      row.style.gap = '8px';
      const label = document.createElement('label');
      setI18n(label, labelText);
      label.style.fontSize = '12px';
      label.style.opacity = '0.85';
      label.style.flex = '1';
      row.appendChild(label);
      row.appendChild(control);
      return row;
    }

    function createToggle(initial, onChange) {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = !!initial;
      input.classList.add('qt-no-drag');
      input.addEventListener('change', () => onChange(input.checked));
      return input;
    }

    function createRange(min, max, step, value, onChange) {
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.alignItems = 'center';
      wrap.style.gap = '8px';
      const range = document.createElement('input');
      range.type = 'range';
      range.min = min;
      range.max = max;
      range.step = step;
      range.value = value;
      range.classList.add('qt-no-drag');
      const val = document.createElement('span');
      val.textContent = value;
      val.style.fontSize = '11px';
      val.style.opacity = '0.7';
      range.addEventListener('input', () => {
        val.textContent = range.value;
        onChange(parseFloat(range.value));
      });
      wrap.appendChild(range);
      wrap.appendChild(val);
      return wrap;
    }

    function createColor(value, onChange) {
      const input = document.createElement('input');
      input.type = 'color';
      input.value = value;
      input.classList.add('qt-no-drag');
      input.addEventListener('input', () => onChange(input.value));
      return input;
    }

    function hexToRgb(hex) {
      const cleaned = hex.replace('#', '');
      const full = cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned;
      const num = parseInt(full, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    function rgbToHex(r, g, b) {
      const toHex = (v) => v.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function parseRgba(value, fallback = { r: 15, g: 15, b: 20, a: 0.74 }) {
      if (!value) return fallback;
      if (value.startsWith('#')) {
        const rgb = hexToRgb(value);
        return { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 };
      }
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
      if (!match) return fallback;
      return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: match[4] ? Number(match[4]) : 1 };
    }

    function parseShadow(value, fallback = 14) {
      const match = value && value.match(/0\s+(\d+)px/);
      return match ? Number(match[1]) : fallback;
    }

    function applyPanelTheme() {
      settingsPanel.style.color = t.windowStyles.textColor;
      settingsPanel.style.borderColor = t.windowStyles.borderColor;
      settingsPanel.style.boxShadow = t.windowStyles.boxShadow;
      settingsPanel.style.fontFamily = t.windowStyles.fontFamily;
      sectionBoxes.forEach(box => {
        box.style.color = t.windowStyles.textColor;
        box.style.borderColor = t.windowStyles.borderColor;
        box.style.boxShadow = t.windowStyles.boxShadow;
        box.style.fontFamily = t.windowStyles.fontFamily;
      });
    }

    function applyPanelLanguage() {
      if (typeof t.applyLanguageToScope === 'function') {
        t.applyLanguageToScope(settingsPanel, t.language || 'original');
        t.applyLanguageToScope(downBtn, t.language || 'original');
      }
    }

    
    const uiSection = createSection('UI');
    const bgParsed = parseRgba(t.windowStyles.background);
    const bgColor = createColor(rgbToHex(bgParsed.r, bgParsed.g, bgParsed.b), () => updateStyles());
    const opacitySlider = createRange(0.2, 0.95, 0.05, bgParsed.a || 0.74, () => updateStyles());
    const textParsed = parseRgba(t.windowStyles.textColor, { r: 234, g: 241, b: 255, a: 1 });
    const textColor = createColor(rgbToHex(textParsed.r, textParsed.g, textParsed.b), () => updateStyles());
    const borderParsed = parseRgba(t.windowStyles.borderColor, { r: 255, g: 255, b: 255, a: 0.12 });
    const borderColor = createColor(rgbToHex(borderParsed.r, borderParsed.g, borderParsed.b), () => updateStyles());
    const radiusSlider = createRange(6, 24, 1, parseInt(t.windowStyles.borderRadius, 10) || 16, () => updateStyles());
    const shadowSlider = createRange(6, 28, 1, parseShadow(t.windowStyles.boxShadow, 14), () => updateStyles());
    const accentColor = createColor(t.windowStyles.accent || '#6cf6ff', () => updateStyles());
    const glowSlider = createRange(0.1, 0.6, 0.05, 0.25, () => updateStyles());

    uiSection.appendChild(createRow('Hintergrund', bgColor));
    uiSection.appendChild(createRow('Transparenz', opacitySlider));
    uiSection.appendChild(createRow('Textfarbe', textColor));
    uiSection.appendChild(createRow('Rahmen', borderColor));
    uiSection.appendChild(createRow('Rundung', radiusSlider));
    uiSection.appendChild(createRow('Schatten', shadowSlider));
    uiSection.appendChild(createRow('Accent', accentColor));
    uiSection.appendChild(createRow('Glow', glowSlider));

    function updateStyles() {
      const bgRgb = hexToRgb(bgColor.value);
      const opacity = parseFloat(opacitySlider.querySelector('input')?.value || opacitySlider.firstChild?.value || 0.74);
      t.windowStyles.background = `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${opacity})`;

      const textRgb = hexToRgb(textColor.value);
      t.windowStyles.textColor = `rgb(${textRgb.r}, ${textRgb.g}, ${textRgb.b})`;

      const borderRgb = hexToRgb(borderColor.value);
      t.windowStyles.borderColor = `rgba(${borderRgb.r}, ${borderRgb.g}, ${borderRgb.b}, 0.18)`;

      t.windowStyles.borderRadius = (radiusSlider.querySelector('input')?.value || radiusSlider.firstChild?.value || 16) + 'px';
      const shadowIntensity = parseInt(shadowSlider.querySelector('input')?.value || shadowSlider.firstChild?.value || 14, 10);
      t.windowStyles.boxShadow = `0 ${shadowIntensity}px ${shadowIntensity * 2}px rgba(0,0,0,0.45)`;

      const accent = accentColor.value;
      t.windowStyles.accent = accent;
      const accentRgb = hexToRgb(accent);
      const glow = parseFloat(glowSlider.querySelector('input')?.value || glowSlider.firstChild?.value || 0.25);
      t.windowStyles.accentSoft = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${glow})`;

      t.applyWindowStyles();
      applyPanelTheme();
      if (t.saveSettings) t.saveSettings();
    }

    
    const soundSection = createSection('Sound');
    const soundToggle = createToggle(t.soundEnabled, (val) => { t.soundEnabled = val; if (t.saveSettings) t.saveSettings(); });
    const soundVolume = createRange(0, 1, 0.05, t.soundVolume || 0.65, (val) => { t.soundVolume = val; if (t.saveSettings) t.saveSettings(); });
    const clickToggle = createToggle(t.soundFlags?.click !== false, (val) => { t.soundFlags.click = val; if (t.saveSettings) t.saveSettings(); });
    const hoverToggle = createToggle(t.soundFlags?.hover !== false, (val) => { t.soundFlags.hover = val; if (t.saveSettings) t.saveSettings(); });
    const slideToggle = createToggle(t.soundFlags?.slide !== false, (val) => { t.soundFlags.slide = val; if (t.saveSettings) t.saveSettings(); });
    const checkToggle = createToggle(t.soundFlags?.checkbox !== false, (val) => { t.soundFlags.checkbox = val; if (t.saveSettings) t.saveSettings(); });

    const testClick = t.createButton('Test');
    testClick.style.fontSize = '11px';
    testClick.style.padding = '3px 6px';
    testClick.addEventListener('click', () => t.playSound('click'));

    soundSection.appendChild(createRow('Sound an/aus', soundToggle));
    soundSection.appendChild(createRow('Lautstärke', soundVolume));
    soundSection.appendChild(createRow('Klick', clickToggle));
    soundSection.appendChild(createRow('Hover', hoverToggle));
    soundSection.appendChild(createRow('Slider', slideToggle));
    soundSection.appendChild(createRow('Checkbox', checkToggle));
    soundSection.appendChild(createRow('Test', testClick));

    
    const windowSection = createSection('Fenster');
    const overlayToggle = createToggle(true, (val) => {
      const mainOverlay = document.getElementById('taming-overlay');
      if (!mainOverlay) return;
      if (val) t.showWindow(mainOverlay);
      else t.hideWindow(mainOverlay);
      if (t.saveSettings) t.saveSettings();
    });
    const dragLockToggle = createToggle(t.dragLocked, (val) => { t.dragLocked = val; if (t.saveSettings) t.saveSettings(); });
    const reduceToggle = createToggle(false, (val) => { t.setReducedMotion(val); if (t.saveSettings) t.saveSettings(); });

    const resetBtn = t.createButton('Reset Positionen');
    resetBtn.style.fontSize = '11px';
    resetBtn.style.padding = '4px 6px';
    resetBtn.addEventListener('click', () => { t.resetWindowPositions(); if (t.saveSettings) t.saveSettings(); });

    const hideAllBtn = t.createButton('Alle ausblenden');
    hideAllBtn.style.fontSize = '11px';
    hideAllBtn.style.padding = '4px 6px';
    hideAllBtn.addEventListener('click', () => { t.hideAllWindows(['taming-overlay']); if (t.saveSettings) t.saveSettings(); });

    const showAllBtn = t.createButton('Alle zeigen');
    showAllBtn.style.fontSize = '11px';
    showAllBtn.style.padding = '4px 6px';
    showAllBtn.addEventListener('click', () => { t.showAllWindows(); if (t.saveSettings) t.saveSettings(); });

    windowSection.appendChild(createRow('Hauptmenü', overlayToggle));
    windowSection.appendChild(createRow('Drag Lock', dragLockToggle));
    windowSection.appendChild(createRow('Reduce Motion', reduceToggle));
    windowSection.appendChild(resetBtn);
    windowSection.appendChild(hideAllBtn);
    windowSection.appendChild(showAllBtn);

    
    const navSection = createSection('Navigation');
    const perPageControl = createRange(2, 6, 1, modulesPerPage, (val) => {
      modulesPerPage = Math.max(1, Math.round(val));
      t.modulesPerPage = modulesPerPage;
      if (t.saveSettings) t.saveSettings();
      currentPage = 0;
      updateNavigation();
    });
    navSection.appendChild(createRow('Module pro Seite', perPageControl));

    if (t.whenSettingsLoaded) {
      t.whenSettingsLoaded(() => {
        applyPanelTheme();
        soundToggle.checked = t.soundEnabled;
        const volInput = soundVolume.querySelector('input');
        const volText = soundVolume.querySelector('span');
        if (volInput) volInput.value = t.soundVolume || 0.65;
        if (volText) volText.textContent = t.soundVolume || 0.65;
        clickToggle.checked = t.soundFlags?.click !== false;
        hoverToggle.checked = t.soundFlags?.hover !== false;
        slideToggle.checked = t.soundFlags?.slide !== false;
        checkToggle.checked = t.soundFlags?.checkbox !== false;

        overlayToggle.checked = document.getElementById('taming-overlay')?.style.display !== 'none';
        dragLockToggle.checked = t.dragLocked;
        reduceToggle.checked = document.documentElement.classList.contains('qt-reduced-motion');

        modulesPerPage = t.modulesPerPage || modulesPerPage;
        const perInput = perPageControl.querySelector('input');
        const perText = perPageControl.querySelector('span');
        if (perInput) perInput.value = modulesPerPage;
        if (perText) perText.textContent = modulesPerPage;
        updateNavigation();
        applyPanelLanguage();
      });
    }

    applyPanelTheme();
    applyPanelLanguage();
    panelReady = true;

    window.addEventListener('qt-language-changed', () => {
      applyPanelLanguage();
    });

    function showPanel() {
      settingsPanel.style.display = 'block';
      settingsPanel.classList.add('qt-fade-in');
      applyPanelLanguage();
      requestAnimationFrame(() => settingsPanel.classList.add('qt-show'));
    }

    function hidePanel() {
      settingsPanel.classList.remove('qt-show');
      setTimeout(() => {
        settingsPanel.style.display = 'none';
      }, 180);
    }

    togglePanel = function(force) {
      const isVisible = settingsPanel.style.display !== 'none';
      const next = typeof force === 'boolean' ? force : !isVisible;
      if (next) showPanel();
      else hidePanel();
    };

    downBtn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      t.dragLocked = !t.dragLocked;
      dragLockToggle.checked = t.dragLocked;
      if (t.saveSettings) t.saveSettings();
    });

    

    requestAnimationFrame(() => updateNavigation());
  };
})();
