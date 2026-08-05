import type { PartialDictionary } from "../localeMeta";
import { appsEs } from "./apps/es";

/** Español — UI del portal + apps (legal cae a inglés) */
export const es: PartialDictionary = {
  brand: "My Tool Box",
  common: {
    backToPortal: "← Volver al portal",
    loading: "Cargando…",
    close: "Cerrar",
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    clear: "Borrar",
  },
  header: {
    support: "Apoyar al desarrollador",
    supportShort: "Apoyar",
    supportAria: "Apoyar al desarrollador (abrir pago Stripe)",
    supportTitle: "Abrir página de apoyo",
    langToggleAria: "Cambiar idioma",
    layoutToggle: {
      aria: "Cambiar ancho de pantalla",
      caption: "Width",
      defaultShort: "Normal",
      wideShort: "Ancho",
      fullShort: "Full",
      default: "Mostrar a ancho normal",
      wide: "Mostrar más ancho",
      full: "Mostrar a pantalla completa",
    },
  },
  home: {
    heroTitleLine1: "Una caja de herramientas",
    heroTitleLine2: "para hacer el día un poco más fácil.",
    heroLead1: "Portal con herramientas útiles hechas de forma independiente.",
    heroLead2: "Si algo te interesa, pruébalo sin compromiso.",
  },
  genres: {
    business: {
      name: "Productividad",
      description: "Herramientas prácticas para el trabajo diario",
    },
    creators: {
      name: "Creadores",
      description: "Utilidades para crear y publicar contenido",
    },
    utilities: {
      name: "Utilidades",
      description: "Herramientas generales para tareas rápidas",
    },
    minigames: {
      name: "Minijuegos",
      description: "Pequeños juegos para un descanso entre tareas",
    },
  },
  tools: {
    "invoice-maker": {
      title: "Generador de documentos",
      description: "Facturas, presupuestos, albaranes y recibos en A4. PDF multi-idioma.",
    },
    "mail-template": {
      title: "Plantillas de correo",
      description: "Etiquetas y variables para responder correos más rápido.",
    },
    "folder-generator": {
      title: "Generador de carpetas",
      description: "Crea carpetas en lote con fechas, números y listas.",
    },
    "pdf-editor": {
      title: "Editor PDF simple",
      description: "Combina, reordena y elimina páginas en el navegador.",
    },
    "image-compressor": {
      title: "Compresor de imágenes",
      description: "Redimensiona y comprime por lotes en el navegador.",
    },
    "text-cleaner": {
      title: "Limpieza de texto",
      description: "Limpia saltos, espacios y control. Guarda reglas propias.",
    },
    "media-metadata-editor": {
      title: "Editor de metadatos",
      description: "Edita etiquetas y portadas de audio/vídeo en el navegador.",
    },
    "character-relation-editor": {
      title: "Mapa de personajes",
      description: "Organiza relaciones de historia con tarjetas y enlaces.",
    },
    "book-visualizer": {
      title: "AI Book Studio",
      description: "Edita el layout de página y comparte con .mybook.",
    },
    "palette-collector": {
      title: "Palette Collector",
      description: "Extrae paletas de imágenes, con contraste WCAG.",
    },
    "lunch-savings": {
      title: "Ahorro de almuerzo",
      description: "Registra la diferencia con el presupuesto y ahorra jugando.",
    },
    "link-stocker": {
      title: "Guardar enlaces",
      description: "Guarda URLs “casi marcadores” como tarjetas con OGP.",
    },
    "ultimate-probability-slot": {
      title: "Slot de probabilidad",
      description: "Reta a tu propia máquina de baja probabilidad.",
    },
    "pixel-drop-puzzle": {
      title: "Puzzle de caída pixel",
      description: "Deja caer la foto en la ranura. Precisión subpíxel.",
    },
    "robot-freethrow": {
      title: "Tiro libre proyectil",
      description: "Apunta el aro con ángulo, empuje y giro.",
    },
    "crypto-message": {
      title: "Mensaje secreto",
      description: "Cifra y descifra con una frase. Incluye César.",
    },
    "monster-driver": {
      title: "Monster Driver",
      description: "Para en rojo, arranca en azul. Acción en primera persona.",
    },
  },
  card: {
    open: "Abrir",
    comingSoon: "Próximamente",
    comingSoonHint: "Disponible pronto",
    mobileSupported: "Móvil OK",
    mobileSupportedHint: "Optimizado para móvil",
    pcRecommended: "PC recomendado",
    pcRecommendedHint: "Mejor en ordenador",
  },
  footer: {
    tagline: "Herramientas indie que alivian el día a día",
    navAria: "Información del operador",
    contact: "Contacto",
    terms: "Términos",
    privacy: "Privacidad",
    environmentLabel: "Entorno",
    noticeLabel: "Aviso",
    localOnly:
      "🔒 Este sitio funciona 100% en local y no envía tus archivos ni datos a un servidor. Tampoco usa cookies de seguimiento personal. Solo medimos visitas y usos anonimizados para mejorar el sitio.",
  },
  messages: {
    environment:
      "Todas las herramientas funcionan en el navegador. Sin instalación, en Windows, Mac o móvil.",
    persistence:
      "Los datos se guardan en LocalStorage del navegador. Pueden borrarse al limpiar caché o cambiar de dispositivo. Exporta con regularidad lo importante.",
    safety:
      "Los datos que introduces se guardan solo en tu navegador. Nunca se envían al servidor del operador.",
    safetyShort: "Los datos quedan en el navegador; no se envían al servidor.",
    privacyBanner:
      "Todo se procesa en este navegador. Nada se envía fuera.",
  },
  dataManager: {
    buttonTitle: "Datos (copia y restauración)",
    buttonAria: "Datos (copia y restauración)",
    buttonLabel: "Copia",
    buttonLabelShort: "Datos",
    dialogTitle: "Datos (copia y restauración)",
    close: "Cerrar",
    safetyHeading: "Sobre la seguridad de los datos",
    backupReasonHeading: "Por qué hacer copia",
    export: "📥 Exportar (guardar)",
    import: "📤 Importar (cargar)",
    noData: "Esta herramienta solo actúa en la sesión y no guarda ajustes. Nada se envía fuera.",
    exportOk: "Copia descargada.",
    exportFail: "Error al exportar.",
    importOk: "Datos cargados.",
    importFail: "Error al cargar.",
    importInvalid: "No se pudo aplicar el archivo.",
    importConfirm: "Se sobrescribirán los datos actuales. ¿Continuar?",
  },
  apps: appsEs,
  contact: {
    title: "Contacto",
    lead: "Completa el formulario y envía para abrir tu app de correo. No se envía nada al servidor.",
    mailtoHint: "※ Al enviar se abrirá tu cliente de correo",
    submit: "Abrir correo para enviar",
    messageRequired: "Introduce un mensaje.",
    categoryLabel: "Tipo de consulta",
    categories: {
      general: "Consulta general",
      feature: "Sugerencia de función",
      bug: "Informe de error",
      other: "Otro",
    },
    appLabel: "App relacionada",
    appPlaceholder: "Opcional",
    appNone: "(Ninguna)",
    nameLabel: "Tu nombre",
    namePlaceholder: "Opcional",
    emailLabel: "Email de respuesta",
    emailPlaceholder: "you@example.com",
    emailHint: "Opcional — rellénalo si quieres respuesta",
    messageLabel: "Mensaje",
    messagePlaceholder: "Tu pregunta, sugerencia o detalle del error",
    subjectPrefix: "[My Tool Box] Contacto",
    bodyLabels: {
      category: "Tipo de consulta",
      app: "App relacionada",
      name: "Nombre",
      email: "Email de respuesta",
      message: "Mensaje",
      environment: "Entorno (adjunto automático)",
      notProvided: "(no indicado)",
    },
  },
};
