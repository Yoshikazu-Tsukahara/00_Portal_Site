// Home 画面のオンボーディング用サンプル本
// 外部通信なし。画像は SVG の data URL で埋め込む
//
// 現行エディタの前提に合わせる:
// - 本文は body ストリーム（h1/h2/p + 手動ページ区切り）
// - 表紙・扉・目次・裏表紙は pages
// - 柱「章」・目次ノンブルがページ分割に追従する分量にする

import type { BookFontId } from "./fonts";
import {
  createFreeTextBlock,
  createId,
  createImageBlock,
  createPage,
  createPageBreak,
  createTextBlock,
  defaultCountInTotalPageTypes,
  defaultFolioOnPageTypes,
  defaultHeaderOnPageTypes,
  fullBleedFrame,
  normalizeBook,
  type Block,
  type BodyItem,
  type BookData,
  type BookPage,
  type PageType,
  type TextBlock,
  type TextLevel,
} from "./types";

export type SampleId = "novel" | "western";

export const SAMPLE_IDS: readonly SampleId[] = ["novel", "western"];

/** プレースホルダー画像（単色グラデ＋ラベルの SVG） */
function placeholderImage(
  label: string,
  from: string,
  to: string,
  width = 640,
  height = 640,
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="52%" fill="rgba(255,255,255,0.9)" font-family="Georgia, 'Times New Roman', serif" font-size="34" text-anchor="middle" dominant-baseline="middle">${label}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function page(pageType: PageType, ...blocks: Block[]): BookPage {
  return { ...createPage(blocks, pageType), id: createId("pg") };
}

function imageFullBleed(dataUrl: string): Block {
  return {
    ...createImageBlock(dataUrl),
    frame: fullBleedFrame(),
  };
}

/** 自由テキスト（配置・サイズ・書体付き） */
function freeText(
  text: string,
  frame: { x: number; y: number; w: number; h: number },
  fontScale: number,
  writingMode: "horizontal" | "vertical",
  options?: { zIndex?: number; fontFamily?: BookFontId },
) {
  const zIndex = options?.zIndex ?? 2;
  const fontFamily = options?.fontFamily;
  const base = fontFamily
    ? createFreeTextBlock(text, zIndex, writingMode, fontFamily)
    : createFreeTextBlock(text, zIndex, writingMode);
  return {
    ...base,
    frame,
    fontScale,
  };
}

function heading(level: Extract<TextLevel, "h1" | "h2">, text: string): TextBlock {
  return createTextBlock(level, text);
}

function para(...parts: string[]): TextBlock {
  return createTextBlock("p", parts.join("\n\n"));
}

function breakPage(): BodyItem {
  return createPageBreak();
}

function joinJa(...parts: string[]): string {
  return parts.join("");
}

function joinEn(...parts: string[]): string {
  return parts.join("\n\n");
}

/**
 * サンプル1：日本語小説（文庫・縦書き）
 * 柱＝章、目次＝章＋節、章末に手動ページ区切り。
 */
function sampleNovel(): BookData {
  const ch1s1 = joinJa(
    "吾輩は猫である。名前はまだ無い。",
    "どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕まえて煮て食うという話である。しかしその当時は何という考もなかったから別段恐しいとも思わなかった。ただ彼の掌に載せられてスーと持ち上げられた時、何だかフワフワした感じがあったばかりである。",
    "掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう。この時妙なものだと思った感じが今でも残っている。第一毛をもって装飾されべきはずの顔がつるつるしてまるで薬缶だ。その後猫にもだいぶ逢ったがこんな片輪には一度も出会わした事がない。のみならず顔の真中があまりに突起している。こんな所へ臭いを嗅ぎに行きゃあ腹がへるだけだと吾輩は思った。",
    "それからというものは、なるべく人間に近寄らぬよう用心した。それでも空腹には勝てぬ。ある日の事である。吾輩は飯を食うべき家を捜して歩いていた。するとどこからか美味しそうな匂いがしてくる。鼻を鳴らしてその方角へ進むと、大きな門の傍に大きな穴が開いていた。吾輩はそこからそっと中を覗いてみた。",
  );

  const ch1s2 = joinJa(
    "中は広かった。庭には木が植わっていて、その木の根方に日向ぼっこの出来る場所があった。吾輩はここを自分の住居にしようと決心した。ところがこの家の主人はなかなかの変わりものであった。職業は教師だそうだが、学校へ行くよりも書斎に閉じ込もっている日の方が多い。筆を持っては何か書き散らし、時々大きな声で朗読する。吾輩はその声を聞きながら、縁側で尻尾を丸めて昼寝をするのが日課になった。",
    "主人のほかに、この家には奥と子供と下女がいた。子供は吾輩を抱き上げてフワフワさせるのが好きで、下女は食事の余りを必ず皿に残してくれた。魚の頭やら芋の皮やら、猫の口にはなかなかの御馳走である。吾輩はようやく、名前がなくとも生きていけるという安心を得た。",
    "ただ一つ困ったのは、主人の友人どもである。寒月とか迷亭とか、妙な名の連中がやって来ては、吾輩の事を話題にして笑う。笑うのは勝手だが、そのたびに昼寝を邪魔されるのは迷惑千万だ。吾輩はそっと縁の下へ潜り、人間の議論が終わるのを待つことにした。",
  );

  const ch2s1 = joinJa(
    "吾輩がこの家へ住み込んでから、やがて季節が二つほど巡った。春の日向は柔らかく、夏の縁側は長い。秋になると落ち葉が庭を埋め、冬は炬燵の傍が一番の上席となる。人間は暦で季節を数えるが、猫はお腹と毛並みで季節を知る。",
    "ある晴れた午後、吾輩は屋根へ上がってみた。町が一望のもとに見える。電線を伝う雀、遠くの寺の瓦、湯気を上げる銭湯の煙突。人間の世界は騒がしいが、高い所から見ると案外小さなものである。吾輩はそこで久しぶりに大きな欠伸をした。",
    "そのときふと、自分に名前がないことを思い出した。近所の黒は黒と呼ばれ、三毛は三毛と呼ばれる。吾輩だけが、呼ばれずに生きている。不便であると同時に、誰の所有物でもないという自由がある。その両方が、縁側の日溜りと同じくらい本物であった。",
  );

  const ch2s2 = joinJa(
    "主人は相変わらず書斎に籠もっている。机の上には原稿用紙が積み上がり、時々「ふん」とか「ふむ」とか呟く。吾輩には何を書いているのか分からないが、筆の音が規則正しい日は、家全体が静かに整っている気がする。",
    "逆に来客の日は大変だ。茶菓子が出て、笑い声が続き、吾輩の通り道に足が伸びる。あるときは迷亭先生に尻尾を踏まれた。吾輩は抗議の意味を込めて一声鳴いたが、相手は「おもしろい猫だ」と笑っただけであった。理解されない悲しみというものを、吾輩はそのとき知った。",
    "それでも夜になると、障子に映る灯が恋しい。外は暗く、風が冷たい。名前のない猫にも、帰る場所はある。吾輩はまた玄関の引き戸を潜り、いつもの座布団の角へ身を沈めた。",
  );

  const ch3s1 = joinJa(
    "雨の日は思索に向く。縁の下は湿っているが、音が遠い。雨垂れのリズムに合わせ、吾輩は人間という奇妙な種族について考えた。彼らは言葉を持ち、約束を作り、その約束で自分を縛る。猫は約束をしない。その代わり、空腹と好奇心だけは正直である。",
    "書生の話——猫を煮て食う——は、いまだに真偽不明である。しかし怖いというより滑稽に聞こえるようになった。恐れるより観察する方が、吾輩の性分に合っている。観察すれば、人間もまた一種の動物に過ぎないことが分かる。ただ毛の生える場所が違うだけだ。",
    "雨が止むと、庭に虹色の水溜りができた。吾輩はその縁を歩き、自分の姿を覗き込んだ。名前はないが、顔はある。顔があれば、世界に向き合える。それで十分なのだと、吾輩は思った。",
  );

  const ch3s2 = joinJa(
    "夜更けに主人が書斎から出てきた。眼鏡を上げ、吾輩を見て言った。「お前は一体何者だ」。答えられるはずもない。吾輩はただ瞬きをした。主人はしばらく黙ったあと、「まあいい」と独り言を残して奥へ消えた。",
    "何者でもない、というのは悪いことだろうか。名前を付けられれば便利だろうが、付けられた瞬間に何かが終わってしまう気もする。吾輩は座布団の上で身を丸め、明日の日向のことを考えた。名前より先に、暖かさが必要なのである。",
    "こうして吾輩の日記——もし日記と呼べるなら——は続いていく。書かれない頁の方が多い。それでも、縁側と雨と筆の音があれば、物語は足りている。読者よ、もし貴方が人間なら、どうか尻尾を踏まないでいただきたい。それが吾輩からの、唯一のお願いである。",
  );

  const ch4 = joinJa(
    "結びに代えて、もう一度だけ書いておく。吾輩は猫である。名前はまだ無い。しかし住む家があり、聞く雨があり、笑う人間がいる。それで世界は、じゅうぶんに重い。",
    "もし将来だれかが吾輩に名を付けるとしても、縁の下の思索まで奪うことはできまい。名前は呼び声に過ぎず、生きている感触は、もっと手前にあるのだから。",
  );

  return {
    title: "吾輩は猫である",
    author: "夏目漱石",
    layout: "japanese",
    format: {
      paperSize: "bunko",
      charsPerLine: 36,
      linesPerPage: 15,
      columns: 1,
      marginTop: 42,
      marginRight: 38,
      marginBottom: 42,
      marginLeft: 38,
      headerMode: "chapter",
      headerAlign: "center",
      headerOnPageTypes: defaultHeaderOnPageTypes(),
      folioOnPageTypes: defaultFolioOnPageTypes(),
      countInTotalPageTypes: defaultCountInTotalPageTypes(),
      headerSpreadPlacement: "both",
      folioAlign: "center",
      tocDepth: "section",
      tocColumns: 1,
      fontFamilyH1: "shippori-mincho",
      fontFamilyH2: "shippori-mincho",
      fontFamilyP: "shippori-mincho",
    },
    body: [
      heading("h1", "第一章　名前はまだ無い"),
      heading("h2", "一　生い立ち"),
      para(ch1s1),
      heading("h2", "二　この家の人々"),
      para(ch1s2),
      breakPage(),
      heading("h1", "第二章　人間というもの"),
      heading("h2", "一　屋根の上から"),
      para(ch2s1),
      heading("h2", "二　書斎と来客"),
      para(ch2s2),
      breakPage(),
      heading("h1", "第三章　雨の縁の下"),
      heading("h2", "一　思索"),
      para(ch3s1),
      heading("h2", "二　何者でもない"),
      para(ch3s2),
      breakPage(),
      heading("h1", "終章　名前より手前のもの"),
      para(ch4),
    ],
    bodyOverlays: [],
    variables: [],
    pages: [
      page(
        "cover",
        imageFullBleed(
          placeholderImage("吾輩", "#2f2924", "#8a7360", 360, 512),
        ),
        freeText(
          "吾輩は猫である",
          { x: 0.12, y: 0.26, w: 0.2, h: 0.52 },
          0.055,
          "vertical",
          { fontFamily: "shippori-mincho" },
        ),
        freeText(
          "夏目漱石",
          { x: 0.38, y: 0.45, w: 0.12, h: 0.25 },
          0.032,
          "vertical",
          { fontFamily: "shippori-mincho" },
        ),
      ),
      page(
        "titlePage",
        freeText(
          "吾輩は猫である",
          { x: 0.34, y: 0.18, w: 0.22, h: 0.55 },
          0.06,
          "vertical",
          { fontFamily: "shippori-mincho" },
        ),
        freeText(
          "夏目漱石",
          { x: 0.58, y: 0.4, w: 0.12, h: 0.28 },
          0.03,
          "vertical",
          { fontFamily: "shippori-mincho" },
        ),
        freeText(
          "文庫・縦書きサンプル",
          { x: 0.72, y: 0.52, w: 0.1, h: 0.28 },
          0.02,
          "vertical",
          { fontFamily: "shippori-mincho" },
        ),
      ),
      page("toc"),
      page(
        "backCover",
        imageFullBleed(
          placeholderImage("猫", "#1f1b18", "#5c4e42", 360, 512),
        ),
        freeText(
          "名前はまだ無い——それでも吾輩は、ここにいる。",
          { x: 0.28, y: 0.28, w: 0.3, h: 0.42 },
          0.028,
          "vertical",
          { fontFamily: "shippori-mincho" },
        ),
      ),
    ],
  };
}

/**
 * サンプル2：英語トレード判（横書き）
 * 章ごとに手動区切り。目次ノンブルと running chapter header の確認用。
 */
function sampleWestern(): BookData {
  const c1a = joinEn(
    "There was a library at the end of the street that nobody seemed to notice until they needed it. Its windows were narrow, its door was painted the color of wet stone, and its sign hung slightly crooked, as if it had been thinking about falling for years and never quite decided.",
    "On the morning {{name1}} first stepped inside, rain was tapping the glass with the patience of an old friend. The air smelled of paper and dust and something faintly sweet—like tea left too long in a porcelain cup. A clock on the far wall had stopped at a quarter past three, and somehow that felt more honest than any running second hand.",
    "{{name2}} looked up from a ledger and nodded once, the way people nod when they already know your name. “You’re late,” she said, though {{name1}} had never been there before. {{name1}} almost apologized. Instead {{name1}} wiped rain from the sleeves and asked, without meaning to sound dramatic, whether the quiet was available for borrowing.",
  );

  const c1b = joinEn(
    "The shelves were taller than the stories they held. Between them, light fell in thin columns, and every footstep sounded like a whispered promise not to wake the books. I walked until the street noise thinned to a rumor.",
    "I found a volume with no title on the spine. Inside, the first page read only: Begin where you are. The second page was blank—not empty, but open, as if it expected handwriting rather than print. I closed it gently, afraid that eagerness might crease the invitation.",
    "Outside, the rain continued. Inside, the quiet rearranged itself around me, and for the first time that week I felt as if a sentence had finally found its period. The clerk stamped nothing. She only returned to her ledger, which I now suspected held more than names.",
  );

  const c2a = joinEn(
    "The clerk kept a ledger of borrowed hours. Not books—hours. People signed for silence the way others sign for novels. Some returned early, flushed with unfinished thoughts. Some never returned at all, leaving only a pencil mark in the margin of the day.",
    "“You may sit,” she said, and pointed to a chair that faced a window with no view worth mentioning. That was the point. The window taught you to look inward until your own noise became readable.",
    "I opened my notebook and wrote the first line I had been avoiding for months. It was ordinary. It was enough. Around me, strangers turned pages as if turning were itself a kind of prayer.",
  );

  const c2b = joinEn(
    "By afternoon the rain had softened into mist. A child entered, chose a picture book without looking at the cover, and read as if the pictures were speaking first. An old man traced the grain of a table with one finger, counting years he did not say aloud.",
    "I asked the clerk what happened to hours that were never returned. She considered the question the way a librarian considers a rare edition—carefully, and without hurry. “They become the building,” she said. “Haven’t you noticed how the walls hold still?”",
    "When I left, the crooked sign seemed straighter. Or perhaps I had learned how to stand at an angle that made the world look honest. Either way, I promised myself a second visit before courage cooled.",
  );

  const c3a = joinEn(
    "I came back the next week, and the week after that. The library never asked for proof that I belonged. It only asked that I listen. Listening, I discovered, was harder than reading and kinder than writing.",
    "Somewhere between the third visit and the tenth, the blank page in the untitled volume gained a sentence in a hand that looked like mine—and also did not. Begin where you are, it still said. Beneath it, newly: Stay until the quiet answers.",
    "I stayed. The answer did not arrive as thunder. It arrived as the soft permission to continue a paragraph I had abandoned in another season of my life.",
  );

  const c3b = joinEn(
    "On my last recorded afternoon—though I did not know it was last—the clerk closed the ledger and walked me to the door. “Return dates are a courtesy,” she said. “Some stories keep you longer than ink allows.”",
    "I stepped into weather that had forgotten how to rain. The street looked ordinary again, which is how miracles prefer to travel. Behind me, the sign hung crooked, faithfully unfinished.",
    "If you find that library, do not straighten the sign. Borrow an hour. Begin where you are. And if the quiet answers, answer back—softly, so the books can keep sleeping.",
  );

  const coda = joinEn(
    "Author’s note: This sample is fiction for layout practice in Quarto. Placeholders like {{name1}} are replaced when a reader opens the book—pagination runs after substitution so line breaks stay accurate.",
  );

  return {
    title: "Notes from a Quiet Library",
    author: "A. Reader",
    layout: "western",
    format: {
      paperSize: "trade",
      charsPerLine: 42,
      linesPerPage: 24,
      columns: 1,
      marginTop: 48,
      marginRight: 44,
      marginBottom: 48,
      marginLeft: 44,
      headerMode: "chapter",
      headerAlign: "center",
      headerOnPageTypes: defaultHeaderOnPageTypes(),
      folioOnPageTypes: defaultFolioOnPageTypes(),
      countInTotalPageTypes: defaultCountInTotalPageTypes(),
      headerSpreadPlacement: "both",
      folioAlign: "center",
      tocDepth: "section",
      tocColumns: 1,
      fontFamilyH1: "playfair-display",
      fontFamilyH2: "eb-garamond",
      fontFamilyP: "eb-garamond",
    },
    body: [
      heading("h1", "Chapter I · Arrival"),
      heading("h2", "The Door That Opened Inward"),
      para(c1a),
      heading("h2", "Shelves Like Weather"),
      para(c1b),
      breakPage(),
      heading("h1", "Chapter II · Borrowed Hours"),
      heading("h2", "A Ledger of Small Absences"),
      para(c2a),
      heading("h2", "The Hour That Stayed"),
      para(c2b),
      breakPage(),
      heading("h1", "Chapter III · Return Date Unknown"),
      heading("h2", "The Quiet Answers"),
      para(c3a),
      heading("h2", "Crooked Sign, Honest Street"),
      para(c3b),
      breakPage(),
      heading("h1", "Coda"),
      para(coda),
    ],
    bodyOverlays: [],
    variables: [
      {
        id: "name1",
        label: "Reader’s name",
        defaultValue: "Alex",
      },
      {
        id: "name2",
        label: "The clerk",
        defaultValue: "The clerk",
      },
    ],
    pages: [
      page(
        "cover",
        imageFullBleed(
          placeholderImage("QUIET", "#1f2937", "#6b7280", 480, 720),
        ),
        freeText(
          "Notes from a Quiet Library",
          { x: 0.1, y: 0.34, w: 0.8, h: 0.2 },
          0.045,
          "horizontal",
          { fontFamily: "playfair-display" },
        ),
        freeText(
          "A. Reader",
          { x: 0.1, y: 0.58, w: 0.8, h: 0.08 },
          0.028,
          "horizontal",
          { fontFamily: "eb-garamond" },
        ),
      ),
      page(
        "titlePage",
        freeText(
          "Notes from a Quiet Library",
          { x: 0.12, y: 0.3, w: 0.76, h: 0.18 },
          0.042,
          "horizontal",
          { fontFamily: "playfair-display" },
        ),
        freeText(
          "A. Reader",
          { x: 0.12, y: 0.52, w: 0.76, h: 0.08 },
          0.026,
          "horizontal",
          { fontFamily: "eb-garamond" },
        ),
        freeText(
          "A trade-paperback layout sample",
          { x: 0.12, y: 0.68, w: 0.76, h: 0.06 },
          0.02,
          "horizontal",
          { fontFamily: "eb-garamond" },
        ),
      ),
      page("toc"),
      page(
        "backCover",
        imageFullBleed(
          placeholderImage("END", "#111827", "#4b5563", 480, 720),
        ),
        freeText(
          "A short novel about rooms that keep time better than clocks.",
          { x: 0.12, y: 0.4, w: 0.76, h: 0.2 },
          0.028,
          "horizontal",
          { fontFamily: "eb-garamond" },
        ),
      ),
    ],
  };
}

/** サンプル本を複製して返す（ID が毎回新しくなる） */
export function createSampleBook(id: SampleId): BookData {
  switch (id) {
    case "novel":
      return normalizeBook(sampleNovel());
    case "western":
      return normalizeBook(sampleWestern());
    default:
      return normalizeBook(sampleNovel());
  }
}
