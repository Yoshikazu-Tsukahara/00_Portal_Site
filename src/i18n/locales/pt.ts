import type { PartialDictionary } from "../localeMeta";
import { appsPt } from "./apps/pt";

/** Português — UI do portal + apps (legal cai para inglês) */
export const pt: PartialDictionary = {
  brand: "My Tool Box",
  common: {
    backToPortal: "← Voltar ao portal",
    loading: "Carregando…",
    close: "Fechar",
    save: "Salvar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Excluir",
    clear: "Limpar",
  },
  header: {
    support: "Apoiar o desenvolvedor",
    supportShort: "Apoiar",
    supportAria: "Apoiar o desenvolvedor (abrir Stripe)",
    supportTitle: "Abrir página de apoio",
    langToggleAria: "Alterar idioma",
    layoutToggle: {
      aria: "Alterar largura da tela",
      caption: "Width",
      defaultShort: "Padrão",
      wideShort: "Largo",
      fullShort: "Full",
      default: "Exibir na largura padrão",
      wide: "Exibir mais largo",
      full: "Exibir em tela cheia",
    },
  },
  home: {
    heroTitleLine1: "Uma caixa de ferramentas",
    heroTitleLine2: "para deixar o dia um pouco mais fácil.",
    heroLead1: "Portal com ferramentas úteis feitas de forma independente.",
    heroLead2: "Achou algo interessante? Experimente à vontade.",
  },
  genres: {
    business: {
      name: "Produtividade",
      description: "Ferramentas práticas para o trabalho do dia a dia",
    },
    creators: {
      name: "Criadores",
      description: "Ferramentas para criar e publicar conteúdo",
    },
    utilities: {
      name: "Utilitários",
      description: "Ferramentas gerais para tarefas rápidas",
    },
    minigames: {
      name: "Minijogos",
      description: "Pequenos jogos para uma pausa entre tarefas",
    },
  },
  tools: {
    "invoice-maker": {
      title: "Gerador de documentos",
      description: "Faturas, orçamentos, entregas e recibos em A4. PDF multilíngue.",
    },
    "mail-template": {
      title: "Modelos de e-mail",
      description: "Tags e variáveis para responder mais rápido.",
    },
    "folder-generator": {
      title: "Gerador de pastas",
      description: "Crie pastas em lote com datas, números e listas.",
    },
    "pdf-editor": {
      title: "Editor PDF simples",
      description: "Mesclar, reordenar e excluir páginas no navegador.",
    },
    "image-compressor": {
      title: "Compressor de imagens",
      description: "Redimensione e comprima em lote no navegador.",
    },
    "text-cleaner": {
      title: "Limpeza de texto",
      description: "Limpe quebras, espaços e caracteres de controle.",
    },
    "media-metadata-editor": {
      title: "Editor de metadados",
      description: "Edite tags e capas de áudio/vídeo no navegador.",
    },
    "character-relation-editor": {
      title: "Mapa de personagens",
      description: "Organize relações da história com cartões e linhas.",
    },
    "book-visualizer": {
      title: "AI Book Studio",
      description: "Edite o layout da página e compartilhe em .mybook.",
    },
    "palette-collector": {
      title: "Palette Collector",
      description: "Extraia paletas de imagens, com verificação de contraste.",
    },
    "lunch-savings": {
      title: "Poupança do almoço",
      description: "Registre a diferença do orçamento e poupe jogando.",
    },
    "link-stocker": {
      title: "Guardar links",
      description: "Guarde URLs “quase favoritos” como cartões com OGP.",
    },
    "ultimate-probability-slot": {
      title: "Slot de probabilidade",
      description: "Desafie sua própria máquina de baixa probabilidade.",
    },
    "pixel-drop-puzzle": {
      title: "Puzzle de queda pixel",
      description: "Solte a foto na fenda. Precisão de subpixel.",
    },
    "robot-freethrow": {
      title: "Lance livre projetil",
      description: "Mire o aro com ângulo, impulso e spin.",
    },
    "crypto-message": {
      title: "Mensagem secreta",
      description: "Cifre com uma frase secreta. Desafio César incluso.",
    },
    "monster-driver": {
      title: "Monster Driver",
      description: "Pare no vermelho, saia no azul. Ação em primeira pessoa.",
    },
  },
  card: {
    open: "Abrir",
    comingSoon: "Em breve",
    comingSoonHint: "Disponível em breve",
    mobileSupported: "Mobile OK",
    mobileSupportedHint: "Otimizado para celular",
    pcRecommended: "PC recomendado",
    pcRecommendedHint: "Melhor usar no computador",
  },
  footer: {
    tagline: "Ferramentas indie que aliviam o dia a dia",
    navAria: "Informações do operador",
    contact: "Contato",
    terms: "Termos",
    privacy: "Privacidade",
    environmentLabel: "Ambiente",
    noticeLabel: "Aviso",
    localOnly:
      "🔒 Este site funciona 100% localmente e não envia arquivos nem dados a um servidor. Sem cookies de rastreamento pessoal. Medimos apenas visitas e usos anonimizados.",
  },
  messages: {
    environment:
      "Todas as ferramentas rodam no navegador. Sem instalação, no Windows, Mac ou celular.",
    persistence:
      "Os dados ficam no LocalStorage. Limpar cache ou trocar de aparelho pode apagá-los. Exporte o importante com frequência.",
    safety:
      "O que você digita fica só no seu navegador e nunca vai para o servidor do operador.",
    safetyShort: "Dados só no navegador; nada é enviado ao servidor.",
    privacyBanner:
      "Tudo é processado neste navegador. Nada é enviado para fora.",
  },
  dataManager: {
    buttonTitle: "Dados (backup e restauração)",
    buttonAria: "Dados (backup e restauração)",
    buttonLabel: "Backup",
    buttonLabelShort: "Dados",
    dialogTitle: "Dados (backup e restauração)",
    close: "Fechar",
    safetyHeading: "Sobre a segurança dos dados",
    backupReasonHeading: "Por que fazer backup",
    export: "📥 Exportar (salvar)",
    import: "📤 Importar (carregar)",
    noData: "Esta ferramenta não guarda configurações. Nada é enviado para fora.",
    exportOk: "Arquivo de backup baixado.",
    exportFail: "Falha ao exportar.",
    importOk: "Dados carregados.",
    importFail: "Falha ao carregar.",
    importInvalid: "Não foi possível aplicar o arquivo.",
    importConfirm: "Os dados atuais serão sobrescritos. Continuar?",
  },
  apps: appsPt,
  contact: {
    title: "Contato",
    lead: "Preencha o formulário e envie para abrir seu app de e-mail. Nada é enviado a um servidor.",
    mailtoHint: "※ Ao enviar, seu cliente de e-mail será aberto",
    submit: "Abrir e-mail para enviar",
    messageRequired: "Digite uma mensagem.",
    categoryLabel: "Tipo de consulta",
    categories: {
      general: "Consulta geral",
      feature: "Sugestão de recurso",
      bug: "Relato de bug",
      other: "Outro",
    },
    appLabel: "App relacionado",
    appPlaceholder: "Opcional",
    appNone: "(Nenhum)",
    nameLabel: "Seu nome",
    namePlaceholder: "Opcional",
    emailLabel: "E-mail para resposta",
    emailPlaceholder: "you@example.com",
    emailHint: "Opcional — preencha se quiser resposta",
    messageLabel: "Mensagem",
    messagePlaceholder: "Sua pergunta, sugestão ou detalhes do bug",
    subjectPrefix: "[My Tool Box] Contato",
    bodyLabels: {
      category: "Tipo de consulta",
      app: "App relacionado",
      name: "Nome",
      email: "E-mail para resposta",
      message: "Mensagem",
      environment: "Ambiente (anexado automaticamente)",
      notProvided: "(não informado)",
    },
  },
};
