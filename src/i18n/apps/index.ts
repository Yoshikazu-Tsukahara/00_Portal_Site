import type { BookVisualizerDict } from "./bookVisualizer";
import { bookVisualizerEn, bookVisualizerJa } from "./bookVisualizer";
import type { CharacterRelationDict } from "./characterRelation";
import {
  characterRelationEn,
  characterRelationJa,
} from "./characterRelation";
import type { CryptoMessageDict } from "./cryptoMessage";
import { cryptoMessageEn, cryptoMessageJa } from "./cryptoMessage";
import type { ExcelMergerDict } from "./excelMerger";
import { excelMergerEn, excelMergerJa } from "./excelMerger";
import type { FolderGeneratorDict } from "./folderGenerator";
import {
  folderGeneratorEn,
  folderGeneratorJa,
} from "./folderGenerator";
import type { FrameExtractorDict } from "./frameExtractor";
import { frameExtractorEn, frameExtractorJa } from "./frameExtractor";
import type { ImageCompressorDict } from "./imageCompressor";
import {
  imageCompressorEn,
  imageCompressorJa,
} from "./imageCompressor";
import type { InvoiceMakerDict } from "./invoiceMaker";
import { invoiceMakerEn, invoiceMakerJa } from "./invoiceMaker";
import type { LinkStockerDict } from "./linkStocker";
import { linkStockerEn, linkStockerJa } from "./linkStocker";
import type { LunchSavingsDict } from "./lunchSavings";
import { lunchSavingsEn, lunchSavingsJa } from "./lunchSavings";
import type { MailTemplateDict } from "./mailTemplate";
import { mailTemplateEn, mailTemplateJa } from "./mailTemplate";
import type { MediaMetadataDict } from "./mediaMetadata";
import { mediaMetadataEn, mediaMetadataJa } from "./mediaMetadata";
import type { PaletteCollectorDict } from "./paletteCollector";
import { paletteCollectorEn, paletteCollectorJa } from "./paletteCollector";
import type { PdfEditorDict } from "./pdfEditor";
import { pdfEditorEn, pdfEditorJa } from "./pdfEditor";
import type { PixelDropPuzzleDict } from "./pixelDropPuzzle";
import { pixelDropPuzzleEn, pixelDropPuzzleJa } from "./pixelDropPuzzle";
import type { RobotFreethrowDict } from "./robotFreethrow";
import { robotFreethrowEn, robotFreethrowJa } from "./robotFreethrow";
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
import type { UrlCleanerDict } from "./urlCleaner";
import { urlCleanerEn, urlCleanerJa } from "./urlCleaner";

export type AppsDictionary = {
  mailTemplate: MailTemplateDict;
  textCleaner: TextCleanerDict;
  folderGenerator: FolderGeneratorDict;
  excelMerger: ExcelMergerDict;
  imageCompressor: ImageCompressorDict;
  invoiceMaker: InvoiceMakerDict;
  pdfEditor: PdfEditorDict;
  mediaMetadata: MediaMetadataDict;
  frameExtractor: FrameExtractorDict;
  characterRelation: CharacterRelationDict;
  bookVisualizer: BookVisualizerDict;
  paletteCollector: PaletteCollectorDict;
  lunchSavings: LunchSavingsDict;
  linkStocker: LinkStockerDict;
  ultimateProbabilitySlot: UltimateProbabilitySlotDict;
  pixelDropPuzzle: PixelDropPuzzleDict;
  cryptoMessage: CryptoMessageDict;
  robotFreethrow: RobotFreethrowDict;
  urlCleaner: UrlCleanerDict;
};

export const appsJa: AppsDictionary = {
  mailTemplate: mailTemplateJa,
  textCleaner: textCleanerJa,
  folderGenerator: folderGeneratorJa,
  excelMerger: excelMergerJa,
  imageCompressor: imageCompressorJa,
  invoiceMaker: invoiceMakerJa,
  pdfEditor: pdfEditorJa,
  mediaMetadata: mediaMetadataJa,
  frameExtractor: frameExtractorJa,
  characterRelation: characterRelationJa,
  bookVisualizer: bookVisualizerJa,
  paletteCollector: paletteCollectorJa,
  lunchSavings: lunchSavingsJa,
  linkStocker: linkStockerJa,
  ultimateProbabilitySlot: ultimateProbabilitySlotJa,
  pixelDropPuzzle: pixelDropPuzzleJa,
  cryptoMessage: cryptoMessageJa,
  robotFreethrow: robotFreethrowJa,
  urlCleaner: urlCleanerJa,
};

export const appsEn: AppsDictionary = {
  mailTemplate: mailTemplateEn,
  textCleaner: textCleanerEn,
  folderGenerator: folderGeneratorEn,
  excelMerger: excelMergerEn,
  imageCompressor: imageCompressorEn,
  invoiceMaker: invoiceMakerEn,
  pdfEditor: pdfEditorEn,
  mediaMetadata: mediaMetadataEn,
  frameExtractor: frameExtractorEn,
  characterRelation: characterRelationEn,
  bookVisualizer: bookVisualizerEn,
  paletteCollector: paletteCollectorEn,
  lunchSavings: lunchSavingsEn,
  linkStocker: linkStockerEn,
  ultimateProbabilitySlot: ultimateProbabilitySlotEn,
  pixelDropPuzzle: pixelDropPuzzleEn,
  cryptoMessage: cryptoMessageEn,
  robotFreethrow: robotFreethrowEn,
  urlCleaner: urlCleanerEn,
};
