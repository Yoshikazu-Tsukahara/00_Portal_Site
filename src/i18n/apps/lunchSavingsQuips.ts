import type {
  ProgressQuipTier,
  SavingsQuipsDict,
  TodayQuipTier,
} from "@/app/[lang]/lunch-savings/savingsQuips";

export type LunchSavingsQuips = SavingsQuipsDict;

const progressJa: Record<ProgressQuipTier, string[]> = {
  negative: [
    "資本主義の立派な養分として機能していますね。",
    "貯金というより、経済循環への献金ですね。",
    "数字が赤いのは、情熱の色…ではなく赤字です。",
    "目標は遠く、ランチ代は近い。現実は容赦ない。",
  ],
  p01_20: [
    "まだ誤差の範囲です。3日後には飽きている確率が70%あります。",
    "スタート地点で息切れしていませんか？",
    "このペースだと、目標は来世で会いましょう。",
    "微々たる進捗。でも記録しただけ偉い、たぶん。",
  ],
  p21_40: [
    "意外と続いていますね。過去の散財への当てつけですか？",
    "20%超え。自己改善アプリを信じるのはまだ早いです。",
    "続いているのは習慣か、ただの偶然か。後でわかります。",
    "少しずつ増えています。散財の記憶も少しずつ消えていきます。",
  ],
  p41_60: [
    "折り返し地点。そろそろ『自分へのご褒美』で台無しにする頃合いです。",
    "折り返し。ここから先は、誘惑の密度が上がります。",
    "半分。残り半分は、あなたの我慢と運のせい合わせです。",
    "中間地点。達成の匂いと、崩壊の匂いが同時にします。",
  ],
  p61_80: [
    "ここまで来ると、普段どれだけ無駄遣いしていたかが恐ろしいですね。",
    "60%超え。過去の自分に説教したくなってきませんか？",
    "あと少し。だからこそ、油断は禁物という古い格言があります。",
    "かなり順調。順調すぎて、不審に感じる人もいるでしょう。",
  ],
  p81_99: [
    "達成目前。フラグを立てないよう、息を潜めて生きましょう。",
    "あと一歩。転ぶのもこの際、慎重に。",
    "ゴールが見えた瞬間、人は油断する生き物です。",
    "99%の壁。ラスボスはいつも最後の100円です。",
  ],
  p100plus: [
    "見事達成。さあ、このお金でまた別の不要なものを買う旅に出ましょう。",
    "目標達成。次の目標も、同じように遠くに置いておきましょう。",
    "おめでとう。さあ、達成感を消費して元の生活に戻る時間です。",
    "クリア。続編は、また別の衝動買いから始まります。",
  ],
};

const todayJa: Record<TodayQuipTier, string[]> = {
  overLarge: [
    "富の再分配にご協力いただき、社会が感謝しています。",
    "今日のランチ、景気を刺激しすぎでは？",
    "予算を超えました。明日の自分に、静かな恨みが溜まります。",
    "大赤字。でもお腹は満たされた。トレードオフというやつです。",
  ],
  overSmall: [
    "「今日だけは特別」、今月で何回目ですか？",
    "少しだけオーバー。正義の味方『少しだけ』がまた現れました。",
    "予算+α。αの部分が、積み上がると恐ろしいです。",
    "今日だけ、という言葉の在庫、まだありますね。",
  ],
  exact: [
    "貯金ゼロ。でも数学的な美しさだけは評価します。",
    "差額ゼロ。完璧な均衡。貯金はゼロですが。",
    "ピッタリ使い切り。芸術点は高い、貯金点はゼロ。",
    "予算と一致。美しい。意味はないけど美しい。",
  ],
  saveSmall: [
    "チリも積もれば山となりますが、今のところまだチリです。",
    "少し浮きました。山になるまで、あと相当数のランチが必要です。",
    "小さな勝利。小さすぎて、写真に撮る気も起きない程度。",
    "微増。コーヒー1口分くらい？ まあ、ゼロよりマシ。",
  ],
  saveLarge: [
    "もしかして昼食抜きました？健康の前借りは非推奨です。",
    "大幅に浮きました。胃袋と財布、どちらを犠牲にしたのか。",
    "大勝利。ただし、ランチ抜きの可能性を否定できません。",
    "予算の半分以上残し。英雄か、ただの我慢か。",
  ],
};

const progressEn: Record<ProgressQuipTier, string[]> = {
  negative: [
    "You are functioning perfectly as fuel for capitalism.",
    "This isn't savings—it's a donation to the economy.",
    "Red numbers aren't passion. They're just red.",
    "The goal is far. Lunch prices are near. Reality is cruel.",
  ],
  p01_20: [
    "Still within the margin of error. 70% chance you quit in three days.",
    "Did you start sprinting at the starting line again?",
    "At this pace, you'll meet your goal in another lifetime.",
    "Tiny progress. But hey, you logged it. That counts. Probably.",
  ],
  p21_40: [
    "Still going? Is this revenge against your past spending?",
    "Past 20%. Too early to trust the self-improvement app.",
    "Habit or coincidence? We'll find out later.",
    "Slowly climbing. Slowly forgetting how much you used to waste.",
  ],
  p41_60: [
    "Halfway there. Perfect time to ruin it with a 'treat yourself' moment.",
    "Midpoint. From here, temptation gets denser.",
    "50% done. The other half is willpower and luck.",
    "Middle of the road. Smells like success—and collapse.",
  ],
  p61_80: [
    "At this point, your old spending habits look terrifying.",
    "Past 60%. Feel like lecturing your past self?",
    "Almost there— which is exactly when people get careless.",
    "Suspiciously good. Some people find that unsettling.",
  ],
  p81_99: [
    "Almost there. Don't jinx it. Breathe quietly.",
    "One step left. Tripping is optional but popular.",
    "Humans get careless the moment they see the finish line.",
    "The 99% wall. The final boss is always the last coin.",
  ],
  p100plus: [
    "Goal reached. Time to spend it on something else you don't need.",
    "Congratulations. Place the next goal equally far away.",
    "Cleared. Now spend the glow and return to normal life.",
    "Sequel starts with another impulse purchase.",
  ],
};

const todayEn: Record<TodayQuipTier, string[]> = {
  overLarge: [
    "Thank you for your generous contribution to wealth redistribution.",
    "Did today's lunch stimulate the economy a bit too hard?",
    "Over budget. Tomorrow-you is quietly filing a complaint.",
    "Big loss. But you're full. Trade-offs, as they say.",
  ],
  overSmall: [
    "Just this once— how many times this month?",
    "Slightly over. Our old friend 'just a little' strikes again.",
    "Budget plus alpha. Alpha adds up faster than you'd think.",
    "Still plenty of 'today only' left in stock, I see.",
  ],
  exact: [
    "Math is beautiful. Your savings are zero.",
    "Perfect equilibrium. Zero saved, maximum symmetry.",
    "Exact spend. High art score. Zero savings score.",
    "Budget matched. Beautiful. Meaningless, but beautiful.",
  ],
  saveSmall: [
    "Penny by penny—but right now it's still just pennies.",
    "A small win. Many lunches away from a mountain.",
    "Tiny victory. Too small to photograph.",
    "A micro gain. Maybe one sip of coffee. Better than zero.",
  ],
  saveLarge: [
    "Skipped lunch? Borrowing from your health is not recommended.",
    "Big save. Which did you sacrifice—stomach or wallet?",
    "Huge win. Can't rule out skipping lunch though.",
    "Half the budget left. Hero, or just hungry?",
  ],
};

export const lunchSavingsQuipsJa: LunchSavingsQuips = {
  progress: progressJa,
  today: todayJa,
};

export const lunchSavingsQuipsEn: LunchSavingsQuips = {
  progress: progressEn,
  today: todayEn,
};
