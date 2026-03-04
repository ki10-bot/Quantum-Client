// content/quantum_menu.js
(function() {
  const t = window.taming;

  t.quantumMenu = function() {
    const existing = document.getElementById('quantum-menu-overlay');
    if (existing) existing.remove();
    if (t.ensureBaseStyles) t.ensureBaseStyles();

    if (!document.getElementById('qt-cc-styles')) {
      const style = document.createElement('style');
      style.id = 'qt-cc-styles';
      style.textContent = `
        #quantum-menu-overlay {
          position: fixed;
          inset: 0;
          display: none;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 8% 50%, rgba(170, 120, 255, 0.16), transparent 55%),
                      radial-gradient(circle at 92% 50%, rgba(120, 255, 190, 0.16), transparent 55%),
                      rgba(8, 10, 16, 0.9);
          backdrop-filter: blur(12px) saturate(1.1);
          -webkit-backdrop-filter: blur(12px) saturate(1.1);
          z-index: 10000000;
          opacity: 0;
          transition: opacity 200ms ease;
        }

        #quantum-menu-overlay.qt-show {
          opacity: 1;
        }

        .qt-cc {
          width: min(960px, 92vw);
          max-height: 86vh;
          display: flex;
          flex-direction: column;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(16, 18, 26, 0.92);
          box-shadow: 0 30px 80px rgba(0,0,0,0.55);
          position: relative;
          color: #eaf1ff;
        }

        .qt-cc::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0));
          opacity: 0.6;
        }

        .qt-cc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px 12px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: relative;
          z-index: 2;
        }

        .qt-cc-title {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .qt-cc-sub {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 2px;
        }

        .qt-cc-close {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(30, 32, 40, 0.9);
          color: #fff;
          cursor: pointer;
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
        }

        .qt-cc-close:hover {
          transform: scale(1.08);
          border-color: rgba(255,255,255,0.4);
          box-shadow: 0 6px 14px rgba(0,0,0,0.4);
        }

        .qt-cc-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px 18px;
          position: relative;
          z-index: 2;
        }

        .qt-cc-tab {
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(24, 26, 34, 0.9);
          font-size: 12px;
          color: var(--qt-text, #eaf1ff);
          cursor: pointer;
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background 140ms ease;
        }

        .qt-cc-tab:hover {
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.22);
          box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        }

        .qt-cc-tab.active {
          background: linear-gradient(120deg, rgba(180,120,255,0.2), rgba(120,255,190,0.12));
          border-color: rgba(180,120,255,0.45);
          box-shadow: 0 8px 18px rgba(140,220,190,0.2);
          color: #fff;
        }

        .qt-cc-body {
          padding: 16px 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow: auto;
          position: relative;
          z-index: 2;
        }

        .qt-cc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .qt-cc-card {
          background: rgba(20, 22, 30, 0.9);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 12px 26px rgba(0,0,0,0.35);
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .qt-cc-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(0,0,0,0.45);
        }

        .qt-cc-card-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.7;
          font-weight: 600;
        }

        .qt-cc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-size: 12px;
        }

        .qt-cc-row label {
          flex: 1;
          opacity: 0.85;
        }

        .qt-cc-row input[type="range"] {
          width: 100%;
        }

        .qt-cc-row input[type="checkbox"] {
          transform: scale(1.05);
        }

        .qt-cc input[type="checkbox"] {
          accent-color: var(--qt-accent, #b78bff);
        }

        .qt-cc input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
        }

        .qt-cc input[type="range"]::-webkit-slider-runnable-track {
          height: 6px;
          background: linear-gradient(90deg, var(--qt-accent, #b78bff), var(--qt-accent-soft, rgba(120, 255, 190, 0.25)));
          border-radius: 999px;
        }

        .qt-cc input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--qt-accent, #b78bff);
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          margin-top: -5px;
          transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
        }

        .qt-cc input[type="range"]:active::-webkit-slider-thumb {
          transform: scale(1.12);
        }

        .qt-cc input[type="range"]::-moz-range-track {
          height: 6px;
          background: linear-gradient(90deg, var(--qt-accent, #b78bff), var(--qt-accent-soft, rgba(120, 255, 190, 0.25)));
          border-radius: 999px;
        }

        .qt-cc input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--qt-accent, #b78bff);
          border: none;
        }

        .qt-cc-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .qt-cc-muted {
          opacity: 0.65;
          font-size: 11px;
        }
      `;
      document.head.appendChild(style);
    }

    const i18nElements = [];

    function setText(el, text) {
      if (typeof t.setI18nText === 'function') {
        t.setI18nText(el, text);
      } else {
        el.textContent = text;
        el.dataset.qtText = text;
      }
      i18nElements.push(el);
    }

    async function translateText(text, lang) {
      if (typeof t.translateText === 'function') return t.translateText(text, lang);
      return text;
    }

    async function applyLanguage(lang) {
      if (typeof t.applyLanguageToElements === 'function') {
        await t.applyLanguageToElements(i18nElements, lang);
        return;
      }
      if (!lang || lang === 'original') {
        i18nElements.forEach(el => {
          if (el.dataset.qtText) el.textContent = el.dataset.qtText;
        });
        return;
      }
      for (const el of i18nElements) {
        const base = el.dataset.qtText;
        if (!base) continue;
        const translated = await translateText(base, lang);
        el.textContent = translated;
      }
    }

    const logoUrl = chrome.runtime.getURL('utils/logo.png');

    const overlay = document.createElement('div');
    overlay.id = 'quantum-menu-overlay';
    overlay.classList.add('qt-no-drag');

    const container = document.createElement('div');
    container.className = 'qt-cc qt-no-drag';
    container.style.fontFamily = t.windowStyles.fontFamily;
    container.style.color = t.windowStyles.textColor;
    container.style.setProperty('--qt-accent', t.windowStyles.accent || '#b78bff');
    container.style.setProperty('--qt-accent-soft', t.windowStyles.accentSoft || 'rgba(120, 255, 190, 0.25)');
    overlay.appendChild(container);

    const header = document.createElement('div');
    header.className = 'qt-cc-header';
    const headerLeft = document.createElement('div');
    headerLeft.style.display = 'flex';
    headerLeft.style.alignItems = 'center';
    headerLeft.style.gap = '12px';

    const headerLogo = document.createElement('img');
    headerLogo.src = logoUrl;
    headerLogo.alt = 'Quantum Logo';
    headerLogo.style.width = '36px';
    headerLogo.style.height = '36px';
    headerLogo.style.filter = 'drop-shadow(0 0 12px rgba(180,120,255,0.35))';
    headerLeft.appendChild(headerLogo);
    const title = document.createElement('div');
    title.className = 'qt-cc-title';
    setText(title, 'Quantum Control Center');
    const subtitle = document.createElement('div');
    subtitle.className = 'qt-cc-sub';
    setText(subtitle, 'Design, Sound, Windows, Everything');
    const headerText = document.createElement('div');
    headerText.appendChild(title);
    headerText.appendChild(subtitle);
    headerLeft.appendChild(headerText);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'qt-cc-close';
    closeBtn.textContent = 'x';
    if (typeof t.setI18nText === 'function') t.setI18nText(closeBtn, 'Schliessen', 'title');
    else closeBtn.title = 'Schliessen';
    closeBtn.addEventListener('click', () => closeMenu());
    header.appendChild(headerLeft);
    header.appendChild(closeBtn);
    container.appendChild(header);

    const tabs = document.createElement('div');
    tabs.className = 'qt-cc-tabs';
    tabs.dataset.qtGuide = 'qt-tabs';
    container.appendChild(tabs);

    const body = document.createElement('div');
    body.className = 'qt-cc-body';
    container.appendChild(body);

    const tabNames = ['Design', 'Sound', 'Windows', 'Modules', 'About'];
    const FONT_FILES = ['font.ttf', 'font2.ttf'];
    const LANGUAGES = [
      { code: 'original', label: 'Original' },
      { code: 'af', label: 'Afrikaans' },
      { code: 'sq', label: 'Albanian' },
      { code: 'am', label: 'Amharic' },
      { code: 'ar', label: 'Arabic' },
      { code: 'hy', label: 'Armenian' },
      { code: 'az', label: 'Azerbaijani' },
      { code: 'eu', label: 'Basque' },
      { code: 'be', label: 'Belarusian' },
      { code: 'bn', label: 'Bengali' },
      { code: 'bs', label: 'Bosnian' },
      { code: 'bg', label: 'Bulgarian' },
      { code: 'ca', label: 'Catalan' },
      { code: 'ceb', label: 'Cebuano' },
      { code: 'ny', label: 'Chichewa' },
      { code: 'zh-CN', label: 'Chinese (Simplified)' },
      { code: 'zh-TW', label: 'Chinese (Traditional)' },
      { code: 'co', label: 'Corsican' },
      { code: 'hr', label: 'Croatian' },
      { code: 'cs', label: 'Czech' },
      { code: 'da', label: 'Danish' },
      { code: 'nl', label: 'Dutch' },
      { code: 'en', label: 'English' },
      { code: 'eo', label: 'Esperanto' },
      { code: 'et', label: 'Estonian' },
      { code: 'tl', label: 'Filipino' },
      { code: 'fi', label: 'Finnish' },
      { code: 'fr', label: 'French' },
      { code: 'fy', label: 'Frisian' },
      { code: 'gl', label: 'Galician' },
      { code: 'ka', label: 'Georgian' },
      { code: 'de', label: 'German' },
      { code: 'el', label: 'Greek' },
      { code: 'gu', label: 'Gujarati' },
      { code: 'ht', label: 'Haitian Creole' },
      { code: 'ha', label: 'Hausa' },
      { code: 'haw', label: 'Hawaiian' },
      { code: 'he', label: 'Hebrew' },
      { code: 'hi', label: 'Hindi' },
      { code: 'hmn', label: 'Hmong' },
      { code: 'hu', label: 'Hungarian' },
      { code: 'is', label: 'Icelandic' },
      { code: 'ig', label: 'Igbo' },
      { code: 'id', label: 'Indonesian' },
      { code: 'ga', label: 'Irish' },
      { code: 'it', label: 'Italian' },
      { code: 'ja', label: 'Japanese' },
      { code: 'jv', label: 'Javanese' },
      { code: 'kn', label: 'Kannada' },
      { code: 'kk', label: 'Kazakh' },
      { code: 'km', label: 'Khmer' },
      { code: 'ko', label: 'Korean' },
      { code: 'ku', label: 'Kurdish' },
      { code: 'ky', label: 'Kyrgyz' },
      { code: 'lo', label: 'Lao' },
      { code: 'la', label: 'Latin' },
      { code: 'lv', label: 'Latvian' },
      { code: 'lt', label: 'Lithuanian' },
      { code: 'lb', label: 'Luxembourgish' },
      { code: 'mk', label: 'Macedonian' },
      { code: 'mg', label: 'Malagasy' },
      { code: 'ms', label: 'Malay' },
      { code: 'ml', label: 'Malayalam' },
      { code: 'mt', label: 'Maltese' },
      { code: 'mi', label: 'Maori' },
      { code: 'mr', label: 'Marathi' },
      { code: 'mn', label: 'Mongolian' },
      { code: 'my', label: 'Myanmar (Burmese)' },
      { code: 'ne', label: 'Nepali' },
      { code: 'no', label: 'Norwegian' },
      { code: 'ps', label: 'Pashto' },
      { code: 'fa', label: 'Persian' },
      { code: 'pl', label: 'Polish' },
      { code: 'pt', label: 'Portuguese' },
      { code: 'pa', label: 'Punjabi' },
      { code: 'ro', label: 'Romanian' },
      { code: 'ru', label: 'Russian' },
      { code: 'sm', label: 'Samoan' },
      { code: 'gd', label: 'Scots Gaelic' },
      { code: 'sr', label: 'Serbian' },
      { code: 'st', label: 'Sesotho' },
      { code: 'sn', label: 'Shona' },
      { code: 'sd', label: 'Sindhi' },
      { code: 'si', label: 'Sinhala' },
      { code: 'sk', label: 'Slovak' },
      { code: 'sl', label: 'Slovenian' },
      { code: 'so', label: 'Somali' },
      { code: 'es', label: 'Spanish' },
      { code: 'su', label: 'Sundanese' },
      { code: 'sw', label: 'Swahili' },
      { code: 'sv', label: 'Swedish' },
      { code: 'tg', label: 'Tajik' },
      { code: 'ta', label: 'Tamil' },
      { code: 'te', label: 'Telugu' },
      { code: 'th', label: 'Thai' },
      { code: 'tr', label: 'Turkish' },
      { code: 'uk', label: 'Ukrainian' },
      { code: 'ur', label: 'Urdu' },
      { code: 'uz', label: 'Uzbek' },
      { code: 'vi', label: 'Vietnamese' },
      { code: 'cy', label: 'Welsh' },
      { code: 'xh', label: 'Xhosa' },
      { code: 'yi', label: 'Yiddish' },
      { code: 'yo', label: 'Yoruba' },
      { code: 'zu', label: 'Zulu' }
    ];
    // i18n helpers are defined earlier
    const tabButtons = {};
    const tabContent = {};

    tabNames.forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'qt-cc-tab';
      btn.dataset.qtTab = name;
      setText(btn, name);
      btn.addEventListener('click', () => showTab(name));
      tabs.appendChild(btn);
      tabButtons[name] = btn;

      const content = document.createElement('div');
      content.style.display = 'none';
      content.style.flexDirection = 'column';
      content.style.gap = '12px';
      body.appendChild(content);
      tabContent[name] = content;
    });

    function createCard(titleText, parent, spanFull) {
      const card = document.createElement('div');
      card.className = 'qt-cc-card';
      if (spanFull) card.style.gridColumn = '1 / 3';
      const titleEl = document.createElement('div');
      titleEl.className = 'qt-cc-card-title';
      setText(titleEl, titleText);
      card.appendChild(titleEl);
      parent.appendChild(card);
      return card;
    }

    function createRow(labelText, control) {
      const row = document.createElement('div');
      row.className = 'qt-cc-row';
      const label = document.createElement('label');
      setText(label, labelText);
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
      wrap.className = 'qt-cc-pill';
      const range = document.createElement('input');
      range.type = 'range';
      range.min = min;
      range.max = max;
      range.step = step;
      range.value = value;
      range.classList.add('qt-no-drag');
      const val = document.createElement('span');
      val.className = 'qt-cc-muted';
      val.textContent = value;
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

    function createButton(labelText, onClick) {
      const btn = t.createButton(labelText);
      setText(btn, labelText);
      btn.style.fontSize = '11px';
      btn.style.padding = '5px 8px';
      btn.addEventListener('click', onClick);
      return btn;
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

    function parseRgba(value, fallback) {
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

    function applyTheme() {
      container.style.color = t.windowStyles.textColor;
      container.style.fontFamily = t.windowStyles.fontFamily;
      container.style.borderColor = t.windowStyles.borderColor;
      container.style.boxShadow = t.windowStyles.boxShadow;
      container.style.setProperty('--qt-accent', t.windowStyles.accent || '#b78bff');
      container.style.setProperty('--qt-accent-soft', t.windowStyles.accentSoft || 'rgba(120, 255, 190, 0.25)');
    }

    // ---------------- Design Tab ----------------
    const designGrid = document.createElement('div');
    designGrid.className = 'qt-cc-grid';
    tabContent.Design.appendChild(designGrid);

    const paletteCard = createCard('Palette', designGrid);
    const typographyCard = createCard('Typography', designGrid);
    const languageCard = createCard('Language', designGrid);
    const presetCard = createCard('Presets', designGrid, true);
    presetCard.dataset.qtGuide = 'qt-presets';

    const bgParsed = parseRgba(t.windowStyles.background, { r: 18, g: 20, b: 28, a: 0.74 });
    const textParsed = parseRgba(t.windowStyles.textColor, { r: 234, g: 241, b: 255, a: 1 });
    const borderParsed = parseRgba(t.windowStyles.borderColor, { r: 255, g: 255, b: 255, a: 0.12 });

    const bgColor = createColor(rgbToHex(bgParsed.r, bgParsed.g, bgParsed.b), updateDesign);
    const opacityRange = createRange(0.2, 0.95, 0.05, bgParsed.a || 0.74, updateDesign);
    const textColor = createColor(rgbToHex(textParsed.r, textParsed.g, textParsed.b), updateDesign);
    const borderColor = createColor(rgbToHex(borderParsed.r, borderParsed.g, borderParsed.b), updateDesign);
    const radiusRange = createRange(6, 24, 1, parseInt(t.windowStyles.borderRadius, 10) || 16, updateDesign);
    const shadowRange = createRange(6, 28, 1, parseShadow(t.windowStyles.boxShadow, 14), updateDesign);
    const accentColor = createColor(t.windowStyles.accent || '#b78bff', updateDesign);
    const glowRange = createRange(0.1, 0.6, 0.05, 0.25, updateDesign);

    paletteCard.appendChild(createRow('Hintergrund', bgColor));
    paletteCard.appendChild(createRow('Transparenz', opacityRange));
    paletteCard.appendChild(createRow('Textfarbe', textColor));
    paletteCard.appendChild(createRow('Rahmen', borderColor));
    paletteCard.appendChild(createRow('Rundung', radiusRange));
    paletteCard.appendChild(createRow('Schatten', shadowRange));
    paletteCard.appendChild(createRow('Accent', accentColor));
    paletteCard.appendChild(createRow('Glow', glowRange));

    const fontSelect = document.createElement('select');
    fontSelect.classList.add('qt-no-drag');
    fontSelect.id = 'qt-font-select';

    function buildFontOptions(files) {
      fontSelect.innerHTML = '';
      const fontOptions = [{ value: 'standard', label: 'QuantumUI (Default)' }];
      files.forEach((file) => {
        const label = file.replace('.ttf', '').replace(/[_-]/g, ' ');
        fontOptions.push({ value: file, label: label });
      });
      fontOptions.forEach(optData => {
        const opt = document.createElement('option');
        opt.value = optData.value;
        opt.textContent = optData.label;
        fontSelect.appendChild(opt);
      });
      fontSelect.value = t.fontChoice || 'standard';
    }

    buildFontOptions(FONT_FILES);

    (async () => {
      try {
        const res = await fetch(chrome.runtime.getURL('fonts/fonts.json'));
        const list = await res.json();
        if (Array.isArray(list) && list.length) {
          buildFontOptions(list);
        }
      } catch (e) {
        // fallback to static list
      }
    })();
    typographyCard.appendChild(createRow('Schriftart', fontSelect));

    const languageSelect = document.createElement('select');
    languageSelect.classList.add('qt-no-drag');
    languageSelect.id = 'qt-language-select';
    LANGUAGES.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang.code;
      opt.textContent = lang.label;
      languageSelect.appendChild(opt);
    });
    languageSelect.value = t.language || 'original';
    languageCard.appendChild(createRow('Sprache', languageSelect));

    function loadCustomFont(fontName, fontFile) {
      if (t.loadCustomFont) return t.loadCustomFont(fontName, fontFile);
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
    }

    fontSelect.addEventListener('change', async () => {
      const val = fontSelect.value;
      if (val === 'standard') {
        t.windowStyles.fontFamily = 'QuantumUI, CustomFont2, CustomFont1, sans-serif';
      } else {
        const fontName = 'Custom_' + val.replace(/[^a-zA-Z0-9]/g, '_');
        await loadCustomFont(fontName, val);
        t.windowStyles.fontFamily = `${fontName}, QuantumUI, CustomFont2, CustomFont1, sans-serif`;
      }
      t.fontChoice = val;
      t.applyWindowStyles();
      applyTheme();
      if (t.saveSettings) t.saveSettings();
    });

    languageSelect.addEventListener('change', async () => {
      if (typeof t.setLanguage === 'function') {
        await t.setLanguage(languageSelect.value, { save: true, broadcast: true, translateScope: document });
      } else {
        t.language = languageSelect.value;
        if (t.saveSettings) t.saveSettings();
      }
      await applyLanguage(t.language);
    });

    const presets = document.createElement('div');
    presets.style.display = 'flex';
    presets.style.gap = '8px';
    presets.style.flexWrap = 'wrap';
    const presetGlass = createButton('Glass', () => applyPreset('glass'));
    const presetNoir = createButton('Noir', () => applyPreset('noir'));
    const presetNeon = createButton('Neon', () => applyPreset('neon'));
    const presetAurora = createButton('Aurora', () => applyPreset('aurora'));
    const presetOrchid = createButton('Orchid', () => applyPreset('orchid'));
    const presetForest = createButton('Forest', () => applyPreset('forest'));
    const presetObsidian = createButton('Obsidian', () => applyPreset('obsidian'));
    presets.appendChild(presetGlass);
    presets.appendChild(presetNoir);
    presets.appendChild(presetNeon);
    presets.appendChild(presetAurora);
    presets.appendChild(presetOrchid);
    presets.appendChild(presetForest);
    presets.appendChild(presetObsidian);
    presetCard.appendChild(presets);

    const resetAllBtn = createButton('Reset All', () => {
      if (t.resetSettingsToDefault) t.resetSettingsToDefault();
      syncDesignControls();
      syncSoundControls();
      syncWindowControls();
      applyTheme();
      applyLanguage(t.language || 'original');
    });
    resetAllBtn.style.marginTop = '6px';
    presetCard.appendChild(resetAllBtn);

    function applyPreset(name) {
      if (name === 'glass') {
        t.windowStyles.background = 'rgba(18, 20, 28, 0.74)';
        t.windowStyles.textColor = '#eaf1ff';
        t.windowStyles.borderColor = 'rgba(255,255,255,0.12)';
        t.windowStyles.accent = '#b78bff';
        t.windowStyles.accentSoft = 'rgba(120, 255, 190, 0.25)';
      } else if (name === 'noir') {
        t.windowStyles.background = 'rgba(12, 12, 16, 0.8)';
        t.windowStyles.textColor = '#f0f0f4';
        t.windowStyles.borderColor = 'rgba(255,255,255,0.08)';
        t.windowStyles.accent = '#c7a6ff';
        t.windowStyles.accentSoft = 'rgba(120, 255, 190, 0.22)';
      } else if (name === 'neon') {
        t.windowStyles.background = 'rgba(10, 12, 20, 0.8)';
        t.windowStyles.textColor = '#f1ecff';
        t.windowStyles.borderColor = 'rgba(180, 120, 255, 0.35)';
        t.windowStyles.accent = '#b78bff';
        t.windowStyles.accentSoft = 'rgba(120, 255, 190, 0.3)';
      } else if (name === 'aurora') {
        t.windowStyles.background = 'rgba(14, 18, 24, 0.82)';
        t.windowStyles.textColor = '#eff7f4';
        t.windowStyles.borderColor = 'rgba(120, 255, 190, 0.28)';
        t.windowStyles.accent = '#7df1c8';
        t.windowStyles.accentSoft = 'rgba(183, 139, 255, 0.22)';
      } else if (name === 'orchid') {
        t.windowStyles.background = 'rgba(16, 12, 24, 0.82)';
        t.windowStyles.textColor = '#f4edff';
        t.windowStyles.borderColor = 'rgba(199, 166, 255, 0.28)';
        t.windowStyles.accent = '#d1a8ff';
        t.windowStyles.accentSoft = 'rgba(120, 255, 190, 0.2)';
      } else if (name === 'forest') {
        t.windowStyles.background = 'rgba(10, 16, 14, 0.84)';
        t.windowStyles.textColor = '#e9fff5';
        t.windowStyles.borderColor = 'rgba(120, 255, 190, 0.25)';
        t.windowStyles.accent = '#8dffce';
        t.windowStyles.accentSoft = 'rgba(183, 139, 255, 0.2)';
      } else if (name === 'obsidian') {
        t.windowStyles.background = 'rgba(8, 10, 14, 0.9)';
        t.windowStyles.textColor = '#eae7ff';
        t.windowStyles.borderColor = 'rgba(120, 255, 190, 0.18)';
        t.windowStyles.accent = '#b78bff';
        t.windowStyles.accentSoft = 'rgba(120, 255, 190, 0.18)';
      }
      t.applyWindowStyles();
      applyTheme();
      syncDesignControls();
      if (t.saveSettings) t.saveSettings();
    }

    function updateDesign() {
      const bgRgb = hexToRgb(bgColor.value);
      const opacity = parseFloat(opacityRange.querySelector('input')?.value || 0.74);
      t.windowStyles.background = `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${opacity})`;

      const textRgb = hexToRgb(textColor.value);
      t.windowStyles.textColor = `rgb(${textRgb.r}, ${textRgb.g}, ${textRgb.b})`;

      const borderRgb = hexToRgb(borderColor.value);
      t.windowStyles.borderColor = `rgba(${borderRgb.r}, ${borderRgb.g}, ${borderRgb.b}, 0.18)`;

      const radius = radiusRange.querySelector('input')?.value || 16;
      t.windowStyles.borderRadius = radius + 'px';

      const shadow = shadowRange.querySelector('input')?.value || 14;
      t.windowStyles.boxShadow = `0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.45)`;

      const accent = accentColor.value;
      const accentRgb = hexToRgb(accent);
      const glow = parseFloat(glowRange.querySelector('input')?.value || 0.25);
      t.windowStyles.accent = accent;
      t.windowStyles.accentSoft = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${glow})`;

      t.applyWindowStyles();
      applyTheme();
      if (t.saveSettings) t.saveSettings();
    }

    function syncDesignControls() {
      const bg = parseRgba(t.windowStyles.background, { r: 18, g: 20, b: 28, a: 0.74 });
      bgColor.value = rgbToHex(bg.r, bg.g, bg.b);
      opacityRange.querySelector('input').value = bg.a;
      opacityRange.querySelector('.qt-cc-muted').textContent = bg.a;

      const text = parseRgba(t.windowStyles.textColor, { r: 234, g: 241, b: 255, a: 1 });
      textColor.value = rgbToHex(text.r, text.g, text.b);

      const border = parseRgba(t.windowStyles.borderColor, { r: 255, g: 255, b: 255, a: 0.12 });
      borderColor.value = rgbToHex(border.r, border.g, border.b);

      const radius = parseInt(t.windowStyles.borderRadius, 10) || 16;
      radiusRange.querySelector('input').value = radius;
      radiusRange.querySelector('.qt-cc-muted').textContent = radius;

      const shadow = parseShadow(t.windowStyles.boxShadow, 14);
      shadowRange.querySelector('input').value = shadow;
      shadowRange.querySelector('.qt-cc-muted').textContent = shadow;

      accentColor.value = t.windowStyles.accent || '#b78bff';
      const glowParsed = parseRgba(t.windowStyles.accentSoft || 'rgba(120, 255, 190, 0.25)', { r: 120, g: 255, b: 190, a: 0.25 });
      glowRange.querySelector('input').value = glowParsed.a || 0.25;
      glowRange.querySelector('.qt-cc-muted').textContent = glowParsed.a || 0.25;
      fontSelect.value = t.fontChoice || 'standard';
    }

    // ---------------- Sound Tab ----------------
    const soundGrid = document.createElement('div');
    soundGrid.className = 'qt-cc-grid';
    tabContent.Sound.appendChild(soundGrid);

    const soundCard = createCard('Master', soundGrid);
    soundCard.dataset.qtGuide = 'qt-sound';
    const fxCard = createCard('FX Toggle', soundGrid);

    const soundEnabled = createToggle(t.soundEnabled, (val) => { t.soundEnabled = val; if (t.saveSettings) t.saveSettings(); });
    const soundVolume = createRange(0, 1, 0.05, t.soundVolume || 0.65, (val) => { t.soundVolume = val; if (t.saveSettings) t.saveSettings(); });
    soundCard.appendChild(createRow('Sound an/aus', soundEnabled));
    soundCard.appendChild(createRow('Lautstärke', soundVolume));

    const clickToggle = createToggle(t.soundFlags?.click !== false, (val) => { t.soundFlags.click = val; if (t.saveSettings) t.saveSettings(); });
    const hoverToggle = createToggle(t.soundFlags?.hover !== false, (val) => { t.soundFlags.hover = val; if (t.saveSettings) t.saveSettings(); });
    const slideToggle = createToggle(t.soundFlags?.slide !== false, (val) => { t.soundFlags.slide = val; if (t.saveSettings) t.saveSettings(); });
    const checkToggle = createToggle(t.soundFlags?.checkbox !== false, (val) => { t.soundFlags.checkbox = val; if (t.saveSettings) t.saveSettings(); });

    fxCard.appendChild(createRow('Klick', clickToggle));
    fxCard.appendChild(createRow('Hover', hoverToggle));
    fxCard.appendChild(createRow('Slider', slideToggle));
    fxCard.appendChild(createRow('Checkbox', checkToggle));

    const testCard = createCard('Test', soundGrid, true);
    const testRow = document.createElement('div');
    testRow.style.display = 'flex';
    testRow.style.gap = '8px';
    testRow.appendChild(createButton('Click', () => t.playSound('click')));
    testRow.appendChild(createButton('Hover', () => t.playSound('hover')));
    testRow.appendChild(createButton('Slide', () => t.playSound('slide')));
    testRow.appendChild(createButton('Check', () => t.playSound('checkbox')));
    testCard.appendChild(testRow);

    function syncSoundControls() {
      soundEnabled.checked = t.soundEnabled;
      soundVolume.querySelector('input').value = t.soundVolume || 0.65;
      soundVolume.querySelector('.qt-cc-muted').textContent = t.soundVolume || 0.65;
      clickToggle.checked = t.soundFlags?.click !== false;
      hoverToggle.checked = t.soundFlags?.hover !== false;
      slideToggle.checked = t.soundFlags?.slide !== false;
      checkToggle.checked = t.soundFlags?.checkbox !== false;
    }

    // ---------------- Windows Tab ----------------
    const windowGrid = document.createElement('div');
    windowGrid.className = 'qt-cc-grid';
    tabContent.Windows.appendChild(windowGrid);

    const windowCard = createCard('Fenster', windowGrid);
    windowCard.dataset.qtGuide = 'qt-windows';
    const actionsCard = createCard('Aktionen', windowGrid);

    const overlayToggle = createToggle(true, (val) => {
      const mainOverlay = document.getElementById('taming-overlay');
      if (!mainOverlay) return;
      if (val) t.showWindow(mainOverlay);
      else t.hideWindow(mainOverlay);
      if (t.saveSettings) t.saveSettings();
    });
    const dragToggle = createToggle(t.dragLocked, (val) => { t.dragLocked = val; if (t.saveSettings) t.saveSettings(); });
    const reduceToggle = createToggle(false, (val) => { t.setReducedMotion(val); if (t.saveSettings) t.saveSettings(); });

    windowCard.appendChild(createRow('Hauptmenü', overlayToggle));
    windowCard.appendChild(createRow('Drag Lock', dragToggle));
    windowCard.appendChild(createRow('Reduce Motion', reduceToggle));

    actionsCard.appendChild(createButton('Reset Positionen', () => { t.resetWindowPositions(); if (t.saveSettings) t.saveSettings(); }));
    actionsCard.appendChild(createButton('Alle ausblenden', () => { t.hideAllWindows(['taming-overlay']); if (t.saveSettings) t.saveSettings(); }));
    actionsCard.appendChild(createButton('Alle zeigen', () => { t.showAllWindows(); if (t.saveSettings) t.saveSettings(); }));

    function syncWindowControls() {
      overlayToggle.checked = document.getElementById('taming-overlay')?.style.display !== 'none';
      dragToggle.checked = t.dragLocked;
      reduceToggle.checked = document.documentElement.classList.contains('qt-reduced-motion');
    }

    // ---------------- Modules Tab ----------------
    const modulesWrapper = document.createElement('div');
    modulesWrapper.style.display = 'flex';
    modulesWrapper.style.flexDirection = 'column';
    modulesWrapper.style.gap = '8px';
    modulesWrapper.dataset.qtGuide = 'qt-modules-list';
    tabContent.Modules.appendChild(modulesWrapper);

    function renderWindowList() {
      modulesWrapper.innerHTML = '';
      const list = Array.isArray(t.windows) ? t.windows : [];
      if (!list.length) {
        const empty = document.createElement('div');
        empty.className = 'qt-cc-muted';
        setText(empty, 'Keine Fenster gefunden.');
        modulesWrapper.appendChild(empty);
        return;
      }
      list.forEach(win => {
        const row = document.createElement('div');
        row.className = 'qt-cc-card';
        row.style.flexDirection = 'row';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'space-between';
        row.style.gap = '12px';
        row.style.padding = '10px 12px';
        const name = win.dataset.qtTitle || win.querySelector('.title')?.textContent || win.id || 'Window';
        const label = document.createElement('div');
        setText(label, name);
        label.style.fontSize = '12px';
        label.style.flex = '1';
        const toggle = createToggle(win.style.display !== 'none', (val) => {
          if (val) t.showWindow(win);
          else t.hideWindow(win);
        });
        const focusBtn = createButton('Fokus', () => {
          win.style.zIndex = '10000001';
          setTimeout(() => { win.style.zIndex = ''; }, 300);
        });
        focusBtn.style.padding = '4px 6px';
        row.appendChild(label);
        row.appendChild(toggle);
        row.appendChild(focusBtn);
        modulesWrapper.appendChild(row);
      });
    }

    // ---------------- About Tab ----------------
    const aboutCard = document.createElement('div');
    aboutCard.className = 'qt-cc-card';
    const aboutTitle = document.createElement('div');
    aboutTitle.className = 'qt-cc-card-title';
    setText(aboutTitle, 'Quantum Client');
    const aboutRow = document.createElement('div');
    aboutRow.style.display = 'flex';
    aboutRow.style.alignItems = 'center';
    aboutRow.style.gap = '14px';
    const aboutLogo = document.createElement('img');
    aboutLogo.src = logoUrl;
    aboutLogo.alt = 'Quantum Logo';
    aboutLogo.style.width = '64px';
    aboutLogo.style.height = '64px';
    aboutLogo.style.filter = 'drop-shadow(0 0 18px rgba(120,255,190,0.35))';
    const aboutText = document.createElement('div');
    const aboutLine = document.createElement('div');
    aboutLine.style.fontSize = '13px';
    aboutLine.style.lineHeight = '1.5';
    setText(aboutLine, 'Dein Kontrollzentrum fuer Design, Sound und Fenster.');
    const aboutVersion = document.createElement('div');
    aboutVersion.className = 'qt-cc-muted';
    setText(aboutVersion, 'Version 1.0');
    aboutText.appendChild(aboutLine);
    aboutText.appendChild(aboutVersion);
    aboutRow.appendChild(aboutLogo);
    aboutRow.appendChild(aboutText);
    aboutCard.appendChild(aboutTitle);
    aboutCard.appendChild(aboutRow);
    tabContent.About.appendChild(aboutCard);

    const guideCard = createCard('Guide', tabContent.About);
    const guideText = document.createElement('div');
    guideText.className = 'qt-cc-muted';
    setText(guideText, 'Kurze Einfuehrung fuer Bedienung, Sprache und Keybinds.');
    const guideBtn = createButton('Guide oeffnen', () => {
      if (typeof t.closeQuantumMenu === 'function') {
        t.closeQuantumMenu();
      }
      setTimeout(() => {
        if (typeof t.showGuide === 'function') {
          t.showGuide({ force: true });
        }
      }, 230);
    });
    guideBtn.dataset.qtGuide = 'qt-guide-button';
    guideBtn.style.alignSelf = 'flex-start';
    guideCard.appendChild(guideText);
    guideCard.appendChild(guideBtn);

    function showTab(name) {
      tabNames.forEach(tab => {
        tabButtons[tab].classList.toggle('active', tab === name);
        tabContent[tab].style.display = tab === name ? 'flex' : 'none';
      });
      if (name === 'Modules') renderWindowList();
    }

    t.showQuantumTab = showTab;

    window.addEventListener('qt-language-changed', () => {
      applyLanguage(t.language || 'original');
    });

    if (t.whenSettingsLoaded) {
      t.whenSettingsLoaded(() => {
        syncDesignControls();
        syncSoundControls();
        syncWindowControls();
        if (overlay.style.display !== 'none') applyLanguage(t.language || 'original');
      });
    }

    function openMenu() {
      overlay.style.display = 'flex';
      requestAnimationFrame(() => overlay.classList.add('qt-show'));
      syncDesignControls();
      syncSoundControls();
      syncWindowControls();
      renderWindowList();
      applyLanguage(t.language || 'original');
    }

    function closeMenu() {
      overlay.classList.remove('qt-show');
      setTimeout(() => { overlay.style.display = 'none'; }, 200);
    }

    t.openQuantumMenu = openMenu;
    t.closeQuantumMenu = closeMenu;
    t.toggleQuantumMenu = function(forceOpen) {
      const isOpen = overlay.style.display !== 'none';
      if (forceOpen === true) return openMenu();
      if (forceOpen === false) return closeMenu();
      if (isOpen) closeMenu();
      else openMenu();
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display !== 'none') {
        closeMenu();
      }
      const isRightShift = e.code === 'ShiftRight' || (e.key === 'Shift' && e.location === 2);
      if (isRightShift && !e.repeat) {
        if (t.keybindActive) return;
        if (overlay.style.display === 'none') openMenu();
        else closeMenu();
      }
    }, true);

    showTab('Design');
    document.body.appendChild(overlay);
  };
})();
