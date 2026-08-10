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
      title: "Formulários",
      description: "Faturas, orçamentos, entregas e recibos em A4. PDF multilíngue.",
    },
    "mail-template": {
      title: "Modelos mail",
      description: "Tags e variáveis para responder mais rápido.",
    },
    "folder-generator": {
      title: "Pastas lote",
      description: "Crie pastas em lote com datas, números e listas.",
    },
    "pdf-editor": {
      title: "Editor PDF",
      description: "Mesclar, reordenar e excluir páginas no navegador.",
    },
    "image-compressor": {
      title: "Compr. imagem",
      description: "Redimensione e comprima em lote no navegador.",
    },
    "text-cleaner": {
      title: "Limpeza texto",
      description: "Limpe quebras, espaços e caracteres de controle.",
    },
    "media-metadata-editor": {
      title: "Tags mídia",
      description: "Edite tags e capas de áudio/vídeo no navegador.",
    },
    "character-relation-editor": {
      title: "Mapa personagens",
      description: "Organize relações da história com cartões e linhas.",
    },
    "book-visualizer": {
      title: "Editor página",
      description: "Edite o layout da página e compartilhe em .mybook.",
    },
    "palette-collector": {
      title: "Paleta cores",
      description: "Extraia paletas de imagens, com verificação de contraste.",
    },
    "lunch-savings": {
      title: "Poupança almoço",
      description: "Registre a diferença do orçamento e poupe jogando.",
    },
    "link-stocker": {
      title: "Guardar links",
      description: "Guarde URLs “quase favoritos” como cartões com OGP.",
    },
    "ultimate-probability-slot": {
      title: "Slot odds",
      description: "Desafie sua própria máquina de baixa probabilidade.",
    },
    "pixel-drop-puzzle": {
      title: "Pixel drop",
      description: "Solte a foto na fenda. Precisão de subpixel.",
    },
    "robot-freethrow": {
      title: "Lance projétil",
      description: "Mire o aro com ângulo, velocidade inicial e spin.",
    },
    "crypto-message": {
      title: "Msg secreta",
      description: "Cifre com uma frase secreta. Desafio César incluso.",
    },
    "monster-driver": {
      title: "Monster drive",
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
      "🔒 Arquivos e entradas das ferramentas são processados e salvos no navegador por padrão; o operador não coleta nem guarda o conteúdo. Sem cookies de rastreamento pessoal. Medimos visitas e usos anonimizados. Alguns apps podem fazer pedidos de rede limitados (ver Privacidade).",
  },
  messages: {
    environment:
      "As ferramentas geralmente rodam no navegador, sem instalação. Usáveis no Windows, Mac ou celular; algumas são para PC (sem mobile). Ver o site e o primeiro uso precisam de internet; não garantimos offline em todo o site.",
    persistence:
      "Os dados ficam no LocalStorage. Limpar cache ou trocar de aparelho pode apagá-los. Exporte o importante com frequência.",
    safety:
      "O que você digita fica no seu aparelho (navegador) por padrão. O operador não coleta nem guarda esse conteúdo em servidores. Isso não cobre riscos do aparelho — faça backup do importante.",
    safetyShort: "Dados no navegador por padrão; o operador não coleta o conteúdo.",
    privacyBanner:
      "Arquivos e entradas são processados neste navegador por padrão. O operador não coleta nem guarda o conteúdo.",
    privacyBannerShort:
      "No aparelho por padrão. Não guardamos suas entradas.",
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
    noData: "Esta ferramenta não guarda configurações. O operador não coleta nem guarda o conteúdo processado.",
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
