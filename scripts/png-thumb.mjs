// Dependency-free PNG downscaler (box filter) for gallery thumbnails.
//
// Supports 8-bit RGB / RGBA, non-interlaced PNG (which is what the upstream screenshots
// are). Anything else returns null and the caller falls back to the original file.

import zlib from 'node:zlib';

const crc32 = zlib.crc32 ?? (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

function decode(buf) {
  if (buf.length < 33 || !buf.subarray(0, 8).equals(SIGNATURE)) return null;
  let pos = 8, hdr = null;
  const idat = [];
  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') hdr = { w: data.readUInt32BE(0), h: data.readUInt32BE(4), depth: data[8], color: data[9], interlace: data[12] };
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (!hdr || hdr.depth !== 8 || hdr.interlace !== 0 || (hdr.color !== 2 && hdr.color !== 6)) return null;
  const bpp = hdr.color === 6 ? 4 : 3;
  const stride = hdr.w * bpp;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  if (raw.length < (stride + 1) * hdr.h) return null;
  const px = Buffer.alloc(stride * hdr.h);
  for (let y = 0; y < hdr.h; y++) {
    const f = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    const up = dst - stride;
    if (f === 0) raw.copy(px, dst, src, src + stride);
    else if (f === 1) {
      for (let x = 0; x < stride; x++) px[dst + x] = raw[src + x] + (x >= bpp ? px[dst + x - bpp] : 0);
    } else if (f === 2) {
      for (let x = 0; x < stride; x++) px[dst + x] = raw[src + x] + (y > 0 ? px[up + x] : 0);
    } else if (f === 3) {
      for (let x = 0; x < stride; x++) px[dst + x] = raw[src + x] + (((x >= bpp ? px[dst + x - bpp] : 0) + (y > 0 ? px[up + x] : 0)) >> 1);
    } else if (f === 4) {
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? px[dst + x - bpp] : 0;
        const b = y > 0 ? px[up + x] : 0;
        const c = x >= bpp && y > 0 ? px[up + x - bpp] : 0;
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        px[dst + x] = raw[src + x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
    } else return null;
  }
  return { ...hdr, bpp, px };
}

function resize(img, tw, th) {
  const { w, h, bpp, px } = img;
  const out = Buffer.alloc(tw * th * bpp);
  const acc = new Uint32Array(tw * bpp);
  const xs = new Uint32Array(tw + 1);
  for (let ox = 0; ox <= tw; ox++) xs[ox] = Math.floor((ox * w) / tw);
  for (let oy = 0; oy < th; oy++) {
    const y0 = Math.floor((oy * h) / th);
    const y1 = Math.max(y0 + 1, Math.floor(((oy + 1) * h) / th));
    acc.fill(0);
    for (let y = y0; y < y1; y++) {
      const row = y * w * bpp;
      for (let ox = 0; ox < tw; ox++) {
        const x0 = xs[ox], x1 = Math.max(x0 + 1, xs[ox + 1]);
        for (let x = x0; x < x1; x++) {
          const i = row + x * bpp;
          const o = ox * bpp;
          acc[o] += px[i]; acc[o + 1] += px[i + 1]; acc[o + 2] += px[i + 2];
          if (bpp === 4) acc[o + 3] += px[i + 3];
        }
      }
    }
    for (let ox = 0; ox < tw; ox++) {
      const n = (y1 - y0) * (Math.max(xs[ox] + 1, xs[ox + 1]) - xs[ox]);
      for (let c = 0; c < bpp; c++) out[(oy * tw + ox) * bpp + c] = Math.round(acc[ox * bpp + c] / n);
    }
  }
  return out;
}

function encode(px, w, h, bpp) {
  const stride = w * bpp;
  const out = Buffer.alloc((stride + 1) * h);
  const tmp = [0, 1, 2, 3].map(() => Buffer.alloc(stride));
  const FILTERS = [0, 1, 2, 4];
  for (let y = 0; y < h; y++) {
    const cur = y * stride, up = cur - stride;
    const score = [0, 0, 0, 0];
    for (let x = 0; x < stride; x++) {
      const v = px[cur + x];
      const a = x >= bpp ? px[cur + x - bpp] : 0;
      const b = y > 0 ? px[up + x] : 0;
      const c = x >= bpp && y > 0 ? px[up + x - bpp] : 0;
      const p = a + b - c;
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const paeth = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      const r0 = v, r1 = (v - a) & 255, r2 = (v - b) & 255, r4 = (v - paeth) & 255;
      tmp[0][x] = r0; tmp[1][x] = r1; tmp[2][x] = r2; tmp[3][x] = r4;
      score[0] += r0 < 128 ? r0 : 256 - r0;
      score[1] += r1 < 128 ? r1 : 256 - r1;
      score[2] += r2 < 128 ? r2 : 256 - r2;
      score[3] += r4 < 128 ? r4 : 256 - r4;
    }
    let k = 0;
    for (let i = 1; i < 4; i++) if (score[i] < score[k]) k = i;
    out[y * (stride + 1)] = FILTERS[k];
    tmp[k].copy(out, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = bpp === 4 ? 6 : 2;
  return Buffer.concat([SIGNATURE, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(out, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/** Downscale a PNG to at most `maxWidth` wide. Returns { data, width, height } or null. */
export function thumbnail(buf, maxWidth = 640) {
  let img;
  try { img = decode(buf); } catch { return null; }
  if (!img) return null;
  const tw = Math.min(img.w, maxWidth);
  const th = Math.max(1, Math.round((img.h * tw) / img.w));
  if (tw === img.w) return null; // already small enough: use the original
  return { data: encode(resize(img, tw, th), tw, th, img.bpp), width: tw, height: th };
}
