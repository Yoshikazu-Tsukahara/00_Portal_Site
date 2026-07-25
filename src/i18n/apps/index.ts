import type { CharacterRelationDict } from "./characterRelation";
import {
  characterRelationEn,
  characterRelationJa,
} from "./characterRelation";
import type { FolderGeneratorDict } from "./folderGenerator";
import {
  folderGeneratorEn,
  folderGeneratorJa,
} from "./folderGenerator";
import type { ImageCompressorDict } from "./imageCompressor";
import {
  imageCompressorEn,
  imageCompressorJa,
} from "./imageCompressor";
import type { LinkStockerDict } from "./linkStocker";
import { linkStockerEn, linkStockerJa } from "./linkStocker";
import type { LunchSavingsDict } from "./lunchSavings";
import { lunchSavingsEn, lunchSavingsJa } from "./lunchSavings";
import type { MailTemplateDict } from "./mailTemplate";
import { mailTemplateEn, mailTemplateJa } from "./mailTemplate";
import type { MediaMetadataDict } from "./mediaMetadata";
import { mediaMetadataEn, mediaMetadataJa } from "./mediaMetadata";
import type { PdfEditorDict } from "./pdfEditor";
import { pdfEditorEn, pdfEditorJa } from "./pdfEditor";
import type { PixelDropPuzzleDict } from "./pixelDropPuzzle";
import { pixelDropPuzzleEn, pixelDropPuzzleJa } from "./pixelDropPuzzle";
import type { TextCleanerDict } from "./otherApps";
import {
  textCleanerEn,
  textCleanerJa,
} from "./otherApps";
import type { UltimateProbabilitySlotDict } from "./ultimateProbabilitySlot";
import {
  ultimateProbabilitySlotEn,
  ultimateProbabilitySlotJa,
} from "./ultimateProbabilitySlot";

export type AppsDictionary = {
  mailTemplate: MailTemplateDict;
  textCleaner: TextCleanerDict;
  folderGenerator: FolderGeneratorDict;
  imageCompressor: ImageCompressorDict;
  pdfEditor: PdfEditorDict;
  mediaMetadata: MediaMetadataDict;
  characterRelation: CharacterRelationDict;
  lunchSavings: LunchSavingsDict;
  linkStocker: LinkStockerDict;
  ultimateProbabilitySlot: UltimateProbabilitySlotDict;
  pixelDropPuzzle: PixelDropPuzzleDict;
};

export const appsJa: AppsDictionary = {
  mailTemplate: mailTemplateJa,
  textCleaner: textCleanerJa,
  folderGenerator: folderGeneratorJa,
  imageCompressor: imageCompressorJa,
  pdfEditor: pdfEditorJa,
  mediaMetadata: mediaMetadataJa,
  characterRelation: characterRelationJa,
  lunchSavings: lunchSavingsJa,
  linkStocker: linkStockerJa,
  ultimateProbabilitySlot: ultimateProbabilitySlotJa,
  pixelDropPuzzle: pixelDropPuzzleJa,
};

export const appsEn: AppsDictionary = {
  mailTemplate: mailTemplateEn,
  textCleaner: textCleanerEn,
  folderGenerator: folderGeneratorEn,
  imageCompressor: imageCompressorEn,
  pdfEditor: pdfEditorEn,
  mediaMetadata: mediaMetadataEn,
  characterRelation: characterRelationEn,
  lunchSavings: lunchSavingsEn,
  linkStocker: linkStockerEn,
  ultimateProbabilitySlot: ultimateProbabilitySlotEn,
  pixelDropPuzzle: pixelDropPuzzleEn,
};
