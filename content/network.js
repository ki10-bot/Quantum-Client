// content/network.js
(function() {
  const t = window.taming;

  t.network = function(overlay) {
    
    
    
    const netBtn = t.createIconButton('network', 56, 65, 35);
    const netWin = t.createWindow('Network Inspector', '450px', '250px', '400px', '300px');
    netWin.style.display = 'none';

    netBtn.onclick = () => {
      netWin.style.display = netWin.style.display === 'none' ? 'block' : 'none';
    };

    
    
    
    const statusDiv = document.createElement('div');
    statusDiv.style.padding = '8px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Monitoring inaktiv';
    netWin.appendChild(statusDiv);

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Monitoring starten';
    toggleBtn.style.margin = '4px';
    toggleBtn.style.padding = '4px 8px';
    toggleBtn.style.background = 'rgba(255,255,255,0.12)';
    toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
    toggleBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    toggleBtn.style.borderRadius = '8px';
    toggleBtn.style.cursor = 'pointer';
    netWin.appendChild(toggleBtn);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Liste leeren';
    clearBtn.style.margin = '4px';
    clearBtn.style.padding = '4px 8px';
    clearBtn.style.background = 'rgba(255,255,255,0.08)';
    clearBtn.style.color = 'var(--qt-text, #eaf1ff)';
    clearBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    clearBtn.style.borderRadius = '8px';
    clearBtn.style.cursor = 'pointer';
    netWin.appendChild(clearBtn);

    const messageList = document.createElement('div');
    messageList.style.maxHeight = '200px';
    messageList.style.overflowY = 'auto';
    messageList.style.fontSize = '12px';
    messageList.style.marginTop = '8px';
    messageList.style.background = 'rgba(10, 12, 18, 0.4)';
    messageList.style.padding = '4px';
    netWin.appendChild(messageList);

    
    
    
    let monitoringActive = false;
    let messages = []; 
    let patched = false;

    
    const originalWebSocketSend = WebSocket.prototype.send;
    const originalWebSocketClose = WebSocket.prototype.close;

    
    const msgpack = window.mmgsa;

    
    
    
    function formatValue(value) {
      if (value === undefined) return 'undefined';
      if (value === null) return 'null';
      if (typeof value === 'string') return '"' + value + '"';
      if (typeof value === 'number') return value.toString();
      if (typeof value === 'boolean') return value.toString();
      if (Array.isArray(value)) {
        return '[' + value.map(v => formatValue(v)).join(', ') + ']';
      }
      if (value instanceof Uint8Array) {
        return 'Uint8Array(' + value.length + ')';
      }
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value);
        } catch (e) {
          return '{ ... }';
        }
      }
      return String(value);
    }

    function addMessage(direction, data) {
      try {
        let decoded;
        if (data instanceof ArrayBuffer) {
          decoded = msgpack.decode(new Uint8Array(data));
        } else if (data instanceof Uint8Array) {
          decoded = msgpack.decode(data);
        } else {
          decoded = { raw: data }; 
        }
        const time = new Date().toLocaleTimeString();
        const formatted = formatValue(decoded);
        messages.unshift({ time, direction, formatted });
        if (messages.length > 100) messages.pop();
        updateList();
      } catch (e) {
        
        const time = new Date().toLocaleTimeString();
        messages.unshift({ time, direction, formatted: '[nicht decodierbar] ' + String(data).substring(0, 100) });
        if (messages.length > 100) messages.pop();
        updateList();
      }
    }

    function updateList() {
      messageList.innerHTML = messages.map(msg => {
        const color = msg.direction === '→' ? 'var(--qt-accent, #b78bff)' : 'var(--qt-text, #eaf1ff)';
        return `<div style="border-bottom:1px solid rgba(255,255,255,0.08); padding:2px; color:${color}">
          <span style="color:rgba(255,255,255,0.5);">${msg.time}</span> ${msg.direction} ${msg.formatted}
        </div>`;
      }).join('');
    }

    
    
    
    function patchWebSocket() {
      if (!window.mmgsa) {
        statusDiv.innerHTML = 'Fehler: mmgsa (MessagePack) nicht gefunden';
        return false;
      }
      if (!msgpack.decode || !msgpack.encode) {
        statusDiv.innerHTML = 'Fehler: mmgsa hat nicht die erwarteten Methoden';
        return false;
      }

      
      WebSocket.prototype.send = function(data) {
        
        originalWebSocketSend.call(this, data);
        
        addMessage('→', data);
      };

      
      
      
      
      
      
      
      const originalAddEventListener = WebSocket.prototype.addEventListener;
      WebSocket.prototype.addEventListener = function(type, listener, options) {
        if (type === 'message') {
          
          const wrappedListener = function(event) {
            addMessage('←', event.data);
            listener.call(this, event);
          };
          originalAddEventListener.call(this, type, wrappedListener, options);
        } else {
          originalAddEventListener.call(this, type, listener, options);
        }
      };

      
      
      
      statusDiv.innerHTML = 'Monitoring aktiv – neue WebSocket-Nachrichten werden erfasst.';
      return true;
    }

    function unpatchWebSocket() {
      WebSocket.prototype.send = originalWebSocketSend;
      WebSocket.prototype.addEventListener = originalAddEventListener;
      
    }

    
    
    
    toggleBtn.onclick = () => {
      if (!monitoringActive) {
        const patchResult = patchWebSocket();
        if (patchResult) {
          monitoringActive = true;
          toggleBtn.textContent = 'Monitoring stoppen';
          toggleBtn.style.background = 'var(--qt-accent, #b78bff)';
          toggleBtn.style.color = '#111';
          patched = true;
        } else {
          
          monitoringActive = false;
        }
      } else {
        monitoringActive = false;
        if (patched) {
          unpatchWebSocket();
          patched = false;
        }
        toggleBtn.textContent = 'Monitoring starten';
        toggleBtn.style.background = 'rgba(255,255,255,0.12)';
        toggleBtn.style.color = 'var(--qt-text, #eaf1ff)';
        statusDiv.innerHTML = 'Monitoring inaktiv';
      }
    };

    clearBtn.onclick = () => {
      messages = [];
      updateList();
    };

    
    
    
    window.addEventListener('beforeunload', () => {
      if (patched) {
        unpatchWebSocket();
      }
    });

    return netBtn;
  };
})();
