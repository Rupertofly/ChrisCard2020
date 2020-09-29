import Pixel from "./Pixel";

export class Star {
  x: number;
  y: number;
  brighness: number;
  fieldSize: number;
  starIndex: number;
  private pxl: Pixel

  constructor(pxl: Pixel,brightness:Pixel) {
    
  }
}
export class StarField extends Map<>