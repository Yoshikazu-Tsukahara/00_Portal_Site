/**
 * サイト全体共通の運営者情報フッター。
 * 連絡先・外部リンクは下の定数だけ書き換えれば反映される。
 */

/** note プロフィールなど（未設定時は "#" のまま） */
const NOTE_URL = "#";

/** お問い合わせ用メール（後から実アドレスに差し替え） */
const CONTACT_EMAIL = "contact@example.com";

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-zinc-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:px-8 sm:py-12">
        {/* コンセプト */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium tracking-tight text-zinc-800">
            My Tool Box
          </p>
          <p className="text-sm leading-relaxed text-zinc-500">
            日々の面倒をラクにする個人開発ツール群
          </p>
        </div>

        {/* リンク・連絡先 */}
        <nav
          aria-label="運営者情報"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
        >
          <a
            href={NOTE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 transition-colors hover:text-zinc-900"
          >
            note
          </a>
          <span aria-hidden className="hidden h-3 w-px bg-zinc-200 sm:block" />
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-zinc-600 transition-colors hover:text-zinc-900"
          >
            {CONTACT_EMAIL}
          </a>
        </nav>

        {/* ローカル処理の安心メッセージ */}
        <p className="rounded-md border border-zinc-200/80 bg-zinc-100/60 px-3.5 py-3 text-xs leading-relaxed text-zinc-500 sm:text-sm">
          🔒
          すべてのデータはあなたのブラウザ内（ローカル）でのみ処理・保存され、サーバーへ送信されることは一切ありません。
        </p>

        {/* コピーライト */}
        <p className="border-t border-zinc-200/80 pt-6 text-xs text-zinc-400">
          © 2026 Yoshikazu Tsukahara — All rights reserved.
        </p>
      </div>
    </footer>
  );
}
