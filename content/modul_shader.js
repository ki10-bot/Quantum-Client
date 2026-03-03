// content/modul_shader.js
(function() {
  const t = window.taming;

  /**
   * Modul: Shader Controller
   * Beschreibung: Aktiviert/Deaktiviert Shader und passt Effekte an
   * Icon: shader.png (im icons-Ordner)
   */
  t.shaderModul = function(overlay) {
    // ------------------------------------------------------------
    // 1. Button mit Fallback
    // ------------------------------------------------------------
    let btn;
    try {
      btn = t.createIconButton('shader', 56, 65, 35);
    } catch (e) {
      btn = t.createButton('🎨');
      btn.style.width = '56px';
      btn.style.height = '65px';
      btn.style.fontSize = '24px';
      btn.style.lineHeight = '65px';
      btn.style.padding = '0';
    }

    // ------------------------------------------------------------
    // 2. Fenster erstellen
    // ------------------------------------------------------------
    const win = t.createWindow('Shader Controller', '120px', '120px', '320px', '220px');
    win.style.display = 'none';
    btn.onclick = () => {
      win.style.display = win.style.display === 'none' ? 'block' : 'none';
    };

    // ------------------------------------------------------------
    // 3. UI-Elemente
    // ------------------------------------------------------------
    const container = document.createElement('div');
    container.style.padding = '6px';
    win.appendChild(container);

    // Status
    const statusDiv = document.createElement('div');
    statusDiv.style.margin = '4px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Shader: Aus';
    container.appendChild(statusDiv);

    // Aktivierungs-Button
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Shader aktivieren';
    toggleBtn.style.width = '100%';
    toggleBtn.style.margin = '4px 0';
    toggleBtn.style.padding = '4px';
    toggleBtn.style.background = '#4a6';
    toggleBtn.style.color = '#fff';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '4px';
    toggleBtn.style.cursor = 'pointer';
    container.appendChild(toggleBtn);

    // Slider für Intensität
    const sliderLabel = document.createElement('div');
    sliderLabel.style.fontSize = '12px';
    sliderLabel.style.margin = '4px 0';
    sliderLabel.innerHTML = 'Intensität: <span id="shader-value">50</span>';
    container.appendChild(sliderLabel);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = 100;
    slider.value = 50;
    slider.style.width = '100%';
    slider.addEventListener('input', () => {
      document.getElementById('shader-value').textContent = slider.value;
      if (active) updateShader(slider.value);
    });
    container.appendChild(slider);

    // ------------------------------------------------------------
    // 4. Zustand und Shader-Logik
    // ------------------------------------------------------------
    let active = false;

    function updateShader(intensity) {
      // Beispiel: Shader-Logik (hier musst du deine Shader-Integration einfügen)
      // z.B. t.renderer.setShaderIntensity(intensity/100);
      console.log('Shader Intensität:', intensity);
    }

    function enableShader() {
      statusDiv.innerHTML = 'Shader: Aktiv';
      updateShader(slider.value);
    }

    function disableShader() {
      statusDiv.innerHTML = 'Shader: Aus';
      // Shader zurücksetzen
      // z.B. t.renderer.disableShader();
      console.log('Shader deaktiviert');
    }

    toggleBtn.onclick = () => {
      active = !active;
      if (active) {
        toggleBtn.textContent = 'Shader deaktivieren';
        toggleBtn.style.background = '#a44';
        enableShader();
      } else {
        toggleBtn.textContent = 'Shader aktivieren';
        toggleBtn.style.background = '#4a6';
        disableShader();
      }
    };

    // ------------------------------------------------------------
    // 5. Aufräumen beim Entladen der Seite
    // ------------------------------------------------------------
    window.addEventListener('beforeunload', () => {
      if (active) disableShader();
    });

    return btn;
  };
})();