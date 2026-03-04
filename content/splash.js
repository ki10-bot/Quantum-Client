// content/splash.js
(function() {
  if (window.__splashShown) return;
  window.__splashShown = true;

  const t = window.taming || {};
  const logoUrl = chrome.runtime.getURL('utils/logo.png');
  const soundUrl = chrome.runtime.getURL('utils/startup.mp3');
  const SKIP_LANGUAGE_PROMPT_KEY = 'qt_language_prompt_skip';

  const LANGUAGES = [
    { code: 'original', label: 'Original' },
    { code: 'de', label: 'Deutsch' },
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Russian' },
    { code: 'uk', label: 'Ukrainian' },
    { code: 'fr', label: 'French' },
    { code: 'es', label: 'Spanish' },
    { code: 'it', label: 'Italian' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'tr', label: 'Turkish' },
    { code: 'pl', label: 'Polish' },
    { code: 'nl', label: 'Dutch' },
    { code: 'sv', label: 'Swedish' },
    { code: 'fi', label: 'Finnish' },
    { code: 'da', label: 'Danish' },
    { code: 'no', label: 'Norwegian' },
    { code: 'cs', label: 'Czech' },
    { code: 'sk', label: 'Slovak' },
    { code: 'ro', label: 'Romanian' },
    { code: 'hu', label: 'Hungarian' },
    { code: 'el', label: 'Greek' },
    { code: 'bg', label: 'Bulgarian' },
    { code: 'sr', label: 'Serbian' },
    { code: 'hr', label: 'Croatian' },
    { code: 'sl', label: 'Slovenian' },
    { code: 'lt', label: 'Lithuanian' },
    { code: 'lv', label: 'Latvian' },
    { code: 'et', label: 'Estonian' },
    { code: 'ar', label: 'Arabic' },
    { code: 'he', label: 'Hebrew' },
    { code: 'fa', label: 'Persian' },
    { code: 'hi', label: 'Hindi' },
    { code: 'bn', label: 'Bengali' },
    { code: 'ur', label: 'Urdu' },
    { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'zh-CN', label: 'Chinese (Simplified)' },
    { code: 'zh-TW', label: 'Chinese (Traditional)' },
    { code: 'th', label: 'Thai' },
    { code: 'vi', label: 'Vietnamese' },
    { code: 'id', label: 'Indonesian' },
    { code: 'ms', label: 'Malay' }
  ];

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

  function storageSet(data, callback) {
    try {
      if (chrome?.storage?.local) {
        chrome.storage.local.set(data, callback);
        return;
      }
    } catch (e) {}
    Object.keys(data).forEach((key) => {
      localStorage.setItem(key, JSON.stringify(data[key]));
    });
    if (typeof callback === 'function') callback();
  }

  function getStorageValue(key) {
    return new Promise((resolve) => {
      storageGet(key, (res) => resolve(res ? res[key] : undefined));
    });
  }

  function setStorageValue(data) {
    return new Promise((resolve) => {
      storageSet(data, () => resolve());
    });
  }

  function markIntroDone() {
    if (window.__qtIntroDoneAt) return;
    window.__qtIntroDoneAt = Date.now();
    window.dispatchEvent(new CustomEvent('qt:intro-finished', { detail: { at: window.__qtIntroDoneAt } }));
  }

  function applyLanguageChoice(lang) {
    const chosen = lang || 'original';
    if (typeof t.setLanguage === 'function') {
      t.setLanguage(chosen, { save: true, broadcast: true, translateScope: null });
      return;
    }
    t.language = chosen;
    if (typeof t.saveSettings === 'function') {
      if (t.settingsLoaded) t.saveSettings();
      else if (typeof t.whenSettingsLoaded === 'function') t.whenSettingsLoaded(() => t.saveSettings());
    }
    window.dispatchEvent(new CustomEvent('qt-language-changed', { detail: { lang: chosen } }));
  }

  function loadFont() {
    const fontUrl = chrome.runtime.getURL('fonts/font2.ttf');
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Quantum';
        src: url('${fontUrl}') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  function showLanguagePrompt() {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 10000002;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(circle at 12% 18%, rgba(183, 139, 255, 0.16), transparent 45%),
          radial-gradient(circle at 88% 82%, rgba(120, 255, 190, 0.14), transparent 45%),
          rgba(5, 6, 10, 0.88);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      `;

      const card = document.createElement('div');
      card.style.cssText = `
        width: min(520px, 92vw);
        border: 1px solid rgba(255,255,255,0.16);
        border-radius: 16px;
        background: rgba(14, 16, 22, 0.95);
        box-shadow: 0 24px 58px rgba(0,0,0,0.58);
        color: #eaf1ff;
        font-family: 'Quantum', sans-serif;
        padding: 16px;
      `;

      const title = document.createElement('div');
      title.textContent = 'Sprache waehlen / Choose language';
      title.style.cssText = 'font-size: 20px; font-weight: 700; letter-spacing: 0.2px; margin-bottom: 6px;';

      const sub = document.createElement('div');
      sub.textContent = 'Diese Sprache wird fuer den Guide und UI-Texte genutzt.';
      sub.style.cssText = 'font-size: 12px; opacity: 0.78; margin-bottom: 12px; line-height: 1.45;';

      const select = document.createElement('select');
      select.style.cssText = `
        width: 100%;
        background: rgba(20, 22, 30, 0.9);
        color: #eaf1ff;
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 10px;
        padding: 9px 10px;
        font-size: 13px;
        margin-bottom: 10px;
      `;
      LANGUAGES.forEach((lang) => {
        const opt = document.createElement('option');
        opt.value = lang.code;
        opt.textContent = lang.label;
        select.appendChild(opt);
      });
      select.value = t.language || 'original';

      const checkboxRow = document.createElement('label');
      checkboxRow.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 12px; opacity: 0.88; user-select: none;';
      const dontShow = document.createElement('input');
      dontShow.type = 'checkbox';
      dontShow.style.cssText = 'accent-color: #b78bff;';
      const checkboxText = document.createElement('span');
      checkboxText.textContent = 'Fenster nicht mehr automatisch anzeigen';
      checkboxRow.appendChild(dontShow);
      checkboxRow.appendChild(checkboxText);

      const actions = document.createElement('div');
      actions.style.cssText = 'display: flex; justify-content: flex-end; margin-top: 14px;';
      const continueBtn = document.createElement('button');
      continueBtn.textContent = 'Weiter';
      continueBtn.style.cssText = `
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 10px;
        background: rgba(30, 34, 44, 0.92);
        color: #eaf1ff;
        padding: 7px 12px;
        cursor: pointer;
      `;
      continueBtn.addEventListener('click', () => {
        const selectedLanguage = select.value || 'original';
        const skipNextTime = dontShow.checked;
        overlay.remove();
        resolve({ selectedLanguage, skipNextTime });
      });

      select.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          continueBtn.click();
        }
      });

      actions.appendChild(continueBtn);
      card.appendChild(title);
      card.appendChild(sub);
      card.appendChild(select);
      card.appendChild(checkboxRow);
      card.appendChild(actions);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
      continueBtn.focus();
    });
  }

  async function maybeHandleLanguagePrompt() {
    const skipPrompt = !!(await getStorageValue(SKIP_LANGUAGE_PROMPT_KEY));
    if (skipPrompt) return;
    const result = await showLanguagePrompt();
    if (result && result.selectedLanguage) {
      applyLanguageChoice(result.selectedLanguage);
    }
    if (result && result.skipNextTime) {
      await setStorageValue({ [SKIP_LANGUAGE_PROMPT_KEY]: true });
    } else {
      await setStorageValue({ [SKIP_LANGUAGE_PROMPT_KEY]: false });
    }
  }

  function runSplashSequence() {
    return new Promise((resolve) => {
      
      const audio = document.createElement('audio');
      audio.src = soundUrl;
      audio.preload = 'auto';
      audio.volume = 1.0;
      audio.play().catch((e) => console.warn('Sound konnte nicht abgespielt werden:', e));

      
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        z-index: 10000001;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: opacity 1s ease;
        opacity: 1;
      `;

      
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

      const content = document.createElement('div');
      content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 40px;
        opacity: 0;
        transition: opacity 1s ease;
        z-index: 2;
      `;

      const img = document.createElement('img');
      img.src = logoUrl;
      img.style.cssText = `
        width: 30%;
        max-width: 300px;
        height: auto;
      `;

      const textContainer = document.createElement('div');
      textContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        color: white;
      `;

      const bigText = document.createElement('div');
      bigText.textContent = 'Quantum Client';
      bigText.style.cssText = `
        font-family: 'Quantum', sans-serif;
        font-size: 48px;
        font-weight: bold;
        white-space: nowrap;
      `;

      const smallText = document.createElement('div');
      smallText.textContent = 'By KI10sus and Cipheron';
      smallText.style.cssText = `
        font-family: 'Quantum', sans-serif;
        font-size: 24px;
        margin-top: 10px;
        white-space: nowrap;
      `;

      textContainer.appendChild(bigText);
      textContainer.appendChild(smallText);
      content.appendChild(img);
      content.appendChild(textContainer);
      overlay.appendChild(content);
      document.body.appendChild(overlay);

      const finalize = () => {
        if (overlay && overlay.isConnected) overlay.remove();
        markIntroDone();
        resolve();
      };

      const imgLoader = new Image();
      imgLoader.onload = () => {
        
        setTimeout(() => {
          content.style.opacity = '1';
        }, 1000);

        setTimeout(() => {
          overlay.style.opacity = '0';
        }, 3000);

        setTimeout(() => {
          finalize();
        }, 4000);
      };
      imgLoader.onerror = () => {
        console.error('Logo nicht gefunden:', logoUrl);
        setTimeout(() => {
          overlay.style.opacity = '0';
        }, 2000);
        setTimeout(() => {
          finalize();
        }, 3000);
      };
      imgLoader.src = logoUrl;
    });
  }

  (async () => {
    loadFont();
    try {
      await maybeHandleLanguagePrompt();
      await runSplashSequence();
    } catch (e) {
      markIntroDone();
    }
  })();
})();
