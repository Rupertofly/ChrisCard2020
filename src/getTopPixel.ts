import Pixel from './Pixel';
export function getTopPixel(thisPx: Pixel, pxlArr: Pixel[], visited: number[] = []): number {
  if (visited.some((ix) => ix === thisPx.index)) return thisPx.index;
  visited.push(thisPx.index);
  if (thisPx.uphillIndex === -1) return thisPx.index;

  return getTopPixel(pxlArr[thisPx.uphillIndex], pxlArr, visited);
}
