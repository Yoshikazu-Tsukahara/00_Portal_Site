import type { PartialDictionary } from "../localeMeta";
import { appsDe } from "./apps/de";

/** Deutsch — Portal-UI + Apps (legal fällt auf Englisch zurück) */
export const de: PartialDictionary = {
  brand: "Blank Note",
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
      title: "Formular",
      description: "Rechnungen, Angebote, Lieferscheine und Quittungen im A4-PDF.",
    },
    "mail-template": {
      title: "Mailvorlagen",
      description: "Tags und Variablen für schnellere Antworten.",
    },
    "folder-generator": {
      title: "Ordnerbatch",
      description: "Ordner per Regel mit Datum, Nummern und Listen erzeugen.",
    },
    "pdf-editor": {
      title: "PDF-Editor",
      description: "Zusammenführen, sortieren und Seiten löschen im Browser.",
    },
    "image-compressor": {
      title: "Bildkompress",
      description: "Stapelweise skalieren und komprimieren im Browser.",
    },
    "text-cleaner": {
      title: "Textpflege",
      description: "Zeilenumbrüche, Leerzeichen und Steuerzeichen bereinigen.",
    },
    "media-metadata-editor": {
      title: "Medientags",
      description: "Tags und Cover von Audio/Video im Browser bearbeiten.",
    },
    "character-relation-editor": {
      title: "Figurennetz",
      description: "Beziehungen einer Geschichte mit Karten und Linien ordnen.",
    },
    "book-visualizer": {
      title: "Seiteneditor",
      description: "Seitenlayout bearbeiten und als .mybook teilen.",
    },
    "palette-collector": {
      title: "Farbpalette",
      description: "Farbpaletten aus Bildern, inkl. Kontrastprüfung.",
    },
    "lunch-savings": {
      title: "Mittagsparen",
      description: "Differenz zum Budget tippen und spielerisch sparen.",
    },
    "link-stocker": {
      title: "Linkspeicher",
      description: "URLs als OGP-Karten behalten – nicht ganz Lesezeichen.",
    },
    "ultimate-probability-slot": {
      title: "Chance-Slot",
      description: "Eigene Niedrig-Odds-Maschine bis zum Treffer.",
    },
    "pixel-drop-puzzle": {
      title: "Pixelwurf",
      description: "Foto in den Spalt fallen lassen. Subpixel-Präzision.",
    },
    "robot-freethrow": {
      title: "Wurfspiel",
      description: "Mit Winkel, Anfangsgeschwindigkeit und Spin auf den Ring zielen.",
    },
    "crypto-message": {
      title: "Geheimtext",
      description: "Mit Passphrase ver-/entschlüsseln. Caesar-Challenge inklusive.",
    },
    "monster-driver": {
      title: "Monsterfahrt",
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
    contact: "Kontakt",
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutz",
    environmentLabel: "Umgebung",
    noticeLabel: "Hinweis",
    localOnly:
      "🔒 Dateien und Eingaben der Tools werden standardmäßig im Browser verarbeitet und gespeichert; der Betreiber sammelt oder speichert deren Inhalte nicht. Keine Tracking-Cookies. Wir zählen nur anonymisierte Besuche und Tool-Nutzung. Einige Tools können begrenzte Netzwerkanfragen stellen (siehe Datenschutz).",
  },
  messages: {
    environment:
      "Tools laufen in der Regel im Browser – ohne Installation. Nutzbar unter Windows, Mac und Smartphone; manche Tools sind PC-orientiert (nicht mobil). Zum Ansehen und beim ersten Nutzen braucht es Internet; Offline für die ganze Site ist nicht garantiert.",
    persistence:
      "Daten liegen im LocalStorage. Cache-Löschen oder Gerätewechsel kann sie entfernen. Wichtiges regelmäßig exportieren.",
    safety:
      "Eingaben bleiben standardmäßig auf Ihrem Gerät (Browser). Der Betreiber sammelt oder speichert deren Inhalte nicht auf Servern. Geräterisiken decken wir nicht ab – bitte sichern Sie Wichtiges.",
    safetyShort: "Daten bleiben standardmäßig im Browser; der Betreiber sammelt keine Inhalte.",
    privacyBanner:
      "Dateien und Eingaben werden standardmäßig in diesem Browser verarbeitet. Der Betreiber sammelt oder speichert deren Inhalte nicht.",
    privacyBannerShort:
      "Standardmäßig im Browser. Wir speichern keine Eingaben.",
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
    noData: "Dieses Tool speichert keine Einstellungen. Der Betreiber sammelt oder speichert verarbeitete Inhalte nicht.",
    exportOk: "Backup-Datei heruntergeladen.",
    exportFail: "Export fehlgeschlagen.",
    importOk: "Daten geladen.",
    importFail: "Laden fehlgeschlagen.",
    importInvalid: "Datei konnte nicht übernommen werden.",
    importConfirm: "Aktuelle Daten werden überschrieben. Fortfahren?",
  },
  apps: appsDe,
  contact: {
    title: "Kontakt",
    lead: "Formular ausfüllen und absenden, um Ihre E-Mail-App zu öffnen. Es wird nichts an einen Server gesendet.",
    mailtoHint: "※ Mit Senden öffnet sich Ihr E-Mail-Programm",
    submit: "E-Mail-App zum Senden öffnen",
    messageRequired: "Bitte eine Nachricht eingeben.",
    categoryLabel: "Anfrageart",
    categories: {
      general: "Allgemeine Anfrage",
      feature: "Funktionswunsch",
      bug: "Fehlerbericht",
      other: "Sonstiges",
    },
    appLabel: "Betroffene App",
    appPlaceholder: "Optional",
    appNone: "(Keine)",
    nameLabel: "Ihr Name",
    namePlaceholder: "Optional",
    emailLabel: "Antwort-E-Mail",
    emailPlaceholder: "you@example.com",
    emailHint: "Optional — für eine Antwort bitte angeben",
    messageLabel: "Nachricht",
    messagePlaceholder: "Ihre Frage, Ihr Wunsch oder Fehlerdetails",
    subjectPrefix: "[Blank Note] Kontakt",
    bodyLabels: {
      category: "Anfrageart",
      app: "Betroffene App",
      name: "Name",
      email: "Antwort-E-Mail",
      message: "Nachricht",
      environment: "Umgebung (automatisch angehängt)",
      notProvided: "(nicht angegeben)",
    },
  },
};
