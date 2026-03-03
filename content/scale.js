// content/scale.js
(function() {
  const t = window.taming;

  t.scale = function(overlay) {
    const scaleBtn = t.createIconButton('scale', 56, 65, 35);
    scaleBtn.onclick = () => {
      t.gameCanvas = document.querySelector('canvas');
      if (!t.gameCanvas) return;
      if (!t.scaled) {
        t.originalWidth = t.gameCanvas.width;
        t.originalHeight = t.gameCanvas.height;
        t.gameCanvas.width *= 2;
        t.gameCanvas.height *= 2;
        t.scaled = true;
      } else {
        t.gameCanvas.width = t.originalWidth;
        t.gameCanvas.height = t.originalHeight;
        t.scaled = false;
      }
    };
    return scaleBtn;
  };
})();