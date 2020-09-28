import { thresholdScott } from 'd3';

export function toI(x: number, y: number, size: [number, number]) {
  if (x > size[0] || x < 0 || y > size[1] || y < 0) return undefined;
  const ny = (size[1] + y) % size[1];
  const nx = (size[0] + x) % size[0];

  return ny * size[0] + nx;
}
export class Pixel {
  pixelValue: number;
  index: number;
  uphillIndex = -1;
  realValue = 0;
  size: [number, number];

  constructor(i: number, value: number, imgSize: [number, number]) {
    this.pixelValue = value;
    this.index = i;
    this.size = imgSize;
  }
  get isHill() {
    return this.uphillIndex < 0;
  }
  get x(): number {
    return this.index % this.size[0];
  }
  get y(): number {
    return Math.floor(this.index / this.size[0]);
  }
  get nbs() {
    const { x, y } = this;

    return [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ]
      .map(([ox, oy]) => toI(x + ox, y + oy, this.size))
      .filter((d) => d !== undefined);
  }
  getUpHillPixel(adjacentPixels: Pixel[]) {
    if (adjacentPixels.length < 1) return this;
    const sortedAdj = adjacentPixels.sort((a, b) => {
      if (a.pixelValue === b.pixelValue) return a.index - b.index;

      return b.pixelValue - a.pixelValue;
    });

    if (this.pixelValue < 10) {
      this.uphillIndex = -1;

      return this;
    }
    if (sortedAdj[0].pixelValue > this.pixelValue && sortedAdj[0].pixelValue > 10)
      this.uphillIndex = sortedAdj[0].index;
    else if (sortedAdj[0].index < this.index && sortedAdj[0].pixelValue > 10)
      this.uphillIndex = sortedAdj[0].index;
    else this.uphillIndex = -1;

    return this;
  }
}
export default Pixel;
