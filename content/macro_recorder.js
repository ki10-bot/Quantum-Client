// content/macro_recorder.js
(function() {
  const t = window.taming;

  t.macroRecorder = function(overlay) {
    
    
    
    let macroBtn;
    try {
      macroBtn = t.createIconButton('macro', 56, 65, 35);
    } catch (e) {
      macroBtn = t.createButton('Macro');
      macroBtn.style.width = '56px';
      macroBtn.style.height = '65px';
      macroBtn.style.fontSize = '11px';
      macroBtn.style.lineHeight = '16px';
      macroBtn.style.padding = '0';
      macroBtn.style.display = 'flex';
      macroBtn.style.alignItems = 'center';
      macroBtn.style.justifyContent = 'center';
    }

    const macroWin = t.createWindow('Makro Recorder Pro', '300px', '300px', '420px', '500px');
    macroWin.style.display = 'none';

    macroBtn.onclick = () => {
      macroWin.style.display = macroWin.style.display === 'none' ? 'block' : 'none';
    };

    
    
    
    const container = document.createElement('div');
    container.style.padding = '4px';
    macroWin.appendChild(container);

    const statusDiv = document.createElement('div');
    statusDiv.style.margin = '4px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Bereit';
    container.appendChild(statusDiv);

    const logDiv = document.createElement('div');
    logDiv.style.margin = '4px';
    logDiv.style.fontSize = '12px';
    logDiv.style.maxHeight = '120px';
    logDiv.style.overflowY = 'auto';
    logDiv.style.background = 'rgba(10, 12, 18, 0.4)';
    logDiv.style.padding = '2px';
    logDiv.style.color = 'var(--qt-text, #eaf1ff)';
    logDiv.style.fontFamily = 'monospace';
    container.appendChild(logDiv);

    function addLog(msg) {
      const entry = document.createElement('div');
      entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      logDiv.appendChild(entry);
      logDiv.scrollTop = logDiv.scrollHeight;
      console.log('[macro_recorder]', msg);
    }

    const recordBtn = document.createElement('button');
    recordBtn.textContent = 'Aufnehmen (F1)';
    recordBtn.style.width = '100%';
    recordBtn.style.margin = '4px 0';
    recordBtn.style.padding = '8px';
    recordBtn.style.background = 'var(--qt-accent, #b78bff)';
    recordBtn.style.color = '#111';
    recordBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    recordBtn.style.borderRadius = '8px';
    recordBtn.style.cursor = 'pointer';
    recordBtn.style.fontWeight = 'bold';
    container.appendChild(recordBtn);

    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'Stoppen (F2)';
    stopBtn.style.width = '100%';
    stopBtn.style.margin = '4px 0';
    stopBtn.style.padding = '8px';
    stopBtn.style.background = 'rgba(255,255,255,0.12)';
    stopBtn.style.color = 'var(--qt-text, #eaf1ff)';
    stopBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    stopBtn.style.borderRadius = '8px';
    stopBtn.style.cursor = 'pointer';
    stopBtn.style.fontWeight = 'bold';
    container.appendChild(stopBtn);

    const playBtn = document.createElement('button');
    playBtn.textContent = 'Abspielen (F3)';
    playBtn.style.width = '100%';
    playBtn.style.margin = '4px 0';
    playBtn.style.padding = '8px';
    playBtn.style.background = 'rgba(255,255,255,0.12)';
    playBtn.style.color = 'var(--qt-text, #eaf1ff)';
    playBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    playBtn.style.borderRadius = '8px';
    playBtn.style.cursor = 'pointer';
    playBtn.style.fontWeight = 'bold';
    container.appendChild(playBtn);

    
    const speedDiv = document.createElement('div');
    speedDiv.style.margin = '8px 0';
    speedDiv.style.fontSize = '12px';
    speedDiv.innerHTML = '<span style="font-size:12px;">Geschwindigkeit: <span id="macro-speed">1.0</span>x</span>';
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = 0.1;
    speedSlider.max = 3;
    speedSlider.step = 0.1;
    speedSlider.value = 1;
    speedSlider.style.width = '100%';
    speedDiv.appendChild(speedSlider);
    container.appendChild(speedDiv);

    const speedSpan = speedDiv.querySelector('#macro-speed');
    speedSlider.addEventListener('input', () => {
      speedSpan.textContent = speedSlider.value;
    });

    
    const vizDiv = document.createElement('div');
    vizDiv.style.margin = '8px 0';
    vizDiv.style.fontSize = '12px';
    const vizCheck = document.createElement('input');
    vizCheck.type = 'checkbox';
    vizCheck.id = 'macro-viz';
    vizCheck.checked = true;
    const vizLabel = document.createElement('label');
    vizLabel.htmlFor = 'macro-viz';
    vizLabel.textContent = ' Visualisierung während Aufnahme';
    vizLabel.style.cursor = 'pointer';
    vizDiv.appendChild(vizCheck);
    vizDiv.appendChild(vizLabel);
    container.appendChild(vizDiv);

    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Löschen';
    clearBtn.style.width = '100%';
    clearBtn.style.margin = '4px 0';
    clearBtn.style.padding = '8px';
    clearBtn.style.background = 'rgba(255,255,255,0.08)';
    clearBtn.style.color = 'var(--qt-text, #eaf1ff)';
    clearBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    clearBtn.style.borderRadius = '8px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.fontSize = '12px';
    container.appendChild(clearBtn);

    
    
    
    let recording = false;
    let playing = false;
    let macroEvents = [];
    let startTime = 0;

    let lastMousePos = { x: 0, y: 0 };
    let mouseTrail = [];

    let vizCanvas = null;
    let vizCtx = null;

    let debuggerReady = false;
    let currentPlaybackTimeout = null;

    async function attachDebuggerIfNeeded() {
      if (debuggerReady) return true;
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'attach' }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Debugger attach Fehler:', chrome.runtime.lastError.message);
            resolve(false);
            return;
          }
          if (response && response.success) {
            debuggerReady = true;
            console.log('Debugger gestartet');
            resolve(true);
          } else {
            console.warn('Debugger attach fehlgeschlagen:', response?.error);
            resolve(false);
          }
        });
      });
    }

    
    function keyCodeToVK(code) {
      const keyMap = {
        'KeyA': 0x41, 'KeyB': 0x42, 'KeyC': 0x43, 'KeyD': 0x44, 'KeyE': 0x45,
        'KeyF': 0x46, 'KeyG': 0x47, 'KeyH': 0x48, 'KeyI': 0x49, 'KeyJ': 0x4A,
        'KeyK': 0x4B, 'KeyL': 0x4C, 'KeyM': 0x4D, 'KeyN': 0x4E, 'KeyO': 0x4F,
        'KeyP': 0x50, 'KeyQ': 0x51, 'KeyR': 0x52, 'KeyS': 0x53, 'KeyT': 0x54,
        'KeyU': 0x55, 'KeyV': 0x56, 'KeyW': 0x57, 'KeyX': 0x58, 'KeyY': 0x59,
        'KeyZ': 0x5A,
        'Digit0': 0x30, 'Digit1': 0x31, 'Digit2': 0x32, 'Digit3': 0x33, 'Digit4': 0x34,
        'Digit5': 0x35, 'Digit6': 0x36, 'Digit7': 0x37, 'Digit8': 0x38, 'Digit9': 0x39,
        'Space': 0x20,
        'Enter': 0x0D,
        'Escape': 0x1B,
        'Tab': 0x09,
        'Backspace': 0x08,
        'Delete': 0x2E,
        'ShiftLeft': 0xA0,
        'ShiftRight': 0xA1,
        'ControlLeft': 0xA2,
        'ControlRight': 0xA3,
        'AltLeft': 0xA4,
        'AltRight': 0xA5,
        'MetaLeft': 0x5B,
        'MetaRight': 0x5C,
        'ArrowUp': 0x26,
        'ArrowDown': 0x28,
        'ArrowLeft': 0x25,
        'ArrowRight': 0x27,
        'Home': 0x24,
        'End': 0x23,
        'PageUp': 0x21,
        'PageDown': 0x22,
        'Insert': 0x2D,
        'Minus': 0xBD,
        'Equal': 0xBB,
        'BracketLeft': 0xDB,
        'BracketRight': 0xDD,
        'Backslash': 0xDC,
        'Semicolon': 0xBA,
        'Quote': 0xDE,
        'Comma': 0xBC,
        'Period': 0xBE,
        'Slash': 0xBF,
        'Backquote': 0xC0,
      };
      return keyMap[code] || null;
    }

    
    async function sendRealKeyDown(code) {
      const vk = keyCodeToVK(code);
      if (!vk) {
        console.warn('Unmapped key code (down):', code);
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'keyDown',
          keyCode: vk
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'keyDown fehlgeschlagen'));
          }
        });
      });
    }

    async function sendRealKeyUp(code) {
      const vk = keyCodeToVK(code);
      if (!vk) {
        console.warn('Unmapped key code (up):', code);
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'keyUp',
          keyCode: vk
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'keyUp fehlgeschlagen'));
          }
        });
      });
    }

    
    function synthKeyTap(code, key) {
      return new Promise((resolve) => {
        try {
          const down = new KeyboardEvent('keydown', { code: code, key: key, bubbles: true, cancelable: true });
          const up = new KeyboardEvent('keyup', { code: code, key: key, bubbles: true, cancelable: true });
          document.dispatchEvent(down);
          window.dispatchEvent(down);
          setTimeout(() => {
            document.dispatchEvent(up);
            window.dispatchEvent(up);
            resolve();
          }, 10);
        } catch (e) {
          console.warn('synthKeyTap error', e);
          resolve();
        }
      });
    }

    async function sendRealMouseDown(x, y, button) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'mousePressed',
          x: x,
          y: y,
          button: button === 0 ? 'left' : (button === 1 ? 'middle' : 'right')
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'mousePressed fehlgeschlagen'));
          }
        });
      });
    }

    async function sendRealMouseUp(x, y, button) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'mouseReleased',
          x: x,
          y: y,
          button: button === 0 ? 'left' : (button === 1 ? 'middle' : 'right')
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'mouseReleased fehlgeschlagen'));
          }
        });
      });
    }

    
    function createVizCanvas() {  
      if (vizCanvas) return;
      vizCanvas = document.createElement('canvas');
      vizCanvas.style.position = 'fixed';
      vizCanvas.style.top = '0';
      vizCanvas.style.left = '0';
      vizCanvas.style.width = '100%';
      vizCanvas.style.height = '100%';
      vizCanvas.style.pointerEvents = 'none';
      vizCanvas.style.zIndex = '9999998';
      document.body.appendChild(vizCanvas);
      vizCtx = vizCanvas.getContext('2d');
      function resize() {
        vizCanvas.width = window.innerWidth;
        vizCanvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();
    }

    function removeVizCanvas() {
      if (vizCanvas) {
        vizCanvas.remove();
        vizCanvas = null;
        vizCtx = null;
      }
    }

    function drawVisualization() { 
      if (!vizCtx || !vizCheck.checked) return;
      vizCtx.clearRect(0, 0, vizCanvas.width, vizCanvas.height);
      if (mouseTrail.length > 1) {
        vizCtx.beginPath();
        vizCtx.strokeStyle = 'rgba(255,255,255,0.5)';
        vizCtx.lineWidth = 2;
        vizCtx.moveTo(mouseTrail[0].x, mouseTrail[0].y);
        for (let i = 1; i < mouseTrail.length; i++) {
          vizCtx.lineTo(mouseTrail[i].x, mouseTrail[i].y);
        }
        vizCtx.stroke();
      }
      macroEvents.forEach(ev => {
        if (ev.type === 'mousedown') {
          const { x, y } = ev.data;
          vizCtx.beginPath();
          vizCtx.arc(x, y, 8, 0, 2 * Math.PI);
          vizCtx.strokeStyle = '#ff0';
          vizCtx.lineWidth = 2;
          vizCtx.stroke();
        } else if (ev.type === 'keydown') {
          const { x, y, code } = ev.data;
          const gradient = vizCtx.createRadialGradient(x, y, 5, x, y, 15);
          gradient.addColorStop(0, '#00f');
          gradient.addColorStop(1, '#f00');
          vizCtx.beginPath();
          vizCtx.arc(x, y, 12, 0, 2 * Math.PI);
          vizCtx.fillStyle = gradient;
          vizCtx.fill();
          vizCtx.fillStyle = '#fff';
          vizCtx.font = 'bold 12px monospace';
          vizCtx.textAlign = 'center';
          vizCtx.textBaseline = 'middle';
          let short = code.replace('Key', '').replace('Digit', '');
          if (code === 'Space') short = 'SPACE';
          else if (code === 'Enter') short = 'ENTER';
          else if (code === 'ShiftLeft' || code === 'ShiftRight') short = 'SHIFT';
          else if (code === 'ControlLeft' || code === 'ControlRight') short = 'Ctrl';
          else if (code === 'AltLeft' || code === 'AltRight') short = 'Alt';
          vizCtx.fillText(short, x, y);
        }
      });
    }

    let vizFrame = null;
    function vizLoop() {
      drawVisualization();
      vizFrame = requestAnimationFrame(vizLoop);
    }

    
    
    function onMouseMove(e) {
      if (!recording) return;
      const now = performance.now() - startTime;
      const pos = { x: e.clientX, y: e.clientY };
      macroEvents.push({ type: 'mousemove', time: now, data: pos });
      lastMousePos = pos;
      mouseTrail.push(pos);
      if (mouseTrail.length > 100) mouseTrail.shift();
      addLog(`Mausbewegung: (${pos.x}, ${pos.y})`);
    }

    function onMouseDown(e) {
      if (!recording) return;
      const now = performance.now() - startTime;
      macroEvents.push({ type: 'mousedown', time: now, data: { button: e.button, x: e.clientX, y: e.clientY } });
      addLog(`Mausklick unten: Button ${e.button}`);
    }

    function onMouseUp(e) {
      if (!recording) return;
      const now = performance.now() - startTime;
      macroEvents.push({ type: 'mouseup', time: now, data: { button: e.button, x: e.clientX, y: e.clientY } });
      addLog(`Mausklick oben: Button ${e.button}`);
    }

    function onKeyDown(e) {
      if (!recording) return;
      if (['F1', 'F2', 'F3'].includes(e.code)) return;
      const now = performance.now() - startTime;
      macroEvents.push({
        type: 'keydown',
        time: now,
        data: { code: e.code, key: e.key, x: lastMousePos.x, y: lastMousePos.y }
      });
      addLog(`Taste gedrückt: ${e.code}`);
    }

    function onKeyUp(e) {
      if (!recording) return;
      if (['F1', 'F2', 'F3'].includes(e.code)) return;
      const now = performance.now() - startTime;
      macroEvents.push({
        type: 'keyup',
        time: now,
        data: { code: e.code, key: e.key, x: lastMousePos.x, y: lastMousePos.y }
      });
      addLog(`Taste losgelassen: ${e.code}`);
    }
    

    
    
    function startRecording() {
      if (recording) return;
      macroEvents = [];
      mouseTrail = [];
      recording = true;
      startTime = performance.now();
    statusDiv.innerHTML = 'Aufnahme läuft...';
      statusDiv.style.color = 'var(--qt-accent, #b78bff)';
      addLog('=== Aufnahme gestartet ===');

      if (vizCheck.checked) {
        createVizCanvas();
        vizLoop();
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
    }

    function stopRecording() {
      if (!recording) return;
      recording = false;
    statusDiv.innerHTML = `Aufnahme beendet (${macroEvents.length} Events)`;
      statusDiv.style.color = 'var(--qt-text, #eaf1ff)';
      addLog(`=== Aufnahme gestoppt (${macroEvents.length} Events) ===`);

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);

      if (vizFrame) {
        cancelAnimationFrame(vizFrame);
        vizFrame = null;
      }
      removeVizCanvas();
    }

    async function playMacro() {
      if (playing || macroEvents.length === 0) {
    if (macroEvents.length === 0) addLog('Warnung: Keine aufgezeichneten Events.');
        return;
      }

      playing = true;
      statusDiv.innerHTML = 'Wiedergabe läuft...';
      statusDiv.style.color = 'var(--qt-accent, #b78bff)';
      addLog('=== Wiedergabe gestartet ===');
      const speed = parseFloat(speedSlider.value);

      const attached = await attachDebuggerIfNeeded();
      if (!attached) {
    addLog('Fehler: Debugger konnte nicht gestartet werden. Wiedergabe abgebrochen.');
        playing = false;
        statusDiv.innerHTML = 'Fehler: Debugger nicht verfügbar';
        statusDiv.style.color = 'rgba(255, 140, 140, 0.9)';
        return;
      }

      try { chrome.runtime.sendMessage({ action: 'bringToFront' }, () => {}); } catch (e) {}

      const events = macroEvents.slice();
      let lastTime = 0;

      async function executeEvent(ev) {
        try {
          if (ev.type === 'mousemove') {
            const mouseEvent = new MouseEvent('mousemove', { clientX: ev.data.x, clientY: ev.data.y, bubbles: true, cancelable: true, view: window });
            document.dispatchEvent(mouseEvent);
            addLog(`Mausbewegung (${ev.data.x}, ${ev.data.y})`);
          } else if (ev.type === 'mousedown') {
            await sendRealMouseDown(ev.data.x, ev.data.y, ev.data.button);
            addLog(`Mausklick unten Button ${ev.data.button}`);
          } else if (ev.type === 'mouseup') {
            await sendRealMouseUp(ev.data.x, ev.data.y, ev.data.button);
            addLog(`Mausklick oben Button ${ev.data.button}`);
          } else if (ev.type === 'keydown') {
            
            await sendRealKeyDown(ev.data.code);
            addLog(`keyDown gesendet: ${ev.data.code}`);
          } else if (ev.type === 'keyup') {
            
            await sendRealKeyUp(ev.data.code);
            addLog(`keyUp gesendet: ${ev.data.code}`);
          }
        } catch (err) {
          const errorMsg = err?.message || String(err) || 'Unbekannter Fehler';
      addLog(`Fehler: ${errorMsg}`);
          console.error('Playback error:', err);
        }
      }

      async function scheduleNext() {
        if (events.length === 0) {
          playing = false;
    statusDiv.innerHTML = 'Wiedergabe beendet';
          statusDiv.style.color = 'var(--qt-text, #eaf1ff)';
          addLog('=== Wiedergabe beendet ===');
          currentPlaybackTimeout = null;
          return;
        }

        const ev = events.shift();
        const delay = Math.max(0, (ev.time - lastTime) / speed);
        lastTime = ev.time;

        currentPlaybackTimeout = setTimeout(async () => {
          await executeEvent(ev);
          scheduleNext();
        }, delay);
      }

      scheduleNext();
    }

    function stopPlayback() {
      if (currentPlaybackTimeout) {
        clearTimeout(currentPlaybackTimeout);
        currentPlaybackTimeout = null;
      }
      playing = false;
      statusDiv.innerHTML = 'Wiedergabe abgebrochen';
      statusDiv.style.color = 'rgba(255, 140, 140, 0.9)';
      addLog('=== Wiedergabe abgebrochen ===');
    }

    function clearMacro() {
      if (recording) stopRecording();
      if (playing) stopPlayback();
      macroEvents = [];
      mouseTrail = [];
      statusDiv.innerHTML = 'Bereit';
      statusDiv.style.color = 'var(--qt-text, #eaf1ff)';
      logDiv.innerHTML = '';
      addLog('Makro gelöscht');
    }

    
    
    recordBtn.onclick = startRecording;
    stopBtn.onclick = stopRecording;
    playBtn.onclick = playMacro;
    clearBtn.onclick = clearMacro;

    
    
    const keyHandler = (e) => {
      if (e.code === 'F1') { e.preventDefault(); startRecording(); }
      else if (e.code === 'F2') { e.preventDefault(); stopRecording(); }
      else if (e.code === 'F3') { e.preventDefault(); playMacro(); }
    };
    document.addEventListener('keydown', keyHandler);

    
    
    window.addEventListener('beforeunload', () => {
      document.removeEventListener('keydown', keyHandler);
      if (recording) stopRecording();
      if (playing) stopPlayback();
      if (vizFrame) cancelAnimationFrame(vizFrame);
      if (currentPlaybackTimeout) clearTimeout(currentPlaybackTimeout);
      removeVizCanvas();
    });

    return macroBtn;
  };
})();
