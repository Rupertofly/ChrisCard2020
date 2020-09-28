import cvs from 'canvas';
import PNG from 'pngjs';
import fs from 'fs/promises';

const chunk = <T>(arr: T[], chunkSize = 1, cache: T[][] = []) => {
  const tmp = [...arr];

  if (chunkSize <= 0) return cache;
  while (tmp.length) cache.push(tmp.splice(0, chunkSize));

  return cache;
};

const toXY = (wid: number, hei: number) => (i: number) =>
  [i % wid, Math.floor(i / wid)] as [number, number];
const tla = async () => {
  const rawFileData = PNG.PNG.sync.read(await fs.readFile('./nightSkyProcessed.png'));

  console.log(`file loaded`);
  const [fWID, fHEI] = [rawFileData.width, rawFileData.height];
  const xy = toXY(fWID, fHEI);
  const toI = (x: number, y: number) => ((fWID + x) % fWID) + ((fHEI + y) % fHEI) * fWID;

  class Pixel {
    pixelValue: number;
    index: number;
    x: number;
    y: number;
    uphill = -1;
    realValue = 0;

    constructor(i: number, value: number) {
      this.pixelValue = value;
      this.index = i;
      const [x, y] = xy(i);

      this.x = x;
      this.y = y;
    }
    get isHill() {
      return this.uphill < 0;
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
      ].map(([ox, oy]) => toI(x + ox, y + oy));
    }
  }
  const pixelData = chunk(Array.from(rawFileData.data), 4).map((d, i) => [i, d[0]]);

  console.log(`file Processed to pixels`);
  const stPixels = new Map<number, Pixel>();

  pixelData.forEach((d, i) => {
    if (d[1] > 1) stPixels.set(i, new Pixel(i, d[1]));
  });

  stPixels.forEach((d) => {
    const validNeighbours = d.nbs.map((ni) => stPixels.get(ni)!).filter((nb) => nb !== undefined)!;

    if (validNeighbours.length < 1) return;
    const largerNeighbours = validNeighbours.filter((n) => n.pixelValue >= d.pixelValue);

    if (largerNeighbours.length < 1) return;
    const largestNeighbour = largerNeighbours.sort((a, b) => {
      if (a.pixelValue === b.pixelValue) return a.index - b.index;

      return a.pixelValue - b.pixelValue;
    })[0];

    d.uphill = largestNeighbour.index;
  });
  stPixels.forEach((pixel) => {
    if (pixel.isHill) return;
    let upHillIndex = pixel.uphill;
    let nextUpHillPixel = stPixels.get(upHillIndex)!;
    let upHillIsTop = nextUpHillPixel.uphill === -1;
    let iter = 0;
    const visited = new Set<number>();

    visited.add(pixel.index);
    visited.add(upHillIndex);
    while (true) {
      upHillIndex = nextUpHillPixel.uphill;
      if (upHillIndex === -1) break;
      nextUpHillPixel = stPixels.get(upHillIndex)!;
      if (visited.has(nextUpHillPixel.uphill)) break;
      visited.add(nextUpHillPixel.index);
    }
    pixel.uphill = upHillIndex;
  });
  const seeds = Array.from(stPixels.values()).filter((p) => p.uphill !== -1);
  const [opWID, opHEI] = [rawFileData.width * 4, rawFileData.height * 4];
  const canvas = cvs.createCanvas(opWID, opHEI);
  const cx = canvas.getContext('2d');

  cx.fillStyle = 'white';
  cx.fillRect(0, 0, opWID, opHEI);
  stPixels.forEach((st) => {
    const validNeighbours = st.nbs.map((ni) => stPixels.get(ni)!).filter((nb) => nb !== undefined)!;

    cx.fillStyle = `hsl(${validNeighbours.length * (360 / 10)}, 100%, 50%)`;
    cx.fillRect(st.x * 4, st.y * 4, 3, 3);
  });
  const buf = canvas.toBuffer();

  fs.writeFile('op.png', buf);
};

tla();
