import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  fitWithin,
  toGray,
  meanBrightness,
  laplacianVariance,
  qualityWarning,
} from "../../lib/image-quality.ts";

const W = 64;
const H = 64;
const flat = (v) => new Uint8Array(W * H).fill(v);
// Alternating columns: maximal sharp edges.
const striped = () => {
  const g = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y * W + x] = x % 2 ? 255 : 0;
  return g;
};

describe("fitWithin", () => {
  test("never upscales", () => {
    assert.deepEqual(fitWithin(1000, 800, 2200), { width: 1000, height: 800, scaled: false });
  });
  test("scales the longest edge down, keeping aspect", () => {
    assert.deepEqual(fitWithin(4400, 3300, 2200), { width: 2200, height: 1650, scaled: true });
    assert.deepEqual(fitWithin(3000, 6000, 2200), { width: 1100, height: 2200, scaled: true });
  });
});

describe("pixel helpers", () => {
  test("toGray weights channels", () => {
    assert.deepEqual([...toGray(new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255]))], [255, 0]);
  });
  test("meanBrightness", () => {
    assert.equal(meanBrightness(flat(100)), 100);
  });
  test("laplacianVariance: flat is 0, edges are high", () => {
    assert.equal(laplacianVariance(flat(128), W, H), 0);
    assert.ok(laplacianVariance(striped(), W, H) > 1000);
  });
});

describe("qualityWarning", () => {
  test("flags dark, blurry, passes sharp bright", () => {
    assert.match(qualityWarning(flat(20), W, H), /dark/);
    assert.match(qualityWarning(flat(200), W, H), /blurry/);
    assert.equal(qualityWarning(striped(), W, H), null);
  });
});
