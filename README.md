# Quantum Client – The ultimate multitool for taming.io

---

## Deutsch

**Kurzbeschreibung**
Quantum Client ist eine leistungsstarke Browser-Erweiterung für das Spiel (im Folgenden „der Client“), die zahlreiche Module und Werkzeuge bereitstellt, um das Spielerlebnis zu erweitern und anzupassen. Die Erweiterung bietet Automatisierung, Analyse-, UI- und Audio-Funktionen sowie experimentelle KI-Features in einer konsistenten, konfigurierbaren Oberfläche.

### Features (Kurz)

* Modular aufgebaut: einzelne Module können ein-/ausgeschaltet und konfiguriert werden.
* Performance- und Netzwerktools (FPS/Ping-Graph, Network Inspector).
* Automatisierung (Autoclicker, Makro-Recorder, Automations-Regeln).
* Sicht- und Interface-Anpassungen (Themer, Theme Changer, Scale, Splash Screen).
* Spieler-Analyse (ESP, 3D-Tracker, experimenteller AI Tracker).
* Bedienkomfort (Quantum Menu, Keybinds, Sounds, Adblock Hider).

### Installation

1. Repository klonen oder als ZIP herunterladen.
2. Chrome/Chromium öffnen und `chrome://extensions` aufrufen.
3. Entwicklermodus aktivieren.
4. **Entpackte Erweiterung laden** und den Ordner mit `manifest.json` auswählen.
5. Erweiterung ist danach aktiv.

> Hinweis: Für bestimmte Funktionen (Autoclicker, Makro-Recorder, Automation) wird die Debugger-API genutzt; die nötigen Berechtigungen sind in der `manifest.json` voreingestellt.

### Verwendung

* Nach Installation erscheint ein verschiebbares Hauptmenü (Kontrollzentrum) im Spiel.
* Modul-Buttons öffnen die jeweiligen Fenster; mehr als drei Module können über Pfeile geblättert werden.
* Rechtsklick auf einen Button öffnet das Keybind-Fenster zur Zuweisung einer Taste oder Maustaste.
* Die rechte Umschalttaste öffnet das Quantum Menu — ein kreisförmiges Schnellmenü mit zusätzlichen Tools.

### Wichtige Module (Kurzbeschreibung)

* **Graph**: Echtzeit-Liniendiagramme für FPS und Ping.
* **Scale**: Vergrößert das Canvas (2×).
* **Automation**: Regeln mit Triggern und Aktionen plus Delay.
* **ESP**: Markiert Spieler durch Analyse von `drawImage`-Aufrufen.
* **AI Tracker (experimentell)**: Lokale Objekterkennung via ONNX (WebGPU/WASM Fallback).
* **Makro Recorder Pro**: Aufnahme und Abspielen von Maus/Tastatur mit Visualisierung.
* **Quantum Menu**: Kreis-Menü mit physikalischer Interaktion der Buttons.
* **Adblock Hider**: Entfernt häufige Adblock-Restelemente automatisch.
* **Theme Changer / Themer**: Ersetzt Bilder, Farben und Fonts live.

### Anpassung (Einstellungspanel)

Über das Einstellungspanel lassen sich Farben, Transparenz, Schrift, Rundung (border-radius), Schattenstärke und Schriftart aus dem `fonts`-Ordner anpassen. Änderungen werden sofort auf alle Fenster angewandt.

### Projektstruktur (Beispiel)

```
quantum-client/
├── manifest.json
├── background.js
├── icons/
├── utils/
│   ├── startup.mp3
│   └── ui/animation.gif
├── fonts/
├── models/        # ONNX-Modelle (optional für AI Tracker)
└── content/       # Moduldateien
    ├── core.js
    ├── graph.js
    ├── automation.js
    ├── esp.js
    ├── ai_tracker.js
    ├── macro_recorder.js
    ├── quantum_menu.js
    └── main.js
```

**Beispiel: Eigenes Modul**

```javascript
// content/mein_modul.js
(function() {
  const t = window.taming;

  t.meinModul = function(overlay) {
    const btn = t.createIconButton('mein-icon', 56, 65, 35);
    const win = t.createWindow('Mein Modul', '100px', '100px', '300px', '200px');
    win.style.display = 'none';
    btn.onclick = () => {
      win.style.display = win.style.display === 'none' ? 'block' : 'none';
    };
    return btn;
  };
})();
```

### Entwicklung / Beiträge

* Module registrieren sich am globalen `taming`-Objekt (z. B. `t.graph`) und erhalten das `overlay` als Parameter.
* In `main.js` werden die Module initialisiert und in die Navigation eingefügt.
* Pull Requests sollten klar beschreiben: Modul-Zweck, Konfigurationsoptionen, und nötige Assets/Modelle.

### Lizenz

Dieses Projekt steht unter der **MIT-Lizenz**. Siehe `LICENSE` für Details.

---

## English

**Summary**
Quantum Client is a feature-rich browser extension for the game (hereafter “the client”) that provides modular tools to enhance and customize gameplay. It combines automation, analysis, UI and audio controls, plus experimental AI features into a single configurable interface.

### Key features (short)

* Modular design: enable/disable individual modules and configure them.
* Performance & network tools (FPS/Ping graph, Network Inspector).
* Automation (autoclicker, macro recorder, automation rules).
* Visual and UI customization (themer, theme changer, scale, splash screen).
* Player analysis (ESP, 3D tracker, experimental AI tracker).
* Usability features (quantum menu, keybinds, UI sounds, adblock hider).

### Installation

1. Clone the repository or download as ZIP.
2. Open Chrome/Chromium and navigate to `chrome://extensions`.
3. Enable Developer mode.
4. Click **Load unpacked** and select the folder containing `manifest.json`.
5. The extension will be installed and active.

> Note: Some features rely on the Debugger API (autoclicker, macro recorder, automation). Required permissions are included in `manifest.json`.

### Usage

* After installation a movable main control panel appears in the game.
* Each module has a button that opens its window; paging arrows appear if there are more than three modules.
* Right-click a module button to assign a keybind (keyboard or mouse button).
* Press Right Shift to open the Quantum Menu — a circular quick menu with additional tools.

### Notable modules (short)

* **Graph**: Real-time line charts for FPS and ping.
* **Scale**: Doubles the game canvas size.
* **Automation**: Rules with triggers, actions and configurable delays.
* **ESP**: Marks players by analyzing `drawImage` calls.
* **AI Tracker (experimental)**: Local detection using ONNX models (WebGPU/WASM fallback).
* **Macro Recorder Pro**: Records and replays mouse/keyboard with visual feedback.
* **Quantum Menu**: Circular menu where buttons orbit and collide physically.
* **Adblock Hider**: Automatically hides common adblock residue elements.
* **Theme Changer / Themer**: Live replacement of images, colors and fonts.

### Customization (settings panel)

The settings panel allows choosing main menu visibility, background color, transparency, text and border colors, border-radius, shadow intensity and fonts from the `fonts` folder. Changes apply immediately.

### Project structure (example)

```
quantum-client/
├── manifest.json
├── background.js
├── icons/
├── utils/
├── fonts/
├── models/
└── content/
    ├── core.js
    ├── graph.js
    ├── automation.js
    ├── esp.js
    ├── ai_tracker.js
    ├── macro_recorder.js
    ├── quantum_menu.js
    └── main.js
```

**Example: Adding a custom module**

```javascript
// content/my_module.js
(function() {
  const t = window.taming;

  t.myModule = function(overlay) {
    const btn = t.createIconButton('my-icon', 56, 65, 35);
    const win = t.createWindow('My Module', '100px', '100px', '300px', '200px');
    win.style.display = 'none';
    btn.onclick = () => {
      win.style.display = win.style.display === 'none' ? 'block' : 'none';
    };
    return btn;
  };
})();
```

### Development / Contributions

* Modules register on the global `taming` object (e.g. `t.graph`) and receive the `overlay` parameter.
* `main.js` initializes modules and injects navigation entries.
* For PRs, document purpose, configuration options and any required assets or models.

### License

This project is released under the **MIT License**. See `LICENSE` for details.

---

## Русский

**Кратко**
Quantum Client — расширение для браузера, которое добавляет в игру модульные инструменты для улучшения и настройки игрового процесса. Включает средства автоматизации, анализа, настройки интерфейса и звука, а также экспериментальные функции на базе ИИ.

### Основные возможности (кратко)

* Модульная архитектура: включайте/выключайте и настраивайте отдельные модули.
* Инструменты для мониторинга и сети (графики FPS/Ping, Network Inspector).
* Автоматизация (автокликер, макро-рекордер, правила автоматизации).
* Визуальные и UI-настройки (Themer, Theme Changer, Scale, Splash Screen).
* Анализ игроков (ESP, 3D-трекер, экспериментальный AI Tracker).
* Удобство использования (Quantum Menu, назначение клавиш, звуки интерфейса, Adblock Hider).

### Установка

1. Клонируйте репозиторий или скачайте ZIP.
2. Откройте Chrome/Chromium и перейдите на `chrome://extensions`.
3. Включите режим разработчика.
4. Нажмите **Load unpacked** и выберите папку с `manifest.json`.
5. Расширение установится и будет активно.

> Примечание: Некоторые функции используют Debugger API (автокликер, макро-рекордер, автоматизация). Необходимые разрешения указаны в `manifest.json`.

### Использование

* После установки в игре появится перемещаемое главное меню (панель управления).
* Кнопки модулей открывают соответствующие окна; если модулей больше трёх — появляются стрелки для прокрутки.
* Правый клик по кнопке открывает окно назначения клавиш (keybind).
* Правая клавиша Shift открывает Quantum Menu — круговое меню с дополнительными инструментами.

### Важные модули (кратко)

* **Graph**: графики FPS и ping в реальном времени.
* **Scale**: увеличение canvas в 2 раза.
* **Automation**: правила с триггерами, действиями и задержками.
* **ESP**: маркировка игроков через анализ `drawImage`.
* **AI Tracker (экспериментально)**: локальное обнаружение через ONNX (WebGPU/WASM).
* **Makro Recorder Pro**: запись и воспроизведение мыши/клавиатуры с визуализацией.
* **Quantum Menu**: круговое меню с орбитой и физическими взаимодействиями кнопок.
* **Adblock Hider**: скрывает элементы, оставшиеся от блокировщиков рекламы.
* **Theme Changer / Themer**: замена изображений, цветов и шрифтов в реальном времени.

### Настройки

В панели настроек можно изменять: видимость меню, цвет фона, прозрачность, цвет текста и рамок, скругление (border-radius), интенсивность тени и шрифты из папки `fonts`. Изменения применяются мгновенно.

### Структура проекта (пример)

```
quantum-client/
├── manifest.json
├── background.js
├── icons/
├── utils/
├── fonts/
├── models/
└── content/
    ├── core.js
    ├── graph.js
    ├── automation.js
    ├── esp.js
    ├── ai_tracker.js
    ├── macro_recorder.js
    ├── quantum_menu.js
    └── main.js
```

**Пример: собственный модуль**

```javascript
// content/my_module.js
(function() {
  const t = window.taming;

  t.myModule = function(overlay) {
    const btn = t.createIconButton('my-icon', 56, 65, 35);
    const win = t.createWindow('My Module', '100px', '100px', '300px', '200px');
    win.style.display = 'none';
    btn.onclick = () => {
      win.style.display = win.style.display === 'none' ? 'block' : 'none';
    };
    return btn;
  };
})();
```

### Разработка / Вклад

* Модули регистрируются на глобальном объекте `taming` (например, `t.graph`) и получают параметр `overlay`.
* В `main.js` модули инициализируются и добавляются в навигацию.
* При создании PR указывайте назначение модуля, параметры конфигурации и требуемые ресурсы/модели.

### Лицензия

Проект распространяется под **MIT License**. См. `LICENSE` для деталей.

---
