# Quantum Client – Das ultimative Multitool für taming.io

Quantum Client ist eine leistungsstarke Browser-Erweiterung für **taming.io**, die eine Vielzahl von Modulen und Werkzeugen bietet, um dein Spielerlebnis zu verbessern. Von praktischen Helfern wie Autoclicker und Makro-Recorder bis hin zu optischen Anpassungen und KI-gestützter Spielererkennung – Quantum Client vereint alles in einer benutzerfreundlichen Oberfläche.

## 📦 Features

Das Tool besteht aus vielen einzelnen **Modulen**, die du über das Hauptmenü ein- und ausschalten kannst. Jedes Modul hat seinen eigenen Button und kann bei Bedarf konfiguriert werden.

| Modul | Beschreibung |
|-------|--------------|
| **Graph** | Zeigt FPS, Ping und Frametime in Echtzeit als Liniendiagramm an. |
| **Scale** | Vergrößert das Spielcanvas um den Faktor 2 (nützlich für bessere Sicht). |
| **Automation** | Ermöglicht das Ausführen von Aktionen (Mausklick, Tastendruck) nach einem bestimmten Trigger und Delay. |
| **ESP** | Markiert Spieler auf dem Bildschirm durch Analyse der `drawImage`-Aufrufe. |
| **Themer** | Ersetzt bestimmte Bild-URLs durch eigene Bilder (wie ein Texture Pack). |
| **3D Tracker** | Extrahiert 3D-Positionen von Objekten aus der Spiel-Engine (LiteGL). |
| **Network Inspector** | Zeigt WebSocket-Nachrichten (MessagePack) in einem Fenster an – ideal zum Verstehen der Spielkommunikation. |
| **Range Indicator** | Zeichnet einen Kreis oder ein Fadenkreuz um die Maus – hilfreich für Bogenreichweite. |
| **Autoclicker** | Klickt automatisch mit einstellbarer Geschwindigkeit, wahlweise nur bei gedrückter Taste. |
| **Mouse Stats** | Zeigt CPS (Klicks pro Sekunde), Mausgeschwindigkeit und Durchschnittswerte als Grafik. |
| **Key Counter** | Tortendiagramm der am häufigsten gedrückten Tasten. |
| **AI Tracker** | (Experimentell) Erkennt Spieler mit einem YOLOv11-ONNX-Modell direkt im Browser. |
| **Edit-Moment** | Friert den Bildschirm ein, färbt alles schwarz-weiß und vibriert zum Beat eines Sounds. |
| **Makro Recorder Pro** | Zeichnet Mausbewegungen, Klicks und Tastendrücke auf und spielt sie mit einstellbarer Geschwindigkeit ab – inklusive Visualisierung während der Aufnahme. |
| **Quantum Menu** | Ein spektakuläres Menü, das mit der rechten Umschalttaste geöffnet wird – Buttons kreisen um ein leuchtendes Logo, lassen sich ziehen und kollidieren physikalisch miteinander. |
| **Adblock Hider** | Versteckt lästige Adblock-Elemente (`#ccc-bottom`, `#ccc-left`) dauerhaft. |
| **Theme Changer** | Ändert das Aussehen des Spiels: ersetzt Farben, Schriftarten und das Startbild. |
| **Splash Screen** | Zeigt beim Laden der Seite ein schwarzes Overlay mit Logo und Sound – konfigurierbar. |
| **Sounds** | Globale Soundeffekte für Klicks, Hover, Slider und Checkboxen. |

## 🚀 Installation

1. Lade den gesamten Quellcode als ZIP herunter oder klone das Repository.
2. Öffne Chrome (oder einen anderen Chromium-Browser) und gehe zu `chrome://extensions`.
3. Aktiviere den **Entwicklermodus** (oben rechts).
4. Klicke auf **"Entpackte Erweiterung laden"** und wähle den Ordner aus, in dem sich die `manifest.json` befindet.
5. Die Erweiterung wird installiert und ist sofort aktiv.

**Hinweis:** Für einige Funktionen (Autoclicker, Automation, Makro-Recorder) wird die **Debugger-API** verwendet. Diese erfordert, dass die Erweiterung entsprechende Berechtigungen hat (bereits in der `manifest.json` enthalten).

## 🖱️ Verwendung

Nach der Installation erscheint auf `taming.io` ein schwebendes **Hauptmenü** (Kontrollzentrum). Dieses kannst du mit der Maus verschieben. Es enthält alle Modul-Buttons, die du durch Klick öffnen kannst. Bei mehr als 3 Modulen erscheinen Pfeile zum Blättern.

- **Rechtsklick** auf einen Button öffnet das Keybind-Menü – dort kannst du eine Taste oder Maustaste festlegen, die den Button auslöst.
- **Pfeil nach unten** unter dem Hauptmenü öffnet das **Einstellungspanel**, wo du das Aussehen des Hauptmenüs (Farbe, Transparenz, Rundung, Schatten) anpassen kannst.
- **Rechte Umschalttaste** öffnet das **Quantum Menu** – ein schwebendes Kreis-Menü mit zusätzlichen Funktionen (Credits, Theme-Editor, News, Quick Settings, Entwickler-Tools, UI-Skalierung, Makro-Recorder). Dort lassen sich Buttons ziehen und sie interagieren physikalisch miteinander.

## 🧩 Module im Detail

### Graph (FPS & Ping)
Zeigt zwei Liniendiagramme für FPS und Ping. Im Fenster siehst du aktuelle Werte, Durchschnittswerte und einen Reset-Button. Die Ping-Messung erfolgt per `HEAD`-Request auf `taming.io`, um 404-Fehler zu vermeiden.

### Scale
Vergrößert das Canvas des Spiels um das Doppelte. Ein erneuter Klick stellt die Originalgröße wieder her.

### Automation
Erstelle Automations-Regeln: Wähle einen **Trigger** (Tastatur- oder Maustaste) und eine **Aktion** (Mausklick oder Tastendruck). Der Delay (Verzögerung) wird über einen Schieberegler eingestellt. Mehrere Regeln sind möglich.

### ESP
Analysiert `drawImage`-Aufrufe, um Spieler auf dem Bildschirm zu markieren. Du kannst die Bild-ID anpassen (standardmäßig die von taming.io). Die Markierungen erscheinen als rote Punkte.

### Themer
Ersetzt bestimmte Bild-URLs durch eigene Bilder. Gib einen Teil der Original-URL ein und den Pfad zu deinem Ersatzbild (relativ zum Extension-Ordner, z.B. `assets/neu.png`). Die Ersetzung funktioniert live für neu geladene Bilder.

### 3D Tracker
Extrahiert 3D-Positionen von Objekten aus der Spiel-Engine (LiteGL). Die Positionen werden auf einem Overlay-Canvas als grüne Punkte dargestellt. Das Modul muss erst über den Button im Fenster gestartet werden.

### Network Inspector
Zeigt alle WebSocket-Nachrichten (MessagePack) an – sowohl gesendete (→) als auch empfangene (←). Die Nachrichten werden automatisch decodiert. Ideal zum Reverse Engineering der Spiel-API.

### Range Indicator
Zeichnet verschiedene Zielhilfen um die Maus: Kreis, Fadenkreuz, Punkt, Zielscheibe etc. Größe und Farbe sind einstellbar. Per Klick aktivierbar.

### Autoclicker
Klickt automatisch mit einstellbarer Frequenz (1–50 CPS). Du kannst die Maustaste wählen, einen Hold-Modus (nur bei gedrückter Taste) aktivieren und eine zufällige Verzögerung einstellen. Ein Zähler protokolliert die ausgeführten Klicks.

### Mouse Stats
Zeigt Echtzeit-Graphen für CPS (Klicks pro Sekunde) und Mausgeschwindigkeit (Pixel/s). Darunter werden der aktuelle und der durchschnittliche CPS angezeigt.

### Key Counter
Ein Tortendiagramm der am häufigsten gedrückten Tasten. Die Top-5 werden als farbige Segmente dargestellt, die restlichen Tasten als "Andere". Jedes Segment zeigt die Prozentzahl an.

### AI Tracker (experimentell)
Verwendet ein YOLOv11-Modell (ONNX), um Spieler auf dem Canvas zu erkennen. Die Erkennung läuft lokal im Browser über ONNX Runtime Web. Benötigt WebGPU oder WASM-Fallback. Das Modell muss im Ordner `models` liegen.

### Edit-Moment
Startet mit einem Klick einen Sound, friert den Bildschirm ein (Graustufen, keine Interaktion) und lässt das gesamte Fenster im Takt vibrieren. Ideal für dramatische Momente.

### Makro Recorder Pro
Zeichnet Mausbewegungen, Klicks und Tastendrücke auf. Während der Aufnahme wird ein Trail der Mausbewegungen und Marker für Klicks/Tasten eingeblendet. Die Wiedergabe kann mit einstellbarer Geschwindigkeit abgespielt werden (echte Klicks und Tasten via Debugger). Die Steuerung erfolgt über F1 (Aufnahme starten), F2 (stoppen), F3 (abspielen).

### Quantum Menu
Ein beeindruckendes Kreis-Menü, das mit **rechter Umschalttaste** geöffnet wird. Die Buttons kreisen langsam um das Logo, lassen sich ziehen und kollidieren physikalisch miteinander. Jeder Button öffnet ein Untermenü:
- **Credits**: Informationen über den Client.
- **Theme Editor**: Listet alle auf der Seite gefundenen Farben auf (mit Beispiel-Selektoren). Du kannst einzelne Farben ersetzen.
- **Taming.io News**: Platzhalter für Discord-News (kann später ergänzt werden).
- **Quick Settings**: Schnellzugriff auf Autoclicker, ESP, Network, Zielhilfe.
- **Entwickler-Tools**: Zeigt Seiten-Informationen (URL, User-Agent, Canvas-Anzahl, WebGL).
- **UI-Skalierung**: Skaliert das Quantum-Menü selbst (experimentell).
- **Makro Recorder Pro**: Öffnet das Makro-Modul.

### Adblock Hider
Versteckt die Elemente `#ccc-bottom` und `#ccc-left`, die oft von Adblockern hinterlassen werden. Das Modul ist standardmäßig aktiv und überwacht das DOM auf neu hinzugefügte Elemente.

### Theme Changer
Ändert das visuelle Erscheinungsbild des Spiels:
- Ersetzt das Startbild `play-picture.png?5` durch `utils/ui/animation.gif`.
- Ändert die Hintergrundfarben von `#pets` und `#eqLFz` zu `#0f0e15`.
- Ersetzt die Standardschriftarten durch `font2.ttf`.

Standardmäßig aktiv, kann über das Fenster deaktiviert werden.

### Splash Screen
Zeigt beim Laden der Seite ein schwarzes Overlay mit Logo, eigenem Text und Sound. Die Einblendung erfolgt sanft mit 4 Sekunden Dauer. Die Schriftart kann aus dem `fonts`-Ordner geladen werden.

### Sounds
Globale Soundeffekte für alle UI-Elemente:
- `click.mp3` – beim Klicken von Buttons, Icon-Buttons und Selects
- `hover.mp3` – beim Überfahren von interaktiven Elementen (mit 50ms Verzögerung)
- `slide.mp3` – beim Verschieben von Slidern (`input`-Event)
- `checkbox.mp3` – beim Umschalten von Checkboxen

Die Sounds müssen im Ordner `utils` liegen. Sie werden automatisch von `core.js` geladen und abgespielt.

## ⌨️ Tastenkürzel / Keybinds

Du kannst für jeden Button im Hauptmenü einen **Keybind** festlegen:
- Rechtsklick auf den Button öffnet das Keybind-Fenster.
- Drücke eine beliebige Taste (z.B. `F`, `ShiftLeft`) oder klicke eine Maustaste (Links, Mitte, Rechts).
- Der Button wird dann bei jedem Drücken dieser Taste ausgelöst.

## 🎨 Anpassung (Einstellungspanel)

Über den **Pfeil nach unten** am Hauptmenü erreichst du das Einstellungspanel. Dort kannst du:
- Hauptmenü ein-/ausblenden
- Hintergrundfarbe wählen
- Transparenz einstellen
- Schriftfarbe ändern
- Rahmenfarbe ändern
- Rundung (border-radius) anpassen
- Schattenintensität einstellen
- Schriftart aus dem `fonts`-Ordner auswählen (`font.ttf`, `font2.ttf`)

Alle Änderungen werden sofort auf alle Fenster (Hauptmenü, Modul-Fenster) angewendet.

## 📁 Projektstruktur

```
quantum-client/
├── manifest.json
├── background.js
├── icons/                      # Icons für die Buttons (56x65, 35x35 Icons)
│   ├── textur.png
│   ├── textur-hover.png
│   ├── textur-active.png
│   └── *.png (scale, graph, auto, esp, ...)
├── utils/                       # Medien und Hilfsdateien
│   ├── startup.mp3
│   ├── edit.mp3
│   ├── click.mp3, hover.mp3, slide.mp3, checkbox.mp3
│   ├── logo.png
│   └── ui/
│       └── animation.gif
├── fonts/                        # Schriftarten
│   ├── font.ttf
│   └── font2.ttf
├── models/                       # ONNX-Modelle (optional für AI Tracker)
│   └── YOLO11n.onnx
└── content/                       # Alle Modul-Dateien
    ├── core.js
    ├── graph.js
    ├── scale.js
    ├── automation.js
    ├── esp.js
    ├── themer.js
    ├── tracker.js
    ├── network.js
    ├── range.js
    ├── autoclicker.js
    ├── mousestats.js
    ├── keycounter.js
    ├── ai_tracker.js
    ├── edit_moment.js
    ├── macro_recorder.js
    ├── quantum_menu.js
    ├── adblock_hider.js
    ├── theme_changer.js
    ├── splash.js
    ├── navigation.js
    └── main.js
```

## 🛠️ Entwicklung / Eigene Module

Jedes Modul ist als Funktion im globalen `taming`-Objekt registriert (z.B. `t.graph`). Es erhält das `overlay` (Hauptmenü) als Parameter und gibt den erstellten Button zurück. Die Module werden in `main.js` nacheinander aufgerufen und in die Navigation eingereiht.

**Beispiel für ein neues Modul:**

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
    // ... Inhalt ...
    return btn;
  };
})();
```

In `main.js` muss es dann aufgerufen werden.

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz veröffentlicht. Siehe [LICENSE](LICENSE) für weitere Informationen.

## 🙏 Danksagung

- Allen Testern und Unterstützern, die mit ihrem Feedback geholfen haben.
- Der Open-Source-Community für Bibliotheken wie TensorFlow.js, ONNX Runtime, glMatrix, etc.
- Taming.io für ein unterhaltsames Spiel, das uns inspiriert hat.

---

**Viel Spaß mit Quantum Client!**  
Bei Fragen, Problemen oder Ideen öffne ein Issue auf GitHub.