// content/shader_hacker.js
(function() {
  const t = window.taming;

  t.shaderHacker = function(overlay) {
    // ------------------------------------------------------------
    // 1. Button mit Fallback
    // ------------------------------------------------------------
    let shaderBtn;
    try {
      shaderBtn = t.createIconButton('shader', 56, 65, 35);
    } catch (e) {
      shaderBtn = t.createButton('🎨');
      shaderBtn.style.width = '56px';
      shaderBtn.style.height = '65px';
      shaderBtn.style.fontSize = '24px';
      shaderBtn.style.lineHeight = '65px';
      shaderBtn.style.padding = '0';
    }

    const shaderWin = t.createWindow('Shader Hacker', '400px', '250px', '550px', '500px');
    shaderWin.style.display = 'none';

    shaderBtn.onclick = () => {
      shaderWin.style.display = shaderWin.style.display === 'none' ? 'block' : 'none';
    };

    // ------------------------------------------------------------
    // 2. UI-Elemente
    // ------------------------------------------------------------
    const container = document.createElement('div');
    container.style.padding = '4px';
    shaderWin.appendChild(container);

    // Status-Anzeige
    const statusDiv = document.createElement('div');
    statusDiv.style.margin = '4px';
    statusDiv.style.fontSize = '14px';
    statusDiv.style.color = '#fff';
    statusDiv.innerHTML = '⏸️ Inaktiv';
    container.appendChild(statusDiv);

    // Fehler-/Warnmeldung
    const errorDiv = document.createElement('div');
    errorDiv.style.margin = '4px';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.color = '#faa';
    container.appendChild(errorDiv);

    // Shader-Typ-Auswahl
    const typeDiv = document.createElement('div');
    typeDiv.style.margin = '8px 4px';
    typeDiv.style.fontSize = '12px';
    typeDiv.innerHTML = '<span>Shader-Typ:</span>';
    const typeSelect = document.createElement('select');
    typeSelect.style.width = '100%';
    typeSelect.style.background = '#333';
    typeSelect.style.color = '#fff';
    typeSelect.style.border = '1px solid #555';
    typeSelect.style.marginTop = '2px';
    const optVertex = document.createElement('option'); optVertex.value = 'vertex'; optVertex.textContent = 'Vertex-Shader';
    const optFragment = document.createElement('option'); optFragment.value = 'fragment'; optFragment.textContent = 'Fragment-Shader';
    optFragment.selected = true;
    typeSelect.appendChild(optVertex);
    typeSelect.appendChild(optFragment);
    typeDiv.appendChild(typeSelect);
    container.appendChild(typeDiv);

    // Textarea für Shader-Code
    const codeLabel = document.createElement('div');
    codeLabel.style.margin = '8px 4px 2px 4px';
    codeLabel.style.fontSize = '12px';
    codeLabel.textContent = 'Shader-Code:';
    container.appendChild(codeLabel);

    const codeArea = document.createElement('textarea');
    codeArea.style.width = 'calc(100% - 8px)';
    codeArea.style.height = '200px';
    codeArea.style.background = '#1e1e1e';
    codeArea.style.color = '#d4d4d4';
    codeArea.style.fontFamily = 'monospace';
    codeArea.style.fontSize = '12px';
    codeArea.style.border = '1px solid #555';
    codeArea.style.padding = '4px';
    codeArea.style.whiteSpace = 'pre';
    codeArea.style.overflow = 'auto';
    container.appendChild(codeArea);

    // Standard-Shader-Code
    codeArea.value = `// Fragment-Shader
precision highp float;
varying vec2 v_coord;
uniform sampler2D u_texture;

void main() {
  vec4 color = texture2D(u_texture, v_coord);
  // Invertiere Farben
  gl_FragColor = vec4(1.0 - color.rgb, color.a);
}`;

    // Steuerungs-Buttons
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '4px';
    btnContainer.style.margin = '4px';
    container.appendChild(btnContainer);

    const activateBtn = document.createElement('button');
    activateBtn.textContent = 'Aktivieren';
    activateBtn.style.flex = '1';
    activateBtn.style.background = '#4a6';
    activateBtn.style.color = '#fff';
    activateBtn.style.border = 'none';
    activateBtn.style.borderRadius = '4px';
    activateBtn.style.padding = '8px';
    activateBtn.style.cursor = 'pointer';
    btnContainer.appendChild(activateBtn);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.style.flex = '1';
    resetBtn.style.background = '#a44';
    resetBtn.style.color = '#fff';
    resetBtn.style.border = 'none';
    resetBtn.style.borderRadius = '4px';
    resetBtn.style.padding = '8px';
    resetBtn.style.cursor = 'pointer';
    btnContainer.appendChild(resetBtn);

    // ------------------------------------------------------------
    // 3. WebGL Hijacking
    // ------------------------------------------------------------
    let active = false;
    let originalGetContext = HTMLCanvasElement.prototype.getContext;
    let originalShaderSource = null;
    let originalCompileShader = null;

    // Hilfsfunktion: Extrahiere Shader-Quellcode
    function extractShaderSource(shader) {
      if (!shader) return null;
      // Versuche, den Quellcode zu bekommen (WebGL speichert ihn intern)
      return shader.__originalSource || null;
    }

    // Hijack: getContext überschreiben
    function hijackWebGL() {
      if (!window.WebGLRenderingContext) {
        errorDiv.innerHTML = '❌ Kein WebGL-Unterstützung gefunden.';
        return false;
      }

      // Original-Methoden sichern
      originalGetContext = HTMLCanvasElement.prototype.getContext;

      // getContext überschreiben
      HTMLCanvasElement.prototype.getContext = function(contextId, options) {
        const ctx = originalGetContext.call(this, contextId, options);
        if (contextId === 'webgl' || contextId === 'experimental-webgl') {
          // Jetzt haben wir den WebGL-Kontext – wir können seine Methoden patchen
          patchWebGLContext(ctx);
        }
        return ctx;
      };

      return true;
    }

    function patchWebGLContext(gl) {
      if (!gl) return;

      // Originale Shader-Methoden sichern
      originalShaderSource = gl.shaderSource;
      originalCompileShader = gl.compileShader;

      // shaderSource überschreiben
      gl.shaderSource = function(shader, source) {
        // Originalen Quellcode speichern
        shader.__originalSource = source;
        // Wenn aktiv, ersetzen wir den Quellcode durch unseren eigenen
        if (active) {
          const shaderType = gl.getShaderParameter(shader, gl.SHADER_TYPE);
          const ourType = typeSelect.value === 'vertex' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
          if (shaderType === ourType) {
            console.log('Shader Hacker: Ersetze Shader-Code');
            originalShaderSource.call(gl, shader, codeArea.value);
            return;
          }
        }
        originalShaderSource.call(gl, shader, source);
      };

      // compileShader überschreiben (für Fehlerbehandlung)
      gl.compileShader = function(shader) {
        originalCompileShader.call(gl, shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          const log = gl.getShaderInfoLog(shader);
          if (log) {
            errorDiv.innerHTML = '❌ Shader-Kompilierung fehlgeschlagen:<br>' + log.replace(/\n/g, '<br>');
          }
        }
      };
    }

    // ------------------------------------------------------------
    // 4. Steuerung
    // ------------------------------------------------------------
    activateBtn.onclick = () => {
      if (!active) {
        // Aktivieren
        active = true;
        activateBtn.textContent = 'Deaktivieren';
        activateBtn.style.background = '#a44';
        statusDiv.innerHTML = '▶️ Aktiv (Shader-Hijacking)';
        errorDiv.innerHTML = '';

        // WebGL hijacken (einmalig)
        hijackWebGL();

        // Seite neu laden? Nicht nötig – der nächste getContext-Aufruf wird gepatcht.
        // Aber wir müssen sicherstellen, dass existierende Kontexte erfasst werden.
        // Wir suchen nach bereits existierenden Canvases und patchen sie.
        document.querySelectorAll('canvas').forEach(canvas => {
          const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (ctx) patchWebGLContext(ctx);
        });
      } else {
        // Deaktivieren
        active = false;
        activateBtn.textContent = 'Aktivieren';
        activateBtn.style.background = '#4a6';
        statusDiv.innerHTML = '⏸️ Inaktiv';
      }
    };

    resetBtn.onclick = () => {
      // Code zurücksetzen auf Standard
      codeArea.value = `// Fragment-Shader
precision highp float;
varying vec2 v_coord;
uniform sampler2D u_texture;

void main() {
  vec4 color = texture2D(u_texture, v_coord);
  // Invertiere Farben
  gl_FragColor = vec4(1.0 - color.rgb, color.a);
}`;
      errorDiv.innerHTML = '';
    };

    // ------------------------------------------------------------
    // 5. Aufräumen
    // ------------------------------------------------------------
    window.addEventListener('beforeunload', () => {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });

    return shaderBtn;
  };
})();