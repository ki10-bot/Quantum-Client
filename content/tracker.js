// content/tracker.js
(function() {
  const t = window.taming;

  t.tracker = function(overlay) {
    
    
    
    const trackerBtn = t.createIconButton('tracker', 56, 65, 35);
    const trackerWin = t.createWindow('3D-Tracker', '400px', '250px', '300px', '200px');
    trackerWin.style.display = 'none';

    trackerBtn.onclick = () => {
      trackerWin.style.display = trackerWin.style.display === 'none' ? 'block' : 'none';
    };

    
    
    
    const statusDiv = document.createElement('div');
    statusDiv.style.padding = '8px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Tracking inaktiv';
    trackerWin.appendChild(statusDiv);

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Tracking starten';
    toggleBtn.style.margin = '4px';
    toggleBtn.style.padding = '4px 8px';
    toggleBtn.style.background = 'rgba(255,255,255,0.12)';
    toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
    toggleBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    toggleBtn.style.borderRadius = '8px';
    toggleBtn.style.cursor = 'pointer';
    trackerWin.appendChild(toggleBtn);

    const objectList = document.createElement('div');
    objectList.style.maxHeight = '150px';
    objectList.style.overflowY = 'auto';
    objectList.style.fontSize = '12px';
    objectList.style.marginTop = '8px';
    trackerWin.appendChild(objectList);

    
    
    
    let trackingActive = false;
    let trackedObjects = [];
    let overlayCanvas = null;
    let overlayCtx = null;
    let patched = false;
    let originalUniforms = null;
    let originalDraw = null;

    
    
    
    function getTranslationFromMatrix(mat) {
      return [mat[12], mat[13], mat[14]];
    }

    function clipToScreen(clipX, clipY, clipZ, clipW, width, height) {
      if (clipW === 0) return null;
      const ndcX = clipX / clipW;
      const ndcY = clipY / clipW;
      const screenX = (ndcX * 0.5 + 0.5) * width;
      const screenY = (1 - (ndcY * 0.5 + 0.5)) * height;
      return { x: screenX, y: screenY, z: clipZ / clipW };
    }

    
    
    
    function patchShaders() {
      
      if (!window.Shader) {
        statusDiv.innerHTML = 'Fehler: window.Shader nicht gefunden. Die Grafik-Engine ist noch nicht bereit – bitte später erneut versuchen.';
        return false;
      }
      if (!window.Shader.prototype) {
        statusDiv.innerHTML = 'Fehler: Shader.prototype fehlt – unerwarteter Zustand.';
        return false;
      }

      
      originalUniforms = window.Shader.prototype.uniforms;
      originalDraw = window.Shader.prototype.draw;

      if (typeof originalUniforms !== 'function' || typeof originalDraw !== 'function') {
        statusDiv.innerHTML = 'Fehler: Shader-Methoden sind keine Funktionen – unerwarteter Zustand.';
        return false;
      }

      
      window.Shader.prototype.uniforms = function(uniforms) {
        const mvp = uniforms.u_mvp || uniforms.u_model || uniforms.u_transform;
        if (mvp && mvp.length === 16) {
          this._lastMatrix = new Float32Array(mvp);
        }
        return originalUniforms.call(this, uniforms);
      };

      
      window.Shader.prototype.draw = function(mesh, mode, indexBufferName) {
        if (this._lastMatrix) {
          const matrix = this._lastMatrix;
          const pos = getTranslationFromMatrix(matrix);
          trackedObjects.push({
            matrix: matrix.slice(),
            pos: pos,
            type: mesh.name || 'unknown',
            confidence: 1.0,
            time: Date.now()
          });
          if (trackedObjects.length > 100) trackedObjects.shift();
          delete this._lastMatrix;
        }
        return originalDraw.call(this, mesh, mode, indexBufferName);
      };

      statusDiv.innerHTML = 'Patch erfolgreich – Tracking aktiv';
      return true;
    }

    function unpatchShaders() {
      if (window.Shader && window.Shader.prototype && originalUniforms && originalDraw) {
        window.Shader.prototype.uniforms = originalUniforms;
        window.Shader.prototype.draw = originalDraw;
        originalUniforms = null;
        originalDraw = null;
      }
    }

    
    
    
    function createOverlay() {
      if (overlayCanvas) return;
      overlayCanvas = document.createElement('canvas');
      overlayCanvas.style.position = 'fixed';
      overlayCanvas.style.top = '0';
      overlayCanvas.style.left = '0';
      overlayCanvas.style.width = '100%';
      overlayCanvas.style.height = '100%';
      overlayCanvas.style.pointerEvents = 'none';
      overlayCanvas.style.zIndex = '999999';
      document.body.appendChild(overlayCanvas);
      overlayCtx = overlayCanvas.getContext('2d');

      function resize() {
        overlayCanvas.width = window.innerWidth;
        overlayCanvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();
    }

    function removeOverlay() {
      if (overlayCanvas) {
        overlayCanvas.remove();
        overlayCanvas = null;
        overlayCtx = null;
      }
    }

    
    
    
    toggleBtn.onclick = () => {
      if (!trackingActive) {
        
        createOverlay();

        if (!patched) {
          const patchResult = patchShaders();
          if (patchResult) {
            patched = true;
            trackingActive = true;
            toggleBtn.textContent = 'Tracking stoppen';
            toggleBtn.style.background = 'var(--qt-accent, #b78bff)';
            toggleBtn.style.color = '#111';
          } else {
            
            trackingActive = false;
            removeOverlay();
          }
        } else {
          
          trackingActive = true;
          toggleBtn.textContent = 'Tracking stoppen';
          toggleBtn.style.background = 'var(--qt-accent, #b78bff)';
          toggleBtn.style.color = '#111';
          statusDiv.innerHTML = 'Tracking aktiv';
        }
      } else {
        
        trackingActive = false;
        if (patched) {
          unpatchShaders();
          patched = false;
        }
        removeOverlay();
        trackedObjects = [];
        toggleBtn.textContent = 'Tracking starten';
        toggleBtn.style.background = 'rgba(255,255,255,0.12)';
        toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
        statusDiv.innerHTML = 'Tracking inaktiv';
        objectList.innerHTML = '';
      }
    };

    
    
    
    setInterval(() => {
      if (!trackingActive || !overlayCtx) return;

      objectList.innerHTML = trackedObjects.slice(-10).map(obj => {
        const pos = obj.pos.map(v => Math.round(v));
        return `${obj.type}: (${pos[0]}, ${pos[1]}, ${pos[2]})`;
      }).join('<br>');

      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      overlayCtx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      overlayCtx.strokeStyle = 'white';
      overlayCtx.lineWidth = 1;

      trackedObjects.forEach(obj => {
        const m = obj.matrix;
        const x = m[12];
        const y = m[13];
        const z = m[14];
        const w = m[15];
        const screen = clipToScreen(x, y, z, w, overlayCanvas.width, overlayCanvas.height);
        if (screen) {
          overlayCtx.beginPath();
          overlayCtx.arc(screen.x, screen.y, 5, 0, 2 * Math.PI);
          overlayCtx.fill();
          overlayCtx.stroke();
        }
      });

      const now = Date.now();
      for (let i = trackedObjects.length - 1; i >= 0; i--) {
        if (now - trackedObjects[i].time > 1000) {
          trackedObjects.splice(i, 1);
        }
      }
    }, 100);

    
    
    
    window.addEventListener('beforeunload', () => {
      if (patched) {
        unpatchShaders();
      }
      removeOverlay();
    });

    return trackerBtn;
  };
})();
