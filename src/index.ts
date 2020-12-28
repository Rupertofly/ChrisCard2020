import * as h from '@rupertofly/h';
import * as osn from 'open-simplex-noise';
import { createCanvas } from 'canvas';
import type {CanvasRenderingContext2D } from 'canvas'
import { extent, polygonCentroid, randomUniform, range, scalePow, Delaunay, scaleLinear, scaleSqrt, hcl } from 'd3';
import * as fs from 'fs/promises';
import { offsetPolygon, setupModule } from './resize';
const { PI, floor, ceil, round,pow } = Math;
const TAU = PI * 2;
function drawCircle(cv: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  cv.beginPath();
  cv.ellipse(cx, cy, radius, radius, 0, 0, TAU)
  cv.closePath();
}
const nsR = osn.makeNoise2D(Math.random()/100);
const nsH = osn.makeNoise2D(Math.random()/100);
const nsC = osn.makeNoise2D(Math.random()/100);
const nsL = osn.makeNoise2D(Math.random()/100);
const rScale = scaleLinear([2, 8 ]).domain([-1, 1]);
const hScale = scaleLinear([-10, 10]).domain([-1, 1]);
const cScale = scaleLinear([40, 80]).domain([-1, 1]);
const lScale = scaleLinear([50, 80]).domain([-1, 1]);


async function main() {
  console.log(`Start`);
  const [WID, HEI] = [ceil(4.13 * 300), ceil(5.83 * 300)]
  const hueTravel = scaleLinear([0,270]).domain([0,pow(WID,2)+pow(HEI,2)])
  const rx = randomUniform(0, WID-1);
  const ry = randomUniform(0, HEI-1);
  const cvs = createCanvas(WID, HEI);
  const cx = cvs.getContext('2d');

  const pts = range((WID / 15) * (HEI / 15)).map(() => [floor(rx()), floor(ry())] as [number, number])
  range(16).map(() => {
    const dg = Delaunay.from(pts).voronoi([0,0,WID,HEI]).cellPolygons()
    for (let pgon of dg) {
      const [x, y] = polygonCentroid([...pgon] as [number,number][]);
      pts[pgon.index] = [x,y]
    }
  })
  for (let [x, y] of pts) {
    const r = (nsR(x / 200, y / 200))
    const h = nsH(x / 100, y / 100);
    const c = nsC(x / 10, y / 10);
    const l = nsL(x /10, y/10 );
    cx.fillStyle = hcl(hueTravel(pow(x, 2) + pow(y, 2))+hScale(h), cScale(c), lScale(l)).toString();
    drawCircle(cx, x, y, rScale(r));
    cx.fill()
  }
  console.log('Saving')
  const buf = cvs.toBuffer();
  console.log('Writing');
  fs.writeFile('output.png', buf);
}
main();
