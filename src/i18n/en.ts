import { appsEn } from "./apps";
import type { Dictionary } from "./types";

export const en: Dictionary = {
  brand: "My Tool Box",
  common: {
    backToPortal: "← Back to portal",
    loading: "Loading…",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    clear: "Clear",
  },
  header: {
    support: "Support the developer",
    supportShort: "Support",
    supportAria: "Support the developer (opens Stripe Checkout)",
    supportTitle: "Open support page",
    langToggleAria: "Switch display language",
    layoutToggle: {
      aria: "Switch content width",
      caption: "Width",
      defaultShort: "Std",
      wideShort: "Wide",
      fullShort: "Full",
      default: "Default width",
      wide: "Wide layout",
      full: "Full width",
    },
  },
  home: {
    heroTitleLine1: "A toolbox that makes",
    heroTitleLine2: "everyday work a little easier.",
    heroLead1: "A portal of handy tools born from indie development.",
    heroLead2: "Find something useful and give it a try.",
  },
  genres: {
    business: {
      name: "Work efficiency",
      description: "Practical tools that ease day-to-day work just a bit",
    },
    creators: {
      name: "Creator support",
      description: "A toolkit for publishing and creative work",
    },
    utilities: {
      name: "Everyday utilities",
      description: "General utilities for small everyday tasks",
    },
    minigames: {
      name: "Mini Games",
      description: "A dash of madness and probability for your downtime",
    },
  },
  tools: {
    "invoice-maker": {
      title: "Form Maker",
      description:
        "A4 invoices, estimates, delivery notes & receipts. Multi-currency PDF.",
    },
    "mail-template": {
      title: "Mail Template Organizer",
      description: "Speed up email replies with tags and variable substitution.",
    },
    "folder-generator": {
      title: "Folder Generator",
      description:
        "Build naming rules, then batch-create folders and export as ZIP.",
    },
    "pdf-editor": {
      title: "Simple PDF Editor",
      description: "Merge, reorder, and delete pages entirely in the browser.",
    },
    "image-compressor": {
      title: "Batch Image Compressor",
      description: "Resize and compress images in-browser with width and quality.",
    },
    "text-cleaner": {
      title: "Text Cleansing",
      description: "Clean breaks, spaces, and control chars. Save custom rules.",
    },
    "media-metadata-editor": {
      title: "Media Metadata Editor",
      description: "Edit audio/video tags and cover art locally in the browser.",
    },
    "character-relation-editor": {
      title: "Character Relation Editor",
      description: "Map story ties with character cards and labeled links.",
    },
    "book-visualizer": {
      title: "AI Book Studio",
      description: "Edit the page layout directly and share as .mybook.",
    },
    "palette-collector": {
      title: "Palette Collector",
      description: "Eyedrop colors from images. Auto-extract and contrast checks.",
    },
    "lunch-savings": {
      title: "Lunch Savings",
      description: "Tap lunch vs budget and watch savings grow—built for phones.",
    },
    "link-stocker": {
      title: "Link Stocker",
      description: "Keep “maybe later” URLs as visual cards with OGP thumbs.",
    },
    "ultimate-probability-slot": {
      title: "Ultimate Probability Slot",
      description: "Chase or dodge your own ultra-low-odds jackpot slot.",
    },
    "pixel-drop-puzzle": {
      title: "Pixel Gap Drop Puzzle",
      description: "Drop a photo into the gap—judged to a fraction of a pixel.",
    },
    "robot-freethrow": {
      title: "Projectile Freethrow",
      description: "Aim with angle, thrust, and spin in a projectile freethrow game.",
    },
    "crypto-message": {
      title: "Secret Message",
      description: "Passphrase encrypt/decrypt, plus a Caesar decoding challenge.",
    },
    "monster-driver": {
      title: "Monster Driver",
      description: "Stop on red, launch on green. Blinkers, memory, reaction.",
    },
  },
  card: {
    open: "Open",
    comingSoon: "Coming soon",
    comingSoonHint: "Available shortly",
    mobileSupported: "Mobile",
    mobileSupportedHint: "Optimized for smartphones",
    pcRecommended: "PC",
    pcRecommendedHint: "Best experienced on a computer",
  },
  footer: {
    tagline: "Indie tools that ease everyday hassle",
    navAria: "Site information",
    contact: "Contact",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    environmentLabel: "Environment",
    noticeLabel: "Notes",
    localOnly:
      "🔒 The Site runs 100% locally: your files and inputs are never sent to our servers. We do not use cookies for personal tracking. For improvement only, we measure anonymized page views and tool-usage counts.",
  },
  messages: {
    environment:
      "Every tool on this site runs entirely in your browser. No install is required—use it on Windows, Mac, smartphones, and more.",
    persistence:
      "Saved data lives in your browser’s LocalStorage. Clearing cache or site data, or switching browsers/devices, can erase it. Please export (“Save”) important data regularly and keep a copy yourself.",
    safety:
      "Data you enter or create with these tools stays only on your computer (in the browser). Nothing is sent to the operator’s servers, so the risk of external leakage is effectively zero.",
    safetyShort:
      "Data stays in your browser and is never sent to a server.",
    privacyBanner:
      "Everything runs in this browser. Your files and inputs stay on your device.",
  },
  dataManager: {
    buttonTitle: "Data management (backup & restore)",
    buttonAria: "Data management (backup & restore)",
    buttonLabel: "Backup",
    buttonLabelShort: "Data",
    dialogTitle: "Data management (backup & restore)",
    close: "Close",
    safetyHeading: "About data safety",
    backupReasonHeading: "Why we recommend backups",
    export: "📥 Export data (Save)",
    import: "📤 Import data (Load)",
    noData:
      "This tool only runs in the current session and has no settings to save. Nothing is sent externally.",
    exportOk: "Backup file downloaded.",
    exportFail: "Export failed.",
    importOk: "Data imported.",
    importFail: "Import failed.",
    importInvalid: "Could not apply the file contents.",
    importConfirm: "Current data will be overwritten. Continue?",
  },
  contact: {
    title: "Contact",
    lead: "Fill in the form below and submit to open your email app. Nothing is posted to a server.",
    mailtoHint: "※ Pressing Send opens your email app",
    submit: "Open email app to send",
    messageRequired: "Please enter a message.",
    categoryLabel: "Inquiry type",
    categories: {
      general: "General inquiry",
      feature: "Feature request",
      bug: "Bug report",
      other: "Other",
    },
    appLabel: "Related app",
    appPlaceholder: "Optional",
    appNone: "(None)",
    nameLabel: "Your name",
    namePlaceholder: "Optional",
    emailLabel: "Reply-to email",
    emailPlaceholder: "you@example.com",
    emailHint: "Optional — fill in if you’d like a reply",
    messageLabel: "Message",
    messagePlaceholder: "Your question, request, or bug details",
    subjectPrefix: "[My Tool Box] Contact",
    bodyLabels: {
      category: "Inquiry type",
      app: "Related app",
      name: "Name",
      email: "Reply-to email",
      message: "Message",
      environment: "Environment (auto-attached)",
      notProvided: "(not provided)",
    },
  },
  legal: {
    back: "← Back to portal",
    updatedPrefix: "Last updated: ",
    terms: {
      title: "Terms of Use",
      updatedAt: "July 21, 2026",
      sections: [
        {
          title: "1. Applicability",
          blocks: [
            {
              type: "p",
              text: "These Terms of Use (the “Terms”) govern use of the website “My Tool Box” (the “Site”) and the tools on it (collectively, the “Service”) provided by Yoshikazu Tsukahara (the “Operator”). By using the Service, you agree to these Terms.",
            },
          ],
        },
        {
          title: "2. Nature of the Service (provided AS IS)",
          blocks: [
            {
              type: "callout",
              parts: [
                {
                  text: "The Service is a set of free tools developed personally by the Operator. It is not a commercially guaranteed product and is provided ",
                },
                { text: "“AS IS”", strong: true },
                { text: "." },
              ],
            },
            {
              type: "p",
              text: "The Operator does not warrant any of the following:",
            },
            {
              type: "ul",
              items: [
                "Accuracy, completeness, usefulness, or fitness for a particular purpose",
                "Freedom from bugs, defects, interruptions, layout issues, or compatibility problems",
                "Continued availability, maintenance, improvements, or free support",
                "Identical behavior across all devices, browsers, and operating systems",
              ],
            },
            {
              type: "p",
              text: "If you use the Service for important business data or documents with legal effect, you do so at your own responsibility and judgment.",
            },
          ],
        },
        {
          title: "3. Data storage and backup responsibility",
          blocks: [
            {
              type: "p",
              text: "Many tools store settings and data in the browser’s LocalStorage (or similar). Data may be lost or corrupted for reasons including:",
            },
            {
              type: "ul",
              items: [
                "Clearing browser cache, cookies, or site data",
                "Reinstalling the browser or OS, or switching profiles",
                "Moving to another device/browser, or ending a private browsing session",
                "Insufficient storage, browser changes, or browser defects",
                "User error, including overwrite imports",
              ],
            },
            {
              type: "callout",
              parts: [
                {
                  text: "Backing up (exporting and keeping) your data is entirely your responsibility.",
                  strong: true,
                },
                {
                  text: " The Operator does not guarantee preservation, restoration, or migration of LocalStorage data and accepts no liability for loss or corruption.",
                },
              ],
            },
          ],
        },
        {
          title: "4. Prohibited conduct",
          blocks: [
            {
              type: "p",
              text: "You must not engage in any of the following when using the Service:",
            },
            {
              type: "ul",
              items: [
                "Acts that violate law or public order and morals",
                "Acts that infringe the rights or interests of the Site or third parties",
                "Acts that interfere with operation (excessive load, unauthorized access, etc.)",
                "Unauthorized copying, redistribution, or commercial resale of all or part of the Service (except as permitted by law)",
              ],
            },
          ],
        },
        {
          title: "5. Intellectual property",
          blocks: [
            {
              type: "p",
              text: "Rights in text, design, logos, source code, and other content on the Site belong to the Operator or rightful owners. Unauthorized use beyond personal use is prohibited.",
            },
          ],
        },
        {
          title: "6. Disclaimer (important)",
          blocks: [
            {
              type: "callout",
              parts: [
                {
                  text: "The Operator (Yoshikazu Tsukahara) shall ",
                },
                {
                  text: "bear no liability whatsoever for any damages",
                  strong: true,
                },
                {
                  text: " (including direct, indirect, lost profits, data loss, business interruption, or emotional distress, without limitation) arising from use or inability to use the Service, data loss, incorrect display, third-party service issues, or any other matter related to the Service, whether or not the Operator was advised of the possibility of such damages.",
                },
              ],
            },
            {
              type: "p",
              text: "Where law limits disclaimers, the Operator’s liability is limited to the maximum extent permitted. Because the Service is free, any damages payable by the Operator shall be capped at zero (or the minimum amount required by law).",
            },
          ],
        },
        {
          title: "7. Changes, suspension, and termination",
          blocks: [
            {
              type: "p",
              text: "The Operator may change, suspend, or terminate the Service without prior notice, and is not liable for any resulting inconvenience.",
            },
          ],
        },
        {
          title: "8. Changes to these Terms",
          blocks: [
            {
              type: "p",
              text: "The Operator may revise these Terms as needed. Revised Terms take effect when posted on the Site. Continued use after posting constitutes acceptance.",
            },
          ],
        },
        {
          title: "9. Governing law and severability",
          blocks: [
            {
              type: "p",
              text: "These Terms are governed by the laws of Japan. If any provision is held invalid, the remaining provisions continue in full force.",
            },
          ],
        },
        {
          title: "10. Contact",
          blocks: [
            {
              type: "p",
              text: "For questions about these Terms, use the contact details in the Site footer.",
            },
            { type: "p", text: "Operator: Yoshikazu Tsukahara" },
          ],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      updatedAt: "August 1, 2026",
      sections: [
        {
          title: "1. Introduction",
          blocks: [
            {
              type: "p",
              text: "Yoshikazu Tsukahara (the “Operator”) respects the privacy of users of the website “My Tool Box” (the “Site”). This Policy explains how personal information and user data are handled on the Site.",
            },
          ],
        },
        {
          title: "2. Key point: fully local processing",
          blocks: [
            {
              type: "callout",
              parts: [
                {
                  text: "All tools on the Site (including text processing, image compression, mail templates, PDF editing, folder generation, and any other features) ",
                },
                {
                  text: "run only in your device’s browser (a local environment).",
                  strong: true,
                },
                {
                  text: " Text, images, PDFs, templates, settings, and any other data or files you enter, create, or upload are ",
                },
                {
                  text: "never sent to, stored on, or collected by the Operator’s servers.",
                  strong: true,
                },
              ],
            },
            {
              type: "p",
              text: "Information that needs to persist is kept only in LocalStorage (or similar) on your device. Tool content is never under the Operator’s control, and the Operator cannot view, analyze, or share it with third parties.",
            },
          ],
        },
        {
          title: "3. Information we do not collect",
          blocks: [
            {
              type: "p",
              text: "In connection with tool use, the Operator does not obtain or store the following on servers:",
            },
            {
              type: "ul",
              items: [
                "Content entered into tools (text, email bodies, variables, tags, etc.)",
                "Contents or binary data of uploaded images, PDFs, or other files",
                "App data stored in LocalStorage (settings, templates, history, etc.)",
                "Account registration data (the Site does not offer accounts)",
              ],
            },
          ],
        },
        {
          title: "4. Analytics",
          blocks: [
            {
              type: "p",
              text: "The Site runs 100% locally and never sends your files or inputs to a server. We also do not use cookies for personal tracking.",
            },
            {
              type: "p",
              text: "For site improvement only, we use Vercel Analytics to measure anonymized page views and tool-usage counts. Personally identifiable information and any files or inputs inside tools are not included.",
            },
            {
              type: "p",
              text: "Hosting providers, CDNs, and similar infrastructure may also process technical logs from ordinary web traffic under their own policies.",
            },
          ],
        },
        {
          title: "5. Cookies and similar technologies",
          blocks: [
            {
              type: "p",
              text: "The Site does not use advertising cookies or cookies for personal tracking. Analytics (Vercel Analytics) does not rely on cookies.",
            },
            {
              type: "p",
              text: "Browser LocalStorage keeps each tool’s settings and data on your device; the Operator cannot read it remotely.",
            },
          ],
        },
        {
          title: "6. Sharing with third parties",
          blocks: [
            {
              type: "p",
              text: "The Operator does not provide, sell, or share user content generated or stored on your device (it is never sent to servers, so there is nothing to share). Except as required by law, the Operator will not improperly disclose information within its control.",
            },
          ],
        },
        {
          title: "7. External links",
          blocks: [
            {
              type: "p",
              text: "The Site may link to external sites (e.g. note). Please review each site’s privacy policy. The Operator is not responsible for linked sites’ content or practices.",
            },
          ],
        },
        {
          title: "8. Disclaimer",
          blocks: [
            {
              type: "p",
              text: "Browser changes, device settings, or third-party service outages (hosting, analytics, etc.) may cause unexpected data loss or display issues. Please protect your data with your own backups. See also the Terms of Use.",
            },
          ],
        },
        {
          title: "9. Changes to this Policy",
          blocks: [
            {
              type: "p",
              text: "The Operator may revise this Policy as needed. Material changes will be announced on the Site. Continued use after revision constitutes acceptance.",
            },
          ],
        },
        {
          title: "10. Contact",
          blocks: [
            {
              type: "p",
              text: "For questions about this Policy, use the contact details in the Site footer.",
            },
            { type: "p", text: "Operator: Yoshikazu Tsukahara" },
          ],
        },
      ],
    },
  },
  apps: appsEn,
};
