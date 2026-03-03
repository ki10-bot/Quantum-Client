// content/aimhelper.js
(function() {
  const t = window.taming;

  t.aimHelper = function(overlay) {
    // ------------------------------------------------------------
    // 1. Button mit Fallback
    // ------------------------------------------------------------
    let aimBtn;
    try {
      aimBtn = t.createIconButton('aim', 56, 65, 35);
    } catch (e) {
      aimBtn = t.createButton('🎯');
      aimBtn.style.width = '56px';
      aimBtn.style.height = '65px';
      aimBtn.style.fontSize = '24px';
      aimBtn.style.lineHeight = '65px';
      aimBtn.style.padding = '0';
    }

    const aimWin = t.createWindow('Zielhilfe Pro', '400px', '250px', '380px', '600px');
    aimWin.style.display = 'none';

    aimBtn.onclick = () => {
      aimWin.style.display = aimWin.style.display === 'none' ? 'block' : 'none';
    };

    // ------------------------------------------------------------
    // 2. UI-Elemente für Einstellungen
    // ------------------------------------------------------------
    const container = document.createElement('div');
    container.style.padding = '4px';
    aimWin.appendChild(container);

    // Aktivierungsschalter
    const toggleDiv = document.createElement('div');
    toggleDiv.style.margin = '4px';
    const toggleCheck = document.createElement('input');
    toggleCheck.type = 'checkbox';
    toggleCheck.id = 'aim-active';
    toggleCheck.checked = false;
    const toggleLabel = document.createElement('label');
    toggleLabel.htmlFor = 'aim-active';
    toggleLabel.textContent = ' Zielhilfe aktivieren';
    toggleDiv.appendChild(toggleCheck);
    toggleDiv.appendChild(toggleLabel);
    container.appendChild(toggleDiv);

    // ---- Sichtbarkeitsoptionen ----
    const visDiv = document.createElement('div');
    visDiv.style.margin = '8px 4px';
    visDiv.style.borderTop = '1px solid #444';
    visDiv.style.paddingTop = '4px';
    container.appendChild(visDiv);

    const lineCheck = createCheckbox('line', 'Linie zur Mitte', true);
    const circleCheck = createCheckbox('circle', 'Kreis', true);
    const angleCheck = createCheckbox('angle', 'Winkel anzeigen', true);
    const coordsCheck = createCheckbox('coords', 'Mauskoordinaten', true);
    const clickCheck = createCheckbox('click', 'Klick-Status', true);

    visDiv.appendChild(lineCheck);
    visDiv.appendChild(circleCheck);
    visDiv.appendChild(angleCheck);
    visDiv.appendChild(coordsCheck);
    visDiv.appendChild(clickCheck);

    function createCheckbox(id, labelText, defaultValue) {
      const div = document.createElement('div');
      div.style.margin = '2px 0';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = 'aim-' + id;
      cb.checked = defaultValue;
      const lbl = document.createElement('label');
      lbl.htmlFor = 'aim-' + id;
      lbl.textContent = ' ' + labelText;
      div.appendChild(cb);
      div.appendChild(lbl);
      return div;
    }

    // ---- Leuchteffekt (Glow) ----
    const glowDiv = document.createElement('div');
    glowDiv.style.margin = '8px 4px';
    glowDiv.style.borderTop = '1px solid #444';
    glowDiv.style.paddingTop = '4px';
    container.appendChild(glowDiv);

    const glowCheck = createCheckbox('glow', 'Leuchteffekt', false);
    glowDiv.appendChild(glowCheck);

    const glowStrengthDiv = document.createElement('div');
    glowStrengthDiv.style.margin = '4px 0 0 20px';
    glowStrengthDiv.innerHTML = '<span style="font-size:12px;">Stärke: <span id="aim-glow-value">4</span>px</span>';
    const glowSlider = document.createElement('input');
    glowSlider.type = 'range';
    glowSlider.min = 0;
    glowSlider.max = 20;
    glowSlider.value = 4;
    glowSlider.style.width = '100%';
    glowStrengthDiv.appendChild(glowSlider);
    glowDiv.appendChild(glowStrengthDiv);

    // ---- Radius-Slider ----
    const radiusDiv = document.createElement('div');
    radiusDiv.style.margin = '8px 4px';
    radiusDiv.innerHTML = '<div style="font-size:12px;">Kreis-Radius: <span id="aim-radius-value">170</span>px</div>';
    const radiusSlider = document.createElement('input');
    radiusSlider.type = 'range';
    radiusSlider.min = 20;
    radiusSlider.max = 500;
    radiusSlider.value = 170;
    radiusSlider.style.width = '100%';
    radiusDiv.appendChild(radiusSlider);
    container.appendChild(radiusDiv);

    // ---- Abstand des Winkels vom Kreis ----
    const offsetDiv = document.createElement('div');
    offsetDiv.style.margin = '8px 4px';
    offsetDiv.innerHTML = '<div style="font-size:12px;">Abstand Winkel vom Kreis: <span id="aim-offset-value">20</span>px</div>';
    const offsetSlider = document.createElement('input');
    offsetSlider.type = 'range';
    offsetSlider.min = 0;
    offsetSlider.max = 100;
    offsetSlider.value = 20;
    offsetSlider.style.width = '100%';
    offsetDiv.appendChild(offsetSlider);
    container.appendChild(offsetDiv);

    // ---- Farboptionen ----
    const colorDiv = document.createElement('div');
    colorDiv.style.margin = '8px 4px';
    colorDiv.style.borderTop = '1px solid #444';
    colorDiv.style.paddingTop = '4px';
    container.appendChild(colorDiv);

    colorDiv.appendChild(createColorPicker('line-color', 'Linienfarbe', '#03fc88'));
    colorDiv.appendChild(createColorPicker('circle-color', 'Kreisfarbe', '#03fc88'));
    colorDiv.appendChild(createColorPicker('text-color', 'Textfarbe', '#40bd5b'));
    colorDiv.appendChild(createColorPicker('click-true', 'Klick = true Farbe', '#11f041'));
    colorDiv.appendChild(createColorPicker('click-false', 'Klick = false Farbe', '#f01149'));

    function createColorPicker(id, labelText, defaultValue) {
      const div = document.createElement('div');
      div.style.margin = '2px 0';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      const lbl = document.createElement('span');
      lbl.textContent = labelText + ': ';
      lbl.style.width = '100px';
      lbl.style.fontSize = '12px';
      const input = document.createElement('input');
      input.type = 'color';
      input.id = 'aim-' + id;
      input.value = defaultValue;
      input.style.width = '50px';
      input.style.height = '25px';
      div.appendChild(lbl);
      div.appendChild(input);
      return div;
    }

    // ------------------------------------------------------------
    // 3. Canvas für die Zeichnung
    // ------------------------------------------------------------
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10000000';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ------------------------------------------------------------
    // 4. Zustand und Listener
    // ------------------------------------------------------------
    let active = false;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let mouseDown = false;

    function onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    function onMouseDown() {
      mouseDown = true;
    }
    function onMouseUp() {
      mouseDown = false;
    }

    function addListeners() {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mouseup', onMouseUp);
    }
    function removeListeners() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    }

    // ------------------------------------------------------------
    // 5. Zeichen-Funktion mit Glow
    // ------------------------------------------------------------
    function draw() {
      if (!active) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = parseInt(radiusSlider.value);
      const offset = parseInt(offsetSlider.value);

      // Optionen
      const showLine = document.getElementById('aim-line')?.checked ?? true;
      const showCircle = document.getElementById('aim-circle')?.checked ?? true;
      const showAngle = document.getElementById('aim-angle')?.checked ?? true;
      const showCoords = document.getElementById('aim-coords')?.checked ?? true;
      const showClick = document.getElementById('aim-click')?.checked ?? true;
      const glowEnabled = document.getElementById('aim-glow')?.checked ?? false;
      const glowStrength = parseInt(glowSlider.value);

      // Farben
      const lineColor = document.getElementById('aim-line-color')?.value || '#03fc88';
      const circleColor = document.getElementById('aim-circle-color')?.value || '#03fc88';
      const textColor = document.getElementById('aim-text-color')?.value || '#40bd5b';
      const clickTrueColor = document.getElementById('aim-click-true')?.value || '#11f041';
      const clickFalseColor = document.getElementById('aim-click-false')?.value || '#f01149';

      // Glow-Pass (weiche, dicke Linien)
      if (glowEnabled && (showLine || showCircle)) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 2 + glowStrength; // Basis 2 + zusätzliche Stärke

        if (showLine) {
          ctx.beginPath();
          ctx.moveTo(mouseX, mouseY);
          ctx.lineTo(centerX, centerY);
          ctx.strokeStyle = lineColor;
          ctx.stroke();
        }

        if (showCircle) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.strokeStyle = circleColor;
          ctx.stroke();
        }

        ctx.restore();
      }

      // Normal-Pass (scharfe Linien)
      ctx.save();
      ctx.lineWidth = 2;

      if (showLine) {
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY);
        ctx.lineTo(centerX, centerY);
        ctx.strokeStyle = lineColor;
        ctx.stroke();
      }

      if (showCircle) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = circleColor;
        ctx.stroke();
      }

      // Winkel berechnen
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      let angleRad = Math.atan2(dy, dx);
      let angleDeg = angleRad * (180 / Math.PI);
      if (angleDeg < 0) angleDeg += 360;
      const angleText = `${angleDeg.toFixed(1)}°`;

      // Winkel anzeigen
      if (showAngle) {
        ctx.font = "16px Arial";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(angleText, centerX, centerY - radius - offset);
      }

      // Mauskoordinaten
      if (showCoords) {
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = textColor;
        const coordText = `X: ${mouseX}  Y: ${mouseY}`;
        ctx.fillText(coordText, mouseX + 5, mouseY - 5);
      }

      // Klick-Status
      if (showClick) {
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = textColor;
        ctx.fillText("Click:", mouseX + 5, mouseY + 12);
        ctx.fillStyle = mouseDown ? clickTrueColor : clickFalseColor;
        ctx.fillText(mouseDown ? "true" : "false", mouseX + 50, mouseY + 12);
      }

      ctx.restore();
      requestAnimationFrame(draw);
    }
    draw();

    // ------------------------------------------------------------
    // 6. Aktivierung per Checkbox steuern
    // ------------------------------------------------------------
    toggleCheck.addEventListener('change', (e) => {
      active = e.target.checked;
      if (active) {
        addListeners();
        mouseX = canvas.width / 2;
        mouseY = canvas.height / 2;
      } else {
        removeListeners();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    // Live-Anzeige der Slider-Werte
    function setupLiveSpan(slider, spanId) {
      const span = document.getElementById(spanId);
      if (span) {
        span.textContent = slider.value;
        slider.addEventListener('input', () => {
          span.textContent = slider.value;
        });
      }
    }

    // Nachdem das DOM fertig ist, die Spans verbinden
    setTimeout(() => {
      setupLiveSpan(radiusSlider, 'aim-radius-value');
      setupLiveSpan(offsetSlider, 'aim-offset-value');
      setupLiveSpan(glowSlider, 'aim-glow-value');
    }, 0);

    // ------------------------------------------------------------
    // 7. Aufräumen beim Entladen
    // ------------------------------------------------------------
    window.addEventListener('beforeunload', () => {
      removeListeners();
      canvas.remove();
    });

    return aimBtn;
  };
})();