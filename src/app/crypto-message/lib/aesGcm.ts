// Web Crypto API（AES-GCM）を用いた本格的な暗号化・復号ロジック。
// サーバーには一切送信せず、すべてブラウザ内の SubtleCrypto で完結する。
//
// バイナリ構造（全体を1つの Uint8Array にまとめて相手に渡す）：
//   [ salt(16byte) | iv(12byte) | 暗号文本体（可変長・認証タグ込み） ]
//
// 合言葉（パスワード）はそのまま鍵にはせず、PBKDF2 で毎回ソルト付きの
// 鍵に変換してから AES-GCM で使う（レインボーテーブル対策）。

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 150_000;

/** 復号に失敗したときに投げる専用エラー（合言葉違い／データ破損の両方をまとめて扱う） */
export class DecryptionFailedError extends Error {
  constructor() {
    super("合言葉が違うか、暗号文が壊れています。");
    this.name = "DecryptionFailedError";
  }
}

function getSubtle(): SubtleCrypto {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("このブラウザは Web Crypto API に対応していません。");
  }
  return window.crypto.subtle;
}

/** 合言葉（文字列）から、ソルト付きで AES-GCM 用の鍵を導出する */
async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const subtle = getSubtle();
  const passwordBytes = new TextEncoder().encode(password);
  const baseKey = await subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** 平文＋合言葉 → 暗号化済みバイト列（salt + iv + 暗号文） */
export async function encryptMessage(
  plaintext: string,
  password: string,
): Promise<Uint8Array> {
  const subtle = getSubtle();
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);
  const plainBytes = new TextEncoder().encode(plaintext);

  const cipherBuffer = await subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    plainBytes as unknown as BufferSource,
  );

  const cipherBytes = new Uint8Array(cipherBuffer);
  const combined = new Uint8Array(
    SALT_LENGTH + IV_LENGTH + cipherBytes.length,
  );
  combined.set(salt, 0);
  combined.set(iv, SALT_LENGTH);
  combined.set(cipherBytes, SALT_LENGTH + IV_LENGTH);
  return combined;
}

/** 暗号化済みバイト列＋合言葉 → 平文（失敗時は DecryptionFailedError） */
export async function decryptMessage(
  combined: Uint8Array,
  password: string,
): Promise<string> {
  if (combined.length < SALT_LENGTH + IV_LENGTH + 1) {
    throw new DecryptionFailedError();
  }
  const subtle = getSubtle();
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const cipherBytes = combined.slice(SALT_LENGTH + IV_LENGTH);

  try {
    const key = await deriveKey(password, salt);
    const plainBuffer = await subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      key,
      cipherBytes as unknown as BufferSource,
    );
    return new TextDecoder().decode(plainBuffer);
  } catch {
    // AES-GCM の認証タグ検証エラーは、合言葉間違い・改ざん・破損のいずれか
    // 区別できないため、まとめて「復号失敗」として扱う。
    throw new DecryptionFailedError();
  }
}
