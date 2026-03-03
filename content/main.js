// content/main.js
(function() {
  if (window.tamingOverlayLoaded) return;
  window.tamingOverlayLoaded = true;

  const t = window.taming;

  // Hauptfenster
  const overlay = t.createWindow('', localStorage.getItem('overlayTop') || '100px', localStorage.getItem('overlayLeft') || '100px');
  overlay.id = 'taming-overlay';
  overlay.style.position = 'relative';
  overlay.style.padding = '4px 10px';
  overlay.style.minWidth = '200px';

  // Container für die Modul-Buttons
  const modulesWrapper = document.createElement('div');
  modulesWrapper.style.display = 'flex';
  modulesWrapper.style.flexWrap = 'nowrap';
  modulesWrapper.style.gap = '4px';
  modulesWrapper.style.justifyContent = 'center';
  modulesWrapper.style.transition = 'opacity 0.2s ease';
  modulesWrapper.style.opacity = '1';
  overlay.appendChild(modulesWrapper);

  // Keybind-Box erstellen
  t.keybindBox = t.createWindow('Keybind', '50%', '50%', '220px', '60px');
  t.keybindBox.style.transform = 'translate(-50%, -50%)';
  t.keybindBox.style.fontSize = '16px';
  t.keybindBox.style.display = 'none';

  // Module initialisieren und Buttons sammeln
  const moduleButtons = [];

  // Graph
  const graphBtn = t.graph(overlay);
  if (graphBtn) {
    moduleButtons.push(graphBtn);
    t.buttons.push(graphBtn);
    t.attachKeybind(graphBtn);
    modulesWrapper.appendChild(graphBtn);
  }

  // Scale
  const scaleBtn = t.scale(overlay);
  if (scaleBtn) {
    moduleButtons.push(scaleBtn);
    t.buttons.push(scaleBtn);
    t.attachKeybind(scaleBtn);
    modulesWrapper.appendChild(scaleBtn);
  }

  // Automation
  const autoBtn = t.automation(overlay);
  if (autoBtn) {
    moduleButtons.push(autoBtn);
    t.buttons.push(autoBtn);
    t.attachKeybind(autoBtn);
    modulesWrapper.appendChild(autoBtn);
  }

  // ESP
  const espBtn = t.esp(overlay);
  if (espBtn) {
    moduleButtons.push(espBtn);
    t.buttons.push(espBtn);
    t.attachKeybind(espBtn);
    modulesWrapper.appendChild(espBtn);
  }

  // Themer
  const themeBtn = t.themer(overlay);
  if (themeBtn) {
    moduleButtons.push(themeBtn);
    t.buttons.push(themeBtn);
    t.attachKeybind(themeBtn);
    modulesWrapper.appendChild(themeBtn);
  }

  // Tracker
  const trackerBtn = t.tracker(overlay);
  if (trackerBtn) {
    moduleButtons.push(trackerBtn);
    t.buttons.push(trackerBtn);
    t.attachKeybind(trackerBtn);
    modulesWrapper.appendChild(trackerBtn);
  }
  // In main.js nach den anderen Modulen:
  const netBtn = t.network(overlay);
  if (netBtn) {
    moduleButtons.push(netBtn);
    t.buttons.push(netBtn);
    t.attachKeybind(netBtn);
    modulesWrapper.appendChild(netBtn);
  }
  
  const rangeBtn = t.range(overlay);
  if (rangeBtn) {
    moduleButtons.push(rangeBtn);
    t.buttons.push(rangeBtn);
    t.attachKeybind(rangeBtn);
    modulesWrapper.appendChild(rangeBtn);
  }

  const aimBtn = t.aimHelper(overlay);
  if (aimBtn) {
    moduleButtons.push(aimBtn);
    t.buttons.push(aimBtn);
    t.attachKeybind(aimBtn);
    modulesWrapper.appendChild(aimBtn);
  }

  const statsBtn = t.mouseStats(overlay);
  if (statsBtn) {
    moduleButtons.push(statsBtn);
    t.buttons.push(statsBtn);
    t.attachKeybind(statsBtn);
    modulesWrapper.appendChild(statsBtn);
  }

  const keyBtn = t.keyCounter(overlay);
  if (keyBtn) {
    moduleButtons.push(keyBtn);
    t.buttons.push(keyBtn);
    t.attachKeybind(keyBtn);
    modulesWrapper.appendChild(keyBtn);
  }

  const clickerBtn = t.autoClicker(overlay);
  if (clickerBtn) {
    moduleButtons.push(clickerBtn);
    t.buttons.push(clickerBtn);
    t.attachKeybind(clickerBtn);
    modulesWrapper.appendChild(clickerBtn);
  }

  const aiBtn = t.aiTracker(overlay);
  if (aiBtn) {
    moduleButtons.push(aiBtn);
    t.buttons.push(aiBtn);
    t.attachKeybind(aiBtn);
    modulesWrapper.appendChild(aiBtn);
  }

  const markerBtn = t.markers(overlay);
  if (markerBtn) {
    moduleButtons.push(markerBtn);
    t.buttons.push(markerBtn);
    t.attachKeybind(markerBtn);
    modulesWrapper.appendChild(markerBtn);
  }

  const vsBtn = t.visualSearcher(overlay);
  if (vsBtn) {
    moduleButtons.push(vsBtn);
    t.buttons.push(vsBtn);
    t.attachKeybind(vsBtn);
    modulesWrapper.appendChild(vsBtn);
  }

  const shaderBtn = t.shaderHacker(overlay);
  if (shaderBtn) {
    moduleButtons.push(shaderBtn);
    t.buttons.push(shaderBtn);
    t.attachKeybind(shaderBtn);
    modulesWrapper.appendChild(shaderBtn);
  }

  const editBtn = t.editMoment(overlay);
  if (editBtn) {
    moduleButtons.push(editBtn);
    t.buttons.push(editBtn);
    t.attachKeybind(editBtn);
    modulesWrapper.appendChild(editBtn);
  }

  const macroBtn = t.macroRecorder(overlay);
  if (macroBtn) {
    moduleButtons.push(macroBtn);
    t.buttons.push(macroBtn);
    t.attachKeybind(macroBtn);
    modulesWrapper.appendChild(macroBtn);
  }

    // Nach den anderen Modulen
  const hiderBtn = t.adblockHider(overlay);
  if (hiderBtn) {
    moduleButtons.push(hiderBtn);
    t.buttons.push(hiderBtn);
    t.attachKeybind(hiderBtn);
    modulesWrapper.appendChild(hiderBtn);
  }

  const themeChangerBtn = t.themeChanger(overlay);
  if (themeChangerBtn) {
    moduleButtons.push(themeChangerBtn);
    t.buttons.push(themeChangerBtn);
    t.attachKeybind(themeChangerBtn);
    modulesWrapper.appendChild(themeChangerBtn);
  }

  // Navigation (Pfeile) – benötigt moduleButtons
  t.navigation(overlay, moduleButtons);
  t.quantumMenu();
})();