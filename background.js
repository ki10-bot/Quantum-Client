// background.js
let attachedTabId = null;
let debuggerAttached = false;

function attachDebugger(tabId) {
  return new Promise((resolve, reject) => {
    if (debuggerAttached && attachedTabId === tabId) {
      resolve();
      return;
    }
    const target = { tabId };
    chrome.debugger.attach(target, "1.3", () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        attachedTabId = tabId;
        debuggerAttached = true;
        chrome.debugger.sendCommand(target, "Input.setIgnoreInputEvents", { ignore: false });
        resolve();
      }
    });
  });
}

function detachDebugger() {
  return new Promise((resolve) => {
    if (!debuggerAttached) return resolve();
    const target = { tabId: attachedTabId };
    chrome.debugger.detach(target, () => {
      debuggerAttached = false;
      attachedTabId = null;
      resolve();
    });
  });
}

function dispatchMouseEvent(tabId, type, x, y, button = 'left') {
  return new Promise((resolve, reject) => {
    const target = { tabId };
    const params = {
      type,
      x: Math.round(x),
      y: Math.round(y),
      button,
      clickCount: 1,
      modifiers: 0
    };
    chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", params, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve();
      }
    });
  });
}


const VK_MAP = {
  32: { key: ' ', code: 'Space' },
  13: { key: 'Enter', code: 'Enter' },
  9: { key: 'Tab', code: 'Tab' },
  8: { key: 'Backspace', code: 'Backspace' },
  16: { key: 'Shift', code: 'ShiftLeft' },
  17: { key: 'Control', code: 'ControlLeft' },
  18: { key: 'Alt', code: 'AltLeft' },
  37: { key: 'ArrowLeft', code: 'ArrowLeft' },
  38: { key: 'ArrowUp', code: 'ArrowUp' },
  39: { key: 'ArrowRight', code: 'ArrowRight' },
  40: { key: 'ArrowDown', code: 'ArrowDown' },
  
};

function vkToKeyAndCode(vk) {
  if (VK_MAP[vk]) return VK_MAP[vk];
  if (vk >= 65 && vk <= 90) {
    const ch = String.fromCharCode(vk);
    return { key: ch.toLowerCase(), code: 'Key' + ch };
  }
  if (vk >= 48 && vk <= 57) {
    const ch = String.fromCharCode(vk);
    return { key: ch, code: 'Digit' + ch };
  }
  try {
    const ch = String.fromCharCode(vk);
    return { key: ch, code: ch.length === 1 ? ('Key' + ch.toUpperCase()) : String(vk) };
  } catch (e) {
    return { key: '', code: String(vk) };
  }
}


function sendRawKeyDown(tabId, vk) {
  return new Promise((resolve, reject) => {
    const target = { tabId };
    const { key, code } = vkToKeyAndCode(vk) || {};
    const params = {
      type: 'rawKeyDown',
      windowsVirtualKeyCode: vk,
      nativeVirtualKeyCode: vk,
      key: key || undefined,
      code: code || undefined,
      text: key || undefined,
      unmodifiedText: key || undefined,
      autoRepeat: false,
      isKeypad: false,
      isSystemKey: false,
      modifiers: 0
    };
    chrome.debugger.sendCommand(target, 'Input.dispatchKeyEvent', params, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve();
      }
    });
  });
}


function sendKeyUp(tabId, vk) {
  return new Promise((resolve, reject) => {
    const target = { tabId };
    const { key, code } = vkToKeyAndCode(vk) || {};
    const params = {
      type: 'keyUp',
      windowsVirtualKeyCode: vk,
      nativeVirtualKeyCode: vk,
      key: key || undefined,
      code: code || undefined,
      modifiers: 0
    };
    chrome.debugger.sendCommand(target, 'Input.dispatchKeyEvent', params, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve();
      }
    });
  });
}


function dispatchKeyEvent(tabId, type, keyCode) {
  return new Promise((resolve, reject) => {
    const target = { tabId };

    const key = String.fromCharCode(keyCode).toLowerCase();
    const code = key.length === 1
      ? "Key" + key.toUpperCase()
      : key;

    const params = {
      type, 
      key: key,
      code: code,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode,
      text: type === "keyDown" ? key : undefined,
      unmodifiedText: type === "keyDown" ? key : undefined,
      autoRepeat: false,
      isKeypad: false,
      isSystemKey: false,
      modifiers: 0
    };

    chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", params, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve();
      }
    });
  });
}


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'visual-search',
    title: 'Bild analysieren (KI-Suche)',
    contexts: ['image']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'visual-search' && info.srcUrl) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'analyzeImage',
      imageUrl: info.srcUrl
    });
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  
  function bringToFrontIfPossible(tabId) {
    return new Promise((resolve) => {
      try {
        chrome.debugger.sendCommand({ tabId }, 'Page.bringToFront', {}, () => resolve());
      } catch (e) {
        resolve();
      }
    });
  }

  if (!tabId && message.action !== 'attach') {
    sendResponse({ success: false, error: "No tab id" });
    return false;
  }

  if (message.action === "attach") {
    attachDebugger(tabId)
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true;
  }

  if (message.action === "detach") {
    detachDebugger()
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true;
  }

  if (message.action === "click") {
    attachDebugger(tabId)
      .then(() => dispatchMouseEvent(tabId, 'mousePressed', message.x, message.y, message.button))
      .then(() => new Promise(resolve => setTimeout(resolve, 30)))
      .then(() => dispatchMouseEvent(tabId, 'mouseReleased', message.x, message.y, message.button))
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true;
  }

  if (message.action === "mousePressed") {
    attachDebugger(tabId)
      .then(() => dispatchMouseEvent(tabId, 'mousePressed', message.x, message.y, message.button))
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true;
  }

  if (message.action === "mouseReleased") {
    attachDebugger(tabId)
      .then(() => dispatchMouseEvent(tabId, 'mouseReleased', message.x, message.y, message.button))
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true;
  }

  
  if (message.action === "keyDown") {
    attachDebugger(tabId)
      .then(() => bringToFrontIfPossible(tabId))
      .then(() => sendRawKeyDown(tabId, message.keyCode))
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true;
  }

  
  if (message.action === "keyUp") {
    attachDebugger(tabId)
      .then(() => bringToFrontIfPossible(tabId))
      .then(() => sendKeyUp(tabId, message.keyCode))
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true;
  }

  
  if (message.action === "keypress") {
    attachDebugger(tabId)
      .then(() => bringToFrontIfPossible(tabId))
      .then(() => {
        
        const vk = message.keyCode;
        const { key, code } = vkToKeyAndCode(vk) || {};
        return new Promise((res, rej) => {
          
          chrome.debugger.sendCommand({ tabId }, 'Input.dispatchKeyEvent', {
            type: 'rawKeyDown',
            windowsVirtualKeyCode: vk,
            nativeVirtualKeyCode: vk,
            key: key || undefined,
            code: code || undefined,
            text: key || undefined,
            unmodifiedText: key || undefined,
            autoRepeat: false,
            isKeypad: false,
            isSystemKey: false,
            modifiers: 0
          }, () => {
            if (chrome.runtime.lastError) return rej(chrome.runtime.lastError.message);
            
            if (key && key.length > 0 && key !== 'Shift' && key !== 'Control' && key !== 'Alt') {
              chrome.debugger.sendCommand({ tabId }, 'Input.dispatchKeyEvent', {
                type: 'char',
                text: key
              }, () => {
                
                chrome.debugger.sendCommand({ tabId }, 'Input.dispatchKeyEvent', {
                  type: 'keyUp',
                  windowsVirtualKeyCode: vk,
                  nativeVirtualKeyCode: vk,
                  key: key || undefined,
                  code: code || undefined,
                  modifiers: 0
                }, () => {
                  if (chrome.runtime.lastError) return rej(chrome.runtime.lastError.message);
                  res();
                });
              });
            } else {
              
              chrome.debugger.sendCommand({ tabId }, 'Input.dispatchKeyEvent', {
                type: 'keyUp',
                windowsVirtualKeyCode: vk,
                nativeVirtualKeyCode: vk,
                key: key || undefined,
                code: code || undefined,
                modifiers: 0
              }, () => {
                if (chrome.runtime.lastError) return rej(chrome.runtime.lastError.message);
                res();
              });
            }
          });
        });
      })
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true;
  }

  sendResponse({ success: false, error: "Unknown action" });
  return false;
});

chrome.runtime.onSuspend.addListener(() => {
  if (debuggerAttached) {
    chrome.debugger.detach({ tabId: attachedTabId });
  }
});
