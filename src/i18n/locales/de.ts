import type { PartialDictionary } from "../localeMeta";
import { appsDe } from "./apps/de";

/** Deutsch — Portal-UI + Apps (legal fällt auf Englisch zurück) */
export const de: PartialDictionary = {
  brand: "My Tool Box",
  common: {
    backToPortal: "← Zurück zum Portal",
    loading: "Laden…",
    close: "Schließen",
    save: "Speichern",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    clear: "Leeren",
  },
  header: {
    support: "Entwickler unterstützen",
    supportShort: "Unterstützen",
    supportAria: "Entwickler unterstützen (Stripe öffnen)",
    supportTitle: "Support-Seite öffnen",
    langToggleAria: "Anzeigesprache wechseln",
    layoutToggle: {
      aria: "Anzeigebreite wechseln",
      caption: "Width",
      defaultShort: "Normal",
      wideShort: "Breit",
      fullShort: "Voll",
      default: "In Normalbreite anzeigen",
      wide: "Breiter anzeigen",
      full: "Vollbild anzeigen",
    },
  },
  home: {
    heroTitleLine1: "Ein Werkzeugkasten,",
    heroTitleLine2: "der den Alltag etwas leichter macht.",
    heroLead1: "Portal mit nützlichen Indie-Tools.",
    heroLead2: "Interessantes Tool gefunden? Einfach ausprobieren.",
  },
  genres: {
    business: {
      name: "Produktivität",
      description: "Praxisnahe Tools für den Arbeitsalltag",
    },
    creators: {
      name: "Creator-Tools",
      description: "Werkzeuge für Erstellung und Veröffentlichung",
    },
    utilities: {
      name: "Alltagshelfer",
      description: "Allgemeine Tools für schnelle Aufgaben",
    },
    minigames: {
      name: "Minispiele",
      description: "Kleine Spiele für kurze Pausen",
    },
  },
  tools: {
    "invoice-maker": {
      title: "Beleg-Maker",
      description: "Rechnungen, Angebote, Lieferscheine und Quittungen im A4-PDF.",
    },
    "mail-template": {
      title: "E-Mail-Vorlagen",
      description: "Tags und Variablen für schnellere Antworten.",
    },
    "folder-generator": {
      title: "Ordner-Generator",
      description: "Ordner per Regel mit Datum, Nummern und Listen erzeugen.",
    },
    "pdf-editor": {
      title: "Einfacher PDF-Editor",
      description: "Zusammenführen, sortieren und Seiten löschen im Browser.",
    },
    "image-compressor": {
      title: "Bildkompressor",
      description: "Stapelweise skalieren und komprimieren im Browser.",
    },
    "text-cleaner": {
      title: "Textbereinigung",
      description: "Zeilenumbrüche, Leerzeichen und Steuerzeichen bereinigen.",
    },
    "media-metadata-editor": {
      title: "Medien-Metadaten",
      description: "Tags und Cover von Audio/Video im Browser bearbeiten.",
    },
    "character-relation-editor": {
      title: "Figuren-Netzwerk",
      description: "Beziehungen einer Geschichte mit Karten und Linien ordnen.",
    },
    "book-visualizer": {
      title: "AI Book Studio",
      description: "Seitenlayout bearbeiten und als .mybook teilen.",
    },
    "palette-collector": {
      title: "Palette Collector",
      description: "Farbpaletten aus Bildern, inkl. Kontrastprüfung.",
    },
    "lunch-savings": {
      title: "Mittags-Sparbuch",
      description: "Differenz zum Budget tippen und spielerisch sparen.",
    },
    "link-stocker": {
      title: "Links parken",
      description: "URLs als OGP-Karten behalten – nicht ganz Lesezeichen.",
    },
    "ultimate-probability-slot": {
      title: "Wahrscheinlichkeits-Slot",
      description: "Eigene Niedrig-Odds-Maschine bis zum Treffer.",
    },
    "pixel-drop-puzzle": {
      title: "Pixel-Spalt-Puzzle",
      description: "Foto in den Spalt fallen lassen. Subpixel-Präzision.",
    },
    "robot-freethrow": {
      title: "Wurf-Freistoß",
      description: "Mit Winkel, Schub und Spin auf den Ring zielen.",
    },
    "crypto-message": {
      title: "Geheimnachricht",
      description: "Mit Passphrase ver-/entschlüsseln. Caesar-Challenge inklusive.",
    },
    "monster-driver": {
      title: "Monster Driver",
      description: "Bei Rot stoppen, bei Blau starten. Ego-Action.",
    },
  },
  card: {
    open: "Öffnen",
    comingSoon: "Demnächst",
    comingSoonHint: "Bald verfügbar",
    mobileSupported: "Mobil OK",
    mobileSupportedHint: "Für Mobilgeräte optimiert",
    pcRecommended: "PC empfohlen",
    pcRecommendedHint: "Am besten am PC nutzen",
  },
  footer: {
    tagline: "Indie-Tools, die den Alltag erleichtern",
    navAria: "Betreiberinformationen",
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutz",
    environmentLabel: "Umgebung",
    noticeLabel: "Hinweis",
    localOnly:
      "🔒 Diese Seite läuft zu 100 % lokal und sendet keine Dateien oder Eingaben an einen Server. Keine Tracking-Cookies. Wir zählen nur anonymisierte Besuche und Tool-Nutzung.",
  },
  messages: {
    environment:
      "Alle Tools laufen im Browser. Keine Installation nötig – Windows, Mac oder Smartphone.",
    persistence:
      "Daten liegen im LocalStorage. Cache-Löschen oder Gerätewechsel kann sie entfernen. Wichtiges regelmäßig exportieren.",
    safety:
      "Eingaben bleiben nur in Ihrem Browser und werden nie an den Betreiber-Server gesendet.",
    safetyShort: "Daten nur im Browser; nichts geht an den Server.",
    privacyBanner:
      "Alles läuft in diesem Browser. Nichts wird nach außen gesendet.",
  },
  dataManager: {
    buttonTitle: "Daten (Backup & Wiederherstellung)",
    buttonAria: "Daten (Backup & Wiederherstellung)",
    buttonLabel: "Backup",
    buttonLabelShort: "Daten",
    dialogTitle: "Daten (Backup & Wiederherstellung)",
    close: "Schließen",
    safetyHeading: "Zur Datensicherheit",
    backupReasonHeading: "Warum ein Backup?",
    export: "📥 Daten exportieren (Speichern)",
    import: "📤 Daten importieren (Laden)",
    noData: "Dieses Tool speichert keine Einstellungen. Nichts wird nach außen gesendet.",
    exportOk: "Backup-Datei heruntergeladen.",
    exportFail: "Export fehlgeschlagen.",
    importOk: "Daten geladen.",
    importFail: "Laden fehlgeschlagen.",
    importInvalid: "Datei konnte nicht übernommen werden.",
    importConfirm: "Aktuelle Daten werden überschrieben. Fortfahren?",
  },
  apps: appsDe,
};
