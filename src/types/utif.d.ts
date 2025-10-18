declare module 'utif' {
  interface UTIFImage {
    width: number;
    height: number;
    data: ArrayBuffer;
  }

  interface UTIF {
    decode(buffer: ArrayBuffer): UTIFImage[];
    decodeImage(buffer: ArrayBuffer, image: UTIFImage): void;
    toRGBA8(image: UTIFImage): Uint8Array;
  }

  const UTIF: UTIF;
  export default UTIF;
}