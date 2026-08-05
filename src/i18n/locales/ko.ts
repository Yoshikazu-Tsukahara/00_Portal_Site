import type { PartialDictionary } from "../localeMeta";
import { appsKo } from "./apps/ko";

/** 한국어 — 포털 공통 UI ＋ 앱 UI（legal 은 영어 폴백） */
export const ko: PartialDictionary = {
  brand: "My Tool Box",
  common: {
    backToPortal: "← 포털로 돌아가기",
    loading: "불러오는 중…",
    close: "닫기",
    save: "저장",
    cancel: "취소",
    edit: "편집",
    delete: "삭제",
    clear: "지우기",
  },
  header: {
    support: "개발자 응원하기",
    supportShort: "응원",
    supportAria: "개발자 응원하기(Stripe 결제 페이지 열기)",
    supportTitle: "지원 페이지 열기",
    langToggleAria: "표시 언어 전환",
    layoutToggle: {
      aria: "표시 너비 전환",
      caption: "Width",
      defaultShort: "표준",
      wideShort: "넓게",
      fullShort: "전체",
      default: "표준 너비로 표시",
      wide: "넓은 너비로 표시",
      full: "화면 가득 표시",
    },
  },
  home: {
    heroTitleLine1: "매일의 작업을,",
    heroTitleLine2: "조금 더 편하게 만드는 도구함.",
    heroLead1: "개인 개발로 만든 유용한 도구를 모은 포털 사이트입니다.",
    heroLead2: "관심 있는 도구를 찾으면 부담 없이 써 보세요.",
  },
  genres: {
    business: {
      name: "업무 효율",
      description: "실무에 바로 쓰는, 일상을 조금 더 편하게 하는 도구",
    },
    creators: {
      name: "크리에이터 지원",
      description: "창작·발행을 돕는 크리에이터용 도구함",
    },
    utilities: {
      name: "일상 유틸리티",
      description: "작은 일을 빠르게 끝내는 범용 도구",
    },
    minigames: {
      name: "미니게임",
      description: "작업 사이 잠깐의 재미를 위한 미니게임",
    },
  },
  tools: {
    "invoice-maker": {
      title: "문서 메이커",
      description: "청구·견적·납품·영수증을 A4로. 다국어 PDF.",
    },
    "mail-template": {
      title: "메일 템플릿 정리",
      description: "태그 분류와 변수 치환으로 메일 회신을 빠르게.",
    },
    "folder-generator": {
      title: "폴더 일괄 생성",
      description: "이름 규칙으로 날짜·번호·목록을 조합해 일괄 생성.",
    },
    "pdf-editor": {
      title: "간단 PDF 편집",
      description: "브라우저에서 병합·정렬·페이지 삭제까지.",
    },
    "image-compressor": {
      title: "이미지 일괄 압축",
      description: "최대 폭과 화질을 지정해 브라우저에서 일괄 리사이즈·압축.",
    },
    "text-cleaner": {
      title: "텍스트 정리",
      description: "줄바꿈·공백·제어 문자를 한 번에. 사용자 규칙도 저장 가능.",
    },
    "media-metadata-editor": {
      title: "미디어 메타데이터",
      description: "브라우저에서 음악·영상 태그와 커버를 편집.",
    },
    "character-relation-editor": {
      title: "소설 인물 관계도",
      description: "인물 카드와 관계선으로 이야기의 관계를 시각적으로 정리.",
    },
    "book-visualizer": {
      title: "AI Book Studio",
      description: "용지와 조판을 지정해 지면을 직접 편집하고 .mybook으로 공유.",
    },
    "palette-collector": {
      title: "Palette Collector",
      description: "이미지에서 배색 추출. 자동 추출과 대비 검사 지원.",
    },
    "lunch-savings": {
      title: "런치 저금",
      description: "예산과의 차이를 탭으로 기록. 게임처럼 아끼며 저금.",
    },
    "link-stocker": {
      title: "일단 킵",
      description: "북마크까지는 아닌 URL을 OGP 카드로 보관.",
    },
    "ultimate-probability-slot": {
      title: "궁극 확률 슬롯",
      description: "직접 만든 저확률 슬롯으로 ‘당첨까지’ 또는 ‘연속 미스’에 도전.",
    },
    "pixel-drop-puzzle": {
      title: "픽셀 틈새 낙하",
      description: "사진을 틈에 떨어뜨리기. 서브픽셀 정밀 퍼즐.",
    },
    "robot-freethrow": {
      title: "투사 프리스로",
      description: "각도·추력·스핀으로 림을 노리는 투사 운동 미니게임.",
    },
    "crypto-message": {
      title: "비밀 메시지",
      description: "암호로 암호화·복호화. 카이사르 해독 챌린지 포함.",
    },
    "monster-driver": {
      title: "몬스터 드라이버",
      description: "빨강에 서고 파랑에 출발. 깜빡이 기억의 1인칭 액션.",
    },
  },
  card: {
    open: "열기",
    comingSoon: "준비 중",
    comingSoonHint: "곧 공개 예정",
    mobileSupported: "모바일 지원",
    mobileSupportedHint: "모바일에 최적화됨",
    pcRecommended: "PC 권장",
    pcRecommendedHint: "PC에서 사용을 권장",
  },
  footer: {
    tagline: "일상의 번거로움을 덜어 주는 개인 개발 도구 모음",
    navAria: "운영자 정보",
    contact: "문의하기",
    terms: "이용약관",
    privacy: "개인정보 처리방침",
    environmentLabel: "동작 환경",
    noticeLabel: "주의사항",
    localOnly:
      "🔒 이 사이트는 100% 로컬에서 동작하며, 파일이나 입력 데이터를 서버로 보내지 않습니다. 개인 추적 Cookie도 사용하지 않습니다. 사이트 개선을 위해 익명화된 방문·도구 이용 횟수만 집계합니다.",
  },
  messages: {
    environment:
      "모든 도구는 브라우저에서 완료됩니다. 앱 설치 없이 Windows / Mac / 스마트폰 등에서 이용할 수 있습니다.",
    persistence:
      "저장 데이터는 브라우저 LocalStorage(기기 내 임시 영역)에 둡니다. 캐시 삭제나 사이트 데이터 삭제, 다른 브라우저·기기로 바꾸면 사라질 수 있습니다. 중요한 데이터는 정기적으로 「내보내기(저장)」해 두세요.",
    safety:
      "도구에 입력·작성한 데이터는 모두 사용자 PC(브라우저) 안에만 저장되며 운영자 서버로 전송되지 않습니다. 외부 유출 위험이 없습니다.",
    safetyShort: "데이터는 브라우저에만 저장되며 서버로 전송되지 않습니다.",
    privacyBanner:
      "처리는 모두 이 브라우저에서 끝납니다. 파일이나 입력 내용이 외부로 전송되지 않습니다.",
  },
  dataManager: {
    buttonTitle: "데이터 관리(백업·복원)",
    buttonAria: "데이터 관리(백업·복원)",
    buttonLabel: "백업",
    buttonLabelShort: "데이터",
    dialogTitle: "데이터 관리(백업·복원)",
    close: "닫기",
    safetyHeading: "데이터 안전에 대하여",
    backupReasonHeading: "백업을 권장하는 이유",
    export: "📥 데이터 내보내기(저장)",
    import: "📤 데이터 불러오기(로드)",
    noData: "이 도구는 세션 내에서만 동작하며 저장할 설정 데이터가 없습니다. 처리 내용도 외부로 보내지 않습니다.",
    exportOk: "백업 파일을 다운로드했습니다.",
    exportFail: "내보내기에 실패했습니다.",
    importOk: "데이터를 불러왔습니다.",
    importFail: "불러오기에 실패했습니다.",
    importInvalid: "데이터 내용을 반영할 수 없습니다.",
    importConfirm: "현재 데이터가 덮어쓰입니다. 계속할까요?",
  },
  apps: appsKo,
  contact: {
    title: "문의하기",
    lead: "아래 카드를 선택하면 메일 앱이 열립니다. 서버 전송 폼은 없습니다.",
    mailtoHint: "메일 앱이 실행됩니다",
    general: {
      title: "일반 문의",
      description: "사이트 전반에 관한 질문이나 기타 문의.",
      cta: "메일 보내기",
      subject: "【My Tool Box】문의",
    },
    feedback: {
      title: "기능 요청 · 오류 제보",
      description: "새 앱 아이디어나 기존 기능의 오류 제보.",
      cta: "피드백 보내기",
      subject: "【My Tool Box】기능 요청 / 오류 제보",
      body: "【앱 이름】\n\n【요청 또는 오류 내용】\n",
    },
  },
};
