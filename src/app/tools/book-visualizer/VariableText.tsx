import { Fragment } from "react";

import { isVariableToken, VARIABLE_TOKEN_PATTERN } from "./variables";

/**
 * プレーンテキスト中の {{id}} を太字ハイライトして描画する。
 * contentEditable 中は使わず、非編集表示専用。
 */
export default function VariableText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(VARIABLE_TOKEN_PATTERN);
  return (
    <>
      {parts.map((part, index) =>
        isVariableToken(part) ? (
          <strong key={`v-${index}`} className="bv-var-token">
            {part}
          </strong>
        ) : (
          <Fragment key={`t-${index}`}>{part}</Fragment>
        ),
      )}
    </>
  );
}
