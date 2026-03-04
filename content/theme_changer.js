// content/theme_changer.js
(function() {
  const t = window.taming;

  t.themeChanger = function(overlay) {
    
    let themeBtn;
    try {
      themeBtn = t.createIconButton('theme', 56, 65, 35);
    } catch (e) {
      themeBtn = t.createButton('Theme');
      themeBtn.style.width = '56px';
      themeBtn.style.height = '65px';
      themeBtn.style.fontSize = '11px';
      themeBtn.style.lineHeight = '16px';
      themeBtn.style.padding = '0';
      themeBtn.style.display = 'flex';
      themeBtn.style.alignItems = 'center';
      themeBtn.style.justifyContent = 'center';
    }

    
    const themeWin = t.createWindow('Theme Changer', '400px', '250px', '250px', '100px');
    themeWin.style.display = 'none';

    themeBtn.onclick = () => {
      themeWin.style.display = themeWin.style.display === 'none' ? 'block' : 'none';
    };

    
    const container = document.createElement('div');
    container.style.padding = '4px';
    themeWin.appendChild(container);

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

    
    let active = true;
    let styleOverride = null;
    let fontOverride = null;
    let imageObserver = null;

    
    function applyCssOverrides() {
      if (styleOverride) return;
      styleOverride = document.createElement('style');
      styleOverride.id = 'quantum-theme-override';
      styleOverride.textContent = `
        #pets {
          background: #0f0e15 !important;
        }
        #eqLFz {
          background: #0f0e15 !important;
        }
      `;
      document.head.appendChild(styleOverride);
    }

    function removeCssOverrides() {
      if (styleOverride) {
        styleOverride.remove();
        styleOverride = null;
      }
    }

    
    function applyFontOverride() {
      if (fontOverride) return;
      fontOverride = document.createElement('style');
      fontOverride.id = 'quantum-font-override';
      const fontUrl = chrome.runtime.getURL('fonts/font2.ttf');
      fontOverride.textContent = `
        @font-face {
          font-family: 'QuantumGameFont';
          src: url('${fontUrl}') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        body, * {
          font-family: 'QuantumGameFont', Arial, sans-serif !important;
        }
      `;
      document.head.appendChild(fontOverride);
    }

    function removeFontOverride() {
      if (fontOverride) {
        fontOverride.remove();
        fontOverride = null;
      }
    }

    
    function replaceImage(img) {
      if (!img || !img.src) return;
      
      if (img.src.includes('play-picture.png')) {
        const newUrl = chrome.runtime.getURL('utils/ui/animation.gif');
        
        if (img.src !== newUrl) {
          img.src = newUrl;
          console.log('ThemeChanger: Bild ersetzt', img);
        }
      }
    }

    function startImageObserver() {
      if (imageObserver) return;
      
      document.querySelectorAll('img').forEach(replaceImage);
      
      imageObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { 
              if (node.tagName === 'IMG') {
                replaceImage(node);
              } else {
                node.querySelectorAll('img').forEach(replaceImage);
              }
            }
          });
          
          if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
            replaceImage(mutation.target);
          }
        });
      });
      imageObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src']
      });
    }

    function stopImageObserver() {
      if (imageObserver) {
        imageObserver.disconnect();
        imageObserver = null;
      }
    }

    
    function applyAll() {
      applyCssOverrides();
      applyFontOverride();
      startImageObserver();
      statusDiv.innerHTML = 'Status: aktiv';
    }

    function revertAll() {
      removeCssOverrides();
      removeFontOverride();
      stopImageObserver();
      statusDiv.innerHTML = 'Status: inaktiv';
    }

    
    applyAll();

    toggleBtn.onclick = () => {
      if (active) {
        revertAll();
        toggleBtn.textContent = 'Aktivieren';
        toggleBtn.style.background = 'rgba(255,255,255,0.12)';
        toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
        active = false;
      } else {
        applyAll();
        toggleBtn.textContent = 'Deaktivieren';
        toggleBtn.style.background = 'var(--qt-accent, #b78bff)';
        toggleBtn.style.color = '#111';
        active = true;
      }
    };

    
    window.addEventListener('beforeunload', () => {
      stopImageObserver();
    });

    return themeBtn;
  };
})();
