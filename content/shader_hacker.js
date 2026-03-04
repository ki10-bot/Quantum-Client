// content/shader_hacker.js
(function() {
  const t = window.taming;

  t.shaderHacker = function(overlay) {
    
    
    
    let shaderBtn;
    try {
      shaderBtn = t.createIconButton('shader', 56, 65, 35);
    } catch (e) {
      shaderBtn = t.createButton('Shader');
      shaderBtn.style.width = '56px';
      shaderBtn.style.height = '65px';
      shaderBtn.style.fontSize = '11px';
      shaderBtn.style.lineHeight = '16px';
      shaderBtn.style.padding = '0';
      shaderBtn.style.display = 'flex';
      shaderBtn.style.alignItems = 'center';
      shaderBtn.style.justifyContent = 'center';
    }

    const shaderWin = t.createWindow('Shader Hacker', '400px', '250px', '550px', '500px');
    shaderWin.style.display = 'none';

    shaderBtn.onclick = () => {
      shaderWin.style.display = shaderWin.style.display === 'none' ? 'block' : 'none';
    };

    
    
    
    const container = document.createElement('div');
    container.style.padding = '4px';
    shaderWin.appendChild(container);

    
    const statusDiv = document.createElement('div');
    statusDiv.style.margin = '4px';
    statusDiv.style.fontSize = '14px';
    statusDiv.style.color = 'var(--qt-text, #eaf1ff)';
    statusDiv.textContent = 'Inaktiv';
    container.appendChild(statusDiv);

    
    const errorDiv = document.createElement('div');
    errorDiv.style.margin = '4px';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.color = 'rgba(255, 140, 140, 0.9)';
    container.appendChild(errorDiv);

    
    const typeDiv = document.createElement('div');
    typeDiv.style.margin = '8px 4px';
    typeDiv.style.fontSize = '12px';
    typeDiv.innerHTML = '<span>Shader-Typ:</span>';
    const typeSelect = document.createElement('select');
    typeSelect.style.width = '100%';
    typeSelect.style.background = 'var(--qt-bg, rgba(24, 26, 34, 0.9))';
    typeSelect.style.color = 'var(--qt-text, #eaf1ff)';
    typeSelect.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    typeSelect.style.marginTop = '2px';
    const optVertex = document.createElement('option'); optVertex.value = 'vertex'; optVertex.textContent = 'Vertex-Shader';
    const optFragment = document.createElement('option'); optFragment.value = 'fragment'; optFragment.textContent = 'Fragment-Shader';
    optFragment.selected = true;
    typeSelect.appendChild(optVertex);
    typeSelect.appendChild(optFragment);
    typeDiv.appendChild(typeSelect);
    container.appendChild(typeDiv);

    
    const codeLabel = document.createElement('div');
    codeLabel.style.margin = '8px 4px 2px 4px';
    codeLabel.style.fontSize = '12px';
    codeLabel.textContent = 'Shader-Code:';
    container.appendChild(codeLabel);

    const codeArea = document.createElement('textarea');
    codeArea.style.width = 'calc(100% - 8px)';
    codeArea.style.height = '200px';
    codeArea.style.background = 'rgba(18, 20, 28, 0.9)';
    codeArea.style.color = 'var(--qt-text, #eaf1ff)';
    codeArea.style.fontFamily = 'monospace';
    codeArea.style.fontSize = '12px';
    codeArea.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    codeArea.style.padding = '4px';
    codeArea.style.whiteSpace = 'pre';
    codeArea.style.overflow = 'auto';
    container.appendChild(codeArea);

    
    codeArea.value = `
precision highp float;
varying vec2 v_coord;
uniform sampler2D u_texture;

void main() {
  vec4 color = texture2D(u_texture, v_coord);
  
  gl_FragColor = vec4(1.0 - color.rgb, color.a);
}`;

    
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '4px';
    btnContainer.style.margin = '4px';
    container.appendChild(btnContainer);

    const activateBtn = document.createElement('button');
    activateBtn.textContent = 'Aktivieren';
    activateBtn.style.flex = '1';
    activateBtn.style.background = 'rgba(255,255,255,0.12)';
    activateBtn.style.color = 'var(--qt-text, #eaf1ff)';
    activateBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    activateBtn.style.borderRadius = '8px';
    activateBtn.style.padding = '8px';
    activateBtn.style.cursor = 'pointer';
    btnContainer.appendChild(activateBtn);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.style.flex = '1';
    resetBtn.style.background = 'rgba(255,255,255,0.08)';
    resetBtn.style.color = 'var(--qt-text, #eaf1ff)';
    resetBtn.style.border = '1px solid var(--qt-border, rgba(255,255,255,0.12))';
    resetBtn.style.borderRadius = '8px';
    resetBtn.style.padding = '8px';
    resetBtn.style.cursor = 'pointer';
    btnContainer.appendChild(resetBtn);

    
    
    
    let active = false;
    let originalGetContext = HTMLCanvasElement.prototype.getContext;
    let originalShaderSource = null;
    let originalCompileShader = null;

    
    function extractShaderSource(shader) {
      if (!shader) return null;
      
      return shader.__originalSource || null;
    }

    
    function hijackWebGL() {
      if (!window.WebGLRenderingContext) {
      errorDiv.innerHTML = 'Fehler: Keine WebGL-Unterstützung gefunden.';
        return false;
      }

      
      originalGetContext = HTMLCanvasElement.prototype.getContext;

      
      HTMLCanvasElement.prototype.getContext = function(contextId, options) {
        const ctx = originalGetContext.call(this, contextId, options);
        if (contextId === 'webgl' || contextId === 'experimental-webgl') {
          
          patchWebGLContext(ctx);
        }
        return ctx;
      };

      return true;
    }

    function patchWebGLContext(gl) {
      if (!gl) return;

      
      originalShaderSource = gl.shaderSource;
      originalCompileShader = gl.compileShader;

      
      gl.shaderSource = function(shader, source) {
        
        shader.__originalSource = source;
        
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

      
      gl.compileShader = function(shader) {
        originalCompileShader.call(gl, shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          const log = gl.getShaderInfoLog(shader);
          if (log) {
      errorDiv.innerHTML = 'Fehler: Shader-Kompilierung fehlgeschlagen:<br>' + log.replace(/\n/g, '<br>');
          }
        }
      };
    }

    
    
    
    activateBtn.onclick = () => {
      if (!active) {
        
        active = true;
        activateBtn.textContent = 'Deaktivieren';
        activateBtn.style.background = 'var(--qt-accent, #b78bff)';
        activateBtn.style.color = '#111';
        statusDiv.innerHTML = 'Aktiv (Shader-Hijacking)';
        errorDiv.innerHTML = '';

        
        hijackWebGL();

        
        
        
        document.querySelectorAll('canvas').forEach(canvas => {
          const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (ctx) patchWebGLContext(ctx);
        });
      } else {
        
        active = false;
        activateBtn.textContent = 'Aktivieren';
        activateBtn.style.background = 'rgba(255,255,255,0.12)';
        activateBtn.style.color = 'var(--qt-text, #eaf1ff)';
        statusDiv.innerHTML = 'Inaktiv';
      }
    };

    resetBtn.onclick = () => {
      
      codeArea.value = `
precision highp float;
varying vec2 v_coord;
uniform sampler2D u_texture;

void main() {
  vec4 color = texture2D(u_texture, v_coord);
  
  gl_FragColor = vec4(1.0 - color.rgb, color.a);
}`;
      errorDiv.innerHTML = '';
    };

    
    
    
    window.addEventListener('beforeunload', () => {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });

    return shaderBtn;
  };
})();
