import type { PartialDictionary } from "../localeMeta";
import { appsPt } from "./apps/pt";

/** Português — UI do portal + apps (legal cai para inglês) */
export const pt: PartialDictionary = {
  brand: "Blank Note",
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
      portraitShort: "Retrato",
      defaultShort: "Padrão",
      wideShort: "Largo",
      fullShort: "Full",
      portrait: "Retrato típico (largura de celular)",
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
      title: "Docs",
      description: "Faturas, orçamentos, entregas e recibos em A4. PDF multilíngue.",
    },
    "mail-template": {
      title: "Mail",
      description: "Tags e variáveis para responder mais rápido.",
    },
    "folder-generator": {
      title: "Pastas",
      description: "Crie pastas em lote com datas, números e listas.",
    },
    "pdf-editor": {
      title: "PDF",
      description: "Mesclar, reordenar e excluir páginas no navegador.",
    },
    "image-compressor": {
      title: "Imagens",
      description: "Redimensione e comprima em lote no navegador.",
    },
    "text-cleaner": {
      title: "Texto",
      description: "Limpe quebras, espaços e caracteres de controle.",
    },
    "media-metadata-editor": {
      title: "Metadados",
      description: "Edite tags e capas de áudio/vídeo no navegador.",
    },
    "character-relation-editor": {
      title: "Relações",
      description: "Organize relações da história com cartões e linhas.",
    },
    "book-visualizer": {
      title: "Quarto",
      description: "Edite o layout da página e compartilhe em .mybook.",
    },
    "palette-collector": {
      title: "Paleta",
      description: "Extraia paletas de imagens, com verificação de contraste.",
    },
    "lunch-savings": {
      title: "Almoço",
      description: "Registre a diferença do orçamento e poupe jogando.",
    },
    "link-stocker": {
      title: "Links",
      description: "Guarde URLs “quase favoritos” como cartões com OGP.",
    },
    "ultimate-probability-slot": {
      title: "Slot",
      description: "Desafie sua própria máquina de baixa probabilidade.",
    },
    "pixel-drop-puzzle": {
      title: "Pixel",
      description: "Solte a foto na fenda. Precisão de subpixel.",
    },
    "robot-freethrow": {
      title: "Lance",
      description: "Mire o aro com ângulo, velocidade inicial e spin.",
    },
    "crypto-message": {
      title: "Segredo",
      description: "Cifre com uma frase secreta. Desafio César incluso.",
    },
    "monster-driver": {
      title: "Monster",
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
    privacyBannerShort:
      "Tudo roda neste navegador. Nada é enviado para fora.",
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
    subjectPrefix: "[Blank Note] Contato",
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
