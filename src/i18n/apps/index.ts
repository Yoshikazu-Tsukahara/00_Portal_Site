import type { CharacterRelationDict } from "./characterRelation";
import {
  characterRelationEn,
  characterRelationJa,
} from "./characterRelation";
import type { MailTemplateDict } from "./mailTemplate";
import { mailTemplateEn, mailTemplateJa } from "./mailTemplate";
import type { MediaMetadataDict } from "./mediaMetadata";
import { mediaMetadataEn, mediaMetadataJa } from "./mediaMetadata";
import type {
  FolderGeneratorDict,
  ImageCompressorDict,
  PdfEditorDict,
  TextCleanerDict,
} from "./otherApps";
import {
  folderGeneratorEn,
  folderGeneratorJa,
  imageCompressorEn,
  imageCompressorJa,
  pdfEditorEn,
  pdfEditorJa,
  textCleanerEn,
  textCleanerJa,
} from "./otherApps";

export type AppsDictionary = {
  mailTemplate: MailTemplateDict;
  textCleaner: TextCleanerDict;
  folderGenerator: FolderGeneratorDict;
  imageCompressor: ImageCompressorDict;
  pdfEditor: PdfEditorDict;
  mediaMetadata: MediaMetadataDict;
  characterRelation: CharacterRelationDict;
};

export const appsJa: AppsDictionary = {
  mailTemplate: mailTemplateJa,
  textCleaner: textCleanerJa,
  folderGenerator: folderGeneratorJa,
  imageCompressor: imageCompressorJa,
  pdfEditor: pdfEditorJa,
  mediaMetadata: mediaMetadataJa,
  characterRelation: characterRelationJa,
};

export const appsEn: AppsDictionary = {
  mailTemplate: mailTemplateEn,
  textCleaner: textCleanerEn,
  folderGenerator: folderGeneratorEn,
  imageCompressor: imageCompressorEn,
  pdfEditor: pdfEditorEn,
  mediaMetadata: mediaMetadataEn,
  characterRelation: characterRelationEn,
};
