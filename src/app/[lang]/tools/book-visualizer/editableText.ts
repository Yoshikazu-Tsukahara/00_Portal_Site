// contenteditable の本文読み書き。
// ブラウザが挿入する末尾 <br> や改行ゆれで「入力」と「表示／保存」がずれるのを防ぐ。

/** 比較・保存用に改行・空白をそろえる */
export function normalizeEditableText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ");
}

/** キャレット位置用の単独 <br>（空行としての Enter ではない） */
function isTrailingCaretBr(element: HTMLElement): boolean {
  const last = element.lastChild;
  return last?.nodeName === "BR";
}

/**
 * contenteditable から保存用テキストを取る。
 * - 空欄のときの単独 "\n" は空文字にする
 * - 末尾のキャレット用 <br> 由来の余分な改行だけ取り除く
 *   （Enter で作った空行＝div 区切りは \n として残す）
 */
export function readEditableText(element: HTMLElement): string {
  let text = normalizeEditableText(element.innerText);
  if (text === "\n") return "";
  if (text.endsWith("\n") && !text.endsWith("\n\n") && isTrailingCaretBr(element)) {
    text = text.slice(0, -1);
  }
  return text;
}

/** プレーンテキスト上のキャレット位置（0 始まり） */
export function getPlainCaretOffset(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return readEditableText(element).length;
  }
  if (!element.contains(selection.focusNode)) {
    return readEditableText(element).length;
  }

  const range = selection.getRangeAt(0);
  const prefix = document.createRange();
  prefix.selectNodeContents(element);
  prefix.setEnd(range.endContainer, range.endOffset);

  const holder = document.createElement("div");
  holder.appendChild(prefix.cloneContents());
  // fragment にも同じ正規化を適用
  let text = normalizeEditableText(holder.innerText);
  if (text === "\n") text = "";
  if (text.endsWith("\n") && !text.endsWith("\n\n")) {
    // 断片末尾の br 由来改行はオフセットに含めない
    const last = holder.lastChild;
    if (last?.nodeName === "BR") text = text.slice(0, -1);
  }
  return text.length;
}

/** プレーンテキスト上の位置へキャレットを戻す */
export function setPlainCaretOffset(element: HTMLElement, offset: number): void {
  const selection = window.getSelection();
  if (!selection) return;

  const target = Math.max(0, offset);
  let remaining = target;

  const placeAt = (node: Text, at: number) => {
    const range = document.createRange();
    range.setStart(node, Math.max(0, Math.min(at, node.length)));
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const walk = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      const len = textNode.length;
      if (remaining <= len) {
        placeAt(textNode, remaining);
        return true;
      }
      remaining -= len;
      return false;
    }
    if (node.nodeName === "BR") {
      if (remaining <= 0) {
        const range = document.createRange();
        range.setStartAfter(node);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
      }
      remaining -= 1;
      return false;
    }
    for (const child of Array.from(node.childNodes)) {
      if (walk(child)) return true;
    }
    return false;
  };

  if (!walk(element)) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * 外部の本文を DOM へ反映する。
 * IME 変換中以外は、フォーカス中でもキャレットを維持したまま同期する。
 */
export function syncEditableText(
  element: HTMLElement,
  nextText: string,
): void {
  if (element.dataset.composing === "1") return;

  const normalized = normalizeEditableText(nextText);
  if (readEditableText(element) === normalized) return;

  const hadFocus = document.activeElement === element;
  const caret = hadFocus ? getPlainCaretOffset(element) : null;

  // textContent + pre-wrap で改行を一意に表現（br / div 混在を避ける）
  element.textContent = normalized;

  if (hadFocus && caret !== null) {
    setPlainCaretOffset(element, Math.min(caret, normalized.length));
  }
}
