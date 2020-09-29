import { createCanvas } from 'canvas';
import * as h from '@rupertofly/h';
import {
  extent,
  forceX,
  interpolateInferno,
  polygonCentroid,
  randomUniform,
  range,
  scaleLog,
  scalePow,
  voronoi,
  xml,
} from 'd3';
import * as fs from 'fs/promises';
import {
  loadNativeClipperLibInstanceAsync,
  NativeClipperLibRequestedFormat,
} from 'js-angusj-clipper';
import { getTopPixel } from './getTopPixel';
import { imageToPixels } from './ImageToPixels';
import { starsFromPixels } from './starsFromPixels';

async function main() {
  console.log(`Start`);
  const pixels = await imageToPixels();
  const [WID, HEI] = pixels[0].size;
  const cvs = createCanvas(WID * 12, HEI * 12);
  const cx = cvs.getContext('2d');
  const op = pixels[50].nbs.map((i) => i);

  cx.fillStyle = 'white';
  cx.fillRect(0, 0, WID * 12, HEI * 12);
  cx.fillStyle = 'grey';
  const stars = starsFromPixels(pixels);

  const [MIN, MAX] = extent([...stars.values()]);
  const sc = scalePow().domain([MIN, MAX]).range([0, 1]).exponent(0.2);

  const pts: [number, number][] = [];
  const rnd = randomUniform(-0.5, 0.5);

  stars.forEach((val, star) => {
    const stPx = pixels[star];
    const { x, y } = stPx;

    range(sc(val) * 50).forEach(() => {
      pts.push([x + rnd(), y + rnd()]);
    });
  });
  const vr = voronoi().size([WID, HEI]);
  let dgram = vr.polygons(pts);

  range(8).forEach(() => {
    dgram.map((pg, i) => {
      pts[i] = polygonCentroid(pg);
    });
    dgram = vr.polygons(pts);
  });
  cx.lineWidth = 5;
  dgram.map((pg) => {
    range(12).forEach(() => {
      const scaledPg = pg.map(
        (v) => [v[0] * 12 + 20 * rnd(), v[1] * 12 + 20 * rnd()] as [number, number]
      );

      cx.strokeStyle = 'rgba(0,0,0,0.1)';
      const newloop = [...h.spline(scaledPg, Math.min(8, scaledPg.length - 2), true, 300)];

      cx.beginPath();
      h.drawLoop(newloop, true, cx);
      cx.stroke();
    });
  });
  const buf = cvs.toBuffer();

  fs.writeFile('output.png', buf);
}
main();
