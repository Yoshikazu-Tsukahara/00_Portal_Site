import type { PartialDictionary } from "../localeMeta";
import { appsFr } from "./apps/fr";

/** Français — UI portail + apps (legal en anglais en secours) */
export const fr: PartialDictionary = {
  brand: "My Tool Box",
  common: {
    backToPortal: "← Retour au portail",
    loading: "Chargement…",
    close: "Fermer",
    save: "Enregistrer",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    clear: "Effacer",
  },
  header: {
    support: "Soutenir le développeur",
    supportShort: "Soutenir",
    supportAria: "Soutenir le développeur (ouvrir Stripe)",
    supportTitle: "Ouvrir la page de soutien",
    langToggleAria: "Changer la langue",
    layoutToggle: {
      aria: "Changer la largeur d’affichage",
      caption: "Width",
      defaultShort: "Normal",
      wideShort: "Large",
      fullShort: "Plein",
      default: "Afficher en largeur normale",
      wide: "Afficher plus large",
      full: "Afficher en plein écran",
    },
  },
  home: {
    heroTitleLine1: "Une boîte à outils",
    heroTitleLine2: "pour rendre le quotidien un peu plus simple.",
    heroLead1: "Portail d’outils utiles développés en indie.",
    heroLead2: "Si un outil vous intéresse, essayez-le librement.",
  },
  genres: {
    business: {
      name: "Productivité",
      description: "Outils concrets pour le travail au quotidien",
    },
    creators: {
      name: "Créateurs",
      description: "Boîte à outils pour créer et publier",
    },
    utilities: {
      name: "Utilitaires",
      description: "Outils généraux pour les petites tâches",
    },
    minigames: {
      name: "Mini-jeux",
      description: "Petits jeux pour une pause entre deux tâches",
    },
  },
  tools: {
    "invoice-maker": {
      title: "Créateur de documents",
      description: "Factures, devis, bons et reçus en A4. PDF multi-langues et devises.",
    },
    "mail-template": {
      title: "Modèles d’e-mail",
      description: "Tags et variables pour répondre plus vite.",
    },
    "folder-generator": {
      title: "Générateur de dossiers",
      description: "Créez des dossiers en lot avec dates, numéros et listes.",
    },
    "pdf-editor": {
      title: "Éditeur PDF simple",
      description: "Fusionnez, réordonnez et supprimez des pages dans le navigateur.",
    },
    "image-compressor": {
      title: "Compresseur d’images",
      description: "Redimensionnez et compressez par lots dans le navigateur.",
    },
    "text-cleaner": {
      title: "Nettoyage de texte",
      description: "Nettoyez retours, espaces et caractères de contrôle.",
    },
    "media-metadata-editor": {
      title: "Éditeur de métadonnées",
      description: "Éditez tags et pochettes audio/vidéo dans le navigateur.",
    },
    "character-relation-editor": {
      title: "Carte des personnages",
      description: "Organisez les relations d’une histoire avec cartes et liens.",
    },
    "book-visualizer": {
      title: "AI Book Studio",
      description: "Éditez la mise en page et partagez en .mybook.",
    },
    "palette-collector": {
      title: "Palette Collector",
      description: "Extrayez des palettes d’images, avec contrôle de contraste.",
    },
    "lunch-savings": {
      title: "Épargne déjeuner",
      description: "Enregistrez l’écart au budget et économisez en jouant.",
    },
    "link-stocker": {
      title: "Liens à garder",
      description: "Gardez des URL « presque favoris » en cartes OGP.",
    },
    "ultimate-probability-slot": {
      title: "Machine à sous proba",
      description: "Défiez votre propre machine à très faible probabilité.",
    },
    "pixel-drop-puzzle": {
      title: "Puzzle chute de pixel",
      description: "Laissez tomber la photo dans la fente. Précision subpixel.",
    },
    "robot-freethrow": {
      title: "Lancer projectile",
      description: "Visez l’anneau avec angle, poussée et spin.",
    },
    "crypto-message": {
      title: "Message secret",
      description: "Chiffrez avec une phrase secrète. Défi César inclus.",
    },
    "monster-driver": {
      title: "Monster Driver",
      description: "Stop au rouge, partez au bleu. Action à la première personne.",
    },
  },
  card: {
    open: "Ouvrir",
    comingSoon: "Bientôt",
    comingSoonHint: "Disponible prochainement",
    mobileSupported: "Mobile OK",
    mobileSupportedHint: "Optimisé pour mobile",
    pcRecommended: "PC conseillé",
    pcRecommendedHint: "Utilisation recommandée sur PC",
  },
  footer: {
    tagline: "Des outils indie qui allègent le quotidien",
    navAria: "Infos opérateur",
    terms: "Conditions",
    privacy: "Confidentialité",
    environmentLabel: "Environnement",
    noticeLabel: "Avis",
    localOnly:
      "🔒 Ce site fonctionne 100 % en local et n’envoie ni fichiers ni saisies à un serveur. Pas de cookies de suivi personnel. Nous ne mesurons que des visites et usages anonymisés.",
  },
  messages: {
    environment:
      "Tous les outils tournent dans le navigateur. Sans installation, sur Windows, Mac ou mobile.",
    persistence:
      "Les données sont dans le LocalStorage du navigateur. Elles peuvent disparaître après un vidage de cache. Exportez régulièrement l’essentiel.",
    safety:
      "Vos données restent dans votre navigateur et ne sont jamais envoyées au serveur de l’opérateur.",
    safetyShort: "Données locales uniquement ; rien n’est envoyé au serveur.",
    privacyBanner:
      "Tout est traité dans ce navigateur. Rien n’est envoyé à l’extérieur.",
  },
  dataManager: {
    buttonTitle: "Données (sauvegarde et restauration)",
    buttonAria: "Données (sauvegarde et restauration)",
    buttonLabel: "Sauvegarde",
    buttonLabelShort: "Données",
    dialogTitle: "Données (sauvegarde et restauration)",
    close: "Fermer",
    safetyHeading: "Sécurité des données",
    backupReasonHeading: "Pourquoi sauvegarder",
    export: "📥 Exporter (sauver)",
    import: "📤 Importer (charger)",
    noData: "Cet outil n’enregistre aucun réglage. Rien n’est envoyé à l’extérieur.",
    exportOk: "Fichier de sauvegarde téléchargé.",
    exportFail: "Échec de l’export.",
    importOk: "Données chargées.",
    importFail: "Échec du chargement.",
    importInvalid: "Impossible d’appliquer ce fichier.",
    importConfirm: "Les données actuelles seront écrasées. Continuer ?",
  },
  apps: appsFr,
};
