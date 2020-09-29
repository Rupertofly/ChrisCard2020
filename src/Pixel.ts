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
      .map(([ox, oy], i) => ({ pixel: toI(x + ox, y + oy, this.size), adj: i }))
      .filter((d) => d.pixel !== undefined);
  }
  getUpHillPixel(adjacentPixels: { pixel: Pixel; adj: number }[]) {
    if (adjacentPixels.length < 1) return this;
    const sortedAdj = [...adjacentPixels].sort((a, b) => {
      if (a.pixel.pixelValue === b.pixel.pixelValue) return a.adj - b.adj;

      return b.pixel.pixelValue - a.pixel.pixelValue;
    });
    const hasGreaterNeighbour = sortedAdj.some((n) => n.pixel.pixelValue > this.pixelValue);
    const hasEqualNeighbour = sortedAdj.some((n) => n.pixel.pixelValue >= this.pixelValue);

    const { pixel: best, adj: bestI } = sortedAdj[0];

    if (hasGreaterNeighbour) {
      this.uphillIndex = best.index;

      return this;
    }
    const equals = sortedAdj.filter((n) => n.pixel.pixelValue === this.pixelValue);

    if (hasEqualNeighbour && equals.some(({ adj }) => adj < 4)) {
      const eq = equals.find(({ adj }) => adj < 4)?.pixel;

      if (!eq) {
        this.uphillIndex = -1;

        return this;
      }
      this.uphillIndex = eq.index;

      return this;
    }
    this.uphillIndex = -1;

    return this;
  }
}
export default Pixel;
