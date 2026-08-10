import type { PartialDictionary } from "../localeMeta";
import { appsFr } from "./apps/fr";

/** Français — UI portail + apps (legal en anglais en secours) */
export const fr: PartialDictionary = {
  brand: "Blank Note",
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
      title: "Formulaires",
      description: "Factures, devis, bons et reçus en A4. PDF multi-langues et devises.",
    },
    "mail-template": {
      title: "Modèles mail",
      description: "Tags et variables pour répondre plus vite.",
    },
    "folder-generator": {
      title: "Dossiers lot",
      description: "Créez des dossiers en lot avec dates, numéros et listes.",
    },
    "pdf-editor": {
      title: "Éditeur PDF",
      description: "Fusionnez, réordonnez et supprimez des pages dans le navigateur.",
    },
    "image-compressor": {
      title: "Compress. img",
      description: "Redimensionnez et compressez par lots dans le navigateur.",
    },
    "text-cleaner": {
      title: "Nettoyage txt",
      description: "Nettoyez retours, espaces et caractères de contrôle.",
    },
    "media-metadata-editor": {
      title: "Méta média",
      description: "Éditez tags et pochettes audio/vidéo dans le navigateur.",
    },
    "character-relation-editor": {
      title: "Carte liens",
      description: "Organisez les relations d’une histoire avec cartes et liens.",
    },
    "book-visualizer": {
      title: "Éditeur page",
      description: "Éditez la mise en page et partagez en .mybook.",
    },
    "palette-collector": {
      title: "Palette couleurs",
      description: "Extrayez des palettes d’images, avec contrôle de contraste.",
    },
    "lunch-savings": {
      title: "Épargne déj.",
      description: "Enregistrez l’écart au budget et économisez en jouant.",
    },
    "link-stocker": {
      title: "Liens gardés",
      description: "Gardez des URL « presque favoris » en cartes OGP.",
    },
    "ultimate-probability-slot": {
      title: "Slot odds",
      description: "Défiez votre propre machine à très faible probabilité.",
    },
    "pixel-drop-puzzle": {
      title: "Pixel drop",
      description: "Laissez tomber la photo dans la fente. Précision subpixel.",
    },
    "robot-freethrow": {
      title: "Lancer projectile",
      description: "Visez l’anneau avec angle, vitesse initiale et spin.",
    },
    "crypto-message": {
      title: "Msg secret",
      description: "Chiffrez avec une phrase secrète. Défi César inclus.",
    },
    "monster-driver": {
      title: "Monster drive",
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
    contact: "Contact",
    terms: "Conditions",
    privacy: "Confidentialité",
    environmentLabel: "Environnement",
    noticeLabel: "Avis",
    localOnly:
      "🔒 Les fichiers et saisies des outils sont traités et stockés dans le navigateur par défaut ; l’opérateur ne collecte ni ne conserve leur contenu. Pas de cookies de suivi personnel. Nous mesurons des visites et usages anonymisés. Certains outils peuvent faire des requêtes réseau limitées (voir Confidentialité).",
  },
  messages: {
    environment:
      "Les outils tournent en général dans le navigateur, sans installation. Utilisables sur Windows, Mac ou mobile ; certains sont orientés PC (non mobile). La consultation et la première utilisation nécessitent Internet ; le hors-ligne pour tout le site n’est pas garanti.",
    persistence:
      "Les données sont dans le LocalStorage du navigateur. Elles peuvent disparaître après un vidage de cache. Exportez régulièrement l’essentiel.",
    safety:
      "Vos données restent sur votre appareil (navigateur) par défaut. L’opérateur ne collecte ni ne conserve ce contenu sur ses serveurs. Cela ne couvre pas les risques liés à l’appareil : sauvegardez l’essentiel.",
    safetyShort: "Données dans le navigateur par défaut ; l’opérateur ne collecte pas le contenu.",
    privacyBanner:
      "Fichiers et saisies sont traités dans ce navigateur par défaut. L’opérateur ne collecte ni ne stocke leur contenu.",
    privacyBannerShort:
      "Sur l’appareil par défaut. Nous ne conservons pas vos saisies.",
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
    noData: "Cet outil n’enregistre aucun réglage. L’opérateur ne collecte ni ne stocke le contenu traité.",
    exportOk: "Fichier de sauvegarde téléchargé.",
    exportFail: "Échec de l’export.",
    importOk: "Données chargées.",
    importFail: "Échec du chargement.",
    importInvalid: "Impossible d’appliquer ce fichier.",
    importConfirm: "Les données actuelles seront écrasées. Continuer ?",
  },
  apps: appsFr,
  contact: {
    title: "Contact",
    lead: "Remplissez le formulaire puis envoyez pour ouvrir votre application mail. Rien n’est envoyé au serveur.",
    mailtoHint: "※ Le bouton Envoyer ouvre votre logiciel de messagerie",
    submit: "Ouvrir le mail pour envoyer",
    messageRequired: "Veuillez saisir un message.",
    categoryLabel: "Type de demande",
    categories: {
      general: "Demande générale",
      feature: "Suggestion de fonction",
      bug: "Signalement de bug",
      other: "Autre",
    },
    appLabel: "App concernée",
    appPlaceholder: "Facultatif",
    appNone: "(Aucune)",
    nameLabel: "Votre nom",
    namePlaceholder: "Facultatif",
    emailLabel: "E-mail de réponse",
    emailPlaceholder: "you@example.com",
    emailHint: "Facultatif — à remplir si vous souhaitez une réponse",
    messageLabel: "Message",
    messagePlaceholder: "Votre question, suggestion ou détail du bug",
    subjectPrefix: "[Blank Note] Contact",
    bodyLabels: {
      category: "Type de demande",
      app: "App concernée",
      name: "Nom",
      email: "E-mail de réponse",
      message: "Message",
      environment: "Environnement (ajouté automatiquement)",
      notProvided: "(non renseigné)",
    },
  },
};
