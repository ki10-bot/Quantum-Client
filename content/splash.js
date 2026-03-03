// content/splash.js
(function() {
  if (window.__splashShown) return;
  window.__splashShown = true;

  const logoUrl = chrome.runtime.getURL('utils/logo.png');
  const soundUrl = chrome.runtime.getURL('utils/startup.mp3');

  // Schriftart einbinden
  function loadFont() {
    const fontUrl = chrome.runtime.getURL('fonts/font2.ttf'); // ggf. anpassen
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
  loadFont();

  // Audio (kann blockiert werden – Fehler wird abgefangen)
  const audio = document.createElement('audio');
  audio.src = soundUrl;
  audio.preload = 'auto';
  audio.volume = 1.0;
  audio.play().catch(e => console.warn('Sound konnte nicht abgespielt werden:', e));

  // Haupt-Overlay (schwarzer Hintergrund)
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: black;
    z-index: 9999999;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 1s ease;
    opacity: 1;
  `;

  // === Lichteffekte mit Frosted-Glas-Optik (dezenter) ===
  // Violettes Licht von unten rechts
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

  // Aqua-grünes Licht von oben links
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

  // Content-Container (Logo + Text) – mit höherem z-index
  const content = document.createElement('div');
  content.style.cssText = `
    display: flex;
    align-items: center;
    gap: 40px;
    opacity: 0;
    transition: opacity 1s ease;
    z-index: 2;
  `;

  // Logo
  const img = document.createElement('img');
  img.src = logoUrl;
  img.style.cssText = `
    width: 30%;
    max-width: 300px;
    height: auto;
  `;

  // Text-Container
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

  // Bild laden, dann Sequenz starten
  const imgLoader = new Image();
  imgLoader.onload = () => {
    // Timing: 1s Fade in, 2s Pause, 1s Fade out = 4s gesamt
    setTimeout(() => {
      content.style.opacity = '1'; // Fade in (1s)
    }, 1000);

    setTimeout(() => {
      overlay.style.opacity = '0'; // Fade out (1s)
    }, 3000);

    setTimeout(() => {
      overlay.remove();
    }, 4000);
  };
  imgLoader.onerror = () => {
    console.error('Logo nicht gefunden:', logoUrl);
    setTimeout(() => {
      overlay.style.opacity = '0';
    }, 2000);
    setTimeout(() => {
      overlay.remove();
    }, 3000);
  };
  imgLoader.src = logoUrl;
})();