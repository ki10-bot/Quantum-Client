// content/core.js
(function() {
  window.taming = window.taming || {};
  const t = window.taming;

  t.scaled = false;
  t.originalWidth = 0;
  t.originalHeight = 0;
  t.gameCanvas = null;
  t.keybindActive = false;
  t.currentKeybindTarget = null;
  t.buttons = [];
  t.lastMouseX = 0;
  t.lastMouseY = 0;
  t.dragLocked = false;
  t.soundEnabled = true;
  t.soundVolume = 0.65;
  t.soundFlags = { click: true, hover: true, slide: true, checkbox: true };

  t.windows = [];
  t.windowStyles = {
    background: 'rgba(18, 20, 28, 0.74)',
    textColor: '#eaf1ff',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: '16px',
    boxShadow: '0 14px 32px rgba(0,0,0,0.45)',
    fontFamily: 'QuantumUI, CustomFont2, CustomFont1, sans-serif',
    accent: '#b78bff',
    accentSoft: 'rgba(120, 255, 190, 0.25)'
  };
  t.modulesPerPage = 3;
  t.language = 'original';
  t.fontChoice = 'standard';

  t.baseWindowStyles = { ...t.windowStyles };

  t.getDefaultSettings = function() {
    return {
      windowStyles: { ...t.baseWindowStyles },
      soundEnabled: true,
      soundVolume: 0.65,
      soundFlags: { click: true, hover: true, slide: true, checkbox: true },
      dragLocked: false,
      reducedMotion: false,
      fontChoice: 'standard',
      language: 'original',
      modulesPerPage: 3
    };
  };

  t.settingsLoaded = false;
  t.settingsListeners = [];
  t.whenSettingsLoaded = function(fn) {
    if (t.settingsLoaded) fn();
    else t.settingsListeners.push(fn);
  };

  function storageGet(key, callback) {
    try {
      if (chrome?.storage?.local) {
        chrome.storage.local.get(key, callback);
        return;
      }
    } catch (e) {}
    const raw = localStorage.getItem(key);
    callback({ [key]: raw ? JSON.parse(raw) : undefined });
  }

  function storageSet(data) {
    try {
      if (chrome?.storage?.local) {
        chrome.storage.local.set(data);
        return;
      }
    } catch (e) {}
    Object.keys(data).forEach(key => {
      localStorage.setItem(key, JSON.stringify(data[key]));
    });
  }

  function setI18nValue(el, attr, value) {
    if (!el) return;
    if (!attr || attr === 'textContent') {
      el.textContent = value;
      return;
    }
    if (attr === 'html' || attr === 'innerHTML') {
      el.innerHTML = value;
      return;
    }
    if (attr in el) {
      el[attr] = value;
      return;
    }
    el.setAttribute(attr, value);
  }

  const translationCache = (t.translationCache = t.translationCache || {});

  t.translateText = async function(text, lang = t.language || 'original') {
    if (typeof text !== 'string' || !text.trim()) return text;
    if (!lang || lang === 'original') return text;
    if (!translationCache[lang]) translationCache[lang] = {};
    if (translationCache[lang][text]) return translationCache[lang][text];
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const translated = Array.isArray(data?.[0]) ? data[0].map(part => part[0]).join('') : text;
      translationCache[lang][text] = translated || text;
      return translationCache[lang][text];
    } catch (e) {
      return text;
    }
  };

  t.setI18nText = function(el, text, attr = 'textContent') {
    if (!el) return;
    el.dataset.qtText = text;
    el.dataset.qtI18nAttr = attr;
    setI18nValue(el, attr, text);

    const lang = t.language || 'original';
    if (lang === 'original') return;
    const baseText = text;
    t.translateText(baseText, lang).then((translated) => {
      if (!el || !el.isConnected) return;
      if (el.dataset.qtText !== baseText) return;
      if ((el.dataset.qtI18nAttr || 'textContent') !== attr) return;
      setI18nValue(el, attr, translated);
    });
  };

  t.applyLanguageToElements = async function(elements, lang = t.language || 'original') {
    const list = Array.isArray(elements) ? elements : [];
    for (const el of list) {
      if (!el || !el.dataset) continue;
      const base = el.dataset.qtText;
      if (!base) continue;
      const attr = el.dataset.qtI18nAttr || 'textContent';
      if (!lang || lang === 'original') {
        setI18nValue(el, attr, base);
        continue;
      }
      const translated = await t.translateText(base, lang);
      setI18nValue(el, attr, translated);
    }
  };

  t.applyLanguageToScope = async function(root, lang = t.language || 'original') {
    if (!root) return;
    const nodes = [];
    if (root.dataset && root.dataset.qtText) nodes.push(root);
    if (typeof root.querySelectorAll === 'function') {
      nodes.push(...root.querySelectorAll('[data-qt-text]'));
    } else if (root === document) {
      nodes.push(...document.querySelectorAll('[data-qt-text]'));
    }
    await t.applyLanguageToElements(nodes, lang);
  };

  t.setLanguage = async function(lang, { save = true, broadcast = true, translateScope = document } = {}) {
    t.language = lang || 'original';
    if (save) {
      if (t.settingsLoaded) t.saveSettings();
      else t.whenSettingsLoaded(() => t.saveSettings());
    }
    if (translateScope) {
      await t.applyLanguageToScope(translateScope, t.language);
    }
    if (broadcast) {
      window.dispatchEvent(new CustomEvent('qt-language-changed', { detail: { lang: t.language } }));
    }
  };

  t.applySettings = function(settings) {
    if (!settings) return;
    if (settings.windowStyles) {
      Object.assign(t.windowStyles, settings.windowStyles);
    }
    if (typeof settings.soundEnabled === 'boolean') t.soundEnabled = settings.soundEnabled;
    if (typeof settings.soundVolume === 'number') t.soundVolume = settings.soundVolume;
    if (settings.soundFlags) t.soundFlags = { ...t.soundFlags, ...settings.soundFlags };
    if (typeof settings.dragLocked === 'boolean') t.dragLocked = settings.dragLocked;
    if (typeof settings.modulesPerPage === 'number') t.modulesPerPage = settings.modulesPerPage;
    if (typeof settings.fontChoice === 'string') t.fontChoice = settings.fontChoice;
    if (typeof settings.language === 'string') t.language = settings.language;
    if (typeof settings.reducedMotion === 'boolean') t.setReducedMotion(settings.reducedMotion);
    t.applyWindowStyles();
  };

  t.loadCustomFont = function(fontName, fontFile) {
    return new Promise((resolve) => {
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
      if (document.fonts && document.fonts.load) {
        document.fonts.load('1em "' + fontName + '"').then(() => resolve(fontName)).catch(() => resolve(fontName));
      } else {
        resolve(fontName);
      }
    });
  };

  t.saveSettings = function() {
    const payload = {
      windowStyles: { ...t.windowStyles },
      soundEnabled: t.soundEnabled,
      soundVolume: t.soundVolume,
      soundFlags: { ...t.soundFlags },
      dragLocked: t.dragLocked,
      reducedMotion: document.documentElement.classList.contains('qt-reduced-motion'),
      fontChoice: t.fontChoice,
      language: t.language,
      modulesPerPage: t.modulesPerPage
    };
    storageSet({ qt_settings: payload });
  };

  t.loadSettings = function() {
    storageGet('qt_settings', (res) => {
      const defaults = t.getDefaultSettings();
      const merged = { ...defaults, ...(res?.qt_settings || {}) };
      t.applySettings(merged);
      if (t.fontChoice && t.fontChoice !== 'standard') {
        const fontName = 'Custom_' + t.fontChoice.replace(/[^a-zA-Z0-9]/g, '_');
        t.loadCustomFont(fontName, t.fontChoice).then(() => {
          t.windowStyles.fontFamily = `${fontName}, QuantumUI, CustomFont2, CustomFont1, sans-serif`;
          t.applyWindowStyles();
        });
      }
      t.settingsLoaded = true;
      t.settingsListeners.forEach(fn => fn());
      t.settingsListeners = [];
    });
  };

  t.resetSettingsToDefault = function() {
    const defaults = t.getDefaultSettings();
    t.applySettings(defaults);
    t.saveSettings();
  };

  // Basis-Styles und Animationen einmalig injizieren
  t.ensureBaseStyles = function() {
    if (document.getElementById('qt-base-styles')) return;
    const style = document.createElement('style');
    style.id = 'qt-base-styles';
    const fontUrl = chrome.runtime.getURL('fonts/font2.ttf');
    style.textContent = `
      @font-face {
        font-family: 'QuantumUI';
        src: url('${fontUrl}') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }

      .qt-window {
        background: var(--qt-bg, rgba(18, 20, 28, 0.74));
        color: var(--qt-text, #eaf1ff);
        border: 1px solid var(--qt-border, rgba(255,255,255,0.12));
        border-radius: var(--qt-radius, 16px);
        box-shadow: var(--qt-shadow, 0 14px 32px rgba(0,0,0,0.45));
        font-family: var(--qt-font, 'QuantumUI', sans-serif);
        font-size: 13px;
        backdrop-filter: blur(14px) saturate(1.05);
        -webkit-backdrop-filter: blur(14px) saturate(1.05);
        transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease, border-color 220ms ease, opacity 220ms ease, filter 220ms ease;
        animation: qt-pop 240ms ease;
      }

      .qt-window::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        background: linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0));
        opacity: 0.7;
      }

      .qt-window .title {
        font-weight: 600;
        letter-spacing: 0.2px;
        margin-bottom: 8px;
        text-shadow: 0 2px 8px rgba(0,0,0,0.5);
      }

      .qt-window button,
      .qt-window select,
      .qt-window input,
      .qt-window textarea {
        font-family: inherit;
        color: inherit;
        transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease, border-color 140ms ease, color 140ms ease, filter 140ms ease;
      }

      .qt-window button:not(.icon-btn) {
        background: rgba(26, 28, 36, 0.9);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        box-shadow: 0 6px 14px rgba(0,0,0,0.25);
      }

      .qt-window button:not(.icon-btn):hover {
        transform: translateY(-1px);
        border-color: rgba(255,255,255,0.22);
        box-shadow: 0 10px 18px rgba(0,0,0,0.35);
      }

      .qt-window button:not(.icon-btn):active {
        transform: translateY(0);
        filter: brightness(0.98);
      }

      .qt-window button:not(.icon-btn):hover {
        transform: translateY(-1px);
        border-color: rgba(255,255,255,0.22);
        box-shadow: 0 10px 18px rgba(0,0,0,0.35);
        filter: brightness(1.05);
      }

      .qt-window button:not(.icon-btn):active {
        transform: translateY(1px) scale(0.98);
        filter: brightness(0.95);
      }

      .qt-window .icon-btn {
        border-radius: 10px;
        box-shadow: 0 8px 18px rgba(0,0,0,0.35);
        transition: transform 140ms ease, box-shadow 140ms ease, filter 140ms ease;
      }

      .qt-window .icon-btn:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 12px 22px rgba(0,0,0,0.45);
        filter: brightness(1.08);
      }

      .qt-window .icon-btn:active {
        transform: translateY(0) scale(0.98);
        filter: brightness(0.95);
      }

      .qt-window input[type="text"],
      .qt-window input[type="number"],
      .qt-window input[type="password"],
      .qt-window textarea,
      .qt-window select {
        background: rgba(22, 24, 32, 0.9);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 8px;
        padding: 4px 6px;
      }

      .qt-window input[type="text"]:hover,
      .qt-window input[type="number"]:hover,
      .qt-window input[type="password"]:hover,
      .qt-window textarea:hover,
      .qt-window select:hover {
        border-color: rgba(255,255,255,0.22);
      }

      .qt-window select {
        cursor: pointer;
      }

      .qt-window input[type="checkbox"] {
        accent-color: var(--qt-accent, #b78bff);
      }

      .qt-window input[type="range"] {
        -webkit-appearance: none;
        width: 100%;
        background: transparent;
        cursor: pointer;
      }

      .qt-window input[type="range"]::-webkit-slider-runnable-track {
        height: 6px;
        background: linear-gradient(90deg, var(--qt-accent, #b78bff), var(--qt-accent-soft, rgba(120, 255, 190, 0.25)));
        border-radius: 999px;
      }

      .qt-window input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--qt-accent, #b78bff);
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        margin-top: -5px;
        transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
      }

      .qt-window input[type="range"]:active::-webkit-slider-thumb {
        transform: scale(1.15);
        filter: brightness(1.05);
      }

      .qt-window button:focus-visible,
      .qt-window input:focus-visible,
      .qt-window select:focus-visible,
      .qt-window textarea:focus-visible {
        outline: none;
        border-color: var(--qt-accent, #b78bff);
        box-shadow: 0 0 0 2px var(--qt-accent-soft, rgba(120, 255, 190, 0.25));
      }

      @keyframes qt-pop {
        0% { opacity: 0; filter: blur(2px); }
        100% { opacity: 1; filter: blur(0); }
      }

      @media (prefers-reduced-motion: reduce) {
        .qt-window,
        .qt-window * {
          animation: none !important;
          transition: none !important;
        }
      }

      .qt-reduced-motion .qt-window,
      .qt-reduced-motion .qt-window * {
        animation: none !important;
        transition: none !important;
      }

      .qt-close {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(30, 32, 40, 0.9);
        color: #fff;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease, border-color 140ms ease;
        z-index: 5;
      }

      .qt-close:hover {
        transform: scale(1.08);
        border-color: rgba(255,255,255,0.35);
        box-shadow: 0 6px 14px rgba(0,0,0,0.45);
      }

      .qt-close:active {
        transform: scale(0.96);
      }

      .qt-panel {
        background: rgba(18, 20, 28, 0.9);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 14px;
        box-shadow: 0 14px 30px rgba(0,0,0,0.45);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .qt-no-drag {
        cursor: default;
      }

      .qt-fade-in {
        opacity: 0;
        transition: opacity 180ms ease, transform 180ms ease;
        transform: translateY(6px);
      }

      .qt-fade-in.qt-show {
        opacity: 1;
        transform: translateY(0);
      }

      .qt-modules {
        transition: opacity 180ms ease, transform 180ms ease;
      }

      .qt-modules.qt-fade {
        opacity: 0;
        transform: translateY(4px);
      }

      .qt-fade {
        opacity: 0;
        transform: translateY(4px);
      }
    `;
    document.head.appendChild(style);
  };

  t.applyWindowStyles = function() {
    t.windows.forEach(win => {
      if (win && win.style) {
        win.style.background = t.windowStyles.background;
        win.style.color = t.windowStyles.textColor;
        win.style.borderColor = t.windowStyles.borderColor;
        win.style.borderRadius = t.windowStyles.borderRadius;
        win.style.boxShadow = t.windowStyles.boxShadow;
        win.style.fontFamily = t.windowStyles.fontFamily;
        win.style.setProperty('--qt-bg', t.windowStyles.background);
        win.style.setProperty('--qt-text', t.windowStyles.textColor);
        win.style.setProperty('--qt-border', t.windowStyles.borderColor);
        win.style.setProperty('--qt-radius', t.windowStyles.borderRadius);
        win.style.setProperty('--qt-shadow', t.windowStyles.boxShadow);
        win.style.setProperty('--qt-font', t.windowStyles.fontFamily);
        if (t.windowStyles.accent) {
          win.style.setProperty('--qt-accent', t.windowStyles.accent);
        }
        if (t.windowStyles.accentSoft) {
          win.style.setProperty('--qt-accent-soft', t.windowStyles.accentSoft);
        }
      }
    });
    applyGuideTheme();
  };

  t.resetWindowPositions = function() {
    t.windows.forEach(win => {
      if (!win || !win.style) return;
      const top = win.dataset.qtDefaultTop;
      const left = win.dataset.qtDefaultLeft;
      if (top) win.style.top = top;
      if (left) win.style.left = left;
      if (win.id === 'taming-overlay') {
        localStorage.setItem('overlayTop', win.style.top);
        localStorage.setItem('overlayLeft', win.style.left);
      }
    });
  };

  t.hideWindow = function(win) {
    if (!win) return;
    win.style.opacity = '0';
    setTimeout(() => {
      win.style.display = 'none';
      win.style.opacity = '';
    }, 160);
  };

  t.showWindow = function(win) {
    if (!win) return;
    win.style.display = 'block';
    win.style.opacity = '0';
    requestAnimationFrame(() => {
      win.style.opacity = '1';
    });
  };

  t.hideAllWindows = function(exceptIds = []) {
    t.windows.forEach(win => {
      if (!win) return;
      if (exceptIds.includes(win.id)) return;
      t.hideWindow(win);
    });
  };

  t.showAllWindows = function() {
    t.windows.forEach(win => {
      if (!win) return;
      t.showWindow(win);
    });
  };

  t.setReducedMotion = function(enabled) {
    const root = document.documentElement;
    if (!root) return;
    if (enabled) root.classList.add('qt-reduced-motion');
    else root.classList.remove('qt-reduced-motion');
  };

  t.disableWindowClose = function(win) {
    if (!win) return;
    const btn = win.querySelector('.qt-close');
    if (btn) btn.remove();
  };

 
  const commonStyle = `
    position: fixed;
    padding: 12px 14px;
    border-radius: var(--qt-radius, 16px);
    backdrop-filter: blur(12px);
    background: var(--qt-bg, rgba(18, 20, 28, 0.74));
    border: 1px solid var(--qt-border, rgba(255,255,255,0.12));
    color: var(--qt-text, #eaf1ff);
    font-family: var(--qt-font, 'QuantumUI', sans-serif);
    font-size: 13px;
    z-index: 999999;
    cursor: move;
    user-select: none;
    box-shadow: var(--qt-shadow, 0 14px 32px rgba(0,0,0,0.45));
  `;


  t.createWindow = function(titleText, top = '100px', left = '100px', width = '200px', height = 'auto') {
    t.ensureBaseStyles();
    const win = document.createElement('div');
    win.classList.add('qt-window');
    win.style.cssText = commonStyle + `;top:${top};left:${left};width:${width};height:${height}`;
    if (titleText) {
      win.innerHTML = `<div class="title">${titleText}</div>`;
    }
    win.dataset.qtTitle = titleText || 'Window';

    // Globale Styles anwenden (überschreibt commonStyle)
    win.style.background = t.windowStyles.background;
    win.style.color = t.windowStyles.textColor;
    win.style.borderColor = t.windowStyles.borderColor;
    win.style.borderRadius = t.windowStyles.borderRadius;
    win.style.boxShadow = t.windowStyles.boxShadow;
    win.style.fontFamily = t.windowStyles.fontFamily;
    win.style.setProperty('--qt-bg', t.windowStyles.background);
    win.style.setProperty('--qt-text', t.windowStyles.textColor);
    win.style.setProperty('--qt-border', t.windowStyles.borderColor);
    win.style.setProperty('--qt-radius', t.windowStyles.borderRadius);
    win.style.setProperty('--qt-shadow', t.windowStyles.boxShadow);
    win.style.setProperty('--qt-font', t.windowStyles.fontFamily);
    if (t.windowStyles.accent) {
      win.style.setProperty('--qt-accent', t.windowStyles.accent);
    }
    if (t.windowStyles.accentSoft) {
      win.style.setProperty('--qt-accent-soft', t.windowStyles.accentSoft);
    }
    win.dataset.qtDefaultTop = top;
    win.dataset.qtDefaultLeft = left;


    if (titleText && !win.querySelector('.qt-close')) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'qt-close qt-no-drag';
      closeBtn.textContent = 'x';
      closeBtn.title = 'Schließen';
      closeBtn.addEventListener('mousedown', (e) => e.stopPropagation());
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        t.hideWindow(win);
      });
      win.appendChild(closeBtn);
    }

    document.body.appendChild(win);
    t.windows.push(win); 
    t.applyWindowStyles();

    let dragging = false;
    let offsetX = 0, offsetY = 0;

    function getScaledClient(e) {
      let scaleX = 1;
      let scaleY = 1;
      try {
        const bodyRect = document.body.getBoundingClientRect();
        const htmlRect = document.documentElement.getBoundingClientRect();
        const bodyScaleX = bodyRect.width ? bodyRect.width / window.innerWidth : 1;
        const bodyScaleY = bodyRect.height ? bodyRect.height / window.innerHeight : 1;
        const htmlScaleX = htmlRect.width ? htmlRect.width / window.innerWidth : 1;
        const htmlScaleY = htmlRect.height ? htmlRect.height / window.innerHeight : 1;
        scaleX = Math.abs(1 - bodyScaleX) > Math.abs(1 - htmlScaleX) ? bodyScaleX : htmlScaleX;
        scaleY = Math.abs(1 - bodyScaleY) > Math.abs(1 - htmlScaleY) ? bodyScaleY : htmlScaleY;
        if (window.visualViewport && typeof window.visualViewport.scale === 'number') {
          const vScale = window.visualViewport.scale;
          if (Math.abs(1 - vScale) > Math.abs(1 - scaleX)) scaleX = vScale;
          if (Math.abs(1 - vScale) > Math.abs(1 - scaleY)) scaleY = vScale;
        }
      } catch (err) {}
      if (!Number.isFinite(scaleX) || scaleX < 0.5 || scaleX > 2) scaleX = 1;
      if (!Number.isFinite(scaleY) || scaleY < 0.5 || scaleY > 2) scaleY = 1;
      return { x: e.clientX / scaleX, y: e.clientY / scaleY, scaleX, scaleY };
    }
    win.addEventListener('mousedown', e => {
      if (t.dragLocked) return;
 
      let target = e.target;
      if (target && target.nodeType === 3) target = target.parentElement;
      const hasClosest = target && typeof target.closest === 'function';
      const isInteractive = !target ? false : (
                            target.tagName === 'BUTTON' || 
                            target.tagName === 'INPUT' || 
                            target.tagName === 'SELECT' || 
                            target.tagName === 'TEXTAREA' ||
                            target.classList?.contains('qt-close') ||
                            target.classList?.contains('qt-no-drag') ||
                            (hasClosest && (
                              target.closest('button') || 
                              target.closest('.icon-btn') ||
                              target.closest('select') ||
                              target.closest('input[type="range"]') ||
                              target.closest('.qt-close') ||
                              target.closest('.qt-no-drag')
                            ))
                          );
      
      if (isInteractive) {
       
        return;
      }
      
      if (e.button !== 0) return;
      e.preventDefault();
      dragging = true;
      const point = getScaledClient(e);
      const rect = win.getBoundingClientRect();
      const rectLeft = rect.left / point.scaleX;
      const rectTop = rect.top / point.scaleY;
      offsetX = point.x - rectLeft;
      offsetY = point.y - rectTop;
    });

    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      e.preventDefault();

      const point = getScaledClient(e);
      let newLeft = point.x - offsetX;
      let newTop = point.y - offsetY;

      const winWidth = win.offsetWidth;
      const winHeight = win.offsetHeight;
      const viewportWidth = window.innerWidth / point.scaleX;
      const viewportHeight = window.innerHeight / point.scaleY;
      const maxLeft = viewportWidth - winWidth;
      const maxTop = viewportHeight - winHeight;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';

      if (win.id === 'taming-overlay') {
        localStorage.setItem('overlayTop', win.style.top);
        localStorage.setItem('overlayLeft', win.style.left);
      }
    });

    window.addEventListener('mouseup', () => {
      dragging = false;
    });

    return win;
  };


  t.createButton = function(text) {
    const btn = document.createElement('button');
    btn.classList.add('qt-btn');
    if (typeof t.setI18nText === 'function') t.setI18nText(btn, text);
    else btn.textContent = text;
    btn.dataset.label = text;
    btn.style.margin = '4px';
    btn.style.padding = '4px 8px';
    btn.style.borderRadius = '10px';
    btn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    btn.style.background = 'rgba(26, 28, 36, 0.9)';
    btn.style.color = 'var(--qt-text, #eaf1ff)';
    btn.style.cursor = 'pointer';
   
    return btn;
  };


  t.createIconButton = function(iconName, width = 56, height = 65, iconSize = 35) {
    if (!iconName) {
      console.error('createIconButton: Kein iconName übergeben!');
      return null;
    }

    const btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.classList.add('qt-btn', 'qt-icon-btn');
    btn.dataset.icon = iconName;
    btn.dataset.label = iconName;
    btn.style.margin = '4px';
    btn.style.padding = '0';
    btn.style.width = width + 'px';
    btn.style.height = height + 'px';
    btn.style.borderRadius = '10px';
    btn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    btn.style.cursor = 'pointer';
    btn.style.backgroundColor = 'rgba(26, 28, 36, 0.9)';
    btn.style.color = 'var(--qt-text, #eaf1ff)';
    btn.style.fontSize = '20px';
    btn.style.lineHeight = height + 'px';
    btn.style.textAlign = 'center';
    btn.textContent = iconName.charAt(0).toUpperCase(); 
    if (typeof t.setI18nText === 'function') {
      t.setI18nText(btn, iconName, 'title');
    } else {
      btn.title = iconName;
    }

    let baseUrl;
    try {
      baseUrl = chrome.runtime.getURL('icons/');
    } catch (e) {
      baseUrl = '/icons/';
    }

    const normalTexture = `${baseUrl}textur.png`;
    const hoverTexture = `${baseUrl}textur-hover.png`;
    const activeTexture = `${baseUrl}textur-active.png`;
    const icon = `${baseUrl}${iconName}.png`;

    const img = new Image();
    img.onload = () => {
      const textureNormal = new Image();
      textureNormal.onload = () => {
        const textureHover = new Image();
        textureHover.onload = () => {
          const textureActive = new Image();
          textureActive.onload = () => {
            btn.textContent = '';
            btn.style.backgroundImage = `url('${icon}'), url('${normalTexture}')`;
            btn.style.backgroundSize = `${iconSize}px ${iconSize}px, ${width}px ${height}px`;
            btn.style.backgroundPosition = 'center, 0 0';
            btn.style.backgroundRepeat = 'no-repeat';
          };
          textureActive.onerror = () => {
            console.warn('Active-Textur fehlt, verwende Hover als Fallback');
            btn.textContent = '';
            btn.style.backgroundImage = `url('${icon}'), url('${normalTexture}')`;
            btn.style.backgroundSize = `${iconSize}px ${iconSize}px, ${width}px ${height}px`;
          };
          textureActive.src = activeTexture;
        };
        textureHover.onerror = () => console.warn('Hover-Textur fehlt');
        textureHover.src = hoverTexture;
      };
      textureNormal.onerror = () => console.warn('Normale Textur fehlt');
      textureNormal.src = normalTexture;
    };
    img.onerror = () => {
      console.warn(`Icon ${iconName}.png nicht geladen, Fallback-Text aktiv.`);
    };
    img.src = icon;


    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      btn.dataset.pressed = 'true';
      if (btn.style.backgroundImage) {
        btn.style.backgroundImage = `url('${icon}'), url('${activeTexture}')`;
        btn.style.backgroundSize = `${iconSize}px ${iconSize}px, ${width}px ${height}px`;
      }
    });

    btn.addEventListener('mouseup', () => {
      if (btn.dataset.pressed === 'true') {
        btn.dataset.pressed = 'false';
        const isHover = btn.matches(':hover');
        btn.style.backgroundImage = `url('${icon}'), url('${isHover ? hoverTexture : normalTexture}')`;
        btn.style.backgroundSize = `${iconSize}px ${iconSize}px, ${width}px ${height}px`;
      }
    });

    btn.addEventListener('mouseenter', () => {
      if (btn.dataset.pressed !== 'true') {
        btn.style.backgroundImage = `url('${icon}'), url('${hoverTexture}')`;
        btn.style.backgroundSize = `${iconSize}px ${iconSize}px, ${width}px ${height}px`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (btn.dataset.pressed !== 'true') {
        btn.style.backgroundImage = `url('${icon}'), url('${normalTexture}')`;
        btn.style.backgroundSize = `${iconSize}px ${iconSize}px, ${width}px ${height}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      if (btn.dataset.pressed === 'true') {
        btn.dataset.pressed = 'false';
        const isHover = btn.matches(':hover');
        btn.style.backgroundImage = `url('${icon}'), url('${isHover ? hoverTexture : normalTexture}')`;
        btn.style.backgroundSize = `${iconSize}px ${iconSize}px, ${width}px ${height}px`;
      }
    });

    return btn;
  };


  t.attachKeybind = function(button) {
    if (!button) return;
    button.oncontextmenu = e => {
      e.preventDefault();
      t.keybindActive = true;
      t.currentKeybindTarget = button;
      t.keybindBox.style.display = 'block';
      t.keybindBox.textContent = button.dataset.keybind ? 'Current Bind: ' + button.dataset.keybind + ' (Press new key/click)' : 'Press a key or click';
    };
  };

  const GUIDE_AUTOSTART_DISABLED_KEY = 'qt_guide_autostart_disabled';
  const GUIDE_START_DELAY_AFTER_INTRO_MS = 750;
  const guideState = {
    active: false,
    stepIndex: 0,
    steps: [],
    overlay: null,
    bubble: null,
    titleEl: null,
    textEl: null,
    stepEl: null,
    actionEl: null,
    autoStartToggle: null,
    nextBtn: null,
    backBtn: null,
    skipBtn: null,
    closeBtn: null,
    arrow: null,
    highlightEl: null,
    typingToken: 0,
    stepRenderToken: 0,
    actionToken: 0,
    stepReady: true,
    stepWatchCleanup: null,
    savedOverflowXHtml: '',
    savedOverflowXBody: '',
    savedScrollX: 0
  };

  function applyGuideTheme() {
    if (!guideState.bubble) return;
    guideState.bubble.style.setProperty('--qt-bg', t.windowStyles.background || 'rgba(18, 20, 28, 0.9)');
    guideState.bubble.style.setProperty('--qt-text', t.windowStyles.textColor || '#eaf1ff');
    guideState.bubble.style.setProperty('--qt-border', t.windowStyles.borderColor || 'rgba(255,255,255,0.12)');
    guideState.bubble.style.setProperty('--qt-shadow', t.windowStyles.boxShadow || '0 14px 32px rgba(0,0,0,0.45)');
    guideState.bubble.style.fontFamily = t.windowStyles.fontFamily || 'QuantumUI, sans-serif';
    document.documentElement.style.setProperty('--qt-guide-accent', t.windowStyles.accent || '#b78bff');
    document.documentElement.style.setProperty('--qt-guide-accent-soft', t.windowStyles.accentSoft || 'rgba(120, 255, 190, 0.35)');
  }

  function saveGuideAutostartDisabled(disabled) {
    storageSet({ [GUIDE_AUTOSTART_DISABLED_KEY]: !!disabled });
  }

  function getGuideAutostartDisabled(callback) {
    storageGet(GUIDE_AUTOSTART_DISABLED_KEY, (res) => {
      callback(!!(res && res[GUIDE_AUTOSTART_DISABLED_KEY]));
    });
  }

  function runAfterIntroDelay(callback, delayMs = GUIDE_START_DELAY_AFTER_INTRO_MS) {
    if (typeof callback !== 'function') return;
    const doneAt = Number(window.__qtIntroDoneAt || 0);
    if (doneAt > 0) {
      const passed = Date.now() - doneAt;
      const wait = Math.max(0, delayMs - passed);
      setTimeout(callback, wait);
      return;
    }

    let finished = false;
    const run = () => {
      if (finished) return;
      finished = true;
      window.removeEventListener('qt:intro-finished', onIntroDone);
      setTimeout(callback, delayMs);
    };
    const onIntroDone = () => run();
    window.addEventListener('qt:intro-finished', onIntroDone, { once: true });

    // Fallback falls das Intro-Ereignis nicht ankommt
    setTimeout(run, 6500);
  }

  async function localizeGuideStep(step, lang = t.language || 'original') {
    if (!step) return { title: '', text: '' };
    const localized = {
      title: step.title || '',
      text: step.text || '',
      requireAction: null
    };
    if (!step.requireAction) {
      if (!lang || lang === 'original' || typeof t.translateText !== 'function') return localized;
      localized.title = await t.translateText(localized.title, lang);
      localized.text = await t.translateText(localized.text, lang);
      return localized;
    }

    localized.requireAction = {
      hint: step.requireAction.hint || '',
      doneText: step.requireAction.doneText || ''
    };
    if (!lang || lang === 'original' || typeof t.translateText !== 'function') return localized;

    localized.title = await t.translateText(localized.title, lang);
    localized.text = await t.translateText(localized.text, lang);
    if (localized.requireAction.hint) {
      localized.requireAction.hint = await t.translateText(localized.requireAction.hint, lang);
    }
    if (localized.requireAction.doneText) {
      localized.requireAction.doneText = await t.translateText(localized.requireAction.doneText, lang);
    }
    return localized;
  }

  function clearStepWatcher() {
    if (typeof guideState.stepWatchCleanup === 'function') {
      try {
        guideState.stepWatchCleanup();
      } catch (e) {}
    }
    guideState.stepWatchCleanup = null;
  }

  function flashActionHint() {
    if (!guideState.actionEl || guideState.actionEl.style.display === 'none') return;
    guideState.actionEl.classList.add('qt-guide-action-flash');
    setTimeout(() => {
      if (guideState.actionEl) guideState.actionEl.classList.remove('qt-guide-action-flash');
    }, 280);
  }

  function setStepReady(ready, message = '', completed = false) {
    guideState.stepReady = !!ready;
    if (guideState.nextBtn) guideState.nextBtn.disabled = !guideState.stepReady;
    if (!guideState.actionEl) return;
    const baseMessage = message || '';
    guideState.actionToken += 1;
    const token = guideState.actionToken;
    guideState.actionEl.textContent = baseMessage;
    guideState.actionEl.style.display = message ? 'block' : 'none';
    guideState.actionEl.classList.toggle('is-complete', !!completed);
    if (!baseMessage || !t.translateText || !t.language || t.language === 'original') return;
    t.translateText(baseMessage, t.language).then((translated) => {
      if (!guideState.actionEl) return;
      if (guideState.actionToken !== token) return;
      guideState.actionEl.textContent = translated;
    });
  }

  function matchesTarget(target, candidate) {
    if (!target || !candidate) return false;
    if (target === candidate) return true;
    return typeof target.contains === 'function' && target.contains(candidate);
  }

  function isElementVisible(el) {
    if (!el || !el.isConnected) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function createDocumentWatcher(eventName, matcher) {
    return ({ complete }) => {
      const handler = (e) => {
        const target = e.target;
        if (matcher(target, e)) complete();
      };
      document.addEventListener(eventName, handler, true);
      return () => document.removeEventListener(eventName, handler, true);
    };
  }

  function bindStepRequirement(step, target, stepIndex) {
    clearStepWatcher();
    if (!step || !step.requireAction) {
      setStepReady(true, '', false);
      return;
    }

    const req = step.requireAction;
    setStepReady(false, req.hint || 'Bitte kurz ausprobieren, dann mit OK weiter.', false);

    let completed = false;
    const complete = () => {
      if (completed) return;
      if (!guideState.active) return;
      if (guideState.stepIndex !== stepIndex) return;
      completed = true;
      setStepReady(true, req.doneText || 'Perfekt, jetzt mit OK weiter.', true);
    };

    let cleanup = null;
    if (typeof req.watch === 'function') {
      cleanup = req.watch({ target, step, complete });
    } else if (req.type === 'clickTarget' && target) {
      const handler = (e) => {
        if (matchesTarget(target, e.target)) complete();
      };
      target.addEventListener('click', handler, true);
      cleanup = () => target.removeEventListener('click', handler, true);
    } else if (req.type === 'contextTarget' && target) {
      const handler = (e) => {
        if (matchesTarget(target, e.target)) complete();
      };
      target.addEventListener('contextmenu', handler, true);
      cleanup = () => target.removeEventListener('contextmenu', handler, true);
    }

    if (typeof cleanup === 'function') {
      guideState.stepWatchCleanup = cleanup;
    } else {
      setStepReady(true, '', false);
    }
  }

  function ensureGuideStyles() {
    if (document.getElementById('qt-guide-styles')) return;
    const style = document.createElement('style');
    style.id = 'qt-guide-styles';
    style.textContent = `
      .qt-guide-overlay {
        position: fixed;
        inset: 0;
        z-index: 10000050;
        pointer-events: none;
        background: radial-gradient(circle at 20% 12%, rgba(183, 139, 255, 0.08), rgba(0, 0, 0, 0.5) 45%);
      }
      .qt-guide-bubble {
        position: fixed;
        max-width: 360px;
        background: var(--qt-bg, rgba(18, 20, 28, 0.9));
        color: var(--qt-text, #eaf1ff);
        border: 1px solid var(--qt-border, rgba(255,255,255,0.12));
        border-radius: 12px;
        padding: 12px 12px 10px 12px;
        box-shadow: var(--qt-shadow, 0 14px 32px rgba(0,0,0,0.45));
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        pointer-events: auto;
      }
      .qt-guide-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 18px;
        height: 18px;
        line-height: 16px;
        text-align: center;
        border-radius: 50%;
        font-size: 11px;
        padding: 0;
      }
      .qt-guide-title {
        font-weight: 600;
        margin: 0 24px 4px 0;
        letter-spacing: 0.2px;
      }
      .qt-guide-text {
        font-size: 12px;
        line-height: 1.55;
        white-space: pre-wrap;
      }
      .qt-guide-step {
        font-size: 11px;
        opacity: 0.7;
        margin-top: 6px;
      }
      .qt-guide-action {
        display: none;
        margin-top: 8px;
        font-size: 11px;
        line-height: 1.45;
        color: var(--qt-text, #eaf1ff);
        opacity: 0.86;
      }
      .qt-guide-action.is-complete {
        color: var(--qt-guide-accent, #b78bff);
        opacity: 1;
      }
      .qt-guide-action.qt-guide-action-flash {
        animation: qt-guide-flash 280ms ease;
      }
      @keyframes qt-guide-flash {
        0% { transform: translateX(0); }
        20% { transform: translateX(-2px); }
        40% { transform: translateX(2px); }
        60% { transform: translateX(-1px); }
        80% { transform: translateX(1px); }
        100% { transform: translateX(0); }
      }
      .qt-guide-autostart {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-top: 8px;
        font-size: 11px;
        opacity: 0.84;
        user-select: none;
      }
      .qt-guide-autostart input[type="checkbox"] {
        width: 14px;
        height: 14px;
        accent-color: var(--qt-guide-accent, #b78bff);
      }
      .qt-guide-controls {
        display: flex;
        gap: 6px;
        margin-top: 10px;
        justify-content: flex-end;
      }
      .qt-guide-controls button,
      .qt-guide-close {
        background: rgba(255,255,255,0.08);
        color: var(--qt-text, #eaf1ff);
        border: 1px solid var(--qt-border, rgba(255,255,255,0.12));
        border-radius: 8px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 11px;
      }
      .qt-guide-controls button:hover,
      .qt-guide-close:hover {
        border-color: rgba(255,255,255,0.26);
      }
      .qt-guide-controls button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        filter: grayscale(0.15);
      }
      .qt-guide-arrow {
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
      }
      .qt-guide-arrow.top {
        top: -8px;
        border-width: 0 8px 8px 8px;
        border-color: transparent transparent rgba(18, 20, 28, 0.95) transparent;
      }
      .qt-guide-arrow.bottom {
        bottom: -8px;
        border-width: 8px 8px 0 8px;
        border-color: rgba(18, 20, 28, 0.95) transparent transparent transparent;
      }
      .qt-guide-arrow.left {
        left: -8px;
        border-width: 8px 8px 8px 0;
        border-color: transparent rgba(18, 20, 28, 0.95) transparent transparent;
      }
      .qt-guide-arrow.right {
        right: -8px;
        border-width: 8px 0 8px 8px;
        border-color: transparent transparent transparent rgba(18, 20, 28, 0.95);
      }
      .qt-guide-highlight {
        outline: 2px solid var(--qt-guide-accent, #b78bff);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px rgba(0,0,0,0) inset, 0 0 18px var(--qt-guide-accent-soft, rgba(180,120,255,0.35));
      }
    `;
    document.head.appendChild(style);
  }

  function buildGuideOverlay() {
    ensureGuideStyles();
    if (guideState.overlay) return;
    const overlay = document.createElement('div');
    overlay.className = 'qt-guide-overlay';

    const bubble = document.createElement('div');
    bubble.className = 'qt-guide-bubble';
    const arrow = document.createElement('div');
    arrow.className = 'qt-guide-arrow bottom';
    bubble.appendChild(arrow);

    const title = document.createElement('div');
    title.className = 'qt-guide-title';
    const text = document.createElement('div');
    text.className = 'qt-guide-text';
    const step = document.createElement('div');
    step.className = 'qt-guide-step';
    const action = document.createElement('div');
    action.className = 'qt-guide-action';

    const autoStartLabel = document.createElement('label');
    autoStartLabel.className = 'qt-guide-autostart';
    const autoStartToggle = document.createElement('input');
    autoStartToggle.type = 'checkbox';
    autoStartToggle.classList.add('qt-no-drag');
    const autoStartText = document.createElement('span');
    autoStartText.textContent = 'Guide nicht automatisch starten';
    autoStartLabel.appendChild(autoStartToggle);
    autoStartLabel.appendChild(autoStartText);

    const controls = document.createElement('div');
    controls.className = 'qt-guide-controls';
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Zurueck';
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'OK';
    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'Beenden';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'x';
    closeBtn.title = 'Guide schliessen';
    closeBtn.className = 'qt-guide-close';

    controls.appendChild(backBtn);
    controls.appendChild(nextBtn);
    controls.appendChild(skipBtn);

    bubble.appendChild(closeBtn);
    bubble.appendChild(title);
    bubble.appendChild(text);
    bubble.appendChild(step);
    bubble.appendChild(action);
    bubble.appendChild(autoStartLabel);
    bubble.appendChild(controls);

    overlay.appendChild(bubble);
    document.body.appendChild(overlay);

    guideState.overlay = overlay;
    guideState.bubble = bubble;
    guideState.arrow = arrow;
    guideState.titleEl = title;
    guideState.textEl = text;
    guideState.stepEl = step;
    guideState.actionEl = action;
    guideState.autoStartToggle = autoStartToggle;
    guideState.nextBtn = nextBtn;
    guideState.backBtn = backBtn;
    guideState.skipBtn = skipBtn;
    guideState.closeBtn = closeBtn;
    applyGuideTheme();

    const goNext = () => {
      if (guideState.nextBtn && guideState.nextBtn.disabled) {
        flashActionHint();
        return;
      }
      showStep(guideState.stepIndex + 1);
    };

    backBtn.addEventListener('click', () => showStep(guideState.stepIndex - 1));
    nextBtn.addEventListener('click', goNext);
    skipBtn.addEventListener('click', () => t.stopGuideTour(true));
    closeBtn.addEventListener('click', () => t.stopGuideTour(true));
    autoStartToggle.addEventListener('change', () => {
      saveGuideAutostartDisabled(autoStartToggle.checked);
    });
    document.addEventListener('keydown', (e) => {
      if (!guideState.active) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        t.stopGuideTour(true);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showStep(guideState.stepIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    }, true);
    window.addEventListener('resize', () => positionBubble());
    window.addEventListener('scroll', () => positionBubble(), true);
    getGuideAutostartDisabled((disabled) => {
      if (guideState.autoStartToggle) guideState.autoStartToggle.checked = disabled;
    });
  }

  function setHighlight(el) {
    clearHighlight();
    if (!el) return;
    guideState.highlightEl = el;
    el.classList.add('qt-guide-highlight');
  }

  function clearHighlight() {
    if (guideState.highlightEl) {
      guideState.highlightEl.classList.remove('qt-guide-highlight');
      guideState.highlightEl = null;
    }
  }

  function findTab(name) {
    const tab = document.querySelector(`#quantum-menu-overlay [data-qt-tab="${name}"]`);
    return tab;
  }

  function findVisibleModuleButton() {
    const buttons = Array.from(document.querySelectorAll('#taming-overlay .qt-modules button'));
    return buttons.find(btn => isElementVisible(btn)) || buttons[0] || null;
  }

  function findVisibleNavArrow() {
    const right = document.querySelector('#taming-overlay .nav-arrow.right-arrow');
    if (isElementVisible(right)) return right;
    const left = document.querySelector('#taming-overlay .nav-arrow.left-arrow');
    if (isElementVisible(left)) return left;
    const all = Array.from(document.querySelectorAll('#taming-overlay .nav-arrow'));
    return all.find(arrow => isElementVisible(arrow)) || null;
  }

  function buildGuideSteps() {
    const moduleClickWatcher = createDocumentWatcher('click', (target) => {
      const btn = target && typeof target.closest === 'function'
        ? target.closest('#taming-overlay .qt-modules button')
        : null;
      return !!btn;
    });
    const navArrowWatcher = createDocumentWatcher('click', (target) => {
      const arrow = target && typeof target.closest === 'function'
        ? target.closest('#taming-overlay .nav-arrow')
        : null;
      return !!arrow;
    });
    const downBtnWatcher = createDocumentWatcher('click', (target) => {
      const down = target && typeof target.closest === 'function'
        ? target.closest('#taming-overlay .nav-down')
        : null;
      return !!down;
    });
    const keybindWatcher = createDocumentWatcher('contextmenu', (target) => {
      const btn = target && typeof target.closest === 'function'
        ? target.closest('#taming-overlay .qt-modules button')
        : null;
      return !!btn;
    });
    const designTabWatcher = createDocumentWatcher('click', (target) => {
      const tab = target && typeof target.closest === 'function'
        ? target.closest('#quantum-menu-overlay [data-qt-tab="Design"]')
        : null;
      return !!tab;
    });

    return [
      {
        title: 'Main Overlay',
        text: 'Das ist dein Hauptfenster. Hier findest du die schnellen Module.',
        getTarget: () => document.getElementById('taming-overlay')
      },
      {
        title: 'Module',
        text: 'Jeder Button oeffnet ein Modul. Klick, um Funktionen zu aktivieren.',
        getTarget: () => findVisibleModuleButton(),
        requireAction: {
          hint: 'Bitte klicke kurz auf einen Modul-Button, dann kannst du weiter.',
          doneText: 'Modul-Klick erkannt.',
          watch: moduleClickWatcher
        }
      },
      {
        title: 'Blaettern',
        text: 'Mit den Pfeilen wechselst du zwischen Modulseiten.',
        getTarget: () => findVisibleNavArrow(),
        requireAction: {
          hint: 'Bitte einmal auf einen Blatter-Pfeil klicken.',
          doneText: 'Blaettern erkannt.',
          watch: navArrowWatcher
        }
      },
      {
        title: 'Quick Settings',
        text: 'Der Pfeil nach unten oeffnet Schnell-Einstellungen. Shift + Klick oeffnet das Control Center.',
        getTarget: () => document.querySelector('#taming-overlay .nav-down'),
        requireAction: {
          hint: 'Bitte den Pfeil nach unten einmal anklicken.',
          doneText: 'Down-Button erkannt.',
          watch: downBtnWatcher
        }
      },
      {
        title: 'Keybinds',
        text: 'Rechtsklick auf einen Modul-Button setzt einen Keybind.',
        getTarget: () => findVisibleModuleButton(),
        requireAction: {
          hint: 'Bitte jetzt einmal Rechtsklick auf einen Modul-Button machen.',
          doneText: 'Rechtsklick erkannt.',
          watch: keybindWatcher
        }
      },
      {
        title: 'Control Center',
        text: 'Hier stellst du Design, Sound, Fenster und Module ein.',
        onBefore: () => {
          if (t.openQuantumMenu) t.openQuantumMenu();
          if (t.showQuantumTab) t.showQuantumTab('Design');
        },
        getTarget: () => document.querySelector('#quantum-menu-overlay [data-qt-guide="qt-tabs"]')
      },
      {
        title: 'Design Tab',
        text: 'Grundlook, Farben, Transparenz und Glow werden hier gesteuert.',
        onBefore: () => {
          if (t.openQuantumMenu) t.openQuantumMenu();
          if (t.showQuantumTab) t.showQuantumTab('Design');
        },
        getTarget: () => findTab('Design'),
        requireAction: {
          hint: 'Bitte den Design-Tab kurz anklicken.',
          doneText: 'Design-Tab erkannt.',
          watch: designTabWatcher
        }
      },
      {
        title: 'Presets',
        text: 'Schnelle Presets fuer komplette Styles.',
        onBefore: () => {
          if (t.openQuantumMenu) t.openQuantumMenu();
          if (t.showQuantumTab) t.showQuantumTab('Design');
        },
        getTarget: () => document.querySelector('#quantum-menu-overlay [data-qt-guide="qt-presets"]')
      },
      {
        title: 'Schriftart',
        text: 'Waehle eine Font – sie wird live auf alle Fenster angewendet.',
        onBefore: () => {
          if (t.openQuantumMenu) t.openQuantumMenu();
          if (t.showQuantumTab) t.showQuantumTab('Design');
        },
        getTarget: () => document.querySelector('#quantum-menu-overlay #qt-font-select')
      },
      {
        title: 'Sprache',
        text: 'Live-Uebersetzung ueber Google Translate.',
        onBefore: () => {
          if (t.openQuantumMenu) t.openQuantumMenu();
          if (t.showQuantumTab) t.showQuantumTab('Design');
        },
        getTarget: () => document.querySelector('#quantum-menu-overlay #qt-language-select')
      },
      {
        title: 'Sound',
        text: 'Master-Lautstaerke und Effekte anpassen.',
        onBefore: () => {
          if (t.openQuantumMenu) t.openQuantumMenu();
          if (t.showQuantumTab) t.showQuantumTab('Sound');
        },
        getTarget: () => document.querySelector('#quantum-menu-overlay [data-qt-guide="qt-sound"]')
      },
      {
        title: 'Windows',
        text: 'Fenster ein-/ausblenden, Drag-Lock und Motion.',
        onBefore: () => {
          if (t.openQuantumMenu) t.openQuantumMenu();
          if (t.showQuantumTab) t.showQuantumTab('Windows');
        },
        getTarget: () => document.querySelector('#quantum-menu-overlay [data-qt-guide="qt-windows"]')
      },
      {
        title: 'Modules',
        text: 'Uebersicht aller Fenster und Module.',
        onBefore: () => {
          if (t.openQuantumMenu) t.openQuantumMenu();
          if (t.showQuantumTab) t.showQuantumTab('Modules');
        },
        getTarget: () => document.querySelector('#quantum-menu-overlay [data-qt-guide="qt-modules-list"]')
      },
      {
        title: 'Guide erneut',
        text: 'Du kannst den Guide jederzeit im About-Tab starten.',
        onBefore: () => {
          if (t.openQuantumMenu) t.openQuantumMenu();
          if (t.showQuantumTab) t.showQuantumTab('About');
        },
        getTarget: () => document.querySelector('#quantum-menu-overlay [data-qt-guide="qt-guide-button"]')
      },
      {
        title: 'Abschluss',
        text: 'Glueckwunsch. Du hast den kompletten Guide abgeschlossen. Jetzt kennst du Main Overlay und Quantum Control Center.',
        onBefore: () => {
          if (typeof t.closeQuantumMenu === 'function') t.closeQuantumMenu();
        },
        getTarget: () => document.getElementById('taming-overlay')
      }
    ];
  }

  function typeText(text) {
    if (!guideState.textEl) return;
    guideState.typingToken += 1;
    const token = guideState.typingToken;
    guideState.textEl.textContent = '';
    let i = 0;
    const tick = () => {
      if (token !== guideState.typingToken) return;
      guideState.textEl.textContent = text.slice(0, i);
      if (i === 0 || i === text.length || i % 4 === 0) {
        requestAnimationFrame(() => positionBubble());
      }
      if (i < text.length) {
        i += 1;
        setTimeout(tick, 12);
      }
    };
    tick();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function overlapArea(a, b) {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return width * height;
  }

  function candidatePosition(side, targetRect, bubbleRect, viewportWidth, viewportHeight, gap, pad) {
    let idealLeft = targetRect.left + targetRect.width / 2 - bubbleRect.width / 2;
    let idealTop = targetRect.top - bubbleRect.height - gap;
    if (side === 'bottom') idealTop = targetRect.bottom + gap;
    if (side === 'left') {
      idealLeft = targetRect.left - bubbleRect.width - gap;
      idealTop = targetRect.top + targetRect.height / 2 - bubbleRect.height / 2;
    }
    if (side === 'right') {
      idealLeft = targetRect.right + gap;
      idealTop = targetRect.top + targetRect.height / 2 - bubbleRect.height / 2;
    }

    const left = clamp(idealLeft, pad, viewportWidth - bubbleRect.width - pad);
    const top = clamp(idealTop, pad, viewportHeight - bubbleRect.height - pad);
    const rect = {
      left,
      top,
      right: left + bubbleRect.width,
      bottom: top + bubbleRect.height
    };
    const overlap = overlapArea(rect, targetRect);
    const clampedDelta = Math.abs(left - idealLeft) + Math.abs(top - idealTop);
    const centerDist = Math.hypot(
      (left + bubbleRect.width / 2) - (targetRect.left + targetRect.width / 2),
      (top + bubbleRect.height / 2) - (targetRect.top + targetRect.height / 2)
    );

    return {
      side,
      left,
      top,
      score: overlap * 10000 + clampedDelta * 5 + centerDist * 0.2
    };
  }

  function positionBubble() {
    if (!guideState.bubble || !guideState.highlightEl) return;
    const bubble = guideState.bubble;
    const target = guideState.highlightEl;
    const rect = target.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 12;
    const pad = 8;
    const candidates = [
      candidatePosition('top', rect, bubbleRect, vw, vh, gap, pad),
      candidatePosition('bottom', rect, bubbleRect, vw, vh, gap, pad),
      candidatePosition('right', rect, bubbleRect, vw, vh, gap, pad),
      candidatePosition('left', rect, bubbleRect, vw, vh, gap, pad)
    ];
    candidates.sort((a, b) => a.score - b.score);
    const best = candidates[0];

    bubble.style.left = `${best.left}px`;
    bubble.style.top = `${best.top}px`;

    const arrowSide = best.side === 'top'
      ? 'bottom'
      : best.side === 'bottom'
        ? 'top'
        : best.side === 'left'
          ? 'right'
          : 'left';
    if (guideState.arrow) {
      guideState.arrow.className = `qt-guide-arrow ${arrowSide}`;
      guideState.arrow.style.left = '';
      guideState.arrow.style.right = '';
      guideState.arrow.style.top = '';
      guideState.arrow.style.bottom = '';

      if (arrowSide === 'top' || arrowSide === 'bottom') {
        const x = clamp((rect.left + rect.width / 2) - best.left - 8, 12, bubbleRect.width - 20);
        guideState.arrow.style.left = `${x}px`;
      } else {
        const y = clamp((rect.top + rect.height / 2) - best.top - 8, 12, bubbleRect.height - 20);
        guideState.arrow.style.top = `${y}px`;
      }
    }
  }

  function showStep(index, attempt = 0) {
    if (!guideState.active) return;
    if (index < 0) index = 0;
    if (index >= guideState.steps.length) {
      t.stopGuideTour(true);
      return;
    }
    clearStepWatcher();
    clearHighlight();
    guideState.stepIndex = index;
    const step = guideState.steps[index];
    if (step.onBefore) step.onBefore();

    const target = step.getTarget ? step.getTarget() : (step.selector ? document.querySelector(step.selector) : null);
    if (!target) {
      if (attempt < 8) {
        setTimeout(() => showStep(index, attempt + 1), 120);
        return;
      }
      showStep(index + 1, 0);
      return;
    }
    if (typeof target.scrollIntoView === 'function') {
      try {
        target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
      } catch (e) {
        target.scrollIntoView();
      }
    }
    if (window.scrollX !== 0) {
      try {
        window.scrollTo({ left: 0, top: window.scrollY, behavior: 'auto' });
      } catch (e) {
        window.scrollTo(0, window.scrollY);
      }
    }
    setHighlight(target);
    bindStepRequirement(step, target, index);
    const stepRenderToken = ++guideState.stepRenderToken;
    if (guideState.titleEl) guideState.titleEl.textContent = step.title || '';
    if (guideState.stepEl) guideState.stepEl.textContent = `Schritt ${index + 1} / ${guideState.steps.length}`;
    typeText(step.text || '');

    localizeGuideStep(step, t.language || 'original').then((localized) => {
      if (!guideState.active) return;
      if (guideState.stepIndex !== index) return;
      if (guideState.stepRenderToken !== stepRenderToken) return;
      if (guideState.titleEl) guideState.titleEl.textContent = localized.title || step.title || '';
      typeText(localized.text || step.text || '');
      if (localized.requireAction && !guideState.stepReady) {
        setStepReady(false, localized.requireAction.hint || '', false);
      }
    });

    guideState.backBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    guideState.nextBtn.textContent = index === guideState.steps.length - 1 ? 'Fertig' : 'OK';
    requestAnimationFrame(() => positionBubble());
  }

  t.startGuideTour = function({ force = false } = {}) {
    if (guideState.active) {
      if (force) showStep(0);
      return;
    }
    const run = () => {
      buildGuideOverlay();
      guideState.active = true;
      guideState.savedOverflowXHtml = document.documentElement.style.overflowX || '';
      guideState.savedOverflowXBody = document.body.style.overflowX || '';
      guideState.savedScrollX = window.scrollX || 0;
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.overflowX = 'hidden';
      if (window.scrollX !== 0) {
        try {
          window.scrollTo({ left: 0, top: window.scrollY, behavior: 'auto' });
        } catch (e) {
          window.scrollTo(0, window.scrollY);
        }
      }
      guideState.steps = buildGuideSteps();
      guideState.overlay.style.display = 'block';
      showStep(0);
    };
    getGuideAutostartDisabled((disabled) => {
      if (guideState.autoStartToggle) guideState.autoStartToggle.checked = disabled;
      run();
    });
  };

  t.stopGuideTour = function(_markSeen = true) {
    guideState.active = false;
    clearStepWatcher();
    clearHighlight();
    if (guideState.overlay) guideState.overlay.style.display = 'none';
    document.documentElement.style.overflowX = guideState.savedOverflowXHtml;
    document.body.style.overflowX = guideState.savedOverflowXBody;
    if (window.scrollX !== guideState.savedScrollX) {
      try {
        window.scrollTo({ left: guideState.savedScrollX, top: window.scrollY, behavior: 'auto' });
      } catch (e) {
        window.scrollTo(guideState.savedScrollX, window.scrollY);
      }
    }
    guideState.typingToken += 1;
  };

  t.showGuide = function({ force = false } = {}) {
    t.startGuideTour({ force });
  };

  t.maybeShowGuide = function() {
    getGuideAutostartDisabled((disabled) => {
      if (disabled) return;
      runAfterIntroDelay(() => {
        t.startGuideTour({ force: false });
      }, GUIDE_START_DELAY_AFTER_INTRO_MS);
    });
  };

  
  t.keybindBox = null;

  
  document.addEventListener('mousemove', (e) => {
    t.lastMouseX = e.clientX;
    t.lastMouseY = e.clientY;
  });

  
  document.addEventListener('keydown', e => {
    if (t.keybindActive && t.currentKeybindTarget) {
      t.currentKeybindTarget.dataset.keybind = e.code;
      t.keybindBox.style.display = 'none';
      t.keybindActive = false;
      t.currentKeybindTarget = null;
    }
    t.buttons.forEach(btn => { if (btn && btn.dataset && btn.dataset.keybind === e.code) btn.click(); });
  });

  document.addEventListener('mousedown', e => {
    if (t.keybindActive && t.currentKeybindTarget) {
      t.currentKeybindTarget.dataset.keybind = 'Mouse' + e.button;
      t.keybindBox.style.display = 'none';
      t.keybindActive = false;
      t.currentKeybindTarget = null;
    }
    t.buttons.forEach(btn => { if (btn && btn.dataset && btn.dataset.keybind === 'Mouse' + e.button) btn.click(); });
  });

  
  
  const soundFiles = {
    click: 'click.mp3',
    hover: 'hover.mp3',
    slide: 'slide.mp3',
    checkbox: 'checkbox.mp3'
  };

  
  t.sounds = {};
  Object.keys(soundFiles).forEach(key => {
    const url = chrome.runtime.getURL('utils/' + soundFiles[key]);
    t.sounds[key] = new Audio(url);
    t.sounds[key].load(); 
  });

  
  t.audioUnlocked = false;
  function unlockAudio() {
    if (t.audioUnlocked) return;
    t.audioUnlocked = true;
    Object.values(t.sounds).forEach(sound => {
      try {
        const clone = new Audio(sound.src);
        clone.volume = 0;
        clone.play().catch(() => {});
      } catch (e) {}
    });
  }
  document.addEventListener('pointerdown', unlockAudio, { capture: true, once: true });
  document.addEventListener('keydown', unlockAudio, { capture: true, once: true });

  
  t.playSound = function(name, volume = 0.5) {
    if (!t.soundEnabled) return;
    if (t.soundFlags && t.soundFlags[name] === false) return;
    const sound = t.sounds[name];
    if (!sound) return;
    try {
      const clone = new Audio(sound.src);
      const finalVolume = Math.max(0, Math.min(1, volume * (t.soundVolume || 1)));
      clone.volume = finalVolume;
      clone.play().catch(e => {
        
      });
    } catch (e) {
      
    }
  };


  let hoverTimer = null;
  let lastHoverTarget = null;


  document.addEventListener('click', e => {
    const target = e.target;
    if (!target || typeof target.closest !== 'function') return;
    
    if (target.closest('button') || target.closest('.icon-btn') || target.tagName === 'SELECT') {
      t.playSound('click');
    }
  });


  document.addEventListener('mouseover', e => {
    const target = e.target;
    if (!target || typeof target.closest !== 'function') return;
    const interactive = target.closest('button') || target.closest('.icon-btn') || target.closest('select') || target.closest('input');
    if (!interactive) return;
    if (interactive === lastHoverTarget) {
      if (hoverTimer) clearTimeout(hoverTimer);
    }
    lastHoverTarget = interactive;
    hoverTimer = setTimeout(() => {
      t.playSound('hover');
      hoverTimer = null;
    }, 50); 
  });


  document.addEventListener('input', e => {
    if (e.target.type === 'range') {
      t.playSound('slide');
    }
  });


  document.addEventListener('change', e => {
    if (e.target.type === 'checkbox') {
      t.playSound('checkbox');
    }
  });
  t.loadSettings();
})();
