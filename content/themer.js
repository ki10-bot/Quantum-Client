// content/themer.js
(function() {
  const t = window.taming;

  // Einmaliger Patch für HTMLImageElement.prototype.src
  if (!window.__themerPatched) {
    window.__themerPatched = true;
    const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');

    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      get: function() {
        return originalSrcDescriptor.get.call(this);
      },
      set: function(value) {
        let newValue = value;
        const reps = window.__themerReplacements || [];
        for (const r of reps) {
          if (value.includes(r.original)) {
            let replacementUrl = r.replacement;
            // Pfade in vollständige Extension-URL umwandeln
            if (!replacementUrl.startsWith('http') && !replacementUrl.startsWith('chrome-extension://')) {
              // Wenn es ein relativer Pfad ist, nimm an, dass er im assets-Ordner liegt
              if (replacementUrl.startsWith('assets/')) {
                replacementUrl = chrome.runtime.getURL(replacementUrl);
              } else {
                replacementUrl = chrome.runtime.getURL('assets/' + replacementUrl);
              }
            }
            newValue = replacementUrl;
            console.log(`[Themer] Ersetze Bild: ${value} -> ${newValue}`);
            break;
          }
        }
        originalSrcDescriptor.set.call(this, newValue);
      }
    });
  }

  t.themer = function(overlay) {
    // Button erstellen (Icon 'theme' muss im icons-Ordner liegen)
    const themeBtn = t.createIconButton('theme', 56, 65, 35);
    
    // Fenster mit angemessener Größe
    const themeWin = t.createWindow('Texture Ersetzer', '300px', '200px', '350px', '350px');
    themeWin.style.display = 'none';
    themeWin.style.overflow = 'hidden'; // Verhindert, dass Inhalt übersteht

    themeBtn.onclick = () => {
      themeWin.style.display = themeWin.style.display === 'none' ? 'block' : 'none';
    };

    // Liste der Ersetzungen (wird im localStorage gespeichert)
    let replacements = [];

    function loadReplacements() {
      const saved = localStorage.getItem('tamingReplacements');
      if (saved) {
        try {
          replacements = JSON.parse(saved);
        } catch (e) {
          console.warn('[Themer] Fehler beim Laden der Ersetzungen', e);
        }
      }
      window.__themerReplacements = replacements;
    }
    loadReplacements();

    // UI-Elemente
    const listDiv = document.createElement('div');
    listDiv.style.maxHeight = '180px';
    listDiv.style.overflowY = 'auto';
    listDiv.style.marginBottom = '10px';
    listDiv.style.border = '1px solid #444';
    listDiv.style.borderRadius = '4px';
    listDiv.style.padding = '4px';
    themeWin.appendChild(listDiv);

    function renderList() {
      listDiv.innerHTML = '';
      if (replacements.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = 'Keine Ersetzungen';
        empty.style.color = '#aaa';
        empty.style.padding = '8px';
        empty.style.textAlign = 'center';
        listDiv.appendChild(empty);
        return;
      }
      replacements.forEach((r, index) => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '4px';
        item.style.margin = '4px 0';
        item.style.padding = '4px';
        item.style.background = 'rgba(255,255,255,0.1)';
        item.style.borderRadius = '4px';
        item.style.fontSize = '11px';

        const origSpan = document.createElement('span');
        origSpan.textContent = r.original.length > 30 ? r.original.substring(0, 27) + '...' : r.original;
        origSpan.style.flex = '1';
        origSpan.style.overflow = 'hidden';
        origSpan.style.textOverflow = 'ellipsis';
        origSpan.title = r.original;

        const repSpan = document.createElement('span');
        repSpan.textContent = r.replacement.length > 30 ? r.replacement.substring(0, 27) + '...' : r.replacement;
        repSpan.style.flex = '1';
        repSpan.style.overflow = 'hidden';
        repSpan.style.textOverflow = 'ellipsis';
        repSpan.title = r.replacement;

        const delBtn = document.createElement('button');
        delBtn.textContent = '🗑️';
        delBtn.style.background = 'none';
        delBtn.style.border = 'none';
        delBtn.style.cursor = 'pointer';
        delBtn.style.fontSize = '14px';
        delBtn.onclick = () => {
          replacements.splice(index, 1);
          renderList();
          saveReplacements();
        };

        item.appendChild(origSpan);
        item.appendChild(repSpan);
        item.appendChild(delBtn);
        listDiv.appendChild(item);
      });
    }

    // Eingabebereich
    const inputDiv = document.createElement('div');
    inputDiv.style.display = 'flex';
    inputDiv.style.flexDirection = 'column';
    inputDiv.style.gap = '4px';
    inputDiv.style.marginTop = '8px';

    const origLabel = document.createElement('div');
    origLabel.textContent = 'Original-Teilstring:';
    origLabel.style.fontSize = '11px';
    origLabel.style.color = '#ccc';

    const origInput = document.createElement('input');
    origInput.placeholder = 'z.B. /images/old.png';
    origInput.style.background = '#333';
    origInput.style.color = '#fff';
    origInput.style.border = '1px solid #555';
    origInput.style.padding = '4px';
    origInput.style.borderRadius = '4px';

    const repLabel = document.createElement('div');
    repLabel.textContent = 'Ersatz (assets/neu.png oder URL):';
    repLabel.style.fontSize = '11px';
    repLabel.style.color = '#ccc';

    const repInput = document.createElement('input');
    repInput.placeholder = 'z.B. assets/meine_textur.png';
    repInput.style.background = '#333';
    repInput.style.color = '#fff';
    repInput.style.border = '1px solid #555';
    repInput.style.padding = '4px';
    repInput.style.borderRadius = '4px';

    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '4px';
    buttonRow.style.marginTop = '4px';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Hinzufügen';
    addBtn.style.background = '#4a6';
    addBtn.style.border = 'none';
    addBtn.style.color = '#fff';
    addBtn.style.cursor = 'pointer';
    addBtn.style.padding = '6px';
    addBtn.style.borderRadius = '4px';
    addBtn.style.flex = '1';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Alle löschen';
    clearBtn.style.background = '#a44';
    clearBtn.style.border = 'none';
    clearBtn.style.color = '#fff';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.padding = '6px';
    clearBtn.style.borderRadius = '4px';

    buttonRow.appendChild(addBtn);
    buttonRow.appendChild(clearBtn);

    inputDiv.appendChild(origLabel);
    inputDiv.appendChild(origInput);
    inputDiv.appendChild(repLabel);
    inputDiv.appendChild(repInput);
    inputDiv.appendChild(buttonRow);

    themeWin.appendChild(inputDiv);

    // Hinzufügen
    addBtn.onclick = () => {
      const orig = origInput.value.trim();
      const rep = repInput.value.trim();
      if (orig && rep) {
        // Prüfen, ob bereits vorhanden (einfache Duplikatsvermeidung)
        const exists = replacements.some(r => r.original === orig && r.replacement === rep);
        if (!exists) {
          replacements.push({ original: orig, replacement: rep });
          renderList();
          saveReplacements();
          origInput.value = '';
          repInput.value = '';
        } else {
          alert('Diese Ersetzung existiert bereits.');
        }
      } else {
        alert('Bitte beide Felder ausfüllen.');
      }
    };

    // Alle löschen
    clearBtn.onclick = () => {
      if (confirm('Alle Ersetzungen löschen?')) {
        replacements = [];
        renderList();
        saveReplacements();
      }
    };

    function saveReplacements() {
      localStorage.setItem('tamingReplacements', JSON.stringify(replacements));
      window.__themerReplacements = replacements;
      console.log('[Themer] Ersetzungen gespeichert:', replacements);
    }

    renderList();

    return themeBtn;
  };
})();