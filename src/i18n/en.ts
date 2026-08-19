import { appsEn } from "./apps";
import type { Dictionary } from "./types";

export const en: Dictionary = {
  brand: "Blank Note",
  common: {
    backToPortal: "← Back to portal",
    loading: "Loading…",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    clear: "Clear",
    forceLandscape: {
      title: "Rotate to landscape",
      hint: "This app is designed for landscape. Please turn your device sideways.",
    },
  },
  usageGuide: {
    title: "How Blank Note works",
    steps: [
      {
        title: "Browse the Library",
        body: "Open Library from the header, then pin apps you like to Home.",
      },
      {
        title: "Launch from Home",
        body: "Pinned apps sit on Home. Long-press to rearrange or make folders.",
      },
      {
        title: "Data stays on this device",
        body: "Tool inputs and files are stored in this browser by default. Back up from each app before clearing data.",
      },
    ],
    dontShowAgain: "Don’t show again",
    close: "Get started",
  },
  header: {
    support: "Support the developer",
    supportShort: "Support",
    supportAria: "Support the developer (opens Stripe Checkout)",
    supportTitle: "Open support page",
    langToggleAria: "Switch display language",
    menuAria: "Site menu",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    homeNav: "Home",
    libraryNav: "Library",
    localOnlyBadge: "Inputs & files stay on-device",
    localOnlyBadgeShort: "On-device",
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
    heroTitleLine1: "Your tools,",
    heroTitleLine2: "laid out like a desktop.",
    heroLead1: "A stationery-styled launcher — pin only what you use.",
    heroLead2: "Pin apps from the Library to place them on Home.",
    openLibrary: "Open Library",
    emptyPins: "Home is empty",
    emptyPinsHint: "Pin apps from the Library to see them here.",
    removeAria: "Remove {title} from Home",
    dragAria: "{title}. Drag or use arrow keys to reorder. Press G to folder with next",
    openAria: "Open {title}",
    lockedOnMobileAria:
      "{title}. Not available on phone or portrait. Please use a computer.",
    moveLeft: "Move left",
    moveRight: "Move right",
    reorderedAnnounce: "Moved {title} to position {n}",
    removedAnnounce: "Removed {title} from Home",
    editingAnnounce:
      "Home editing mode. Stack icons to make folders, drag to reorder, tap × to remove. Tap empty space or press Esc to finish.",
    gridLabel: "Home apps",
    folderDefaultName: "Folder",
    openFolderAria: "Open {title}",
    dissolveFolderAria: "Ungroup {title} and return apps to Home",
    folderDragAria: "{title}. Drag or use arrow keys to reorder",
    renameFolderAria: "Rename folder",
    renameFolderPlaceholder: "Folder name",
    closeFolder: "Close",
    ejectFromFolder: "Move out",
    ejectFromFolderAria: "Move {title} out to Home",
    groupWithNext: "Folder with next",
    combineHint: "Stacked on center — release when highlighted to make a folder",
    combineAddHint: "On a folder — release to add it here",
    folderCreatedAnnounce: "Folder created",
    folderAddedAnnounce: "Added {title} to folder",
    folderDissolvedAnnounce: "Folder ungrouped",
    ejectedAnnounce: "Moved {title} out to Home",
  },
  library: {
    title: "Library",
    lead: "Browse apps, read the details, then pin them to Home.",
    install: "Pin",
    installed: "Pinned",
    uninstall: "Unpin",
    removeFromHome: "Unpin from Home",
    openApp: "Open",
    installHint: "Pin this app to Home. Open it from Home afterward.",
    openFromHome: "Open this app from Home.",
    detailBack: "Back to Library",
    notFound: "App not found.",
    scrollPrev: "Previous apps",
    scrollNext: "Next apps",
    aboutLabel: "About this app",
    highlightsLabel: "What you can do",
    gettingStartedLabel: "Getting started",
    tipLabel: "Tip",
    updatedAtLabel: "Last updated",
    devicesLabel: "Compatible devices",
    deviceSmartphone: "Smartphone",
    deviceTablet: "Tablet",
    deviceWindows: "Windows",
    deviceMac: "Mac",
    devicePcRecommended: "PC recommended",
    localDataNote:
      "Inputs and files are processed and stored on this device by default; the operator does not collect or keep their contents. Clearing browser data can wipe them, so back up or export anything important. See the Privacy Policy for details.",
    filterAria: "Filter apps",
    filterAll: "All",
    filterUnpinned: "Not pinned",
    filterEmpty: "No apps match this filter.",
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
      detail: [
        "Build A4 invoices, quotes, delivery notes, and receipts in the browser—no install required. Fill in parties, line items, tax, and currency, preview the layout, then save a PDF on your device.",
        "Made for people who keep rebuilding the same form from scratch. UI language and the language printed on the PDF can be chosen separately.",
      ],
      highlights: [
        "Invoice, quote, delivery note, and receipt types with multi-language, multi-currency, tax, and withholding options",
        "Issuer / recipient / line items, plus logo, seal, and accent color",
        "Preview, then save as PDF via the print dialog",
        "Named form history, sample load, and reset that can keep your company profile",
      ],
      gettingStarted: [
        "Pick document type, document language, currency, and tax rate.",
        "Enter your details, the recipient, and line items (add logo or seal if needed).",
        "Open Preview and check the layout.",
        "Use PDF / Print and save as PDF from the print dialog.",
        "Save the current form to history if you’ll reuse it.",
      ],
      tip: "Faint placeholder fields are omitted when printing. Export a backup from the header control so important history isn’t lost with browser data.",
    },
    "mail-template": {
      title: "Mail Templates",
      description: "Speed up email replies with tags and variable substitution.",
      detail: [
        "Store subject lines and bodies you reuse, find them with tags, and fill names, dates, or project fields with {{variables}} instead of rewriting every time.",
        "Ideal for routine internal mail, support replies, and follow-ups. Data stays on your device, with backup support.",
      ],
      highlights: [
        "Template list with search and tag filters, plus variable substitution",
        "Variable library and colored labels (tags)",
        "Fill → preview → one-click copy of subject, body, or both",
        "Starter samples included; input history speeds re-entry",
      ],
      gettingStarted: [
        "Pick a template from the list, or create a new one.",
        "Fill the variable fields that match {{placeholders}} in the draft.",
        "Check subject and body in preview.",
        "Copy and paste into your usual mail client.",
      ],
      tip: "Copying warns you if variables are still empty. Tag your most-used drafts so they’re easy to find later.",
    },
    "folder-generator": {
      title: "Folder Batch",
      description:
        "Build naming rules, then batch-create folders and export as ZIP.",
      detail: [
        "Replace hand-building the same project folders every time with a naming recipe and a single ZIP of nested folders—dates, serials, and list items included.",
        "Best when every job starts from the same Client / Date / Deliverables shape. Designed primarily for desktop use.",
      ],
      highlights: [
        "Compose formats from text, date, number, and list tokens",
        "Parent/child hierarchy, generation count, optional .gitkeep",
        "Lists by hand or from the first column of Excel/CSV",
        "Tree preview before ZIP export; save naming templates",
      ],
      gettingStarted: [
        "Place text and tokens (date, number, list) on the format row.",
        "Add hierarchy if needed and set date format, numbers, and list values.",
        "Confirm names in the preview.",
        "Export the ZIP and unzip it where you work.",
      ],
      tip: "Save frequent layouts as templates. The live tree isn’t persisted—only templates are.",
    },
    "excel-merger": {
      title: "Sheet Merge",
      description:
        "Drag sheets to merge workbooks. Warns on cross-sheet refs and can export values only.",
      detail: [
        "Drop Excel files and each one becomes a vertical column (up to 5). Sheets appear as cards you can reorder in place or drag onto another column to merge them into that workbook.",
        "Formulas, charts, and defined names that point at other sheets are flagged on the card, and related sheets share a light color. On export you can discard formulas and keep calculated values (recommended) to avoid #REF!. Nothing is uploaded—processing stays in the browser. Designed primarily for desktop use.",
      ],
      highlights: [
        "Up to 5 .xlsx files as kanban columns",
        "Warns on cross-sheet refs (formulas, charts, names, and more)",
        "Related sheets share a light matching color",
        "Export as values (recommended), per column or as a ZIP",
      ],
      gettingStarted: [
        "Drop .xlsx files into the area at the top (up to 5).",
        "Reorder sheet cards inside each file column.",
        "Drag a sheet onto another column to merge it into that file.",
        "Keep “merge as values” on if you like, then Save a column or Download all files.",
      ],
      tip: "Cards with other-sheet refs show a warning and a shared tint. Turn on “merge as values” when extracting sheets to avoid #REF!. Charts, images, and some styling do not carry over.",
    },
    "pdf-editor": {
      title: "PDF Editor",
      description: "Merge, reorder, and delete pages entirely in the browser.",
      detail: [
        "Merge PDFs, fix page order or rotation, and drop pages you don’t need—entirely in the browser, so light cleanup of sensitive docs doesn’t require an upload.",
        "Not a full annotation suite: it’s for tidying pages before you share. Download the result as a PDF.",
      ],
      highlights: [
        "Add multiple PDFs; page or file views",
        "Reorder, rotate, delete, copy/paste, extract, insert blank pages",
        "Undo/redo and download the merged PDF",
        "No server upload—processing stays in the browser",
      ],
      gettingStarted: [
        "Drop PDFs or add them with the file picker.",
        "Reorder, rotate, or delete pages as needed.",
        "Export the PDF and download the result.",
      ],
      tip: "Changing page structure can lock file-level actions. Work is session-only—export as soon as you’re done.",
    },
    "image-compressor": {
      title: "Image Compress",
      description: "Resize and compress images in-browser with width and quality.",
      detail: [
        "Batch-resize and compress images before blog posts, decks, or chat uploads. Set max width and quality (or a preset), process many files at once, and download a ZIP.",
        "Images never leave your device. Only your compression settings are remembered for next time.",
      ],
      highlights: [
        "JPEG/PNG/WebP batches with quality presets",
        "Keep original format or output WebP/JPEG; optional sequential names",
        "Estimated size cues and ZIP download",
        "Settings saved locally (image bytes are not)",
      ],
      gettingStarted: [
        "Drop or add images.",
        "Choose a quality preset, output format, and max width if needed.",
        "Download everything as a ZIP.",
      ],
      tip: "WebP is great for the web; JPEG is safer for compatibility. This tool shrinks—it won’t enlarge beyond the source.",
    },
    "text-cleaner": {
      title: "Text Cleaner",
      description: "Clean breaks, spaces, and control chars. Save custom rules.",
      detail: [
        "Clean invisible control characters, messy line breaks, and odd spaces that hitch a ride when you paste from spreadsheets, mail, or PDFs. Save replace-rule sets so the same cleanup is one click next time.",
        "Your pasted body isn’t stored—only options and rules—so it works as a prep bench. Aimed at desktop use.",
      ],
      highlights: [
        "Control-char strip, trailing spaces, full-width→half-width, break/space modes",
        "One-tap extras like HTML strip and URL removal",
        "Find/replace rules plus saved rule sets and favorites",
        "Result/diff preview and copy of cleaned text",
      ],
      gettingStarted: [
        "Paste text into the input area.",
        "Toggle cleansing options or special buttons for a first pass.",
        "Add replace rules for the fine details.",
        "Copy the result into your next tool.",
      ],
      tip: "Name and save a rule set for chores you repeat. Keep an original copy before aggressive cleanup.",
    },
    "media-metadata-editor": {
      title: "Media Tags",
      description: "Edit audio/video tags and cover art locally in the browser.",
      detail: [
        "Edit titles, artists, album years, and cover/thumbnails for audio and video in the browser, then download the result back into your library—without uploading files to a server.",
        "Handy for personal media tidy-ups and pre-publish checks. Embedding tags back into the file depends on format—check support before a big batch.",
      ],
      highlights: [
        "Multi-file lists with audio and video modes",
        "Title, artist, year, album, and input history",
        "Replace audio covers; capture video-frame thumbnails",
        "Save changes, then download tagged files",
      ],
      gettingStarted: [
        "Drop audio or video files.",
        "Select a file and edit metadata or artwork.",
        "Save changes.",
        "Download the edited file.",
      ],
      tip: "Embedding focuses on MP3 and some video containers; other types may mainly rename. Large videos can take a while to save.",
    },
    "frame-extractor": {
      title: "Frame Extractor",
      description: "Step a video frame by frame and save stills locally.",
      detail: [
        "Open a video entirely in the browser, step one frame at a time (about 1/30 s), and save the exact moment at native resolution as PNG, JPEG, or WebP. Files never leave your device.",
        "A nearby-frame filmstrip and optional burst ZIP are included. Precise stepping is aimed at desktop use.",
      ],
      highlights: [
        "Drag-and-drop MP4 / WebM / MOV and more",
        "1-frame steps, 0.1 s / 1 s jumps, 0.1×–2× speed",
        "Nearby-frame thumbnails and keyboard shortcuts",
        "Save the current frame, or a numbered burst ZIP",
      ],
      gettingStarted: [
        "Drop a video file to load it.",
        "Pause, then use arrows or buttons to find the frame.",
        "Pick a format and save the current frame.",
        "Optionally mark in/out and export a burst ZIP.",
      ],
      tip: "Match step fps to the source. For 60 fps footage, choose 60 so stepping lands on real frames.",
    },
    "character-relation-editor": {
      title: "Story Map",
      description: "Map a cast with character cards and labeled relationship links.",
      detail: [
        "Place characters as cards and connect them with labeled links to map a novel, script, or TTRPG cast. Seeing who ties to whom on one canvas makes gaps and contradictions easier to spot.",
        "Profiles, line labels, and arrow directions stick around; zoom and view position are remembered for long-lived lore docs. Built for desktop.",
      ],
      highlights: [
        "Character cards with icon, color, stance, and profile fields",
        "Relationship lines (label, solid/dashed, arrow direction)",
        "Zoom, remembered view, grid or free layout",
        "Show up to three chosen fields on each card",
      ],
      gettingStarted: [
        "Add a character card.",
        "Fill name and profile in the detail editor.",
        "Use Link, click another card, and create a relationship.",
        "Tune labels and line styles, then tidy the canvas.",
      ],
      tip: "Double-click relationship text to edit. Export a backup so browser clears don’t wipe a long-built map.",
    },
    "book-visualizer": {
      title: "Quarto",
      description: "Edit the page itself, then share as .mybook.",
      detail: [
        "Quarto lets you edit the page as you see it—body, images, running heads, and page numbers—with type size inferred from paper size and characters/lines. Vertical, horizontal, and photo-book-leaning layouts are supported.",
        "Draft zines or booklets, proof the reading feel fullscreen, then share or back up as a .mybook. Name-swap variables can personalize a copy before reading.",
      ],
      highlights: [
        "WYSIWYG page editing with auto type size from layout settings",
        "Body, text boxes, images, TOC, running heads, folios, and sample books",
        "Name-swap variables filled in before reading",
        "Edit vs fullscreen reading, .mybook export/import, local drafts",
      ],
      gettingStarted: [
        "Start from a blank or sample book, or open a .mybook.",
        "Set layout and paper, then place text and images.",
        "Define name-swap variables if you need them.",
        "Proof fullscreen, then export a .mybook.",
      ],
      tip: "Vertical writing has its own input flow. Large images have a size cap—compress photos before placing them.",
    },
    "palette-collector": {
      title: "Color Palette",
      description: "Eyedrop colors from images. Auto-extract and contrast checks.",
      detail: [
        "Eyedrop or region-auto-extract colors from reference images into a living palette. Check HEX/RGB/HSL, copy CSS variables or JSON, and gauge text/background contrast (WCAG) while you explore directions.",
        "Save named projects with image plus palette for UI, illustration, or slide color work.",
      ],
      highlights: [
        "Click eyedrop with loupe, drag-region auto extract, complementary/analogous suggestions",
        "HEX/RGB/HSL plus CSS variable and JSON copy",
        "WCAG-minded contrast checker",
        "Named project saves (image + palette)",
      ],
      gettingStarted: [
        "Drop or paste an image.",
        "Click colors or auto-extract a region into the palette.",
        "Check contrast and refine swatches.",
        "Copy CSS/JSON or save the set as a project.",
      ],
      tip: "Project saves depend on local storage space. Keep important palettes as CSS/JSON copies too.",
    },
    "lunch-savings": {
      title: "Lunch Savings",
      description: "Tap lunch vs budget and watch savings grow—built for phones.",
      detail: [
        "Log today’s lunch against a budget and watch the gap stack up like a game. Choose steady savings or a countdown-to-zero mode, with periods like this month or until payday.",
        "Not a full household ledger—just the lunch habit, tuned for phones so it’s easy to keep going.",
      ],
      highlights: [
        "Steady-savings and remaining-budget countdown modes",
        "Periods: this month, payday, fixed date, or day count",
        "Numpad entry for today’s amount plus optional notes",
        "Progress and reward counters; works as a standalone PWA",
      ],
      gettingStarted: [
        "Set mode, budget, period, and goal on first launch.",
        "Record today’s lunch amount.",
        "Check savings or remaining budget on the dashboard.",
        "Adjust settings later if needed.",
      ],
      tip: "Currency is a display unit only—no FX conversion. Start with a realistic budget so the habit sticks.",
    },
    "link-stocker": {
      title: "Link Keep",
      description: "Keep “maybe later” URLs as visual cards with OGP thumbs.",
      detail: [
        "Park “read later” or “not ready to file” URLs as preview cards—less formal than bookmarks, more glanceable than a raw list.",
        "Add from a paste field, a desktop bookmarklet, or mobile share. Kept links live on your device as a staging ground for research and ideas.",
      ],
      highlights: [
        "Paste to keep, filter by tags, memo on cards",
        "OGP-powered visual cards",
        "Bookmarklet and share-sheet capture",
        "Colored tags and duplicate URL detection",
      ],
      gettingStarted: [
        "Paste a URL and keep it.",
        "Add tags or a memo if you like.",
        "Set up the bookmarklet or share target on devices you use often.",
        "Filter by tag later and keep only what still matters.",
      ],
      tip: "Preview fetch can fail; the URL is still kept, and you can fix the title yourself.",
    },
    "ultimate-probability-slot": {
      title: "Odds Slot",
      description: "Chase or dodge your own ultra-low-odds jackpot slot.",
      detail: [
        "Build a low-odds slot from reel and symbol counts, then chase a hit—or try to keep missing on purpose. Spin counts and cumulative odds make the streak feel real.",
        "A short break toy between tasks; swap only the jackpot art to change the vibe.",
      ],
      highlights: [
        "HIT (until you win) and AVOID (keep missing) modes",
        "Custom odds from reel/symbol counts; replace the hit symbol",
        "Spin count, cumulative odds, and records",
        "Progress saved on your device",
      ],
      gettingStarted: [
        "Set reel and symbol counts (and hit art if you want).",
        "Choose HIT or AVOID.",
        "Spin and watch progress and records.",
      ],
      tip: "Switching modes resets the spin count. Extreme odds become a patience game.",
    },
    "pixel-drop-puzzle": {
      title: "Pixel Drop",
      description: "Drop a photo into the gap—judged to a fraction of a pixel.",
      detail: [
        "Drop a bar into a photo gap—simple controls, sub-pixel judging. Play with bundled scenes or your own 16:9 crop.",
        "Stages, tolerance, lives, and combos make short sessions surprisingly intense.",
      ],
      highlights: [
        "Bundled or custom 16:9 photos",
        "Stages, tolerance, lives, and combos",
        "ARCHIVE records and progress reset (best scores/images can remain)",
        "On-device image handling and saved progress",
      ],
      gettingStarted: [
        "Read the rules; keep or replace the photo.",
        "Time your DROP into the gap.",
        "Clear within tolerance, or lose a life and drop a stage.",
      ],
      tip: "It looks easy until it isn’t. Start with wider gaps to learn the timing.",
    },
    "robot-freethrow": {
      title: "Projectile Shot",
      description: "Aim with angle, thrust, and spin in a projectile freethrow game.",
      detail: [
        "Aim freethrow-like shots with angle, thrust, and spin. The same thrust flies differently with ball mass, so weight matters. Fill sticky-note parameters, tap the shooter, and watch the arc.",
        "More playground than lab sim: feel the force and path. Controls lean desktop.",
      ],
      highlights: [
        "Projectile freethrow with angle, thrust, and spin (mass counts)",
        "Sticky-note parameters and tap-to-shoot checks",
        "Easy launch in browser or as a PWA",
        "Guidance follows the portal language",
      ],
      gettingStarted: [
        "Fill sticky-note parameters (thrust, angle, and so on).",
        "Tap the on-screen shooter.",
        "Watch the rim result and adjust aim and thrust.",
      ],
      tip: "Keep focus on the game view for input. Miss big first, then walk the arc toward the rim.",
    },
    "crypto-message": {
      title: "Secret Message",
      description: "Passphrase encrypt/decrypt, plus a Caesar decoding challenge.",
      detail: [
        "Encrypt a note with a passphrase so only someone who knows it can decrypt—plus HEX/rune/Morse-styled looks and easy copy/share of the ciphertext.",
        "Not a substitute for serious secure messaging: it’s for playful secret notes and feeling how ciphers work, with a Caesar challenge included.",
      ],
      highlights: [
        "Passphrase encrypt/decrypt in the browser",
        "Visual themes and a decrypt animation",
        "Copy ciphertext and share-ready text",
        "Caesar puzzles with shift control and frequency cues",
      ],
      gettingStarted: [
        "Create a secret: message + passphrase → encrypt → copy/share.",
        "The recipient pastes into Decrypt with the same passphrase.",
        "Or play the Caesar challenge to set or solve a puzzle.",
      ],
      tip: "The passphrase isn’t stored or sent by this app—share it out of band. Use real secure tools for anything truly sensitive.",
    },
    "monster-driver": {
      title: "Monster Driver",
      description: "Stop on red, launch on green. Blinkers, memory, reaction.",
      detail: [
        "Stop on red, launch on green, and match remembered lanes with your blinker in a first-person action mini-game. Reaction and short-term memory share the same beat.",
        "Built for immersive short runs. Prefecture choice tunes how tight the launch window feels.",
      ],
      highlights: [
        "Signal timing plus blinker-memory action",
        "Prefecture as difficulty",
        "Keys on PC, on-screen controls on phones",
        "Session-based play with no long save grind",
      ],
      gettingStarted: [
        "Pick a prefecture (difficulty) and start.",
        "Wait at red, go on green.",
        "Signal toward the remembered lane and accelerate.",
      ],
      tip: "Keyboard input needs focus on the game view. Start with a gentler difficulty while you learn the rhythm.",
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
    pinToHome: "Pin to Home",
    unpinFromHome: "Unpin from Home",
  },
  footer: {
    tagline: "A stationery-styled toolbox built for local-first use",
    navAria: "Site information",
    contact: "Contact",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    environmentLabel: "Environment",
    noticeLabel: "Notes",
    localOnly:
      "🔒 Tool files and inputs are processed and stored in your browser by default; the operator does not collect or keep their contents. We do not use cookies for personal tracking. For improvement only, we measure anonymized page views and tool-usage counts. Some tools may make limited network requests (e.g. public page metadata)—see the Privacy Policy.",
  },
  messages: {
    environment:
      "Tools on this site generally run in your browser—no install required. You can use them on Windows, Mac, smartphones, and more, though some tools are PC-oriented (not mobile-supported). Viewing the site and first-time use need an internet connection; we do not guarantee site-wide offline use.",
    persistence:
      "Saved data lives in your browser’s LocalStorage. Clearing cache or site data, or switching browsers/devices, can erase it. Please export (“Save”) important data regularly and keep a copy yourself.",
    safety:
      "Data you enter or create with these tools is stored on your device (in the browser) by default. The operator does not collect or keep that content on servers. This does not cover device-side risks (loss, malware, shared PCs)—please back up anything important.",
    safetyShort:
      "Data stays in your browser by default; the operator does not collect its contents.",
    privacyBanner:
      "Files and inputs are processed in this browser by default. The operator does not collect or store their contents.",
    privacyBannerShort:
      "On-device by default. We don’t keep your inputs.",
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
      "This tool only runs in the current session and has no settings to save. The operator does not collect or store processed content.",
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
    subjectPrefix: "[Blank Note] Contact",
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
              text: "These Terms of Use (the “Terms”) govern use of the website “Blank Note” (the “Site”) and the tools on it (collectively, the “Service”) provided by Yoshikazu Tsukahara (the “Operator”). By using the Service, you agree to these Terms.",
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
      updatedAt: "August 11, 2026",
      sections: [
        {
          title: "1. Introduction",
          blocks: [
            {
              type: "p",
              text: "Yoshikazu Tsukahara (the “Operator”) respects the privacy of users of the website “Blank Note” (the “Site”). This Policy explains how personal information and user data are handled on the Site.",
            },
          ],
        },
        {
          title: "2. Key point: local processing of tool content",
          blocks: [
            {
              type: "callout",
              parts: [
                {
                  text: "Tools on the Site ",
                },
                {
                  text: "generally run in your device’s browser.",
                  strong: true,
                },
                {
                  text: " Text, images, PDFs, templates, settings, and other content or files you enter, create, or upload are ",
                },
                {
                  text: "not collected or stored by the Operator on servers.",
                  strong: true,
                },
              ],
            },
            {
              type: "p",
              text: "Information that needs to persist is kept in LocalStorage (or similar) on your device by default. Tool content is not under the Operator’s control, and the Operator cannot view, analyze, or share it with third parties.",
            },
            {
              type: "p",
              text: "However, limited network activity may occur for delivery, improvement, or helper features, as described below. We do not guarantee site-wide offline use or zero external communication.",
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
              text: "For site improvement only, we use Vercel Analytics to measure anonymized page views and tool-usage counts. Personally identifiable information and any files or inputs inside tools are not included. We do not use cookies for personal tracking.",
            },
            {
              type: "p",
              text: "Hosting providers, CDNs, and similar infrastructure may also process technical logs from ordinary web traffic under their own policies.",
            },
          ],
        },
        {
          title: "5. Limited network activity and third-party services",
          blocks: [
            {
              type: "p",
              text: "The following activity is not meant to collect tool content, but it may leave the browser or pass through the Site’s servers:",
            },
            {
              type: "ul",
              items: [
                "Link Stocker: to show public page metadata (e.g. OGP), a URL you save may be fetched via the Site’s servers. Your kept list itself is stored in LocalStorage",
                "Some apps or static pages may load fonts from external providers (e.g. Google Fonts)",
                "User-initiated actions: support checkout (e.g. Stripe), social sharing, contact via your email app, and links to external sites",
              ],
            },
            {
              type: "p",
              text: "Individual apps installed as PWAs may work offline within their supported scope; that is not a guarantee for the whole Site.",
            },
          ],
        },
        {
          title: "6. Cookies and similar technologies",
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
          title: "7. Sharing with third parties",
          blocks: [
            {
              type: "p",
              text: "The Operator does not provide, sell, or share user content generated or stored on your device. Except as required by law, the Operator will not improperly disclose information within its control (such as anonymized analytics).",
            },
          ],
        },
        {
          title: "8. External links",
          blocks: [
            {
              type: "p",
              text: "The Site may link to external sites (payments, social networks, references, etc.). Please review each site’s privacy policy. The Operator is not responsible for linked sites’ content or practices.",
            },
          ],
        },
        {
          title: "9. Disclaimer",
          blocks: [
            {
              type: "p",
              text: "Browser changes, device settings, or third-party service outages (hosting, analytics, font delivery, etc.) may cause unexpected data loss or display issues. Please protect your data with your own backups. See also the Terms of Use.",
            },
          ],
        },
        {
          title: "10. Changes to this Policy",
          blocks: [
            {
              type: "p",
              text: "The Operator may revise this Policy as needed. Material changes will be announced on the Site. Continued use after revision constitutes acceptance.",
            },
          ],
        },
        {
          title: "11. Contact",
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
