import type { PartialDictionary } from "../localeMeta";
import { appsEs } from "./apps/es";

/** Español — UI del portal + apps (legal cae a inglés) */
export const es: PartialDictionary = {
  brand: "Blank Note",
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
      title: "Formularios",
      description: "Facturas, presupuestos, albaranes y recibos en A4. PDF multi-idioma.",
    },
    "mail-template": {
      title: "Plantillas mail",
      description: "Etiquetas y variables para responder correos más rápido.",
    },
    "folder-generator": {
      title: "Carpetas lote",
      description: "Crea carpetas en lote con fechas, números y listas.",
    },
    "pdf-editor": {
      title: "Editor PDF",
      description: "Combina, reordena y elimina páginas en el navegador.",
    },
    "image-compressor": {
      title: "Compr. imagen",
      description: "Redimensiona y comprime por lotes en el navegador.",
    },
    "text-cleaner": {
      title: "Limpieza texto",
      description: "Limpia saltos, espacios y control. Guarda reglas propias.",
    },
    "media-metadata-editor": {
      title: "Etiquetas media",
      description: "Edita etiquetas y portadas de audio/vídeo en el navegador.",
    },
    "character-relation-editor": {
      title: "Mapa personajes",
      description: "Organiza relaciones de historia con tarjetas y enlaces.",
    },
    "book-visualizer": {
      title: "Editor página",
      description: "Edita el layout de página y comparte con .mybook.",
    },
    "palette-collector": {
      title: "Paleta colores",
      description: "Extrae paletas de imágenes, con contraste WCAG.",
    },
    "lunch-savings": {
      title: "Ahorro almuerzo",
      description: "Registra la diferencia con el presupuesto y ahorra jugando.",
    },
    "link-stocker": {
      title: "Guardar enlaces",
      description: "Guarda URLs “casi marcadores” como tarjetas con OGP.",
    },
    "ultimate-probability-slot": {
      title: "Slot odds",
      description: "Reta a tu propia máquina de baja probabilidad.",
    },
    "pixel-drop-puzzle": {
      title: "Pixel drop",
      description: "Deja caer la foto en la ranura. Precisión subpíxel.",
    },
    "robot-freethrow": {
      title: "Tiro proyectil",
      description: "Apunta el aro con ángulo, velocidad inicial y giro.",
    },
    "crypto-message": {
      title: "Msg secreto",
      description: "Cifra y descifra con una frase. Incluye César.",
    },
    "monster-driver": {
      title: "Monster drive",
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
      "🔒 Los archivos y entradas de las herramientas se procesan y guardan en el navegador por defecto; el operador no recoge ni conserva su contenido. Sin cookies de seguimiento personal. Solo medimos visitas y usos anonimizados. Algunas herramientas pueden hacer peticiones de red limitadas (ver Privacidad).",
  },
  messages: {
    environment:
      "Las herramientas suelen funcionar en el navegador, sin instalación. Usables en Windows, Mac o móvil; algunas son para PC (sin móvil). Ver el sitio y el primer uso requieren internet; no garantizamos uso offline de todo el sitio.",
    persistence:
      "Los datos se guardan en LocalStorage del navegador. Pueden borrarse al limpiar caché o cambiar de dispositivo. Exporta con regularidad lo importante.",
    safety:
      "Los datos que introduces se guardan en tu dispositivo (navegador) por defecto. El operador no recoge ni conserva ese contenido en servidores. Eso no cubre riesgos del dispositivo: haz copias de lo importante.",
    safetyShort: "Los datos quedan en el navegador por defecto; el operador no recoge el contenido.",
    privacyBanner:
      "Archivos y entradas se procesan en este navegador por defecto. El operador no recoge ni guarda su contenido.",
    privacyBannerShort:
      "En el dispositivo por defecto. No guardamos tus entradas.",
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
    noData: "Esta herramienta solo actúa en la sesión y no guarda ajustes. El operador no recoge ni guarda el contenido procesado.",
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
    subjectPrefix: "[Blank Note] Contacto",
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
