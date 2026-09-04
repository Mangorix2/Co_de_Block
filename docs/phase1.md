# Co_De_Block => Phase 1
> Verfasst von Lucien, nocht nicht final

## Thema und Zweck der Applikation
Co De Block ist einer Blockbasierte Lernwebapplikation zum lernen von logischen Abläufen und einfache Programmierkonzepte.  
Es soll Kinder den Einstieg in die Welt des Programmieren spielierisch und leicht ermöglichen. Statt Code zu tippen, ziehen sie per Drag and Drop Blöcke hinein und sehen den Output direkt im Browser. 

## Zielgruppe
(Schul-) Kinder, welche das Programmieren lernen.

## Stakeholder

- Kinder
  - Sind die Nutzer der App
- Lehrpersonen
  - Setzen die App im Unterricht ein (hoffentlich)
- Eltern
  - Interesse an was ihre Kinder machen
- Schulleitung
  - Erlaubt die Nutzung der App in der Schule
- Dev-Team
  - Implementiert das ganze
- Herr Zollinger
  - Bewertet uns...
  
## Anforderungen
> KI generiert werden noch überarbeitet

### Funktionale Anforderungen

- **[Muss]** Es gibt mehrere Level, die nacheinander gespielt werden können
- **[Muss]** Jedes Level zeigt ein Gitter/Feld mit einer Figur (Start) und einem Ziel (Ende)
- **[Muss]** Nutzer stellen aus Blöcken (z.B. "vorwärts", "links drehen", "rechts drehen") ein Programm zusammen, das die Figur  zum Ziel steuert
- **[Muss]** Beim Ausführen bewegt sich die Figur animiert Schritt für Schritt gemäss der Blockabfolge durchs Feld
- **[Muss]** Die App erkennt automatisch, ob das Level gelöst ist (Figur erreicht Ziel) oder fehlgeschlagen ist (z.B. Wand getroffen)
- **[Muss]** Ab einem gewissen Level werden Schleifen-Blöcke (z.B. "wiederhole X mal") benötigt/eingeführt, um das Level zu lösen
- **[Muss]** Blöcke, die nicht zusammenpassen, können nicht falsch kombiniert werden (verhindert Syntaxfehler)
---
- **[Soll]** Levels sind in aufsteigender Schwierigkeit aufgebaut (z.B. erst nur Bewegung, dann Schleifen, dann Bedingungen)
- **[Soll]** Eine Level-Übersicht zeigt, welche Level bereits gelöst wurden
- **[Soll]** Bei Fehlschlag gibt es eine einfache Rückmeldung, wieso es nicht geklappt hat (z.B. "Die Figur ist gegen eine Wand gelaufen")
---
- **[Kann]** Es gibt Hindernisse/Gefahren im Feld (z.B. Katze), die vermieden werden müssen
- **[Kann]** Es gibt einen Hinweis-/Tipp-Button pro Level
- **[Kann]** Bedingungs-Blöcke (z.B. "wenn Wand voraus") werden in späteren Levels eingeführt
- **[Kann]** Nutzer können ihren Fortschritt speichern und später weiterspielen


### Nicht-funktionale Anforderungen

- **[Muss]** Kindgerechte, intuitive Benutzeroberfläche (grosse Buttons, farbenfroh, wenig Text)
- **[Muss]** Die App läuft in den gängigen Browsern (Chrome, Firefox, Edge)
- **[Muss]** Reaktionszeit beim Ausführen eines Blockprogramms unter 1 Sekunde
---
- **[Soll]** Responsive Design, damit die App auch auf Tablets nutzbar ist
