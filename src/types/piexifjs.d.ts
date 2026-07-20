/** piexifjs は公式型定義がないため最小宣言 */
declare module "piexifjs" {
  const piexif: {
    load: (jpegBinary: string) => ExifObj;
    dump: (exifObj: ExifObj) => string;
    insert: (exifBytes: string, jpegBinary: string) => string;
    remove: (jpegBinary: string) => string;
    ImageIFD: Record<string, number>;
    ExifIFD: Record<string, number>;
    GPSIFD: Record<string, number>;
  };
  export type ExifObj = {
    "0th": Record<number, unknown>;
    Exif: Record<number, unknown>;
    GPS: Record<number, unknown>;
    "1st": Record<number, unknown>;
    thumbnail: string | null;
  };
  export default piexif;
}
