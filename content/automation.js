// content/automation.js
(function() {
  const t = window.taming;

  t.automation = function(overlay) {
    
    
    
    let autoBtn;
    try {
      autoBtn = t.createIconButton('auto', 56, 65, 35);
    } catch (e) {
      autoBtn = t.createButton('Auto');
      autoBtn.style.width = '56px';
      autoBtn.style.height = '65px';
      autoBtn.style.fontSize = '12px';
      autoBtn.style.lineHeight = '16px';
      autoBtn.style.padding = '0';
      autoBtn.style.display = 'flex';
      autoBtn.style.alignItems = 'center';
      autoBtn.style.justifyContent = 'center';
    }

    const autoWin = t.createWindow('Automation', '250px', '200px', '380px', '400px');
    autoWin.style.display = 'none';

    autoBtn.onclick = () => {
      autoWin.style.display = autoWin.style.display === 'none' ? 'block' : 'none';
    };

    
    
    
    const actions = []; 
    let debuggerReady = false;

    async function attachDebuggerIfNeeded() {
      if (debuggerReady) return true;
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'attach' }, (response) => {
          if (response && response.success) {
            debuggerReady = true;
            console.log('Debugger attached');
            resolve(true);
          } else {
            console.warn('Debugger attach fehlgeschlagen:', response?.error);
            resolve(false);
          }
        });
      });
    }

    
    async function sendRealClick() {
      const x = t.lastMouseX;
      const y = t.lastMouseY;
      if (x === 0 && y === 0) {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          t.lastMouseX = rect.left + rect.width / 2;
          t.lastMouseY = rect.top + rect.height / 2;
        } else {
          console.warn('Keine Mausposition');
          return;
        }
      }

      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'click',
          x: t.lastMouseX,
          y: t.lastMouseY,
          button: 'left'
        }, (response) => {
          if (response && response.success) {
            console.log(`Klick an (${t.lastMouseX}, ${t.lastMouseY}) gesendet`);
            flashCanvas();
            resolve();
          } else {
            console.error('Klick fehlgeschlagen:', response?.error);
            reject(response?.error);
          }
        });
      });
    }

    
    async function sendKeyPress(keyCode) {
      
      
      const keyMap = {
        'KeyA': 0x41, 'KeyB': 0x42, 'KeyC': 0x43, 'KeyD': 0x44, 'KeyE': 0x45,
        'KeyF': 0x46, 'KeyG': 0x47, 'KeyH': 0x48, 'KeyI': 0x49, 'KeyJ': 0x4A,
        'KeyK': 0x4B, 'KeyL': 0x4C, 'KeyM': 0x4D, 'KeyN': 0x4E, 'KeyO': 0x4F,
        'KeyP': 0x50, 'KeyQ': 0x51, 'KeyR': 0x52, 'KeyS': 0x53, 'KeyT': 0x54,
        'KeyU': 0x55, 'KeyV': 0x56, 'KeyW': 0x57, 'KeyX': 0x58, 'KeyY': 0x59,
        'KeyZ': 0x5A,
        'Digit1': 0x31, 'Digit2': 0x32, 'Digit3': 0x33, 'Digit4': 0x34, 'Digit5': 0x35,
        'Digit6': 0x36, 'Digit7': 0x37, 'Digit8': 0x38, 'Digit9': 0x39, 'Digit0': 0x30,
        'Space': 0x20, 'Enter': 0x0D, 'Escape': 0x1B, 'Tab': 0x09, 'Backspace': 0x08,
        'ShiftLeft': 0xA0, 'ShiftRight': 0xA1, 'ControlLeft': 0xA2, 'ControlRight': 0xA3,
        'AltLeft': 0xA4, 'AltRight': 0xA5, 'ArrowUp': 0x26, 'ArrowDown': 0x28,
        'ArrowLeft': 0x25, 'ArrowRight': 0x27
      };
      const vk = keyMap[keyCode];
      if (!vk) {
        console.warn('Unbekannter Tastencode:', keyCode);
        return;
      }

      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'keypress',
          keyCode: vk
        }, (response) => {
          if (response && response.success) {
            console.log(`Taste ${keyCode} gesendet`);
            flashCanvas();
            resolve();
          } else {
            console.error('Tastendruck fehlgeschlagen:', response?.error);
            reject(response?.error);
          }
        });
      });
    }

    function flashCanvas() {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      const originalOutline = canvas.style.outline;
      canvas.style.outline = '3px solid red';
      setTimeout(() => canvas.style.outline = originalOutline, 200);
    }

    function flashOverlay(color) {
      const originalBg = autoWin.style.background;
      autoWin.style.background = color;
      setTimeout(() => autoWin.style.background = originalBg, 200);
    }

    const keyPressTimers = {};

    
    
    
    function addRow() {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.flexDirection = 'column';
      row.style.gap = '4px';
      row.style.margin = '6px 0';
      row.style.padding = '4px';
      row.style.background = 'rgba(30,30,35,0.6)';
      row.style.borderRadius = '6px';

      
      const triggerRow = document.createElement('div');
      triggerRow.style.display = 'flex';
      triggerRow.style.alignItems = 'center';
      triggerRow.style.gap = '4px';

      const triggerBtn = document.createElement('button');
      triggerBtn.textContent = 'Trigger';
      triggerBtn.style.flex = '1';

      
      const actionRow = document.createElement('div');
      actionRow.style.display = 'flex';
      actionRow.style.alignItems = 'center';
      actionRow.style.gap = '4px';

      const actionTypeSelect = document.createElement('select');
      actionTypeSelect.style.flex = '1';
      const opt1 = document.createElement('option'); opt1.value = 'click'; opt1.textContent = 'Mausklick';
      const opt2 = document.createElement('option'); opt2.value = 'key'; opt2.textContent = 'Tastendruck';
      actionTypeSelect.appendChild(opt1);
      actionTypeSelect.appendChild(opt2);

      const actionKeyBtn = document.createElement('button');
      actionKeyBtn.textContent = 'Taste wählen';
      actionKeyBtn.style.display = 'none';

      
      const testBtn = document.createElement('button');
      testBtn.textContent = 'Test';
      testBtn.style.background = 'var(--qt-accent, #b78bff)';
      testBtn.style.color = '#0c0f16';
      testBtn.onclick = async () => {
        console.log('Test-Button gedrückt für Action:', obj.actionType, obj.actionKey);
        if (!debuggerReady) {
          const attached = await attachDebuggerIfNeeded();
          if (!attached) {
            alert('Debugger konnte nicht gestartet werden.');
            return;
          }
        }
        if (obj.actionType === 'click') {
          await sendRealClick();
        } else if (obj.actionType === 'key' && obj.actionKey) {
          await sendKeyPress(obj.actionKey);
        }
      };

      
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = 0;
      slider.max = 1000;
      slider.value = 100;
      slider.style.width = '100%';

      const label = document.createElement('div');
      label.textContent = 'Delay: 100ms';
      label.style.fontSize = '11px';
      label.style.color = 'var(--qt-text, #eaf1ff)';
      label.style.opacity = '0.7';

      slider.oninput = () => {
        label.textContent = `Delay: ${slider.value}ms`;
      };

      
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Del';
      removeBtn.style.marginLeft = '4px';
      removeBtn.onclick = () => {
        const index = actions.indexOf(obj);
        if (index !== -1) actions.splice(index, 1);
        row.remove();
      };

      
      const obj = {
        triggerKey: null,
        actionType: 'click',
        actionKey: null,
        get delay() { return parseInt(slider.value); }
      };

      
      triggerBtn.onclick = () => {
        const box = document.createElement('div');
        box.textContent = 'Trigger-Taste oder Maustaste drücken (ESC = abbrechen)';
        box.style.cssText = `
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          padding: 20px; background: rgba(0,0,0,0.9); color: white;
          border-radius: 8px; z-index: 10000000;
        `;
        document.body.appendChild(box);

        const keyHandler = (e) => {
          e.preventDefault();
          obj.triggerKey = e.code; 
          triggerBtn.textContent = e.code;
          cleanup();
        };
        const mouseHandler = (e) => {
          e.preventDefault();
          let btn = '';
          if (e.button === 0) btn = 'MouseLeft';
          else if (e.button === 1) btn = 'MouseMiddle';
          else if (e.button === 2) btn = 'MouseRight';
          obj.triggerKey = btn;
          triggerBtn.textContent = btn;
          cleanup();
        };
        const escHandler = (e) => {
          if (e.key === 'Escape') {
            cleanup();
          }
        };
        const cleanup = () => {
          document.removeEventListener('keydown', keyHandler);
          document.removeEventListener('keydown', escHandler);
          document.removeEventListener('mousedown', mouseHandler);
          box.remove();
        };

        document.addEventListener('keydown', keyHandler);
        document.addEventListener('keydown', escHandler);
        document.addEventListener('mousedown', mouseHandler);
      };

      
      actionTypeSelect.onchange = () => {
        obj.actionType = actionTypeSelect.value;
        if (obj.actionType === 'key') {
          actionKeyBtn.style.display = 'inline-block';
        } else {
          actionKeyBtn.style.display = 'none';
          obj.actionKey = null;
        }
      };

      
      actionKeyBtn.onclick = () => {
        const box = document.createElement('div');
        box.textContent = 'Action-Taste drücken (ESC = abbrechen)';
        box.style.cssText = `
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          padding: 20px; background: rgba(0,0,0,0.9); color: white;
          border-radius: 8px; z-index: 10000000;
        `;
        document.body.appendChild(box);

        const keyHandler = (e) => {
          e.preventDefault();
          obj.actionKey = e.code;
          actionKeyBtn.textContent = e.code;
          cleanup();
        };
        const escHandler = (e) => {
          if (e.key === 'Escape') cleanup();
        };
        const cleanup = () => {
          document.removeEventListener('keydown', keyHandler);
          document.removeEventListener('keydown', escHandler);
          box.remove();
        };

        document.addEventListener('keydown', keyHandler);
        document.addEventListener('keydown', escHandler);
      };

      
      triggerRow.appendChild(triggerBtn);
      triggerRow.appendChild(removeBtn);
      row.appendChild(triggerRow);

      actionRow.appendChild(actionTypeSelect);
      actionRow.appendChild(actionKeyBtn);
      actionRow.appendChild(testBtn);
      row.appendChild(actionRow);

      row.appendChild(slider);
      row.appendChild(label);

      autoWin.appendChild(row);
      actions.push(obj);
    }

    
    addRow();

    
    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.style.margin = '4px';
    addBtn.onclick = addRow;
    autoWin.appendChild(addBtn);

    
    
    
    document.addEventListener('keydown', async (e) => {
      if (e.target.matches('input, textarea, [contenteditable="true"]')) return;
      for (const a of actions) {
        if (a.triggerKey === e.code) {
          console.log('Trigger erkannt für Taste:', a.triggerKey);
          flashOverlay('rgba(255,255,0,0.3)');
          if (keyPressTimers[a.triggerKey]) return;
          e.preventDefault();
          e.stopPropagation();
          if (!debuggerReady) await attachDebuggerIfNeeded();
          keyPressTimers[a.triggerKey] = setTimeout(async () => {
            if (a.actionType === 'click') await sendRealClick();
            else if (a.actionType === 'key' && a.actionKey) await sendKeyPress(a.actionKey);
            delete keyPressTimers[a.triggerKey];
          }, a.delay);
          break;
        }
      }
    }, true);

    document.addEventListener('mousedown', async (e) => {
      
      const target = e.target && e.target.nodeType === 3 ? e.target.parentElement : e.target;
      if (!target || typeof target.closest !== 'function') return;
      if (target.closest('button, select, input, textarea')) return;
      let btn = '';
      if (e.button === 0) btn = 'MouseLeft';
      else if (e.button === 1) btn = 'MouseMiddle';
      else if (e.button === 2) btn = 'MouseRight';
      else return;
      for (const a of actions) {
        if (a.triggerKey === btn) {
          console.log('Trigger erkannt für Maustaste:', a.triggerKey);
          flashOverlay('rgba(255,255,0,0.3)');
          if (keyPressTimers[a.triggerKey]) return;
          e.preventDefault();
          e.stopPropagation();
          if (!debuggerReady) await attachDebuggerIfNeeded();
          keyPressTimers[a.triggerKey] = setTimeout(async () => {
            if (a.actionType === 'click') await sendRealClick();
            else if (a.actionType === 'key' && a.actionKey) await sendKeyPress(a.actionKey);
            delete keyPressTimers[a.triggerKey];
          }, a.delay);
          break;
        }
      }
    }, true);

    return autoBtn;
  };
})();
