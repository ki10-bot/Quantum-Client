// content/network.js
(function() {
  const t = window.taming;

  t.network = function(overlay) {
    // ------------------------------------------------------------
    // 1. Button und Fenster erstellen
    // ------------------------------------------------------------
    const netBtn = t.createIconButton('network', 56, 65, 35);
    const netWin = t.createWindow('Network Inspector', '450px', '250px', '400px', '300px');
    netWin.style.display = 'none';

    netBtn.onclick = () => {
      netWin.style.display = netWin.style.display === 'none' ? 'block' : 'none';
    };

    // ------------------------------------------------------------
    // 2. UI-Elemente im Fenster
    // ------------------------------------------------------------
    const statusDiv = document.createElement('div');
    statusDiv.style.padding = '8px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Monitoring inaktiv';
    netWin.appendChild(statusDiv);

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Monitoring starten';
    toggleBtn.style.margin = '4px';
    toggleBtn.style.padding = '4px 8px';
    toggleBtn.style.background = '#4a6';
    toggleBtn.style.color = '#fff';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '4px';
    toggleBtn.style.cursor = 'pointer';
    netWin.appendChild(toggleBtn);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Liste leeren';
    clearBtn.style.margin = '4px';
    clearBtn.style.padding = '4px 8px';
    clearBtn.style.background = '#a44';
    clearBtn.style.color = '#fff';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '4px';
    clearBtn.style.cursor = 'pointer';
    netWin.appendChild(clearBtn);

    const messageList = document.createElement('div');
    messageList.style.maxHeight = '200px';
    messageList.style.overflowY = 'auto';
    messageList.style.fontSize = '12px';
    messageList.style.marginTop = '8px';
    messageList.style.background = 'rgba(0,0,0,0.3)';
    messageList.style.padding = '4px';
    netWin.appendChild(messageList);

    // ------------------------------------------------------------
    // 3. Variablen und Zustand
    // ------------------------------------------------------------
    let monitoringActive = false;
    let messages = []; // neueste zuerst
    let patched = false;

    // Original-Methoden sichern
    const originalWebSocketSend = WebSocket.prototype.send;
    const originalWebSocketClose = WebSocket.prototype.close;

    // MessagePack-Decoder (wird von mmgsa bereitgestellt)
    const msgpack = window.mmgsa;

    // ------------------------------------------------------------
    // 4. Hilfsfunktionen
    // ------------------------------------------------------------
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
          decoded = { raw: data }; // Fallback
        }
        const time = new Date().toLocaleTimeString();
        const formatted = formatValue(decoded);
        messages.unshift({ time, direction, formatted });
        if (messages.length > 100) messages.pop();
        updateList();
      } catch (e) {
        // Decodierung fehlgeschlagen – vielleicht ist es kein MessagePack
        const time = new Date().toLocaleTimeString();
        messages.unshift({ time, direction, formatted: '[nicht decodierbar] ' + String(data).substring(0, 100) });
        if (messages.length > 100) messages.pop();
        updateList();
      }
    }

    function updateList() {
      messageList.innerHTML = messages.map(msg => {
        const color = msg.direction === '→' ? '#aaf' : '#faa';
        return `<div style="border-bottom:1px solid #333; padding:2px; color:${color}">
          <span style="color:#888;">${msg.time}</span> ${msg.direction} ${msg.formatted}
        </div>`;
      }).join('');
    }

    // ------------------------------------------------------------
    // 5. Patch-Funktionen
    // ------------------------------------------------------------
    function patchWebSocket() {
      if (!window.mmgsa) {
        statusDiv.innerHTML = '❌ Fehler: mmgsa (MessagePack) nicht gefunden';
        return false;
      }
      if (!msgpack.decode || !msgpack.encode) {
        statusDiv.innerHTML = '❌ Fehler: mmgsa hat nicht die erwarteten Methoden';
        return false;
      }

      // WebSocket.send patchen
      WebSocket.prototype.send = function(data) {
        // Original aufrufen
        originalWebSocketSend.call(this, data);
        // Nachricht abfangen
        addMessage('→', data);
      };

      // WebSocket.onmessage patchen (über Property, nicht überschreiben)
      // Wir müssen das originale onmessage des Websockets umschließen.
      // Das ist tricky, weil wir nicht einfach onmessage überschreiben können,
      // ohne dass andere Listener verloren gehen. Besser: Wir fügen einen eigenen
      // Event-Listener hinzu (addEventListener), falls unterstützt.
      // Moderne Browser erlauben addEventListener auf WebSocket.
      // Wir nutzen das, um zusätzlich zu lauschen.
      const originalAddEventListener = WebSocket.prototype.addEventListener;
      WebSocket.prototype.addEventListener = function(type, listener, options) {
        if (type === 'message') {
          // Wir wrappen den Listener, um die Nachricht zu decodieren
          const wrappedListener = function(event) {
            addMessage('←', event.data);
            listener.call(this, event);
          };
          originalAddEventListener.call(this, type, wrappedListener, options);
        } else {
          originalAddEventListener.call(this, type, listener, options);
        }
      };

      // Zusätzlich: Für bestehende WebSockets, die bereits onmessage gesetzt haben,
      // können wir nichts tun, aber beim Starten des Monitorings werden neue
      // Verbindungen erfasst. Das ist akzeptabel.
      statusDiv.innerHTML = '✅ Monitoring aktiv – neue WebSocket-Nachrichten werden erfasst.';
      return true;
    }

    function unpatchWebSocket() {
      WebSocket.prototype.send = originalWebSocketSend;
      WebSocket.prototype.addEventListener = originalAddEventListener;
      // Alte Wrapper bleiben möglicherweise, aber neue werden nicht mehr erstellt.
    }

    // ------------------------------------------------------------
    // 6. Start/Stopp-Logik
    // ------------------------------------------------------------
    toggleBtn.onclick = () => {
      if (!monitoringActive) {
        const patchResult = patchWebSocket();
        if (patchResult) {
          monitoringActive = true;
          toggleBtn.textContent = 'Monitoring stoppen';
          toggleBtn.style.background = '#a44';
          patched = true;
        } else {
          // Fehlermeldung bereits in statusDiv
          monitoringActive = false;
        }
      } else {
        monitoringActive = false;
        if (patched) {
          unpatchWebSocket();
          patched = false;
        }
        toggleBtn.textContent = 'Monitoring starten';
        toggleBtn.style.background = '#4a6';
        statusDiv.innerHTML = 'Monitoring inaktiv';
      }
    };

    clearBtn.onclick = () => {
      messages = [];
      updateList();
    };

    // ------------------------------------------------------------
    // 7. Aufräumen beim Entladen
    // ------------------------------------------------------------
    window.addEventListener('beforeunload', () => {
      if (patched) {
        unpatchWebSocket();
      }
    });

    return netBtn;
  };
})();