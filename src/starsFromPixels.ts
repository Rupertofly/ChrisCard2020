import { log } from 'console';
import { getTopPixel } from './getTopPixel';
import Pixel from './Pixel';

export function starsFromPixels(pixels: Pixel[]) {
  const [WID, HEI] = pixels[0].size;

  pixels.forEach((pxl) =>
    pxl.getUpHillPixel(pxl.nbs.map((pi) => ({ ...pi, pixel: pixels[pi.pixel] })))
  );
  const nonZero = pixels.filter((px) => px.pixelValue > 10);

  nonZero.map((pxl) => {
    let pxlIndex = getTopPixel(pxl, pixels);

    if (pxlIndex === pxl.index) pxlIndex = -1;
    pxl.uphillIndex = pxlIndex;
  });
  const starTipsMap = new Map<number, number>(
    nonZero.filter((pxl) => pxl.uphillIndex === -1).map((pxl) => [pxl.index, pxl.pixelValue])
  );

  nonZero.forEach((pxl) => {
    if (pxl.uphillIndex === -1) return;
    starTipsMap.set(pxl.uphillIndex, starTipsMap.get(pxl.uphillIndex)! + pxl.pixelValue);
  });

  return starTipsMap;
}
