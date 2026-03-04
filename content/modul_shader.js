
(function() {
  const t = window.taming;

  
  t.shaderModul = function(overlay) {
    
    
    
    let btn;
    try {
      btn = t.createIconButton('shader', 56, 65, 35);
    } catch (e) {
      btn = t.createButton('Shader');
      btn.style.width = '56px';
      btn.style.height = '65px';
      btn.style.fontSize = '11px';
      btn.style.lineHeight = '16px';
      btn.style.padding = '0';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
    }

    
    
    
    const win = t.createWindow('Shader Controller', '120px', '120px', '320px', '220px');
    win.style.display = 'none';
    btn.onclick = () => {
      win.style.display = win.style.display === 'none' ? 'block' : 'none';
    };

    
    
    
    const container = document.createElement('div');
    container.style.padding = '6px';
    win.appendChild(container);

    
    const statusDiv = document.createElement('div');
    statusDiv.style.margin = '4px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Shader: Aus';
    container.appendChild(statusDiv);

    
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Shader aktivieren';
    toggleBtn.style.width = '100%';
    toggleBtn.style.margin = '4px 0';
    toggleBtn.style.padding = '4px';
    toggleBtn.style.background = 'rgba(255,255,255,0.12)';
    toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
    toggleBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    toggleBtn.style.borderRadius = '8px';
    toggleBtn.style.cursor = 'pointer';
    container.appendChild(toggleBtn);

    
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

    
    
    
    let active = false;

    function updateShader(intensity) {
      
      
      console.log('Shader Intensität:', intensity);
    }

    function enableShader() {
      statusDiv.innerHTML = 'Shader: Aktiv';
      updateShader(slider.value);
    }

    function disableShader() {
      statusDiv.innerHTML = 'Shader: Aus';
      
      
      console.log('Shader deaktiviert');
    }

    toggleBtn.onclick = () => {
      active = !active;
      if (active) {
        toggleBtn.textContent = 'Shader deaktivieren';
        toggleBtn.style.background = 'var(--qt-accent, #b78bff)';
        toggleBtn.style.color = '#111';
        enableShader();
      } else {
        toggleBtn.textContent = 'Shader aktivieren';
        toggleBtn.style.background = 'rgba(255,255,255,0.12)';
        toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
        disableShader();
      }
    };

    
    
    
    window.addEventListener('beforeunload', () => {
      if (active) disableShader();
    });

    return btn;
  };
})();
