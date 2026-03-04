// content/visual_searcher.js
(function() {
  const t = window.taming;

  t.visualSearcher = function(overlay) {
    
    
    
    let vsBtn;
    try {
      vsBtn = t.createIconButton('vision', 56, 65, 35);
    } catch (e) {
      vsBtn = t.createButton('Search');
      vsBtn.style.width = '56px';
      vsBtn.style.height = '65px';
      vsBtn.style.fontSize = '11px';
      vsBtn.style.lineHeight = '16px';
      vsBtn.style.padding = '0';
      vsBtn.style.display = 'flex';
      vsBtn.style.alignItems = 'center';
      vsBtn.style.justifyContent = 'center';
    }

    const vsWin = t.createWindow('Visueller Sucher', '400px', '250px', '400px', '400px');
    vsWin.style.display = 'none';

    vsBtn.onclick = () => {
      vsWin.style.display = vsWin.style.display === 'none' ? 'block' : 'none';
    };

    
    const container = document.createElement('div');
    container.style.padding = '4px';
    vsWin.appendChild(container);

    const statusDiv = document.createElement('div');
    statusDiv.style.margin = '4px';
    statusDiv.style.fontSize = '14px';
    statusDiv.innerHTML = 'Warte auf Bild...';
    container.appendChild(statusDiv);

    const resultDiv = document.createElement('div');
    resultDiv.style.margin = '4px';
    resultDiv.style.fontSize = '12px';
    resultDiv.style.maxHeight = '300px';
    resultDiv.style.overflowY = 'auto';
    resultDiv.style.whiteSpace = 'pre-wrap';
    resultDiv.style.background = 'rgba(10, 12, 18, 0.4)';
    resultDiv.style.color = 'var(--qt-text, #eaf1ff)';
    resultDiv.style.padding = '4px';
    container.appendChild(resultDiv);

    
    
    
    let mobilenetModel = null;
    let tesseractWorker = null;

    async function loadModels() {
      statusDiv.innerHTML = 'Lade KI-Modelle...';
      try {

        if (typeof window.tf === 'undefined') {
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
        }

        if (!mobilenetModel) {
          mobilenetModel = await tf.loadGraphModel('https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/5/default/1', { fromTFHub: true });
        }
        if (typeof window.Tesseract === 'undefined') {
          await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js');
        }
        statusDiv.innerHTML = 'Modelle geladen. Rechtsklick auf ein Bild!';
      } catch (e) {
      statusDiv.innerHTML = 'Fehler beim Laden der Modelle: ' + e.message;
        console.error(e);
      }
    }

    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    
    
    
    async function analyzeImage(imageUrl) {
      statusDiv.innerHTML = 'Analysiere Bild...';
      resultDiv.innerHTML = '';

      try {
        
        const img = new Image();
        img.crossOrigin = 'anonymous'; 
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        
        const tensor = tf.browser.fromPixels(img).resizeNearestNeighbor([224, 224]).toFloat();
        const normalized = tensor.sub(127.5).div(127.5); 
        const batched = normalized.expandDims(0);

        
        const predictions = await mobilenetModel.predict(batched).data();
        const top5 = Array.from(predictions)
          .map((prob, i) => ({ prob, index: i }))
          .sort((a, b) => b.prob - a.prob)
          .slice(0, 5);

        
        
        
        const labels = await loadLabels();

        const textLines = ['Top-5 Klassifikationen:'];
        top5.forEach((p, i) => {
          textLines.push(`${i+1}. ${labels[p.index]} (${(p.prob*100).toFixed(1)}%)`);
        });

        
        if (window.Tesseract) {
          statusDiv.innerHTML = 'Führe Texterkennung durch...';
          const ocrResult = await Tesseract.recognize(img, 'deu+eng');
          if (ocrResult.data.text.trim()) {
            textLines.push('\nErkannter Text:');
            textLines.push(ocrResult.data.text.trim());
          }
        }

        resultDiv.innerHTML = textLines.join('\n');
        statusDiv.innerHTML = 'Analyse abgeschlossen.';
      } catch (e) {
      statusDiv.innerHTML = 'Fehler bei der Analyse: ' + e.message;
        console.error(e);
      }
    }

    
    let labelList = null;
    async function loadLabels() {
      if (labelList) return labelList;
      const response = await fetch('https://storage.googleapis.com/download.tensorflow.org/data/ImageNetLabels.txt');
      const text = await response.text();
      labelList = text.split('\n').filter(line => line.trim() !== '');
      return labelList;
    }

    
    
    
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.action === 'analyzeImage' && msg.imageUrl) {
        
        vsWin.style.display = 'block';
        
        if (!mobilenetModel) {
          loadModels().then(() => {
            analyzeImage(msg.imageUrl);
          });
        } else {
          analyzeImage(msg.imageUrl);
        }
      }
    });

    
    
    
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'Bild-URL eingeben...';
    urlInput.style.width = '100%';
    urlInput.style.margin = '4px 0';
    urlInput.style.background = 'rgba(22, 24, 32, 0.9)';
    urlInput.style.color = 'var(--qt-text, #eaf1ff)';
    urlInput.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    urlInput.style.padding = '4px';
    container.appendChild(urlInput);

    const analyzeBtn = document.createElement('button');
    analyzeBtn.textContent = 'Analyse starten';
    analyzeBtn.style.width = '100%';
    analyzeBtn.style.margin = '4px 0';
    analyzeBtn.style.padding = '4px';
    analyzeBtn.style.background = 'var(--qt-accent, #b78bff)';
    analyzeBtn.style.color = '#111';
    analyzeBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    analyzeBtn.style.borderRadius = '8px';
    analyzeBtn.style.cursor = 'pointer';
    analyzeBtn.onclick = () => {
      const url = urlInput.value.trim();
      if (url) analyzeImage(url);
    };
    container.appendChild(analyzeBtn);

    
    
    
    window.addEventListener('beforeunload', () => {
      if (mobilenetModel) mobilenetModel.dispose();
    });

    return vsBtn;
  };
})();
