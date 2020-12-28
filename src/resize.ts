import {
  ClipperLibWrapper,
  EndType,
  JoinType,
  loadNativeClipperLibInstanceAsync,
  NativeClipperLibRequestedFormat,
  OffsetInput,
  Path,
} from 'js-angusj-clipper';

export let module: ClipperLibWrapper;
const MULT = 1000;

function toCLPath(loop: Loop) {
  return loop.map((pt) => ({ x: Math.round(pt[0] * MULT), y: Math.round(pt[1] * MULT) })) as Path;
}
function fromCLPath(path: Path) {
  return path.map((intp) => [intp.x / MULT, intp.y / MULT]) as Loop;
}
export async function setupModule() {
  module = await loadNativeClipperLibInstanceAsync(NativeClipperLibRequestedFormat.AsmJsOnly);

  return module;
}
export function offsetPolygon(loop: Loop, distance: number, simplifyDist = 0, mdl = module) {
  return offsetPolygons(loop, distance, simplifyDist, mdl)[0];
}
export function offsetPolygons(
  loop: Loop,
  distance: number,
  simplifyDist: number,
  mdl = module
): Loop[] {
  if (!mdl) {
    setupModule();
    throw new Error(`module not initialised before function`);
  }
  const ofPath: OffsetInput = {
    data: [toCLPath(loop)],
    endType: EndType.ClosedPolygon,
    joinType: JoinType.Square,
  };
  const op = mdl.offsetToPaths({
    delta: distance * MULT,
    cleanDistance: simplifyDist * MULT,
    offsetInputs: [ofPath],
  });

  return op.map(fromCLPath);
}
