// content/core.js
(function() {
  // Gemeinsame Variablen
  window.taming = window.taming || {};
  const t = window.taming;

  t.scaled = false;
  t.originalWidth = 0;
  t.originalHeight = 0;
  t.gameCanvas = null;
  t.keybindActive = false;
  t.currentKeybindTarget = null;
  t.buttons = []; // Alle Buttons, die Keybinds unterstützen
  t.lastMouseX = 0;
  t.lastMouseY = 0;

  // Liste aller Fenster für globales Styling
  t.windows = [];
  t.windowStyles = {
    background: 'rgba(15, 15, 20, 0.65)',
    textColor: '#e6e6e6',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: '14px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
    fontFamily: 'Inter, system-ui, sans-serif'
  };

  // Funktion zum Aktualisieren aller Fenster
  t.applyWindowStyles = function() {
    t.windows.forEach(win => {
      if (win && win.style) {
        win.style.background = t.windowStyles.background;
        win.style.color = t.windowStyles.textColor;
        win.style.borderColor = t.windowStyles.borderColor;
        win.style.borderRadius = t.windowStyles.borderRadius;
        win.style.boxShadow = t.windowStyles.boxShadow;
        win.style.fontFamily = t.windowStyles.fontFamily;
      }
    });
  };

  // Gemeinsamer Style für Fenster (wird als Basis verwendet, aber durch t.windowStyles überschrieben)
  const commonStyle = `
    position: fixed;
    padding: 12px 14px;
    border-radius: 14px;
    backdrop-filter: blur(10px);
    background: rgba(15, 15, 20, 0.65);
    border: 1px solid rgba(255,255,255,0.08);
    color: #e6e6e6;
    font-family: Inter, system-ui, sans-serif;
    font-size: 13px;
    z-index: 999999;
    cursor: move;
    user-select: none;
    box-shadow: 0 10px 25px rgba(0,0,0,0.35);
  `;

  // Fenster erstellen (mit Viewport-Begrenzung)
  t.createWindow = function(titleText, top = '100px', left = '100px', width = '200px', height = 'auto') {
    const win = document.createElement('div');
    win.style.cssText = commonStyle + `;top:${top};left:${left};width:${width};height:${height}`;
    if (titleText) {
      win.innerHTML = `<div class="title">${titleText}</div>`;
    }

    // Globale Styles anwenden (überschreibt commonStyle)
    win.style.background = t.windowStyles.background;
    win.style.color = t.windowStyles.textColor;
    win.style.borderColor = t.windowStyles.borderColor;
    win.style.borderRadius = t.windowStyles.borderRadius;
    win.style.boxShadow = t.windowStyles.boxShadow;
    win.style.fontFamily = t.windowStyles.fontFamily;

    document.body.appendChild(win);
    t.windows.push(win); // In die Liste aufnehmen

    let dragging = false;
    let offsetX = 0, offsetY = 0;

    win.addEventListener('mousedown', e => {
      // Prüfen, ob das geklickte Element ein interaktives Element ist
      const target = e.target;
      const isInteractive = target.tagName === 'BUTTON' || 
                            target.tagName === 'INPUT' || 
                            target.tagName === 'SELECT' || 
                            target.tagName === 'TEXTAREA' ||
                            target.closest('button') || 
                            target.closest('.icon-btn') ||
                            target.closest('select') ||
                            target.closest('input[type="range"]');
      
      if (isInteractive) {
        // Wenn interaktiv, nicht draggen – aber auch nicht verhindern
        return;
      }
      
      if (e.button !== 0) return;
      e.preventDefault();
      dragging = true;
      const rect = win.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });

    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      e.preventDefault();

      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      const winWidth = win.offsetWidth;
      const winHeight = win.offsetHeight;
      const maxLeft = window.innerWidth - winWidth;
      const maxTop = window.innerHeight - winHeight;
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

  // Normalen Text-Button erstellen
  t.createButton = function(text) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.margin = '4px';
    btn.style.padding = '4px 8px';
    btn.style.borderRadius = '6px';
    btn.style.border = 'none';
    btn.style.background = 'rgba(20,20,25,0.8)';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    // wird später dem overlay hinzugefügt
    return btn;
  };

  // Icon-Button mit Texturen erstellen
  t.createIconButton = function(iconName, width = 56, height = 65, iconSize = 35) {
    if (!iconName) {
      console.error('createIconButton: Kein iconName übergeben!');
      return null;
    }

    const btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.dataset.icon = iconName;
    btn.style.margin = '4px';
    btn.style.padding = '0';
    btn.style.width = width + 'px';
    btn.style.height = height + 'px';
    btn.style.borderRadius = '6px';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.backgroundColor = '#333';
    btn.style.color = '#fff';
    btn.style.fontSize = '20px';
    btn.style.lineHeight = height + 'px';
    btn.style.textAlign = 'center';
    btn.textContent = iconName.charAt(0).toUpperCase(); // Fallback

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

    // Zustandsverwaltung
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

  // Keybind-Funktion (wird später an Buttons gehängt)
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

  // Keybind-Fenster (wird später in main.js erstellt, hier nur Referenz)
  t.keybindBox = null;

  // Mausposition verfolgen
  document.addEventListener('mousemove', (e) => {
    t.lastMouseX = e.clientX;
    t.lastMouseY = e.clientY;
  });

  // Globale Key- und Maus-Listener für Keybinds (werden einmal registriert)
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

  // ==================== SOUND-EFFECTS (GLOBAL) ====================
// Lade die Sound-Dateien (sie müssen im utils-Ordner liegen)
const soundFiles = {
  click: 'click.mp3',
  hover: 'hover.mp3',
  slide: 'slide.mp3',
  checkbox: 'checkbox.mp3'
};

// Audio-Objekte vorbereiten (nicht abspielen, nur laden)
t.sounds = {};
Object.keys(soundFiles).forEach(key => {
  const url = chrome.runtime.getURL('utils/' + soundFiles[key]);
  t.sounds[key] = new Audio(url);
  t.sounds[key].load(); // optional, lädt die Datei vor
});

// Hilfsfunktion zum Abspielen (mit Klon, um Mehrfachwiedergabe zu erlauben)
t.playSound = function(name, volume = 0.5) {
  const sound = t.sounds[name];
  if (!sound) return;
  try {
    const clone = new Audio(sound.src);
    clone.volume = volume;
    clone.play().catch(e => {
      // Autoplay blockiert? – ignorieren
    });
  } catch (e) {
    // Fallback
  }
};

// Hover-Entprellung: Verhindert, dass bei schnellem Drüberfahren 100 Sounds losgehen
let hoverTimer = null;
let lastHoverTarget = null;

// Globaler Click-Listener (für Buttons, Selects, etc.)
document.addEventListener('click', e => {
  const target = e.target;
  // Prüfe, ob das Element ein Button, Icon-Button oder Select ist
  if (target.closest('button') || target.closest('.icon-btn') || target.tagName === 'SELECT') {
    t.playSound('click');
  }
});

// Hover-Listener (mit kleiner Verzögerung)
document.addEventListener('mouseenter', e => {
  const target = e.target;
  // Nur bei interaktiven Elementen
  if (!target.closest('button') && !target.closest('.icon-btn') && !target.closest('select') && !target.closest('input')) return;
  // Wenn das gleiche Element wie beim letzten Mal, Timer zurücksetzen
  if (target === lastHoverTarget) {
    if (hoverTimer) clearTimeout(hoverTimer);
  }
  lastHoverTarget = target;
  hoverTimer = setTimeout(() => {
    t.playSound('hover');
    hoverTimer = null;
  }, 50); // 50 ms Verzögerung
});

// Input-Listener für Slider (range)
document.addEventListener('input', e => {
  if (e.target.type === 'range') {
    t.playSound('slide');
  }
});

// Change-Listener für Checkboxen
document.addEventListener('change', e => {
  if (e.target.type === 'checkbox') {
    t.playSound('checkbox');
  }
});
})();

