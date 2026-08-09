/**
 * 初回ユーザー向けの固定サンプル相関図。
 * ID は sample- 接頭辞で識別し、ワンクリックで丸ごと消せる。
 */

import type { Locale } from "@/i18n";
import type { Character, DiagramData, Relation } from "./types";

/** サンプルキャラ／関係の ID 接頭辞 */
export const SAMPLE_ID_PREFIX = "sample-";

type SampleLocale = "ja" | "en";

function sampleLocale(locale: Locale): SampleLocale {
  return locale === "ja" ? "ja" : "en";
}

/** 現在のデータがサンプル由来かどうか（ID で判定） */
export function isSampleDiagram(data: DiagramData): boolean {
  if (data.characters.length === 0) return false;
  return data.characters.every((c) => c.id.startsWith(SAMPLE_ID_PREFIX));
}

function ch(
  id: string,
  partial: Omit<Character, "id" | "avatarDataUrl">,
): Character {
  return {
    id: `${SAMPLE_ID_PREFIX}${id}`,
    avatarDataUrl: "",
    ...partial,
  };
}

function rel(
  id: string,
  partial: Omit<Relation, "id">,
): Relation {
  return {
    id: `${SAMPLE_ID_PREFIX}${id}`,
    ...partial,
  };
}

/** 架空ライトノベル風のデモ相関図を生成 */
export function createSampleDiagram(locale: Locale): DiagramData {
  const lang = sampleLocale(locale);
  const ids = {
    aoi: `${SAMPLE_ID_PREFIX}ch-aoi`,
    tsukuyo: `${SAMPLE_ID_PREFIX}ch-tsukuyo`,
    retsu: `${SAMPLE_ID_PREFIX}ch-retsu`,
    shiromine: `${SAMPLE_ID_PREFIX}ch-shiromine`,
    kageshu: `${SAMPLE_ID_PREFIX}ch-kageshu`,
  };

  if (lang === "ja") {
    return {
      characters: [
        ch("ch-aoi", {
          name: "蒼",
          avatarPreset: "boy",
          accent: "sky",
          x: 260,
          y: 280,
          details: {
            note: "寡黙な剣士／物語の主人公",
            nickname: "蒼き影",
            age: "17",
            gender: "男",
            appearance: "黒髪・青い瞳。学校の制服に帯刀",
            goal: "失踪した姉の行方を追う",
            secret: "実は影衆の血を引いている",
            relationMemo: "月夜とは幼馴染。烈とは剣術部でライバル",
            backstory: "港町で育ったが、姉の失踪をきっかけに学園都市へ。",
          },
          cardVisibleKeys: ["note", "nickname", "age"],
        }),
        ch("ch-tsukuyo", {
          name: "月夜",
          avatarPreset: "girl",
          accent: "violet",
          x: 620,
          y: 180,
          details: {
            note: "図書委員／主人公の幼馴染",
            nickname: "夜の灯",
            age: "17",
            gender: "女",
            appearance: "銀髪に紫のリボン。常に古書を抱えている",
            goal: "禁書庫の真実を解き明かしたい",
            secret: "影衆に狙われる『鍵』を所持している",
            relationMemo: "蒼を支えつつ、危険は隠そうとしている",
            backstory: "旧家の末裔。幼少期から蒼と隣家同士だった。",
          },
          cardVisibleKeys: ["note", "nickname"],
        }),
        ch("ch-retsu", {
          name: "烈",
          avatarPreset: "man",
          accent: "rose",
          x: 180,
          y: 500,
          details: {
            note: "剣術部のエース／主人公のライバル",
            nickname: "紅蓮",
            age: "18",
            gender: "男",
            appearance: "赤みがかった髪。常に勝負を挑む眼差し",
            goal: "最強の剣士として認められたい",
            secret: "影衆から情報を求められている",
            relationMemo: "蒼には素直になれない。影衆との距離が曖昧",
            backstory: "武術一筋の家柄。負けず嫌いで口は悪いが根は真面目。",
          },
          cardVisibleKeys: ["note", "age"],
        }),
        ch("ch-shiromine", {
          name: "白峰",
          avatarPreset: "woman",
          accent: "amber",
          x: 480,
          y: 60,
          details: {
            note: "歴史学の講師／蒼の師匠",
            nickname: "静かな雷",
            age: "不詳",
            gender: "女",
            appearance: "白衣に眼鏡。穏やかだが鋭い観察眼",
            goal: "生徒たちを影衆の災いから守る",
            secret: "かつては影衆を追う側にいた",
            relationMemo: "蒼に剣と調査の基礎を教える",
            backstory: "表向きは温厚な講師。裏では古い組織を知る数少ない人物。",
          },
          cardVisibleKeys: ["note", "nickname"],
        }),
        ch("ch-kageshu", {
          name: "影衆",
          avatarPreset: "org",
          accent: "zinc",
          x: 900,
          y: 360,
          details: {
            note: "秘密結社／物語の脅威",
            nickname: "",
            age: "",
            gender: "",
            appearance: "黒衣と仮面。顔を見せない",
            goal: "『鍵』を回収し、古の契約を復活させる",
            secret: "幹部の正体は学園関係者に紛れている",
            relationMemo: "月夜を狙い、烈に接触している",
            backstory: "数百年続く影の組織。表社会には存在しないことになっている。",
          },
          cardVisibleKeys: ["note"],
        }),
      ],
      relations: [
        rel("rel-aoi-tsukuyo", {
          fromId: ids.aoi,
          toId: ids.tsukuyo,
          label: "幼馴染",
          strokeStyle: "solid",
          arrowHead: "none",
        }),
        rel("rel-aoi-retsu", {
          fromId: ids.aoi,
          toId: ids.retsu,
          label: "ライバル",
          strokeStyle: "solid",
          arrowHead: "both",
        }),
        rel("rel-shiromine-aoi", {
          fromId: ids.shiromine,
          toId: ids.aoi,
          label: "師弟",
          strokeStyle: "solid",
          arrowHead: "end",
        }),
        rel("rel-kageshu-tsukuyo", {
          fromId: ids.kageshu,
          toId: ids.tsukuyo,
          label: "狙う",
          strokeStyle: "dashed",
          arrowHead: "end",
        }),
        rel("rel-retsu-kageshu", {
          fromId: ids.retsu,
          toId: ids.kageshu,
          label: "内通？",
          strokeStyle: "dotted",
          arrowHead: "none",
        }),
      ],
    };
  }

  return {
    characters: [
      ch("ch-aoi", {
        name: "Aoi",
        avatarPreset: "boy",
        accent: "sky",
        x: 260,
        y: 280,
        details: {
          note: "Quiet swordsman / protagonist",
          nickname: "Azure Shadow",
          age: "17",
          gender: "Male",
          appearance: "Black hair, blue eyes; wears a blade with the school uniform",
          goal: "Find his missing sister",
          secret: "He carries Shadow Guild blood",
          relationMemo: "Childhood friends with Tsukuyo; rivals Retsu in fencing",
          backstory: "Raised in a port town; moved to the academy city after his sister vanished.",
        },
        cardVisibleKeys: ["note", "nickname", "age"],
      }),
      ch("ch-tsukuyo", {
        name: "Tsukuyo",
        avatarPreset: "girl",
        accent: "violet",
        x: 620,
        y: 180,
        details: {
          note: "Library aide / childhood friend",
          nickname: "Night Lamp",
          age: "17",
          gender: "Female",
          appearance: "Silver hair with a violet ribbon; always holding old books",
          goal: "Uncover the truth of the forbidden archive",
          secret: "Holds a Key the Shadow Guild wants",
          relationMemo: "Supports Aoi while hiding how much danger she is in",
          backstory: "Heir of an old house; lived next door to Aoi as a child.",
        },
        cardVisibleKeys: ["note", "nickname"],
      }),
      ch("ch-retsu", {
        name: "Retsu",
        avatarPreset: "man",
        accent: "rose",
        x: 180,
        y: 500,
        details: {
          note: "Fencing ace / rival",
          nickname: "Crimson Blaze",
          age: "18",
          gender: "Male",
          appearance: "Reddish hair; always looking for a rematch",
          goal: "Be recognized as the strongest swordsman",
          secret: "The Shadow Guild is pressuring him for information",
          relationMemo: "Can't be honest with Aoi; ties to the Guild are unclear",
          backstory: "From a martial family. Blunt and competitive, but earnest.",
        },
        cardVisibleKeys: ["note", "age"],
      }),
      ch("ch-shiromine", {
        name: "Shiromine",
        avatarPreset: "woman",
        accent: "amber",
        x: 480,
        y: 60,
        details: {
          note: "History lecturer / Aoi's mentor",
          nickname: "Quiet Thunder",
          age: "Unknown",
          gender: "Female",
          appearance: "White coat and glasses; calm but sharp-eyed",
          goal: "Protect students from the Shadow Guild",
          secret: "Once hunted the Guild herself",
          relationMemo: "Teaches Aoi swordcraft and investigation basics",
          backstory: "A gentle lecturer on the surface; one of the few who know the old order.",
        },
        cardVisibleKeys: ["note", "nickname"],
      }),
      ch("ch-kageshu", {
        name: "Shadow Guild",
        avatarPreset: "org",
        accent: "zinc",
        x: 900,
        y: 360,
        details: {
          note: "Secret society / main threat",
          nickname: "",
          age: "",
          gender: "",
          appearance: "Black robes and masks; faces unseen",
          goal: "Recover the Key and revive an ancient pact",
          secret: "Leaders hide among academy staff",
          relationMemo: "Hunting Tsukuyo; making contact with Retsu",
          backstory: "A centuries-old shadow order. Officially, it does not exist.",
        },
        cardVisibleKeys: ["note"],
      }),
    ],
    relations: [
      rel("rel-aoi-tsukuyo", {
        fromId: ids.aoi,
        toId: ids.tsukuyo,
        label: "Childhood friends",
        strokeStyle: "solid",
        arrowHead: "none",
      }),
      rel("rel-aoi-retsu", {
        fromId: ids.aoi,
        toId: ids.retsu,
        label: "Rivals",
        strokeStyle: "solid",
        arrowHead: "both",
      }),
      rel("rel-shiromine-aoi", {
        fromId: ids.shiromine,
        toId: ids.aoi,
        label: "Mentor",
        strokeStyle: "solid",
        arrowHead: "end",
      }),
      rel("rel-kageshu-tsukuyo", {
        fromId: ids.kageshu,
        toId: ids.tsukuyo,
        label: "Hunting",
        strokeStyle: "dashed",
        arrowHead: "end",
      }),
      rel("rel-retsu-kageshu", {
        fromId: ids.retsu,
        toId: ids.kageshu,
        label: "Secret ties?",
        strokeStyle: "dotted",
        arrowHead: "none",
      }),
    ],
  };
}
