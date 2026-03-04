// content/markers.js
(function() {
  const t = window.taming;

  t.markers = function(overlay) {
    
    
    
    let markerBtn;
    try {
      markerBtn = t.createIconButton('marker', 56, 65, 35);
    } catch (e) {
      markerBtn = t.createButton('Mark');
      markerBtn.style.width = '56px';
      markerBtn.style.height = '65px';
      markerBtn.style.fontSize = '11px';
      markerBtn.style.lineHeight = '16px';
      markerBtn.style.padding = '0';
      markerBtn.style.display = 'flex';
      markerBtn.style.alignItems = 'center';
      markerBtn.style.justifyContent = 'center';
    }

    const markerWin = t.createWindow('Screen-Marker', '400px', '250px', '300px', '300px');
    markerWin.style.display = 'none';

    markerBtn.onclick = () => {
      markerWin.style.display = markerWin.style.display === 'none' ? 'block' : 'none';
    };

    
    
    
    const container = document.createElement('div');
    container.style.padding = '4px';
    markerWin.appendChild(container);

    const statusDiv = document.createElement('div');
    statusDiv.style.margin = '4px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Marker: 0';
    container.appendChild(statusDiv);

    const instructions = document.createElement('div');
    instructions.style.margin = '4px';
    instructions.style.fontSize = '12px';
    instructions.style.color = 'var(--qt-text, #eaf1ff)';
    instructions.style.opacity = '0.7';
    instructions.innerHTML = 'Taste zum Setzen: <span id="marker-key">F</span>';
    container.appendChild(instructions);

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.placeholder = 'Taste drücken...';
    keyInput.readOnly = true;
    keyInput.style.width = '100%';
    keyInput.style.margin = '4px 0';
    keyInput.style.background = 'rgba(22, 24, 32, 0.9)';
    keyInput.style.color = 'var(--qt-text, #eaf1ff)';
    keyInput.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    keyInput.style.padding = '4px';
    container.appendChild(keyInput);

    
    let markerKey = 'KeyF';
    keyInput.value = 'F';

    keyInput.addEventListener('click', () => {
      keyInput.value = 'Drücke Taste...';
      const handler = (e) => {
        e.preventDefault();
        markerKey = e.code;
        keyInput.value = e.code.replace('Key', '').replace('Digit', '');
        document.removeEventListener('keydown', handler);
      };
      document.addEventListener('keydown', handler);
    });

    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Alle Marker löschen';
    clearBtn.style.width = '100%';
    clearBtn.style.margin = '4px 0';
    clearBtn.style.padding = '4px';
    clearBtn.style.background = 'rgba(255,255,255,0.08)';
    clearBtn.style.color = 'var(--qt-text, #eaf1ff)';
    clearBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    clearBtn.style.borderRadius = '8px';
    clearBtn.style.cursor = 'pointer';
    container.appendChild(clearBtn);

    
    const listDiv = document.createElement('div');
    listDiv.style.maxHeight = '120px';
    listDiv.style.overflowY = 'auto';
    listDiv.style.fontSize = '12px';
    listDiv.style.marginTop = '4px';
    listDiv.style.background = 'rgba(10, 12, 18, 0.4)';
    listDiv.style.padding = '2px';
    container.appendChild(listDiv);

    
    
    
    let markers = []; 

    
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

    
    function addMarker() {
      const x = t.lastMouseX;
      const y = t.lastMouseY;
      if (x === 0 && y === 0) return;
      const label = `#${markers.length + 1}`;
      markers.push({
        x, y,
        label: label,
        color: '#ffaa00'
      });
      updateList();
    }

    
    function removeMarker(index) {
      markers.splice(index, 1);
      updateList();
    }

    
    function updateList() {
      statusDiv.innerHTML = `Marker: ${markers.length}`;
      listDiv.innerHTML = markers.map((m, i) => {
        return `<div style="display:flex; justify-content:space-between; align-items:center; padding:2px; border-bottom:1px solid rgba(255,255,255,0.08);">
          <span>${m.label}: (${Math.round(m.x)}, ${Math.round(m.y)})</span>
          <button style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); color:var(--qt-text, #eaf1ff); border-radius:6px; cursor:pointer; padding:2px 6px;" data-index="${i}">x</button>
        </div>`;
      }).join('');
      
      listDiv.querySelectorAll('button[data-index]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          removeMarker(index);
        });
      });
    }

    
    function onKeyDown(e) {
      if (e.code === markerKey) {
        addMarker();
      }
    }

    
    let active = false;
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Aktivieren';
    toggleBtn.style.width = '100%';
    toggleBtn.style.margin = '4px 0';
    toggleBtn.style.padding = '4px';
    toggleBtn.style.background = 'rgba(255,255,255,0.12)';
    toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
    toggleBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    toggleBtn.style.borderRadius = '8px';
    toggleBtn.style.cursor = 'pointer';
    container.appendChild(toggleBtn);

    toggleBtn.onclick = () => {
      active = !active;
      if (active) {
        document.addEventListener('keydown', onKeyDown);
        toggleBtn.textContent = 'Deaktivieren';
        toggleBtn.style.background = 'var(--qt-accent, #b78bff)';
        toggleBtn.style.color = '#111';
      } else {
        document.removeEventListener('keydown', onKeyDown);
        toggleBtn.textContent = 'Aktivieren';
        toggleBtn.style.background = 'rgba(255,255,255,0.12)';
        toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
      }
    };

    clearBtn.onclick = () => {
      markers = [];
      updateList();
    };

    
    
    
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fontFamily = getComputedStyle(markerWin).fontFamily || 'Arial, sans-serif';
      markers.forEach(m => {
        
        ctx.beginPath();
        ctx.arc(m.x, m.y, 10, 0, 2 * Math.PI);
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = m.color + '33'; 
        ctx.fill();

        
        ctx.font = `bold 14px ${fontFamily}`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.label, m.x, m.y - 15);

        
        const dx = t.lastMouseX - m.x;
        const dy = t.lastMouseY - m.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        ctx.font = `12px ${fontFamily}`;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(Math.round(dist) + 'px', m.x + 15, m.y - 5);
      });
      requestAnimationFrame(draw);
    }
    draw();

    
    
    
    window.addEventListener('beforeunload', () => {
      document.removeEventListener('keydown', onKeyDown);
      canvas.remove();
    });

    return markerBtn;
  };
})();
