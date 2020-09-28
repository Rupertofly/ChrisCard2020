import { extent, quantile } from 'd3';
import * as fs from 'fs/promises';
import { PNG } from 'pngjs';
import Pixel from './Pixel';
export async function imageToPixels() {
  console.time(`image Processing`);
  const data = await fs.readFile('nightSkyProcessed.png');
  const decode = PNG.sync.read(data);
  const pixels: Pixel[] = [];
  const size = [decode.width, decode.height] as [number, number];

  for (let bufI = 0; bufI < decode.data.length; bufI += 4) {
    const i = bufI / 4;
    const value = decode.data.readUInt8(bufI);

    pixels.push(new Pixel(i, value, size));
  }
  console.timeEnd(`image Processing`);

  return pixels;
}
export default imageToPixels;
