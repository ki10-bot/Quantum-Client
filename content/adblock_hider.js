// content/adblock_hider.js
(function() {
  const t = window.taming;

  t.adblockHider = function(overlay) {
    // Button mit Fallback
    let hiderBtn;
    try {
      hiderBtn = t.createIconButton('adblock', 56, 65, 35);
    } catch (e) {
      hiderBtn = t.createButton('🛡️');
      hiderBtn.style.width = '56px';
      hiderBtn.style.height = '65px';
      hiderBtn.style.fontSize = '24px';
      hiderBtn.style.lineHeight = '65px';
      hiderBtn.style.padding = '0';
    }

    const hiderWin = t.createWindow('Adblock-Hider', '400px', '250px', '300px', '180px');
    hiderWin.style.display = 'none';

    hiderBtn.onclick = () => {
      hiderWin.style.display = hiderWin.style.display === 'none' ? 'block' : 'none';
    };

    // UI
    const container = document.createElement('div');
    container.style.padding = '4px';
    hiderWin.appendChild(container);

    const statusDiv = document.createElement('div');
    statusDiv.style.margin = '4px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Status: aktiv'; // Standardmäßig aktiv
    container.appendChild(statusDiv);

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Deaktivieren'; // Standardmäßig aktiv
    toggleBtn.style.width = '100%';
    toggleBtn.style.margin = '4px 0';
    toggleBtn.style.padding = '8px';
    toggleBtn.style.background = '#a44'; // rot für aktiv
    toggleBtn.style.color = '#fff';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '4px';
    toggleBtn.style.cursor = 'pointer';
    container.appendChild(toggleBtn);

    const infoDiv = document.createElement('div');
    infoDiv.style.margin = '4px';
    infoDiv.style.fontSize = '12px';
    infoDiv.style.color = '#aaa';
    infoDiv.innerHTML = 'Versteckt #ccc-bottom und #ccc-left (Adblock-Elemente)';
    container.appendChild(infoDiv);

    // Zustand
    let active = true; // Standardmäßig aktiv
    let observer = null;
    let interval = null;

    // Funktion zum Verstecken eines Elements
    function hideElement(id) {
      const el = document.getElementById(id);
      if (el) {
        el.style.setProperty('position', 'absolute', 'important');
        el.style.setProperty('left', '-9999px', 'important');
        el.style.setProperty('top', '-9999px', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        el.style.setProperty('opacity', '0', 'important');
        console.log(`[Adblock-Hider] Element ${id} versteckt.`);
        return true;
      }
      return false;
    }

    // Periodische Suche (alle 2 Sekunden)
    function startInterval() {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        if (active) {
          hideElement('ccc-bottom');
          hideElement('ccc-left');
        }
      }, 2000);
    }

    function stopInterval() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    // MutationObserver
    function startObserver() {
      if (observer) observer.disconnect();
      observer = new MutationObserver((mutations) => {
        if (!active) return;
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && (node.id === 'ccc-bottom' || node.id === 'ccc-left')) {
              hideElement(node.id);
            }
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    function stopObserver() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }

    function startHiding() {
      active = true;
      statusDiv.innerHTML = 'Status: aktiv';
      toggleBtn.textContent = 'Deaktivieren';
      toggleBtn.style.background = '#a44';
      // Sofort einmal verstecken
      hideElement('ccc-bottom');
      hideElement('ccc-left');
      startObserver();
      startInterval();
    }

    function stopHiding() {
      active = false;
      statusDiv.innerHTML = 'Status: inaktiv';
      toggleBtn.textContent = 'Aktivieren';
      toggleBtn.style.background = '#4a6';
      stopObserver();
      stopInterval();
    }

    toggleBtn.onclick = () => {
      if (active) {
        stopHiding();
      } else {
        startHiding();
      }
    };

    // Automatisch starten (standardmäßig aktiv)
    startHiding();

    window.addEventListener('beforeunload', () => {
      stopObserver();
      stopInterval();
    });

    return hiderBtn;
  };
})();