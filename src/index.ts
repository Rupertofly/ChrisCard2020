import { createCanvas } from 'canvas';
import { forceX, range } from 'd3';
import * as fs from 'fs/promises';
import {
  loadNativeClipperLibInstanceAsync,
  NativeClipperLibRequestedFormat,
} from 'js-angusj-clipper';
import { imageToPixels } from './ImageToPixels';

async function main() {
  console.log(`Start`);
  const pixels = await imageToPixels();
  const [WID, HEI] = pixels[0].size;
  const cvs = createCanvas(WID * 6, HEI * 6);
  const cx = cvs.getContext('2d');
  const op = pixels[50].nbs.map((i) => i);

  cx.fillStyle = 'white';
  cx.fillRect(0, 0, WID * 6, HEI * 6);
  cx.fillStyle = 'grey';
  pixels
    .filter((pxl) => pxl.pixelValue > 1)
    .forEach((pxl) => pxl.getUpHillPixel(pxl.nbs.map((pi) => pixels[pi])));

  const nonZero = pixels.filter((px) => px.pixelValue > 1 && px.uphillIndex !== -1);

  nonZero.forEach((px) => {
    const { x, y } = px;

    cx.fillRect(x * 6, y * 6, 5, 5);
  });
  cx.fillStyle = 'black';
  range(100).forEach(() =>
    pixels.forEach((pxl) => {
      if (pxl.uphillIndex === -1) return pxl;
      const upHillPixel = nonZero.find((uh) => uh.index === pxl.uphillIndex);

      if (!upHillPixel) {
        pxl.uphillIndex = -1;

        return pxl;
      }
      if (upHillPixel.uphillIndex === -1) return pxl;
      pxl.uphillIndex = upHillPixel.uphillIndex;

      return pxl;
    })
  );
  const allUphills = [...new Set(pixels.map((px) => px.uphillIndex))]
    .filter((i) => i > 0)
    .map((i) => pixels[i]);

  allUphills.forEach((pxl) => {
    const { x, y } = pxl;

    cx.fillRect(x * 6, y * 6, 5, 5);
  });
  const valuedPixels = pixels.filter((px) => px.uphillIndex === -1 && px.pixelValue > 1);

  cx.fillStyle = 'red';
  valuedPixels.forEach((pxl) => {
    const { x, y } = pxl;

    cx.fillRect(1 + x * 6, 1 + y * 6, 3, 3);
  });
  const buf = cvs.toBuffer();

  fs.writeFile('output.png', buf);
}
main();
