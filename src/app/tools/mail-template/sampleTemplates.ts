import type { MailTemplate, TagMasterItem, VariableMasterItem } from "./types";
import { createId } from "./types";

function idsByKeys(
  master: VariableMasterItem[],
  keys: string[],
): string[] {
  const set = new Set(keys);
  return master.filter((v) => set.has(v.key)).map((v) => v.id);
}

function tagIdsByNames(
  tags: TagMasterItem[],
  names: string[],
): string[] {
  const set = new Set(names);
  return tags.filter((t) => set.has(t.name)).map((t) => t.id);
}

/** 初期サンプル（変数・タグ ID を参照） */
export function createSampleTemplates(
  master: VariableMasterItem[],
  tags: TagMasterItem[] = [],
): MailTemplate[] {
  const now = Date.now();

  return [
    {
      id: createId("tpl"),
      title: "お問い合わせへの初回返信",
      subject: "【ご連絡】{{company}}様 お問い合わせの件",
      body: `{{name}} 様

お世話になっております。
この度はお問い合わせいただき、誠にありがとうございます。

ご質問の件、担当より改めてご連絡いたします。
恐れ入りますが、今しばらくお待ちくださいませ。

何かご不明点がございましたら、本メールへご返信ください。

よろしくお願いいたします。`,
      enabledVariableIds: idsByKeys(master, ["company", "name"]),
      tagIds: tagIdsByNames(tags, ["サポート"]),
      pinned: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId("tpl"),
      title: "打ち合わせ日程調整",
      subject: "【日程調整】{{company}}様 × {{ourCompany}}",
      body: `{{name}} 様

お世話になっております。{{ourCompany}}の{{sender}}です。

先日はお打ち合わせの機会をいただきありがとうございました。
下記候補日程にてご都合はいかがでしょうか。

・候補①：{{slot1}}
・候補②：{{slot2}}
・候補③：{{slot3}}

ご都合の良い日時をご返信いただけますと幸いです。

何卒よろしくお願いいたします。`,
      enabledVariableIds: idsByKeys(master, [
        "company",
        "ourCompany",
        "name",
        "sender",
        "slot1",
        "slot2",
        "slot3",
      ]),
      tagIds: tagIdsByNames(tags, ["営業", "社内"]),
      pinned: false,
      createdAt: now + 1,
      updatedAt: now + 1,
    },
    {
      id: createId("tpl"),
      title: "見積書送付のご案内",
      subject: "【お見積】{{company}}様 {{project}}のご案内",
      body: `{{name}} 様

お世話になっております。{{ourCompany}}の{{sender}}です。

ご依頼いただきました「{{project}}」の見積書を送付いたします。
内容をご確認のうえ、ご不明点がございましたらお気軽にお申し付けください。

有効期限：{{deadline}}

ご検討のほど、よろしくお願いいたします。`,
      enabledVariableIds: idsByKeys(master, [
        "company",
        "name",
        "ourCompany",
        "sender",
        "project",
        "deadline",
      ]),
      tagIds: tagIdsByNames(tags, ["営業", "重要"]),
      pinned: false,
      createdAt: now + 2,
      updatedAt: now + 2,
    },
    {
      id: createId("tpl"),
      title: "フォローアップ（営業）",
      subject: "【ご確認】{{company}}様 {{product}}のご提案について",
      body: `{{name}} 様

お世話になっております。{{ourCompany}}の{{sender}}です。

先日ご提案いたしました「{{product}}」について、その後ご検討状況はいかがでしょうか。

追加資料やデモのご案内も可能ですので、ご希望がございましたらお知らせください。

お忙しいところ恐れ入りますが、ご確認のほどよろしくお願いいたします。`,
      enabledVariableIds: idsByKeys(master, [
        "company",
        "name",
        "ourCompany",
        "sender",
        "product",
      ]),
      tagIds: tagIdsByNames(tags, ["営業", "フォロー"]),
      pinned: false,
      createdAt: now + 3,
      updatedAt: now + 3,
    },
    {
      id: createId("tpl"),
      title: "納品完了のご連絡",
      subject: "【納品完了】{{company}}様 {{deliverable}}",
      body: `{{name}} 様

お世話になっております。{{ourCompany}}の{{sender}}です。

「{{deliverable}}」の納品が完了いたしましたのでご連絡いたします。

納品内容に問題がございませんでしたら、ご確認の旨ご返信いただけますと幸いです。
不具合や修正のご要望がございましたら、{{supportUntil}}までにお知らせください。

引き続きよろしくお願いいたします。`,
      enabledVariableIds: idsByKeys(master, [
        "company",
        "name",
        "ourCompany",
        "sender",
        "deliverable",
        "supportUntil",
      ]),
      tagIds: tagIdsByNames(tags, ["サポート"]),
      pinned: false,
      createdAt: now + 4,
      updatedAt: now + 4,
    },
  ];
}
