// Builds a tiny but valid .pptx in memory (own zip writer, node:zlib only) for the pptx-extract tests.
import zlib from 'node:zlib';

export function writeZip(files) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const [name, data] of files) {
    const nameBuf = Buffer.from(name, 'utf8');
    const raw = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    const comp = zlib.deflateRawSync(raw);
    const crc = zlib.crc32(raw) >>> 0;
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0x21, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(raw.length, 22); lh.writeUInt16LE(nameBuf.length, 26);
    parts.push(lh, nameBuf, comp);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0x21, 14); ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(raw.length, 24); ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt32LE(offset, 42);
    central.push(ch, nameBuf);
    offset += 30 + nameBuf.length + comp.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cd, end]);
}

// 2x2 PNG, built from scratch.
export function tinyPng() {
  const crcTable = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(2, 0); ihdr.writeUInt32BE(2, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.from([0, 255, 0, 0, 0, 255, 0]); // filter 0 + 2 RGB pixels (6 bytes) -> 7
  const rows = Buffer.concat([Buffer.from([0, 255, 0, 0, 0, 255, 0]), Buffer.from([0, 0, 0, 255, 255, 255, 255])]);
  void row;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}

export const THEME = {
  colors: { dk1: '111111', lt1: 'FFFFFF', dk2: '1F2A44', lt2: 'EEF1F6', accent1: 'E4572E', accent2: '17BEBB', accent3: 'FFC914', accent4: '76B041', accent5: '6A4C93', accent6: '2E86AB', hlink: '0563C1', folHlink: '954F72' },
  major: 'Georgia', minor: 'Calibri', ea: 'Microsoft YaHei',
};

const NS = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const rels = (items) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items.map(([id, type, target]) => `<Relationship Id="${id}" Type="${REL}/${type}" Target="${target}"/>`).join('')}</Relationships>`;
const EMU = 12700; // 1pt; 13.33in wide slide = 12192000 EMU. 1px on the 1920 canvas = 6350 EMU.

const sp = (id, name, x, y, w, h, { fill, ph, text } = {}) => `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr/><p:nvPr>${ph ? `<p:ph type="${ph}"/>` : ''}</p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x * 6350}" y="${y * 6350}"/><a:ext cx="${w * 6350}" cy="${h * 6350}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>${fill ? `<a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>` : '<a:noFill/>'}</p:spPr>${text ? `<p:txBody><a:bodyPr/><a:lstStyle/>${text}</p:txBody>` : ''}</p:sp>`;
const run = (t, { sz, b, color, latin, ea } = {}) => `<a:r><a:rPr lang="en-US"${sz ? ` sz="${sz}"` : ''}${b ? ' b="1"' : ''}>${color ? `<a:solidFill><a:srgbClr val="${color}"/></a:solidFill>` : ''}${latin ? `<a:latin typeface="${latin}"/>` : ''}${ea ? `<a:ea typeface="${ea}"/>` : ''}</a:rPr><a:t>${t}</a:t></a:r>`;
const slide = (shapes) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld ${NS}><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>${shapes}</p:spTree></p:cSld></p:sld>`;
const pic = (id, x, y, w, h) => `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="Logo" descr="logo"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId2"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${x * 6350}" y="${y * 6350}"/><a:ext cx="${w * 6350}" cy="${h * 6350}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;

/** Geometry used by the tests (canvas px): the title is at (120, 80) size 1200x160, 44pt = 88px. */
export const EXPECT = {
  title: { x: 120, y: 80, w: 1200, h: 160, sizePx: 88 },
  bar: { x: 0, y: 0, w: 40, h: 1080, fill: 'E4572E' },
  picture: { x: 1500, y: 700, w: 300, h: 200 },
  cjk: '中文标题：增长与复盘',
};

export function buildPptx({ truncateSlide2 = false } = {}) {
  return writeZip(buildPptxFiles({ truncateSlide2 }));
}
function buildPptxFiles({ truncateSlide2 = false } = {}) {
  const s1 = slide(
    sp(2, 'Title 1', 120, 80, 1200, 160, { ph: 'title', text: `<a:p>${run('Quarterly Review', { sz: 4400, b: true, color: 'E4572E', latin: 'Georgia' })}</a:p>` })
    + sp(3, 'Accent bar', 0, 0, 40, 1080, { fill: 'E4572E' })
    + pic(4, 1500, 700, 300, 200));
  const s2 = slide(
    sp(2, 'Heading', 120, 80, 1200, 160, { text: `<a:p>${run('中文标题：增长与复盘', { sz: 3600, ea: 'Microsoft YaHei', latin: 'Calibri' })}</a:p>` })
    + sp(3, 'Body', 120, 300, 1600, 500, { text: `<a:p>${run('Revenue grew 24%', { sz: 2000 })}</a:p><a:p>${run('利润率提升', { sz: 2000, ea: 'Microsoft YaHei' })}</a:p>` }));
  const s3 = slide(sp(2, 'Closing', 120, 400, 1680, 200, { text: `<a:p>${run('Thank you', { sz: 6000, color: '1F2A44' })}</a:p>` }));
  const s2out = truncateSlide2 ? s2.slice(0, Math.floor(s2.length * 0.6)) : s2;
  const files = [
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/></Types>`],
    ['_rels/.rels', rels([['rId1', 'officeDocument', 'ppt/presentation.xml']])],
    ['ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation ${NS}><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst><p:sldId id="256" r:id="rId2"/><p:sldId id="257" r:id="rId3"/><p:sldId id="258" r:id="rId4"/></p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`],
    ['ppt/_rels/presentation.xml.rels', rels([['rId1', 'slideMaster', 'slideMasters/slideMaster1.xml'], ['rId2', 'slide', 'slides/slide1.xml'], ['rId3', 'slide', 'slides/slide2.xml'], ['rId4', 'slide', 'slides/slide3.xml'], ['rId5', 'theme', 'theme/theme1.xml']])],
    ['ppt/slideMasters/slideMaster1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster ${NS}><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="EEF1F6"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`],
    ['ppt/slideMasters/_rels/slideMaster1.xml.rels', rels([['rId1', 'slideLayout', '../slideLayouts/slideLayout1.xml'], ['rId2', 'theme', '../theme/theme1.xml']])],
    ['ppt/slideLayouts/slideLayout1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout ${NS} type="title"><p:cSld name="Title Slide"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld></p:sldLayout>`],
    ['ppt/slideLayouts/_rels/slideLayout1.xml.rels', rels([['rId1', 'slideMaster', '../slideMasters/slideMaster1.xml']])],
    ['ppt/theme/theme1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Fixture"><a:themeElements><a:clrScheme name="Fixture">${Object.entries(THEME.colors).map(([k, v]) => (k === 'dk1' || k === 'lt1' ? `<a:${k}><a:srgbClr val="${v}"/></a:${k}>` : `<a:${k}><a:srgbClr val="${v}"/></a:${k}>`)).join('')}</a:clrScheme><a:fontScheme name="Fixture"><a:majorFont><a:latin typeface="${THEME.major}"/><a:ea typeface="${THEME.ea}"/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="${THEME.minor}"/><a:ea typeface="${THEME.ea}"/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Fixture"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`],
    ['ppt/slides/slide1.xml', s1],
    ['ppt/slides/_rels/slide1.xml.rels', rels([['rId1', 'slideLayout', '../slideLayouts/slideLayout1.xml'], ['rId2', 'image', '../media/image1.png']])],
    ['ppt/slides/slide2.xml', s2out],
    ['ppt/slides/_rels/slide2.xml.rels', rels([['rId1', 'slideLayout', '../slideLayouts/slideLayout1.xml']])],
    ['ppt/slides/slide3.xml', s3],
    ['ppt/slides/_rels/slide3.xml.rels', rels([['rId1', 'slideLayout', '../slideLayouts/slideLayout1.xml']])],
    ['ppt/media/image1.png', tinyPng()],
  ];
  return files;
}
void EMU;

// ---------------------------------------------------------------------------
// A second deck ("rich") exercising what the newer extractor reports. Expected values are in RICH.
// ---------------------------------------------------------------------------
const px = (n) => n * 6350;
const clr = (hex, alpha) => `<a:srgbClr val="${hex}">${alpha === undefined ? '' : `<a:alpha val="${alpha}"/>`}</a:srgbClr>`;
/** A shape with full control over spPr children and the optional <p:style>. */
function rawSp(id, name, x, y, w, h, { prst = 'rect', gd = '', fill = '<a:noFill/>', ln = '', effect = '', style = '', text = '' } = {}) {
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${px(x)}" y="${px(y)}"/><a:ext cx="${px(w)}" cy="${px(h)}"/></a:xfrm><a:prstGeom prst="${prst}"><a:avLst>${gd}</a:avLst></a:prstGeom>${fill}${ln}${effect}</p:spPr>${style}${text ? `<p:txBody><a:bodyPr/><a:lstStyle/>${text}</p:txBody>` : ''}</p:sp>`;
}
const solid = (hex, alpha) => `<a:solidFill>${clr(hex, alpha)}</a:solidFill>`;
const styleRef = ({ ln = 0, fill = 0, effect = 0 } = {}) => `<p:style><a:lnRef idx="${ln}"><a:srgbClr val="2E86AB"/></a:lnRef><a:fillRef idx="${fill}"><a:srgbClr val="2E86AB"/></a:fillRef><a:effectRef idx="${effect}"><a:srgbClr val="000000"/></a:effectRef><a:fontRef idx="minor"/></p:style>`;
const bgImage = '<p:bg><p:bgPr><a:blipFill><a:blip r:embed="rId2"/><a:stretch><a:fillRect/></a:stretch></a:blipFill><a:effectLst/></p:bgPr></p:bg>';
const bgSolid = (hex) => `<p:bg><p:bgPr>${solid(hex)}<a:effectLst/></p:bgPr></p:bg>`;
const slideBg = (bg, shapes) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld ${NS}><p:cSld>${bg}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>${shapes}</p:spTree></p:cSld></p:sld>`;
const para = (...runs) => `<a:p>${runs.join('')}</a:p>`;

/** Brand fonts the font map must know (name -> expected open replacement). */
export const BRAND_FONTS = {
  'HarmonyOS Sans SC': 'Noto Sans SC',
  'Alibaba PuHuiTi 3.0': 'Noto Sans SC',
  OPPOSans: 'Noto Sans SC',
  MiSans: 'Noto Sans SC',
  'vivo Sans': 'Noto Sans SC',
  'Smiley Sans': 'Noto Sans SC',
  '方正兰亭黑_GBK': 'Noto Sans SC',
  '方正小标宋简体': 'Noto Serif SC',
  '方正楷体简体': 'Noto Serif SC',
  '思源黑体 CN': 'Noto Sans SC',
  '思源宋体 CN': 'Noto Serif SC',
};

export const RICH = {
  slide1: { bg: 'ppt/media/image1.png', over: { x: 100, y: 100, w: 800, h: 300, fill: '000000', alpha: 0.5 } },
  // slide 2: white background
  slide2: {
    backdrop: 'FFFFFF',
    translucent: { fill: 'E4572E', alpha: 0.4 },
    textAlpha: { color: '1F2A44', alpha: 0.6 },
    lnRefWidthPx: 4, // theme line style 2 = 25400 EMU
    shadow: { blur: 10, dist: 6, angle: 45, color: '000000', alpha: 0.4 },
    themeShadow: { blur: 8, dist: 4, angle: 90 }, // theme effect style 2
    reflection: { blur: 4, dist: 2 },
    roundRect: { w: 400, h: 200, adj: 25000, radius: 50 },
    roundRectDefaultRadius: 33.3, // 16667 / 100000 * 200
  },
  runs: { bold: true, color: '17BEBB', size: 40 },
};

const emu = (px_) => px_ * 6350;
export function buildRichPptx() {
  const s1 = slideBg(bgImage,
    rawSp(2, 'Scrim', 100, 100, 800, 300, { fill: solid('000000', 50000) }));
  const s2 = slideBg(bgSolid('FFFFFF'),
    rawSp(2, 'Glass', 100, 100, 500, 200, { fill: solid('E4572E', 40000) })
    + rawSp(3, 'Quote', 100, 350, 900, 120, { text: para(`<a:r><a:rPr lang="en-US" sz="2400">${solid('1F2A44', 60000)}</a:rPr><a:t>Muted caption</a:t></a:r>`) })
    + rawSp(4, 'Outlined', 100, 520, 400, 120, { fill: solid('FFFFFF'), style: styleRef({ ln: 2 }) })
    + rawSp(5, 'Shadowed', 700, 100, 400, 200, { fill: solid('FFFFFF'), effect: `<a:effectLst><a:outerShdw blurRad="${emu(10)}" dist="${emu(6)}" dir="2700000" algn="tl" rotWithShape="0">${clr('000000', 40000)}</a:outerShdw></a:effectLst>` })
    + rawSp(6, 'Themed shadow', 700, 350, 400, 200, { fill: solid('FFFFFF'), style: styleRef({ effect: 2 }) })
    + rawSp(7, 'Mirror', 700, 600, 400, 200, { fill: solid('FFFFFF'), effect: `<a:effectLst><a:reflection blurRad="${emu(4)}" stA="50000" endA="0" dist="${emu(2)}" dir="5400000" sy="-100000" algn="bl" rotWithShape="0"/></a:effectLst>` })
    + rawSp(8, 'Rounded', 1200, 100, 400, 200, { prst: 'roundRect', gd: '<a:gd name="adj" fmla="val 25000"/>', fill: solid('76B041') })
    + rawSp(9, 'Rounded default', 1200, 350, 400, 200, { prst: 'roundRect', fill: solid('76B041') })
    + rawSp(10, 'Pill', 1200, 600, 400, 200, { prst: 'roundRect', gd: '<a:gd name="adj" fmla="val 90000"/>', fill: solid('76B041') }));
  const s3 = slideBg(bgSolid('FFFFFF'),
    rawSp(2, 'Emphasis', 120, 100, 1600, 160, { text: para(run('Bold teal ', { sz: 4000, b: true, color: '17BEBB' }), run('plain dark', { sz: 4000, color: '111111' })) })
    + Object.keys(BRAND_FONTS).map((f, i) => rawSp(20 + i, `Brand ${i}`, 120, 300 + i * 60, 1600, 50, { text: para(run('品牌字体 Sample', { sz: 2000, ea: f, latin: f })) })).join(''));
  const theme = (fmt) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Rich"><a:themeElements><a:clrScheme name="Rich">${Object.entries(THEME.colors).map(([k, v]) => `<a:${k}><a:srgbClr val="${v}"/></a:${k}>`).join('')}</a:clrScheme><a:fontScheme name="Rich"><a:majorFont><a:latin typeface="${THEME.major}"/><a:ea typeface="${THEME.ea}"/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="${THEME.minor}"/><a:ea typeface="${THEME.ea}"/><a:cs typeface=""/></a:minorFont></a:fontScheme>${fmt}</a:themeElements></a:theme>`;
  const fmt = `<a:fmtScheme name="Rich"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="25400"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="dash"/></a:ln><a:ln w="38100"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="${emu(8)}" dist="${emu(4)}" dir="5400000" algn="t" rotWithShape="0">${clr('000000', 30000)}</a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>`;
  const base = buildPptxFiles();
  const files = base.map(([n, d]) => {
    if (n === 'ppt/theme/theme1.xml') return [n, theme(fmt)];
    if (n === 'ppt/slides/slide1.xml') return [n, s1];
    if (n === 'ppt/slides/slide2.xml') return [n, s2];
    if (n === 'ppt/slides/slide3.xml') return [n, s3];
    if (n === 'ppt/slides/_rels/slide2.xml.rels' || n === 'ppt/slides/_rels/slide3.xml.rels') return [n, d];
    return [n, d];
  });
  return writeZip(files);
}
