// content/range.js
(function() {
  const t = window.taming;

  t.range = function(overlay) {
    
    let rangeBtn;
    try {
      rangeBtn = t.createIconButton('range', 56, 65, 35);
    } catch (e) {
      rangeBtn = t.createButton('Range');
      rangeBtn.style.width = '56px';
      rangeBtn.style.height = '65px';
      rangeBtn.style.fontSize = '12px';
      rangeBtn.style.lineHeight = '16px';
      rangeBtn.style.padding = '0';
      rangeBtn.style.display = 'flex';
      rangeBtn.style.alignItems = 'center';
      rangeBtn.style.justifyContent = 'center';
    }

    const rangeWin = t.createWindow('Zielhilfe', '400px', '250px', '280px', '280px');
    rangeWin.style.display = 'none';

    rangeBtn.onclick = () => {
      rangeWin.style.display = rangeWin.style.display === 'none' ? 'block' : 'none';
    };

    
    const statusDiv = document.createElement('div');
    statusDiv.style.padding = '8px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Einstellungen';
    rangeWin.appendChild(statusDiv);

    
    const styleContainer = document.createElement('div');
    styleContainer.style.display = 'flex';
    styleContainer.style.flexWrap = 'wrap';
    styleContainer.style.gap = '4px';
    styleContainer.style.margin = '4px';
    rangeWin.appendChild(styleContainer);

    const styles = [
      { value: 'circle', label: 'Kreis', icon: 'O' },
      { value: 'cross', label: 'Fadenkreuz', icon: '+' },
      { value: 'circle_cross', label: 'Kreis + Kreuz', icon: 'O+' },
      { value: 'dot', label: 'Punkt', icon: '.' },
      { value: 'target', label: 'Zielscheibe', icon: 'T' },
      { value: 'reticle', label: 'Fadenkreuz mit Ring', icon: 'R' },
      { value: 'none', label: 'Keine', icon: 'X' }
    ];

    const styleButtons = [];
    let activeStyle = 'circle';

    styles.forEach(s => {
      const btn = document.createElement('button');
      btn.textContent = s.icon;
      btn.title = s.label;
      btn.style.width = '40px';
      btn.style.height = '40px';
      btn.style.borderRadius = '50%';
      btn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
      btn.style.background = 'var(--qt-bg, rgba(24, 26, 34, 0.9))';
      btn.style.color = 'var(--qt-text, #eaf1ff)';
      btn.style.fontSize = '18px';
      btn.style.cursor = 'pointer';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.dataset.value = s.value;

      btn.onclick = () => {
        activeStyle = s.value;
        currentStyle = s.value;
        styleButtons.forEach(b => b.style.background = 'var(--qt-bg, rgba(24, 26, 34, 0.9))');
        btn.style.background = 'var(--qt-accent, #b78bff)';
      };

      styleContainer.appendChild(btn);
      styleButtons.push(btn);
    });

    
    styleButtons[0].style.background = 'var(--qt-accent, #b78bff)';
    

    
    const radiusLabel = document.createElement('div');
    radiusLabel.style.fontSize = '12px';
    radiusLabel.style.margin = '4px';
    radiusLabel.textContent = 'Größe: 50px';
    rangeWin.appendChild(radiusLabel);

    const radiusSlider = document.createElement('input');
    radiusSlider.type = 'range';
    radiusSlider.min = 10;
    radiusSlider.max = 300;
    radiusSlider.value = 50;
    radiusSlider.style.width = '100%';
    rangeWin.appendChild(radiusSlider);

    
    const colorLabel = document.createElement('div');
    colorLabel.style.fontSize = '12px';
    colorLabel.style.margin = '4px';
    colorLabel.textContent = 'Farbe:';
    rangeWin.appendChild(colorLabel);

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#ff0000';
    colorInput.style.margin = '4px';
    colorInput.style.width = '100%';
    rangeWin.appendChild(colorInput);

    
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Aktivieren';
    toggleBtn.style.margin = '4px';
    toggleBtn.style.padding = '4px 8px';
    toggleBtn.style.background = 'var(--qt-accent, #b78bff)';
    toggleBtn.style.color = '#0c0f16';
    toggleBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    toggleBtn.style.borderRadius = '4px';
    toggleBtn.style.cursor = 'pointer';
    rangeWin.appendChild(toggleBtn);

    
    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.style.position = 'fixed';
    overlayCanvas.style.top = '0';
    overlayCanvas.style.left = '0';
    overlayCanvas.style.width = '100%';
    overlayCanvas.style.height = '100%';
    overlayCanvas.style.pointerEvents = 'none';
    overlayCanvas.style.zIndex = '999999';
    document.body.appendChild(overlayCanvas);
    const ctx = overlayCanvas.getContext('2d');

    function resize() {
      overlayCanvas.width = window.innerWidth;
      overlayCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    
    let active = false;
    let mouseX = 0, mouseY = 0;
    let radius = 50;
    let color = '#ff0000';
    let currentStyle = 'circle';

    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    
    radiusSlider.oninput = () => {
      radius = parseInt(radiusSlider.value);
      radiusLabel.textContent = 'Größe: ' + radius + 'px';
    };

    colorInput.oninput = () => {
      color = colorInput.value;
    };

    toggleBtn.onclick = () => {
      active = !active;
      toggleBtn.textContent = active ? 'Deaktivieren' : 'Aktivieren';
      toggleBtn.style.background = active ? 'rgba(255, 120, 120, 0.35)' : 'var(--qt-accent, #b78bff)';
      toggleBtn.style.color = active ? 'var(--qt-text, #eaf1ff)' : '#0c0f16';
    };

    
    function draw() {
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      if (active && currentStyle !== 'none') {
        ctx.strokeStyle = color;
        ctx.fillStyle = color + '33'; 
        ctx.lineWidth = 2;

        switch (currentStyle) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            break;

          case 'cross':
            ctx.beginPath();
            ctx.moveTo(mouseX - radius, mouseY);
            ctx.lineTo(mouseX + radius, mouseY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY - radius);
            ctx.lineTo(mouseX, mouseY + radius);
            ctx.stroke();
            break;

          case 'circle_cross':
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(mouseX - radius, mouseY);
            ctx.lineTo(mouseX + radius, mouseY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY - radius);
            ctx.lineTo(mouseX, mouseY + radius);
            ctx.stroke();
            break;

          case 'dot':
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            break;

          case 'target':
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, radius / 2, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            break;

          case 'reticle':
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mouseX - radius, mouseY);
            ctx.lineTo(mouseX + radius, mouseY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY - radius);
            ctx.lineTo(mouseX, mouseY + radius);
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(mouseX - radius, mouseY, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mouseX + radius, mouseY, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mouseX, mouseY - radius, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mouseX, mouseY + radius, 3, 0, 2 * Math.PI);
            ctx.fill();
            break;
        }
      }
      requestAnimationFrame(draw);
    }
    draw();

    
    window.addEventListener('beforeunload', () => {
      overlayCanvas.remove();
    });

    return rangeBtn;
  };
})();
