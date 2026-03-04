// content/esp.js
(function() {
  const t = window.taming;

  t.esp = function(overlay) {
    const espBtn = t.createIconButton('esp', 56, 65, 35);
    const espWin = t.createWindow('ESP Tracker', '350px', '150px', '250px');
    espWin.style.display = 'none';

    espBtn.onclick = () => {
      espWin.style.display = espWin.style.display === 'none' ? 'block' : 'none';
    };

    const statusDiv = document.createElement('div');
    statusDiv.style.padding = '8px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Suche nach Spielern...';
    espWin.appendChild(statusDiv);

    const playerList = document.createElement('div');
    playerList.style.maxHeight = '150px';
    playerList.style.overflowY = 'auto';
    playerList.style.fontSize = '12px';
    espWin.appendChild(playerList);

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.style.position = 'fixed';
    overlayCanvas.style.top = '0';
    overlayCanvas.style.left = '0';
    overlayCanvas.style.width = '100%';
    overlayCanvas.style.height = '100%';
    overlayCanvas.style.pointerEvents = 'none';
    overlayCanvas.style.zIndex = '999998';
    document.body.appendChild(overlayCanvas);
    const overlayCtx = overlayCanvas.getContext('2d');

    function resizeOverlay() {
      overlayCanvas.width = window.innerWidth;
      overlayCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeOverlay);
    resizeOverlay();

    const players = [];

    const config = {
      targetImageUrl: '7145551935340eadd5dc6317', 
      minSize: 10,
      maxSize: 50,
      detectText: false,
      debug: true
    };

    const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;

    function isPlayerDraw(image, args) {
      if (image && image.src && image.src.includes(config.targetImageUrl)) {
        return true;
      }
      return false;
    }

    CanvasRenderingContext2D.prototype.drawImage = function(image, ...args) {
      if (config.debug) {
        console.log('drawImage', image.src ? image.src.substring(0, 50) : 'kein Bild', args);
      }

      if (isPlayerDraw(image, args)) {
        let x, y, width, height;
        if (args.length === 9) {
          x = args[5];
          y = args[6];
          width = args[7];
          height = args[8];
        } else if (args.length === 5) {
          x = args[1];
          y = args[2];
          width = args[3];
          height = args[4];
        } else if (args.length === 3) {
          x = args[1];
          y = args[2];
          width = 0;
          height = 0;
        } else {
          return originalDrawImage.apply(this, [image, ...args]);
        }

        if (width && height) {
          if (width < config.minSize || width > config.maxSize || height < config.minSize || height > config.maxSize) {
            return originalDrawImage.apply(this, [image, ...args]);
          }
        }

        players.push({ x, y, confidence: 1 });
        if (players.length > 50) players.shift();
      }

      return originalDrawImage.apply(this, [image, ...args]);
    };

    if (config.detectText) {
      CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
        if (config.debug) {
          console.log('fillText', text, x, y);
        }
        if (typeof text === 'string' && text.length > 0 && text.length < 20) {
          players.push({ x, y, confidence: 0.8 });
        }
        return originalFillText.call(this, text, x, y, maxWidth);
      };
    }

    setInterval(() => {
      statusDiv.innerHTML = `Spieler erkannt: ${players.length}`;
      playerList.innerHTML = players.slice(-10).map(p => 
        `x:${Math.round(p.x)}, y:${Math.round(p.y)} (${p.confidence})`
      ).join('<br>');

      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      overlayCtx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      players.forEach(p => {
        overlayCtx.beginPath();
        overlayCtx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        overlayCtx.fill();
      });
    }, 100);

    setInterval(() => {
      players.length = 0;
    }, 2000);

    window.addEventListener('beforeunload', () => {
      CanvasRenderingContext2D.prototype.drawImage = originalDrawImage;
      if (config.detectText) {
        CanvasRenderingContext2D.prototype.fillText = originalFillText;
      }
      overlayCanvas.remove();
    });

    return espBtn;
  };
})();