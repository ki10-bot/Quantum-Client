// content/edit_moment.js
(function() {
  const t = window.taming;

  t.editMoment = function(overlay) {
    let editBtn;
    try {
      editBtn = t.createIconButton('edit', 56, 65, 35);
    } catch (e) {
      editBtn = t.createButton('✂️');
      editBtn.style.width = '56px';
      editBtn.style.height = '65px';
      editBtn.style.fontSize = '24px';
      editBtn.style.lineHeight = '65px';
      editBtn.style.padding = '0';
    }

    // state
    let isActive = false;
    let vibrationInterval = null;
    let overlayDiv = null;
    let audio = null;
    let freezeStyle = null;
    let shakeHandle = { raf: null };

    // noise / glow / face
    let noiseCanvas = null;
    let noiseCtx = null;
    let noiseInterval = null;
    let noiseUpdateRate = 33;
    let glowDiv = null;
    let faceImg = null;

    // audio analyser
    let audioCtx = null;
    let analyser = null;
    let sourceNode = null;
    let dataArray = null;
    let rafId = null;

    // settings
    const CONTRAST_AMOUNT = 1.6;
    const NOISE_OPACITY = 0.06;
    const NOISE_SCALE = 1.6;
    const GLOW_BLUR = 22;
    const GLOW_BRIGHTNESS = 2.2;
    const GLOW_OPACITY = 0.62;

    // amplitude mapping (tweakable)
    const BASE_X = 70;      // base horizontal amplitude (px)
    const BASE_Y = 52.5;    // base vertical amplitude (px)
    const BASE_R = 2.5;     // base rotation (deg)
    const MAX_MULTIPLIER = 2.5; // max loudness multiplier

    // beat detection
    let lastBeatTime = 0;
    const minBeatGap = 70; // ms
    let adaptiveThreshold = 0.012; // baseline for ambient RMS
    const THRESH_MULT = 1.15; // how far über adaptive threshold a peak must liegen

    // helper: block keys while active
    function blockKeys(e) {
      if (isActive) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    // freeze styles
    function injectFreezeStyles() {
      freezeStyle = document.createElement('style');
      freezeStyle.id = 'edit-moment-freeze-style';
      freezeStyle.textContent = `
        *:not(.edit-moment-overlay) {
          animation-play-state: paused !important;
          transition: none !important;
        }
        html, body {
          overflow: hidden !important;
          height: 100% !important;
        }
      `;
      document.head.appendChild(freezeStyle);
      document.documentElement.style.pointerEvents = 'none';
      document.body.style.pointerEvents = 'none';
    }

    function removeFreezeStyles() {
      if (freezeStyle && freezeStyle.parentNode) freezeStyle.parentNode.removeChild(freezeStyle);
      freezeStyle = null;
      document.documentElement.style.pointerEvents = '';
      document.body.style.pointerEvents = '';
      document.documentElement.style.transform = '';
    }

    // smooth damped shake (RAF-driven)
    function startSmoothShake(targetX, targetY, targetR) {
      if (shakeHandle.raf) cancelAnimationFrame(shakeHandle.raf);

      const start = performance.now();
      const duration = 700;
      const damping = 6.0;
      const omega = 14.0;

      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const decay = Math.exp(-damping * t);
        const oscill = Math.sin(omega * t * Math.PI);
        const factor = decay * oscill;

        const curX = targetX * factor;
        const curY = targetY * factor;
        const curR = targetR * factor;

        document.documentElement.style.transform = `translate(${curX.toFixed(2)}px, ${curY.toFixed(2)}px) rotate(${curR.toFixed(3)}deg)`;
        if (overlayDiv) overlayDiv.style.transform = `translate(${(-curX).toFixed(2)}px, ${(-curY).toFixed(2)}px)`;

        if (t < 1) {
          shakeHandle.raf = requestAnimationFrame(frame);
        } else {
          document.documentElement.style.transform = '';
          if (overlayDiv) overlayDiv.style.transform = '';
          shakeHandle.raf = null;
        }
      }

      shakeHandle.raf = requestAnimationFrame(frame);
    }

    // noise layer
    function createNoiseLayer() {
      const cw = 240, ch = 160;
      noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = cw;
      noiseCanvas.height = ch;
      noiseCanvas.style.position = 'absolute';
      noiseCanvas.style.top = '0';
      noiseCanvas.style.left = '0';
      noiseCanvas.style.width = `calc(100% * ${NOISE_SCALE})`;
      noiseCanvas.style.height = `calc(100% * ${NOISE_SCALE})`;
      noiseCanvas.style.pointerEvents = 'none';
      noiseCanvas.style.opacity = NOISE_OPACITY;
      noiseCanvas.style.mixBlendMode = 'overlay';
      noiseCanvas.style.imageRendering = 'pixelated';
      noiseCanvas.style.zIndex = '99999991';
      noiseCtx = noiseCanvas.getContext('2d');
      updateNoiseFrame();
      if (overlayDiv) overlayDiv.appendChild(noiseCanvas);
      noiseInterval = setInterval(updateNoiseFrame, noiseUpdateRate);
    }

    function updateNoiseFrame() {
      if (!noiseCtx) return;
      const w = noiseCanvas.width, h = noiseCanvas.height;
      const imageData = noiseCtx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = 120 + (Math.random() * 40 - 20);
        data[i] = data[i+1] = data[i+2] = v;
        data[i+3] = 255;
      }
      noiseCtx.putImageData(imageData, 0, 0);
    }

    function destroyNoiseLayer() {
      if (noiseInterval) clearInterval(noiseInterval);
      noiseInterval = null;
      if (noiseCanvas && noiseCanvas.parentNode) noiseCanvas.parentNode.removeChild(noiseCanvas);
      noiseCanvas = null;
      noiseCtx = null;
    }

    // glow layer – only bright areas will glow due to mix-blend + backdrop-filter
    function createGlowLayer() {
      glowDiv = document.createElement('div');
      glowDiv.style.position = 'absolute';
      glowDiv.style.top = '0';
      glowDiv.style.left = '0';
      glowDiv.style.width = '100%';
      glowDiv.style.height = '100%';
      glowDiv.style.pointerEvents = 'none';
      glowDiv.style.zIndex = '99999992';
      glowDiv.style.isolation = 'isolate';
      glowDiv.style.backdropFilter = `blur(${GLOW_BLUR}px) brightness(${GLOW_BRIGHTNESS}) saturate(1.15)`;
      glowDiv.style.mixBlendMode = 'screen';
      glowDiv.style.opacity = String(GLOW_OPACITY);
      glowDiv.style.background = 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.28), rgba(255,255,255,0.06) 22%, rgba(255,255,255,0) 45%)';
      glowDiv.style.filter = `blur(${Math.max(2, Math.round(GLOW_BLUR * 0.18))}px)`;
      if (overlayDiv) overlayDiv.appendChild(glowDiv);
    }

    function destroyGlowLayer() {
      if (glowDiv && glowDiv.parentNode) glowDiv.parentNode.removeChild(glowDiv);
      glowDiv = null;
    }

    // face image
    function createFaceLayer() {
      const faces = ['face1.png', 'face2.png', 'face3.png']; // passe Dateinamen an
      const randomFace = faces[Math.floor(Math.random() * faces.length)];
      faceImg = document.createElement('img');
      faceImg.src = chrome.runtime.getURL(`utils/face/${randomFace}`);
      faceImg.style.position = 'fixed';
      faceImg.style.top = '50%';
      faceImg.style.left = '50%';
      faceImg.style.transform = 'translate(-50%,-50%)';
      faceImg.style.maxWidth = '50%';
      faceImg.style.maxHeight = '50%';
      faceImg.style.pointerEvents = 'none';
      faceImg.style.zIndex = '99999993';
      // apply same look as overlay (grayscale + contrast/brightness)
      faceImg.style.filter = `grayscale(1) brightness(0.72) contrast(${CONTRAST_AMOUNT})`;
      faceImg.style.mixBlendMode = 'screen';
      if (overlayDiv) overlayDiv.appendChild(faceImg);
    }

    function destroyFaceLayer() {
      if (faceImg && faceImg.parentNode) faceImg.parentNode.removeChild(faceImg);
      faceImg = null;
    }

    // fallback vibration (keeps old behavior if analyser unavailable)
    function startFallbackVibration() {
      if (vibrationInterval) clearInterval(vibrationInterval);
      vibrationInterval = setInterval(() => {
        const tx = (Math.random() * 140 - 70);
        const ty = (Math.random() * 105 - 52.5);
        const tr = (Math.random() * 5 - 2.5);
        startSmoothShake(tx, ty, tr);
      }, 200);
    }

    // ---------------- WebAudio: analyser loop ----------------
    function setupAudioAnalyser() {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        sourceNode = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.7;
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.fftSize);
        return true;
      } catch (e) {
        console.warn('WebAudio nicht verfügbar:', e);
        return false;
      }
    }

    function computeRMS(timeDomainArray) {
      let sum = 0;
      for (let i = 0; i < timeDomainArray.length; i++) {
        const v = (timeDomainArray[i] - 128) / 128; // -1..1
        sum += v * v;
      }
      return Math.sqrt(sum / timeDomainArray.length);
    }

    function analyserLoop() {
      if (!analyser) return;
      analyser.getByteTimeDomainData(dataArray);
      const rms = computeRMS(dataArray);
      const now = performance.now();

      // update adaptive baseline faster to track ambient
      adaptiveThreshold = adaptiveThreshold * 0.94 + rms * 0.06;
      const threshold = Math.max(adaptiveThreshold * THRESH_MULT, 0.008);

      // if we detect a peak above threshold and not too soon after last, trigger a shake scaled by loudness
      if (rms > threshold && (now - lastBeatTime) > minBeatGap) {
        lastBeatTime = now;
        // multiplier proportional to how far rms is above threshold
        let multiplier = (rms / threshold);
        // clamp and smooth multiplier range
        multiplier = Math.min(MAX_MULTIPLIER, Math.max(0.6, multiplier));
        // compute target amplitudes proportional to multiplier
        const tx = BASE_X * multiplier;
        const ty = BASE_Y * multiplier;
        const tr = BASE_R * multiplier;
        startSmoothShake(tx, ty, tr);
      }

      // optional: small continuous micro-shake proportional to rms (commented out)
      // const micro = Math.min(0.45, rms * 1.8);
      // document.documentElement.style.transform = `translate(${micro}px, ${micro}px)`;

      rafId = requestAnimationFrame(analyserLoop);
    }

    // cleanup audio analyser
    function destroyAnalyser() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      try {
        if (sourceNode) { try { sourceNode.disconnect(); } catch (e) {} sourceNode = null; }
        if (analyser) { try { analyser.disconnect(); } catch (e) {} analyser = null; }
        if (audioCtx) { if (typeof audioCtx.close === 'function') audioCtx.close().catch(()=>{}); audioCtx = null; }
      } catch (e) {
        console.warn('Fehler beim Schließen des AudioContext:', e);
      }
    }

    // stop everything
    function stopEditMoment() {
      if (!isActive) return;
      isActive = false;

      if (vibrationInterval) {
        clearInterval(vibrationInterval);
        vibrationInterval = null;
      }
      if (shakeHandle.raf) {
        cancelAnimationFrame(shakeHandle.raf);
        shakeHandle.raf = null;
      }

      destroyNoiseLayer();
      destroyGlowLayer();
      destroyFaceLayer();
      destroyAnalyser();

      if (overlayDiv) {
        overlayDiv.style.transform = '';
        overlayDiv.remove();
        overlayDiv = null;
      }

      removeFreezeStyles();
      document.removeEventListener('keydown', blockKeys, true);
      document.removeEventListener('keyup', blockKeys, true);

      if (audio) {
        try { audio.pause(); audio.src = ''; audio.load(); } catch (e) {}
        audio = null;
      }
    }

    // start
    function startEditMoment() {
      if (isActive) return;

      const audioUrl = chrome.runtime.getURL('utils/edit.mp3');
      audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audio.crossOrigin = "anonymous";

      isActive = true;

      overlayDiv = document.createElement('div');
      overlayDiv.className = 'edit-moment-overlay';
      overlayDiv.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.17);backdrop-filter:grayscale(1) brightness(0.72) contrast(${CONTRAST_AMOUNT});pointer-events:auto;z-index:9999999;overflow:hidden;`;
      document.body.appendChild(overlayDiv);

      createGlowLayer();
      createNoiseLayer();
      createFaceLayer();

      injectFreezeStyles();
      document.addEventListener('keydown', blockKeys, true);
      document.addEventListener('keyup', blockKeys, true);

      audio.currentTime = 0;
      const play = audio.play();
      if (play !== undefined) {
        play.catch(e => console.warn('Sound konnte nicht abgespielt werden:', e));
      }

      // try webaudio analyser; if not available, fall back to fixed interval
      const ok = setupAudioAnalyser();
      if (ok) {
        // resume context if suspended by autoplay policy
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(()=>{});
        }
        lastBeatTime = performance.now();
        rafId = requestAnimationFrame(analyserLoop);
      } else {
        startFallbackVibration();
      }

      audio.addEventListener('ended', () => { if (isActive) stopEditMoment(); });
    }

    // button handler
    editBtn.onclick = () => { if (!isActive) startEditMoment(); else stopEditMoment(); };
    window.addEventListener('beforeunload', () => { stopEditMoment(); });

    return editBtn;
  };
})();