// content/adblock_hider.js
(function() {
  const t = window.taming;

  t.adblockHider = function(overlay) {
    
    let hiderBtn;
    try {
      hiderBtn = t.createIconButton('adblock', 56, 65, 35);
    } catch (e) {
      hiderBtn = t.createButton('Block');
      hiderBtn.style.width = '56px';
      hiderBtn.style.height = '65px';
      hiderBtn.style.fontSize = '11px';
      hiderBtn.style.lineHeight = '16px';
      hiderBtn.style.padding = '0';
      hiderBtn.style.display = 'flex';
      hiderBtn.style.alignItems = 'center';
      hiderBtn.style.justifyContent = 'center';
    }

    const hiderWin = t.createWindow('Adblock-Hider', '400px', '250px', '300px', '180px');
    hiderWin.style.display = 'none';

    hiderBtn.onclick = () => {
      hiderWin.style.display = hiderWin.style.display === 'none' ? 'block' : 'none';
    };

    
    const container = document.createElement('div');
    container.style.padding = '4px';
    hiderWin.appendChild(container);

    const statusDiv = document.createElement('div');
    statusDiv.style.margin = '4px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Status: aktiv'; 
    container.appendChild(statusDiv);

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Deaktivieren'; 
    toggleBtn.style.width = '100%';
    toggleBtn.style.margin = '4px 0';
    toggleBtn.style.padding = '8px';
    toggleBtn.style.background = 'var(--qt-accent, #b78bff)';
    toggleBtn.style.color = '#111';
    toggleBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    toggleBtn.style.borderRadius = '8px';
    toggleBtn.style.cursor = 'pointer';
    container.appendChild(toggleBtn);

    const infoDiv = document.createElement('div');
    infoDiv.style.margin = '4px';
    infoDiv.style.fontSize = '12px';
    infoDiv.style.color = 'var(--qt-text, #eaf1ff)';
    infoDiv.style.opacity = '0.7';
    infoDiv.innerHTML = 'Versteckt #ccc-bottom und #ccc-left (Adblock-Elemente)';
    container.appendChild(infoDiv);

    
    let active = true; 
    let observer = null;
    let interval = null;

    
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
      toggleBtn.style.background = 'var(--qt-accent, #b78bff)';
      toggleBtn.style.color = '#111';
      hideElement('ccc-bottom');
      hideElement('ccc-left');
      startObserver();
      startInterval();
    }

    function stopHiding() {
      active = false;
      statusDiv.innerHTML = 'Status: inaktiv';
      toggleBtn.textContent = 'Aktivieren';
      toggleBtn.style.background = 'rgba(255,255,255,0.12)';
      toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
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

    startHiding();

    window.addEventListener('beforeunload', () => {
      stopObserver();
      stopInterval();
    });

    return hiderBtn;
  };
})();
