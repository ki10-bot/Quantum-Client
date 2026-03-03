// content/ai_tracker.js
(function() {
  const t = window.taming;

  t.aiTracker = function() {

    // ---------------------------
    // UI (unverändert, keine Logik-Änderungen)
    // ---------------------------
    let aiBtn;
    try {
      aiBtn = t.createIconButton('ai', 56, 65, 35);
    } catch {
      aiBtn = t.createButton('🧠');
      aiBtn.style.width = '56px';
      aiBtn.style.height = '65px';
      aiBtn.style.fontSize = '24px';
      aiBtn.style.lineHeight = '65px';
    }

    const aiWin = t.createWindow('YOLOv8 Tracker', '400px', '250px', '380px', '520px');
    aiWin.style.display = 'none';
    aiBtn.onclick = () => { aiWin.style.display = aiWin.style.display === 'none' ? 'block' : 'none'; };

    const container = document.createElement('div');
    container.style.padding = '6px';
    aiWin.appendChild(container);

    const statusDiv = document.createElement('div');
    statusDiv.innerHTML = '⏸️ Gestoppt';
    container.appendChild(statusDiv);

    const errorDiv = document.createElement('div');
    errorDiv.style.color = '#faa';
    errorDiv.style.fontSize = '12px';
    container.appendChild(errorDiv);

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Starten';
    toggleBtn.style.width = '100%';
    toggleBtn.style.marginTop = '8px';
    container.appendChild(toggleBtn);

    const confSlider = document.createElement('input');
    confSlider.type = 'range';
    confSlider.min = 0.1;
    confSlider.max = 0.9;
    confSlider.step = 0.01;
    confSlider.value = 0.4;
    confSlider.style.width = '100%';
    container.appendChild(confSlider);

    // ---------------------------
    // Overlay Canvas (unverändert)
    // ---------------------------
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = 9999999;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ---------------------------
    // Zustand + Parameter
    // ---------------------------
    let session = null;
    let inputName = null;
    let outputName = null;
    let active = false;
    let processing = false;

    // Performance knobs
    const MODEL_INPUT_SIZE = 320; // 320 faster; set to 640 if PC is strong
    const MIN_INFERENCE_INTERVAL = 150;
    let lastInferenceTime = 0;

    // Candidate ORT script paths (relative to extension root)
    // Keep them in the extension and listed in web_accessible_resources in manifest.json:
    // e.g. "ort/*" or "libs/onnx/*"
    const ORT_CANDIDATES = [
      'ort/ort.min.js',
      'ort/ort.wasm.js',
      'libs/onnx/ort.min.js',
      'libs/onnx/ort.wasm.js'
    ];

    // Candidate model paths (relative to extension root)
    const MODEL_CANDIDATES = [
      'models/yolov8n.onnx',
      'yolov8n.onnx',
      'model/yolov8n.onnx'
    ];

    // ---------------------------
    // Helper: extension-safe getURL
    // ---------------------------
    function getExtURL(path) {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL(path);
      }
      if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL) {
        return browser.runtime.getURL(path);
      }
      throw new Error('Extension runtime API nicht verfügbar: chrome.runtime.getURL fehlt');
    }

    // ---------------------------
    // Helper: prüfe ob extension-URL erreichbar (fetch), returns true/false
    // ---------------------------
    async function urlExists(url) {
      try {
        const r = await fetch(url, { method: 'GET' });
        return r.ok;
      } catch (e) {
        return false;
      }
    }

    // ---------------------------
    // Lade Script nur wenn die URL erreichbar ist (verhindert chrome-extension://invalid)
    // ---------------------------
    async function loadScriptIfAvailable(relPath) {
      const url = getExtURL(relPath);
      console.log('[ai_tracker] trying loadScriptIfAvailable ->', url);
      // quick existence check
      const ok = await urlExists(url);
      if (!ok) {
        console.warn('[ai_tracker] resource not reachable (or not web_accessible_resources):', url);
        throw new Error('resource not reachable: ' + url);
      }
      // inject script tag
      return new Promise((resolve, reject) => {
        try {
          // avoid double-inserting same script
          if (Array.from(document.scripts).some(s => s.src === url)) {
            console.log('[ai_tracker] script already inserted:', url);
            resolve(url);
            return;
          }
          const s = document.createElement('script');
          s.src = url;
          s.onload = () => {
            console.log('[ai_tracker] script loaded:', url);
            resolve(url);
          };
          s.onerror = (e) => {
            console.error('[ai_tracker] script load error:', url, e);
            reject(new Error('Script load failed: ' + url));
          };
          document.head.appendChild(s);
        } catch (e) {
          reject(e);
        }
      });
    }

    // ---------------------------
    // Lade ORT: prüfe Kandidaten, lade erstes erreichbares Skript und setze wasmPaths
    // ---------------------------
    async function loadOrtLocal() {
      if (window.ort) {
        console.log('[ai_tracker] ort already present');
        try {
          if (ort && ort.env && ort.env.wasm) {
            // attempt to set wasmPaths to default "ort/" if exists
            const defaultFolder = getExtURL('ort/');
            ort.env.wasm.wasmPaths = defaultFolder;
            console.log('[ai_tracker] set default wasmPaths ->', defaultFolder);
          }
        } catch (e) { /* ignore */ }
        return;
      }

      let lastError = null;
      for (const rel of ORT_CANDIDATES) {
        try {
          await loadScriptIfAvailable(rel);
          // after load: set wasmPaths to folder
          try {
            const folderUrl = getExtURL(rel.substring(0, rel.lastIndexOf('/') + 1));
            if (window.ort && ort.env && ort.env.wasm) {
              ort.env.wasm.wasmPaths = folderUrl;
              console.log('[ai_tracker] ort.env.wasm.wasmPaths =', folderUrl);
            } else {
              console.warn('[ai_tracker] ort or wasm env missing after loading script', rel);
            }
          } catch (e) {
            console.warn('[ai_tracker] could not set wasmPaths for', rel, e);
          }
          if (window.ort) return;
          // some builds may attach ort later; continue trying other candidates
        } catch (e) {
          lastError = e;
          console.warn('[ai_tracker] loadScriptIfAvailable failed for', rel, e.message);
        }
      }
      throw new Error('Keine ORT-Skripte konnten geladen werden. Letzter Fehler: ' + (lastError && lastError.message));
    }

    // ---------------------------
    // Wähle Modell-URL: erste erreichbare Datei von MODEL_CANDIDATES
    // ---------------------------
    async function pickModelUrl() {
      for (const rel of MODEL_CANDIDATES) {
        try {
          const url = getExtURL(rel);
          console.log('[ai_tracker] check model url', url);
          if (await urlExists(url)) return url;
        } catch (e) {
          // ignore
        }
      }
      // fallback: return first candidate url (so session creation can fail with a clear error)
      return getExtURL(MODEL_CANDIDATES[0]);
    }

    // ---------------------------
    // Lade Modell mit WebGL -> WASM Fallback; set input/output names after session ready
    // ---------------------------
    async function loadModelWithFallback() {
      statusDiv.innerHTML = '⏳ Lade ONNX Runtime...';
      errorDiv.innerHTML = '';
      try {
        await loadOrtLocal();
      } catch (e) {
        console.error('[ai_tracker] ort load failed', e);
        errorDiv.innerText = '❌ ort konnte nicht geladen werden: ' + (e.message || e.toString());
        statusDiv.innerHTML = '⏸️ Gestoppt';
        return false;
      }

      let modelUrl;
      try {
        modelUrl = await pickModelUrl();
      } catch (e) {
        errorDiv.innerText = '❌ Modell nicht gefunden: ' + (e.message || e.toString());
        statusDiv.innerHTML = '⏸️ Gestoppt';
        return false;
      }

      statusDiv.innerHTML = '⏳ Lade Modell... (versuche WebGL)';
      // Versuch WebGL
      try {
        session = await ort.InferenceSession.create(modelUrl, { executionProviders: ['webgl'] });
        statusDiv.innerHTML = '✅ Modell geladen (WebGL)';
        console.log('[ai_tracker] session created with webgl');
      } catch (e) {
        console.warn('[ai_tracker] webgl session failed', e);
      }

      if (!session) {
        try {
          statusDiv.innerHTML = '⏳ Lade Modell... (WASM fallback)';
          session = await ort.InferenceSession.create(modelUrl, { executionProviders: ['wasm'] });
          statusDiv.innerHTML = '✅ Modell geladen (WASM)';
          console.log('[ai_tracker] session created with wasm');
        } catch (e) {
          console.error('[ai_tracker] wasm session failed', e);
          errorDiv.innerText = '❌ Modell konnte nicht initialisiert werden: ' + (e.message || e.toString());
          statusDiv.innerHTML = '⏸️ Gestoppt';
          return false;
        }
      }

      // determine input & output names reliably
      try {
        inputName = Array.isArray(session.inputNames) && session.inputNames.length ? session.inputNames[0] : null;
        outputName = Array.isArray(session.outputNames) && session.outputNames.length ? session.outputNames[0] : null;
        // fallback: try to inspect session.modelMetadata if available (some builds differ)
        if (!inputName || !outputName) {
          // try to get from session._modelRunner or session.outputNames fallback (best-effort)
          inputName = session.inputNames && session.inputNames[0] ? session.inputNames[0] : inputName;
          outputName = session.outputNames && session.outputNames[0] ? session.outputNames[0] : outputName;
        }
        console.log('[ai_tracker] inputName=', inputName, 'outputName=', outputName);
      } catch (e) {
        console.warn('[ai_tracker] could not determine input/output names cleanly', e);
      }

      return true;
    }

    // ---------------------------
    // Preprocess & Tensor creation
    // ---------------------------
    function preprocessGameCanvas(gameCanvas) {
      const tmp = document.createElement('canvas');
      tmp.width = MODEL_INPUT_SIZE;
      tmp.height = MODEL_INPUT_SIZE;
      const tctx = tmp.getContext('2d');
      tctx.drawImage(gameCanvas, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
      const img = tctx.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
      const data = img.data;
      const floatData = new Float32Array(1 * 3 * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE);
      let p = 0;
      for (let c = 0; c < 3; c++) {
        for (let i = 0; i < MODEL_INPUT_SIZE * MODEL_INPUT_SIZE; i++) {
          floatData[p++] = data[i * 4 + c] / 255.0;
        }
      }
      return new ort.Tensor('float32', floatData, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
    }

    // ---------------------------
    // Decode + Draw (same approach as before)
    // ---------------------------
    function simpleDecodeAndDraw(outputTensor, gameCanvasRect) {
      if (!outputTensor) return;
      const data = outputTensor.data;
      const dims = outputTensor.dims || [];
      const stride = 85;
      const threshold = parseFloat(confSlider.value);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scaleX = canvas.width / gameCanvasRect.width;
      const scaleY = canvas.height / gameCanvasRect.height;

      function drawBoxModelCoords(cx, cy, w, h, score) {
        const x1 = cx - w / 2;
        const y1 = cy - h / 2;
        const sx = gameCanvasRect.left + (x1 / MODEL_INPUT_SIZE) * gameCanvasRect.width;
        const sy = gameCanvasRect.top + (y1 / MODEL_INPUT_SIZE) * gameCanvasRect.height;
        const sw = (w / MODEL_INPUT_SIZE) * gameCanvasRect.width;
        const sh = (h / MODEL_INPUT_SIZE) * gameCanvasRect.height;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx * scaleX, sy * scaleY, sw * scaleX, sh * scaleY);
        ctx.fillStyle = '#00ff00';
        ctx.font = '14px Arial';
        ctx.fillText('Spieler ' + score.toFixed(2), sx * scaleX, Math.max(12, sy * scaleY - 4));
      }

      try {
        if (dims.length === 3 && dims[1] > 1 && dims[2] === stride) {
          const rows = dims[1];
          for (let r = 0; r < rows; r++) {
            const off = r * stride;
            const conf = data[off + 4];
            let bestClassProb = 0;
            for (let ci = 5; ci < stride; ci++) {
              if (data[off + ci] > bestClassProb) bestClassProb = data[off + ci];
            }
            const score = conf * bestClassProb;
            if (score < threshold) continue;
            const cx = data[off + 0], cy = data[off + 1], w = data[off + 2], h = data[off + 3];
            drawBoxModelCoords(cx, cy, w, h, score);
          }
        } else {
          const total = Math.floor(data.length / stride);
          for (let r = 0; r < total; r++) {
            const off = r * stride;
            const conf = data[off + 4];
            let bestClassProb = 0;
            for (let ci = 5; ci < stride; ci++) {
              if (data[off + ci] > bestClassProb) bestClassProb = data[off + ci];
            }
            const score = conf * bestClassProb;
            if (score < threshold) continue;
            const cx = data[off + 0], cy = data[off + 1], w = data[off + 2], h = data[off + 3];
            drawBoxModelCoords(cx, cy, w, h, score);
          }
        }
      } catch (e) {
        console.warn('[ai_tracker] decode/draw failed', e);
      }
    }

    // ---------------------------
    // Detection loop (throttled)
    // ---------------------------
    async function detectOnce() {
      if (!active || processing || !session) return;
      const now = performance.now();
      if (now - lastInferenceTime < MIN_INFERENCE_INTERVAL) return;
      lastInferenceTime = now;

      const gameCanvas = document.querySelector('canvas');
      if (!gameCanvas) return;

      processing = true;
      try {
        const inputTensor = preprocessGameCanvas(gameCanvas);
        const feeds = {};
        const usedInput = inputName || (session.inputNames && session.inputNames[0]) || null;
        if (!usedInput) throw new Error('Input name der Session nicht verfügbar');
        feeds[usedInput] = inputTensor;

        const t0 = performance.now();
        const outputMap = await session.run(feeds);
        const t1 = performance.now();
        const infMs = Math.round(t1 - t0);
        statusDiv.innerHTML = `▶️ Aktiv — Inferenz ${infMs} ms`;

        const usedOutput = outputName || (session.outputNames && session.outputNames[0]) || Object.keys(outputMap)[0];
        const outTensor = outputMap[usedOutput];
        const rect = gameCanvas.getBoundingClientRect();
        simpleDecodeAndDraw(outTensor, rect);
      } catch (e) {
        console.error('[ai_tracker] Detection error', e);
        errorDiv.innerText = '❌ Detection Fehler: ' + (e.message || e.toString());
      } finally {
        processing = false;
      }
    }

    function loop() {
      if (!active) return;
      detectOnce().then(() => requestAnimationFrame(loop));
    }

    // ---------------------------
    // Toggle logic (UI-Button bleibt unverändert)
    // ---------------------------
    toggleBtn.onclick = async () => {
      if (!active) {
        if (!session) {
          statusDiv.innerHTML = 'Lade Modell';
          const ok = await loadModelWithFallback();
          if (!ok) return;
        }
        active = true;
        toggleBtn.textContent = 'Stoppen';
        statusDiv.innerHTML = '▶️ Aktiv';
        errorDiv.innerText = '';
        lastInferenceTime = 0;
        loop();
      } else {
        active = false;
        toggleBtn.textContent = 'Starten';
        statusDiv.innerHTML = '⏸️ Gestoppt';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    // Cleanup
    window.addEventListener('beforeunload', () => {
      active = false;
      canvas.remove();
    });

    return aiBtn;
  };
})();